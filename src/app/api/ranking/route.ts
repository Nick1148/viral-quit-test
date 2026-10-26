import { NextResponse } from 'next/server';
import { getRanking } from '@/lib/stats';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getRanking();
    return NextResponse.json(data, {
      // 매 요청마다 전체 행을 집계하지 않도록 CDN 에서 1분 캐시
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('Ranking API error:', error);
    return NextResponse.json({ error: '랭킹을 불러오지 못했습니다.' }, { status: 500 });
  }
}

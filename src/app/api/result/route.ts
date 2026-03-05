import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_name, score, title_type, answers } = body;

    if (typeof score !== 'number' || !company_name || !title_type) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const { data, error } = await getSupabase()
      .from('results')
      .insert({ company_name, score, title_type, answers })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id 파라미터가 필요합니다.' }, { status: 400 });
    }

    const { data: result, error } = await getSupabase()
      .from('results')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !result) {
      return NextResponse.json({ error: '결과를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 해당 회사 통계 조회
    const { data: companyResults } = await getSupabase()
      .from('results')
      .select('score')
      .eq('company_name', result.company_name);

    let companyAvg: number | null = null;
    let participantCount = 0;
    let rankPercent: number | null = null;

    if (companyResults && companyResults.length > 0) {
      participantCount = companyResults.length;
      const totalScore = companyResults.reduce((sum: number, r: { score: number }) => sum + r.score, 0);
      companyAvg = Math.round(totalScore / participantCount);

      const higherCount = companyResults.filter((r: { score: number }) => r.score > result.score).length;
      rankPercent = Math.round(((higherCount + 1) / participantCount) * 100);
    }

    return NextResponse.json({
      result,
      stats: {
        companyAvg,
        participantCount,
        rankPercent,
      },
    });
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

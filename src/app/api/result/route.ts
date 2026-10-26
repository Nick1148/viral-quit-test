import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { calculateScore } from '@/lib/questions';
import { getResultType } from '@/lib/results';
import { getResultWithStats } from '@/lib/stats';
import { normalizeCompanyName, parseAnswers, COMPANY_NAME_MAX } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const companyName = normalizeCompanyName(body.company_name);
  if (!companyName) {
    return NextResponse.json(
      { error: `회사명을 1~${COMPANY_NAME_MAX}자로 입력해주세요.` },
      { status: 400 },
    );
  }

  const answers = parseAnswers(body.answers);
  if (!answers) {
    return NextResponse.json({ error: '답변이 올바르지 않습니다.' }, { status: 400 });
  }

  // 점수와 결과 유형은 클라이언트 값을 믿지 않고 서버에서 다시 계산한다.
  const score = calculateScore(answers);
  const titleType = getResultType(score).title;

  try {
    const { data, error } = await getSupabase()
      .from('results')
      .insert({ company_name: companyName, score, title_type: titleType, answers })
      .select('id')
      .single();

    if (error || !data?.id) {
      console.error('Result insert error:', error);
      return NextResponse.json({ error: '결과 저장 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ id: data.id, score });
  } catch (error) {
    console.error('Result API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id 파라미터가 필요합니다.' }, { status: 400 });
  }

  try {
    const data = await getResultWithStats(id);
    if (!data) {
      return NextResponse.json({ error: '결과를 찾을 수 없습니다.' }, { status: 404 });
    }
    // 회사명·답안은 공개 응답에 넣지 않는다.
    return NextResponse.json({
      result: {
        id: data.result.id,
        score: data.result.score,
        title_type: data.result.title_type,
        created_at: data.result.created_at,
      },
      stats: data.stats,
    });
  } catch (error) {
    console.error('Result API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

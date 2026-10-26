import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSupabase } from '@/lib/supabase';
import {
  hashReasonStyle,
  getStylePrompt,
  fillName,
  isResignReason,
  isResignStyle,
  NAME_PLACEHOLDER,
  ResignStyle,
} from '@/lib/claude';
import { getNextKstMidnight } from '@/lib/kst';
import { normalizeText, AUTHOR_NAME_MAX } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const isMockMode = !process.env.GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY === 'your_gemini_api_key';

// 인스턴스 메모리 기반 제한이라 서버리스 인스턴스마다 따로 센다. 정확한 제한이 필요하면 Redis/DB 로 옮겨야 한다.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const DAILY_LIMIT = 5;
const GEMINI_TIMEOUT_MS = 20_000;

function getClientIp(request: NextRequest): string {
  // Vercel 이 채워주는 request.ip / x-real-ip 를 우선한다 (x-forwarded-for 앞부분은 클라이언트가 조작 가능)
  const ip = (request as NextRequest & { ip?: string }).ip;
  if (ip) return ip;
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

// "하루"는 한국 시간 자정 기준으로 초기화한다.
function checkRateLimit(ip: string, now = Date.now()): boolean {
  // 만료된 항목 정리 (메모리 누수 방지)
  if (rateLimitMap.size > 10_000) {
    rateLimitMap.forEach((v, k) => {
      if (now >= v.resetAt) rateLimitMap.delete(k);
    });
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: getNextKstMidnight(now) });
    return true;
  }

  if (entry.count >= DAILY_LIMIT) return false;

  entry.count++;
  return true;
}

// Mock 사직서 생성 (API 키 없이 테스트용)
function generateMockLetter(style: ResignStyle, reason: string): string {
  const n = NAME_PLACEHOLDER;
  const mockLetters: Record<ResignStyle, string> = {
    poetic: `가을바람이 사무실 창문을 두드리던 날,
${n}은(는) 깨달았습니다.

이 책상 위의 모니터가 아닌,
저 창밖의 하늘이 제 진짜 일터라는 것을.

"${reason}"이라는 이유가
마치 떨어지는 낙엽처럼 자연스러웠던 것은,
이미 오래전부터 마음의 계절이 바뀌고 있었기 때문입니다.

이제 ${n}은(는) 새로운 봄을 찾아 떠납니다.
함께한 시간들은 서리 내린 아침의 풍경처럼
오래도록 기억에 남을 것입니다.

바람이 부는 쪽으로, ${n} 올림.`,

    rapper: `Yo, Check it

[Verse 1]
매일 아침 9 to 6 반복되는 루틴
${reason}, 더는 못 참겠어 이 feeling
${n} 여기서 마이크 잡고 선언해
이 회사와의 인연 여기서 끊어내

[Hook]
나는 떠난다 (떠난다!)
사직서 던지고 (던지고!)
새로운 무대로 (무대로!)
${n}의 시대로!

[Verse 2]
감사했어 동료들 함께한 시간
근데 솔직히 말할게 연봉은 좀 짠
이제 내 가치 알아주는 곳으로 가
Peace out ${n} 퇴장이야

[Outro]
감사했고, 미안했고, 사랑했다
그리고... 나는 간다!`,

    joseon: `신하 ${n} 엎드려 아뢰옵니다.

소신이 이 조정에 발을 들인 지 어언 세월이 흘렀사옵니다.
그간 상감마마(대표님)의 은혜가 산보다 높고 바다보다 깊사옵나,
"${reason}"의 사유로 더 이상 조정에 머무르기 어려운 형편이옵니다.

밤낮으로 고민하였사오나,
소신의 재주가 미천하여 이 자리를 감당하기 벅차옵고,
새로운 봉직의 길을 찾아 나서고자 하옵니다.

함께 조정에서 국사를 논하던 동료 신하들에게
깊은 감사의 뜻을 전하옵니다.

삼가 글월을 올리옵니다.

신하 ${n} 백배사죄 올림`,

    mz: `안녕하세요 ${n}입니다 ㅎㅎ

음... 할 말이 있는데요
저 퇴사하려고요 ㅋㅋㅋ (진지)

이유는요... ${reason}
레알 이거 참다참다 더 못 참겠어서요 ㅠㅠ

솔직히 요즘 출근할 때마다
"아 ㅋㅋ 오늘도 여기 와야 하나" 이 생각밖에 안 들더라고요

동료분들은 진짜 좋았어요 (찐임)
근데 회사는... 음... 네... ㅎ

암튼 그동안 감사했고요
다들 건강하세요~ 저는 이만...

이만 총총...`,

    essay: `첫 출근날이 아직도 생생합니다.

떨리는 마음으로 사원증을 받아들고, 새 자리에 앉았던 그 날.
모니터를 켜며 "잘 해보자"고 다짐했던 저를 기억합니다.

그 뒤로 수많은 야근과 회의, 프로젝트가 지나갔습니다.
웃을 때도, 울고 싶을 때도 있었습니다.
함께 고생한 동료들과 새벽에 나눈 컵라면의 맛은
어떤 미슐랭 레스토랑보다 깊었습니다.

하지만 어느 순간 깨달았습니다.
${reason}... 이것이 더 이상 외면할 수 없는 진실이라는 것을.

${n}은(는) 이제 새로운 페이지를 펼치려 합니다.
이곳에서 배운 모든 것을 가슴에 품고,
더 나은 내일을 향해 걸어가겠습니다.

감사했습니다. 진심으로.

${n} 드림`,
  };

  return mockLetters[style] || mockLetters.mz;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const { reason, style } = body ?? {};
  if (!isResignReason(reason) || !isResignStyle(style)) {
    return NextResponse.json({ error: '사유와 스타일을 목록에서 선택해주세요.' }, { status: 400 });
  }

  const name = normalizeText(body.name).replace(/[{}]/g, '');
  if (name.length > AUTHOR_NAME_MAX) {
    return NextResponse.json({ error: `이름은 ${AUTHOR_NAME_MAX}자 이하로 입력해주세요.` }, { status: 400 });
  }

  // Rate limit check
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: `하루 생성 횟수(${DAILY_LIMIT}회)를 초과했습니다. 내일(자정 이후) 다시 시도해주세요.` },
      { status: 429 },
    );
  }

  try {
    // Cache lookup — 같은 키가 여러 행이어도 깨지지 않도록 maybeSingle 대신 limit(1)
    const hash = hashReasonStyle(reason, style);
    const { data: cachedRows } = await getSupabase()
      .from('resign_letters')
      .select('content')
      .eq('reason_hash', hash)
      .eq('style', style)
      .limit(1);

    const cached = Array.isArray(cachedRows) ? cachedRows[0] : null;
    if (cached?.content) {
      return NextResponse.json({ letter: fillName(cached.content, name) });
    }

    let template: string;

    if (isMockMode) {
      template = generateMockLetter(style, reason);
    } else {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }, { timeout: GEMINI_TIMEOUT_MS });
      const result = await model.generateContent(getStylePrompt(style, reason));
      template = result.response.text().trim();
    }

    if (!template) {
      return NextResponse.json({ error: '사직서 생성에 실패했습니다. 다시 시도해주세요.' }, { status: 502 });
    }

    // Save to cache (실패해도 응답은 정상 반환)
    const { error: insertError } = await getSupabase().from('resign_letters').insert({
      reason_hash: hash,
      style,
      content: template,
    });
    if (insertError) console.error('Resign cache insert error:', insertError);

    return NextResponse.json({ letter: fillName(template, name) });
  } catch (error) {
    console.error('Resign API error:', error);
    return NextResponse.json(
      { error: '사직서 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 },
    );
  }
}

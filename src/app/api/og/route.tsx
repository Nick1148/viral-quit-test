import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { getResultType } from '@/lib/results';
import { clampScore } from '@/lib/validation';
import { getDisplayHost, SITE_NAME } from '@/lib/site';

export const runtime = 'edge';

// 기본 폰트에는 한글 글리프가 없어 □ 로 깨진다. 필요한 글자만 Google Fonts 에서 받아 쓴다.
async function loadKoreanFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@900&text=${encodeURIComponent(text)}`,
    );
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  // 제목·이모지는 쿼리로 받지 않고 점수에서 계산한다 (임의 문구가 담긴 이미지를 만들 수 없도록)
  const score = clampScore(searchParams.get('score'));
  const resultType = score === null ? null : getResultType(score);

  const headline = score === null ? '내 퇴사확률은?' : `퇴사확률 ${score}%`;
  const title = resultType?.title ?? '10개 질문으로 알아보는 퇴사확률 테스트';
  const emoji = resultType?.emoji ?? '🏢';
  const footer = `${SITE_NAME} | ${getDisplayHost()}`;

  const scoreColor =
    score === null
      ? '#c4b5fd'
      : score >= 76
      ? '#ef4444'
      : score >= 56
      ? '#f97316'
      : score >= 36
      ? '#eab308'
      : '#22c55e';

  const fontData = await loadKoreanFont(`${headline}${title}${footer}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          fontFamily: fontData ? 'NotoSansKR' : 'sans-serif',
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 16, display: 'flex' }}>{emoji}</div>

        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: scoreColor,
            display: 'flex',
            alignItems: 'baseline',
          }}
        >
          <span>{headline}</span>
        </div>

        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: '#e2e8f0',
            marginTop: 12,
            display: 'flex',
          }}
        >
          {title}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={{ fontSize: 24, color: '#94a3b8', display: 'flex' }}>{footer}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontData ? [{ name: 'NotoSansKR', data: fontData, weight: 900, style: 'normal' }] : undefined,
      headers: {
        // 점수별 이미지는 내용이 고정이므로 길게 캐시
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
      },
    },
  );
}

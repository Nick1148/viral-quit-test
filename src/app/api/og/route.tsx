import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const score = searchParams.get('score') ?? '??';
  const title = searchParams.get('title') ?? '퇴사확률 테스트';
  const emoji = searchParams.get('emoji') ?? '🏢';

  const scoreNum = Number(score);
  const scoreColor =
    scoreNum >= 76
      ? '#ef4444'
      : scoreNum >= 56
      ? '#f97316'
      : scoreNum >= 36
      ? '#eab308'
      : '#22c55e';

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
          fontFamily: 'sans-serif',
        }}
      >
        {/* Emoji */}
        <div style={{ fontSize: 120, marginBottom: 16, display: 'flex' }}>{emoji}</div>

        {/* Score */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: scoreColor,
            display: 'flex',
            alignItems: 'baseline',
          }}
        >
          <span>퇴사확률 {score}%</span>
        </div>

        {/* Title */}
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

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: '#94a3b8',
              display: 'flex',
            }}
          >
            퇴사연구소 | resignation-lab.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

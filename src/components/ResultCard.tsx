import { getDisplayHost } from '@/lib/site';

interface ResultCardProps {
  score: number;
  title: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  companyAvg: number | null;
  participantCount: number;
  rank: string | null;
}

// 결과 카드는 공유 링크로 누구나 볼 수 있으므로 회사명은 표시하지 않는다
// (테스트 화면에서 "결과에 회사명이 노출되지 않습니다"라고 안내하고 있음).
export default function ResultCard({
  score,
  title,
  emoji,
  color,
  bgColor,
  description,
  companyAvg,
  participantCount,
  rank,
}: ResultCardProps) {
  return (
    <section
      id="result-card"
      aria-labelledby="result-title"
      className="w-full max-w-lg mx-auto rounded-2xl shadow-xl overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <div className="p-6 sm:p-8 text-center">
        <h1 id="result-title">
          <span className="block text-sm text-gray-600 mb-1">당신의 퇴사확률은</span>
          <span className="block text-6xl sm:text-7xl font-black mb-2" style={{ color }}>
            {score}%
          </span>
          <span className="block text-4xl mb-2" aria-hidden="true">{emoji}</span>
          <span className="block text-xl sm:text-2xl font-bold mb-3" style={{ color }}>
            {title}
          </span>
        </h1>
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6 break-keep">
          {description}
        </p>

        {(companyAvg !== null || rank) && (
          <dl className="bg-white/60 rounded-xl p-4 text-left space-y-2">
            {companyAvg !== null && (
              <div className="flex justify-between gap-4 text-sm">
                <dt className="text-gray-600">우리 회사 평균 ({participantCount.toLocaleString('ko-KR')}명)</dt>
                <dd className="font-bold" style={{ color }}>
                  {companyAvg}%
                </dd>
              </div>
            )}
            {rank && (
              <div className="flex justify-between gap-4 text-sm">
                <dt className="text-gray-600">회사 내 순위</dt>
                <dd className="font-bold text-gray-900">{rank}</dd>
              </div>
            )}
          </dl>
        )}
      </div>

      <div className="text-center pb-4 text-xs text-gray-500">{getDisplayHost()}</div>
    </section>
  );
}

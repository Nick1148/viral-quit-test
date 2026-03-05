interface ResultCardProps {
  score: number;
  title: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  companyName: string;
  companyAvg: number | null;
  rank: string | null;
}

export default function ResultCard({
  score,
  title,
  emoji,
  color,
  bgColor,
  description,
  companyName,
  companyAvg,
  rank,
}: ResultCardProps) {
  return (
    <div
      id="result-card"
      className="w-full max-w-lg mx-auto rounded-2xl shadow-xl overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <div className="p-6 sm:p-8 text-center">
        <p className="text-sm text-gray-500 mb-1">당신의 퇴사확률은</p>
        <p className="text-6xl sm:text-7xl font-extrabold mb-2" style={{ color }}>
          {score}%
        </p>
        <p className="text-4xl mb-2">{emoji}</p>
        <h2 className="text-xl sm:text-2xl font-bold mb-3" style={{ color }}>
          {title}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
          {description}
        </p>

        {(companyName || companyAvg !== null || rank) && (
          <div className="bg-white/60 rounded-xl p-4 text-left space-y-2">
            {companyName && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">소속 회사</span>
                <span className="font-medium text-gray-800">{companyName}</span>
              </div>
            )}
            {companyAvg !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">우리 회사 평균</span>
                <span className="font-medium" style={{ color }}>
                  {companyAvg}%
                </span>
              </div>
            )}
            {rank && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">전체 순위</span>
                <span className="font-medium text-gray-800">{rank}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center pb-4 text-xs text-gray-400">
        resignation-lab.vercel.app
      </div>
    </div>
  );
}

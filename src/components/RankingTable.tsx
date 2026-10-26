import type { RankingRow } from '@/lib/stats';

interface RankingTableProps {
  data: RankingRow[];
}

const MEDALS = ['🥇', '🥈', '🥉'];

// 결과 유형 구간(36/56/76)과 같은 기준으로 색을 맞춘다
function scoreClass(score: number): string {
  if (score >= 76) return 'text-red-700';
  if (score >= 56) return 'text-orange-700';
  if (score >= 36) return 'text-yellow-700';
  return 'text-green-700';
}

export default function RankingTable({ data }: RankingTableProps) {
  if (!data.length) {
    return (
      <div className="text-center text-gray-300 py-10 text-sm px-4 break-keep">
        아직 랭킹 데이터가 없습니다. 테스트에 참여해 첫 기록을 남겨보세요!
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="overflow-x-auto max-h-[32rem] overflow-y-auto" tabIndex={0} aria-label="회사별 퇴사확률 랭킹 표">
        <table className="w-full text-sm">
          <caption className="sr-only">평균 퇴사확률이 높은 순서의 회사 랭킹</caption>
          <thead className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <tr>
              <th scope="col" className="py-3 px-3 text-left font-medium whitespace-nowrap">순위</th>
              <th scope="col" className="py-3 px-3 text-left font-medium">회사명</th>
              <th scope="col" className="py-3 px-3 text-center font-medium whitespace-nowrap">참여자</th>
              <th scope="col" className="py-3 px-3 text-right font-medium whitespace-nowrap">평균 퇴사확률</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.company_name}
                className={`border-b border-gray-100 ${
                  i < 3 ? 'bg-yellow-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="py-3 px-3 font-bold text-gray-700">
                  {i < 3 ? (
                    <span className="text-lg" role="img" aria-label={`${i + 1}위`}>
                      {MEDALS[i]}
                    </span>
                  ) : (
                    i + 1
                  )}
                </td>
                <td className="py-3 px-3 font-medium text-gray-900 break-all">{row.company_name}</td>
                <td className="py-3 px-3 text-center text-gray-600 whitespace-nowrap">
                  {row.participant_count.toLocaleString('ko-KR')}명
                </td>
                <td className="py-3 px-3 text-right font-bold whitespace-nowrap">
                  <span className={scoreClass(row.avg_score)}>{row.avg_score}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

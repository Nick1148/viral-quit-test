interface RankingData {
  company_name: string;
  participant_count: number;
  avg_score: number;
}

interface RankingTableProps {
  data: RankingData[];
}

export default function RankingTable({ data }: RankingTableProps) {
  if (!data.length) {
    return (
      <div className="text-center text-gray-400 py-10 text-sm">
        아직 랭킹 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto overflow-hidden rounded-2xl shadow-lg">
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <tr>
              <th className="py-3 px-3 text-left font-medium">#</th>
              <th className="py-3 px-3 text-left font-medium">회사명</th>
              <th className="py-3 px-3 text-center font-medium">참여자</th>
              <th className="py-3 px-3 text-right font-medium">평균 퇴사확률</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.company_name}
                className={`border-b border-gray-100 ${
                  i < 3 ? 'bg-yellow-50/50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="py-3 px-3 font-bold text-gray-600">
                  {i < 3 ? (
                    <span className="text-lg">
                      {i === 0 ? '\uD83E\uDD47' : i === 1 ? '\uD83E\uDD48' : '\uD83E\uDD49'}
                    </span>
                  ) : (
                    i + 1
                  )}
                </td>
                <td className="py-3 px-3 font-medium text-gray-800">{row.company_name}</td>
                <td className="py-3 px-3 text-center text-gray-500">{row.participant_count}명</td>
                <td className="py-3 px-3 text-right font-bold">
                  <span
                    className={
                      row.avg_score >= 70
                        ? 'text-red-500'
                        : row.avg_score >= 40
                        ? 'text-orange-500'
                        : 'text-green-500'
                    }
                  >
                    {row.avg_score}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

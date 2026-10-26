import type { Metadata } from 'next';
import Link from 'next/link';
import RankingTable from '@/components/RankingTable';
import { getRanking, MIN_COMPANY_PARTICIPANTS, type RankingData } from '@/lib/stats';

// 서버에서 렌더링해 검색엔진이 랭킹 내용을 읽을 수 있게 하고, 1분 단위로 다시 집계한다.
export const revalidate = 60;

export const metadata: Metadata = {
  title: '회사별 퇴사확률 랭킹',
  description: '어떤 회사의 직원들이 가장 퇴사하고 싶어할까? 참여자 투표로 집계한 회사별 평균 퇴사확률 순위.',
  alternates: { canonical: '/ranking' },
  openGraph: {
    title: '회사별 퇴사확률 랭킹 | 퇴사연구소',
    description: '어떤 회사의 직원들이 가장 퇴사하고 싶어할까?',
    url: '/ranking',
  },
};

async function loadRanking(): Promise<RankingData | null> {
  try {
    return await getRanking();
  } catch (error) {
    console.error('Ranking page error:', error);
    return null;
  }
}

export default async function RankingPage() {
  const data = await loadRanking();

  return (
    <main className="min-h-svh bg-gradient-to-b from-gray-950 via-purple-950 to-indigo-950 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <Link href="/" className="text-sm text-gray-300 hover:text-white transition-colors">
            &larr; 홈으로
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-4 mb-2 break-keep">회사별 퇴사확률 랭킹</h1>
          <p className="text-gray-300 break-keep">어떤 회사의 직원들이 가장 퇴사하고 싶어할까?</p>
        </div>

        {data && (
          <dl className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-white/5 backdrop-blur rounded-xl p-5 text-center border border-white/10">
              <dd className="text-2xl sm:text-3xl font-bold text-purple-300">
                {data.totalParticipants.toLocaleString('ko-KR')}
              </dd>
              <dt className="text-sm text-gray-300 mt-1">전체 참여자</dt>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-5 text-center border border-white/10">
              <dd className="text-2xl sm:text-3xl font-bold text-indigo-300">
                {data.totalCompanies.toLocaleString('ko-KR')}
              </dd>
              <dt className="text-sm text-gray-300 mt-1">등록된 회사</dt>
            </div>
          </dl>
        )}

        <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden">
          {data ? (
            <RankingTable data={data.ranking} />
          ) : (
            <div role="alert" className="text-center py-16 text-gray-300">
              데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          참여자 {MIN_COMPANY_PARTICIPANTS}명 이상인 회사만 표시됩니다 · 1분마다 갱신
        </p>

        <div className="text-center mt-12">
          <Link
            href="/test"
            className="inline-block px-8 py-3 text-lg font-bold rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_50px_rgba(139,92,246,0.7)] transition-all duration-300 hover:scale-105"
          >
            퇴사확률 테스트하기
          </Link>
        </div>
      </div>
    </main>
  );
}

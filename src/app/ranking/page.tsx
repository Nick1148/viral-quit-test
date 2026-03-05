'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import RankingTable from '@/components/RankingTable';

interface CompanyStats {
  company_name: string;
  participant_count: number;
  avg_score: number;
}

interface RankingData {
  ranking: CompanyStats[];
  totalParticipants: number;
  totalCompanies: number;
}

export default function RankingPage() {
  const [data, setData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ranking')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950 to-indigo-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
            &larr; 홈으로
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mt-4 mb-2">
            회사별 퇴사확률 랭킹
          </h1>
          <p className="text-gray-400">
            어떤 회사의 직원들이 가장 퇴사하고 싶어할까?
          </p>
        </div>

        {/* Stats */}
        {data && (
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-white/5 backdrop-blur rounded-xl p-5 text-center border border-white/10">
              <p className="text-2xl sm:text-3xl font-bold text-purple-400">
                {data.totalParticipants.toLocaleString()}
              </p>
              <p className="text-sm text-gray-400 mt-1">전체 참여자</p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-5 text-center border border-white/10">
              <p className="text-2xl sm:text-3xl font-bold text-indigo-400">
                {data.totalCompanies.toLocaleString()}
              </p>
              <p className="text-sm text-gray-400 mt-1">등록된 회사</p>
            </div>
          </div>
        )}

        {/* Ranking Table */}
        <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <div className="inline-block w-8 h-8 border-2 border-gray-600 border-t-purple-400 rounded-full animate-spin mb-4" />
              <p>랭킹 불러오는 중...</p>
            </div>
          ) : data ? (
            <RankingTable data={data.ranking} />
          ) : (
            <div className="text-center py-16 text-gray-400">
              데이터를 불러올 수 없습니다.
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          참여자 3명 이상인 회사만 표시됩니다
        </p>

        {/* CTA */}
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

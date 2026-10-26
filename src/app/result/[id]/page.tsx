import { cache } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getResultType } from '@/lib/results';
import { getResultWithStats } from '@/lib/stats';
import ResultCard from '@/components/ResultCard';
import ShareButtons from '@/components/ShareButtons';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

// generateMetadata 와 페이지 본문이 같은 요청 안에서 DB 를 두 번 조회하지 않도록 캐시
const getResult = cache(async (id: string) => {
  try {
    return await getResultWithStats(id);
  } catch (error) {
    console.error('Result page error:', error);
    return null;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getResult(params.id);

  if (!data) {
    return { title: '결과를 찾을 수 없습니다', robots: { index: false } };
  }

  const resultType = getResultType(data.result.score);
  const title = `내 퇴사확률 ${data.result.score}% - ${resultType.title}`;
  const description = resultType.description;
  const image = {
    url: `/api/og?score=${data.result.score}`,
    width: 1200,
    height: 630,
    alt: title,
  };

  return {
    title,
    description,
    // 개인 결과 페이지는 공유용이므로 검색 색인에서 제외
    robots: { index: false, follow: true },
    alternates: { canonical: `/result/${data.result.id}` },
    openGraph: {
      title,
      description,
      url: `/result/${data.result.id}`,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
  };
}

export default async function ResultPage({ params }: Props) {
  const data = await getResult(params.id);
  if (!data) notFound();

  const { result, stats } = data;
  const resultType = getResultType(result.score);
  const rankLabel = stats.rankPercent !== null ? `상위 ${stats.rankPercent}%` : null;

  return (
    <main className="min-h-svh bg-gray-950 py-10 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <ResultCard
          score={result.score}
          title={resultType.title}
          emoji={resultType.emoji}
          color={resultType.color}
          bgColor={resultType.bgColor}
          description={resultType.description}
          companyAvg={stats.companyAvg}
          participantCount={stats.participantCount}
          rank={rankLabel}
        />

        <ShareButtons resultId={result.id} score={result.score} title={resultType.title} />

        <nav aria-label="다음 행동" className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <Link
            href="/test"
            className="flex-1 text-center px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition"
          >
            다시 하기
          </Link>
          <Link
            href="/resign"
            className="flex-1 text-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:brightness-110 transition"
          >
            AI 사직서 써보기
          </Link>
        </nav>
        <p className="text-center">
          <Link href="/ranking" className="text-sm text-gray-300 underline underline-offset-4 hover:text-white">
            회사별 퇴사확률 랭킹 보기
          </Link>
        </p>
      </div>
    </main>
  );
}

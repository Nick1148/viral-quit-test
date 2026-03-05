import { Metadata } from 'next';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
import { getResultType } from '@/lib/results';
import ResultCard from '@/components/ResultCard';
import ShareButtons from '@/components/ShareButtons';

interface Props {
  params: Promise<{ id: string }>;
}

async function getResult(id: string) {
  const { data: result, error } = await getSupabase()
    .from('results')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !result) return null;

  const { data: companyResults } = await getSupabase()
    .from('results')
    .select('score')
    .eq('company_name', result.company_name);

  let companyAvg: number | null = null;
  let rankPercent: number | null = null;

  if (companyResults && companyResults.length > 0) {
    const totalScore = companyResults.reduce((sum: number, r: { score: number }) => sum + r.score, 0);
    companyAvg = Math.round(totalScore / companyResults.length);

    const higherCount = companyResults.filter((r: { score: number }) => r.score > result.score).length;
    rankPercent = Math.round(((higherCount + 1) / companyResults.length) * 100);
  }

  return { result, companyAvg, rankPercent };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getResult(id);

  if (!data) {
    return { title: '퇴사확률 연구소' };
  }

  const resultType = getResultType(data.result.score);
  const title = `내 퇴사확률 ${data.result.score}% - ${resultType.title}`;
  const description = resultType.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        `/api/og?score=${data.result.score}&title=${encodeURIComponent(resultType.title)}&emoji=${encodeURIComponent(resultType.emoji)}`,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params;
  const data = await getResult(id);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">결과를 찾을 수 없습니다</h1>
          <Link
            href="/test"
            className="inline-block px-6 py-3 bg-indigo-600 rounded-xl font-medium hover:bg-indigo-500 transition"
          >
            테스트 하러 가기
          </Link>
        </div>
      </div>
    );
  }

  const resultType = getResultType(data.result.score);
  const rankLabel = data.rankPercent !== null ? `상위 ${data.rankPercent}%` : null;

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <ResultCard
          score={data.result.score}
          title={resultType.title}
          emoji={resultType.emoji}
          color={resultType.color}
          bgColor={resultType.bgColor}
          description={resultType.description}
          companyName={data.result.company_name}
          companyAvg={data.companyAvg}
          rank={rankLabel}
        />

        <ShareButtons
          resultId={id}
          score={data.result.score}
          title={resultType.title}
        />

        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
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
        </div>
      </div>
    </div>
  );
}

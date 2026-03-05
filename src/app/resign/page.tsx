import Link from 'next/link';
import ResignLetterForm from '@/components/ResignLetterForm';

export const metadata = {
  title: 'AI 사직서 생성기 - 퇴사연구소',
  description: '당신만의 특별한 사직서를 AI가 작성해드립니다',
};

export default function ResignPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950 to-indigo-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black mb-3 bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
            AI 사직서 생성기
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            당신만의 특별한 사직서를 AI가 작성해드립니다
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
          <ResignLetterForm />
        </div>

        {/* Footer link */}
        <div className="text-center mt-10">
          <Link
            href="/test"
            className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-sm hover:brightness-110 transition hover:scale-105"
          >
            퇴사확률 테스트하기
          </Link>
        </div>
      </div>
    </main>
  );
}

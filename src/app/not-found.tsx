import Link from 'next/link';

export const metadata = {
  title: '페이지를 찾을 수 없습니다',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="min-h-svh bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-2">결과를 찾을 수 없습니다</h1>
        <p className="text-gray-300 text-sm mb-6">링크가 잘못되었거나 삭제된 결과입니다.</p>
        <Link
          href="/test"
          className="inline-block px-6 py-3 bg-indigo-600 rounded-xl font-medium hover:bg-indigo-500 transition"
        >
          테스트 하러 가기
        </Link>
      </div>
    </main>
  );
}

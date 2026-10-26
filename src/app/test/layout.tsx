import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '퇴사확률 테스트',
  description: '10개의 질문으로 알아보는 나의 퇴사 확률. 1분이면 끝나는 직장인 심리 테스트.',
  alternates: { canonical: '/test' },
};

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return children;
}

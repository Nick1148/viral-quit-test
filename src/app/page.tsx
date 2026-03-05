import Link from "next/link";
import { HeroSection, FeatureCards } from "@/components/landing-animations";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950 to-indigo-950 text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <HeroSection />
        <Link
          href="/test"
          className="mt-10 px-10 py-4 text-lg font-bold rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_50px_rgba(139,92,246,0.7)] transition-all duration-300 hover:scale-105"
        >
          테스트 시작하기
        </Link>
      </section>

      {/* Features Section */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <FeatureCards />
      </section>
    </main>
  );
}

"use client";

import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl sm:text-7xl font-black tracking-tight"
      >
        퇴사연구소
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-6 text-xl sm:text-2xl text-purple-200 font-medium"
      >
        내 퇴사확률은 몇 %?
      </motion.p>
    </>
  );
}

const features = [
  {
    title: "퇴사확률 계산기",
    description: "10개 질문으로 알아보는 나의 퇴사 가능성",
    icon: "📊",
  },
  {
    title: "AI 사직서 생성기",
    description: "AI가 작성하는 완벽한 사직서",
    icon: "📝",
  },
  {
    title: "회사별 랭킹",
    description: "우리 회사 퇴사확률 순위는?",
    icon: "🏆",
  },
];

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {features.map((feature, i) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.15 }}
          className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 text-center hover:bg-white/10 transition-colors"
        >
          <div className="text-4xl mb-4">{feature.icon}</div>
          <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
          <p className="text-gray-400 text-sm">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  );
}

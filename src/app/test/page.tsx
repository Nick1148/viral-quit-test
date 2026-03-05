'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionCard from '@/components/QuestionCard';
import ProgressBar from '@/components/ProgressBar';
import { questions, calculateScore } from '@/lib/questions';
import { getResultType } from '@/lib/results';

type Stage = 'company' | 'questions' | 'loading' | 'done';

const loadingTexts = [
  '퇴사 DNA 해독 중...',
  '직장 생존률 분석 중...',
  '사직서 템플릿 준비 중...',
];

export default function TestPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('company');
  const [companyName, setCompanyName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (stage !== 'loading') return;

    const textInterval = setInterval(() => {
      setLoadingTextIndex((prev) => {
        if (prev < loadingTexts.length - 1) return prev + 1;
        return prev;
      });
    }, 1000);

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 50);

    const timer = setTimeout(async () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
      await submitResult();
    }, 3000);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const submitResult = async () => {
    const score = calculateScore(answers);
    const resultType = getResultType(score);

    try {
      const res = await fetch('/api/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName || '익명',
          score,
          title_type: resultType.title,
          answers,
        }),
      });

      const data = await res.json();
      setStage('done');
      router.push(`/result/${data.id}`);
    } catch {
      setStage('done');
      router.push(`/result/error`);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setStage('loading');
    }
  };

  const handleStart = () => {
    if (companyName.trim() === '') return;
    setStage('questions');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex flex-col">
      <AnimatePresence mode="wait">
        {stage === 'company' && (
          <motion.div
            key="company"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex items-center justify-center px-4"
          >
            <div className="w-full max-w-md">
              <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
                퇴사확률 연구소
              </h1>
              <p className="text-gray-400 text-center text-sm mb-8">
                10개의 질문으로 알아보는 나의 퇴사 확률
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  회사명을 입력해주세요
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                  placeholder="예: 삼성전자"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                />
                <p className="text-xs text-gray-500 mt-2">
                  * 통계 목적으로만 사용되며, 결과에 회사명이 노출되지 않습니다.
                </p>

                <button
                  onClick={handleStart}
                  disabled={companyName.trim() === ''}
                  className="w-full mt-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  시작하기
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <ProgressBar current={currentQuestion + 1} total={questions.length} />
            <div className="flex-1 flex items-center justify-center px-4 py-8">
              <QuestionCard
                question={questions[currentQuestion]}
                onAnswer={handleAnswer}
                questionNumber={currentQuestion + 1}
              />
            </div>
          </motion.div>
        )}

        {(stage === 'loading' || stage === 'done') && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center px-4"
          >
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              </div>

              <div className="w-64 mx-auto mb-4">
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${loadingProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingTextIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-gray-300 text-lg font-medium"
                >
                  {loadingTexts[loadingTextIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

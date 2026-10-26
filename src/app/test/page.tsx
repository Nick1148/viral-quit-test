'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import QuestionCard from '@/components/QuestionCard';
import ProgressBar from '@/components/ProgressBar';
import { questions } from '@/lib/questions';
import { COMPANY_NAME_MAX, normalizeText } from '@/lib/validation';

type Stage = 'company' | 'questions' | 'loading' | 'error';

const loadingTexts = [
  '퇴사 DNA 해독 중...',
  '직장 생존률 분석 중...',
  '사직서 템플릿 준비 중...',
];

const MIN_LOADING_MS = 3000;

export default function TestPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('company');
  const [companyName, setCompanyName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const submittingRef = useRef(false);

  const trimmedCompany = normalizeText(companyName);

  const submitResult = useCallback(async (finalAnswers: number[], company: string) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    const startedAt = Date.now();

    try {
      const res = await fetch('/api/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: company, answers: finalAnswers }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.id !== 'string') {
        throw new Error(data.error || '결과를 저장하지 못했습니다.');
      }

      // 분석 연출은 최소 3초 유지하되, 저장이 늦으면 그만큼만 기다린다
      const remaining = MIN_LOADING_MS - (Date.now() - startedAt);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
      router.push(`/result/${data.id}`);
    } catch (error) {
      submittingRef.current = false;
      setErrorMessage(error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.');
      setStage('error');
    }
  }, [router]);

  useEffect(() => {
    if (stage !== 'loading') return;
    setLoadingTextIndex(0);
    setLoadingProgress(0);

    const textInterval = setInterval(() => {
      setLoadingTextIndex((prev) => Math.min(prev + 1, loadingTexts.length - 1));
    }, 1000);

    const progressInterval = setInterval(() => {
      // 저장이 끝나기 전에는 95% 에서 멈춘다
      setLoadingProgress((prev) => Math.min(prev + 2, 95));
    }, 60);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, [stage]);

  const handleAnswer = (optionIndex: number) => {
    // 이전 질문으로 돌아가 답을 바꿔도 뒤쪽 답변은 유지한다
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStage('loading');
      void submitResult(newAnswers, trimmedCompany);
    }
  };

  const handleBack = () => {
    if (currentQuestion === 0) {
      setStage('company');
      return;
    }
    setCurrentQuestion(currentQuestion - 1);
  };

  const handleRetry = () => {
    setStage('loading');
    void submitResult(answers, trimmedCompany);
  };

  const handleStart = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!trimmedCompany) return;
    setStage('questions');
  };

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-svh bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex flex-col">
        <AnimatePresence mode="wait">
          {stage === 'company' && (
            <motion.div
              key="company"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex items-center justify-center px-4 py-10"
            >
              <div className="w-full max-w-md">
                <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
                  퇴사확률 연구소
                </h1>
                <p className="text-gray-300 text-center text-sm mb-8">
                  10개의 질문으로 알아보는 나의 퇴사 확률
                </p>

                <form onSubmit={handleStart} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8">
                  <label htmlFor="company-name" className="block text-sm font-medium text-gray-200 mb-2">
                    회사명을 입력해주세요
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    maxLength={COMPANY_NAME_MAX}
                    autoComplete="organization"
                    enterKeyHint="go"
                    aria-describedby="company-help"
                    placeholder="예: 삼성전자"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-base"
                  />
                  <p id="company-help" className="text-xs text-gray-400 mt-2">
                    * 회사별 통계에만 사용되며, 공유되는 결과 화면에는 회사명이 표시되지 않습니다.
                  </p>

                  <button
                    type="submit"
                    disabled={!trimmedCompany}
                    className="w-full mt-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-base"
                  >
                    시작하기
                  </button>
                </form>
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
              <h1 className="sr-only">퇴사확률 테스트 질문</h1>
              <ProgressBar current={currentQuestion + 1} total={questions.length} />
              <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                <QuestionCard
                  question={questions[currentQuestion]}
                  onAnswer={handleAnswer}
                  questionNumber={currentQuestion + 1}
                  selectedIndex={answers[currentQuestion]}
                />
                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-6 px-4 py-2 text-sm text-gray-300 hover:text-white underline underline-offset-4"
                >
                  {currentQuestion === 0 ? '← 회사명 다시 입력' : '← 이전 질문'}
                </button>
              </div>
            </motion.div>
          )}

          {stage === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex items-center justify-center px-4"
              role="status"
              aria-live="polite"
            >
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-6" aria-hidden="true">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin motion-reduce:animate-none" />
                </div>

                <div className="w-64 max-w-full mx-auto mb-4" aria-hidden="true">
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
                    className="text-gray-200 text-lg font-medium"
                  >
                    {loadingTexts[loadingTextIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {stage === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center px-4"
            >
              <div role="alert" className="w-full max-w-md text-center bg-white/10 rounded-2xl p-6 sm:p-8">
                <h1 className="text-xl font-bold text-white mb-2">결과를 저장하지 못했어요</h1>
                <p className="text-sm text-gray-300 mb-6 break-keep">{errorMessage} 답변은 그대로 남아 있으니 다시 시도해주세요.</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600"
                >
                  다시 시도
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Question } from '@/lib/questions';

interface QuestionCardProps {
  question: Question;
  onAnswer: (optionIndex: number) => void;
  questionNumber: number;
  // 이전 질문으로 돌아왔을 때 기존 선택 표시
  selectedIndex?: number;
}

export default function QuestionCard({ question, onAnswer, questionNumber, selectedIndex }: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 질문이 바뀌면 선택 상태를 초기화하고, 스크린리더/키보드 사용자를 위해 질문으로 포커스 이동
  useEffect(() => {
    setSelected(null);
    headingRef.current?.focus({ preventScroll: true });
  }, [question.id]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    timerRef.current = setTimeout(() => onAnswer(index), 300);
  };

  const active = selected ?? selectedIndex ?? null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-lg mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <p className="text-sm text-gray-500 mb-2">Q{questionNumber}</p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            id={`question-${question.id}`}
            className="text-lg sm:text-xl font-bold text-gray-800 mb-6 leading-relaxed break-keep focus:outline-none"
          >
            {question.text}
          </h2>

          <div role="group" aria-labelledby={`question-${question.id}`} className="flex flex-col gap-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(i)}
                aria-pressed={active === i}
                disabled={selected !== null && selected !== i}
                className={`w-full text-left px-4 py-3 min-h-[48px] rounded-xl border-2 transition-all duration-200 text-sm sm:text-base break-keep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                  ${
                    active === i
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-800 scale-[0.98]'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700'
                  }`}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

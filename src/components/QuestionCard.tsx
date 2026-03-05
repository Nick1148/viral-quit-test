'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Question } from '@/lib/questions';

interface QuestionCardProps {
  question: Question;
  onAnswer: (optionIndex: number) => void;
  questionNumber: number;
}

export default function QuestionCard({ question, onAnswer, questionNumber }: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    setTimeout(() => {
      setSelected(null);
      onAnswer(index);
    }, 300);
  };

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
          <p className="text-sm text-gray-400 mb-2">Q{questionNumber}</p>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6 leading-relaxed">
            {question.text}
          </h2>

          <div className="flex flex-col gap-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm sm:text-base
                  ${
                    selected === i
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 scale-[0.98]'
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

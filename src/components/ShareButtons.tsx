'use client';

import { useState } from 'react';
import { shareKakao, copyToClipboard, getShareUrl, saveAsImage } from '@/lib/share';

interface ShareButtonsProps {
  resultId: string;
  score: number;
  title: string;
}

export default function ShareButtons({ resultId, score, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleKakao = () => {
    shareKakao(resultId, score, title);
  };

  const handleCopy = async () => {
    const url = getShareUrl(resultId);
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveImage = () => {
    saveAsImage('result-card', `퇴사확률_${score}%.png`);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col sm:flex-row gap-3 mt-6">
      <button
        onClick={handleKakao}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FEE500] text-[#3C1E1E] font-medium text-sm hover:brightness-95 transition"
      >
        <span>카카오톡 공유</span>
      </button>
      <button
        onClick={handleCopy}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition"
      >
        <span>{copied ? '복사 완료!' : 'URL 복사'}</span>
      </button>
      <button
        onClick={handleSaveImage}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-100 text-indigo-700 font-medium text-sm hover:bg-indigo-200 transition"
      >
        <span>이미지 저장</span>
      </button>
    </div>
  );
}

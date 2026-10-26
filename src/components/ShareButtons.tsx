'use client';

import { useEffect, useRef, useState } from 'react';
import { shareKakao, shareNative, copyToClipboard, getShareUrl, saveAsImage } from '@/lib/share';

interface ShareButtonsProps {
  resultId: string;
  score: number;
  title: string;
}

export default function ShareButtons({ resultId, score, title }: ShareButtonsProps) {
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const flash = (text: string) => {
    setMessage(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(''), 2500);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(getShareUrl(resultId));
    flash(ok ? '링크를 복사했습니다.' : '복사에 실패했습니다. 주소창의 링크를 직접 복사해주세요.');
  };

  const handleKakao = async () => {
    if (shareKakao(resultId, score, title)) return;
    // 카카오 SDK 를 쓸 수 없으면 기기 공유 시트 → 링크 복사 순으로 대체
    const url = getShareUrl(resultId);
    if (await shareNative(url, `내 퇴사확률 ${score}% - ${title}`)) return;
    await handleCopy();
  };

  const handleSaveImage = async () => {
    if (saving) return;
    setSaving(true);
    const ok = await saveAsImage('result-card', `퇴사확률_${score}.png`);
    setSaving(false);
    if (!ok) flash('이미지 저장에 실패했습니다. 화면을 캡처해주세요.');
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleKakao}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FEE500] text-[#3C1E1E] font-medium text-sm hover:brightness-95 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          카카오톡 공유
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-800 font-medium text-sm hover:bg-gray-200 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          URL 복사
        </button>
        <button
          type="button"
          onClick={handleSaveImage}
          disabled={saving}
          aria-busy={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-100 text-indigo-800 font-medium text-sm hover:bg-indigo-200 transition disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {saving ? '저장 중...' : '이미지 저장'}
        </button>
      </div>
      <p role="status" aria-live="polite" className="min-h-[1.25rem] mt-2 text-center text-sm text-gray-300">
        {message}
      </p>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { RESIGN_REASONS, RESIGN_STYLES } from '@/lib/claude';
import { AUTHOR_NAME_MAX } from '@/lib/validation';
import { copyToClipboard } from '@/lib/share';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export default function ResignLetterForm() {
  const [name, setName] = useState('');
  const [reason, setReason] = useState<string>(RESIGN_REASONS[0]);
  const [style, setStyle] = useState<string>(RESIGN_STYLES[0].id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!result) return;
    if (prefersReducedMotion()) {
      setDisplayText(result);
      return;
    }
    // 타자 효과: 글자 수와 관계없이 약 3초 안에 끝나도록 한 번에 여러 글자씩 출력
    const step = Math.max(1, Math.ceil(result.length / 150));
    let idx = 0;
    setDisplayText('');
    intervalRef.current = setInterval(() => {
      idx = Math.min(result.length, idx + step);
      setDisplayText(result.slice(0, idx));
      if (idx >= result.length && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 20);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [result]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setResult('');
    setError('');
    setDisplayText('');
    setCopyMessage('');
    try {
      const res = await fetch('/api/resign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), reason, style }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && typeof data.letter === 'string' && data.letter) {
        setResult(data.letter);
      } else {
        setError(data.error || '사직서 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(result);
    setCopyMessage(ok ? '사직서를 복사했습니다.' : '복사에 실패했습니다. 직접 선택해 복사해주세요.');
  };

  const typing = displayText.length < result.length;

  return (
    <form onSubmit={handleGenerate} className="w-full max-w-lg mx-auto space-y-5">
      <div>
        <label htmlFor="resign-name" className="block text-sm font-medium text-gray-200 mb-1">
          이름 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <input
          id="resign-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={AUTHOR_NAME_MAX}
          autoComplete="name"
          placeholder="홍길동"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
        />
      </div>

      <div>
        <label htmlFor="resign-reason" className="block text-sm font-medium text-gray-200 mb-1">
          퇴사 사유
        </label>
        <select
          id="resign-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base bg-white text-gray-900"
        >
          {RESIGN_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-gray-200 mb-2">스타일</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {RESIGN_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyle(s.id)}
              aria-pressed={style === s.id}
              className={`px-3 py-2.5 rounded-xl border-2 text-left transition-all text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 ${
                style === s.id
                  ? 'border-indigo-400 bg-indigo-500/25 text-white'
                  : 'border-white/15 bg-white/5 text-gray-100 hover:border-white/30'
              }`}
            >
              <span className="text-lg" aria-hidden="true">{s.emoji}</span>
              <span className="block font-medium mt-1">{s.label}</span>
              <span className="block text-xs text-gray-300 break-keep">{s.description}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-base hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '사직서 생성 중...' : 'AI 사직서 생성하기'}
      </button>

      {error && (
        <p role="alert" className="rounded-xl bg-red-500/15 border border-red-400/40 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      )}

      {(result || loading) && (
        <section aria-busy={loading || typing} aria-labelledby="letter-title" className="bg-white rounded-2xl shadow-md p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 id="letter-title" className="font-bold text-gray-800">생성된 사직서</h2>
            {result && !typing && (
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-800 font-medium hover:bg-indigo-200"
              >
                복사하기
              </button>
            )}
          </div>
          {loading ? (
            <div role="status" className="flex items-center gap-2 text-gray-600 text-sm">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              AI가 사직서를 작성하고 있습니다...
            </div>
          ) : (
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-keep">
              {displayText}
              {typing && (
                <span className="inline-block w-0.5 h-4 bg-indigo-500 animate-pulse ml-0.5 align-text-bottom" aria-hidden="true" />
              )}
            </p>
          )}
          <p role="status" aria-live="polite" className="text-xs text-gray-600 mt-2 min-h-[1rem]">{copyMessage}</p>
        </section>
      )}
    </form>
  );
}

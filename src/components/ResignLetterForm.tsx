'use client';

import { useState, useEffect, useRef } from 'react';
import { RESIGN_REASONS, RESIGN_STYLES } from '@/lib/claude';

export default function ResignLetterForm() {
  const [name, setName] = useState('');
  const [reason, setReason] = useState<string>(RESIGN_REASONS[0]);
  const [style, setStyle] = useState<string>(RESIGN_STYLES[0].id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [displayText, setDisplayText] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!result) return;
    let idx = 0;
    setDisplayText('');
    intervalRef.current = setInterval(() => {
      idx++;
      setDisplayText(result.slice(0, idx));
      if (idx >= result.length && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 20);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [result]);

  const handleGenerate = async () => {
    setLoading(true);
    setResult('');
    setDisplayText('');
    try {
      const res = await fetch('/api/resign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, reason, style }),
      });
      const data = await res.json();
      if (data.letter) {
        setResult(data.letter);
      } else {
        setResult('사직서 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch {
      setResult('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">퇴사 사유</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm bg-white"
        >
          {RESIGN_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">스타일</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {RESIGN_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`px-3 py-2.5 rounded-xl border-2 text-left transition-all text-sm ${
                style === s.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-lg">{s.emoji}</span>
              <p className="font-medium text-gray-800 mt-1">{s.label}</p>
              <p className="text-xs text-gray-500">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-sm hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '사직서 생성 중...' : 'AI 사직서 생성하기'}
      </button>

      {(displayText || loading) && (
        <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6">
          <h3 className="font-bold text-gray-800 mb-3">생성된 사직서</h3>
          {loading && !displayText ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              AI가 사직서를 작성하고 있습니다...
            </div>
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {displayText}
              {displayText.length < result.length && (
                <span className="inline-block w-0.5 h-4 bg-indigo-500 animate-pulse ml-0.5 align-text-bottom" />
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

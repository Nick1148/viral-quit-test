// 한국 표준시(KST, UTC+9) 날짜 계산. 한국은 서머타임이 없어 고정 오프셋으로 충분하다.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// KST 기준 날짜 문자열 (YYYY-MM-DD). 서버 시간대(UTC 등)와 무관하다.
export function getKstDateKey(now: number = Date.now()): string {
  return new Date(now + KST_OFFSET_MS).toISOString().slice(0, 10);
}

// 다음 KST 자정의 epoch ms
export function getNextKstMidnight(now: number = Date.now()): number {
  const kstNow = now + KST_OFFSET_MS;
  return Math.floor(kstNow / DAY_MS) * DAY_MS + DAY_MS - KST_OFFSET_MS;
}

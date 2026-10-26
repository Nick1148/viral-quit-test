import { questions } from './questions';

export const COMPANY_NAME_MAX = 30;
export const AUTHOR_NAME_MAX = 20;

// 앞뒤 공백 제거 + 연속 공백 1칸 + 제어문자 제거
export function normalizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeCompanyName(value: unknown): string | null {
  const name = normalizeText(value);
  if (!name || name.length > COMPANY_NAME_MAX) return null;
  return name;
}

// 답안은 문항 수만큼의 정수 배열이고 각 값은 해당 문항 보기 범위 안이어야 한다.
export function parseAnswers(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length !== questions.length) return null;
  for (let i = 0; i < value.length; i++) {
    const v = value[i];
    if (!Number.isInteger(v) || v < 0 || v >= questions[i].options.length) return null;
  }
  return value as number[];
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

// OG 이미지 등 외부 파라미터로 받은 점수를 0~100 정수로 제한. 숫자가 아니면 null.
export function clampScore(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(100, Math.max(0, Math.round(n)));
}

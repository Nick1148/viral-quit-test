// 사이트 기본 주소. 배포 도메인이 바뀌면 NEXT_PUBLIC_BASE_URL 만 바꾸면 된다.
const DEFAULT_BASE_URL = 'https://viral-quit-test.vercel.app';

export function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  const base = raw && /^https?:\/\//.test(raw) ? raw : DEFAULT_BASE_URL;
  return base.replace(/\/+$/, '');
}

// 카드·이미지 하단에 표시할 도메인 (https:// 제외)
export function getDisplayHost(): string {
  return getBaseUrl().replace(/^https?:\/\//, '');
}

export const SITE_NAME = '퇴사연구소';
export const SITE_DESCRIPTION = '10개 질문으로 알아보는 직장인 퇴사확률 테스트와 AI 사직서 생성기, 회사별 퇴사확률 랭킹';

export const RESIGN_STYLES = [
  { id: 'poetic', label: '시적 (서정시인)', emoji: '🎭', description: '감성 폭발 서정시풍 사직서' },
  { id: 'rapper', label: '래퍼 (힙합)', emoji: '🎤', description: 'Verse/Hook 구조의 힙합 사직서' },
  { id: 'joseon', label: '조선왕조실록', emoji: '📜', description: '"신하 OOO 엎드려 아뢰옵니다"' },
  { id: 'mz', label: 'MZ세대', emoji: '🔥', description: '밈과 솔직함이 넘치는 사직서' },
  { id: 'essay', label: '감성에세이', emoji: '✍️', description: '첫 출근날부터 회고하는 에세이' },
] as const;

export type ResignStyle = (typeof RESIGN_STYLES)[number]['id'];

export const RESIGN_REASONS = [
  '연봉이 너무 적어서',
  '상사가 너무 힘들어서',
  '워라밸이 없어서',
  '성장이 멈춘 느낌이라서',
  '회사 분위기가 맞지 않아서',
  '더 좋은 기회가 생겨서',
  '번아웃이 와서',
  '출퇴근이 너무 힘들어서',
] as const;

export function isResignStyle(value: unknown): value is ResignStyle {
  return RESIGN_STYLES.some((s) => s.id === value);
}

export function isResignReason(value: unknown): value is (typeof RESIGN_REASONS)[number] {
  return (RESIGN_REASONS as readonly string[]).includes(value as string);
}

// 사직서는 사유+스타일 단위로 캐시되므로 실제 이름 대신 이 자리표시자로 생성·저장하고,
// 응답할 때 요청자의 이름으로 바꾼다. (다른 사람 이름이 들어간 사직서가 재사용되지 않도록)
export const NAME_PLACEHOLDER = '{{이름}}';

export function fillName(template: string, name: string): string {
  return template.split(NAME_PLACEHOLDER).join(name || 'OOO');
}

export function getStylePrompt(style: ResignStyle, reason: string): string {
  const name = NAME_PLACEHOLDER;
  const base = `당신은 사직서 작성 전문가입니다. 아래 조건에 맞는 사직서를 작성해주세요.
- 퇴사 사유: ${reason}
- 작성자 이름: ${name} (이름이 들어갈 자리에는 반드시 ${name} 를 글자 그대로 쓰세요)
- 분량: 200~400자
- 사직서의 형식은 갖추되, 각 스타일의 특색을 살려주세요.
- 재미있고 공감되면서도 약간의 감동이 있어야 합니다.`;

  const styleGuides: Record<ResignStyle, string> = {
    poetic: `${base}
스타일: 서정시인 톤
- 은유와 비유를 풍부하게 사용
- 계절, 바람, 별 등 자연 이미지 활용
- 마지막은 여운이 남는 한 줄로`,
    rapper: `${base}
스타일: 힙합 래퍼 톤
- Verse 1, Hook, Verse 2, Outro 구조
- 라임을 맞춰주세요
- 회사 생활의 고충을 가사에 녹여주세요
- "Yo" 또는 "Check it"으로 시작`,
    joseon: `${base}
스타일: 조선왕조실록 고어체
- "신하 ${name} 엎드려 아뢰옵니다"로 시작
- ~하옵니다, ~이옵니다 등 고어체
- 직장을 조정에, 상사를 영상으로 비유
- 마지막은 "삼가 글월을 올리옵니다"로 마무리`,
    mz: `${base}
스타일: MZ세대 구어체
- ㅋㅋ, ㅠㅠ 등 이모티콘 자유 사용
- "진짜", "레알", "미쳤" 등 구어체
- 솔직하고 담백하게
- 마지막은 "이만 총총..."으로`,
    essay: `${base}
스타일: 감성 에세이
- 첫 출근날의 기억으로 시작
- 회사에서의 좋았던 순간과 힘들었던 순간을 회고
- 성장에 대한 감사
- 마지막은 새로운 시작에 대한 기대로`,
  };

  return styleGuides[style];
}

// v2: 이름 자리표시자 방식으로 바뀌면서 예전(실명이 박힌) 캐시를 쓰지 않도록 키를 바꿨다.
const CACHE_VERSION = 'v2';

export function hashReasonStyle(reason: string, style: string): string {
  let hash = 0;
  const str = `${CACHE_VERSION}:${reason}:${style}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

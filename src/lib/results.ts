export interface ResultType {
  minScore: number;
  maxScore: number;
  title: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
}

export const resultTypes: ResultType[] = [
  {
    minScore: 0,
    maxScore: 15,
    title: '회사 충성견',
    emoji: '🐕',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    description: '당신은 회사의 든든한 기둥! 월요일이 기다려지는 희귀종입니다. 회사가 당신을 모르면 간첩.',
  },
  {
    minScore: 16,
    maxScore: 35,
    title: '프로 직장인',
    emoji: '💼',
    color: '#2563eb',
    bgColor: '#eff6ff',
    description: '적당한 거리감을 유지하며 프로페셔널하게 일하는 당신. 워라밸의 달인!',
  },
  {
    minScore: 36,
    maxScore: 55,
    title: '슬기로운 직장생활',
    emoji: '🤔',
    color: '#ca8a04',
    bgColor: '#fefce8',
    description: '좋을 때도 있고 힘들 때도 있는 리얼 직장인. 아직은 버틸 만 하지만... 흔들리고 있죠?',
  },
  {
    minScore: 56,
    maxScore: 75,
    title: '퇴사 준비생',
    emoji: '📦',
    color: '#ea580c',
    bgColor: '#fff7ed',
    description: '마음은 이미 반쯤 사표를 던진 상태. 점심시간에 이력서 업데이트하고 있지 않나요?',
  },
  {
    minScore: 76,
    maxScore: 90,
    title: '퇴사 예정자',
    emoji: '✈️',
    color: '#dc2626',
    bgColor: '#fef2f2',
    description: '퇴사는 시간문제. 이미 머릿속에서 사직서를 100번은 쓴 당신. 남은 건 실행뿐!',
  },
  {
    minScore: 91,
    maxScore: 100,
    title: '정신적 퇴사 완료',
    emoji: '🚀',
    color: '#9333ea',
    bgColor: '#faf5ff',
    description: '몸만 출근하는 상태. 영혼은 이미 퇴사했습니다. 사직서는 형식일 뿐...',
  },
];

export function getResultType(score: number): ResultType {
  return resultTypes.find(r => score >= r.minScore && score <= r.maxScore) ?? resultTypes[resultTypes.length - 1];
}

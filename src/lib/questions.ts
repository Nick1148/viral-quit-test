export interface Question {
  id: number;
  text: string;
  weight: number;
  options: {
    text: string;
    score: number;
  }[];
}

export const questions: Question[] = [
  {
    id: 1,
    text: '월요일 아침, 알람이 울립니다. 당신의 반응은?',
    weight: 1.2,
    options: [
      { text: '상쾌하게 일어나서 출근 준비!', score: 0 },
      { text: '5분만... 하고 한 번 더 눕는다', score: 3 },
      { text: '알람을 끄고 "오늘 아픈 척 할까" 고민', score: 7 },
      { text: '알람 소리에 존재의 의미를 묻는다', score: 10 },
    ],
  },
  {
    id: 2,
    text: '회사에서 가장 많이 보는 사이트는?',
    weight: 1.5,
    options: [
      { text: '업무 관련 사이트 / 사내 시스템', score: 0 },
      { text: '뉴스, SNS (쉬는 시간에만)', score: 3 },
      { text: '채용 사이트 (눈팅 정도는...)', score: 7 },
      { text: '사직서 양식 / 퇴사 후기 블로그', score: 10 },
    ],
  },
  {
    id: 3,
    text: '상사가 "잠깐 얘기 좀 할까?" 할 때 첫 반응은?',
    weight: 1.0,
    options: [
      { text: '"네!" 하고 바로 따라간다', score: 0 },
      { text: '뭐지? 하면서 약간 긴장', score: 3 },
      { text: '"이번엔 또 뭐야..." 한숨부터', score: 7 },
      { text: '"퇴사 들켰나?" 심장이 쿵', score: 10 },
    ],
  },
  {
    id: 4,
    text: '연봉 인상률을 확인했을 때 당신의 반응은?',
    weight: 1.3,
    options: [
      { text: '만족스럽다, 노력이 인정받는 느낌', score: 0 },
      { text: '뭐 이 정도면... 나쁘진 않지', score: 3 },
      { text: '물가 상승률도 안 되잖아 이게', score: 7 },
      { text: '링크드인 프로필 업데이트 시작', score: 10 },
    ],
  },
  {
    id: 5,
    text: '퇴근 후 남은 에너지는 어느 정도?',
    weight: 1.1,
    options: [
      { text: '운동도 하고 자기개발도 한다', score: 0 },
      { text: '간단한 취미 정도는 즐길 수 있다', score: 3 },
      { text: '넷플릭스 틀어놓고 눈 감는 게 전부', score: 7 },
      { text: '현관에서 신발 벗는 것도 벅차다', score: 10 },
    ],
  },
  {
    id: 6,
    text: '회식 공지가 올라왔습니다!',
    weight: 0.8,
    options: [
      { text: '좋아! 맛있는 거 먹자~', score: 0 },
      { text: '참석은 하지만 1차만...', score: 3 },
      { text: '핑계를 떠올리기 시작한다', score: 7 },
      { text: '그날 갑자기 할머니가 위독해지신다', score: 10 },
    ],
  },
  {
    id: 7,
    text: '옆자리 동료가 퇴사한다고 합니다. 첫 감정은?',
    weight: 1.4,
    options: [
      { text: '아쉽다, 좋은 동료였는데', score: 0 },
      { text: '부럽... 아니 축하한다고 말한다', score: 3 },
      { text: '"어디로 가? 거기 자리 있어?"', score: 7 },
      { text: '"데려가줘..." 하고 진심으로 부탁', score: 10 },
    ],
  },
  {
    id: 8,
    text: '5년 후 이 회사에서의 나를 상상하면?',
    weight: 1.5,
    options: [
      { text: '승진해서 더 큰 역할을 하고 있겠지', score: 0 },
      { text: '비슷한 자리에서 안정적으로 다니고 있겠지', score: 3 },
      { text: '...상상이 안 된다 솔직히', score: 7 },
      { text: '5년? 5개월도 모르겠는데?', score: 10 },
    ],
  },
  {
    id: 9,
    text: '일요일 밤, 당신의 기분은?',
    weight: 1.2,
    options: [
      { text: '내일 뭐 하지~ 설렌다', score: 0 },
      { text: '아 벌써 월요일이네... 현실적 수용', score: 3 },
      { text: '원인 모를 복통과 두통이 시작', score: 7 },
      { text: '이불 속에서 우주의 끝을 생각한다', score: 10 },
    ],
  },
  {
    id: 10,
    text: '마지막 질문. 이 테스트를 하는 이유는?',
    weight: 1.0,
    options: [
      { text: '심심해서, 재미로 해봄', score: 0 },
      { text: '궁금해서... 나 괜찮은 건지', score: 3 },
      { text: '진짜 퇴사할지 고민 중이라서', score: 7 },
      { text: '퇴사 결심 확인 사살용', score: 10 },
    ],
  },
];

export function calculateScore(answers: number[]): number {
  let weightedSum = 0;
  let maxWeightedSum = 0;

  questions.forEach((q, i) => {
    const selectedScore = q.options[answers[i]]?.score ?? 0;
    weightedSum += selectedScore * q.weight;
    maxWeightedSum += 10 * q.weight;
  });

  return Math.round((weightedSum / maxWeightedSum) * 100);
}

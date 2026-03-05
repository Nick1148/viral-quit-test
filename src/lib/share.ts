export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function getShareUrl(resultId: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://viral-quit-test.vercel.app';
  return `${base}/result/${resultId}`;
}

export function shareKakao(resultId: string, score: number, title: string) {
  const url = getShareUrl(resultId);
  const Kakao = (window as unknown as { Kakao: KakaoSDK }).Kakao;
  if (!Kakao?.Share) return;

  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: `내 퇴사확률 ${score}% - ${title}`,
      description: '당신의 퇴사확률은? 지금 바로 테스트해보세요!',
      imageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?score=${score}&title=${encodeURIComponent(title)}`,
      link: { mobileWebUrl: url, webUrl: url },
    },
    buttons: [
      {
        title: '나도 테스트하기',
        link: { mobileWebUrl: url, webUrl: url },
      },
    ],
  });
}

interface KakaoSDK {
  Share: {
    sendDefault: (options: Record<string, unknown>) => void;
  };
}

export async function saveAsImage(elementId: string, filename: string) {
  const { default: html2canvas } = await import('html2canvas');
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

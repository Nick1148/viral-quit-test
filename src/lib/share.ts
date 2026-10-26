import { getBaseUrl } from './site';

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 아래 대체 방식으로 진행
  }

  // 카카오톡 인앱 브라우저 등 Clipboard API 가 없는 환경 대비
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function getShareUrl(resultId: string): string {
  return `${getBaseUrl()}/result/${encodeURIComponent(resultId)}`;
}

export function getOgImageUrl(score: number): string {
  return `${getBaseUrl()}/api/og?score=${encodeURIComponent(String(score))}`;
}

interface KakaoSDK {
  isInitialized?: () => boolean;
  Share?: {
    sendDefault: (options: Record<string, unknown>) => void;
  };
}

// 카카오 SDK 가 준비되지 않았으면 false 를 돌려 호출부에서 대체 공유를 하도록 한다.
export function shareKakao(resultId: string, score: number, title: string): boolean {
  const Kakao = (window as unknown as { Kakao?: KakaoSDK }).Kakao;
  if (!Kakao?.Share || (Kakao.isInitialized && !Kakao.isInitialized())) return false;

  const url = getShareUrl(resultId);
  const testUrl = `${getBaseUrl()}/test`;
  try {
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `내 퇴사확률 ${score}% - ${title}`,
        description: '당신의 퇴사확률은? 지금 바로 테스트해보세요!',
        imageUrl: getOgImageUrl(score),
        link: { mobileWebUrl: url, webUrl: url },
      },
      buttons: [
        {
          title: '결과 보기',
          link: { mobileWebUrl: url, webUrl: url },
        },
        {
          title: '나도 테스트하기',
          link: { mobileWebUrl: testUrl, webUrl: testUrl },
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

// 기기 기본 공유 시트 (모바일). 지원하지 않거나 사용자가 취소하면 false.
export async function shareNative(url: string, text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) return false;
  try {
    await navigator.share({ title: '퇴사연구소', text, url });
    return true;
  } catch {
    return false;
  }
}

export async function saveAsImage(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: Math.min(2, window.devicePixelRatio || 2),
      useCORS: true,
    });

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return false;

    // iOS 사파리·인앱 브라우저는 download 속성이 동작하지 않는 경우가 많아 공유 시트(파일)를 먼저 시도
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return true;
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return true;
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}

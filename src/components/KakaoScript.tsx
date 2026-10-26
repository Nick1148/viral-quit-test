'use client';

import Script from 'next/script';

// 기존 integrity 값(sha384)이 63자로 잘려 있어(정상은 64자) 브라우저가 SDK 로드를 차단했다.
// 올바른 값은 카카오 개발자 사이트 다운로드 페이지에서 복사해 NEXT_PUBLIC_KAKAO_SDK_INTEGRITY 로 넣는다.
const KAKAO_SDK_VERSION = '2.7.4';

export default function KakaoScript() {
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  const integrity = process.env.NEXT_PUBLIC_KAKAO_SDK_INTEGRITY?.trim();

  if (!kakaoKey || kakaoKey === 'your_kakao_js_key') return null;

  return (
    <Script
      src={`https://t1.kakaocdn.net/kakao_js_sdk/${KAKAO_SDK_VERSION}/kakao.min.js`}
      {...(integrity ? { integrity, crossOrigin: 'anonymous' as const } : {})}
      strategy="lazyOnload"
      onLoad={() => {
        const w = window as unknown as { Kakao?: { init: (key: string) => void; isInitialized: () => boolean } };
        if (w.Kakao && !w.Kakao.isInitialized()) {
          w.Kakao.init(kakaoKey);
        }
      }}
    />
  );
}

'use client';

import Script from 'next/script';

export default function KakaoScript() {
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

  if (!kakaoKey || kakaoKey === 'your_kakao_js_key') return null;

  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
      integrity="sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmOGfnvRDJpJEIKBn6IWRBYnr"
      crossOrigin="anonymous"
      strategy="lazyOnload"
      onLoad={() => {
        const w = window as unknown as { Kakao: { init: (key: string) => void; isInitialized: () => boolean } };
        if (w.Kakao && !w.Kakao.isInitialized()) {
          w.Kakao.init(kakaoKey);
        }
      }}
    />
  );
}

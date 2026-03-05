import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "퇴사연구소 - 내 퇴사확률은?",
  description: "직장인 퇴사확률 계산기 & AI 사직서 생성기",
  openGraph: {
    title: "퇴사연구소 - 내 퇴사확률은?",
    description: "직장인 퇴사확률 계산기 & AI 사직서 생성기",
    type: "website",
    locale: "ko_KR",
    siteName: "퇴사연구소",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${notoSansKR.variable} font-sans antialiased min-h-screen`}
      >
        {children}
        <Analytics />
        {process.env.NEXT_PUBLIC_KAKAO_JS_KEY && (
          <Script
            src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
            integrity="sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmOGfnvRDJpJEIKBn6IWRBYnr"
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
      </body>
    </html>
  );
}

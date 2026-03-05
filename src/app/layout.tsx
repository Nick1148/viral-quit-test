import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import KakaoScript from "@/components/KakaoScript";
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
        <KakaoScript />
      </body>
    </html>
  );
}

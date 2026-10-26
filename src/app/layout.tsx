import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import KakaoScript from "@/components/KakaoScript";
import { getBaseUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

const defaultTitle = `${SITE_NAME} - 내 퇴사확률은?`;

export const metadata: Metadata = {
  // 상대 경로 OG 이미지(/api/og)를 절대 URL 로 만들기 위해 필요
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: defaultTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["퇴사", "퇴사확률", "퇴사 테스트", "사직서", "AI 사직서", "직장인 테스트", "회사 랭킹"],
  alternates: { canonical: "/" },
  openGraph: {
    title: defaultTitle,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    url: "/",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: defaultTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: SITE_DESCRIPTION,
    images: ["/api/og"],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0f",
  colorScheme: "dark",
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

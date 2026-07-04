import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockTutor — AI 주식 동향 예측",
  description:
    "XGBoost 기반 AI가 5~10년 차트·호가·거래량을 학습해 추천 종목과 근거를 제시합니다.",
};

export const viewport: Viewport = {
  themeColor: "#080b11",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

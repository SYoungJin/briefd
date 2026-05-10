import "./globals.css";
import type { Metadata } from "next";
import { initScheduler } from "@/lib/scheduler";

initScheduler();

export const metadata: Metadata = {
  title: "Briefd",
  description: "빠른 세상, 뒤처지지 않는 나"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Pretendard:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

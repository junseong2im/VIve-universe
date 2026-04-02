import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/layout/ClientProviders";
import { GNB } from "@/components/layout/GNB";

export const metadata: Metadata = {
  title: "VIBE UNIVERSE | 바이브 유니버스",
  description: "도망간 개발자의 아날로그 노트를 바이브 코딩으로 복원하는 퀘스트형 AI 해커톤 플랫폼",
  keywords: ["해커톤", "바이브 코딩", "AI", "프롬프트", "hackathon", "DACON"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <div className="cosmos-bg" />
        <ClientProviders>
          <GNB />
          <main className="relative z-10 pt-16">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}

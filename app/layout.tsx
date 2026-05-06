import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "상상우리 매칭",
  description: "시니어 일자리 자동 매칭 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-lg bg-background text-foreground">
        <header className="border-b border-border bg-primary text-primary-foreground">
          <nav className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-8">
            <span className="text-2xl font-bold tracking-tight">상상우리</span>
            <Link
              href="/register"
              className="text-xl font-semibold hover:underline underline-offset-4"
            >
              프로필 등록
            </Link>
            <Link
              href="/recommendations"
              className="text-xl font-semibold hover:underline underline-offset-4"
            >
              추천 목록
            </Link>
            <Link
              href="/admin"
              className="text-xl font-semibold hover:underline underline-offset-4"
            >
              담당자 대시보드
            </Link>
          </nav>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
          {children}
        </main>

        <footer className="border-t border-border py-4 text-center text-base text-muted-foreground">
          © 2026 상상우리 — 시니어 일자리 매칭 시스템
        </footer>
      </body>
    </html>
  );
}

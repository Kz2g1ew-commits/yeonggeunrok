import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: { default: "영근록 — 사주팔자 기반 선협 영근 판정", template: "%s | 영근록" },
  description: "사주팔자의 간지·오행 구조를 읽는 선협식 영근 판별",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <Navigation />
        {children}
        <footer className="relative border-t border-white/6 py-8 text-xs text-[#70858e]">
          <div className="shell flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <p><strong className="display-serif mr-2 text-[#b8a271]">靈根錄</strong>사주 오행을 펼치는 선협 영근록</p>
            <div className="flex gap-4"><Link href="/methodology">계산법과 한계</Link><Link href="/privacy">개인정보 처리</Link></div>
          </div>
        </footer>
      </body>
    </html>
  );
}

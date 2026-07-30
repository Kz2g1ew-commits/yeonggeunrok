import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: { default: "영근록 — 사주팔자 기반 선협 영근 판정", template: "%s | 영근록" },
  description: "전통 간지·오행 구조를 선협 세계관의 영근 설정과 결합한 창작용 분석 도구",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <Navigation />
        {children}
        <footer className="relative border-t border-white/6 py-8 text-xs text-[#70858e]">
          <div className="shell flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <p><strong className="display-serif mr-2 text-[#b8a271]">靈根錄</strong>창작자를 위한 오행 세계관 실험실</p>
            <div className="flex gap-4"><Link href="/methodology">계산법과 한계</Link><Link href="/privacy">개인정보 처리</Link></div>
          </div>
        </footer>
      </body>
    </html>
  );
}

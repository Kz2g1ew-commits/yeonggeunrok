import Link from "next/link";
import { Sparkles } from "lucide-react";

const links = [
  ["/guide", "판정 기준"], ["/elements", "오행"], ["/mutations", "변이 도감"],
  ["/methodology", "계산법"], ["/privacy", "개인정보"],
];

export function Navigation() {
  return (
    <header className="relative z-20 border-b border-white/6 bg-[#071016]/75 backdrop-blur-xl">
      <div className="shell flex min-h-16 items-center justify-between gap-6 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="영근록 홈">
          <span className="grid size-9 place-items-center rounded-full border border-[#d8b66a]/35 bg-[#d8b66a]/8 text-[#e3c578]">
            <Sparkles size={17} aria-hidden="true" />
          </span>
          <span>
            <strong className="display-serif block text-lg tracking-[-.04em] text-[#f2eee4]">영근록</strong>
            <small className="block text-[9px] font-bold tracking-[.22em] text-[#8ba0a8]">靈根錄</small>
          </span>
        </Link>
        <nav className="flex items-center gap-x-5 gap-y-2 overflow-x-auto text-[12px] font-semibold text-[#9badb5] sm:text-sm" aria-label="주요 메뉴">
          {links.map(([href, label]) => <Link key={href} href={href} className="whitespace-nowrap transition hover:text-[#efd48d]">{label}</Link>)}
        </nav>
      </div>
    </header>
  );
}

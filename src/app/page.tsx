import Link from "next/link";
import { ArrowUpRight, BookOpen, CircleDot, ShieldCheck, Sparkles } from "lucide-react";
import { BirthInputForm } from "@/components/BirthInputForm";
import { Disclaimer } from "@/components/Disclaimer";

const steps = [
  ["一", "사주 원국", "입춘·절입과 현지 시각을 기준으로 네 기둥을 계산합니다."],
  ["二", "오행 기맥", "투출·통근·월령·지장간·합충을 점수로 분석합니다."],
  ["三", "영근 발현", "유효 통로와 변이 조건을 선협식 설정으로 번역합니다."],
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <section className="shell grid min-h-[650px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.8fr] lg:py-24">
        <div className="relative">
          <div className="pointer-events-none absolute -left-20 -top-20 -z-10 size-80 rounded-full border border-[#d8b66a]/8" />
          <div className="pointer-events-none absolute left-10 top-2 -z-10 grid size-52 place-items-center rounded-full border border-[#d8b66a]/10 text-[8rem] text-[#d8b66a]/[.035] display-serif">靈</div>
          <span className="eyebrow">Five elements · Eight characters</span>
          <h1 className="display-serif text-balance mt-6 max-w-3xl text-5xl font-semibold leading-[1.08] tracking-[-.06em] sm:text-6xl lg:text-[4.8rem]">
            팔자에 흐르는 기운,<br /><span className="gold">어떤 영근</span>으로<br className="sm:hidden" /> 깨어날까
          </h1>
          <p className="mt-7 max-w-xl text-balance text-base leading-8 text-[#9fb0b7] sm:text-lg">사주팔자의 간지와 오행 구조를 정밀하게 읽고, 선협 소설의 영근·공법·술법 설정으로 재해석하는 창작 도구입니다.</p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold text-[#aebdc2]">
            <span className="surface-soft flex items-center gap-2 px-3 py-2"><ShieldCheck size={14} className="text-[#62c6a5]" />서버 전송 없음</span>
            <span className="surface-soft flex items-center gap-2 px-3 py-2"><CircleDot size={14} className="text-[#d8b66a]" />절기 시각 반영</span>
            <span className="surface-soft flex items-center gap-2 px-3 py-2"><Sparkles size={14} className="text-[#d96d62]" />창작용 판정</span>
          </div>
          <Link href="/guide" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#dfc57f]">판정 기준 먼저 보기 <ArrowUpRight size={15} /></Link>
        </div>
        <BirthInputForm />
      </section>

      <section className="border-y border-white/6 bg-[#071219]/65 py-16">
        <div className="shell">
          <div className="mb-9 max-w-2xl">
            <span className="eyebrow">How it works</span>
            <h2 className="section-title mt-3">존재가 아니라, 흐름을 봅니다</h2>
            <p className="muted mt-3 leading-7">팔자에 글자가 있다는 이유만으로 영근이 되지는 않습니다. 기운이 뿌리내리고 드러나 실제 통로를 이루는지를 단계별로 확인합니다.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map(([number, title, description]) => <article key={number} className="surface-soft relative overflow-hidden p-6">
              <span className="display-serif absolute right-4 top-1 text-6xl text-[#d8b66a]/8">{number}</span>
              <span className="display-serif text-xl text-[#d8b66a]">{number}</span><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="muted mt-2 text-sm leading-6">{description}</p>
            </article>)}
          </div>
          <div className="mt-6"><Disclaimer /></div>
        </div>
      </section>

      <section className="shell grid gap-7 py-16 md:grid-cols-[.7fr_1.3fr] md:items-center">
        <div><BookOpen className="text-[#d8b66a]" /><h2 className="section-title mt-4">전통 규칙과 창작 규칙을 분리했습니다</h2></div>
        <p className="muted leading-8">연주·월주·일주·시주의 계산과 간지·오행 매핑은 전통 달력 체계를 따릅니다. 영근 점수와 빙·뇌·풍 같은 변이영근은 선협 세계관을 위한 별도 규칙입니다. 결과의 상세 계산에서 어느 규칙이 적용되었는지 확인할 수 있습니다.</p>
      </section>
    </main>
  );
}

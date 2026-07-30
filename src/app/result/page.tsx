"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, BookMarked, ShieldAlert, Sparkles } from "lucide-react";
import { getCurrentAnalysis } from "@/lib/analysisStore";
import { SpiritualRootResultCard } from "@/components/SpiritualRootResultCard";
import { FourPillarsTable } from "@/components/FourPillarsTable";
import { ElementScoreChart } from "@/components/ElementScoreChart";
import { MutationAnalysis } from "@/components/MutationAnalysis";
import { RuleBreakdown } from "@/components/RuleBreakdown";
import { Disclaimer } from "@/components/Disclaimer";
import { ResultShareButton } from "@/components/ResultShareButton";

export default function ResultPage() {
  const [data] = useState(() => getCurrentAnalysis());

  if (!data) return <main className="shell grid min-h-[65vh] place-items-center py-20"><div className="surface max-w-lg p-8 text-center"><BookMarked className="mx-auto text-[#d8b66a]" /><h1 className="section-title mt-4">펼쳐진 명식이 없습니다</h1><p className="muted mt-3 leading-7">민감한 출생 정보는 저장하지 않으므로 새로고침하거나 직접 접속하면 결과가 남지 않습니다.</p><Link href="/" className="primary-button mt-6"><ArrowLeft size={17} /> 입력 화면으로</Link></div></main>;

  const { calculation, analysis } = data;
  const { result } = analysis;

  const visibleShensha = analysis.shensha.filter((item) => item.present);
  return (
    <main className="shell py-10 sm:py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link href="/" className="ghost-button"><ArrowLeft size={15} /> 다시 판정</Link><ResultShareButton result={result} /></div>
      <div className="grid gap-6">
        <SpiritualRootResultCard result={result} />

        {calculation.boundary.nearBoundary && <div role="alert" className="flex gap-3 rounded-xl border border-[#d8b66a]/30 bg-[#d8b66a]/8 p-4 text-sm text-[#e4d4a9]"><AlertTriangle className="mt-0.5 size-5 shrink-0" /><div><strong>경계 시각 주의</strong><p className="mt-1 text-[#bdb391]">절기 또는 시진 경계에 가까워 설정에 따라 사주팔자가 달라질 수 있습니다.</p></div></div>}

        <FourPillarsTable pillars={calculation.pillars} />
        <ElementScoreChart evidence={result.elementEvidence} />

        <section className="surface p-5 sm:p-7">
          <span className="eyebrow">Why this result</span><h2 className="section-title mt-2">영근 판정 근거</h2>
          <div className="mt-6 grid gap-3">{result.explanations.map((explanation, index) => <div key={explanation} className="surface-soft flex gap-4 p-4"><span className="display-serif text-xl text-[#d8b66a]">{String(index + 1).padStart(2, "0")}</span><p className="text-sm leading-7 text-[#b7c4c8]">{explanation}</p></div>)}</div>
        </section>

        <MutationAnalysis candidates={result.mutations} />

        <section className="surface p-5 sm:p-7">
          <span className="eyebrow">Cultivation route</span><h2 className="section-title mt-2">수련 설정 추천</h2><p className="muted mt-2 text-sm">운세가 아닌 캐릭터·세계관 설정 아이디어입니다.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="surface-soft p-4"><h3 className="flex items-center gap-2 font-bold text-[#e6d8b4]"><Sparkles size={15} />추천 공법</h3><ul className="mt-3 grid gap-2 text-sm text-[#aebdc2]">{result.recommendedPaths.map((path) => <li key={path}>· {path}</li>)}</ul></article>
            <article className="surface-soft p-4"><h3 className="font-bold text-[#e6d8b4]">무기와 술법</h3><p className="muted mt-3 text-sm leading-7">{result.recommendedWeapons.join(" · ") || "기맥을 먼저 개통할 법구"}<br />{result.recommendedTechniques.join(" · ") || "기초 납기술"}</p></article>
            <article className="surface-soft p-4"><h3 className="flex items-center gap-2 font-bold text-[#e6d8b4]"><ShieldAlert size={15} />약점과 위험</h3><ul className="mt-3 grid gap-2 text-sm text-[#c2a6a2]">{result.weaknesses.slice(0, 2).map((item) => <li key={item}>· {item}</li>)}{result.risks.map((item) => <li key={item}>· {item}</li>)}</ul></article>
          </div>
          <div className="mt-4 rounded-xl border border-[#62c6a5]/15 bg-[#62c6a5]/5 p-4 text-sm leading-7 text-[#afd0c5]"><strong>성장 방향</strong><br />{result.growthDirection}</div>
          {visibleShensha.length > 0 && <div className="mt-5"><h3 className="text-sm font-bold text-[#d8c99f]">신살 부가 성향</h3><div className="mt-3 flex flex-wrap gap-2">{visibleShensha.map((item) => <span key={item.id} className="rounded-full border border-white/10 bg-white/[.035] px-3 py-2 text-xs text-[#b7c5ca]">{item.name} · {item.traits.slice(0, 3).join("·")}</span>)}</div></div>}
          <p className="mt-4 text-xs text-[#748991]">신살 판정은 유파에 따라 달라질 수 있습니다.</p>
        </section>

        <RuleBreakdown data={data} />
        <Disclaimer />
      </div>
    </main>
  );
}

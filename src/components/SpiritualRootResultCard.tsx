import { Activity, Gauge, GitBranch, Layers3, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import type { SpiritualRootResult } from "@/types/spiritualRoot";
import { ELEMENT_META } from "@/lib/bazi/elementMeta";
import { ElementBadge } from "./ElementBadge";

export function SpiritualRootResultCard({ result }: { result: SpiritualRootResult }) {
  const mutation = result.mutations.find((candidate) => candidate.status !== "rejected");
  const primary = result.primaryElements[0];
  const secondary = result.primaryElements[1];
  const daoLabel = result.awakening.dao.path === "natural" ? "순천도맥" : "역천도맥";
  const multiRootSubtype = result.classification.multiRootProfile
    ? `${result.classification.multiRootProfile.subtype}${result.classification.multiRootProfile.fiveRootVariant ? `·${result.classification.multiRootProfile.fiveRootVariant}` : ""}`
    : undefined;
  return (
    <section className="surface relative overflow-hidden p-5 sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-16 grid size-64 place-items-center rounded-full border border-[#d8b66a]/10 text-[7rem] text-[#d8b66a]/[.035] display-serif">根</div>
      <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <span className="eyebrow">Spiritual root result</span>
          <p className="mt-5 text-xs font-bold tracking-[.12em] text-[#81969e]">최종 판정</p>
          <h1 className="display-serif text-balance mt-2 text-3xl font-semibold tracking-[-.05em] text-[#f3e6c4] sm:text-5xl">{result.displayName}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <span className="rounded-full border border-[#62c6a5]/20 bg-[#62c6a5]/7 px-3 py-1.5 text-[#8bd5bd]">{result.awakening.label}</span>
            <span className="rounded-full border border-[#7da6d8]/20 bg-[#7da6d8]/7 px-3 py-1.5 text-[#9fc0e8]">수련 성향 · {daoLabel}</span>
            <span className="rounded-full border border-[#d8b66a]/20 bg-[#d8b66a]/7 px-3 py-1.5 text-[#e5c97f]">품질 {result.classification.qualityLabel}</span>
            <span className="rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 text-[#aab9bf]">{result.classification.rarityLabel}</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">{result.primaryElements.map((element) => <ElementBadge key={element} element={element} />)}{result.potentialElements.map((element) => <span key={element} className="opacity-60"><ElementBadge element={element} /></span>)}</div>
        </div>
        <div className="min-w-52 rounded-2xl border border-[#d8b66a]/16 bg-black/10 p-5">
          <div className="flex items-end justify-between"><span className="text-xs font-bold text-[#96a8af]">판정 신뢰도</span><strong className="display-serif text-3xl text-[#efd48d]">{result.confidence}<small className="text-sm">%</small></strong></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-[#62c6a5] to-[#d8b66a]" style={{ width: `${result.confidence}%` }} /></div>
          <p className="mt-2 text-right text-xs font-bold text-[#b8c4c8]">{result.confidenceLabel}</p>
        </div>
      </div>
      <div className="relative mt-7 grid gap-px overflow-hidden rounded-xl border border-white/7 bg-white/7 sm:grid-cols-2 lg:grid-cols-3">
        {[
          [Sparkles, "변이 가능성", mutation ? `${mutation.name} 변이영근 ${mutation.status === "confirmed" ? "확정" : mutation.status === "likely" ? "유력" : "후보"} ${mutation.confidence}%` : "뚜렷한 후보 없음"],
          [Trophy, "품질 서열", `${result.classification.qualityRank}단계 · ${result.classification.qualityLabel}`],
          [ShieldCheck, "선천 기감", `${result.awakening.preHeaven.stateLabel} · ${result.awakening.passed ? "발현" : "미발현"}`],
          [Activity, "주영근", primary ? ELEMENT_META[primary].label : "미성립"],
          [Layers3, "부·잠재 영근", secondary ? ELEMENT_META[secondary].label : result.potentialElements[0] ? `${ELEMENT_META[result.potentialElements[0]].label}(잠재)` : "없음"],
          [Gauge, "수련 흐름", result.classification.cultivationSpeed],
          ...(multiRootSubtype
            ? [[GitBranch, "세부 구조", multiRootSubtype] as const]
            : []),
        ].map(([Icon, label, value]) => { const C = Icon as typeof Sparkles; return <div key={String(label)} className="bg-[#0d1d25] p-4"><span className="flex items-center gap-1.5 text-[11px] font-bold text-[#758b94]"><C size={13} />{String(label)}</span><strong className="mt-2 block text-sm text-[#dce3e3]">{String(value)}</strong></div>; })}
      </div>
      <p className="relative mt-4 text-xs leading-6 text-[#7f939b]">{result.awakening.explanation} 품질 서열은 오행 수가 적을수록 기맥 순도가 높은 흐름을 따릅니다.</p>
    </section>
  );
}

import { Check, CircleDashed, X } from "lucide-react";
import type { MutationCandidate } from "@/types/spiritualRoot";
import { ElementBadge } from "./ElementBadge";

const statusLabel = { confirmed: "확정", likely: "유력", possible: "가능성", rejected: "불성립" };

export function MutationAnalysis({ candidates }: { candidates: MutationCandidate[] }) {
  const visible = candidates.filter((candidate) => candidate.status !== "rejected").slice(0, 4);
  const fallbacks = candidates.slice(0, 2);
  const items = visible.length ? visible : fallbacks;
  return (
    <section className="surface p-5 sm:p-7">
      <span className="eyebrow">Mutation roots</span><h2 className="section-title mt-2">변이영근 분석</h2>
      <p className="muted mt-2 text-sm">유효한 두 기맥의 생극·융합과 계절의 지지, 방해 기운을 함께 살핍니다.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((candidate) => <article key={candidate.id} className="surface-soft overflow-hidden p-4">
          <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h3 className="display-serif text-xl text-[#eee2c5]">{candidate.name}영근</h3><span className="rounded-full bg-[#d8b66a]/10 px-2 py-1 text-[10px] font-extrabold text-[#dfc270]">{statusLabel[candidate.status]}</span></div><div className="mt-2 flex gap-1.5">{candidate.sourceElements.map((element) => <ElementBadge key={element} element={element} compact />)}</div></div><strong className="display-serif text-2xl text-[#efd48d]">{candidate.confidence}<small className="text-xs">%</small></strong></div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/7"><div className="h-full bg-gradient-to-r from-[#547e8d] to-[#d8b66a]" style={{ width: `${candidate.confidence}%` }} /></div>
          <ul className="mt-4 grid gap-2 text-xs leading-5">
            {candidate.satisfiedConditions.slice(0, 4).map((text) => <li key={text} className="flex gap-2 text-[#b8c8c8]"><Check className="mt-0.5 size-3.5 shrink-0 text-[#62c6a5]" />{text}</li>)}
            {candidate.missingConditions.slice(0, 2).map((text) => <li key={text} className="flex gap-2 text-[#899da5]"><CircleDashed className="mt-0.5 size-3.5 shrink-0" />{text}</li>)}
            {candidate.blockers.slice(0, 2).map((text) => <li key={text} className="flex gap-2 text-[#e19a92]"><X className="mt-0.5 size-3.5 shrink-0" />{text}</li>)}
          </ul>
          <p className="mt-4 border-t border-white/6 pt-3 text-[11px] leading-5 text-[#728891]">{candidate.description}</p>
        </article>)}
      </div>
    </section>
  );
}

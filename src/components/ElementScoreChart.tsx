import type { Element } from "@/types/bazi";
import type { ElementEvidence } from "@/types/spiritualRoot";
import { ELEMENT_META, ELEMENTS } from "@/lib/bazi/elementMeta";
import { ElementBadge } from "./ElementBadge";

export function ElementScoreChart({ evidence }: { evidence: Record<Element, ElementEvidence> }) {
  const max = Math.max(14, ...ELEMENTS.map((element) => evidence[element].score));
  return (
    <section className="surface p-5 sm:p-7">
      <span className="eyebrow">Element flow</span><h2 className="section-title mt-2">오행 기맥 분포</h2>
      <p className="muted mt-2 text-sm">유연 판정에서는 1.5점 이상이며 투출·통근 등 통로가 있는 오행을 작동 영근으로 봅니다. 엄격 판정의 발현 관문을 넘지 못하면 이 통로들은 잠재 상태로 표시됩니다.</p>
      <div className="mt-7 grid gap-4">
        {ELEMENTS.map((element) => { const item = evidence[element]; return <div key={element} className="surface-soft p-4">
          <div className="flex items-center justify-between gap-3"><ElementBadge element={element} /><div className="text-right"><strong className="text-xl" style={{ color: ELEMENT_META[element].color }}>{item.score.toFixed(1)}</strong><span className="ml-1 text-xs text-[#71858e]">점</span><span className={`ml-2 rounded-full px-2 py-1 text-[10px] font-extrabold ${item.effective ? "bg-[#62c6a5]/12 text-[#7cd3b7]" : item.potential ? "bg-[#d8b66a]/12 text-[#e2c678]" : "bg-white/5 text-[#71858e]"}`}>{item.effective ? "유효" : item.potential ? "잠재" : "미성립"}</span></div></div>
          <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-black/25"><div className="absolute inset-y-0 z-10 w-px bg-[#e6d087]/60" style={{ left: `${(1.5 / max) * 100}%` }} /><div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, item.score / max * 100)}%`, background: ELEMENT_META[element].color }} /></div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px] text-[#7f939b]"><span>투출 <b className="block text-xs text-[#c5d0d4]">{item.visibleStems.length}</b></span><span>통근 <b className="block text-xs text-[#c5d0d4]">{item.roots.length}</b></span><span>월령 <b className="block text-xs text-[#c5d0d4]">{item.seasonalStrength > 0 ? "+" + item.seasonalStrength : item.seasonalStrength}</b></span><span>합/충 <b className="block text-xs text-[#c5d0d4]">{item.combinations.length}/{item.clashes.length}</b></span></div>
        </div>; })}
      </div>
    </section>
  );
}

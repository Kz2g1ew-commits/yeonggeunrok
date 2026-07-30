import type { Element } from "@/types/bazi";
import type { ElementEvidence } from "@/types/spiritualRoot";
import { ELEMENT_META, ELEMENTS } from "@/lib/bazi/elementMeta";
import { ElementBadge } from "./ElementBadge";

export function ElementScoreChart({ evidence }: { evidence: Record<Element, ElementEvidence> }) {
  const activationMax = Math.max(14, ...ELEMENTS.map((element) => evidence[element].score));
  const presenceMax = Math.max(...ELEMENTS.map((element) => evidence[element].presenceRatio));
  return (
    <section className="surface p-5 sm:p-7">
      <span className="eyebrow">Element flow</span><h2 className="section-title mt-2">오행 구성과 기맥 활성</h2>
      <p className="muted mt-2 text-sm">원국 구성비는 여덟 글자에 들어 있는 재료의 양이고, 기맥 활성도는 월령·통근·생조·극제 뒤 실제로 작용하는 힘입니다. 약한 오행도 구성에서 사라지지 않지만, 곧바로 영근이 되지는 않습니다.</p>
      <div className="mt-7 grid gap-4">
        {ELEMENTS.map((element) => { const item = evidence[element]; return <div key={element} className="surface-soft p-4">
          <div className="flex items-center justify-between gap-3"><ElementBadge element={element} /><div className="text-right"><strong className="text-xl" style={{ color: ELEMENT_META[element].color }}>{item.score.toFixed(1)}</strong><span className="ml-1 text-xs text-[#71858e]">점</span><span className={`ml-2 rounded-full px-2 py-1 text-[10px] font-extrabold ${item.effective ? "bg-[#62c6a5]/12 text-[#7cd3b7]" : item.structuralEligible ? "bg-[#7da6d8]/12 text-[#9fc0e8]" : item.potential ? "bg-[#d8b66a]/12 text-[#e2c678]" : "bg-white/5 text-[#71858e]"}`}>{item.effective ? "최종 유효" : item.structuralEligible ? "구조 유효" : item.potential ? "잠재" : "미성립"}</span></div></div>
          <div className="mt-3 grid gap-2 text-[10px] text-[#7f939b]">
            <div className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-2"><span>원국 구성</span><div className="h-1.5 overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full opacity-60" style={{ width: `${item.presenceRatio / presenceMax * 100}%`, background: ELEMENT_META[element].color }} /></div><b className="text-right text-[#c5d0d4]">{item.presenceRatio.toFixed(1)}%</b></div>
            <div className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-2"><span>기맥 활성</span><div className="h-1.5 overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, item.score / activationMax * 100)}%`, background: ELEMENT_META[element].color }} /></div><b className="text-right text-[#c5d0d4]">{item.score.toFixed(1)}</b></div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px] text-[#7f939b]"><span>투출 <b className="block text-xs text-[#c5d0d4]">{item.visibleStems.length}</b></span><span>가중 통근 <b className="block text-xs text-[#c5d0d4]">{item.rootStrength.toFixed(1)}</b></span><span>월령 <b className="block text-xs text-[#c5d0d4]">{item.seasonalStrength > 0 ? "+" + item.seasonalStrength : item.seasonalStrength}</b></span><span>합/충 <b className="block text-xs text-[#c5d0d4]">{item.combinations.length}/{item.clashes.length}</b></span></div>
          <p className="mt-3 text-[10px] leading-5 text-[#71858e]">구조 관문: {item.structuralEligible ? item.eligibilityReasons.join(" · ") : item.potential ? item.potentialReasons.join(" · ") : "활성도 또는 독립된 투출·통근 연결 부족"}</p>
          {item.rootDetails.length > 0 && <p className="mt-1 text-[10px] leading-5 text-[#71858e]">뿌리: {item.rootDetails.map((root) => `${root.branch}${root.role === "main" ? " 본기" : root.role === "middle" ? " 중기" : " 여기"}${root.damaged ? "(충손)" : ""}`).join(" · ")}</p>}
        </div>; })}
      </div>
    </section>
  );
}

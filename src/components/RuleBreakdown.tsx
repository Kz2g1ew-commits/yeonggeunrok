import { ChevronDown } from "lucide-react";
import type { StoredAnalysis } from "@/lib/analysisStore";
import { ELEMENT_META, ELEMENTS } from "@/lib/bazi/elementMeta";

function signed(value: number | string): string { const numeric = Number(value); return `${numeric > 0 ? "+" : ""}${value}`; }

export function RuleBreakdown({ data }: { data: StoredAnalysis }) {
  const { calculation, analysis } = data;
  const dao = analysis.result.awakening.dao;
  const daoLabel = dao.path === "natural" ? "순천도맥" : "역천도맥";
  return (
    <section className="surface overflow-hidden">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-7">
          <div><span className="eyebrow">Calculation log</span><h2 className="section-title mt-2">상세 계산 보기</h2><p className="muted mt-2 text-sm">시간 보정, 네 기둥 산출, 모든 가산·감점과 적용 규칙</p></div>
          <ChevronDown className="shrink-0 text-[#d8b66a] transition group-open:rotate-180" />
        </summary>
        <div className="grid gap-6 border-t border-white/6 p-5 sm:p-7">
          <div className="surface-soft p-4 text-sm leading-7 text-[#aab9bf]">
            <strong className="block text-[#e2d4ae]">영근 발현 관문 · {analysis.result.awakening.label}</strong>
            <p>{analysis.result.awakening.explanation}</p>
            <p className="text-xs text-[#8fa2a9]">{daoLabel} {dao.score.toFixed(1)}점 / 통과선 {analysis.result.awakening.threshold.toFixed(1)}점 · 순천 {dao.naturalScore.toFixed(1)} · 역천 {dao.defiantScore.toFixed(1)}</p>
            <p className="text-[11px] text-[#748991]">해시값 {analysis.result.awakening.roll.toString().padStart(4, "0")}은 같은 점수대의 동점 보정에만 사용됩니다.</p>
            {analysis.result.qualityDistribution && <p className="mt-2 border-t border-white/6 pt-2 text-xs text-[#8fa2a9]">순도 배분값 {analysis.result.qualityDistribution.roll.toString().padStart(4, "0")} · {analysis.result.qualityDistribution.label} · 구조 유효 {analysis.result.qualityDistribution.eligibleCount}개 중 {analysis.result.qualityDistribution.appliedCount}개 작동{analysis.result.qualityDistribution.limitedByStructure ? " · 구조 미달 오행은 승격하지 않음" : ""}</p>}
          </div>
          <div>
            <h3 className="font-bold text-[#e7dcc0]">도맥 판정 근거</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="surface-soft p-4"><strong className="text-[#9fc0e8]">핵심 근거</strong><ul className="mt-3 grid gap-2 text-xs leading-6 text-[#aab9bf]">{dao.reasons.map((reason) => <li key={reason}>· {reason}</li>)}</ul></div>
              <div className="surface-soft p-4"><strong className="text-[#dfc57f]">전체 가감</strong><ul className="mt-3 grid gap-1.5 text-xs text-[#aab9bf]">{dao.contributions.map((item, index) => <li key={`${item.path}-${item.label}-${index}`} className="flex justify-between gap-3"><span><b>{item.path === "natural" ? "순천" : "역천"}</b> · {item.label}</span><b className={item.value < 0 ? "text-[#e39188]" : "text-[#79c9b0]"}>{signed(item.value)}</b></li>)}</ul></div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["입력 현지 시각", calculation.correction.originalLocalISO],
              ["UTC 정규화", calculation.correction.normalizedISO],
              ["진태양 보정 시각", calculation.correction.correctedLocalISO],
              ["절기 비교 시각", calculation.correction.calculationTimeISO],
            ].map(([label, value]) => <div key={label} className="surface-soft p-3"><span className="text-[10px] font-bold text-[#71858e]">{label}</span><code className="mt-1 block break-all text-xs text-[#c8d2d4]">{value}</code></div>)}
          </div>
          <div className="surface-soft p-4 text-sm leading-7 text-[#aab9bf]">
            <strong className="block text-[#e2d4ae]">시간·절기 기준</strong>
            <p>{calculation.solarTermBasis}</p>
            <p>표준 자오선 {calculation.correction.standardMeridian.toFixed(2)}° · 경도 보정 {signed(calculation.correction.longitudeCorrectionMinutes.toFixed(2))}분 · 균시차 {signed(calculation.correction.equationOfTimeMinutes.toFixed(2))}분 · 총 {signed(calculation.correction.totalCorrectionMinutes.toFixed(2))}분</p>
            <ul className="mt-2 list-disc pl-5">{calculation.calculationNotes.map((note) => <li key={note}>{note}</li>)}</ul>
          </div>
          <div>
            <h3 className="font-bold text-[#e7dcc0]">오행별 원점수와 가감</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {ELEMENTS.map((element) => { const item = analysis.result.elementEvidence[element]; return <details key={element} className="surface-soft p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between"><strong style={{ color: ELEMENT_META[element].color }}>{ELEMENT_META[element].label} {ELEMENT_META[element].hanja}</strong><span className="font-bold">{item.score.toFixed(1)}점 · {item.effective ? "최종 유효" : item.structuralEligible ? "구조 유효·미선택" : item.potential ? "잠재" : "미성립"}</span></summary>
                <div className="mt-3 border-t border-white/6 pt-3 text-xs leading-6 text-[#84989f]"><p>기초 {item.baseScore.toFixed(1)}점 · 가중 통근 {item.rootStrength.toFixed(1)}</p><p>{item.structuralEligible ? item.eligibilityReasons.join(" · ") : "구조 관문 미통과"}</p></div>
                <ul className="mt-2 grid gap-1.5 text-xs text-[#aab9bf]">{item.contributions.map((part, index) => <li key={`${part.label}-${index}`} className="flex justify-between gap-3"><span>{part.label}</span><b className={part.value < 0 ? "text-[#e39188]" : "text-[#79c9b0]"}>{signed(part.value)}</b></li>)}</ul>
              </details>; })}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="surface-soft p-4"><h3 className="font-bold text-[#e7dcc0]">합충형파해</h3><ul className="mt-3 list-disc pl-5 text-xs leading-6 text-[#9fb0b7]">{[
              ...analysis.relations.combinations, ...analysis.relations.directionalCombinations, ...analysis.relations.halfCombinations,
              ...analysis.relations.archingCombinations, ...analysis.relations.sixCombinations,
              ...analysis.relations.stemCombinations, ...analysis.relations.clashes, ...analysis.relations.punishments,
              ...analysis.relations.breaks, ...analysis.relations.harms,
            ].map((item) => <li key={item}>{item}</li>)}{analysis.relations.dynamicCount === 0 && <li>뚜렷한 합충형파해 없음</li>}</ul></div>
            <div className="surface-soft p-4"><h3 className="font-bold text-[#e7dcc0]">신뢰도 구성</h3><ul className="mt-3 grid gap-2 text-xs text-[#9fb0b7]">{Object.entries(analysis.result.confidenceBreakdown).map(([key, value]) => <li key={key} className="flex justify-between"><span>{{ timeAccuracy: "출생 시간", locationQuality: "위치 정보", boundarySafety: "경계 안전성", scoreClarity: "점수 명확성", mutationClarity: "변이 명확성", ruleConsistency: "규칙 일관성" }[key]}</span><b className="text-[#dfc57f]">+{value}</b></li>)}</ul></div>
          </div>
        </div>
      </details>
    </section>
  );
}

import { ChevronDown } from "lucide-react";
import type { StoredAnalysis } from "@/lib/analysisStore";
import { ELEMENT_META, ELEMENTS } from "@/lib/bazi/elementMeta";

function signed(value: number | string): string { const numeric = Number(value); return `${numeric > 0 ? "+" : ""}${value}`; }

export function RuleBreakdown({ data }: { data: StoredAnalysis }) {
  const { calculation, analysis } = data;
  const dao = analysis.result.awakening.dao;
  const awakening = analysis.result.awakening;
  const preHeaven = awakening.preHeaven;
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
            <strong className="block text-[#e2d4ae]">선천 기감 발현 관문 · {awakening.label}</strong>
            <p>{awakening.explanation}</p>
            <div className="my-3 grid gap-2 sm:grid-cols-3">{Object.values(preHeaven.nodes).map((node) => <div key={node.id} className="rounded-lg border border-white/6 bg-black/10 px-3 py-2"><span className="text-[10px] font-bold text-[#78909a]">{node.name}</span><strong className="ml-2 text-[#e5d4a8]">{node.ganZhi}</strong><p className="text-xs text-[#9fb0b7]">{node.naYin} · {ELEMENT_META[node.element].label}</p></div>)}</div>
            <ul className="grid gap-1 text-xs text-[#8fa2a9]">{awakening.conditions.map((condition) => <li key={condition.id}><b className={condition.met ? "text-[#79c9b0]" : "text-[#e39188]"}>{condition.met ? "충족" : "미충족"}</b> · {condition.label}</li>)}</ul>
            <p className="mt-2 text-xs text-[#8fa2a9]">완성 기맥 {awakening.completeChannels.length}개 · 잠재 기맥 {awakening.potentialChannels.length}개 · 실제 합 {preHeaven.trueBondCount}건 · 삼원 파손 {preHeaven.disruptionCount}건</p>
            <p className="mt-2 border-t border-white/6 pt-2 text-xs text-[#8fa2a9]">{daoLabel}은 영근 유무가 아니라 발현 뒤의 수련 성향입니다. 순천 {dao.naturalScore.toFixed(1)} · 역천 {dao.defiantScore.toFixed(1)}</p>
          </div>
          <div>
            <h3 className="font-bold text-[#e7dcc0]">선천 기감과 도맥 근거</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="surface-soft p-4"><strong className="text-[#9fc0e8]">선천 기감 근거</strong><ul className="mt-3 grid gap-2 text-xs leading-6 text-[#aab9bf]">{[...preHeaven.reasons, ...preHeaven.blockers].map((reason) => <li key={reason}>· {reason}</li>)}</ul></div>
              <div className="surface-soft p-4"><strong className="text-[#dfc57f]">도맥 전체 가감</strong><ul className="mt-3 grid gap-1.5 text-xs text-[#aab9bf]">{dao.contributions.map((item, index) => <li key={`${item.path}-${item.label}-${index}`} className="flex justify-between gap-3"><span><b>{item.path === "natural" ? "순천" : "역천"}</b> · {item.label}</span><b className={item.value < 0 ? "text-[#e39188]" : "text-[#79c9b0]"}>{signed(item.value)}</b></li>)}</ul></div>
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
                <div className="mt-3 border-t border-white/6 pt-3 text-xs leading-6 text-[#84989f]"><p>원국 구성 {item.presenceScore.toFixed(1)}/240 ({item.presenceRatio.toFixed(1)}%) · 기초 활성 {item.baseScore.toFixed(1)}점 · 가중 통근 {item.rootStrength.toFixed(1)}</p><p>천문 {item.channel.heaven.score.toFixed(1)} · 지근 {item.channel.earth.score.toFixed(1)} · 인맥 {item.channel.human.score.toFixed(1)} · 보존성 {(item.channel.integrity * 100).toFixed(0)}% · 삼관 완성도 {item.channel.completion.toFixed(1)}</p><p>{item.effective ? item.eligibilityReasons.join(" · ") : item.potential ? [...item.eligibilityReasons, ...item.potentialReasons].join(" · ") : "삼관 미통과"}</p></div>
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
            <div className="surface-soft p-4"><h3 className="font-bold text-[#e7dcc0]">신뢰도 구성</h3><ul className="mt-3 grid gap-2 text-xs text-[#9fb0b7]">{Object.entries(analysis.result.confidenceBreakdown).map(([key, value]) => <li key={key} className="flex justify-between"><span>{{ timeAccuracy: "출생 시간", locationQuality: "위치 정보", boundarySafety: "경계 안전성", scoreClarity: "판정 경계", mutationClarity: "변이 명확성", ruleConsistency: "규칙 일관성" }[key]}</span><b className="text-[#dfc57f]">+{value}</b></li>)}</ul></div>
          </div>
          <div>
            <h3 className="font-bold text-[#e7dcc0]">신살·선협 재능 합성 근거</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="surface-soft p-4"><strong className="text-[#dfc57f]">{analysis.result.talentProfile.title}</strong><ul className="mt-3 grid gap-3 text-xs leading-6 text-[#9fb0b7]">{Object.values(analysis.result.talentProfile.dimensions).map((dimension) => <li key={dimension.id}><div className="flex justify-between gap-3"><b>{dimension.name} · {dimension.label}</b><b className="text-[#dfc57f]">{dimension.score}</b></div><span>{dimension.reasons.join(" · ") || "기본값"}</span></li>)}</ul></div>
              <div className="surface-soft p-4"><strong className="text-[#dfc57f]">성립 신살</strong><ul className="mt-3 grid gap-2 text-xs leading-6 text-[#9fb0b7]">{analysis.shensha.filter((item) => item.present).map((item) => <li key={item.id}><b>{item.name}</b><br />{item.evidence.join(" · ")}</li>)}{!analysis.shensha.some((item) => item.present) && <li>선택한 기준에서 성립한 신살 없음</li>}</ul></div>
            </div>
          </div>
        </div>
      </details>
    </section>
  );
}

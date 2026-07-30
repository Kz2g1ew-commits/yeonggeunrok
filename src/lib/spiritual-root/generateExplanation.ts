import type { Element } from "@/types/bazi";
import type { ElementEvidence } from "@/types/spiritualRoot";
import { ELEMENT_META, ELEMENTS } from "@/lib/bazi/elementMeta";
import { branchKorean } from "@/lib/bazi/branches";

export function generateExplanation(evidence: Record<Element, ElementEvidence>): string[] {
  return [...ELEMENTS]
    .sort((a, b) => evidence[b].score - evidence[a].score)
    .map((element) => {
      const item = evidence[element];
      const label = ELEMENT_META[element].label;
      const facts: string[] = [];
      if (item.qualitySelected) facts.push("구조 관문과 순도 배분을 모두 통과하고");
      if (item.monthCommand) facts.push("월령을 얻고");
      if (item.visibleStems.length) facts.push(`천간 ${item.visibleStems.length}곳에 투출하며`);
      if (item.rootStrength > 0) facts.push(`${item.roots.map(branchKorean).join("·")}의 가중 통근이 ${item.rootStrength.toFixed(1)}이고`);
      if (item.combinations.length) facts.push(`${item.combinations.join("·")} 세력을 이루어`);
      if (item.supportScore > 0) facts.push("생조를 받아");
      if (item.controlPenalty < 0 || item.clashes.length) facts.push("극제 또는 충의 손상이 있어");
      const status = item.effective ? "유효 영근으로 성립했습니다"
        : item.structuralEligible ? "구조적으로는 유효하지만 이번 순도 배분에서는 잠재 통로로 남았습니다"
          : item.potential ? "점수 또는 투출·통근 연결이 부족한 잠재 영근입니다"
        : "독립된 영기 통로를 만들지 못해 영근에서 제외했습니다";
      return `${label} 오행은 ${facts.length ? facts.join(" ") : "뚜렷한 투출·통근 기반이 부족해"} 최종 ${item.score.toFixed(1)}점으로 ${status}.`;
    });
}

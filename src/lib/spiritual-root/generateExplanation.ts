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
      if (item.monthCommand) facts.push("월령을 얻고");
      if (item.visibleStems.length) facts.push(`천간 ${item.visibleStems.length}곳에 투출하며`);
      if (item.roots.length) facts.push(`${item.roots.map(branchKorean).join("·")}에 통근하고`);
      if (item.combinations.length) facts.push(`${item.combinations.join("·")} 세력을 이루어`);
      if (item.supportScore > 0) facts.push("생조를 받아");
      if (item.controlPenalty < 0 || item.clashes.length) facts.push("극제 또는 충의 손상이 있어");
      const status = item.effective ? "유효 영근으로 성립했습니다"
        : item.potential ? "아직 발현 통로가 부족한 잠재 영근입니다"
        : "독립된 영기 통로를 만들지 못해 영근에서 제외했습니다";
      return `${label} 오행은 ${facts.length ? facts.join(" ") : "뚜렷한 투출·통근 기반이 부족해"} 최종 ${item.score.toFixed(1)}점으로 ${status}.`;
    });
}

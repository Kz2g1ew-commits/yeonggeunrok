import type { BranchRelations, Element } from "@/types/bazi";
import type { ElementEvidence, RootClassification, RootCount, RootGrade } from "@/types/spiritualRoot";
import { CONTROLS, ELEMENT_META, ELEMENTS, GENERATES } from "@/lib/bazi/elementMeta";
import { SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";

const GRADE_LABEL: Record<RootGrade, string> = { low: "하품", middle: "중품", high: "상품", supreme: "극품" };

function countType(count: number): RootCount {
  return (["none", "single", "dual", "triple", "quadruple", "five"] as RootCount[])[count];
}

function labelElements(elements: Element[]): string {
  return elements.map((element) => ELEMENT_META[element].label).join("");
}

function singleGrade(score: number, otherScores: number[]): RootGrade {
  const grade = SPIRITUAL_ROOT_RULES.grade;
  if (score >= grade.supremeMin && otherScores.every((value) => value < SPIRITUAL_ROOT_RULES.thresholds.effective)) return "supreme";
  if (score > grade.middleMax) return "high";
  if (score > grade.lowMax) return "middle";
  return "low";
}

function dualRelationship(elements: Element[], evidence: Record<Element, ElementEvidence>): string {
  const [a, b] = elements;
  const gap = Math.abs(evidence[a].score - evidence[b].score);
  let relation: string;
  if (GENERATES[a] === b) relation = `${ELEMENT_META[a].label}생${ELEMENT_META[b].label}형`;
  else if (GENERATES[b] === a) relation = `${ELEMENT_META[b].label}생${ELEMENT_META[a].label}형`;
  else if (CONTROLS[a] === b || CONTROLS[b] === a) relation = "상극충돌형";
  else relation = "병립형";
  if (gap <= SPIRITUAL_ROOT_RULES.thresholds.balanceGap) return `${relation} · 균형`;
  const strong = evidence[a].score >= evidence[b].score ? a : b;
  const weak = strong === a ? b : a;
  return `${relation} · ${ELEMENT_META[strong].label} 주근, ${ELEMENT_META[weak].label} 부근`;
}

function isGeneratingTriple(elements: Element[]): boolean {
  const set = new Set(elements);
  return elements.some((start) => set.has(GENERATES[start]) && set.has(GENERATES[GENERATES[start]]));
}

export function classifyRootCount(
  effective: Element[],
  potential: Element[],
  evidence: Record<Element, ElementEvidence>,
  relations: BranchRelations,
): RootClassification {
  const count = effective.length;
  const rootCount = countType(count);
  const ordered = [...effective].sort((a, b) => ELEMENTS.indexOf(a) - ELEMENTS.indexOf(b));
  const base: Pick<RootClassification, "rootCount" | "originalElements" | "workingElements"> = {
    rootCount, originalElements: ordered, workingElements: ordered.map((element) => ELEMENT_META[element].label),
  };

  if (count === 0) {
    const subtype = potential.length >= 2 ? "은근체 후보"
      : potential.length === 1 ? "산맥무근" : "백맥무근";
    return { ...base, displayName: `무영근 — ${subtype}`, cultivationSpeed: "기맥 개통 전에는 매우 느림", adaptability: "특수 체질·외부 기연 의존" };
  }
  if (count === 1) {
    const element = effective[0];
    const grade = singleGrade(evidence[element].score, ELEMENTS.filter((item) => item !== element).map((item) => evidence[item].score));
    return {
      ...base, grade, displayName: `${GRADE_LABEL[grade]} ${ELEMENT_META[element].label} 천영근`,
      cultivationSpeed: grade === "supreme" || grade === "high" ? "매우 빠름" : "빠름", adaptability: `${ELEMENT_META[element].label}계 공법에 집중`,
    };
  }
  if (count === 2) {
    const relationship = dualRelationship(ordered, evidence);
    return { ...base, displayName: `${labelElements(ordered)} 이영근 — ${relationship}`, relationship, cultivationSpeed: "빠름~보통", adaptability: "두 속성 연계 공법에 유리" };
  }
  if (count === 3) {
    const relationship = isGeneratingTriple(ordered) ? "순생 삼영근" : "혼합 삼영근";
    return { ...base, displayName: `${labelElements(ordered)} ${relationship}`, relationship, cultivationSpeed: relationship.startsWith("순생") ? "보통 이상" : "보통", adaptability: "복합 공법 운용 가능" };
  }
  if (count === 4) {
    const missingElement = ELEMENTS.find((element) => !effective.includes(element))!;
    return {
      ...base, missingElement, displayName: `사영근 — ${ELEMENT_META[missingElement].label} 결핍`,
      cultivationSpeed: "느림", adaptability: "넓음",
    };
  }

  const scores = ELEMENTS.map((element) => evidence[element].score);
  const spread = Math.max(...scores) - Math.min(...scores);
  const severeConflict = relations.clashes.length + relations.punishments.length >= 3;
  const cycleSupport = relations.combinations.length + relations.directionalCombinations.length + relations.stemCombinations.length > 0;
  const hunyuan = spread <= SPIRITUAL_ROOT_RULES.thresholds.hunyuanSpread && !severeConflict && cycleSupport;
  const balanced = spread <= SPIRITUAL_ROOT_RULES.thresholds.fiveBalanceSpread && !severeConflict;
  const displayName = hunyuan ? "혼원오행영근" : balanced ? "오행균형영근" : "오행잡영근";
  return { ...base, displayName, cultivationSpeed: "초반은 느리나 후반 확장성이 큼", adaptability: hunyuan ? "오행공법과 매우 높은 궁합" : "대부분의 오행공법에 적응" };
}

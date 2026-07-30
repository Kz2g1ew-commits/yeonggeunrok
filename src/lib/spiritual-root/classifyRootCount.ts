import type { BranchRelations, Element } from "@/types/bazi";
import type { ElementEvidence, MutationCandidate, RootClassification, RootCount, RootGrade } from "@/types/spiritualRoot";
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
  if (score >= grade.supremeMin && otherScores.every((value) => value < SPIRITUAL_ROOT_RULES.thresholds.independentStrength)) return "supreme";
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
  activeMutation?: MutationCandidate,
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
    return {
      ...base, displayName: `무영근 — ${subtype}`, cultivationSpeed: "기맥 개통 전에는 매우 느림", adaptability: "특수 체질·외부 기연 의존",
      qualityTier: "none", qualityRank: 7, qualityLabel: "미발현", rarityLabel: "희소 모드에서 일반적",
    };
  }
  if (count === 1) {
    const element = effective[0];
    const grade = singleGrade(evidence[element].score, ELEMENTS.filter((item) => item !== element).map((item) => evidence[item].score));
    return {
      ...base, grade, displayName: `${GRADE_LABEL[grade]} ${ELEMENT_META[element].label} 천영근`,
      cultivationSpeed: grade === "supreme" || grade === "high" ? "매우 빠름" : "빠름", adaptability: `${ELEMENT_META[element].label}계 공법에 집중`,
      qualityTier: "heavenly", qualityRank: 1, qualityLabel: "최상급", rarityLabel: "보유자 약 1~2%",
    };
  }
  if (count === 2) {
    const byScore = [...effective].sort((a, b) => evidence[b].score - evidence[a].score);
    const primaryScore = evidence[byScore[0]].score;
    const secondaryScore = evidence[byScore[1]].score;
    const purityGap = primaryScore - secondaryScore;
    const heavenly = primaryScore >= SPIRITUAL_ROOT_RULES.thresholds.heavenlyPrimaryMin &&
      secondaryScore <= SPIRITUAL_ROOT_RULES.thresholds.heavenlySecondaryMax &&
      purityGap >= SPIRITUAL_ROOT_RULES.thresholds.heavenlyPurityGap;
    if (heavenly) {
      const element = byScore[0];
      const grade = singleGrade(primaryScore, ELEMENTS.filter((item) => item !== element).map((item) => evidence[item].score));
      return {
        ...base, rootCount: "single", grade,
        displayName: `${GRADE_LABEL[grade]} ${ELEMENT_META[element].label} 천영근`,
        workingElements: [ELEMENT_META[element].label],
        relationship: `${ELEMENT_META[element].label} 기맥이 약한 부속 통로를 흡수한 고순도형`,
        cultivationSpeed: "매우 빠름", adaptability: `${ELEMENT_META[element].label}계 공법에 극도로 집중`,
        qualityTier: "heavenly", qualityRank: 1, qualityLabel: "최상급", rarityLabel: "보유자 약 1~2%",
      };
    }
    if (activeMutation?.status === "confirmed") {
      return {
        ...base, rootCount: "single", displayName: `${activeMutation.name} 변이영근`,
        workingElements: [activeMutation.name],
        relationship: `${activeMutation.sourceElements.map((element) => ELEMENT_META[element].label).join("·")} 완전 융합`,
        cultivationSpeed: "특수 공법에서 매우 빠름", adaptability: `${activeMutation.name}계 전용 공법에 특화`,
        qualityTier: "mutation", qualityRank: 2, qualityLabel: "특수 최상급", rarityLabel: "보유자 약 4~6%",
      };
    }
    const relationship = dualRelationship(ordered, evidence);
    const mutationSuffix = activeMutation?.status === "likely" ? ` · ${activeMutation.name}영근 유력` : "";
    return {
      ...base, displayName: `${labelElements(ordered)} 이영근 — ${relationship}${mutationSuffix}`, relationship,
      cultivationSpeed: "빠름", adaptability: "두 속성 연계 공법에 유리",
      qualityTier: "dual", qualityRank: 3, qualityLabel: "상급", rarityLabel: "보유자 약 10~14%",
    };
  }
  if (count === 3) {
    const relationship = isGeneratingTriple(ordered) ? "순생 삼영근" : "혼합 삼영근";
    return {
      ...base, displayName: `${labelElements(ordered)} ${relationship}`, relationship, cultivationSpeed: relationship.startsWith("순생") ? "보통 이상" : "보통", adaptability: "복합 공법 운용 가능",
      qualityTier: "triple", qualityRank: 4, qualityLabel: "중급", rarityLabel: "보유자 약 18~22%",
    };
  }
  if (count === 4) {
    const missingElement = ELEMENTS.find((element) => !effective.includes(element))!;
    return {
      ...base, missingElement, displayName: `사영근 — ${ELEMENT_META[missingElement].label} 결핍`,
      cultivationSpeed: "느림", adaptability: "넓음",
      qualityTier: "quadruple", qualityRank: 5, qualityLabel: "하급", rarityLabel: "보유자 약 26~30%",
    };
  }

  const scores = ELEMENTS.map((element) => evidence[element].score);
  const spread = Math.max(...scores) - Math.min(...scores);
  const severeConflict = relations.clashes.length + relations.punishments.length >= 3;
  const cycleSupport = relations.combinations.length + relations.directionalCombinations.length + relations.stemCombinations.length > 0;
  const hunyuan = spread <= SPIRITUAL_ROOT_RULES.thresholds.hunyuanSpread && !severeConflict && cycleSupport;
  const balanced = spread <= SPIRITUAL_ROOT_RULES.thresholds.fiveBalanceSpread && !severeConflict;
  const displayName = hunyuan ? "혼원오행영근" : balanced ? "오행균형영근" : "오행잡영근";
  return {
    ...base, displayName, cultivationSpeed: hunyuan ? "초반은 느리나 후반 잠재력이 큼" : "가장 느림",
    adaptability: hunyuan ? "오행공법과 매우 높은 궁합" : "대부분의 오행공법에 적응",
    qualityTier: "five", qualityRank: 6, qualityLabel: hunyuan ? "오영근 예외형" : "최하급", rarityLabel: hunyuan ? "극히 드문 오영근 예외" : "보유자 약 30~36%",
  };
}

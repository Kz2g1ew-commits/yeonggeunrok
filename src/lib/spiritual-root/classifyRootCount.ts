import type { BranchRelations, Element } from "@/types/bazi";
import type { ElementEvidence, FiveRootVariant, MutationCandidate, RootClassification, RootCount, RootGrade } from "@/types/spiritualRoot";
import { CONTROLS, ELEMENT_META, ELEMENTS, GENERATES } from "@/lib/bazi/elementMeta";
import { SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";
import { buildMultiRootProfile } from "./multiRootProfiles";

const GRADE_LABEL: Record<RootGrade, string> = { low: "하품", middle: "중품", high: "상품", supreme: "극품" };

const FIVE_QI_QUALITY: Record<FiveRootVariant, {
  qualityRank: number;
  qualityLabel: string;
  cultivationSpeed: string;
  rarityLabel: string;
}> = {
  "탁류": {
    qualityRank: 5,
    qualityLabel: "오기조원 위험형",
    cultivationSpeed: "초반이 매우 불안정하며 충극 정련이 필수",
    rarityLabel: "희귀 완전 순환·탁류형",
  },
  "편기": {
    qualityRank: 4,
    qualityLabel: "오기조원 중등형",
    cultivationSpeed: "초반은 느리며 편기를 다스리면 크게 상승",
    rarityLabel: "희귀 완전 순환·편기형",
  },
  "유통": {
    qualityRank: 3,
    qualityLabel: "오기조원 상등형",
    cultivationSpeed: "초반은 느리나 상생환이 자리 잡으면 매우 빠름",
    rarityLabel: "극히 드문 안정 순환형",
  },
  "원융": {
    qualityRank: 2,
    qualityLabel: "천영근 준급",
    cultivationSpeed: "초반은 느리나 주천 완성 후 천영근에 견줄 수 있음",
    rarityLabel: "극희귀 원융 순환형",
  },
};

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
    if (activeMutation?.status === "confirmed") {
      return {
        ...base, rootCount: "single", displayName: `${activeMutation.name} 변이영근`,
        workingElements: [activeMutation.name],
        relationship: `${activeMutation.sourceElements.map((element) => ELEMENT_META[element].label).join("·")} 완전 융합`,
        cultivationSpeed: "특수 공법에서 매우 빠름", adaptability: `${activeMutation.name}계 전용 공법에 특화`,
        qualityTier: "mutation", qualityRank: 2, qualityLabel: "특수 최상급", rarityLabel: "유연 표본 약 3~4%",
      };
    }
    const relationship = dualRelationship(ordered, evidence);
    const mutationSuffix = activeMutation?.status === "likely" ? ` · ${activeMutation.name} 변이영근 유력` : "";
    return {
      ...base, displayName: `${labelElements(ordered)} 이영근 — ${relationship}${mutationSuffix}`, relationship,
      cultivationSpeed: "빠름", adaptability: "두 속성 연계 공법에 유리",
      qualityTier: "dual", qualityRank: 3, qualityLabel: "상급", rarityLabel: "유연 표본 약 6~8%",
    };
  }
  if (count === 3) {
    const relationship = isGeneratingTriple(ordered) ? "순생 삼영근" : "혼합 삼영근";
    return {
      ...base, displayName: `${labelElements(ordered)} ${relationship}`, relationship, cultivationSpeed: relationship.startsWith("순생") ? "보통 이상" : "보통", adaptability: "복합 공법 운용 가능",
      qualityTier: "triple", qualityRank: 4, qualityLabel: "중급", rarityLabel: "유연 표본 약 23~28%",
    };
  }
  if (count === 4) {
    const missingElement = ELEMENTS.find((element) => !effective.includes(element))!;
    const multiRootProfile = buildMultiRootProfile(ordered, evidence, relations)!;
    return {
      ...base, missingElement, multiRootProfile,
      displayName: `사영근 — ${ELEMENT_META[missingElement].label} 결핍 · ${multiRootProfile.subtype}`,
      relationship: `${multiRootProfile.cycleLabel} · ${multiRootProfile.conflictLabel}`,
      cultivationSpeed: "느림", adaptability: `네 속성 공법에 넓게 적응 · ${multiRootProfile.subtype}`,
      qualityTier: "quadruple", qualityRank: 5, qualityLabel: "하급", rarityLabel: "유연 표본 약 34~40%",
    };
  }

  const multiRootProfile = buildMultiRootProfile(ordered, evidence, relations)!;
  const fiveQiCycle = multiRootProfile.subtype === "오기조원형";
  const balanced = multiRootProfile.scoreSpread <= SPIRITUAL_ROOT_RULES.thresholds.fiveBalanceSpread &&
    multiRootProfile.conflictLevel !== "turbulent";
  const baseName = fiveQiCycle ? "오기조원영근" : balanced ? "오행균형영근" : "오행잡영근";
  const subtypeLabel = fiveQiCycle && multiRootProfile.fiveRootVariant
    ? `${multiRootProfile.subtype}·${multiRootProfile.fiveRootVariant}`
    : multiRootProfile.subtype;
  const fiveQiQuality = fiveQiCycle
    ? FIVE_QI_QUALITY[multiRootProfile.fiveRootVariant ?? "유통"]
    : undefined;
  return {
    ...base, multiRootProfile, displayName: `${baseName} — ${subtypeLabel}`,
    relationship: `${multiRootProfile.cycleLabel} · ${multiRootProfile.conflictLabel}`,
    cultivationSpeed: fiveQiQuality?.cultivationSpeed ?? "가장 느림",
    adaptability: fiveQiCycle ? "완성된 상생환을 이용하는 오행공법에 높은 궁합" : `대부분의 오행공법에 적응 · ${multiRootProfile.subtype}`,
    qualityTier: "five", qualityRank: fiveQiQuality?.qualityRank ?? 6,
    qualityLabel: fiveQiQuality?.qualityLabel ?? "최하급",
    rarityLabel: fiveQiQuality?.rarityLabel ?? "유연 표본 약 24~30%",
  };
}

import type { BranchRelations, Element } from "@/types/bazi";
import type { ElementEvidence, MultiRootProfile, RootConflictLevel, RootCycleState } from "@/types/spiritualRoot";
import { ELEMENT_META, ELEMENTS, GENERATES, generatorOf } from "@/lib/bazi/elementMeta";
import { SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";

const ELEMENT_THEMES: Record<Element, string> = {
  wood: "생장·치유",
  fire: "발현·폭발",
  earth: "완충·방어",
  metal: "정련·결단",
  water: "순환·은폐",
};

function rounded(value: number): number {
  return Math.round(value * 10) / 10;
}

function conflictProfile(relations: BranchRelations): {
  count: number;
  level: RootConflictLevel;
  label: string;
} {
  const count = relations.clashes.length + relations.punishments.length +
    relations.harms.length + relations.breaks.length;
  const rules = SPIRITUAL_ROOT_RULES.multiRootProfiles;
  if (count >= rules.turbulentConflictMinimum) return { count, level: "turbulent", label: "충극 격동" };
  if (count >= rules.mixedConflictMinimum) return { count, level: "mixed", label: "생극 교차" };
  return { count, level: "stable", label: "기맥 안정" };
}

function actualGeneratingLinks(
  effective: Element[],
  evidence: Record<Element, ElementEvidence>,
): string[] {
  const effectiveSet = new Set(effective);
  return effective.flatMap((source) => {
    const target = GENERATES[source];
    if (!effectiveSet.has(target)) return [];
    const label = `${ELEMENT_META[source].label}생${ELEMENT_META[target].label}`;
    const targetEvidence = evidence[target];
    const connected = targetEvidence.supportScore > 0 ||
      targetEvidence.contributions.some((item) => item.label.includes(`${label} 유통`));
    return connected ? [label] : [];
  });
}

function cycleProfile(count: number, linkCount: number): { state: RootCycleState; label: string } {
  const rules = SPIRITUAL_ROOT_RULES.multiRootProfiles;
  if (count === 5 && linkCount === rules.completeCycleLinks) {
    return { state: "complete", label: "오기 상생환 완성" };
  }
  const strongMinimum = count === 4 ? rules.fourStrongFlowMinimum : rules.fiveStrongFlowMinimum;
  if (linkCount >= strongMinimum) return { state: "strong", label: "상생 연쇄가 뚜렷함" };
  if (linkCount >= 2) return { state: "partial", label: "상생 고리가 부분 연결" };
  return { state: "broken", label: "상생 고리가 분절됨" };
}

function formationSupport(evidence: Record<Element, ElementEvidence>, relations: BranchRelations): boolean {
  return relations.combinations.length + relations.directionalCombinations.length > 0 ||
    ELEMENTS.some((element) => evidence[element].combinations.includes("천간합화"));
}

function fourRootSubtype(
  spread: number,
  dominant: Element,
  cycleState: RootCycleState,
  conflictLevel: RootConflictLevel,
): string {
  const rules = SPIRITUAL_ROOT_RULES;
  if (conflictLevel === "turbulent") return "충극교차형";
  if (spread >= rules.multiRootProfiles.dominantSpread) return `${ELEMENT_META[dominant].label} 주근편중형`;
  if (spread <= rules.thresholds.fiveBalanceSpread && cycleState === "strong") return "균형순생형";
  if (spread <= rules.thresholds.fiveBalanceSpread) return "사상균형형";
  if (cycleState === "strong") return "순생연쇄형";
  return "다맥병립형";
}

function fiveRootSubtype(
  spread: number,
  dominant: Element,
  cycleState: RootCycleState,
  conflictLevel: RootConflictLevel,
  supportedByFormation: boolean,
): string {
  const rules = SPIRITUAL_ROOT_RULES;
  if (cycleState === "complete" && spread <= rules.thresholds.hunyuanSpread &&
      conflictLevel === "stable" && supportedByFormation) return "오기조원형";
  if (spread <= rules.thresholds.fiveBalanceSpread && conflictLevel !== "turbulent") {
    return cycleState === "complete" || cycleState === "strong" ? "오행원융형" : "정적균형형";
  }
  if (conflictLevel === "turbulent") return "충극혼탁형";
  if (spread >= rules.multiRootProfiles.dominantSpread) return `${ELEMENT_META[dominant].label} 편기주도형`;
  if (cycleState === "complete" || cycleState === "strong") return "순환편중형";
  return "다맥혼재형";
}

export function buildMultiRootProfile(
  effective: Element[],
  evidence: Record<Element, ElementEvidence>,
  relations: BranchRelations,
): MultiRootProfile | undefined {
  if (effective.length !== 4 && effective.length !== 5) return undefined;

  const ranked = [...effective].sort((a, b) =>
    evidence[b].score - evidence[a].score || ELEMENTS.indexOf(a) - ELEMENTS.indexOf(b));
  const dominantElement = ranked[0];
  const weakestElement = ranked.at(-1)!;
  const scoreSpread = rounded(evidence[dominantElement].score - evidence[weakestElement].score);
  const generatingLinks = actualGeneratingLinks(effective, evidence);
  const cycle = cycleProfile(effective.length, generatingLinks.length);
  const conflict = conflictProfile(relations);
  const supportedByFormation = formationSupport(evidence, relations);
  const subtype = effective.length === 4
    ? fourRootSubtype(scoreSpread, dominantElement, cycle.state, conflict.level)
    : fiveRootSubtype(scoreSpread, dominantElement, cycle.state, conflict.level, supportedByFormation);
  const missingElement = effective.length === 4
    ? ELEMENTS.find((element) => !effective.includes(element))
    : undefined;
  const preserveAllRoots = effective.length === 5 &&
    (SPIRITUAL_ROOT_RULES.multiRootProfiles.preserveAllFiveSubtypes as readonly string[]).includes(subtype);
  const refinementPath = missingElement
    ? `${ELEMENT_META[missingElement].label} 결핍은 내적 개맥 없이 유지하고, 필요한 속성은 법보·진법으로만 빌립니다. ${ELEMENT_META[weakestElement].label} 약근을 먼저 봉근·세맥해 ${ELEMENT_META[dominantElement].label} 주근 중심의 삼영근으로 정련하는 길이 알맞습니다.`
    : preserveAllRoots
      ? subtype === "오기조원형"
        ? "다섯 기맥을 잘라내지 않고 보전하며, 완성된 오기 상생환을 합국과 통관으로 굳히는 혼원 수련이 알맞습니다."
        : "다섯 기맥을 모두 보전하되 어느 한 기맥도 과성하지 않게 편차를 좁혀, 오행균형에서 오기조원으로 나아가는 길이 알맞습니다."
      : `${ELEMENT_META[weakestElement].label} 약근을 첫 봉근 대상으로 삼고 ${ELEMENT_META[dominantElement].label} 주근을 정련합니다. 오영근에서 사영근·삼영근으로 기맥 수를 줄여 영기 분산을 낮추는 길이 알맞습니다.`;

  const strengths = [
    `${ELEMENT_META[dominantElement].label} 기맥이 ${evidence[dominantElement].score.toFixed(1)}점으로 운용의 중심을 이룸`,
    generatingLinks.length > 0
      ? `${generatingLinks.join("·")} ${generatingLinks.length}개 상생 고리가 실제 생조를 전달함`
      : "여러 기맥이 독립적으로 병립해 공법 선택 폭이 넓음",
  ];
  const cautions = [
    conflict.level === "stable"
      ? "충극 손상은 적지만 여러 속성을 함께 축적해야 해 수련 자원 소모가 큼"
      : `${conflict.label} ${conflict.count}건으로 속성 전환 때 기맥 역류를 주의해야 함`,
  ];

  if (missingElement) {
    const source = generatorOf(missingElement);
    const target = GENERATES[missingElement];
    cautions.unshift(`${ELEMENT_META[missingElement].label} 결핍으로 ${ELEMENT_META[source].label}생${ELEMENT_META[missingElement].label}·${ELEMENT_META[missingElement].label}생${ELEMENT_META[target].label} 고리가 비어 ${ELEMENT_THEMES[missingElement]} 계통의 직접 운용 폭이 좁음 — 결핍 자체는 새 영근을 깨울 대상이 아님`);
  } else if (cycle.state === "complete") {
    strengths.push("목→화→토→금→수→목의 오기 순환이 끊기지 않음");
  } else {
    cautions.unshift(`다섯 오행은 모두 유효하지만 ${5 - generatingLinks.length}개 상생 고리가 실질 유통에 이르지 못함`);
  }

  if (preserveAllRoots) {
    cautions.push("전 오행 보존형은 한 기맥의 과성이나 충손이 전체 균형을 깨뜨리지 않게 해야 함");
  } else {
    cautions.push(`${ELEMENT_META[weakestElement].label} 기맥이 우선 정련 후보이며, 잠재근을 추가 각성하면 주근 순도가 더 낮아질 수 있음`);
  }

  const summary = effective.length === 4
    ? `${ELEMENT_META[missingElement!].label} 기맥이 비어 있으나 ${ELEMENT_META[dominantElement].label}을 중심으로 ${cycle.label} 상태를 보이는 사영근입니다.`
    : `${ELEMENT_META[dominantElement].label} 기맥을 중심으로 ${cycle.label} 상태이며, 점수 편차 ${scoreSpread.toFixed(1)}의 ${subtype} 오영근입니다.`;

  return {
    subtype,
    dominantElement,
    weakestElement,
    preserveAllRoots,
    refinementPath,
    scoreSpread,
    generatingLinks,
    cycleState: cycle.state,
    cycleLabel: cycle.label,
    conflictCount: conflict.count,
    conflictLevel: conflict.level,
    conflictLabel: conflict.label,
    formationSupport: supportedByFormation,
    summary,
    strengths,
    cautions,
  };
}

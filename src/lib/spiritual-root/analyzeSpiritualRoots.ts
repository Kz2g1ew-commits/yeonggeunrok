import type { BirthInput, Element, FourPillarsCalculation } from "@/types/bazi";
import type { AnalysisBundle, AnalysisContext } from "@/types/spiritualRoot";
import { analyzeRelations } from "@/lib/bazi/relations";
import { detectShensha } from "@/lib/bazi/shensha";
import { ELEMENT_META } from "@/lib/bazi/elementMeta";
import { seasonFromMonthBranch } from "@/lib/calendar/solarTerms";
import { calculateElementScores } from "./calculateElementScores";
import { determineEffectiveRoots } from "./determineEffectiveRoots";
import { classifyRootCount } from "./classifyRootCount";
import { detectMutationRoots } from "./detectMutationRoots";
import { calculateConfidence } from "./calculateConfidence";
import { generateExplanation } from "./generateExplanation";
import { awakeningSeed, determineAwakening } from "./determineAwakening";
import { determineRootQuality } from "./determineRootQuality";

const PATHS: Record<Element, string[]> = {
  wood: ["목계 생장공", "치유·진법", "풍계 신법"],
  fire: ["화계 연화공", "연단술", "폭발형 술법"],
  earth: ["토계 호체공", "진법·결계", "중력술"],
  metal: ["검계 공법", "금계 강화술", "비검술"],
  water: ["수계 유전공", "빙계 술법", "환술"],
};

const WEAPONS: Record<Element, string> = {
  wood: "법장 또는 목령 비수", fire: "화문 부채", earth: "중검 또는 방패",
  metal: "비검", water: "유수검 또는 영주",
};

const TECHNIQUES: Record<Element, string> = {
  wood: "속박·회복술", fire: "화염 방출술", earth: "결계·호체술", metal: "검기·절단술", water: "유전·은신술",
};

function distinct<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function analyzeSpiritualRoots(input: BirthInput, calculation: FourPillarsCalculation): AnalysisBundle {
  const relations = analyzeRelations(calculation.pillars);
  const seed = awakeningSeed(input, calculation);
  const awakening = determineAwakening(input.judgmentMode, seed);
  const qualityDistribution = awakening.passed ? determineRootQuality(seed) : undefined;
  const rawEvidence = calculateElementScores(calculation.pillars);
  const roots = determineEffectiveRoots(rawEvidence, awakening.passed, qualityDistribution);
  const evidence = roots.evidence;
  const shensha = detectShensha(calculation.pillars, input.shensha);
  const context: AnalysisContext = {
    pillars: calculation.pillars,
    evidence,
    relations,
    shensha,
    season: seasonFromMonthBranch(calculation.pillars.month.branch),
  };
  let mutations = detectMutationRoots(context);
  if (qualityDistribution?.targetTier === "mutation") {
    const promotableIndex = mutations.findIndex((candidate) => candidate.status === "confirmed" || candidate.status === "likely");
    if (promotableIndex >= 0 && mutations[promotableIndex].status === "likely") {
      mutations = mutations.map((candidate, index) => index === promotableIndex ? {
        ...candidate,
        status: "confirmed" as const,
        confidence: Math.max(85, candidate.confidence),
        satisfiedConditions: [...candidate.satisfiedConditions, "희귀 순도 배분값이 최종 융합을 안정시킴"],
      } : candidate);
    }
  } else {
    mutations = mutations.map((candidate) => candidate.status === "confirmed" ? {
      ...candidate,
      status: "likely" as const,
      confidence: Math.min(84, candidate.confidence),
      missingConditions: [...candidate.missingConditions, "이번 순도 배분값은 완전 융합을 지지하지 않음"],
    } : candidate);
  }
  const activeMutation = qualityDistribution?.targetTier === "mutation"
    ? mutations.find((candidate) => candidate.status === "confirmed")
    : undefined;
  const likelyMutation = mutations.find((candidate) => candidate.status === "likely");
  const classification = classifyRootCount(
    roots.effective,
    roots.potential,
    evidence,
    relations,
    activeMutation ?? (qualityDistribution?.targetTier === "dual" ? likelyMutation : undefined),
  );
  if (!awakening.passed) {
    classification.displayName = "무영근 — 쇄맥무근";
    classification.adaptability = "외부 기연이나 특수 개맥법에 의존";
  }

  const conflictCount = relations.clashes.length + relations.punishments.length + relations.harms.length + relations.breaks.length;
  const resolvedEffective = classification.qualityTier === "heavenly" && roots.effective.length > 1
    ? [[...roots.effective].sort((a, b) => evidence[b].score - evidence[a].score)[0]]
    : roots.effective;
  const absorbedElements = classification.qualityTier === "heavenly"
    ? roots.effective.filter((element) => !resolvedEffective.includes(element))
    : [];
  const resolvedPotential = distinct([...roots.potential, ...absorbedElements]);
  const resolvedEvidence = Object.fromEntries(Object.entries(evidence).map(([element, item]) => [
    element,
    absorbedElements.includes(element as Element) ? { ...item, effective: false, potential: true } : item,
  ])) as typeof evidence;
  const confidence = calculateConfidence(input, calculation, resolvedEvidence, mutations, conflictCount);
  const primary = resolvedEffective.length ? resolvedEffective : resolvedPotential.slice(0, 1);
  const strongest = primary[0];
  const weakestEffective = resolvedEffective.at(-1);
  const presentShensha = shensha.filter((item) => item.present);
  const strengths = [
    strongest ? `${ELEMENT_META[strongest].label} 기맥이 가장 선명함` : "외부 기연에 따라 여러 방향으로 개통 가능",
    classification.relationship?.includes("순생") ? "상생 흐름이 연속됨" : classification.adaptability,
    ...presentShensha.flatMap((item) => item.traits.slice(0, 2)),
  ];
  const weaknesses = [
    classification.missingElement ? `${ELEMENT_META[classification.missingElement].label} 속성 결핍` : "상극 속성 간 균형 관리 필요",
    conflictCount > 0 ? `충·형·파·해 ${conflictCount}건으로 기맥 변동성 존재` : "변화 대응력이 낮아질 수 있음",
    resolvedPotential.length ? `${resolvedPotential.map((element) => ELEMENT_META[element].label).join("·")} 잠재근의 불안정성` : "과도한 단일 속성 운용 주의",
  ];
  const recommendedPaths = distinct(primary.flatMap((element) => PATHS[element])).slice(0, 5);
  const risks = [
    weakestEffective ? `${ELEMENT_META[weakestEffective].label} 기맥 과부하` : "무리한 강제 개맥",
    presentShensha.some((item) => item.id === "guimen") ? "정신계 술법 사용 시 주화입마 위험 증가" : "상극 공법 동시 운용 시 기혈 역류",
  ];

  let displayName = classification.displayName;
  if (confidence.confidence < 55 && likelyMutation) {
    displayName = `${classification.displayName}과 ${likelyMutation.name} 변이영근의 경계`;
  }

  return {
    relations,
    shensha,
    result: {
      rootCount: classification.rootCount,
      displayName,
      primaryElements: resolvedEffective,
      potentialElements: resolvedPotential,
      grade: classification.grade,
      relationship: classification.relationship,
      mutations,
      confidence: confidence.confidence,
      confidenceLabel: confidence.label,
      confidenceBreakdown: confidence.breakdown,
      elementEvidence: resolvedEvidence,
      strengths: distinct(strengths),
      weaknesses: distinct(weaknesses),
      recommendedPaths,
      recommendedWeapons: distinct(primary.map((element) => WEAPONS[element])).slice(0, 3),
      recommendedTechniques: distinct(primary.map((element) => TECHNIQUES[element])).slice(0, 4),
      risks,
      growthDirection: resolvedPotential.length
        ? `${resolvedPotential.map((element) => ELEMENT_META[element].label).join("·")} 잠재근을 보조하되 주영근의 순도를 해치지 않는 방향`
        : "주영근의 통근을 강화하고 상극 기운을 완충하는 방향",
      explanations: generateExplanation(resolvedEvidence),
      disclaimer: "이 결과는 전통 명리학의 간지·오행 구조를 바탕으로 만든 선협 세계관용 창작 판정입니다.",
      classification,
      awakening,
      qualityDistribution,
    },
  };
}

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
import { determineAwakening } from "./determineAwakening";
import { calculateDaoAffinity } from "./calculateDaoAffinity";
import { synthesizeCultivationTalent } from "./synthesizeCultivationTalent";

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
  const rawEvidence = calculateElementScores(calculation.pillars);
  const dao = calculateDaoAffinity(calculation.pillars, rawEvidence, relations);
  const awakening = determineAwakening(input.judgmentMode, rawEvidence, dao);
  const roots = determineEffectiveRoots(rawEvidence, awakening.passed);
  const evidence = roots.evidence;
  const shensha = detectShensha(calculation.pillars, input.shensha);
  const context: AnalysisContext = {
    pillars: calculation.pillars,
    evidence,
    relations,
    shensha,
    season: seasonFromMonthBranch(calculation.pillars.month.branch),
  };
  const mutations = detectMutationRoots(context);
  const activeMutation = mutations.find((candidate) => candidate.status === "confirmed");
  const likelyMutation = mutations.find((candidate) => candidate.status === "likely");
  const classification = classifyRootCount(
    roots.effective,
    roots.potential,
    evidence,
    relations,
    activeMutation ?? likelyMutation,
  );
  const talentProfile = synthesizeCultivationTalent(classification, evidence, shensha, awakening, relations);

  const conflictCount = relations.clashes.length + relations.punishments.length + relations.harms.length + relations.breaks.length;
  const resolvedEffective = roots.effective;
  const resolvedPotential = roots.potential;
  const resolvedEvidence = evidence;
  const confidence = calculateConfidence(input, calculation, resolvedEvidence, mutations, conflictCount, awakening);
  const primary = resolvedEffective.length ? resolvedEffective : resolvedPotential.slice(0, 1);
  const strongest = primary[0];
  const weakestEffective = resolvedEffective.at(-1);
  const presentShensha = shensha.filter((item) => item.present);
  const multiRootProfile = classification.multiRootProfile;
  const strengths = [
    strongest ? `${ELEMENT_META[strongest].label} 기맥이 가장 선명함` : "외부 기연에 따라 여러 방향으로 개통 가능",
    classification.relationship?.includes("순생") ? "상생 흐름이 연속됨" : classification.adaptability,
    ...(multiRootProfile?.strengths ?? []),
    ...presentShensha.flatMap((item) => item.traits.slice(0, 2)),
    ...talentProfile.specialEffects.slice(0, 2).map((effect) => `${effect.name} 성향`),
  ];
  const weaknesses = [
    classification.missingElement ? `${ELEMENT_META[classification.missingElement].label} 속성 결핍` : "상극 속성 간 균형 관리 필요",
    conflictCount > 0 ? `충·형·파·해 ${conflictCount}건으로 기맥 변동성 존재` : "변화 대응력이 낮아질 수 있음",
    ...(multiRootProfile?.cautions ?? [resolvedPotential.length
      ? `${resolvedPotential.map((element) => ELEMENT_META[element].label).join("·")} 잠재근의 불안정성`
      : "과도한 단일 속성 운용 주의"]),
  ];
  const recommendedPaths = distinct([
    ...primary.flatMap((element) => PATHS[element]).slice(0, 4),
    ...presentShensha.flatMap((item) => item.paths),
  ]).slice(0, 7);
  const risks = [
    weakestEffective ? `${ELEMENT_META[weakestEffective].label} 기맥 과부하` : "무리한 강제 개맥",
    presentShensha.some((item) => item.id === "guimen") ? "정신계 술법 사용 시 주화입마 위험 증가" : "상극 공법 동시 운용 시 기혈 역류",
    ...presentShensha.flatMap((item) => item.risks),
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
      recommendedWeapons: distinct([
        ...primary.map((element) => WEAPONS[element]),
        ...presentShensha.flatMap((item) => item.weapons),
      ]).slice(0, 5),
      recommendedTechniques: distinct([
        ...primary.map((element) => TECHNIQUES[element]),
        ...presentShensha.flatMap((item) => item.techniques),
      ]).slice(0, 7),
      risks: distinct(risks),
      growthDirection: multiRootProfile
        ? classification.missingElement
          ? `${ELEMENT_META[classification.missingElement].label} 결핍을 법보·진법으로 보완하고 ${multiRootProfile.generatingLinks.join("·") || "독립 기맥"}의 안정성을 높이는 방향`
          : multiRootProfile.cycleState === "complete"
            ? "다섯 기맥의 동시 축적을 유지하며 완성된 상생환을 합국·통관으로 굳히는 방향"
            : `미성립한 ${5 - multiRootProfile.generatingLinks.length}개 상생 고리를 보완해 오행 순환을 완성하는 방향`
        : resolvedPotential.length
          ? `${resolvedPotential.map((element) => ELEMENT_META[element].label).join("·")} 잠재근을 보조하되 주영근의 순도를 해치지 않는 방향`
          : "주영근의 통근을 강화하고 상극 기운을 완충하는 방향",
      explanations: generateExplanation(resolvedEvidence),
      disclaimer: "이 결과는 전통 명리학의 간지·오행 구조를 바탕으로 만든 선협 세계관용 창작 판정입니다.",
      classification,
      awakening,
      talentProfile,
    },
  };
}

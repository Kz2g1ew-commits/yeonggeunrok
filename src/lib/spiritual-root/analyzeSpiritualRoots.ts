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
import { generateCultivationDirection } from "./generateCultivationDirection";

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
  const awakening = determineAwakening(input.judgmentMode, calculation.pillars, rawEvidence, dao);
  const shensha = detectShensha(calculation.pillars, input.shensha);
  const makeContext = (evidence: AnalysisContext["evidence"]): AnalysisContext => ({
    pillars: calculation.pillars,
    evidence,
    relations,
    shensha,
    season: seasonFromMonthBranch(calculation.pillars.month.branch),
  });
  // 발현 관문과 무관한 선천 기맥 구조를 먼저 보존한다. 균형·엄격 관문은
  // 실제 영근 개방만 막을 뿐, 근골의 선천 잠재치까지 지우지 않는다.
  const innateRoots = determineEffectiveRoots(rawEvidence, true);
  const innateMutations = detectMutationRoots(makeContext(innateRoots.evidence));
  const innateMutation = innateMutations.find((candidate) => candidate.status === "confirmed") ??
    innateMutations.find((candidate) => candidate.status === "likely");
  const innateClassification = classifyRootCount(
    innateRoots.effective,
    innateRoots.potential,
    innateRoots.evidence,
    relations,
    innateMutation,
  );
  const roots = awakening.passed ? innateRoots : determineEffectiveRoots(rawEvidence, false);
  const evidence = roots.evidence;
  const mutations = awakening.passed ? innateMutations : detectMutationRoots(makeContext(evidence));
  const activeMutation = mutations.find((candidate) => candidate.status === "confirmed");
  const likelyMutation = mutations.find((candidate) => candidate.status === "likely");
  const classification = awakening.passed ? innateClassification : classifyRootCount(
      roots.effective,
      roots.potential,
      evidence,
      relations,
      activeMutation ?? likelyMutation,
    );
  const talentProfile = synthesizeCultivationTalent(
    classification,
    evidence,
    shensha,
    awakening,
    relations,
    { classification: innateClassification, evidence: innateRoots.evidence },
  );

  const conflictCount = relations.clashes.length + relations.punishments.length + relations.harms.length + relations.breaks.length;
  const resolvedEffective = roots.effective;
  const resolvedPotential = roots.potential;
  const resolvedEvidence = evidence;
  const confidence = calculateConfidence(input, calculation, resolvedEvidence, mutations, conflictCount, awakening);
  const primary = resolvedEffective.length ? resolvedEffective : resolvedPotential.slice(0, 1);
  const strongest = primary[0];
  const weakestEffective = resolvedEffective.at(-1);
  const presentShensha = shensha.filter((item) => item.present);
  const effectiveShensha = shensha.filter((item) => item.effective);
  const multiRootProfile = classification.multiRootProfile;
  const strengths = [
    strongest ? `${ELEMENT_META[strongest].label} 기맥이 가장 선명함` : "외부 기연에 따라 여러 방향으로 개통 가능",
    classification.relationship?.includes("순생") ? "상생 흐름이 연속됨" : classification.adaptability,
    ...(multiRootProfile?.strengths ?? []),
    ...effectiveShensha.flatMap((item) => item.traits.slice(0, 2)),
    ...talentProfile.specialEffects.slice(0, 2).map((effect) => `${effect.name} 성향`),
  ];
  const weaknesses = [
    classification.missingElement
      ? `${ELEMENT_META[classification.missingElement].label} 계통 공법의 직접 운용 폭이 좁음 — 내적 개맥 대상은 아님`
      : multiRootProfile?.preserveAllRoots
        ? "한 기맥의 과성으로 전 오행 균형이 무너질 수 있음"
        : resolvedEffective.length >= 3
          ? "다중 기맥에 영기와 수련 자원이 분산됨"
          : "상극 속성 간 균형 관리 필요",
    conflictCount > 0 ? `충·형·파·해 ${conflictCount}건으로 기맥 변동성 존재` : "변화 대응력이 낮아질 수 있음",
    ...(multiRootProfile?.cautions ?? [resolvedPotential.length
      ? `${resolvedPotential.map((element) => ELEMENT_META[element].label).join("·")} 잠재근 각성 시 주근 순도 저하`
      : "과도한 단일 속성 운용 주의"]),
    ...presentShensha.filter((item) => item.damage.length > 0).map((item) => `${item.name}이 ${item.damage.join("·")}으로 ${item.status === "damaged" ? "손상됨" : "격동함"}`),
  ];
  const recommendedPaths = distinct([
    ...primary.flatMap((element) => PATHS[element]).slice(0, 4),
    ...effectiveShensha.flatMap((item) => item.paths),
  ]).slice(0, 7);
  const risks = [
    weakestEffective ? `${ELEMENT_META[weakestEffective].label} 기맥 과부하` : "무리한 강제 개맥",
    effectiveShensha.some((item) => item.id === "guimen") ? "정신계 술법 사용 시 주화입마 위험 증가" : "상극 공법 동시 운용 시 기혈 역류",
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
        ...effectiveShensha.flatMap((item) => item.weapons),
      ]).slice(0, 5),
      recommendedTechniques: distinct([
        ...primary.map((element) => TECHNIQUES[element]),
        ...effectiveShensha.flatMap((item) => item.techniques),
      ]).slice(0, 7),
      risks: distinct(risks),
      growthDirection: generateCultivationDirection(
        classification,
        resolvedEffective,
        resolvedPotential,
        activeMutation ?? likelyMutation,
      ),
      explanations: generateExplanation(resolvedEvidence),
      classification,
      awakening,
      talentProfile,
    },
  };
}

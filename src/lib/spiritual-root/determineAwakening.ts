import type { Element, FourPillars, RootJudgmentMode } from "@/types/bazi";
import type { AwakeningCondition, AwakeningResult, DaoAffinityResult, ElementEvidence } from "@/types/spiritualRoot";
import { ELEMENT_META, ELEMENTS } from "@/lib/bazi/elementMeta";
import { calculatePreHeavenQi, PRE_HEAVEN_QI_RULES } from "@/lib/bazi/preHeavenQi";
import { SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";

export function determineAwakening(
  mode: RootJudgmentMode,
  pillars: FourPillars,
  evidence: Record<Element, ElementEvidence>,
  dao: DaoAffinityResult,
): AwakeningResult {
  const populationRate = SPIRITUAL_ROOT_RULES.awakening.populationRates[mode];
  const completeChannels = ELEMENTS.filter((element) => evidence[element].channel.complete)
    .sort((a, b) => evidence[b].channel.completion - evidence[a].channel.completion);
  const potentialChannels = ELEMENTS.filter((element) => !evidence[element].channel.complete && evidence[element].channel.potential)
    .sort((a, b) => evidence[b].channel.completion - evidence[a].channel.completion);
  const preHeaven = calculatePreHeavenQi(pillars);
  const structuralCondition: AwakeningCondition = {
    id: "complete-channel",
    label: "완성된 오행 기맥이 하나 이상 존재",
    met: completeChannels.length > 0,
  };
  const balancedConditions: AwakeningCondition[] = [
    structuralCondition,
    { id: "taiyuan-taixi-flow", label: "태원에서 태식으로 납음이 동기 또는 순생", met: preHeaven.flowFromTaiYuan },
    { id: "taixi-minggong-flow", label: "태식에서 명궁으로 납음이 동기 또는 순생", met: preHeaven.flowIntoMingGong },
    { id: "no-adjacent-clash", label: "태원→태식→명궁의 인접 흐름에 직접 충이 없음", met: !preHeaven.adjacentClash },
  ];
  const strictConditions: AwakeningCondition[] = [
    ...balancedConditions,
    { id: "connected-resonance", label: "세 보조축이 합 또는 동기로 하나의 연결망을 이룸", met: preHeaven.connectedResonance },
    { id: "true-bond", label: "천간합 또는 지지육합이 최소 하나 존재", met: preHeaven.trueBondCount >= PRE_HEAVEN_QI_RULES.strictMinimumTrueBonds },
    { id: "no-disruption", label: "삼원 전체에 충·해·파의 파손이 없음", met: preHeaven.disruptionCount <= PRE_HEAVEN_QI_RULES.strictMaximumDisruptions },
  ];
  const conditions = mode === "generous" ? [structuralCondition] : mode === "balanced" ? balancedConditions : strictConditions;
  const passed = conditions.every((condition) => condition.met);
  const modeLabel = mode === "generous" ? "유연 판정" : mode === "balanced" ? "균형 판정" : "엄격 판정";
  const strongest = completeChannels[0];
  const strongestLabel = strongest ? `${ELEMENT_META[strongest].label} 기맥` : "완성 기맥";
  const missing = conditions.filter((condition) => !condition.met).map((condition) => condition.label);
  const label = mode === "generous"
    ? `${modeLabel} · 영근 ${passed ? "발현" : "미발현"}`
    : mode === "balanced"
      ? `${modeLabel} · 선천 기감 ${passed ? "개방" : "미개"}`
      : `${modeLabel} · 선천일기 ${passed ? "응결" : "미응결"}`;

  return {
    mode,
    passed,
    populationRate,
    label,
    explanation: !completeChannels.length
      ? "어느 오행도 천문·지근·인맥의 세 관문을 모두 잇지 못해 잠재 통로로 남았습니다."
      : mode === "generous"
        ? `${strongestLabel}이 천·지·인 삼관을 연결하여 영근 보유 전제에서 발현했습니다.`
        : passed
          ? mode === "balanced"
            ? `${strongestLabel}의 구조를 유지한 채 태원에서 태식과 명궁으로 납음이 이어져 선천 기감이 개방됐습니다.`
            : `${strongestLabel}의 구조 위에서 태원·태식·명궁이 결속되고 파손 없이 이어져 선천일기가 응결했습니다.`
          : `완성 기맥은 있으나 ${missing.join(" · ")} 조건이 남아 ${modeLabel}의 발현 관문을 통과하지 못했습니다.`,
    completeChannels,
    potentialChannels,
    conditions,
    preHeaven,
    dao,
  };
}

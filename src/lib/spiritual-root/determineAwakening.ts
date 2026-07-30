import type { Element, RootJudgmentMode } from "@/types/bazi";
import type { AwakeningResult, DaoAffinityResult, ElementEvidence } from "@/types/spiritualRoot";
import { ELEMENT_META, ELEMENTS } from "@/lib/bazi/elementMeta";
import { SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";

export function determineAwakening(
  mode: RootJudgmentMode,
  evidence: Record<Element, ElementEvidence>,
  dao: DaoAffinityResult,
): AwakeningResult {
  const populationRate = SPIRITUAL_ROOT_RULES.awakening.populationRates[mode];
  const threshold = SPIRITUAL_ROOT_RULES.awakening.apertureThresholds[mode];
  const completeChannels = ELEMENTS.filter((element) => evidence[element].channel.complete)
    .sort((a, b) => evidence[b].channel.completion - evidence[a].channel.completion);
  const potentialChannels = ELEMENTS.filter((element) => !evidence[element].channel.complete && evidence[element].channel.potential)
    .sort((a, b) => evidence[b].channel.completion - evidence[a].channel.completion);
  const apertureScore = completeChannels.length ? evidence[completeChannels[0]].channel.completion : 0;
  const passed = completeChannels.length > 0 && (mode === "generous" || apertureScore >= threshold);
  const modeLabel = mode === "generous" ? "유연 판정" : mode === "balanced" ? "균형 판정" : "엄격 판정";
  const strongest = completeChannels[0];
  const strongestLabel = strongest ? `${ELEMENT_META[strongest].label} 기맥` : "완성 기맥";

  return {
    mode,
    passed,
    threshold,
    apertureScore,
    populationRate,
    label: `${modeLabel} · 영근 ${passed ? "발현" : "미발현"}`,
    explanation: !completeChannels.length
      ? "어느 오행도 천문·지근·인맥의 세 관문을 모두 잇지 못해 잠재 통로로 남았습니다."
      : mode === "generous"
        ? `${strongestLabel}이 천·지·인 삼관을 연결하여 영근 보유 전제에서 발현했습니다.`
        : passed
          ? `${strongestLabel} 완성도 ${apertureScore.toFixed(1)}가 ${modeLabel}의 영규 관문을 통과했습니다.`
          : `완성된 기맥은 있으나 최고 완성도 ${apertureScore.toFixed(1)}가 ${modeLabel}의 영규 관문에 미치지 못했습니다.`,
    completeChannels,
    potentialChannels,
    dao,
  };
}

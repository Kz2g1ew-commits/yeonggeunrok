import type { BirthInput, FourPillarsCalculation, RootJudgmentMode } from "@/types/bazi";
import type { AwakeningResult, DaoAffinityResult } from "@/types/spiritualRoot";
import { SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";

/** FNV-1a 32-bit. 서버나 난수 없이 동일 입력에 동일한 세계관 판정을 만든다. */
export function stableSpiritualRootRoll(seed: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) % SPIRITUAL_ROOT_RULES.awakening.rollScale;
}

export function awakeningSeed(input: BirthInput, calculation: FourPillarsCalculation): string {
  const pillars = Object.values(calculation.pillars).map((pillar) => `${pillar.stem}${pillar.branch}`).join("|");
  return [calculation.correction.normalizedISO, input.timezone, input.city, pillars].join("::");
}

export function determineAwakening(
  mode: RootJudgmentMode,
  dao: DaoAffinityResult,
): AwakeningResult {
  const populationRate = SPIRITUAL_ROOT_RULES.awakening.populationRates[mode];
  const threshold = SPIRITUAL_ROOT_RULES.awakening.daoThresholds[mode];
  const passed = mode === "generous" || dao.score >= threshold;
  const modeLabel = mode === "generous" ? "유연 판정" : mode === "balanced" ? "균형 판정" : "엄격 판정";

  return {
    mode,
    passed,
    roll: dao.tieBreaker,
    threshold,
    populationRate,
    label: mode === "generous" ? modeLabel : `${modeLabel} · 영근 ${passed ? "발현" : "미발현"}`,
    explanation: mode === "generous"
      ? "체험의 재미를 위해 영기 통로가 하나 이상 열린다는 전제로 판정합니다."
      : mode === "balanced"
        ? passed
          ? `${dao.path === "natural" ? "순천" : "역천"}도맥이 균형 관문의 명리 구조 기준을 충족했습니다.`
          : "순천·역천도맥 점수가 균형 관문에 미치지 못해 오행 통로가 잠재 상태로 남았습니다."
      : passed
        ? `${dao.path === "natural" ? "순천" : "역천"}도맥이 엄격 관문의 극희귀 구조 기준을 충족했습니다.`
        : "순천·역천도맥 점수가 엄격 관문에 미치지 못해 오행 통로가 잠재 상태로 남았습니다.",
    dao,
  };
}

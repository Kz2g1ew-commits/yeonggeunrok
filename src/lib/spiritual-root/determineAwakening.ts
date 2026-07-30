import type { BirthInput, FourPillarsCalculation, RootJudgmentMode } from "@/types/bazi";
import type { AwakeningResult } from "@/types/spiritualRoot";
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
  seed: string,
): AwakeningResult {
  const roll = stableSpiritualRootRoll(seed);
  const populationRate = mode === "strict" ? SPIRITUAL_ROOT_RULES.awakening.strictPopulationRate : 100;
  const threshold = Math.round(SPIRITUAL_ROOT_RULES.awakening.rollScale * populationRate / 100);
  const passed = mode === "generous" || roll < threshold;

  return {
    mode,
    passed,
    roll,
    threshold,
    populationRate,
    label: mode === "generous" ? "유연 판정" : passed ? "엄격 판정 · 영근 발현" : "엄격 판정 · 영근 미발현",
    explanation: mode === "generous"
      ? "체험의 재미를 위해 영기 통로가 하나 이상 열린다는 전제로 판정합니다."
      : passed
        ? "선협 세계관의 희소성 관문(인구 약 1%)을 통과했습니다."
        : "선협 세계관의 희소성 관문(인구 약 1%)을 넘지 못해 오행 통로가 잠재 상태로 봉인되었습니다.",
  };
}

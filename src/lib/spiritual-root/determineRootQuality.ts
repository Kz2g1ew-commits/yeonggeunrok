import type { QualityDistributionResult, RootQualityTier } from "@/types/spiritualRoot";
import { stableSpiritualRootRoll } from "./determineAwakening";
import { SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";

type ActiveTier = Exclude<RootQualityTier, "none">;

export function determineRootQuality(seed: string): QualityDistributionResult {
  const roll = stableSpiritualRootRoll(`${seed}::quality`);
  const percentile = roll / (SPIRITUAL_ROOT_RULES.awakening.rollScale / 100);
  let cumulative = 0;

  for (const bucket of SPIRITUAL_ROOT_RULES.qualityDistribution) {
    cumulative += bucket.share;
    if (percentile < cumulative) {
      return {
        roll,
        targetTier: bucket.tier as ActiveTier,
        targetShare: bucket.share,
        desiredCount: bucket.desiredCount,
        label: bucket.label,
      };
    }
  }

  const fallback = SPIRITUAL_ROOT_RULES.qualityDistribution.at(-1)!;
  return {
    roll,
    targetTier: fallback.tier as ActiveTier,
    targetShare: fallback.share,
    desiredCount: fallback.desiredCount,
    label: fallback.label,
  };
}

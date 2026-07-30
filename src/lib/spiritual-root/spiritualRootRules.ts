import type { Element } from "@/types/bazi";

export const SPIRITUAL_ROOT_RULES = {
  scores: {
    dayMaster: 3,
    monthBranchMain: 4,
    visibleStem: 2,
    branchMain: 2,
    hiddenMain: 1.5,
    hiddenMiddle: 1,
    hiddenResidual: 0.5,
    fullHarmony: 4,
    directionalHarmony: 4,
    halfHarmony: 2,
    transformedStemCombination: 3,
    strongSupport: 1,
    monthCommandBonus: 2,
    uniqueRootClash: -2,
    seasonalExtremeWeakness: -1,
    uncontrolledStrongControl: -2,
    stemWithoutRoot: -1,
    combinedAway: -1,
  },
  thresholds: {
    effective: 4,
    potential: 2,
    balanceGap: 2,
    strongBiasGap: 3.5,
    fiveBalanceSpread: 3,
    hunyuanSpread: 2.5,
  },
  grade: {
    lowMax: 6.9,
    middleMax: 9.9,
    highMax: 12.9,
    supremeMin: 13,
  },
  rawStrength: {
    strongSupport: 2,
    strongControl: 3,
    rescue: 1.5,
  },
} as const;

export const SEASON_DOMINANT: Record<string, Element> = {
  spring: "wood",
  summer: "fire",
  earth: "earth",
  autumn: "metal",
  winter: "water",
};

export const SEASON_EXTREME_WEAK: Record<string, Element> = {
  spring: "earth",
  summer: "metal",
  earth: "water",
  autumn: "wood",
  winter: "fire",
};

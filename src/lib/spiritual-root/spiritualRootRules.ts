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
    independentStrength: 4,
    potential: 2,
    generousChannel: 1.5,
    sealedPotential: 0.5,
    balanceGap: 2,
    strongBiasGap: 3.5,
    heavenlyPurityGap: 14,
    heavenlySecondaryMax: 3.9,
    heavenlyPrimaryMin: 16,
    fiveBalanceSpread: 3,
    hunyuanSpread: 2.5,
  },
  awakening: {
    populationRates: {
      generous: 100,
      balanced: 15,
      strict: 1,
    },
    rollScale: 10_000,
  },
  qualityDistribution: [
    { tier: "heavenly", share: 1.5, desiredCount: 1, label: "천영근 배분" },
    { tier: "mutation", share: 11, desiredCount: 2, label: "변이 융합 시도 배분" },
    { tier: "dual", share: 6.5, desiredCount: 2, label: "이영근 배분" },
    { tier: "triple", share: 20, desiredCount: 3, label: "삼영근 배분" },
    { tier: "quadruple", share: 28, desiredCount: 4, label: "사영근 배분" },
    { tier: "five", share: 33, desiredCount: 5, label: "오영근 배분" },
  ],
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

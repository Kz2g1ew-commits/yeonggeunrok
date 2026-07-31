import type { ShenshaId } from "@/types/bazi";
import type { RootQualityTier, TalentDimensionId } from "@/types/spiritualRoot";

export const CULTIVATION_TALENT_RULES = {
  rootBoneBase: {
    none: 16,
    heavenly: 88,
    mutation: 90,
    dual: 78,
    triple: 66,
    quadruple: 54,
    five: 42,
  } satisfies Record<RootQualityTier, number>,
  rootGradeBonus: { low: 0, middle: 3, high: 6, supreme: 10 },
  specialRootBonus: {
    balancedFive: 12,
    hunyuanFive: 24,
    strongCycle: 5,
  },
  dimensionBase: {
    insight: 30,
    combat: 28,
    soul: 28,
    providence: 24,
  },
  extraOccurrenceBonus: 3,
  extraOccurrenceMaximum: 9,
  shenshaBonuses: {
    huagai: { insight: 6, soul: 9, providence: 2 },
    guimen: { insight: 3, soul: 12 },
    yima: { combat: 4 },
    tianyi: { providence: 10, soul: 2 },
    tiande: { insight: 3, soul: 4, providence: 10 },
    yuede: { soul: 3, providence: 9 },
    wenchang: { insight: 14 },
    taiji: { insight: 10, soul: 8, providence: 4 },
    yangren: { combat: 14 },
    kuigang: { combat: 16, soul: 3 },
    jiangxing: { combat: 10, providence: 2 },
    taohua: { insight: 2, soul: 3, providence: 2 },
    jiesha: { combat: 7, soul: -2 },
  } satisfies Record<ShenshaId, Partial<Record<Exclude<TalentDimensionId, "rootBone">, number>>>,
  synergies: {
    insightWenchangTaiji: 6,
    insightTaijiHuagai: 4,
    soulMysticTriad: 6,
    combatBladeCommand: 6,
    providenceHeavenMonthVirtue: 6,
  },
  titles: {
    tianjiao: { rootBone: 72, supportingDimension: 70 },
    peerless: { rootBone: 84, strongDimension: 76, strongDimensionCount: 2 },
    heavenlyFavored: { providence: 72, rootBone: 52, auspiciousCategoryCount: 4, supportingDimension: 66 },
    promising: { rootBone: 64, alternativeDimension: 68 },
  },
  dimensions: {
    exceptional: 88,
    outstanding: 76,
    developed: 64,
    sensitive: 50,
  },
} as const;

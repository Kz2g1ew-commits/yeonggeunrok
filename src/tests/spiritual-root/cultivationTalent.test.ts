import { describe, expect, it } from "vitest";
import type { AwakeningResult, RootClassification } from "@/types/spiritualRoot";
import type { BranchRelations, Element, ShenshaId, ShenshaResult } from "@/types/bazi";
import { SHENSHA_DESCRIPTORS } from "@/lib/bazi/shenshaRules";
import { synthesizeCultivationTalent } from "@/lib/spiritual-root/synthesizeCultivationTalent";
import { classifyRootCount } from "@/lib/spiritual-root/classifyRootCount";
import { evidenceSet } from "@/tests/fixtures";

const relations: BranchRelations = { combinations: [], halfCombinations: [], archingCombinations: [], directionalCombinations: [], sixCombinations: [], clashes: [], punishments: [], harms: [], breaks: [], stemCombinations: [], dynamicCount: 0 };
const classification = {
  rootCount: "single", displayName: "상품 금 천영근", originalElements: ["metal"], workingElements: ["금"], grade: "high",
  cultivationSpeed: "매우 빠름", adaptability: "금계", qualityTier: "heavenly", qualityRank: 1, qualityLabel: "최상급", rarityLabel: "희귀",
} as RootClassification;
const awakening = { passed: true } as AwakeningResult;

function stars(ids: ShenshaId[], strongIds: ShenshaId[] = []): ShenshaResult[] {
  return (Object.keys(SHENSHA_DESCRIPTORS) as ShenshaId[]).map((id) => {
    const present = ids.includes(id);
    const strong = strongIds.includes(id);
    return {
      ...SHENSHA_DESCRIPTORS[id], present, effective: present, status: present ? strong ? "strong" : "active" : "inactive",
      strength: present ? strong ? 78 : 65 : 0, integrity: 100, occurrenceCount: present ? strong ? 2 : 1 : 0,
      damage: [], matches: [], evidence: present ? strong ? [`${id} 근거1`, `${id} 근거2`] : [`${id} 근거`] : [],
    };
  });
}

describe("cultivation talent synthesis", () => {
  it("lets a refined five-qi circuit approach heavenly-root bone without lifting unstable variants equally", () => {
    const elements: Element[] = ["wood", "fire", "earth", "metal", "water"];
    const harmoniousEvidence = evidenceSet({ wood: 8, fire: 8, earth: 8, metal: 8, water: 8 });
    const flowingEvidence = evidenceSet({ wood: 7, fire: 7, earth: 7, metal: 15, water: 7 });
    const biasedEvidence = evidenceSet({ wood: 8, fire: 8, earth: 18.1, metal: 8, water: 8 });
    const turbulentEvidence = evidenceSet({ wood: 8, fire: 8, earth: 8, metal: 8, water: 8 });
    const turbulentRelations = {
      ...relations,
      clashes: ["충1", "충2"], punishments: ["형1"], harms: ["해1"], dynamicCount: 4,
    };
    const talent = (
      evidence: ReturnType<typeof evidenceSet>,
      activeRelations = relations,
    ) => synthesizeCultivationTalent(
      classifyRootCount(elements, [], evidence, activeRelations),
      evidence,
      stars([]),
      awakening,
      activeRelations,
    );

    const harmonious = talent(harmoniousEvidence);
    const flowing = talent(flowingEvidence);
    const biased = talent(biasedEvidence);
    const turbulent = talent(turbulentEvidence, turbulentRelations);
    const heavenly = synthesizeCultivationTalent(classification, evidenceSet({ metal: 8 }), stars([]), awakening, relations);

    expect(harmonious.dimensions.rootBone.score).toBeGreaterThanOrEqual(86);
    expect(heavenly.dimensions.rootBone.score - harmonious.dimensions.rootBone.score).toBeLessThanOrEqual(10);
    expect(flowing.dimensions.rootBone.score).toBeGreaterThan(biased.dimensions.rootBone.score);
    expect(biased.dimensions.rootBone.score).toBeGreaterThan(turbulent.dimensions.rootBone.score);
    expect(harmonious.specialEffects.some((effect) => effect.id === "five-qi-circuit")).toBe(true);
    expect(harmonious.specialEffects.find((effect) => effect.id === "five-qi-circuit")?.effects).toContain("후기 천영근급 잠재력");
  });

  it("treats layered noble protection as heavenly favor, not as root quality", () => {
    const evidence = evidenceSet({ metal: 15 });
    const profile = synthesizeCultivationTalent(
      classification,
      evidence,
      stars(["tianyi", "tiande", "yuede", "wenchang", "taiji", "huagai"], ["tianyi", "tiande", "yuede"]),
      awakening,
      relations,
    );

    expect(profile.tier).toBe("heavenly-favored");
    expect(profile.title).toContain("천도지자");
    expect(profile.dimensions.providence.score).toBeGreaterThanOrEqual(72);
    expect(profile.specialEffects.some((effect) => effect.id === "heavenly-dao-child")).toBe(true);
    expect(evidence.metal.effective).toBe(true);
  });

  it("requires root aptitude plus another developed faculty for tianjiao", () => {
    const profile = synthesizeCultivationTalent(
      classification,
      evidenceSet({ metal: 15 }),
      stars(["yangren", "jiangxing", "kuigang"]),
      awakening,
      relations,
    );

    expect(profile.tier).toBe("tianjiao");
    expect(profile.dimensions.combat.score).toBeGreaterThanOrEqual(70);
    expect(profile.specialEffects.some((effect) => effect.id === "battle-bone")).toBe(true);
  });

  it("preserves innate root-bone potential without granting an awakened title", () => {
    const profile = synthesizeCultivationTalent(
      classification,
      evidenceSet({ metal: 15 }),
      stars(["tianyi", "tiande", "yuede", "wenchang", "taiji", "yangren", "jiangxing"]),
      { ...awakening, passed: false },
      relations,
    );

    expect(profile.tier).toBe("unawakened");
    expect(profile.title).toContain("영문미개");
    expect(profile.dimensions.rootBone.score).toBeGreaterThanOrEqual(88);
  });
});

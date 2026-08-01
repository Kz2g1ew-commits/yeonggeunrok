import { describe, expect, it } from "vitest";
import type { AwakeningResult, RootClassification } from "@/types/spiritualRoot";
import type { ShenshaId, ShenshaResult } from "@/types/bazi";
import { SHENSHA_DESCRIPTORS } from "@/lib/bazi/shenshaRules";
import { synthesizeCultivationTalent } from "@/lib/spiritual-root/synthesizeCultivationTalent";
import { evidenceSet } from "@/tests/fixtures";

const relations = { combinations: [], halfCombinations: [], archingCombinations: [], directionalCombinations: [], sixCombinations: [], clashes: [], punishments: [], harms: [], breaks: [], stemCombinations: [], dynamicCount: 0 };
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

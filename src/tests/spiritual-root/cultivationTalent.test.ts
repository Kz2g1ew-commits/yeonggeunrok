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
  return (Object.keys(SHENSHA_DESCRIPTORS) as ShenshaId[]).map((id) => ({
    ...SHENSHA_DESCRIPTORS[id], present: ids.includes(id), evidence: ids.includes(id) ? strongIds.includes(id) ? [`${id} 근거1`, `${id} 근거2`] : [`${id} 근거`] : [],
  }));
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

  it("never grants an awakened title when the spiritual aperture is closed", () => {
    const profile = synthesizeCultivationTalent(
      classification,
      evidenceSet({ metal: 15 }),
      stars(["tianyi", "tiande", "yuede", "wenchang", "taiji", "yangren", "jiangxing"]),
      { ...awakening, passed: false },
      relations,
    );

    expect(profile.tier).toBe("unawakened");
    expect(profile.title).toContain("미각성");
  });
});

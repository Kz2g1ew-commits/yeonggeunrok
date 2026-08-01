import { describe, expect, it } from "vitest";
import { calculateFourPillars } from "@/lib/calendar/calculateFourPillars";
import { analyzeSpiritualRoots } from "@/lib/spiritual-root/analyzeSpiritualRoots";
import { birthInput } from "@/tests/fixtures";

describe("root-bone potential across awakening modes", () => {
  it("keeps the generous-mode root-bone score when a balanced gate remains closed", () => {
    const candidates = Array.from({ length: 12 }, (_, index) => birthInput({
      judgmentMode: "generous",
      year: 2000 + index,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
    }));
    const comparison = candidates.map((generousInput) => {
      const calculation = calculateFourPillars(generousInput);
      return {
        generous: analyzeSpiritualRoots(generousInput, calculation).result,
        balanced: analyzeSpiritualRoots({ ...generousInput, judgmentMode: "balanced" }, calculation).result,
        strict: analyzeSpiritualRoots({ ...generousInput, judgmentMode: "strict" }, calculation).result,
      };
    }).find(({ generous, balanced }) => generous.awakening.passed && !balanced.awakening.passed);

    expect(comparison).toBeDefined();
    const { generous, balanced, strict } = comparison!;

    expect(generous.awakening.passed).toBe(true);
    expect(balanced.awakening.passed).toBe(false);
    expect(balanced.classification.qualityTier).toBe("none");
    expect(balanced.primaryElements).toEqual([]);
    expect(balanced.talentProfile.dimensions.rootBone.score)
      .toBe(generous.talentProfile.dimensions.rootBone.score);
    expect(balanced.talentProfile.dimensions.rootBone.score).toBeGreaterThan(16);
    expect(balanced.talentProfile.tier).toBe("unawakened");
    expect(balanced.talentProfile.title).toContain("영문미개");
    expect(strict.awakening.passed).toBe(false);
    expect(strict.classification.qualityTier).toBe("none");
    expect(strict.talentProfile.dimensions.rootBone.score)
      .toBe(generous.talentProfile.dimensions.rootBone.score);
    expect(strict.talentProfile.tier).toBe("unawakened");
  });
});

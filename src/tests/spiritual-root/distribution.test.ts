import { describe, expect, it } from "vitest";
import type { BirthInput } from "@/types/bazi";
import type { RootQualityTier } from "@/types/spiritualRoot";
import { calculateFourPillars } from "@/lib/calendar/calculateFourPillars";
import { analyzeSpiritualRoots } from "@/lib/spiritual-root/analyzeSpiritualRoots";
import { determineAwakening } from "@/lib/spiritual-root/determineAwakening";

describe("spiritual-root population balance", () => {
  it("keeps structural results ordered without promoting invalid elements", { timeout: 15_000 }, () => {
    let seed = 246_813_579;
    const random = () => {
      seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
      return seed;
    };
    const counts: Record<RootQualityTier, number> = {
      none: 0, heavenly: 0, mutation: 0, dual: 0, triple: 0, quadruple: 0, five: 0,
    };
    let strictComparisons = 0;
    let balancedPasses = 0;
    let strictPasses = 0;

    for (let index = 0; index < 5_000; index += 1) {
      const input: BirthInput = {
        judgmentMode: "generous", calendarType: "solar", isLeapMonth: false,
        year: 1900 + random() % 201, month: 1 + random() % 12, day: 1 + random() % 28,
        hour: random() % 24, minute: random() % 60,
        timezone: "Asia/Seoul", country: "대한민국", city: "서울", longitude: 126.978,
        longitudeIsApproximate: true, gender: "unspecified", applyLateZi: false,
        applyTrueSolarTime: false, timeAccuracy: "exact",
        shensha: { enabled: false, huagai: false, guimen: false, yima: false },
      };
      const calculation = calculateFourPillars(input);
      const result = analyzeSpiritualRoots(input, calculation).result;
      counts[result.classification.qualityTier] += 1;
      if (determineAwakening("balanced", result.awakening.dao).passed) balancedPasses += 1;
      if (determineAwakening("strict", result.awakening.dao).passed) {
        const strictResult = analyzeSpiritualRoots({ ...input, judgmentMode: "strict" }, calculation).result;
        expect(strictResult.classification.qualityTier).toBe(result.classification.qualityTier);
        expect(strictResult.primaryElements).toEqual(result.primaryElements);
        strictComparisons += 1;
        strictPasses += 1;
      }
    }

    const share = (tier: RootQualityTier) => counts[tier] / 5_000;
    expect(share("none")).toBeGreaterThan(0.002);
    expect(share("none")).toBeLessThan(0.025);
    expect(share("heavenly")).toBeGreaterThan(0.01);
    expect(share("heavenly")).toBeLessThan(0.03);
    expect(share("mutation")).toBeGreaterThan(0.04);
    expect(share("mutation")).toBeLessThan(0.06);
    expect(share("dual")).toBeGreaterThan(0.075);
    expect(share("dual")).toBeLessThan(0.13);
    expect(share("triple")).toBeGreaterThan(0.1);
    expect(share("triple")).toBeLessThan(0.16);
    expect(share("quadruple")).toBeGreaterThan(0.3);
    expect(share("quadruple")).toBeLessThan(0.39);
    expect(share("five")).toBeGreaterThan(0.3);
    expect(share("five")).toBeLessThan(0.4);
    expect(share("heavenly")).toBeLessThan(share("mutation"));
    expect(share("mutation")).toBeLessThan(share("dual"));
    expect(share("dual")).toBeLessThan(share("triple"));
    expect(share("triple")).toBeLessThan(share("quadruple"));
    expect(balancedPasses / 5_000).toBeGreaterThan(0.13);
    expect(balancedPasses / 5_000).toBeLessThan(0.17);
    expect(strictPasses / 5_000).toBeGreaterThan(0.005);
    expect(strictPasses / 5_000).toBeLessThan(0.015);
    expect(strictComparisons).toBeGreaterThan(35);
  });
});

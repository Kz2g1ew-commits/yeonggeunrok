import { describe, expect, it } from "vitest";
import type { BirthInput } from "@/types/bazi";
import type { TalentTier } from "@/types/spiritualRoot";
import { calculateFourPillars } from "@/lib/calendar/calculateFourPillars";
import { analyzeSpiritualRoots } from "@/lib/spiritual-root/analyzeSpiritualRoots";

describe("cultivation talent rarity", () => {
  it("keeps xianxia elite titles exceptional without random allocation", { timeout: 20_000 }, () => {
    let seed = 482_710_357;
    const random = () => {
      seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
      return seed;
    };
    const counts: Record<TalentTier, number> = {
      unawakened: 0, ordinary: 0, promising: 0, tianjiao: 0, peerless: 0, "heavenly-favored": 0,
    };

    for (let index = 0; index < 5_000; index += 1) {
      const input: BirthInput = {
        judgmentMode: "generous", calendarType: "solar", isLeapMonth: false,
        year: 1900 + random() % 201, month: 1 + random() % 12, day: 1 + random() % 28,
        hour: random() % 24, minute: random() % 60,
        timezone: "Asia/Seoul", country: "대한민국", city: "서울", longitude: 126.978,
        longitudeIsApproximate: true, gender: "unspecified", applyLateZi: false,
        applyTrueSolarTime: false, timeAccuracy: "exact",
        shensha: { enabled: true, huagai: true, guimen: true, yima: true, noble: true, scholar: true, martial: true, charisma: true },
      };
      const analysis = analyzeSpiritualRoots(input, calculateFourPillars(input));
      const profile = analysis.result.talentProfile;
      counts[profile.tier] += 1;
      if (profile.tier === "heavenly-favored") {
        expect(profile.specialEffects.some((effect) => effect.id === "heavenly-dao-child")).toBe(true);
      }
    }

    const share = (tier: TalentTier) => counts[tier] / 5_000;
    expect(share("tianjiao")).toBeGreaterThan(0.015);
    expect(share("tianjiao")).toBeLessThan(0.035);
    expect(share("heavenly-favored")).toBeGreaterThan(0.001);
    expect(share("heavenly-favored")).toBeLessThan(0.01);
    expect(share("tianjiao") + share("peerless") + share("heavenly-favored")).toBeLessThan(0.05);
  });
});

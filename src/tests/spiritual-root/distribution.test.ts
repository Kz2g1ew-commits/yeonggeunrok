import { describe, expect, it } from "vitest";
import type { BirthInput } from "@/types/bazi";
import type { RootQualityTier } from "@/types/spiritualRoot";
import { calculateFourPillars } from "@/lib/calendar/calculateFourPillars";
import { analyzeSpiritualRoots } from "@/lib/spiritual-root/analyzeSpiritualRoots";

describe("spiritual-root population balance", () => {
  it("keeps generous results ordered from common five-roots to rare heavenly roots", { timeout: 15_000 }, () => {
    let seed = 246_813_579;
    const random = () => {
      seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
      return seed;
    };
    const counts: Record<RootQualityTier, number> = {
      none: 0, heavenly: 0, mutation: 0, dual: 0, triple: 0, quadruple: 0, five: 0,
    };

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
      const result = analyzeSpiritualRoots(input, calculateFourPillars(input)).result;
      counts[result.classification.qualityTier] += 1;
    }

    expect(counts.none).toBe(0);
    expect(counts.five).toBeGreaterThan(counts.quadruple);
    expect(counts.quadruple).toBeGreaterThan(counts.triple);
    expect(counts.triple).toBeGreaterThan(counts.dual);
    expect(counts.dual).toBeGreaterThan(counts.mutation);
    expect(counts.mutation).toBeGreaterThan(counts.heavenly);
  });
});

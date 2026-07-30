import { describe, expect, it } from "vitest";
import { determineAwakening, stableSpiritualRootRoll } from "@/lib/spiritual-root/determineAwakening";

describe("determineAwakening", () => {
  it("always opens the gate in generous mode", () => {
    expect(determineAwakening("generous", "same-birth-seed").passed).toBe(true);
  });

  it("returns the same strict result for the same input", () => {
    const first = determineAwakening("strict", "1995-05-15T12:00+09:00::서울");
    const second = determineAwakening("strict", "1995-05-15T12:00+09:00::서울");
    expect(second).toEqual(first);
  });

  it("distributes strict awakenings at approximately one percent", () => {
    const sampleSize = 20_000;
    const passed = Array.from({ length: sampleSize }, (_, index) => `population-${index}`)
      .filter((seed) => stableSpiritualRootRoll(seed) < 100).length;
    expect(passed / sampleSize).toBeGreaterThan(0.008);
    expect(passed / sampleSize).toBeLessThan(0.012);
  });
});

import { describe, expect, it } from "vitest";
import { determineAwakening } from "@/lib/spiritual-root/determineAwakening";
import type { DaoAffinityResult } from "@/types/spiritualRoot";
import type { FourPillars } from "@/types/bazi";
import { evidenceSet, pillar } from "@/tests/fixtures";

const dormantPillars: FourPillars = {
  year: pillar("乙", "酉"), month: pillar("壬", "午"), day: pillar("乙", "丑"), hour: pillar("甲", "申"),
};

const balancedPillars: FourPillars = {
  year: pillar("丙", "午"), month: pillar("辛", "卯"), day: pillar("甲", "申"), hour: pillar("庚", "午"),
};

const strictPillars: FourPillars = {
  year: pillar("乙", "酉"), month: pillar("戊", "寅"), day: pillar("己", "卯"), hour: pillar("丙", "子"),
};

function dao(score: number): DaoAffinityResult {
  return {
    path: "natural", naturalScore: score, defiantScore: score - 10, score,
    contributions: [], reasons: [],
  };
}

describe("determineAwakening", () => {
  it("opens the generous gate when at least one three-gate channel is complete", () => {
    expect(determineAwakening("generous", dormantPillars, evidenceSet({ wood: 7 }), dao(-10)).passed).toBe(true);
    expect(determineAwakening("generous", strictPillars, evidenceSet({}), dao(100)).passed).toBe(false);
  });

  it("opens balanced mode only when Tai Yuan flows through Tai Xi into Ming Gong", () => {
    const evidence = evidenceSet({ wood: 7 });
    expect(determineAwakening("balanced", dormantPillars, evidence, dao(100)).passed).toBe(false);
    const result = determineAwakening("balanced", balancedPillars, evidence, dao(-10));
    expect(result.passed).toBe(true);
    expect(result.preHeaven.state).toBe("responsive");
  });

  it("requires a connected and undamaged three-origin network in strict mode", () => {
    const evidence = evidenceSet({ water: 10 });
    expect(determineAwakening("strict", balancedPillars, evidence, dao(100)).passed).toBe(false);
    const result = determineAwakening("strict", strictPillars, evidence, dao(-10));
    expect(result.passed).toBe(true);
    expect(result.preHeaven.state).toBe("condensed");
    expect(result.preHeaven.trueBondCount).toBeGreaterThanOrEqual(1);
    expect(result.preHeaven.disruptionCount).toBe(0);
  });
});

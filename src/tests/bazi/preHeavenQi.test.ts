import { describe, expect, it } from "vitest";
import type { FourPillars } from "@/types/bazi";
import { calculatePreHeavenQi } from "@/lib/bazi/preHeavenQi";
import { pillar } from "@/tests/fixtures";

describe("pre-heaven qi", () => {
  it("derives Tai Yuan, Tai Xi and Ming Gong from the four pillars", () => {
    const pillars: FourPillars = {
      year: pillar("乙", "酉"), month: pillar("戊", "寅"), day: pillar("己", "卯"), hour: pillar("丙", "子"),
    };
    const result = calculatePreHeavenQi(pillars);
    expect(result.nodes.taiYuan).toMatchObject({ ganZhi: "己巳", naYin: "大林木", element: "wood" });
    expect(result.nodes.taiXi).toMatchObject({ ganZhi: "甲戌", naYin: "山头火", element: "fire" });
    expect(result.nodes.mingGong).toMatchObject({ ganZhi: "己卯", naYin: "城头土", element: "earth" });
  });

  it("condenses pre-heaven qi only when all three nodes flow, bind and remain undamaged", () => {
    const pillars: FourPillars = {
      year: pillar("乙", "酉"), month: pillar("戊", "寅"), day: pillar("己", "卯"), hour: pillar("丙", "子"),
    };
    const result = calculatePreHeavenQi(pillars);
    expect(result.balancedFlow).toBe(true);
    expect(result.connectedResonance).toBe(true);
    expect(result.trueBondCount).toBe(3);
    expect(result.disruptionCount).toBe(0);
    expect(result.strictCondensation).toBe(true);
  });
});

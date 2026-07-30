import { describe, expect, it } from "vitest";
import type { FourPillars } from "@/types/bazi";
import { calculateElementScores } from "@/lib/spiritual-root/calculateElementScores";
import { determineEffectiveRoots } from "@/lib/spiritual-root/determineEffectiveRoots";
import { analyzeRelations } from "@/lib/bazi/relations";
import { classifyRootCount } from "@/lib/spiritual-root/classifyRootCount";
import { evidenceSet, pillar } from "../fixtures";

const hotFireEarthChart: FourPillars = {
  year: pillar("壬", "戌"),
  month: pillar("己", "巳"),
  day: pillar("丁", "辰"),
  hour: pillar("丁", "申"),
};

describe("structural element scoring", () => {
  it("separates elemental presence from effective activation in a hot fire-earth chart", () => {
    const evidence = calculateElementScores(hotFireEarthChart);
    expect(evidence.fire.structuralEligible).toBe(true);
    expect(evidence.earth.structuralEligible).toBe(true);
    expect(evidence.wood.structuralEligible).toBe(false);
    expect(evidence.wood.score).toBeLessThan(2);
    expect(evidence.water.score).toBeGreaterThan(0);
    expect(evidence.water.score).toBeLessThan(evidence.fire.score);
    expect(Object.values(evidence).reduce((sum, item) => sum + item.presenceRatio, 0)).toBeCloseTo(100, 0);
    expect(evidence.water.presenceRatio).toBeGreaterThan(10);
    expect(evidence.fire.presenceRatio).toBeGreaterThan(evidence.water.presenceRatio);
    expect(evidence.wood.contributions.some((item) => item.label.includes("통관"))).toBe(false);
    expect(evidence.fire.combinations).not.toContain("천간합화");
  });

  it("does not let a five-root purity allocation promote structurally invalid elements", () => {
    const evidence = evidenceSet({ fire: 12, earth: 9, water: 1, wood: 0.5, metal: 1 });
    evidence.water.visibleStems = ["壬"];
    evidence.water.rootStrength = 0.7;
    evidence.water.rootDetails = [{ branch: "辰", stem: "癸", role: "residual", strength: 0.7, damaged: false }];
    const roots = determineEffectiveRoots(evidence, true, {
      roll: 9_999, targetTier: "five", targetShare: 33, desiredCount: 5, label: "테스트 오영근 배분",
    });
    expect(roots.structural).toEqual(["fire", "earth"]);
    expect(roots.effective).toEqual(["fire", "earth"]);
    expect(roots.effective).not.toContain("wood");
    expect(roots.effective).not.toContain("water");
    expect(roots.potential).toContain("water");
    expect(classifyRootCount(roots.effective, roots.potential, roots.evidence, analyzeRelations(hotFireEarthChart)).rootCount).toBe("dual");
  });

  it("does not let a heavenly allocation erase a strong second channel", () => {
    const roots = determineEffectiveRoots(evidenceSet({ fire: 16, earth: 10 }), true, {
      roll: 0, targetTier: "heavenly", targetShare: 20, desiredCount: 1, label: "테스트 천영근 응축",
    });
    expect(roots.effective).toEqual(["fire", "earth"]);
  });

  it("keeps a directly effective third root from disappearing before mutation analysis", () => {
    const roots = determineEffectiveRoots(evidenceSet({ wood: 12, fire: 10, earth: 8 }), true, {
      roll: 2_000, targetTier: "mutation", targetShare: 36, desiredCount: 2, label: "테스트 변이 융합",
    });
    expect(roots.effective).toEqual(["wood", "fire", "earth"]);
  });

  it("does not count a branch main qi twice as hidden main qi", () => {
    const evidence = calculateElementScores(hotFireEarthChart);
    expect(evidence.metal.contributions.filter((item) => item.label.includes("신 지지 본기"))).toHaveLength(1);
    expect(evidence.metal.contributions.some((item) => item.label.includes("신 지장간 경(main)"))).toBe(false);
  });

  it("does not treat a non-adjacent stem pair as a completed transformation", () => {
    const evidence = calculateElementScores({
      year: pillar("癸", "丑"), month: pillar("丙", "巳"),
      day: pillar("甲", "酉"), hour: pillar("戊", "寅"),
    });
    expect(evidence.fire.combinations).not.toContain("천간합화");
    expect(evidence.water.contributions.some((item) => item.label.includes("합화로 독립 작용"))).toBe(false);
  });

  it("keeps an adjacent non-day stem combination as bound rather than transformed", () => {
    const evidence = calculateElementScores({
      year: pillar("甲", "戌"), month: pillar("己", "辰"),
      day: pillar("丁", "午"), hour: pillar("丁", "申"),
    });
    expect(evidence.earth.combinations).toContain("천간합·불화");
    expect(evidence.earth.combinations).not.toContain("천간합화");
  });

  it("requires the day stem, target season and weak original roots for full stem transformation", () => {
    const evidence = calculateElementScores({
      year: pillar("丁", "巳"), month: pillar("丙", "午"),
      day: pillar("癸", "卯"), hour: pillar("戊", "寅"),
    });
    expect(evidence.fire.combinations).toContain("천간합화");
    expect(evidence.water.contributions.some((item) => item.label.includes("완전 합화"))).toBe(true);
  });
});

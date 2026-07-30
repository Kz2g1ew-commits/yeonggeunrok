import { describe, expect, it } from "vitest";
import type { FourPillars } from "@/types/bazi";
import { calculateElementScores } from "@/lib/spiritual-root/calculateElementScores";
import { determineEffectiveRoots } from "@/lib/spiritual-root/determineEffectiveRoots";
import { analyzeRelations } from "@/lib/bazi/relations";
import { classifyRootCount } from "@/lib/spiritual-root/classifyRootCount";
import { pillar } from "../fixtures";

const hotFireEarthChart: FourPillars = {
  year: pillar("癸", "未"),
  month: pillar("戊", "午"),
  day: pillar("丙", "辰"),
  hour: pillar("丙", "申"),
};

describe("structural element scoring", () => {
  it("keeps hidden-only wood and constrained water out of a hot fire-earth chart", () => {
    const evidence = calculateElementScores(hotFireEarthChart);
    expect(evidence.fire.structuralEligible).toBe(true);
    expect(evidence.earth.structuralEligible).toBe(true);
    expect(evidence.wood.structuralEligible).toBe(false);
    expect(evidence.water.structuralEligible).toBe(false);
    expect(evidence.metal.structuralEligible).toBe(false);
    expect(evidence.wood.score).toBeLessThan(2);
    expect(evidence.water.score).toBeLessThan(2);
    expect(evidence.wood.contributions.some((item) => item.label.includes("통관"))).toBe(false);
    expect(evidence.water.combinations).toContain("공합 후보");
    expect(evidence.water.combinations).not.toContain("반합");
  });

  it("does not let a five-root purity allocation promote structurally invalid elements", () => {
    const evidence = calculateElementScores(hotFireEarthChart);
    const roots = determineEffectiveRoots(evidence, true, {
      roll: 9_999, targetTier: "five", targetShare: 33, desiredCount: 5, label: "테스트 오영근 배분",
    });
    expect(roots.structural).toEqual(["fire", "earth"]);
    expect(roots.effective).toEqual(["fire", "earth"]);
    expect(roots.effective).not.toContain("wood");
    expect(roots.effective).not.toContain("water");
    expect(classifyRootCount(roots.effective, roots.potential, roots.evidence, analyzeRelations(hotFireEarthChart)).rootCount).toBe("dual");
  });

  it("does not count a branch main qi twice as hidden main qi", () => {
    const evidence = calculateElementScores(hotFireEarthChart);
    expect(evidence.metal.contributions.filter((item) => item.label.includes("신 지지 본기"))).toHaveLength(1);
    expect(evidence.metal.contributions.some((item) => item.label.includes("신 지장간 경(main)"))).toBe(false);
  });

  it("does not treat a non-adjacent stem pair as a completed transformation", () => {
    const evidence = calculateElementScores({
      year: pillar("癸", "未"), month: pillar("丙", "午"),
      day: pillar("甲", "辰"), hour: pillar("戊", "申"),
    });
    expect(evidence.fire.combinations).not.toContain("천간합화");
    expect(evidence.water.contributions.some((item) => item.label.includes("합화로 독립 작용"))).toBe(false);
  });
});

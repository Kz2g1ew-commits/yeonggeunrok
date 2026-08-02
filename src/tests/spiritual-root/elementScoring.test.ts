import { describe, expect, it } from "vitest";
import type { FourPillars } from "@/types/bazi";
import { calculateElementScores } from "@/lib/spiritual-root/calculateElementScores";
import { calculateRootChannels } from "@/lib/spiritual-root/calculateRootChannels";
import { determineEffectiveRoots } from "@/lib/spiritual-root/determineEffectiveRoots";
import { analyzeRelations } from "@/lib/bazi/relations";
import { classifyRootCount } from "@/lib/spiritual-root/classifyRootCount";
import { hasEffectiveActivationBasis } from "@/lib/spiritual-root/rootActivationEligibility";
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
    expect(evidence.water.channel.state).toBe("sealed");
    expect(evidence.metal.channel.state).toBe("hidden");
    expect(evidence.wood.channel.state).toBe("dormant");
    expect(evidence.fire.activationOrigin).toBe("independent");
  });

  it("does not promote channels that fail the three-gate structure", () => {
    const evidence = evidenceSet({ fire: 12, earth: 9, water: 1, wood: 0.5, metal: 1 });
    evidence.water.visibleStems = ["壬"];
    evidence.water.rootStrength = 0.7;
    evidence.water.rootDetails = [{ branch: "辰", stem: "癸", role: "residual", strength: 0.7, clashState: "stable", damaged: false }];
    evidence.water.channel = {
      ...evidence.water.channel,
      heaven: { score: 3, passed: true, reasons: ["테스트용 천문"] },
      earth: { score: 2, passed: true, reasons: ["테스트용 지근"] },
      human: { score: 1, passed: false, reasons: [] },
      completion: 25,
      state: "latent",
      complete: false,
      potential: true,
      reasons: ["테스트용 잠재 통로"],
    };
    const roots = determineEffectiveRoots(evidence, true);
    expect(roots.structural).toEqual(["fire", "earth"]);
    expect(roots.effective).toEqual(["fire", "earth"]);
    expect(roots.effective).not.toContain("wood");
    expect(roots.effective).not.toContain("water");
    expect(roots.potential).toContain("water");
    expect(classifyRootCount(roots.effective, roots.potential, roots.evidence, analyzeRelations(hotFireEarthChart)).rootCount).toBe("dual");
  });

  it("keeps a grounded low channel but rejects a zero-score trace in collective flow", () => {
    const raw = evidenceSet({ wood: 2.5, fire: 13.5, earth: 8, metal: 0, water: 1 });
    for (const element of ["wood", "metal", "water"] as const) {
      raw[element].presenceScore = 10;
      raw[element].visibleStems = ["trace"];
      raw[element].rootStrength = 0.5;
      raw[element].rootDetails = [{ branch: "trace", stem: "trace", role: "residual", strength: 0.5, clashState: "stable", damaged: false }];
    }

    const evidence = calculateRootChannels(hotFireEarthChart, raw);
    const roots = determineEffectiveRoots(evidence, true);

    expect(evidence.wood.channel.complete).toBe(true);
    expect(evidence.metal.channel.complete).toBe(false);
    expect(evidence.water.channel.complete).toBe(true);
    expect(evidence.wood.activationOrigin).toBe("network-assisted");
    expect(evidence.water.activationOrigin).toBe("network-assisted");
    expect(roots.effective).toEqual(["fire", "earth", "wood", "water"]);
    expect(roots.effective.every((element) => hasEffectiveActivationBasis(evidence[element]))).toBe(true);
    expect(classifyRootCount(roots.effective, roots.potential, roots.evidence, analyzeRelations(hotFireEarthChart)).rootCount).toBe("quadruple");
  });

  it("does not close a zero-score fifth root even when four anchors are active", () => {
    const raw = evidenceSet({ wood: 4, fire: 12, earth: 8, metal: 0, water: 4 });
    raw.metal.presenceScore = 10;
    raw.metal.visibleStems = ["trace"];
    raw.metal.rootStrength = 0.5;
    raw.metal.rootDetails = [{ branch: "trace", stem: "trace", role: "residual", strength: 0.5, clashState: "stable", damaged: false }];

    const evidence = calculateRootChannels(hotFireEarthChart, raw);
    const roots = determineEffectiveRoots(evidence, true);

    expect(evidence.metal.channel.complete).toBe(false);
    expect(roots.effective).toHaveLength(4);
    expect(roots.effective).not.toContain("metal");
  });

  it("rejects a completed channel without a grounded activation basis at final selection", () => {
    const evidence = evidenceSet({ fire: 10, metal: 1 });
    evidence.metal.channel = {
      ...evidence.metal.channel,
      heaven: { score: 2, passed: true, reasons: [] },
      earth: { score: 1.1, passed: true, reasons: [] },
      human: { score: 2, passed: true, reasons: [] },
      completion: 30,
      state: "complete",
      complete: true,
      potential: false,
    };

    const roots = determineEffectiveRoots(evidence, true);
    expect(roots.effective).toEqual(["fire"]);
    expect(roots.effective).not.toContain("metal");
  });

  it("does not erase a strong second complete channel", () => {
    const roots = determineEffectiveRoots(evidenceSet({ fire: 16, earth: 10 }), true);
    expect(roots.effective).toEqual(["fire", "earth"]);
  });

  it("marks a carried potential channel as network-assisted", () => {
    const evidence = evidenceSet({ wood: 10, fire: 9, earth: 8, metal: 2 }, ["metal"]);
    const roots = determineEffectiveRoots(evidence, true);
    expect(roots.effective).toContain("metal");
    expect(roots.evidence.metal.activationOrigin).toBe("network-assisted");
  });

  it("condenses only a dominant primary and weak but connected secondary into a heavenly root", () => {
    const evidence = evidenceSet({ fire: 19, earth: 3 });
    evidence.earth.channel = {
      ...evidence.earth.channel,
      heaven: { score: 2, passed: true, reasons: [] },
      earth: { score: 1.1, passed: true, reasons: [] },
      human: { score: 2, passed: true, reasons: [] },
      integrity: 0.8,
      completion: 21,
      state: "complete",
      complete: true,
      potential: false,
    };
    evidence.earth.structuralEligible = true;
    const roots = determineEffectiveRoots(evidence, true);
    expect(roots.structural).toEqual(["fire", "earth"]);
    expect(roots.effective).toEqual(["fire"]);
    expect(roots.potential).toContain("earth");
  });

  it("keeps a directly complete third root before mutation analysis", () => {
    const roots = determineEffectiveRoots(evidenceSet({ wood: 12, fire: 10, earth: 8 }), true);
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

  it("resolves a clash by relative vigor instead of damaging both roots equally", () => {
    const evidence = calculateElementScores({
      year: pillar("甲", "寅"), month: pillar("庚", "申"),
      day: pillar("戊", "戌"), hour: pillar("庚", "申"),
    });
    expect(evidence.wood.rootDetails.find((root) => root.branch === "寅")?.clashState).toBe("uprooted");
    expect(evidence.metal.rootDetails.filter((root) => root.branch === "申").every((root) => root.clashState === "activated")).toBe(true);
  });

  it("keeps a damaged hidden root distinct from having no root at all", () => {
    const damagedRoot = calculateElementScores({
      year: pillar("甲", "亥"), month: pillar("丙", "巳"),
      day: pillar("戊", "戌"), hour: pillar("丁", "酉"),
    });
    const noRoot = calculateElementScores({
      year: pillar("甲", "子"), month: pillar("丙", "巳"),
      day: pillar("戊", "戌"), hour: pillar("丁", "酉"),
    });

    expect(damagedRoot.wood.rootDetails).toHaveLength(1);
    expect(damagedRoot.wood.rootDetails[0].damaged).toBe(true);
    expect(damagedRoot.wood.contributions.some((item) => item.label === "유일한 뿌리가 충으로 손상")).toBe(true);
    expect(damagedRoot.wood.contributions.some((item) => item.label === "천간에만 있고 뿌리가 없음")).toBe(false);
    expect(noRoot.wood.rootDetails).toHaveLength(0);
    expect(noRoot.wood.contributions.some((item) => item.label === "천간에만 있고 뿌리가 없음")).toBe(true);
  });

  it("counts repeated root seats separately when deciding whether a damaged root is unique", () => {
    const evidence = calculateElementScores({
      year: pillar("甲", "亥"), month: pillar("丙", "巳"),
      day: pillar("戊", "巳"), hour: pillar("甲", "亥"),
    });

    expect(evidence.wood.roots).toEqual(["亥"]);
    expect(evidence.wood.rootDetails).toHaveLength(2);
    expect(evidence.wood.rootDetails.every((root) => root.damaged)).toBe(true);
    expect(evidence.wood.contributions.some((item) => item.label === "유일한 뿌리가 충으로 손상")).toBe(false);
  });

  it("does not let the collective network recreate a severed weak root", () => {
    const raw = evidenceSet({ wood: 2.5, fire: 13.5, earth: 8, metal: 0, water: 1 });
    raw.wood.presenceScore = 10;
    raw.wood.visibleStems = ["trace"];
    raw.wood.rootStrength = 0.1;
    raw.wood.rootDetails = [{
      branch: "trace", stem: "trace", role: "middle", strength: 0.1, clashState: "uprooted", damaged: true,
    }];

    const evidence = calculateRootChannels(hotFireEarthChart, raw);

    expect(evidence.wood.channel.earth.passed).toBe(false);
    expect(evidence.wood.channel.complete).toBe(false);
    expect(evidence.wood.activationOrigin).toBe("none");
    expect([
      ...evidence.wood.channel.heaven.reasons,
      ...evidence.wood.channel.earth.reasons,
      ...evidence.wood.channel.human.reasons,
    ].some((reason) => reason.includes("공동 기세"))).toBe(false);
  });

  it("distinguishes a gathered harmony from a season-supported transformed formation", () => {
    const gathered = calculateElementScores({
      year: pillar("庚", "申"), month: pillar("丙", "午"),
      day: pillar("壬", "子"), hour: pillar("戊", "辰"),
    });
    const transformed = calculateElementScores({
      year: pillar("庚", "申"), month: pillar("戊", "子"),
      day: pillar("壬", "辰"), hour: pillar("己", "丑"),
    });
    expect(gathered.water.combinations).toContain("삼합 결집");
    expect(gathered.water.combinations).not.toContain("삼합 성국");
    expect(transformed.water.combinations).toContain("삼합 성국");
  });
});

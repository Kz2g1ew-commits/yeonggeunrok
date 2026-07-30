import { describe, expect, it } from "vitest";
import { calculateDaoAffinity } from "@/lib/spiritual-root/calculateDaoAffinity";
import { analysisContext, evidenceSet, testPillars } from "../fixtures";

describe("calculateDaoAffinity", () => {
  it("recognizes a rooted, supported and quietly flowing chart as a natural Dao path", () => {
    const evidence = evidenceSet({ wood: 8, fire: 7, earth: 6, metal: 7, water: 10 });
    evidence.water.monthCommand = true;
    evidence.water.roots = ["子", "亥"];
    evidence.water.supportScore = 1;
    const context = analysisContext(evidence, { season: "winter" });
    const result = calculateDaoAffinity(testPillars, evidence, context.relations, "natural-seed");
    expect(result.path).toBe("natural");
    expect(result.reasons.some((reason) => reason.includes("득령"))).toBe(true);
  });

  it("recognizes hostile season, conflict and rescue as a defiant Dao path", () => {
    const evidence = evidenceSet({ wood: 3, fire: 15, earth: 4, metal: 2, water: 1 });
    evidence.fire.monthCommand = false;
    evidence.fire.roots = ["午", "巳"];
    evidence.fire.supportScore = 1;
    const pillars = {
      ...testPillars,
      month: { ...testPillars.month, branch: "亥", branchElement: "water" as const },
      day: { ...testPillars.day, stem: "丙", stemElement: "fire" as const },
    };
    const relations = {
      ...analysisContext(evidence).relations,
      clashes: ["사·해 충"], punishments: ["인·사·신 형"], dynamicCount: 4,
    };
    const result = calculateDaoAffinity(pillars, evidence, relations, "defiant-seed");
    expect(result.path).toBe("defiant");
    expect(result.reasons.some((reason) => reason.includes("역령") || reason.includes("충중유구"))).toBe(true);
  });

  it("is deterministic for the same chart and seed", () => {
    const evidence = evidenceSet({ wood: 7, fire: 6, earth: 5, metal: 4, water: 8 });
    const relations = analysisContext(evidence).relations;
    expect(calculateDaoAffinity(testPillars, evidence, relations, "same-seed"))
      .toEqual(calculateDaoAffinity(testPillars, evidence, relations, "same-seed"));
  });
});

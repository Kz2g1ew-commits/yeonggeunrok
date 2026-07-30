import { describe, expect, it } from "vitest";
import type { Element, FourPillars } from "@/types/bazi";
import { detectMutationRoots } from "@/lib/spiritual-root/detectMutationRoots";
import { analysisContext, evidenceSet, testPillars } from "../fixtures";

function candidate(id: string, elements: Partial<Record<Element, number>>, context = {}) {
  return detectMutationRoots(analysisContext(evidenceSet(elements), context)).find((item) => item.id === id)!;
}

describe("detectMutationRoots", () => {
  it("confirms ice for effective metal-water in a cold structure with weak fire", () => {
    const evidence = evidenceSet({ metal: 9, water: 10 });
    evidence.water.monthCommand = true;
    evidence.water.roots = ["亥", "子"];
    const pillars: FourPillars = { ...testPillars, month: { ...testPillars.month, branch: "亥", branchElement: "water" } };
    const ice = detectMutationRoots(analysisContext(evidence, { season: "winter", pillars })).find((item) => item.id === "ice")!;
    expect(ice.status).toBe("confirmed");
  });

  it("confirms lightning for balanced wood-fire with dynamic clashes", () => {
    const lightning = candidate("lightning", { wood: 9, fire: 9 }, { relations: { combinations: [], halfCombinations: [], archingCombinations: [], directionalCombinations: [], sixCombinations: [], clashes: ["인·신 충"], punishments: [], harms: [], breaks: [], stemCombinations: [], dynamicCount: 2 } });
    expect(["confirmed", "likely"]).toContain(lightning.status);
  });

  it("confirms lava in a hot fire-earth structure with weak water", () => {
    const pillars: FourPillars = { ...testPillars, month: { ...testPillars.month, branch: "午", branchElement: "fire" } };
    const lava = candidate("lava", { fire: 10, earth: 9 }, { season: "summer", pillars });
    expect(lava.status).toBe("confirmed");
  });

  it("finds a wind candidate for water-wood with movement", () => {
    const wind = candidate("wind-moist", { water: 8, wood: 8 }, { relations: { combinations: [], halfCombinations: [], archingCombinations: [], directionalCombinations: [], sixCombinations: [], clashes: ["인·신 충"], punishments: [], harms: [], breaks: [], stemCombinations: [], dynamicCount: 2 } });
    expect(["confirmed", "likely", "possible"]).toContain(wind.status);
  });

  it("prevents mutation confirmation when a strong third root is effective", () => {
    const ice = candidate("ice", { metal: 10, water: 10, earth: 11 }, { season: "winter" });
    expect(ice.status).not.toBe("confirmed");
    expect(ice.blockers.some((blocker) => blocker.includes("제3"))).toBe(true);
  });

  it("keeps multiple fire-metal candidates visible at an ambiguous boundary", () => {
    const evidence = evidenceSet({ fire: 8, metal: 8 }, ["earth"]);
    evidence.earth.score = 3;
    const active = detectMutationRoots(analysisContext(evidence, {
      relations: { combinations: [], halfCombinations: [], archingCombinations: [], directionalCombinations: [], sixCombinations: [], clashes: ["묘·유 충"], punishments: [], harms: [], breaks: [], stemCombinations: [], dynamicCount: 2 },
    })).filter((item) => ["light", "purple-lightning"].includes(item.id) && item.status !== "rejected");
    expect(active).toHaveLength(2);
  });
});

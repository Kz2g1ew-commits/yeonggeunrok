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
    const context = { relations: { combinations: [], halfCombinations: [], archingCombinations: [], directionalCombinations: [], sixCombinations: [], clashes: ["인·신 충"], punishments: [], harms: [], breaks: [], stemCombinations: [], dynamicCount: 2 } };
    const lightning = candidate("lightning", { wood: 9, fire: 9 }, context);
    expect(["confirmed", "likely"]).toContain(lightning.status);
    expect(detectMutationRoots(analysisContext(evidenceSet({ wood: 9, fire: 9 }), context))[0].id).toBe("lightning");
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

  it("selects liquid poison over wind when damp conflict is stronger than movement", () => {
    const pillars: FourPillars = {
      ...testPillars,
      month: { ...testPillars.month, branch: "丑", branchElement: "earth" },
    };
    const relations = { combinations: [], halfCombinations: [], archingCombinations: [], directionalCombinations: [], sixCombinations: [], clashes: [], punishments: [], harms: ["자·미 해"], breaks: [], stemCombinations: [], dynamicCount: 1 };
    const candidates = detectMutationRoots(analysisContext(evidenceSet({ water: 9, wood: 9 }), { pillars, relations, season: "winter" }));
    expect(candidates[0].id).toBe("poison-liquid");
    expect(candidates[0].status).toBe("confirmed");
  });

  it("confirms shadow root in a cold and submerged water-earth structure", () => {
    const candidates = detectMutationRoots(analysisContext(evidenceSet({ water: 9, earth: 9 }), { season: "winter" }));
    expect(candidates[0].id).toBe("shadow");
    expect(candidates[0].status).toBe("confirmed");
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
    expect(active.find((item) => item.id === "purple-lightning")?.status).toBe("confirmed");
    expect(active.find((item) => item.id === "light")?.status).not.toBe("confirmed");
  });

  it("selects light root for balanced fire-metal without a direct clash", () => {
    const candidates = detectMutationRoots(analysisContext(evidenceSet({ fire: 8, metal: 11.8 })));
    expect(candidates[0].id).toBe("light");
    expect(candidates[0].status).toBe("confirmed");
  });

  it("confirms sword root when rooted wood and metal are forged through a cutting clash", () => {
    const sword = candidate("sword", { wood: 9, metal: 9 }, {
      relations: { combinations: [], halfCombinations: [], archingCombinations: [], directionalCombinations: [], sixCombinations: [], clashes: ["인·신 충"], punishments: [], harms: [], breaks: [], stemCombinations: [], dynamicCount: 2 },
    });
    expect(sword.status).toBe("confirmed");
    expect(sword.satisfiedConditions).toContain("인·신 또는 묘·유 충이 금목의 절단 상극을 활성화함");
  });

  it("keeps balanced wood-metal as only a sword candidate without a cutting clash", () => {
    const pillars: FourPillars = {
      ...testPillars,
      hour: { ...testPillars.hour, branch: "酉", branchElement: "metal" },
    };
    const sword = candidate("sword", { wood: 9, metal: 9 }, { pillars });
    expect(sword.status).not.toBe("confirmed");
    expect(sword.missingConditions.some((reason) => reason.includes("절단"))).toBe(true);
  });

  it("does not use a weak network-assisted channel as mutation material", () => {
    const evidence = evidenceSet({ metal: 8, water: 5 });
    evidence.water.activationOrigin = "network-assisted";
    const ice = detectMutationRoots(analysisContext(evidence, {
      season: "winter",
      climate: { temperature: -1, moisture: 1, temperatureLabel: "냉량", moistureLabel: "한습", reasons: [] },
    })).find((item) => item.id === "ice")!;
    expect(ice.status).not.toBe("confirmed");
    expect(ice.missingConditions.some((reason) => reason.includes("실제 작동 기맥"))).toBe(true);
  });

  it("rejects ice confirmation when the whole chart is hot and dry", () => {
    const evidence = evidenceSet({ metal: 9, water: 9 });
    evidence.water.monthCommand = true;
    const ice = detectMutationRoots(analysisContext(evidence, {
      season: "winter",
      climate: { temperature: 1.2, moisture: -0.6, temperatureLabel: "온난", moistureLabel: "편조", reasons: [] },
    })).find((item) => item.id === "ice")!;
    expect(ice.status).not.toBe("confirmed");
    expect(ice.blockers.some((blocker) => blocker.includes("조열"))).toBe(true);
  });
});

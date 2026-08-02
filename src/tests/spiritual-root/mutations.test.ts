import { describe, expect, it } from "vitest";
import type { Element, FourPillars } from "@/types/bazi";
import { detectMutationRoots } from "@/lib/spiritual-root/detectMutationRoots";
import { analysisContext, evidenceSet, pillar, testPillars } from "../fixtures";

function candidate(id: string, elements: Partial<Record<Element, number>>, context = {}) {
  return detectMutationRoots(analysisContext(evidenceSet(elements), context)).find((item) => item.id === id)!;
}

function setStableRoot(
  evidence: ReturnType<typeof evidenceSet>,
  element: Element,
  branch: string,
  stem: string,
  role: "main" | "middle" | "residual" = "main",
  strength = 1,
) {
  evidence[element].roots = [branch];
  evidence[element].rootStrength = strength;
  evidence[element].rootDetails = [{ branch, stem, role, strength, clashState: "stable", damaged: false }];
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
    expect(lightning.status).toBe("confirmed");
    const candidates = detectMutationRoots(analysisContext(evidenceSet({ wood: 9, fire: 9 }), context));
    expect(candidates[0].id).toBe("lightning");
    expect(candidates.filter((item) => ["lightning", "wind-hot"].includes(item.id) && item.status === "confirmed")).toHaveLength(1);
  });

  it("confirms lava in a hot fire-earth structure with weak water", () => {
    const pillars: FourPillars = { ...testPillars, month: { ...testPillars.month, branch: "午", branchElement: "fire" } };
    const lava = candidate("lava", { fire: 10, earth: 9 }, { season: "summer", pillars });
    expect(lava.status).toBe("confirmed");
  });

  it("finds a wind candidate for water-wood with movement", () => {
    const wind = candidate("wind-moist", { water: 8, wood: 8 }, { relations: { combinations: [], halfCombinations: [], archingCombinations: [], directionalCombinations: [], sixCombinations: [], clashes: ["인·신 충"], punishments: [], harms: [], breaks: [], stemCombinations: [], dynamicCount: 2 } });
    expect(wind.status).toBe("confirmed");
  });

  it("confirms hot wind when rooted wood-fire rises through a moving structure", () => {
    const wind = candidate("wind-hot", { wood: 9, fire: 9 }, {
      shensha: [{
        id: "yima", name: "역마살", category: "mobility", polarity: "mixed", present: true,
        effective: true, status: "active", strength: 1, integrity: 100, occurrenceCount: 1,
        damage: [], matches: [], evidence: [], traits: [], paths: [], weapons: [], techniques: [], risks: [],
      }],
    });
    expect(wind.status).toBe("confirmed");
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
    const waterWood = candidates.filter((item) => ["wind-moist", "poison-liquid"].includes(item.id));
    expect(waterWood.filter((item) => item.status === "confirmed")).toHaveLength(1);
    expect(waterWood.find((item) => item.id === "wind-moist")?.blockers.some((item) => item.includes("동일 원재료"))).toBe(true);
  });

  it("confirms shadow root in a cold and submerged water-earth structure", () => {
    const candidates = detectMutationRoots(analysisContext(evidenceSet({ water: 9, earth: 9 }), { season: "winter" }));
    expect(candidates[0].id).toBe("shadow");
    expect(candidates[0].status).toBe("confirmed");
  });

  it("confirms decay poison for rooted wood-earth in a damp damaged structure", () => {
    const poison = candidate("poison-decay", { wood: 9, earth: 9 }, {
      climate: { temperature: 0, moisture: 1, temperatureLabel: "중화", moistureLabel: "윤습", reasons: [] },
      relations: { combinations: [], halfCombinations: [], archingCombinations: [], directionalCombinations: [], sixCombinations: [], clashes: [], punishments: [], harms: ["자·미 해"], breaks: [], stemCombinations: [], dynamicCount: 1 },
    });
    expect(poison.status).toBe("confirmed");
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

  it("confirms crystal only when earth storage and metal main roots condense in a stable structure", () => {
    const evidence = evidenceSet({ earth: 9, metal: 9 });
    setStableRoot(evidence, "earth", "辰", "戊");
    setStableRoot(evidence, "metal", "酉", "辛");
    const pillars: FourPillars = {
      year: pillar("戊", "辰"), month: pillar("辛", "酉"),
      day: pillar("己", "丑"), hour: pillar("庚", "申"),
    };
    const crystal = detectMutationRoots(analysisContext(evidence, {
      pillars,
      climate: { temperature: 0, moisture: 0.2, temperatureLabel: "중화", moistureLabel: "중화", reasons: [] },
    })).find((item) => item.id === "crystal")!;

    expect(crystal.name).toBe("정(晶)");
    expect(crystal.status).toBe("confirmed");
    expect(crystal.satisfiedConditions.some((item) => item.includes("진·유 합"))).toBe(true);
  });

  it("does not turn a plain earth-metal generating pair into crystal without both proper roots", () => {
    const crystal = candidate("crystal", { earth: 9, metal: 9 }, {
      climate: { temperature: 0, moisture: 0, temperatureLabel: "중화", moistureLabel: "중화", reasons: [] },
    });
    expect(crystal.status).not.toBe("confirmed");
    expect(crystal.blockers.some((item) => item.includes("토의 저장근"))).toBe(true);
    expect(crystal.blockers.some((item) => item.includes("금의 본근"))).toBe(true);
  });

  it("blocks crystal when excessive earth buries metal or conflict shatters condensation", () => {
    const evidence = evidenceSet({ earth: 12.6, metal: 9 });
    setStableRoot(evidence, "earth", "辰", "戊");
    setStableRoot(evidence, "metal", "酉", "辛");
    const crystal = detectMutationRoots(analysisContext(evidence, {
      climate: { temperature: 0, moisture: 0, temperatureLabel: "중화", moistureLabel: "중화", reasons: [] },
      relations: { combinations: [], halfCombinations: [], archingCombinations: [], directionalCombinations: [], sixCombinations: [], clashes: ["묘·유 충"], punishments: [], harms: [], breaks: [], stemCombinations: [], dynamicCount: 2 },
    })).find((item) => item.id === "crystal")!;

    expect(crystal.status).not.toBe("confirmed");
    expect(crystal.blockers.some((item) => item.includes("토다금매"))).toBe(true);
    expect(crystal.blockers.some((item) => item.includes("결정격자를 파쇄"))).toBe(true);
  });

  it("confirms cloud for balanced rooted fire-water in temperate moist qi", () => {
    const evidence = evidenceSet({ fire: 9, water: 9 });
    setStableRoot(evidence, "fire", "午", "丁");
    setStableRoot(evidence, "water", "亥", "壬");
    const pillars: FourPillars = {
      year: pillar("壬", "亥"), month: pillar("戊", "辰"),
      day: pillar("丁", "午"), hour: pillar("辛", "酉"),
    };
    const cloud = detectMutationRoots(analysisContext(evidence, {
      pillars,
      climate: { temperature: 0.1, moisture: 0.5, temperatureLabel: "중화", moistureLabel: "윤습", reasons: [] },
    })).find((item) => item.id === "cloud")!;

    expect(cloud.name).toBe("운(雲)");
    expect(cloud.status).toBe("confirmed");
    expect(cloud.satisfiedConditions.some((item) => item.includes("기화와 응결"))).toBe(true);
  });

  it("blocks cloud when fire and water meet through a direct clash", () => {
    const evidence = evidenceSet({ fire: 9, water: 9 });
    setStableRoot(evidence, "fire", "午", "丁");
    setStableRoot(evidence, "water", "子", "癸");
    const pillars: FourPillars = {
      year: pillar("癸", "子"), month: pillar("戊", "辰"),
      day: pillar("丁", "午"), hour: pillar("辛", "酉"),
    };
    const cloud = detectMutationRoots(analysisContext(evidence, {
      pillars,
      climate: { temperature: 0, moisture: 0.4, temperatureLabel: "중화", moistureLabel: "윤습", reasons: [] },
      relations: { combinations: [], halfCombinations: [], archingCombinations: [], directionalCombinations: [], sixCombinations: [], clashes: ["자·오 충"], punishments: [], harms: [], breaks: [], stemCombinations: [], dynamicCount: 2 },
    })).find((item) => item.id === "cloud")!;

    expect(cloud.status).not.toBe("confirmed");
    expect(cloud.blockers.some((item) => item.includes("수화 직접충"))).toBe(true);
  });

  it("blocks cloud when either qi is unrooted or the climate is one-sided", () => {
    const evidence = evidenceSet({ fire: 9, water: 9 });
    setStableRoot(evidence, "fire", "午", "丁");
    evidence.water.rootDetails = [];
    evidence.water.roots = [];
    evidence.water.rootStrength = 0;
    const cloud = detectMutationRoots(analysisContext(evidence, {
      climate: { temperature: 1.3, moisture: -0.6, temperatureLabel: "조열", moistureLabel: "편조", reasons: [] },
    })).find((item) => item.id === "cloud")!;

    expect(cloud.status).not.toBe("confirmed");
    expect(cloud.blockers.some((item) => item.includes("수기가 무근"))).toBe(true);
    expect(cloud.blockers.some((item) => item.includes("편고한 조후"))).toBe(true);
  });
});

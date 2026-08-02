import { describe, expect, it } from "vitest";
import type { Element } from "@/types/bazi";
import { classifyRootCount } from "@/lib/spiritual-root/classifyRootCount";
import { evidenceSet } from "../fixtures";
import type { MutationCandidate } from "@/types/spiritualRoot";

const relations = { combinations: [], halfCombinations: [], archingCombinations: [], directionalCombinations: [], sixCombinations: [], clashes: [], punishments: [], harms: [], breaks: [], stemCombinations: [], dynamicCount: 0 };

describe("classifyRootCount", () => {
  const cases: Array<[Element[], string]> = [
    [[], "none"], [["wood"], "single"], [["wood", "fire"], "dual"],
    [["water", "wood", "fire"], "triple"], [["wood", "fire", "earth", "metal"], "quadruple"],
    [["wood", "fire", "earth", "metal", "water"], "five"],
  ];

  it.each(cases)("classifies %s as %s", (elements, expected) => {
    const scores = Object.fromEntries(elements.map((element) => [element, 7])) as Partial<Record<Element, number>>;
    const result = classifyRootCount(elements, [], evidenceSet(scores), relations);
    expect(result.rootCount).toBe(expected);
  });

  it("marks two sub-threshold roots as a hidden-root-body candidate", () => {
    const evidence = evidenceSet({ wood: 3, water: 3 }, ["wood", "water"]);
    expect(classifyRootCount([], ["wood", "water"], evidence, relations).displayName).toContain("은근체 후보");
  });

  it("identifies a generating triple", () => {
    const elements: Element[] = ["water", "wood", "fire"];
    expect(classifyRootCount(elements, [], evidenceSet({ water: 7, wood: 8, fire: 7 }), relations).displayName).toContain("순생");
  });

  it("keeps a balanced formation-supported complete cycle within five-qi convergence", () => {
    const elements: Element[] = ["wood", "fire", "earth", "metal", "water"];
    const evidence = evidenceSet({ wood: 8, fire: 8, earth: 7.5, metal: 7, water: 8 });
    evidence.water.combinations = ["삼합 성국"];
    const result = classifyRootCount(elements, [], evidence, relations);
    expect(result.displayName).toBe("오기조원영근 — 오기조원형·원융");
    expect(result.multiRootProfile?.generatingLinks).toHaveLength(5);
    expect(result.multiRootProfile?.formationSupport).toBe(true);
    expect(result.qualityRank).toBe(2);
    expect(result.qualityLabel).toBe("천영근 준급");
  });

  it("distinguishes a balanced generating four-root structure by its missing element", () => {
    const elements: Element[] = ["wood", "fire", "earth", "metal"];
    const result = classifyRootCount(elements, [], evidenceSet({ wood: 7, fire: 7, earth: 7, metal: 7 }), relations);
    expect(result.displayName).toBe("사영근 — 수 결핍 · 균형순생형");
    expect(result.multiRootProfile?.generatingLinks).toEqual(["목생화", "화생토", "토생금"]);
    expect(result.multiRootProfile?.cautions[0]).toContain("금생수·수생목");
    expect(result.multiRootProfile?.preserveAllRoots).toBe(false);
    expect(result.multiRootProfile?.refinementPath).toContain("수 결핍은 내적 개맥 없이 유지");
  });

  it("marks a strongly dominant four-root structure with its leading element", () => {
    const elements: Element[] = ["wood", "fire", "earth", "metal"];
    const result = classifyRootCount(elements, [], evidenceSet({ wood: 7, fire: 14, earth: 7, metal: 7 }), relations);
    expect(result.displayName).toContain("화 주근편중형");
    expect(result.multiRootProfile?.dominantElement).toBe("fire");
    expect(result.multiRootProfile?.scoreSpread).toBe(7);
  });

  it("opens a harmonious five-qi convergence through a complete cycle without formation support", () => {
    const elements: Element[] = ["wood", "fire", "earth", "metal", "water"];
    const result = classifyRootCount(elements, [], evidenceSet({ wood: 8, fire: 8, earth: 8, metal: 8, water: 8 }), relations);
    expect(result.displayName).toBe("오기조원영근 — 오기조원형·원융");
    expect(result.multiRootProfile?.cycleState).toBe("complete");
    expect(result.multiRootProfile?.formationSupport).toBe(false);
    expect(result.multiRootProfile?.preserveAllRoots).toBe(true);
    expect(result.multiRootProfile?.refinementPath).toContain("완성된 상생환을 끊지");
  });

  it("keeps a turbulent complete cycle as a five-qi convergence with a turbid-flow warning", () => {
    const elements: Element[] = ["wood", "fire", "earth", "metal", "water"];
    const turbulent = {
      ...relations,
      clashes: ["충1", "충2"], punishments: ["형1"], harms: ["해1"], dynamicCount: 4,
    };
    const result = classifyRootCount(elements, [], evidenceSet({ wood: 8, fire: 8, earth: 8, metal: 8, water: 8 }), turbulent);
    expect(result.displayName).toBe("오기조원영근 — 오기조원형·탁류");
    expect(result.multiRootProfile?.conflictLevel).toBe("turbulent");
    expect(result.qualityRank).toBe(5);
  });

  it("keeps a strongly biased complete cycle as a biased five-qi convergence", () => {
    const elements: Element[] = ["wood", "fire", "earth", "metal", "water"];
    const result = classifyRootCount(elements, [], evidenceSet({ wood: 8, fire: 8, earth: 18.1, metal: 8, water: 8 }), relations);
    expect(result.displayName).toBe("오기조원영근 — 오기조원형·편기");
    expect(result.qualityRank).toBe(4);
    expect(result.qualityLabel).toBe("오기조원 중등형");
  });

  it("places a stable flowing cycle between harmonious and biased five-qi roots", () => {
    const elements: Element[] = ["wood", "fire", "earth", "metal", "water"];
    const result = classifyRootCount(elements, [], evidenceSet({ wood: 7, fire: 7, earth: 7, metal: 15, water: 7 }), relations);
    expect(result.displayName).toBe("오기조원영근 — 오기조원형·유통");
    expect(result.qualityRank).toBe(3);
    expect(result.qualityLabel).toBe("오기조원 상등형");
  });

  it("uses dedicated five-qi convergence boundaries instead of ordinary multi-root balance", () => {
    const elements: Element[] = ["wood", "fire", "earth", "metal", "water"];
    const mixed = { ...relations, clashes: ["충1"], harms: ["해1"], dynamicCount: 2 };
    const turbulent = {
      ...relations,
      clashes: ["충1", "충2"], punishments: ["형1"], harms: ["해1"], dynamicCount: 4,
    };
    const classifySpread = (spread: number, activeRelations = relations) => classifyRootCount(
      elements,
      [],
      evidenceSet({ wood: 8, fire: 8, earth: 8 + spread, metal: 8, water: 8 }),
      activeRelations,
    ).multiRootProfile?.fiveRootVariant;

    expect(classifySpread(7)).toBe("원융");
    expect(classifySpread(7, mixed)).toBe("유통");
    expect(classifySpread(7.1)).toBe("유통");
    expect(classifySpread(10)).toBe("유통");
    expect(classifySpread(10.1)).toBe("편기");
    expect(classifySpread(6, turbulent)).toBe("탁류");
  });

  it("does not grant five-qi convergence when one generating link is inactive", () => {
    const elements: Element[] = ["wood", "fire", "earth", "metal", "water"];
    const evidence = evidenceSet({ wood: 8, fire: 8, earth: 8, metal: 8, water: 8 });
    evidence.water = { ...evidence.water, supportScore: 0, contributions: [] };
    const result = classifyRootCount(elements, [], evidence, relations);
    expect(result.displayName).toBe("오행균형영근 — 오행원융형");
    expect(result.multiRootProfile?.cycleState).toBe("strong");
    expect(result.multiRootProfile?.generatingLinks).toHaveLength(4);
  });

  it("does not erase a second effective root without a heavenly condensation result", () => {
    const result = classifyRootCount(
      ["wood", "earth"],
      [],
      evidenceSet({ wood: 19, earth: 3 }),
      relations,
    );
    expect(result.qualityTier).toBe("dual");
    expect(result.rootCount).toBe("dual");
  });

  it("places a confirmed mutation above a normal dual root", () => {
    const mutation: MutationCandidate = {
      id: "ice", name: "빙", sourceElements: ["metal", "water"], score: 90, confidence: 90,
      status: "confirmed", satisfiedConditions: [], missingConditions: [], blockers: [], description: "test",
    };
    const result = classifyRootCount(
      ["metal", "water"],
      [],
      evidenceSet({ metal: 9, water: 9 }),
      relations,
      mutation,
    );
    expect(result.qualityTier).toBe("mutation");
    expect(result.qualityRank).toBe(2);
    expect(result.rootCount).toBe("single");
  });

  it("keeps likely fusion as a dual-root candidate instead of a final mutation", () => {
    const mutation: MutationCandidate = {
      id: "ice", name: "빙", sourceElements: ["metal", "water"], score: 72, confidence: 72,
      status: "likely", satisfiedConditions: [], missingConditions: [], blockers: [], description: "test",
    };
    const result = classifyRootCount(
      ["metal", "water"],
      [],
      evidenceSet({ metal: 9, water: 9 }),
      relations,
      mutation,
    );
    expect(result.qualityTier).toBe("dual");
    expect(result.rootCount).toBe("dual");
    expect(result.displayName).toContain("빙영근 유력");
  });

  it("does not collapse three effective roots even if one pair has a confirmed mutation", () => {
    const mutation: MutationCandidate = {
      id: "ice", name: "빙", sourceElements: ["metal", "water"], score: 90, confidence: 90,
      status: "confirmed", satisfiedConditions: [], missingConditions: [], blockers: [], description: "test",
    };
    const result = classifyRootCount(
      ["earth", "metal", "water"],
      [],
      evidenceSet({ earth: 8, metal: 9, water: 9 }),
      relations,
      mutation,
    );
    expect(result.qualityTier).toBe("triple");
    expect(result.rootCount).toBe("triple");
  });
});

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

  it("requires balanced scores, low conflict and structural support for Hunyuan", () => {
    const elements: Element[] = ["wood", "fire", "earth", "metal", "water"];
    const supported = { ...relations, combinations: ["삼합"] };
    const result = classifyRootCount(elements, [], evidenceSet({ wood: 8, fire: 8, earth: 7.5, metal: 7, water: 8 }), supported);
    expect(result.displayName).toBe("혼원오행영근 — 오기조원형");
    expect(result.multiRootProfile?.generatingLinks).toHaveLength(5);
    expect(result.multiRootProfile?.formationSupport).toBe(true);
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

  it("keeps a balanced complete cycle below Hunyuan without formation support", () => {
    const elements: Element[] = ["wood", "fire", "earth", "metal", "water"];
    const result = classifyRootCount(elements, [], evidenceSet({ wood: 8, fire: 8, earth: 8, metal: 8, water: 8 }), relations);
    expect(result.displayName).toBe("오행균형영근 — 오행원융형");
    expect(result.multiRootProfile?.cycleState).toBe("complete");
    expect(result.multiRootProfile?.formationSupport).toBe(false);
    expect(result.multiRootProfile?.preserveAllRoots).toBe(true);
    expect(result.multiRootProfile?.refinementPath).toContain("다섯 기맥을 모두 보전");
  });

  it("distinguishes turbulent five-root qi from a balanced root", () => {
    const elements: Element[] = ["wood", "fire", "earth", "metal", "water"];
    const turbulent = {
      ...relations,
      clashes: ["충1", "충2"], punishments: ["형1"], harms: ["해1"], dynamicCount: 4,
    };
    const result = classifyRootCount(elements, [], evidenceSet({ wood: 8, fire: 8, earth: 8, metal: 8, water: 8 }), turbulent);
    expect(result.displayName).toBe("오행잡영근 — 충극혼탁형");
    expect(result.multiRootProfile?.conflictLevel).toBe("turbulent");
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
});

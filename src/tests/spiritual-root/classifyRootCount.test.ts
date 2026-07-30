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
    expect(classifyRootCount(elements, [], evidenceSet({ wood: 8, fire: 8, earth: 7.5, metal: 7, water: 8 }), supported).displayName).toBe("혼원오행영근");
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

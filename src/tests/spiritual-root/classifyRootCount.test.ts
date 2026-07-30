import { describe, expect, it } from "vitest";
import type { Element } from "@/types/bazi";
import { classifyRootCount } from "@/lib/spiritual-root/classifyRootCount";
import { evidenceSet } from "../fixtures";

const relations = { combinations: [], halfCombinations: [], directionalCombinations: [], clashes: [], punishments: [], harms: [], breaks: [], stemCombinations: [], dynamicCount: 0 };

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
});

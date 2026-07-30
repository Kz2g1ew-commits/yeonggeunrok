import { describe, expect, it } from "vitest";
import { buildResultShareCardModel } from "@/lib/share/resultShareCard";
import { evidenceSet } from "@/tests/fixtures";
import type { SpiritualRootResult } from "@/types/spiritualRoot";

describe("result share card privacy model", () => {
  it("contains only the root result and five-element composition", () => {
    const result = {
      displayName: "금수 이영근",
      elementEvidence: evidenceSet({ wood: 2.5, fire: 5, earth: 12.5, metal: 15, water: 15 }),
    } as SpiritualRootResult;

    const model = buildResultShareCardModel(result);

    expect(Object.keys(model)).toEqual([
      "serviceName",
      "rootName",
      "elements",
      "ratioNote",
      "privacyNote",
    ]);
    expect(model.rootName).toBe("금수 이영근");
    expect(model.elements.map(({ label, ratio }) => [label, ratio])).toEqual([
      ["목", 5],
      ["화", 10],
      ["토", 25],
      ["금", 30],
      ["수", 30],
    ]);

    const serialized = JSON.stringify(model);
    for (const forbiddenField of ["birth", "input", "pillar", "stem", "branch", "timezone", "city", "longitude", "gender"]) {
      expect(serialized.toLowerCase()).not.toContain(forbiddenField);
    }
  });

  it("clamps malformed ratios before drawing", () => {
    const evidence = evidenceSet({ wood: 1, fire: 1, earth: 1, metal: 1, water: 1 });
    evidence.wood.presenceRatio = -3;
    evidence.water.presenceRatio = 130;
    const result = { displayName: "오영근", elementEvidence: evidence } as SpiritualRootResult;

    const model = buildResultShareCardModel(result);

    expect(model.elements[0].ratio).toBe(0);
    expect(model.elements[4].ratio).toBe(100);
  });
});

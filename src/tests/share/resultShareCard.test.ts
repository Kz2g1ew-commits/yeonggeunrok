import { describe, expect, it } from "vitest";
import { buildResultShareCardModel } from "@/lib/share/resultShareCard";
import { evidenceSet } from "@/tests/fixtures";
import type { SpiritualRootResult } from "@/types/spiritualRoot";

describe("result share card privacy model", () => {
  it("contains only root details and five-element activation scores", () => {
    const result = {
      displayName: "금수 이영근",
      elementEvidence: evidenceSet({ wood: 2.5, fire: 5, earth: 12.5, metal: 15, water: 15 }),
      classification: { qualityLabel: "상등", rarityLabel: "희귀" },
      primaryElements: ["metal", "water"],
      potentialElements: ["earth"],
      mutations: [{ name: "빙", status: "likely", confidence: 82 }],
    } as unknown as SpiritualRootResult;

    const model = buildResultShareCardModel(result);

    expect(Object.keys(model)).toEqual([
      "serviceName",
      "rootName",
      "quality",
      "primaryRoots",
      "potentialRoots",
      "mutation",
      "elements",
      "activationNote",
      "privacyNote",
    ]);
    expect(model.rootName).toBe("금수 이영근");
    expect(model.quality).toBe("상등 · 희귀");
    expect(model.primaryRoots).toBe("금(金) · 수(水)");
    expect(model.potentialRoots).toBe("토(土)");
    expect(model.mutation).toBe("빙영근 · 유력 82%");
    expect(model.elements.map(({ label, activationScore }) => [label, activationScore])).toEqual([
      ["목", 2.5],
      ["화", 5],
      ["토", 12.5],
      ["금", 15],
      ["수", 15],
    ]);

    const serialized = JSON.stringify(model);
    for (const forbiddenField of ["birth", "input", "pillar", "stem", "branch", "timezone", "city", "longitude", "gender"]) {
      expect(serialized.toLowerCase()).not.toContain(forbiddenField);
    }
  });

  it("normalizes malformed activation scores before drawing", () => {
    const evidence = evidenceSet({ wood: 1, fire: 1, earth: 1, metal: 1, water: 1 });
    evidence.wood.score = -3;
    evidence.water.score = Number.NaN;
    const result = {
      displayName: "오영근",
      elementEvidence: evidence,
      classification: { qualityLabel: "범품", rarityLabel: "보통" },
      primaryElements: [], potentialElements: [], mutations: [],
    } as unknown as SpiritualRootResult;

    const model = buildResultShareCardModel(result);

    expect(model.elements[0].activationScore).toBe(0);
    expect(model.elements[4].activationScore).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { buildResultShareCardModel } from "@/lib/share/resultShareCard";
import { evidenceSet } from "@/tests/fixtures";
import type { SpiritualRootResult } from "@/types/spiritualRoot";

const shareResultDetails = {
  talentProfile: {
    title: "천교 天驕",
    summary: "근골과 오성이 함께 두드러집니다.",
    dimensions: {
      rootBone: { name: "근골", score: 82, label: "천품 근골" },
      insight: { name: "오성", score: 74, label: "오성이 발달함" },
      combat: { name: "투골", score: 51, label: "전투 감각이 민감함" },
      soul: { name: "신혼", score: 63, label: "신혼 감응이 예민함" },
      providence: { name: "기운", score: 48, label: "기운이 평범함" },
    },
    specialEffects: [{ name: "선천도심 先天道心" }],
  },
  recommendedPaths: ["수계 유전공", "빙계 술법"],
  recommendedWeapons: ["유수검"],
  recommendedTechniques: ["유전술", "빙결술"],
  strengths: ["수 기맥이 선명함"],
  weaknesses: ["화 속성에 취약함"],
  risks: ["기맥 과부하"],
  growthDirection: "금생수의 흐름을 굳혀 빙계 변이를 완성하는 방향",
  awakening: { label: "균형 판정 · 선천 기감 개방", preHeaven: { stateLabel: "선천 기감 감응" } },
};

describe("result share card privacy model", () => {
  it("contains only root details and five-element activation scores", () => {
    const result = {
      displayName: "금수 이영근",
      elementEvidence: evidenceSet({ wood: 2.5, fire: 5, earth: 12.5, metal: 15, water: 15 }),
      classification: { qualityLabel: "상등", rarityLabel: "희귀" },
      primaryElements: ["metal", "water"],
      potentialElements: ["earth"],
      mutations: [{ name: "빙", status: "likely", confidence: 82 }],
      ...shareResultDetails,
    } as unknown as SpiritualRootResult;

    const model = buildResultShareCardModel(result);

    expect(Object.keys(model)).toEqual([
      "serviceName",
      "rootName",
      "rootProfile",
      "awakening",
      "quality",
      "primaryRoots",
      "potentialRoots",
      "mutation",
      "elements",
      "talent",
      "cultivation",
      "activationNote",
      "privacyNote",
    ]);
    expect(model.rootName).toBe("금수 이영근");
    expect(model.rootProfile).toBe("기본 영근형");
    expect(model.awakening).toBe("균형 판정 · 선천 기감 개방");
    expect(model.quality).toBe("상등 · 희귀");
    expect(model.primaryRoots).toBe("금(金) · 수(水)");
    expect(model.potentialRoots).toBe("토(土)");
    expect(model.mutation).toBe("빙영근 · 유력 82%");
    expect(model.talent.title).toBe("천교 天驕");
    expect(model.talent.dimensions.map(({ name, score }) => [name, score])).toEqual([
      ["근골", 82], ["오성", 74], ["투골", 51], ["신혼", 63], ["기운", 48],
    ]);
    expect(model.talent.specialEffects).toEqual(["선천도심 先天道心"]);
    expect(model.cultivation.paths).toEqual(["수계 유전공", "빙계 술법"]);
    expect(model.cultivation.weaponsAndTechniques).toEqual(["유수검", "유전술", "빙결술"]);
    expect(model.cultivation.cautions).toEqual(["화 속성에 취약함", "기맥 과부하"]);
    expect(model.cultivation.growthDirection).toContain("빙계 변이");
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
      ...shareResultDetails,
    } as unknown as SpiritualRootResult;

    const model = buildResultShareCardModel(result);

    expect(model.elements[0].activationScore).toBe(0);
    expect(model.elements[4].activationScore).toBe(0);
  });
});

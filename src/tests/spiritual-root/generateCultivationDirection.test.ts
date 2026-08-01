import { describe, expect, it } from "vitest";
import type { Element } from "@/types/bazi";
import { classifyRootCount } from "@/lib/spiritual-root/classifyRootCount";
import { generateCultivationDirection } from "@/lib/spiritual-root/generateCultivationDirection";
import { evidenceSet } from "../fixtures";

const relations = {
  combinations: [], halfCombinations: [], archingCombinations: [], directionalCombinations: [],
  sixCombinations: [], clashes: [], punishments: [], harms: [], breaks: [], stemCombinations: [], dynamicCount: 0,
};

function direction(elements: Element[], scores: Partial<Record<Element, number>>, potentials: Element[] = []): string {
  const evidence = evidenceSet(scores, potentials);
  const classification = classifyRootCount(elements, potentials, evidence, relations);
  const ranked = [...elements].sort((a, b) => evidence[b].score - evidence[a].score);
  return generateCultivationDirection(classification, ranked, potentials);
}

describe("generateCultivationDirection", () => {
  it("keeps a missing fourth-root element closed and refines the weakest active root", () => {
    const result = direction(
      ["wood", "fire", "earth", "metal"],
      { wood: 12, fire: 9, earth: 7, metal: 5 },
    );
    expect(result).toContain("수 결핍은 내적 개맥 없이 유지");
    expect(result).toContain("금 약근을 먼저 봉근·세맥");
    expect(result).not.toContain("결핍을 보완");
  });

  it("reduces an ordinary five-root structure instead of completing every cycle", () => {
    const result = direction(
      ["wood", "fire", "earth", "metal", "water"],
      { wood: 14, fire: 9, earth: 8, metal: 7, water: 5 },
    );
    expect(result).toContain("수 약근을 첫 봉근 대상");
    expect(result).toContain("오영근에서 사영근·삼영근으로");
    expect(result).not.toContain("상생 고리를 보완");
  });

  it("preserves all five roots when their generating cycle is complete", () => {
    const result = direction(
      ["wood", "fire", "earth", "metal", "water"],
      { wood: 8, fire: 8, earth: 8, metal: 8, water: 8 },
    );
    expect(result).toContain("다섯 기맥을 모두 보전");
    expect(result).not.toContain("봉근 대상");
  });

  it("seals potential roots around a heavenly root", () => {
    const result = direction(["fire"], { fire: 19, water: 3 }, ["water"]);
    expect(result).toContain("화 주근만 깊게 정련");
    expect(result).toContain("수 잠재근은 추가 개맥하지 않고 봉근");
  });

  it("refines a triple root toward its two stronger channels", () => {
    const result = direction(["water", "wood", "fire"], { water: 10, wood: 8, fire: 5 });
    expect(result).toContain("화 약근을 봉근·세맥");
    expect(result).toContain("수·목 두 기맥으로 응축");
  });
});

import { describe, expect, it } from "vitest";
import { analyzeRelations } from "@/lib/bazi/relations";
import { pillar } from "../fixtures";

describe("branch combination qualification", () => {
  it("treats Shen-Chen without Zi as an arching candidate, not a half harmony", () => {
    // 천간은 이 관계 테스트에서 사용하지 않는 비명식 합성 자리값이다.
    const relations = analyzeRelations({
      year: pillar("甲", "申"), month: pillar("甲", "辰"),
      day: pillar("甲", "寅"), hour: pillar("甲", "亥"),
    });
    expect(relations.archingCombinations.some((item) => item.includes("신·진"))).toBe(true);
    expect(relations.halfCombinations).toHaveLength(0);
    expect(relations.sixCombinations.some((item) => item.includes("인·해"))).toBe(true);
  });

  it("recognizes a pair containing the cardinal branch as a half harmony", () => {
    const relations = analyzeRelations({
      year: pillar("壬", "申"), month: pillar("癸", "子"),
      day: pillar("甲", "寅"), hour: pillar("丁", "巳"),
    });
    expect(relations.halfCombinations.some((item) => item.includes("신·자"))).toBe(true);
    expect(relations.archingCombinations).toHaveLength(0);
  });
});

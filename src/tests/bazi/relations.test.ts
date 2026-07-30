import { describe, expect, it } from "vitest";
import { analyzeRelations } from "@/lib/bazi/relations";
import { pillar } from "../fixtures";

describe("branch combination qualification", () => {
  it("treats Shen-Chen without Zi as an arching candidate, not a half harmony", () => {
    const relations = analyzeRelations({
      year: pillar("癸", "未"), month: pillar("戊", "午"),
      day: pillar("丙", "辰"), hour: pillar("丙", "申"),
    });
    expect(relations.archingCombinations.some((item) => item.includes("신·진"))).toBe(true);
    expect(relations.halfCombinations).toHaveLength(0);
    expect(relations.sixCombinations.some((item) => item.includes("오·미"))).toBe(true);
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

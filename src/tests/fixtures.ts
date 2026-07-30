import type { BirthInput, Element, FourPillars, ShenshaResult } from "@/types/bazi";
import type { AnalysisContext, ElementEvidence } from "@/types/spiritualRoot";
import { BRANCHES } from "@/lib/bazi/branches";
import { STEMS } from "@/lib/bazi/stems";
import { ELEMENTS } from "@/lib/bazi/elementMeta";

export function birthInput(overrides: Partial<BirthInput> = {}): BirthInput {
  return {
    judgmentMode: "generous",
    calendarType: "solar", isLeapMonth: false, year: 2024, month: 2, day: 4, hour: 12, minute: 0,
    timezone: "Asia/Seoul", country: "대한민국", city: "서울", longitude: 126.978,
    longitudeIsApproximate: true, gender: "unspecified", applyLateZi: false,
    applyTrueSolarTime: false, timeAccuracy: "exact",
    shensha: { enabled: true, huagai: true, guimen: true, yima: true },
    ...overrides,
  };
}

function pillar(stem: string, branch: string) {
  return {
    stem, branch, stemElement: STEMS[stem].element, branchElement: BRANCHES[branch].element,
    stemYinYang: STEMS[stem].yinYang, branchYinYang: BRANCHES[branch].yinYang,
  };
}

export const testPillars: FourPillars = {
  year: pillar("甲", "辰"), month: pillar("丙", "寅"), day: pillar("壬", "子"), hour: pillar("庚", "申"),
};

export function evidenceSet(scores: Partial<Record<Element, number>>, potentials: Element[] = []): Record<Element, ElementEvidence> {
  return Object.fromEntries(ELEMENTS.map((element) => {
    const score = scores[element] ?? 0;
    return [element, {
      element, score, visibleStems: score >= 4 ? ["甲"] : [], roots: score >= 4 ? ["寅"] : [],
      hiddenStems: [], seasonalStrength: 0, supportScore: score >= 7 ? 1 : 0, controlPenalty: 0,
      combinations: [], clashes: [], effective: score >= 4, potential: potentials.includes(element),
      reasons: [], contributions: [], monthCommand: false,
    } satisfies ElementEvidence];
  })) as unknown as Record<Element, ElementEvidence>;
}

const blankShensha: ShenshaResult[] = [
  { id: "huagai", name: "화개살", present: false, evidence: [], traits: [] },
  { id: "guimen", name: "귀문관살", present: false, evidence: [], traits: [] },
  { id: "yima", name: "역마살", present: false, evidence: [], traits: [] },
];

export function analysisContext(
  evidence: Record<Element, ElementEvidence>,
  overrides: Partial<AnalysisContext> = {},
): AnalysisContext {
  return {
    pillars: testPillars,
    evidence,
    season: "spring",
    relations: { combinations: [], halfCombinations: [], directionalCombinations: [], clashes: [], punishments: [], harms: [], breaks: [], stemCombinations: [], dynamicCount: 0 },
    shensha: blankShensha,
    ...overrides,
  };
}

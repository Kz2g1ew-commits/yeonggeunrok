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
    shensha: { enabled: true, huagai: true, guimen: true, yima: true, noble: true, scholar: true, martial: true, charisma: true },
    ...overrides,
  };
}

export function pillar(stem: string, branch: string) {
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
      element, presenceScore: score * 10, presenceRatio: score * 2, baseScore: score, score,
      visibleStems: score >= 4 ? ["甲"] : [], roots: score >= 4 ? ["寅"] : [],
      rootStrength: score >= 4 ? 1 : 0,
      rootDetails: score >= 4 ? [{ branch: "寅", stem: "甲", role: "main", strength: 1, damaged: false }] : [],
      hiddenStems: [], seasonalStrength: 0, supportScore: score >= 7 ? 1 : 0, controlPenalty: 0,
      combinations: [], clashes: [], effective: score >= 4, potential: potentials.includes(element),
      reasons: [], contributions: [], monthCommand: false, structuralEligible: score >= 4,
      eligibilityReasons: score >= 4 ? ["테스트용 투간통근"] : [], potentialReasons: [], selectedRoot: false,
      channel: {
        heaven: { score: score >= 4 ? 4 : 0, passed: score >= 4, reasons: [] },
        earth: { score: score >= 4 ? 4 : 0, passed: score >= 4, reasons: [] },
        human: { score: score >= 4 ? 4 : 0, passed: score >= 4, reasons: [] },
        integrity: 1, completion: score >= 4 ? Math.min(100, score * 7) : 0,
        state: score >= 4 ? "complete" : potentials.includes(element) ? "latent" : "dormant",
        complete: score >= 4, potential: potentials.includes(element), reasons: [],
      },
    } satisfies ElementEvidence];
  })) as unknown as Record<Element, ElementEvidence>;
}

const blankShensha: ShenshaResult[] = [
  { id: "huagai", name: "화개살", category: "mystic", polarity: "mixed", present: false, evidence: [], traits: [], paths: [], weapons: [], techniques: [], risks: [] },
  { id: "guimen", name: "귀문관살", category: "mystic", polarity: "mixed", present: false, evidence: [], traits: [], paths: [], weapons: [], techniques: [], risks: [] },
  { id: "yima", name: "역마살", category: "mobility", polarity: "mixed", present: false, evidence: [], traits: [], paths: [], weapons: [], techniques: [], risks: [] },
];

export function analysisContext(
  evidence: Record<Element, ElementEvidence>,
  overrides: Partial<AnalysisContext> = {},
): AnalysisContext {
  return {
    pillars: testPillars,
    evidence,
    season: "spring",
    relations: { combinations: [], halfCombinations: [], archingCombinations: [], directionalCombinations: [], sixCombinations: [], clashes: [], punishments: [], harms: [], breaks: [], stemCombinations: [], dynamicCount: 0 },
    shensha: blankShensha,
    ...overrides,
  };
}

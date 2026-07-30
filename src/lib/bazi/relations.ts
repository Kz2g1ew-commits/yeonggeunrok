import type { BranchRelations, Element, FourPillars } from "@/types/bazi";
import { ELEMENT_META, GENERATES } from "./elementMeta";
import { BRANCHES, branchKorean } from "./branches";
import { stemKorean } from "./stems";

interface GroupRule {
  members: string[];
  element: Element;
}

export const THREE_HARMONIES: GroupRule[] = [
  { members: ["申", "子", "辰"], element: "water" },
  { members: ["亥", "卯", "未"], element: "wood" },
  { members: ["寅", "午", "戌"], element: "fire" },
  { members: ["巳", "酉", "丑"], element: "metal" },
];

export const DIRECTIONAL_GROUPS: GroupRule[] = [
  { members: ["寅", "卯", "辰"], element: "wood" },
  { members: ["巳", "午", "未"], element: "fire" },
  { members: ["申", "酉", "戌"], element: "metal" },
  { members: ["亥", "子", "丑"], element: "water" },
];

export const CLASH_PAIRS = [["子", "午"], ["丑", "未"], ["寅", "申"], ["卯", "酉"], ["辰", "戌"], ["巳", "亥"]];
export const HARM_PAIRS = [["子", "未"], ["丑", "午"], ["寅", "巳"], ["卯", "辰"], ["申", "亥"], ["酉", "戌"]];
export const BREAK_PAIRS = [["子", "酉"], ["丑", "辰"], ["寅", "亥"], ["卯", "午"], ["巳", "申"], ["未", "戌"]];
export const PUNISHMENT_GROUPS = [["寅", "巳", "申"], ["丑", "未", "戌"], ["子", "卯"]];

export const STEM_COMBINATIONS: Array<{ stems: [string, string]; element: Element }> = [
  { stems: ["甲", "己"], element: "earth" },
  { stems: ["乙", "庚"], element: "metal" },
  { stems: ["丙", "辛"], element: "water" },
  { stems: ["丁", "壬"], element: "wood" },
  { stems: ["戊", "癸"], element: "fire" },
];

function hasPair(values: string[], pair: string[]): boolean {
  return pair.every((value) => values.includes(value));
}

function pairLabel(pair: string[], suffix: string): string {
  return `${pair.map(branchKorean).join("·")} ${suffix}`;
}

export function analyzeRelations(pillars: FourPillars): BranchRelations {
  const values = Object.values(pillars);
  const branches = values.map((pillar) => pillar.branch);
  const stems = values.map((pillar) => pillar.stem);
  const combinations: string[] = [];
  const halfCombinations: string[] = [];
  const directionalCombinations: string[] = [];

  for (const rule of THREE_HARMONIES) {
    const count = rule.members.filter((branch) => branches.includes(branch)).length;
    if (count === 3) {
      combinations.push(`${rule.members.map(branchKorean).join("·")} 삼합 ${ELEMENT_META[rule.element].label}국`);
    } else if (count === 2) {
      halfCombinations.push(`${rule.members.filter((branch) => branches.includes(branch)).map(branchKorean).join("·")} 반합`);
    }
  }

  for (const rule of DIRECTIONAL_GROUPS) {
    if (rule.members.every((branch) => branches.includes(branch))) {
      directionalCombinations.push(`${rule.members.map(branchKorean).join("·")} 방합 ${ELEMENT_META[rule.element].label}국`);
    }
  }

  const clashes = CLASH_PAIRS.filter((pair) => hasPair(branches, pair)).map((pair) => pairLabel(pair, "충"));
  const harms = HARM_PAIRS.filter((pair) => hasPair(branches, pair)).map((pair) => pairLabel(pair, "해"));
  const breaks = BREAK_PAIRS.filter((pair) => hasPair(branches, pair)).map((pair) => pairLabel(pair, "파"));
  const punishments = PUNISHMENT_GROUPS.filter((group) => group.every((branch) => branches.includes(branch)))
    .map((group) => pairLabel(group, "형"));

  for (const branch of ["辰", "午", "酉", "亥"]) {
    if (branches.filter((value) => value === branch).length >= 2) {
      punishments.push(`${branchKorean(branch)} 자형`);
    }
  }

  const stemCombinations = STEM_COMBINATIONS.filter((rule) => rule.stems.every((stem) => stems.includes(stem)))
    .map((rule) => `${rule.stems.map(stemKorean).join("·")}합 ${ELEMENT_META[rule.element].label}화 후보`);

  return {
    combinations,
    halfCombinations,
    directionalCombinations,
    clashes,
    punishments,
    harms,
    breaks,
    stemCombinations,
    dynamicCount: clashes.length * 2 + punishments.length * 2 + harms.length + breaks.length,
  };
}

export function completedGroupElements(pillars: FourPillars): { full: Element[]; half: Element[]; directional: Element[] } {
  const branches = Object.values(pillars).map((pillar) => pillar.branch);
  return {
    full: THREE_HARMONIES.filter((rule) => rule.members.every((branch) => branches.includes(branch))).map((rule) => rule.element),
    half: THREE_HARMONIES.filter((rule) => rule.members.filter((branch) => branches.includes(branch)).length === 2).map((rule) => rule.element),
    directional: DIRECTIONAL_GROUPS.filter((rule) => rule.members.every((branch) => branches.includes(branch))).map((rule) => rule.element),
  };
}

export function transformedStemElements(pillars: FourPillars): Element[] {
  const stems = Object.values(pillars).map((pillar) => pillar.stem);
  const monthElement = BRANCHES[pillars.month.branch].element;
  return STEM_COMBINATIONS.filter((rule) =>
    rule.stems.every((stem) => stems.includes(stem)) &&
    (monthElement === rule.element || GENERATES[monthElement] === rule.element),
  ).map((rule) => rule.element);
}

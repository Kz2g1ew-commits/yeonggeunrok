import type { FourPillars, ShenshaResult } from "@/types/bazi";
import { branchKorean } from "./branches";

const GROUP_TARGETS: Array<{ group: string[]; huagai: string; yima: string }> = [
  { group: ["寅", "午", "戌"], huagai: "戌", yima: "申" },
  { group: ["申", "子", "辰"], huagai: "辰", yima: "寅" },
  { group: ["亥", "卯", "未"], huagai: "未", yima: "巳" },
  { group: ["巳", "酉", "丑"], huagai: "丑", yima: "亥" },
];

const GUIMEN_PAIRS = [["子", "酉"], ["丑", "午"], ["寅", "未"], ["卯", "申"], ["辰", "亥"], ["巳", "戌"]];

export function detectShensha(
  pillars: FourPillars,
  options: { enabled: boolean; huagai: boolean; guimen: boolean; yima: boolean },
): ShenshaResult[] {
  const branches = Object.values(pillars).map((pillar) => pillar.branch);
  const anchors = [pillars.year.branch, pillars.day.branch];
  const huagaiEvidence: string[] = [];
  const yimaEvidence: string[] = [];

  for (const anchor of anchors) {
    const rule = GROUP_TARGETS.find((candidate) => candidate.group.includes(anchor));
    if (!rule) continue;
    if (branches.includes(rule.huagai)) huagaiEvidence.push(`${branchKorean(anchor)} 기준 ${branchKorean(rule.huagai)} 화개`);
    if (branches.includes(rule.yima)) yimaEvidence.push(`${branchKorean(anchor)} 기준 ${branchKorean(rule.yima)} 역마`);
  }

  const guimenEvidence = GUIMEN_PAIRS.filter((pair) => pair.every((branch) => branches.includes(branch)))
    .map((pair) => `${pair.map(branchKorean).join("·")} 귀문 조합`);
  const on = options.enabled;

  return [
    {
      id: "huagai",
      name: "화개살",
      present: on && options.huagai && huagaiEvidence.length > 0,
      evidence: huagaiEvidence,
      traits: ["명상", "진법", "부적", "연단", "정신계 저항", "은둔 수행"],
    },
    {
      id: "guimen",
      name: "귀문관살",
      present: on && options.guimen && guimenEvidence.length > 0,
      evidence: guimenEvidence,
      traits: ["영혼 감응", "환술", "음기 감지", "꿈·정신계 술법", "주화입마 위험"],
    },
    {
      id: "yima",
      name: "역마살",
      present: on && options.yima && yimaEvidence.length > 0,
      evidence: yimaEvidence,
      traits: ["신법", "비행술", "공간 이동", "풍·뇌 변이 가산"],
    },
  ];
}

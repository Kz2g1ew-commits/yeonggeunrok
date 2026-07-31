import type { FourPillars, ShenshaId, ShenshaOptions, ShenshaResult } from "@/types/bazi";
import { branchKorean } from "./branches";
import { stemKorean } from "./stems";
import {
  GUIMEN_PAIRS,
  KUIGANG_DAY_PILLARS,
  SHENSHA_DESCRIPTORS,
  TAIJI_BRANCHES,
  TIANDE_RULES,
  TIANYI_BRANCHES,
  TRIAD_SHENSHA_RULES,
  WENCHANG_BRANCHES,
  YANGREN_BRANCHES,
  YUEDE_STEMS,
} from "./shenshaRules";

const PILLAR_LABELS = ["연주", "월주", "일주", "시주"] as const;

function distinct(items: string[]): string[] {
  return [...new Set(items)];
}

export function detectShensha(pillars: FourPillars, options: ShenshaOptions): ShenshaResult[] {
  const pillarList = [pillars.year, pillars.month, pillars.day, pillars.hour];
  const branches = pillarList.map((pillar) => pillar.branch);
  const branchEvidence = (target: string) => pillarList.flatMap((pillar, index) =>
    pillar.branch === target ? [`${PILLAR_LABELS[index]} ${branchKorean(target)}(${target})`] : []);
  const stemEvidence = (target: string) => pillarList.flatMap((pillar, index) =>
    pillar.stem === target ? [`${PILLAR_LABELS[index]} ${stemKorean(target)}(${target})`] : []);
  const evidence = (Object.keys(SHENSHA_DESCRIPTORS) as ShenshaId[]).reduce((record, id) => {
    record[id] = [];
    return record;
  }, {} as Record<ShenshaId, string[]>);
  const branchAnchors = [
    { label: "연지", branch: pillars.year.branch },
    { label: "일지", branch: pillars.day.branch },
  ];

  for (const anchor of branchAnchors) {
    const rule = TRIAD_SHENSHA_RULES.find((candidate) => candidate.group.some((branch) => branch === anchor.branch));
    if (!rule) continue;
    for (const id of ["huagai", "yima", "jiangxing", "taohua", "jiesha"] as const) {
      const target = rule[id];
      if (branches.includes(target)) {
        evidence[id].push(`${anchor.label} ${branchKorean(anchor.branch)}(${anchor.branch}) 기준 · ${branchEvidence(target).join("·")}`);
      }
    }
  }

  evidence.guimen.push(...GUIMEN_PAIRS.filter((pair) => pair.every((branch) => branches.includes(branch)))
    .map((pair) => `${pair.map((branch) => `${branchKorean(branch)}(${branch})`).join("·")} 귀문 조합`));

  const stemAnchors = [
    { label: "연간", stem: pillars.year.stem },
    { label: "일간", stem: pillars.day.stem },
  ];
  for (const anchor of stemAnchors) {
    const targets = TIANYI_BRANCHES[anchor.stem] ?? [];
    for (const target of targets) {
      if (branches.includes(target)) evidence.tianyi.push(`${anchor.label} ${stemKorean(anchor.stem)}(${anchor.stem}) 기준 · ${branchEvidence(target).join("·")}`);
    }
    const taijiTargets = TAIJI_BRANCHES[anchor.stem] ?? [];
    for (const target of taijiTargets) {
      if (branches.includes(target)) evidence.taiji.push(`${anchor.label} ${stemKorean(anchor.stem)}(${anchor.stem}) 기준 · ${branchEvidence(target).join("·")}`);
    }
  }

  const tiandeRule = TIANDE_RULES[pillars.month.branch];
  if (tiandeRule) {
    const matches = tiandeRule.kind === "stem" ? stemEvidence(tiandeRule.value) : branchEvidence(tiandeRule.value);
    if (matches.length) evidence.tiande.push(`월지 ${branchKorean(pillars.month.branch)}(${pillars.month.branch}) 기준 · ${matches.join("·")}`);
  }

  const yuedeStem = YUEDE_STEMS[pillars.month.branch];
  const yuedeMatches = yuedeStem ? stemEvidence(yuedeStem) : [];
  if (yuedeMatches.length) evidence.yuede.push(`월지 ${branchKorean(pillars.month.branch)}(${pillars.month.branch}) 기준 · ${yuedeMatches.join("·")}`);

  const wenchangBranch = WENCHANG_BRANCHES[pillars.day.stem];
  if (wenchangBranch && branches.includes(wenchangBranch)) {
    evidence.wenchang.push(`일간 ${stemKorean(pillars.day.stem)}(${pillars.day.stem}) 기준 · ${branchEvidence(wenchangBranch).join("·")}`);
  }

  const yangrenBranch = YANGREN_BRANCHES[pillars.day.stem];
  if (yangrenBranch && branches.includes(yangrenBranch)) {
    evidence.yangren.push(`일간 ${stemKorean(pillars.day.stem)}(${pillars.day.stem}) 기준 · ${branchEvidence(yangrenBranch).join("·")}`);
  }

  const dayPillar = `${pillars.day.stem}${pillars.day.branch}`;
  if (KUIGANG_DAY_PILLARS.has(dayPillar)) evidence.kuigang.push(`일주 ${stemKorean(pillars.day.stem)}${branchKorean(pillars.day.branch)}(${dayPillar})`);

  const enabledById = (id: ShenshaId): boolean => {
    if (!options.enabled) return false;
    if (id === "huagai") return options.huagai;
    if (id === "guimen") return options.guimen;
    if (id === "yima") return options.yima;
    const category = SHENSHA_DESCRIPTORS[id].category;
    if (category === "noble") return options.noble !== false;
    if (category === "scholar") return options.scholar !== false;
    if (category === "martial") return options.martial !== false;
    if (category === "charisma") return options.charisma !== false;
    return true;
  };

  return (Object.keys(SHENSHA_DESCRIPTORS) as ShenshaId[]).map((id) => {
    const descriptor = SHENSHA_DESCRIPTORS[id];
    const itemEvidence = distinct(evidence[id]);
    return {
      ...descriptor,
      present: enabledById(id) && itemEvidence.length > 0,
      evidence: itemEvidence,
    };
  });
}

import type {
  FourPillars,
  ShenshaId,
  ShenshaMatch,
  ShenshaOptions,
  ShenshaResult,
  ShenshaStatus,
} from "@/types/bazi";
import { branchKorean } from "./branches";
import { stemKorean } from "./stems";
import { BREAK_PAIRS, CLASH_PAIRS, HARM_PAIRS, PUNISHMENT_GROUPS } from "./relations";
import {
  GUIMEN_PAIRS,
  KUIGANG_DAY_PILLARS,
  SHENSHA_DESCRIPTORS,
  SHENSHA_STRENGTH_RULES,
  TAIJI_BRANCHES,
  TIANDE_RULES,
  TIANYI_BRANCHES,
  TRIAD_SHENSHA_RULES,
  WENCHANG_BRANCHES,
  YANGREN_BRANCHES,
  YINREN_BRANCHES,
  YUEDE_STEMS,
} from "./shenshaRules";

const PILLAR_KEYS = ["year", "month", "day", "hour"] as const;
const PILLAR_LABELS = ["연주", "월주", "일주", "시주"] as const;

interface InternalMatch extends ShenshaMatch {
  indexes: number[];
}

interface DamageImpact {
  label: string;
  penalty: number;
}

function distinct<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function containsAll(values: string[], targets: readonly string[]): boolean {
  return targets.every((target) => values.includes(target));
}

function relationImpacts(branches: string[], targetBranches: string[]): DamageImpact[] {
  const rules = SHENSHA_STRENGTH_RULES.damagePenalty;
  const impacts: DamageImpact[] = [];
  const addPairs = (pairs: string[][], suffix: string, penalty: number) => {
    for (const pair of pairs) {
      if (containsAll(branches, pair) && pair.some((branch) => targetBranches.includes(branch))) {
        impacts.push({ label: `${pair.map(branchKorean).join("·")} ${suffix}`, penalty });
      }
    }
  };
  addPairs(CLASH_PAIRS, "충", rules.clash);
  addPairs(HARM_PAIRS, "해", rules.harm);
  addPairs(BREAK_PAIRS, "파", rules.break);
  for (const group of PUNISHMENT_GROUPS) {
    if (containsAll(branches, group) && group.some((branch) => targetBranches.includes(branch))) {
      impacts.push({ label: `${group.map(branchKorean).join("·")} 형`, penalty: rules.punishment });
    }
  }
  for (const branch of ["辰", "午", "酉", "亥"]) {
    if (targetBranches.includes(branch) && branches.filter((value) => value === branch).length >= 2) {
      impacts.push({ label: `${branchKorean(branch)} 자형`, penalty: rules.punishment });
    }
  }
  return [...new Map(impacts.map((impact) => [impact.label, impact])).values()];
}

function assess(
  id: ShenshaId,
  matches: InternalMatch[],
  pillars: FourPillars,
  enabled: boolean,
): Pick<ShenshaResult, "present" | "effective" | "status" | "strength" | "integrity" | "occurrenceCount" | "damage"> {
  if (!enabled || matches.length === 0) {
    return { present: false, effective: false, status: "inactive", strength: 0, integrity: 100, occurrenceCount: 0, damage: [] };
  }

  const descriptor = SHENSHA_DESCRIPTORS[id];
  const indexes = distinct(matches.flatMap((match) => match.indexes));
  const branches = PILLAR_KEYS.map((key) => pillars[key].branch);
  const targetBranches = distinct(indexes.map((index) => branches[index]));
  const impacts = relationImpacts(branches, targetBranches);
  const damagePenalty = impacts.reduce((sum, impact) => sum + impact.penalty, 0);
  const positionBonus = Math.max(...indexes.map((index) => SHENSHA_STRENGTH_RULES.positionBonus[PILLAR_KEYS[index]]), 0);
  const occurrenceBonus = Math.min(
    SHENSHA_STRENGTH_RULES.extraOccurrenceMaximum,
    Math.max(0, indexes.length - 1) * SHENSHA_STRENGTH_RULES.extraOccurrenceBonus,
  );
  const anchorCount = new Set(matches.map((match) => match.anchor)).size;
  const anchorBonus = Math.min(
    SHENSHA_STRENGTH_RULES.extraAnchorMaximum,
    Math.max(0, anchorCount - 1) * SHENSHA_STRENGTH_RULES.extraAnchorBonus,
  );
  const dynamicBonus = descriptor.polarity === "auspicious" ? 0 : Math.min(
    SHENSHA_STRENGTH_RULES.dynamicActivationMaximum,
    damagePenalty * SHENSHA_STRENGTH_RULES.dynamicActivationFactor,
  );
  const strength = clamp(SHENSHA_STRENGTH_RULES.base + positionBonus + occurrenceBonus + anchorBonus + dynamicBonus);
  const integrity = clamp(100 - damagePenalty);
  const effective = strength >= SHENSHA_STRENGTH_RULES.effectiveMinimum &&
    (descriptor.polarity !== "auspicious" || integrity >= SHENSHA_STRENGTH_RULES.auspiciousIntegrityMinimum);
  let status: ShenshaStatus;
  if (descriptor.polarity === "auspicious" && !effective && impacts.length > 0) status = "damaged";
  else if (descriptor.polarity !== "auspicious" && impacts.length > 0) status = "agitated";
  else if (strength >= SHENSHA_STRENGTH_RULES.strongMinimum) status = "strong";
  else if (effective) status = "active";
  else status = "weak";

  return {
    present: true,
    effective,
    status,
    strength,
    integrity,
    occurrenceCount: indexes.length,
    damage: impacts.map((impact) => impact.label),
  };
}

export function detectShensha(pillars: FourPillars, options: ShenshaOptions): ShenshaResult[] {
  const pillarList = PILLAR_KEYS.map((key) => pillars[key]);
  const branches = pillarList.map((pillar) => pillar.branch);
  const school = options.school ?? "classical";
  const matches = (Object.keys(SHENSHA_DESCRIPTORS) as ShenshaId[]).reduce((record, id) => {
    record[id] = [];
    return record;
  }, {} as Record<ShenshaId, InternalMatch[]>);
  const indexesForBranch = (target: string) => pillarList.flatMap((pillar, index) => pillar.branch === target ? [index] : []);
  const indexesForStem = (target: string) => pillarList.flatMap((pillar, index) => pillar.stem === target ? [index] : []);
  const branchEvidence = (target: string, indexes = indexesForBranch(target)) => indexes
    .map((index) => `${PILLAR_LABELS[index]} ${branchKorean(target)}(${target})`).join("·");
  const stemEvidence = (target: string, indexes = indexesForStem(target)) => indexes
    .map((index) => `${PILLAR_LABELS[index]} ${stemKorean(target)}(${target})`).join("·");
  const add = (id: ShenshaId, anchor: string, target: string, indexes: number[], evidence: string) => {
    if (indexes.length === 0) return;
    matches[id].push({ anchor, target, indexes, pillars: indexes.map((index) => PILLAR_KEYS[index]), evidence });
  };
  const addBranchMatch = (id: ShenshaId, anchor: string, target: string, prefix: string) => {
    const indexes = indexesForBranch(target);
    add(id, anchor, target, indexes, `${prefix} · ${branchEvidence(target, indexes)}`);
  };

  for (const anchor of [
    { label: "연지", branch: pillars.year.branch },
    { label: "일지", branch: pillars.day.branch },
  ]) {
    const rule = TRIAD_SHENSHA_RULES.find((candidate) => candidate.group.some((branch) => branch === anchor.branch));
    if (!rule) continue;
    for (const id of ["huagai", "yima", "jiangxing", "taohua", "jiesha"] as const) {
      addBranchMatch(id, anchor.label, rule[id], `${anchor.label} ${branchKorean(anchor.branch)}(${anchor.branch}) 기준`);
    }
  }

  for (const pair of GUIMEN_PAIRS) {
    if (!containsAll(branches, pair)) continue;
    const indexes = pillarList.flatMap((pillar, index) => (pair as readonly string[]).includes(pillar.branch) ? [index] : []);
    add("guimen", "귀문 지지쌍", pair.join("·"), indexes, `${pair.map((branch) => `${branchKorean(branch)}(${branch})`).join("·")} 귀문 조합`);
  }

  const stemAnchors = [
    { label: "연간", stem: pillars.year.stem },
    ...(school === "expanded" ? [{ label: "일간", stem: pillars.day.stem }] : []),
  ];
  for (const anchor of stemAnchors) {
    for (const target of TAIJI_BRANCHES[anchor.stem] ?? []) {
      addBranchMatch("taiji", anchor.label, target, `${anchor.label} ${stemKorean(anchor.stem)}(${anchor.stem}) 기준`);
    }
  }

  for (const anchor of [
    { label: "연간", stem: pillars.year.stem },
    { label: "일간", stem: pillars.day.stem },
  ]) {
    for (const target of TIANYI_BRANCHES[anchor.stem] ?? []) {
      addBranchMatch("tianyi", anchor.label, target, `${anchor.label} ${stemKorean(anchor.stem)}(${anchor.stem}) 기준`);
    }
  }

  const tiandeRule = TIANDE_RULES[pillars.month.branch];
  if (tiandeRule) {
    const indexes = tiandeRule.kind === "stem" ? indexesForStem(tiandeRule.value) : indexesForBranch(tiandeRule.value);
    const targetEvidence = tiandeRule.kind === "stem"
      ? stemEvidence(tiandeRule.value, indexes)
      : branchEvidence(tiandeRule.value, indexes);
    add("tiande", "월지", tiandeRule.value, indexes, `월지 ${branchKorean(pillars.month.branch)}(${pillars.month.branch}) 기준 · ${targetEvidence}`);
  }

  const yuedeStem = YUEDE_STEMS[pillars.month.branch];
  if (yuedeStem) {
    const indexes = indexesForStem(yuedeStem);
    add("yuede", "월지", yuedeStem, indexes, `월지 ${branchKorean(pillars.month.branch)}(${pillars.month.branch}) 기준 · ${stemEvidence(yuedeStem, indexes)}`);
  }

  const wenchangBranch = WENCHANG_BRANCHES[pillars.day.stem];
  if (wenchangBranch) {
    addBranchMatch("wenchang", "일간", wenchangBranch, `일간 ${stemKorean(pillars.day.stem)}(${pillars.day.stem}) 기준`);
  }

  const yangrenBranch = YANGREN_BRANCHES[pillars.day.stem];
  if (yangrenBranch) {
    addBranchMatch("yangren", "일간", yangrenBranch, `일간 ${stemKorean(pillars.day.stem)}(${pillars.day.stem}) 기준`);
  }
  if (school === "expanded") {
    const yinrenBranch = YINREN_BRANCHES[pillars.day.stem];
    if (yinrenBranch) addBranchMatch("yinren", "일간", yinrenBranch, `확장형 일간 ${stemKorean(pillars.day.stem)}(${pillars.day.stem}) 기준`);
  }

  const dayPillar = `${pillars.day.stem}${pillars.day.branch}`;
  if (KUIGANG_DAY_PILLARS.has(dayPillar)) {
    add("kuigang", "일주", dayPillar, [2], `일주 ${stemKorean(pillars.day.stem)}${branchKorean(pillars.day.branch)}(${dayPillar})`);
  }

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
    const itemMatches = matches[id];
    const assessment = assess(id, itemMatches, pillars, enabledById(id));
    return {
      ...descriptor,
      ...assessment,
      matches: itemMatches.map((item) => ({
        anchor: item.anchor,
        target: item.target,
        pillars: item.pillars,
        evidence: item.evidence,
      })),
      evidence: distinct(itemMatches.map((match) => match.evidence)),
    };
  });
}

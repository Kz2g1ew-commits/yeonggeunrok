import { LunarUtil } from "lunar-typescript";
import type { Element, FourPillars } from "@/types/bazi";
import type { PreHeavenLink, PreHeavenNode, PreHeavenNodeId, PreHeavenQiResult } from "@/types/spiritualRoot";
import { ELEMENT_META } from "./elementMeta";
import { BREAK_PAIRS, CLASH_PAIRS, HARM_PAIRS, SIX_COMBINATIONS, STEM_COMBINATIONS } from "./relations";

const NAYIN_ELEMENT: Record<string, Element> = {
  木: "wood",
  火: "fire",
  土: "earth",
  金: "metal",
  水: "water",
};

const GENERATES: Record<Element, Element> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

const NODE_NAMES: Record<PreHeavenNodeId, string> = {
  taiYuan: "태원",
  taiXi: "태식",
  mingGong: "명궁",
};

export const PRE_HEAVEN_QI_RULES = {
  connectedMinimumLinks: 2,
  strictMinimumTrueBonds: 1,
  strictMaximumDisruptions: 0,
} as const;

function makeNode(id: PreHeavenNodeId, ganZhi: string): PreHeavenNode {
  const naYin = LunarUtil.NAYIN[ganZhi];
  const element = NAYIN_ELEMENT[naYin?.at(-1) ?? ""];
  if (!naYin || !element) throw new Error(`납음오행을 확인할 수 없는 간지입니다: ${ganZhi}`);
  return { id, name: NODE_NAMES[id], ganZhi, naYin, element };
}

function deriveTaiYuan(pillars: FourPillars): PreHeavenNode {
  let stemIndex = LunarUtil.GAN.indexOf(pillars.month.stem) + 1;
  if (stemIndex > 10) stemIndex -= 10;
  let branchIndex = LunarUtil.ZHI.indexOf(pillars.month.branch) + 3;
  if (branchIndex > 12) branchIndex -= 12;
  return makeNode("taiYuan", LunarUtil.GAN[stemIndex] + LunarUtil.ZHI[branchIndex]);
}

function deriveTaiXi(pillars: FourPillars): PreHeavenNode {
  const stemIndex = LunarUtil.GAN.indexOf(pillars.day.stem) - 1;
  const branchIndex = LunarUtil.ZHI.indexOf(pillars.day.branch) - 1;
  return makeNode("taiXi", LunarUtil.HE_GAN_5[stemIndex] + LunarUtil.HE_ZHI_6[branchIndex]);
}

function deriveMingGong(pillars: FourPillars): PreHeavenNode {
  const monthIndex = LunarUtil.MONTH_ZHI.indexOf(pillars.month.branch);
  const hourIndex = LunarUtil.MONTH_ZHI.indexOf(pillars.hour.branch);
  const sum = monthIndex + hourIndex;
  const offset = (sum >= 14 ? 26 : 14) - sum;
  const yearStemIndex = LunarUtil.GAN.indexOf(pillars.year.stem) - 1;
  let stemIndex = (yearStemIndex + 1) * 2 + offset;
  while (stemIndex > 10) stemIndex -= 10;
  return makeNode("mingGong", LunarUtil.GAN[stemIndex] + LunarUtil.MONTH_ZHI[offset]);
}

function hasPair(left: string, right: string, pairs: readonly (readonly string[])[]): boolean {
  return pairs.some(([first, second]) =>
    (left === first && right === second) || (left === second && right === first));
}

function isForwardFlow(source: Element, target: Element): boolean {
  return source === target || GENERATES[source] === target;
}

function flowLabel(source: PreHeavenNode, target: PreHeavenNode): string {
  if (source.element === target.element) {
    return `${source.name}·${target.name}이 ${ELEMENT_META[source.element].label} 납음으로 동기`;
  }
  return `${source.name}의 ${ELEMENT_META[source.element].label} 납음이 ${target.name}의 ${ELEMENT_META[target.element].label} 납음을 생조`;
}

function pairLink(left: PreHeavenNode, right: PreHeavenNode): PreHeavenLink | null {
  const kinds: PreHeavenLink["kinds"] = [];
  const labels: string[] = [];
  if (left.element === right.element) kinds.push("same-qi");
  else if (GENERATES[left.element] === right.element) kinds.push("generation");
  if (STEM_COMBINATIONS.some(({ stems }) => hasPair(left.ganZhi[0], right.ganZhi[0], [stems]))) {
    kinds.push("stem-combination");
    labels.push("천간합");
  }
  if (SIX_COMBINATIONS.some(({ branches }) => hasPair(left.ganZhi[1], right.ganZhi[1], [branches]))) {
    kinds.push("branch-combination");
    labels.push("지지육합");
  }
  if (left.ganZhi[0] === right.ganZhi[0]) {
    kinds.push("same-stem");
    labels.push("동간");
  }
  if (left.ganZhi[1] === right.ganZhi[1]) {
    kinds.push("same-branch");
    labels.push("동지");
  }
  if (hasPair(left.ganZhi[1], right.ganZhi[1], CLASH_PAIRS)) {
    kinds.push("clash");
    labels.push("충");
  }
  if (hasPair(left.ganZhi[1], right.ganZhi[1], HARM_PAIRS)) {
    kinds.push("harm");
    labels.push("해");
  }
  if (hasPair(left.ganZhi[1], right.ganZhi[1], BREAK_PAIRS)) {
    kinds.push("break");
    labels.push("파");
  }
  if (!kinds.length) return null;
  return {
    from: left.id,
    to: right.id,
    label: `${left.name}·${right.name} ${labels.join("·") || "납음 유통"}`,
    kinds,
  };
}

function participatesInConnectedResonance(nodes: PreHeavenNode[], links: PreHeavenLink[]): boolean {
  const bindingKinds = new Set(["stem-combination", "branch-combination", "same-stem", "same-branch"]);
  const bindingLinks = links.filter((link) => link.kinds.some((kind) => bindingKinds.has(kind)));
  if (bindingLinks.length < PRE_HEAVEN_QI_RULES.connectedMinimumLinks) return false;
  return nodes.every((node) => bindingLinks.some((link) => link.from === node.id || link.to === node.id));
}

export function calculatePreHeavenQi(pillars: FourPillars): PreHeavenQiResult {
  const taiYuan = deriveTaiYuan(pillars);
  const taiXi = deriveTaiXi(pillars);
  const mingGong = deriveMingGong(pillars);
  const nodes = [taiYuan, taiXi, mingGong];
  const links = [
    pairLink(taiYuan, taiXi),
    pairLink(taiXi, mingGong),
    pairLink(taiYuan, mingGong),
  ].filter((link): link is PreHeavenLink => link !== null);
  const flowFromTaiYuan = isForwardFlow(taiYuan.element, taiXi.element);
  const flowIntoMingGong = isForwardFlow(taiXi.element, mingGong.element);
  const adjacentClash = hasPair(taiYuan.ganZhi[1], taiXi.ganZhi[1], CLASH_PAIRS) ||
    hasPair(taiXi.ganZhi[1], mingGong.ganZhi[1], CLASH_PAIRS);
  const balancedFlow = flowFromTaiYuan && flowIntoMingGong && !adjacentClash;
  const connectedResonance = participatesInConnectedResonance(nodes, links);
  const trueBondCount = links.reduce((total, link) => total +
    Number(link.kinds.includes("stem-combination")) + Number(link.kinds.includes("branch-combination")), 0);
  const disruptionCount = links.reduce((total, link) => total +
    Number(link.kinds.includes("clash")) + Number(link.kinds.includes("harm")) + Number(link.kinds.includes("break")), 0);
  const strictCondensation = balancedFlow && connectedResonance &&
    trueBondCount >= PRE_HEAVEN_QI_RULES.strictMinimumTrueBonds &&
    disruptionCount <= PRE_HEAVEN_QI_RULES.strictMaximumDisruptions;
  const state = strictCondensation ? "condensed" : balancedFlow ? "responsive" : "dormant";
  const stateLabel = state === "condensed" ? "선천일기 응결" : state === "responsive" ? "선천 기감 감응" : "선천 기감 미개";
  const reasons: string[] = [];
  const blockers: string[] = [];

  if (flowFromTaiYuan) reasons.push(flowLabel(taiYuan, taiXi));
  else blockers.push("태원에서 태식으로 납음이 순생하지 않음");
  if (flowIntoMingGong) reasons.push(flowLabel(taiXi, mingGong));
  else blockers.push("태식에서 명궁으로 납음이 순생하지 않음");
  if (adjacentClash) blockers.push("태원·태식·명궁의 인접 흐름에 직접 충이 있음");
  if (connectedResonance) reasons.push("태원·태식·명궁이 합 또는 동기로 하나의 연결망을 이룸");
  else blockers.push("세 보조축 모두가 합·동기 연결망에 참여하지 못함");
  if (trueBondCount > 0) reasons.push(`천간합·지지육합 ${trueBondCount}건이 선천 기운을 결속함`);
  else blockers.push("선천 기운을 묶는 실제 천간합·지지육합이 없음");
  if (disruptionCount === 0) reasons.push("삼원 사이에 충·해·파의 파손이 없음");
  else blockers.push(`삼원 사이에 충·해·파 ${disruptionCount}건이 있음`);

  return {
    state,
    stateLabel,
    nodes: { taiYuan, taiXi, mingGong },
    flowFromTaiYuan,
    flowIntoMingGong,
    adjacentClash,
    balancedFlow,
    connectedResonance,
    trueBondCount,
    disruptionCount,
    strictCondensation,
    links,
    reasons,
    blockers,
  };
}

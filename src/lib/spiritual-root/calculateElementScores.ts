import type { Element, FourPillars, Pillar } from "@/types/bazi";
import type { ElementEvidence, ScoreContribution } from "@/types/spiritualRoot";
import { branchKorean } from "@/lib/bazi/branches";
import { HIDDEN_STEMS } from "@/lib/bazi/hiddenStems";
import { STEMS, stemKorean } from "@/lib/bazi/stems";
import { CLASH_PAIRS, STEM_COMBINATIONS, completedGroupElements } from "@/lib/bazi/relations";
import { CONTROLS, ELEMENT_META, ELEMENTS, GENERATES, controllerOf, generatorOf } from "@/lib/bazi/elementMeta";
import { seasonFromMonthBranch } from "@/lib/calendar/solarTerms";
import { SEASON_DOMINANT, SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";

const rules = SPIRITUAL_ROOT_RULES;

function contribution(label: string, value: number): ScoreContribution {
  return { label, value, kind: value < 0 ? "penalty" : value > 0 ? "bonus" : "base" };
}

function rawElementStrength(pillars: FourPillars): Record<Element, number> {
  const totals = Object.fromEntries(ELEMENTS.map((element) => [element, 0])) as Record<Element, number>;
  for (const pillar of Object.values(pillars) as Pillar[]) {
    totals[pillar.stemElement] += 1;
    totals[pillar.branchElement] += 1;
    for (const hidden of HIDDEN_STEMS[pillar.branch]) totals[hidden.element] += hidden.weight / 1.5;
  }
  return totals;
}

function hasRootClash(root: string, branches: string[]): boolean {
  return CLASH_PAIRS.some((pair) => pair.includes(root) && pair.every((branch) => branches.includes(branch)));
}

export function calculateElementScores(pillars: FourPillars): Record<Element, ElementEvidence> {
  const pillarValues = Object.values(pillars);
  const branches = pillarValues.map((pillar) => pillar.branch);
  const stems = pillarValues.map((pillar) => pillar.stem);
  const rawStrength = rawElementStrength(pillars);
  const season = seasonFromMonthBranch(pillars.month.branch);
  const groups = completedGroupElements(pillars);

  return Object.fromEntries(ELEMENTS.map((element) => {
    const contributions: ScoreContribution[] = [];
    const visibleStems = stems.filter((stem) => STEMS[stem].element === element);
    const roots = branches.filter((branch) => HIDDEN_STEMS[branch].some((hidden) => hidden.element === element));
    const hiddenStems = branches.flatMap((branch) => HIDDEN_STEMS[branch]
      .filter((hidden) => hidden.element === element)
      .map((hidden) => `${branchKorean(branch)}중 ${stemKorean(hidden.stem)}(${hidden.role})`));
    const monthCommand = pillars.month.branchElement === element;
    const seasonDominant = SEASON_DOMINANT[season];
    const seasonalPhase = element === seasonDominant ? { label: "왕(旺)", value: rules.scores.seasonalProsperous }
      : element === GENERATES[seasonDominant] ? { label: "상(相)", value: rules.scores.seasonalAssistant }
        : element === generatorOf(seasonDominant) ? { label: "휴(休)", value: 0 }
          : element === controllerOf(seasonDominant) ? { label: "수(囚)", value: rules.scores.seasonalImprisoned }
            : { label: "사(死)", value: rules.scores.seasonalDead };

    if (pillars.day.stemElement === element) contributions.push(contribution("일간과 같은 오행", rules.scores.dayMaster));
    if (monthCommand) {
      contributions.push(contribution("월지 본기", rules.scores.monthBranchMain));
      contributions.push(contribution("월령을 얻음", rules.scores.monthCommandBonus));
    }
    if (seasonalPhase.value !== 0) {
      contributions.push(contribution(`계절 왕상휴수사 ${seasonalPhase.label}`, seasonalPhase.value));
    }

    pillarValues.forEach((pillar, index) => {
      if (index !== 2 && pillar.stemElement === element) {
        contributions.push(contribution(`${stemKorean(pillar.stem)} 천간 투출`, rules.scores.visibleStem));
      }
      if (pillar.branchElement === element) {
        contributions.push(contribution(`${branchKorean(pillar.branch)} 지지 본기`, rules.scores.branchMain));
      }
      for (const hidden of HIDDEN_STEMS[pillar.branch]) {
        if (hidden.element !== element) continue;
        const value = hidden.role === "main" ? rules.scores.hiddenMain
          : hidden.role === "middle" ? rules.scores.hiddenMiddle : rules.scores.hiddenResidual;
        contributions.push(contribution(`${branchKorean(pillar.branch)} 지장간 ${stemKorean(hidden.stem)}(${hidden.role})`, value));
      }
    });

    const fullCount = groups.full.filter((value) => value === element).length;
    const directionCount = groups.directional.filter((value) => value === element).length;
    const halfCount = groups.half.filter((value) => value === element).length;
    if (fullCount) contributions.push(contribution("삼합 완성", rules.scores.fullHarmony * fullCount));
    if (directionCount) contributions.push(contribution("방합 완성", rules.scores.directionalHarmony * directionCount));
    if (halfCount) contributions.push(contribution("반합 세력", rules.scores.halfHarmony * halfCount));

    const stemCombination = STEM_COMBINATIONS.find((rule) =>
      rule.element === element && rule.stems.every((stem) => stems.includes(stem)));
    if (stemCombination && (monthCommand || GENERATES[pillars.month.branchElement] === element)) {
      contributions.push(contribution("월령이 돕는 천간합화", rules.scores.transformedStemCombination));
    }

    const generator = generatorOf(element);
    let supportScore = 0;
    if (rawStrength[generator] >= rules.rawStrength.strongSupport) {
      supportScore = rules.scores.strongSupport;
      contributions.push(contribution(`${ELEMENT_META[generator].label}의 강한 생조`, supportScore));
    }

    if (rawStrength[generator] >= 1.5 && rawStrength[element] >= 1) {
      contributions.push(contribution(`${ELEMENT_META[generator].label}생${ELEMENT_META[element].label} 유통`, rules.scores.flowingGeneration));
    }

    const passageSource = generatorOf(element);
    const passageDestination = GENERATES[element];
    if (CONTROLS[passageSource] === passageDestination && rawStrength[passageSource] >= 2 &&
        rawStrength[passageDestination] >= 2 && rawStrength[element] >= 0.5) {
      contributions.push(contribution(`${ELEMENT_META[passageSource].label}극${ELEMENT_META[passageDestination].label} 사이 통관`, rules.scores.mediationPassage));
    }

    if (roots.length === 1 && hasRootClash(roots[0], branches)) {
      contributions.push(contribution("유일한 뿌리가 충으로 손상", rules.scores.uniqueRootClash));
    }
    const controller = controllerOf(element);
    let controlPenalty = 0;
    if (rawStrength[controller] >= rules.rawStrength.strongControl &&
        rawStrength[generator] < rules.rawStrength.rescue && roots.length <= 1) {
      controlPenalty = rules.scores.uncontrolledStrongControl;
      contributions.push(contribution(`${ELEMENT_META[controller].label}의 강한 극을 받고 구원이 약함`, controlPenalty));
    }
    if (visibleStems.length > 0 && roots.length === 0) {
      contributions.push(contribution("천간에만 있고 뿌리가 없음", rules.scores.stemWithoutRoot));
    }

    const combinedAway = STEM_COMBINATIONS.some((rule) =>
      rule.element !== element && rule.stems.every((stem) => stems.includes(stem)) &&
      rule.stems.some((stem) => STEMS[stem].element === element));
    if (combinedAway && !monthCommand) contributions.push(contribution("합거되어 독립 작용이 약해짐", rules.scores.combinedAway));

    const score = Math.round(contributions.reduce((sum, item) => sum + item.value, 0) * 10) / 10;
    const combinations = [
      ...(fullCount ? ["삼합"] : []), ...(directionCount ? ["방합"] : []),
      ...(halfCount ? ["반합"] : []), ...(stemCombination ? ["천간합"] : []),
    ];
    const clashes = roots.filter((root) => hasRootClash(root, branches)).map((root) => `${branchKorean(root)} 뿌리 충`);
    const reasons = contributions.filter((item) => item.value !== 0)
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 5)
      .map((item) => `${item.label} ${item.value > 0 ? "+" : ""}${item.value}`);

    return [element, {
      element, score, visibleStems, roots: [...new Set(roots)], hiddenStems,
      seasonalStrength: (monthCommand ? rules.scores.monthBranchMain + rules.scores.monthCommandBonus : 0) + seasonalPhase.value,
      supportScore, controlPenalty, combinations, clashes, effective: false, potential: false,
      reasons, contributions, monthCommand, qualitySelected: false,
    } satisfies ElementEvidence];
  })) as Record<Element, ElementEvidence>;
}

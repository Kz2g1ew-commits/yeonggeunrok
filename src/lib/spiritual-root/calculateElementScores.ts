import type { Element, FourPillars } from "@/types/bazi";
import type { ElementEvidence, RootEvidence, ScoreContribution } from "@/types/spiritualRoot";
import { branchKorean } from "@/lib/bazi/branches";
import { HIDDEN_STEMS } from "@/lib/bazi/hiddenStems";
import { STEMS, stemKorean } from "@/lib/bazi/stems";
import {
  CLASH_PAIRS,
  SIX_COMBINATIONS,
  STEM_COMBINATIONS,
  completedGroupElements,
} from "@/lib/bazi/relations";
import { CONTROLS, ELEMENT_META, ELEMENTS, GENERATES, controllerOf, generatorOf } from "@/lib/bazi/elementMeta";
import { seasonFromMonthBranch } from "@/lib/calendar/solarTerms";
import { SEASON_DOMINANT, SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";

const rules = SPIRITUAL_ROOT_RULES;
const PILLAR_KEYS = ["year", "month", "day", "hour"] as const;

type PillarKey = typeof PILLAR_KEYS[number];

interface BaseProfile {
  element: Element;
  contributions: ScoreContribution[];
  visibleStems: string[];
  roots: string[];
  rootDetails: RootEvidence[];
  rootStrength: number;
  hiddenStems: string[];
  monthCommand: boolean;
  combinations: string[];
  clashes: string[];
  seasonalStrength: number;
  baseScore: number;
  fullFormation: boolean;
  directionalFormation: boolean;
}

function rounded(value: number): number {
  return Math.round(value * 10) / 10;
}

function contribution(label: string, value: number): ScoreContribution {
  return { label, value, kind: value < 0 ? "penalty" : value > 0 ? "bonus" : "base" };
}

function branchIsClashed(branch: string, branches: string[]): boolean {
  return CLASH_PAIRS.some((pair) => pair.includes(branch) && pair.every((member) => branches.includes(member)));
}

function adjacentStemPair(stems: string[], pair: readonly string[]): boolean {
  const left = stems.flatMap((stem, index) => stem === pair[0] ? [index] : []);
  const right = stems.flatMap((stem, index) => stem === pair[1] ? [index] : []);
  return left.some((a) => right.some((b) => Math.abs(a - b) === 1));
}

function hasSourceChannel(profile: BaseProfile): boolean {
  return profile.monthCommand || profile.fullFormation || profile.directionalFormation ||
    profile.rootStrength >= rules.roots.strongRootMinimum ||
    (profile.visibleStems.length > 0 && profile.rootStrength >= rules.roots.visibleConnectionMinimum);
}

function hasReceivingChannel(profile: BaseProfile): boolean {
  return profile.monthCommand || profile.fullFormation || profile.directionalFormation ||
    profile.visibleStems.length > 0 || profile.rootStrength >= rules.roots.roleStrength.residual;
}

export function calculateElementScores(pillars: FourPillars): Record<Element, ElementEvidence> {
  const pillarValues = PILLAR_KEYS.map((key) => pillars[key]);
  const branches = pillarValues.map((pillar) => pillar.branch);
  const stems = pillarValues.map((pillar) => pillar.stem);
  const season = seasonFromMonthBranch(pillars.month.branch);
  const groups = completedGroupElements(pillars);
  const monthElement = pillars.month.branchElement;
  const transformedStemRules = STEM_COMBINATIONS.filter((rule) =>
    adjacentStemPair(stems, rule.stems) &&
    (monthElement === rule.element || GENERATES[monthElement] === rule.element));

  const profiles = Object.fromEntries(ELEMENTS.map((element) => {
    const contributions: ScoreContribution[] = [];
    const visibleStems = stems.filter((stem) => STEMS[stem].element === element);
    const rootDetails = PILLAR_KEYS.flatMap((key: PillarKey) => {
      const branch = pillars[key].branch;
      return HIDDEN_STEMS[branch]
        .filter((hidden) => hidden.element === element)
        .map((hidden): RootEvidence => {
          const baseStrength = rules.roots.roleStrength[hidden.role] * rules.roots.positionMultiplier[key];
          const damaged = branchIsClashed(branch, branches);
          return {
            branch,
            stem: hidden.stem,
            role: hidden.role,
            strength: rounded(baseStrength * (damaged ? rules.roots.clashMultiplier : 1)),
            damaged,
          };
        });
    });
    const roots = [...new Set(rootDetails.map((root) => root.branch))];
    const rootStrength = rounded(rootDetails.reduce((sum, root) => sum + root.strength, 0));
    const hiddenStems = rootDetails.map((root) =>
      `${branchKorean(root.branch)}중 ${stemKorean(root.stem)}(${root.role}${root.damaged ? "·충손" : ""})`);
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

    PILLAR_KEYS.forEach((key) => {
      const pillar = pillars[key];
      if (key !== "day" && pillar.stemElement === element) {
        contributions.push(contribution(`${stemKorean(pillar.stem)} 천간 투출`, rules.scores.visibleStem));
      }
      if (pillar.branchElement === element) {
        contributions.push(contribution(`${branchKorean(pillar.branch)} 지지 본기`, rules.scores.branchMain));
      }
      for (const hidden of HIDDEN_STEMS[pillar.branch]) {
        if (hidden.element !== element || hidden.role === "main") continue;
        const value = hidden.role === "middle" ? rules.scores.hiddenMiddle : rules.scores.hiddenResidual;
        contributions.push(contribution(`${branchKorean(pillar.branch)} 지장간 ${stemKorean(hidden.stem)}(${hidden.role})`, value));
      }
    });

    const fullCount = groups.full.filter((value) => value === element).length;
    const directionCount = groups.directional.filter((value) => value === element).length;
    const halfCount = groups.half.filter((value) => value === element).length;
    const archingCount = groups.arching.filter((value) => value === element).length;
    const sixCount = SIX_COMBINATIONS.filter((rule) =>
      rule.element === element && rule.branches.every((branch) => branches.includes(branch)) &&
      (monthElement === element || GENERATES[monthElement] === element)).length;
    if (fullCount) contributions.push(contribution("삼합 완성", rules.scores.fullHarmony * fullCount));
    if (directionCount) contributions.push(contribution("방합 완성", rules.scores.directionalHarmony * directionCount));
    if (halfCount) contributions.push(contribution("왕지를 포함한 반합", rules.scores.halfHarmony * halfCount));
    if (archingCount) contributions.push(contribution("왕지가 빠진 공합 후보", rules.scores.archingHarmony * archingCount));
    if (sixCount) contributions.push(contribution("월령이 돕는 지지 육합", rules.scores.sixHarmony * sixCount));

    const transformedHere = transformedStemRules.filter((rule) => rule.element === element).length;
    if (transformedHere) {
      contributions.push(contribution("인접하고 월령이 돕는 천간합화", rules.scores.transformedStemCombination * transformedHere));
    }
    const combinedAway = transformedStemRules.some((rule) =>
      rule.element !== element && rule.stems.some((stem) => STEMS[stem].element === element));
    if (combinedAway && !monthCommand) {
      contributions.push(contribution("성립 조건을 갖춘 합화로 독립 작용이 약해짐", rules.scores.combinedAway));
    }

    if (roots.length === 1 && rootDetails.every((root) => root.damaged)) {
      contributions.push(contribution("유일한 뿌리가 충으로 손상", rules.scores.uniqueRootClash));
    }
    if (visibleStems.length > 0 && rootStrength < rules.roots.roleStrength.residual) {
      contributions.push(contribution("천간에만 있고 뿌리가 없음", rules.scores.stemWithoutRoot));
    }

    const combinations = [
      ...(fullCount ? ["삼합"] : []),
      ...(directionCount ? ["방합"] : []),
      ...(halfCount ? ["반합"] : []),
      ...(archingCount ? ["공합 후보"] : []),
      ...(sixCount ? ["육합"] : []),
      ...(transformedHere ? ["천간합화"] : []),
    ];
    const clashes = rootDetails.filter((root) => root.damaged)
      .map((root) => `${branchKorean(root.branch)} ${root.role}근 충손`);
    const baseScore = rounded(contributions.reduce((sum, item) => sum + item.value, 0));

    return [element, {
      element,
      contributions,
      visibleStems,
      roots,
      rootDetails,
      rootStrength,
      hiddenStems,
      monthCommand,
      combinations,
      clashes,
      seasonalStrength: (monthCommand ? rules.scores.monthBranchMain + rules.scores.monthCommandBonus : 0) + seasonalPhase.value,
      baseScore,
      fullFormation: fullCount > 0,
      directionalFormation: directionCount > 0,
    } satisfies BaseProfile];
  })) as Record<Element, BaseProfile>;

  const preliminary = Object.fromEntries(ELEMENTS.map((element) => {
    const profile = profiles[element];
    const contributions = [...profile.contributions];
    const generator = profiles[generatorOf(element)];
    const controller = profiles[controllerOf(element)];
    let supportScore = 0;

    const generatorReady = generator.baseScore >= rules.structure.supportSourceScore && hasSourceChannel(generator);
    const targetCanReceive = profile.baseScore >= rules.structure.supportTargetBaseScore && hasReceivingChannel(profile);
    if (generatorReady && targetCanReceive) {
      supportScore = rules.scores.strongSupport;
      contributions.push(contribution(`${ELEMENT_META[generator.element].label}의 성립된 기맥에서 받는 생조`, supportScore));
    }

    if (generator.baseScore >= rules.structure.flowSourceScore &&
        profile.baseScore >= rules.structure.flowTargetScore &&
        hasSourceChannel(generator) && hasSourceChannel(profile)) {
      contributions.push(contribution(`${ELEMENT_META[generator.element].label}생${ELEMENT_META[element].label} 유통`, rules.scores.flowingGeneration));
    }

    const passageSource = profiles[generatorOf(element)];
    const passageDestination = profiles[GENERATES[element]];
    const mediatorConnected = profile.monthCommand || profile.fullFormation || profile.directionalFormation ||
      (profile.visibleStems.length > 0 && profile.rootStrength >= rules.roots.visibleConnectionMinimum);
    if (CONTROLS[passageSource.element] === passageDestination.element &&
        passageSource.baseScore >= rules.structure.mediationSideScore &&
        passageDestination.baseScore >= rules.structure.mediationSideScore &&
        profile.baseScore >= rules.structure.mediationElementScore && mediatorConnected) {
      contributions.push(contribution(
        `${ELEMENT_META[passageSource.element].label}극${ELEMENT_META[passageDestination.element].label} 사이 실질 통관`,
        rules.scores.mediationPassage,
      ));
    }

    let controlPenalty = 0;
    const rescued = generator.baseScore >= rules.structure.weakRescueScore && hasSourceChannel(generator);
    if (controller.baseScore >= rules.structure.strongControllerScore &&
        controller.baseScore >= profile.baseScore + 2 && !rescued &&
        !profile.monthCommand && !profile.fullFormation && !profile.directionalFormation) {
      controlPenalty = rules.scores.uncontrolledStrongControl;
      contributions.push(contribution(`${ELEMENT_META[controller.element].label}의 강한 극을 받고 구원이 약함`, controlPenalty));
    }

    const score = rounded(contributions.reduce((sum, item) => sum + item.value, 0));
    const eligibilityReasons: string[] = [];
    if (profile.monthCommand) eligibilityReasons.push("월령 본기를 얻음");
    if (profile.visibleStems.length > 0 && profile.rootStrength >= rules.roots.visibleConnectionMinimum) {
      eligibilityReasons.push(`천간 투출과 통근 강도 ${profile.rootStrength.toFixed(1)}가 연결됨`);
    }
    if (profile.fullFormation || profile.directionalFormation) eligibilityReasons.push("삼합 또는 방합이 완성됨");
    if (pillars.day.stemElement === element &&
        (profile.rootStrength >= rules.roots.dayMasterMinimum || supportScore > 0)) {
      eligibilityReasons.push("일간 오행이 뿌리 또는 성립된 생조를 얻음");
    }
    const structuralEligible = score >= rules.structure.effectiveScore && eligibilityReasons.length > 0;
    const reasons = contributions.filter((item) => item.value !== 0)
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 5)
      .map((item) => `${item.label} ${item.value > 0 ? "+" : ""}${item.value}`);

    return [element, {
      element,
      baseScore: profile.baseScore,
      score,
      visibleStems: profile.visibleStems,
      roots: profile.roots,
      rootStrength: profile.rootStrength,
      rootDetails: profile.rootDetails,
      hiddenStems: profile.hiddenStems,
      seasonalStrength: profile.seasonalStrength,
      supportScore,
      controlPenalty,
      combinations: profile.combinations,
      clashes: profile.clashes,
      effective: false,
      potential: false,
      reasons,
      contributions,
      monthCommand: profile.monthCommand,
      structuralEligible,
      eligibilityReasons,
      qualitySelected: false,
    } satisfies ElementEvidence];
  })) as Record<Element, ElementEvidence>;

  const scores = ELEMENTS.map((element) => preliminary[element].score);
  const maximumScore = Math.max(...scores);

  return Object.fromEntries(ELEMENTS.map((element) => {
    const item = preliminary[element];
    const hasTrace = item.visibleStems.length > 0 || item.rootStrength > 0 || item.combinations.length > 0;
    const dominantGap = maximumScore - item.score;
    const collectiveEligible = !item.structuralEligible && hasTrace &&
      item.score >= rules.structure.collectiveMinimumScore &&
      dominantGap < rules.structure.collectiveMaximumSpread;
    return [element, collectiveEligible ? {
      ...item,
      structuralEligible: true,
      eligibilityReasons: [
        ...item.eligibilityReasons,
        `최강 오행과의 차가 ${dominantGap.toFixed(1)}점으로 극단적 이탈이 아니어서 전체 유통에 참여함`,
      ],
    } : item];
  })) as Record<Element, ElementEvidence>;
}

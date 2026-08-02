import type { Element, FourPillars } from "@/types/bazi";
import type { ElementEvidence, RootChannelEvidence, RootEvidence, ScoreContribution } from "@/types/spiritualRoot";
import { branchKorean } from "@/lib/bazi/branches";
import { HIDDEN_STEMS } from "@/lib/bazi/hiddenStems";
import { STEMS, stemKorean } from "@/lib/bazi/stems";
import {
  CLASH_PAIRS,
  DIRECTIONAL_GROUPS,
  SIX_COMBINATIONS,
  STEM_COMBINATIONS,
  THREE_HARMONIES,
  completedGroupElements,
} from "@/lib/bazi/relations";
import { CONTROLS, ELEMENT_META, ELEMENTS, GENERATES, controllerOf, generatorOf } from "@/lib/bazi/elementMeta";
import { monthlyQiForBranch, seasonalPhaseLabel } from "@/lib/bazi/monthlyQi";
import { SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";
import { calculateRootChannels } from "./calculateRootChannels";

const rules = SPIRITUAL_ROOT_RULES;
const PILLAR_KEYS = ["year", "month", "day", "hour"] as const;

type PillarKey = typeof PILLAR_KEYS[number];

interface BaseProfile {
  element: Element;
  presenceScore: number;
  presenceRatio: number;
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
  combinationPenalty: number;
}

interface StemCombinationEvaluation {
  sourceElements: Element[];
  targetElement: Element;
  state: "candidate" | "bound" | "transformed";
}

type ClashState = RootEvidence["clashState"];

interface FormationEvaluation {
  element: Element;
  kind: "삼합" | "방합";
  state: "gathered" | "transformed";
}

function rounded(value: number): number {
  return Math.round(value * 10) / 10;
}

function contribution(label: string, value: number): ScoreContribution {
  return { label, value, kind: value < 0 ? "penalty" : value > 0 ? "bonus" : "base" };
}

function emptyRootChannel(): RootChannelEvidence {
  return {
    heaven: { score: 0, passed: false, reasons: [] },
    earth: { score: 0, passed: false, reasons: [] },
    human: { score: 0, passed: false, reasons: [] },
    integrity: 0,
    completion: 0,
    state: "dormant",
    complete: false,
    potential: false,
    reasons: [],
  };
}

function evaluateBranchClashes(pillars: FourPillars): Record<string, ClashState> {
  const clashRules = rules.roots.clash;
  const branches = PILLAR_KEYS.map((key) => pillars[key].branch);
  const monthQi = monthlyQiForBranch(pillars.month.branch);
  const states: Record<string, ClashState> = Object.fromEntries([...new Set(branches)].map((branch) => [branch, "stable"]));
  const priority: Record<ClashState, number> = { stable: 0, activated: 1, shaken: 2, damaged: 3, uprooted: 4 };

  const branchVigor = (branch: string): number => {
    const seats = PILLAR_KEYS.filter((key) => pillars[key].branch === branch);
    const branchElement = pillars[seats[0]].branchElement;
    const seatPower = seats.reduce((sum, key) => sum + rules.roots.positionMultiplier[key], 0);
    const visibleEcho = PILLAR_KEYS.filter((key) => pillars[key].stemElement === branchElement).length * clashRules.visibleEchoWeight;
    const seasonalPower = monthQi.strength[branchElement] * clashRules.seasonalWeight;
    const monthSeat = seats.includes("month") ? clashRules.monthSeatBonus : 0;
    return seatPower + visibleEcho + seasonalPower + monthSeat;
  };
  const setState = (branch: string, state: ClashState) => {
    if (priority[state] > priority[states[branch]]) states[branch] = state;
  };

  for (const pair of CLASH_PAIRS) {
    if (!pair.every((branch) => branches.includes(branch))) continue;
    const [left, right] = pair;
    const difference = branchVigor(left) - branchVigor(right);
    if (Math.abs(difference) <= clashRules.activationAdvantage) {
      setState(left, "shaken");
      setState(right, "shaken");
      continue;
    }
    const winner = difference > 0 ? left : right;
    const loser = difference > 0 ? right : left;
    setState(winner, "activated");
    setState(loser, Math.abs(difference) >= clashRules.decisiveAdvantage ? "uprooted" : "damaged");
  }
  return states;
}

function clashStrengthMultiplier(state: ClashState): number {
  const clash = rules.roots.clash;
  if (state === "activated") return clash.activatedMultiplier;
  if (state === "shaken") return clash.shakenMultiplier;
  if (state === "damaged") return clash.damagedMultiplier;
  if (state === "uprooted") return clash.uprootedMultiplier;
  return 1;
}

function clashStateLabel(state: ClashState): string {
  return { stable: "안정", activated: "충발", shaken: "충동", damaged: "충손", uprooted: "발근" }[state];
}

function evaluateFormations(pillars: FourPillars, clashes: Record<string, ClashState>): FormationEvaluation[] {
  const branches = PILLAR_KEYS.map((key) => pillars[key].branch);
  const monthQi = monthlyQiForBranch(pillars.month.branch);
  const evaluate = (kind: FormationEvaluation["kind"], groupRules: typeof THREE_HARMONIES): FormationEvaluation[] =>
    groupRules.flatMap((group) => {
      if (!group.members.every((branch) => branches.includes(branch))) return [];
      const seasonSupports = monthQi.strength[group.element] >= rules.structure.formationSeasonalMinimum;
      const disrupted = group.members.some((branch) => ["damaged", "uprooted"].includes(clashes[branch]));
      return [{ element: group.element, kind, state: seasonSupports && !disrupted ? "transformed" : "gathered" }];
    });
  return [...evaluate("삼합", THREE_HARMONIES), ...evaluate("방합", DIRECTIONAL_GROUPS)];
}

function adjacentStemPair(stems: string[], pair: readonly string[]): boolean {
  const left = stems.flatMap((stem, index) => stem === pair[0] ? [index] : []);
  const right = stems.flatMap((stem, index) => stem === pair[1] ? [index] : []);
  return left.some((a) => right.some((b) => Math.abs(a - b) === 1));
}

function calculatePresence(pillars: FourPillars): Record<Element, { score: number; ratio: number }> {
  const mass = Object.fromEntries(ELEMENTS.map((element) => [element, 0])) as Record<Element, number>;
  for (const key of PILLAR_KEYS) {
    const pillar = pillars[key];
    mass[pillar.stemElement] += rules.presence.visibleStemMass;
    const hidden = HIDDEN_STEMS[pillar.branch];
    const shares = hidden.length === 1
      ? rules.presence.branchShares.single
      : hidden.length === 2
        ? rules.presence.branchShares.double
        : rules.presence.branchShares.triple;
    for (const item of hidden) mass[item.element] += rules.presence.branchMass * shares[item.role];
  }
  const total = PILLAR_KEYS.length * (rules.presence.visibleStemMass + rules.presence.branchMass);
  return Object.fromEntries(ELEMENTS.map((element) => [element, {
    score: rounded(mass[element]),
    ratio: rounded(mass[element] / total * 100),
  }])) as Record<Element, { score: number; ratio: number }>;
}

function evaluateStemCombinations(
  pillars: FourPillars,
  stems: string[],
  monthElement: Element,
  transformedFormationElements: Element[],
  profiles: Record<Element, BaseProfile>,
): StemCombinationEvaluation[] {
  return STEM_COMBINATIONS.flatMap((rule): StemCombinationEvaluation[] => {
    if (!rule.stems.every((stem) => stems.includes(stem))) return [];
    const adjacent = adjacentStemPair(stems, rule.stems);
    const includesDayStem = rule.stems.includes(pillars.day.stem);
    const targetSupported = monthElement === rule.element || transformedFormationElements.includes(rule.element);
    const sourceElements = [...new Set(rule.stems.map((stem) => STEMS[stem].element))];
    const resistingSources = sourceElements.filter((element) => element !== rule.element);
    const rootedResistance = resistingSources.length
      ? Math.max(...resistingSources.map((element) => profiles[element].rootStrength))
      : 0;
    const transformed = (!rules.stemCombination.requireAdjacency || adjacent) &&
      (!rules.stemCombination.requireDayStemForTransformation || includesDayStem) &&
      targetSupported && rootedResistance <= rules.stemCombination.originalRootResistanceMaximum;
    return [{
      sourceElements,
      targetElement: rule.element,
      state: transformed ? "transformed" : adjacent ? "bound" : "candidate",
    }];
  });
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
  const groups = completedGroupElements(pillars);
  const monthQi = monthlyQiForBranch(pillars.month.branch);
  const branchClashes = evaluateBranchClashes(pillars);
  const formations = evaluateFormations(pillars, branchClashes);
  const transformedFormationElements = formations.filter((item) => item.state === "transformed").map((item) => item.element);
  const monthElement = pillars.month.branchElement;
  const presence = calculatePresence(pillars);

  const rawProfiles = Object.fromEntries(ELEMENTS.map((element) => {
    const contributions: ScoreContribution[] = [];
    const visibleStems = stems.filter((stem) => STEMS[stem].element === element);
    const rootDetails = PILLAR_KEYS.flatMap((key: PillarKey) => {
      const branch = pillars[key].branch;
      return HIDDEN_STEMS[branch]
        .filter((hidden) => hidden.element === element)
        .map((hidden): RootEvidence => {
          const baseStrength = rules.roots.roleStrength[hidden.role] * rules.roots.positionMultiplier[key];
          const clashState = branchClashes[branch] ?? "stable";
          const damaged = clashState === "damaged" || clashState === "uprooted";
          return {
            branch,
            stem: hidden.stem,
            role: hidden.role,
            strength: rounded(baseStrength * clashStrengthMultiplier(clashState)),
            clashState,
            damaged,
          };
        });
    });
    const roots = [...new Set(rootDetails.map((root) => root.branch))];
    const rootStrength = rounded(rootDetails.reduce((sum, root) => sum + root.strength, 0));
    const hiddenStems = rootDetails.map((root) =>
      `${branchKorean(root.branch)}중 ${stemKorean(root.stem)}(${root.role}${root.clashState !== "stable" ? `·${clashStateLabel(root.clashState)}` : ""})`);
    const monthCommand = pillars.month.branchElement === element;
    const seasonalPhase = { label: seasonalPhaseLabel(monthQi.strength[element]), value: monthQi.strength[element] };

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

    const fullFormations = formations.filter((item) => item.element === element && item.kind === "삼합");
    const directionalFormations = formations.filter((item) => item.element === element && item.kind === "방합");
    const fullCount = fullFormations.length;
    const directionCount = directionalFormations.length;
    const fullTransformed = fullFormations.filter((item) => item.state === "transformed").length;
    const directionTransformed = directionalFormations.filter((item) => item.state === "transformed").length;
    const halfCount = groups.half.filter((value) => value === element).length;
    const archingCount = groups.arching.filter((value) => value === element).length;
    const sixCount = SIX_COMBINATIONS.filter((rule) =>
      rule.element === element && rule.branches.every((branch) => branches.includes(branch)) &&
      (monthElement === element || GENERATES[monthElement] === element)).length;
    if (fullCount) contributions.push(contribution("삼합 삼지 결집", rules.structure.formationGatheringScore * fullCount));
    if (fullTransformed) contributions.push(contribution("월령 지지로 삼합 성국", rules.structure.formationTransformationScore * fullTransformed));
    if (directionCount) contributions.push(contribution("방합 삼지 결집", rules.structure.formationGatheringScore * directionCount));
    if (directionTransformed) contributions.push(contribution("월령 지지로 방합 성국", rules.structure.formationTransformationScore * directionTransformed));
    if (halfCount) contributions.push(contribution("왕지를 포함한 반합", rules.scores.halfHarmony * halfCount));
    if (archingCount) contributions.push(contribution("왕지가 빠진 공합 후보", rules.scores.archingHarmony * archingCount));
    if (sixCount) contributions.push(contribution("월령이 돕는 지지 육합", rules.scores.sixHarmony * sixCount));

    if (roots.length === 1 && rootDetails.every((root) => root.damaged)) {
      contributions.push(contribution("유일한 뿌리가 충으로 손상", rules.scores.uniqueRootClash));
    }
    if (visibleStems.length > 0 && rootStrength < rules.roots.roleStrength.residual) {
      contributions.push(contribution("천간에만 있고 뿌리가 없음", rules.scores.stemWithoutRoot));
    }

    const combinations = [
      ...(fullCount ? [fullTransformed ? "삼합 성국" : "삼합 결집"] : []),
      ...(directionCount ? [directionTransformed ? "방합 성국" : "방합 결집"] : []),
      ...(halfCount ? ["반합"] : []),
      ...(archingCount ? ["공합 후보"] : []),
      ...(sixCount ? ["육합"] : []),
    ];
    const clashes = rootDetails.filter((root) => root.clashState !== "stable")
      .map((root) => `${branchKorean(root.branch)} ${root.role}근 ${clashStateLabel(root.clashState)}`);
    const baseScore = rounded(contributions.reduce((sum, item) => sum + item.value, 0));

    return [element, {
      element,
      presenceScore: presence[element].score,
      presenceRatio: presence[element].ratio,
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
      fullFormation: fullTransformed > 0,
      directionalFormation: directionTransformed > 0,
      combinationPenalty: 0,
    } satisfies BaseProfile];
  })) as Record<Element, BaseProfile>;

  const stemCombinationEvaluations = evaluateStemCombinations(
    pillars, stems, monthElement, transformedFormationElements, rawProfiles,
  );
  const profiles = Object.fromEntries(ELEMENTS.map((element) => {
    const profile = rawProfiles[element];
    const contributions = [...profile.contributions];
    const combinations = [...profile.combinations];
    const transformedTo = stemCombinationEvaluations.filter((item) =>
      item.state === "transformed" && item.targetElement === element).length;
    const transformedFrom = stemCombinationEvaluations.filter((item) =>
      item.state === "transformed" && item.sourceElements.includes(element)).length;
    const bound = stemCombinationEvaluations.filter((item) =>
      item.state === "bound" && item.sourceElements.includes(element)).length;
    let combinationPenalty = 0;
    if (transformedTo) {
      contributions.push(contribution("일간 참여·월령·무근 조건을 갖춘 천간합화", rules.scores.transformedStemCombination * transformedTo));
      combinations.push("천간합화");
    }
    if (transformedFrom && !profile.monthCommand) {
      const value = rules.scores.combinedAway * transformedFrom;
      contributions.push(contribution("완전 합화로 원래 오행의 독립 작용이 약해짐", value));
      combinationPenalty += value;
    } else if (bound) {
      const value = rules.scores.combinedBinding * bound;
      contributions.push(contribution("천간은 합하지만 화하지 않아 일부 결속됨", value));
      combinations.push("천간합·불화");
      combinationPenalty += value;
    }
    return [element, {
      ...profile,
      contributions,
      combinations,
      combinationPenalty,
      baseScore: rounded(contributions.reduce((sum, item) => sum + item.value, 0)),
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
    } else if (generator.rootStrength >= rules.roots.strongRootMinimum && targetCanReceive) {
      supportScore = rules.scores.rootedSourceSupport;
      contributions.push(contribution(`${ELEMENT_META[generator.element].label}의 뿌리에서 받는 미약 생조`, supportScore));
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
      const rootedMitigation = profile.rootStrength >= rules.structure.rootedPotentialMinimum
        ? rules.scores.rootedControlMitigation : 0;
      controlPenalty = rules.scores.uncontrolledStrongControl + rootedMitigation;
      contributions.push(contribution(
        rootedMitigation
          ? `${ELEMENT_META[controller.element].label}의 강한 극을 받지만 통근이 일부 버팀`
          : `${ELEMENT_META[controller.element].label}의 강한 극을 받고 구원이 약함`,
        controlPenalty,
      ));
    }

    const combinedConstraint = profile.combinationPenalty + controlPenalty;
    if (combinedConstraint < rules.structure.compoundConstraintFloor) {
      contributions.push(contribution(
        "같은 기맥에 겹친 합거·극제 감점의 중복 상한",
        rules.structure.compoundConstraintFloor - combinedConstraint,
      ));
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
    const potentialReasons: string[] = [];
    const visibleAndRooted = profile.visibleStems.length > 0 &&
      profile.rootStrength >= rules.structure.rootedPotentialMinimum;
    const independentTrace = profile.monthCommand || profile.fullFormation || profile.directionalFormation ||
      visibleAndRooted || profile.rootStrength >= rules.roots.strongRootMinimum;
    if (!structuralEligible && visibleAndRooted) {
      potentialReasons.push("천간 투출과 약한 통근은 이어지지만 계절·극제 때문에 독립 활성도가 부족함");
    }
    if (!structuralEligible && score >= rules.structure.potentialScore && independentTrace) {
      potentialReasons.push("기맥 활성도와 독립 흔적이 잠재 기준을 충족함");
    }
    const reasons = contributions.filter((item) => item.value !== 0)
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 5)
      .map((item) => `${item.label} ${item.value > 0 ? "+" : ""}${item.value}`);

    return [element, {
      element,
      presenceScore: profile.presenceScore,
      presenceRatio: profile.presenceRatio,
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
      activationOrigin: "none",
      eligibilityReasons,
      potentialReasons,
      selectedRoot: false,
      channel: emptyRootChannel(),
    } satisfies ElementEvidence];
  })) as Record<Element, ElementEvidence>;

  return calculateRootChannels(pillars, preliminary);
}

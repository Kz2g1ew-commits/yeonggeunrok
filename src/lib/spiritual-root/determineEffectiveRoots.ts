import type { Element } from "@/types/bazi";
import type { ElementEvidence, QualityDistributionResult } from "@/types/spiritualRoot";
import { ELEMENTS } from "@/lib/bazi/elementMeta";
import { MUTATION_RULES } from "./mutationRules";
import { SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";

function rankedElements(evidence: Record<Element, ElementEvidence>): Element[] {
  return [...ELEMENTS].sort((a, b) => evidence[b].score - evidence[a].score || ELEMENTS.indexOf(a) - ELEMENTS.indexOf(b));
}

function bestMutationPair(evidence: Record<Element, ElementEvidence>, eligible: Element[]): Element[] | undefined {
  const uniquePairs = new Map<string, Element[]>();
  for (const rule of MUTATION_RULES) {
    const pair = [...rule.sourceElements].sort((a, b) => ELEMENTS.indexOf(a) - ELEMENTS.indexOf(b));
    uniquePairs.set(pair.join("-"), pair);
  }
  return [...uniquePairs.values()].filter((pair) => pair.every((element) => eligible.includes(element))).sort((left, right) => {
    const pairScore = ([a, b]: Element[]) => evidence[a].score + evidence[b].score
      - Math.abs(evidence[a].score - evidence[b].score) * 0.75
      + (evidence[a].monthCommand || evidence[b].monthCommand ? 2 : 0);
    return pairScore(right) - pairScore(left);
  })[0];
}

function isDirectlyEligible(item: ElementEvidence): boolean {
  return item.eligibilityReasons.some((reason) => !reason.includes("전체 유통에 참여"));
}

function canCondenseHeavenly(
  evidence: Record<Element, ElementEvidence>,
  structural: Element[],
): boolean {
  if (!structural.length) return false;
  const [primary, ...others] = rankedElements(evidence).filter((element) => structural.includes(element));
  if (!others.length) return true;
  const strongestSecondary = Math.max(...others.map((element) => evidence[element].score));
  return evidence[primary].score >= SPIRITUAL_ROOT_RULES.thresholds.heavenlyPrimaryMin &&
    strongestSecondary <= SPIRITUAL_ROOT_RULES.thresholds.heavenlySecondaryMax &&
    evidence[primary].score - strongestSecondary >= SPIRITUAL_ROOT_RULES.thresholds.heavenlyPurityGap;
}

export function determineEffectiveRoots(
  rawEvidence: Record<Element, ElementEvidence>,
  awakeningPassed = true,
  quality?: QualityDistributionResult,
): {
  evidence: Record<Element, ElementEvidence>;
  effective: Element[];
  potential: Element[];
  structural: Element[];
} {
  const structural = rankedElements(rawEvidence).filter((element) => rawEvidence[element].structuralEligible);
  const mutationPair = quality?.targetTier === "mutation" ? bestMutationPair(rawEvidence, structural) : undefined;
  const mutationBlocked = mutationPair
    ? structural.some((element) => !mutationPair.includes(element) && isDirectlyEligible(rawEvidence[element]))
    : true;
  const selected = !awakeningPassed || !quality ? []
    : quality.targetTier === "heavenly"
      ? canCondenseHeavenly(rawEvidence, structural) ? structural.slice(0, 1) : structural.length >= 2 ? structural : []
      : quality.targetTier === "mutation"
        ? mutationPair && !mutationBlocked ? mutationPair : structural.length >= 2 ? structural : []
        : structural.length >= 2 ? structural : [];

  const evidence = Object.fromEntries(ELEMENTS.map((element) => {
    const item = rawEvidence[element];
    const visibleAndRooted = item.visibleStems.length > 0 &&
      item.rootStrength >= SPIRITUAL_ROOT_RULES.structure.rootedPotentialMinimum;
    const hasIndependentChannel = visibleAndRooted || item.monthCommand ||
      item.rootStrength >= SPIRITUAL_ROOT_RULES.roots.strongRootMinimum ||
      item.combinations.some((relation) => relation === "삼합" || relation === "방합");
    const potentialReady = hasIndependentChannel && (
      item.score >= SPIRITUAL_ROOT_RULES.structure.potentialScore || visibleAndRooted
    );
    const effective = awakeningPassed && item.structuralEligible && selected.includes(element);
    const potential = !effective && (item.structuralEligible || potentialReady);
    return [element, { ...item, effective, potential, qualitySelected: effective }];
  })) as Record<Element, ElementEvidence>;

  return {
    evidence,
    effective: ELEMENTS.filter((element) => evidence[element].effective)
      .sort((a, b) => evidence[b].score - evidence[a].score),
    potential: ELEMENTS.filter((element) => evidence[element].potential)
      .sort((a, b) => evidence[b].score - evidence[a].score),
    structural,
  };
}

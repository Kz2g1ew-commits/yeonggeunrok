import type { Element } from "@/types/bazi";
import type { ElementEvidence } from "@/types/spiritualRoot";
import { ELEMENTS } from "@/lib/bazi/elementMeta";
import { SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";
import { hasEffectiveActivationBasis } from "./rootActivationEligibility";

function rankedElements(evidence: Record<Element, ElementEvidence>): Element[] {
  return [...ELEMENTS].sort((a, b) =>
    evidence[b].channel.completion - evidence[a].channel.completion ||
    evidence[b].score - evidence[a].score ||
    ELEMENTS.indexOf(a) - ELEMENTS.indexOf(b));
}

export function determineEffectiveRoots(
  rawEvidence: Record<Element, ElementEvidence>,
  awakeningPassed = true,
): {
  evidence: Record<Element, ElementEvidence>;
  effective: Element[];
  potential: Element[];
  structural: Element[];
} {
  const ranked = rankedElements(rawEvidence);
  const direct = ranked.filter((element) =>
    rawEvidence[element].channel.complete &&
    // 관문 계산의 예외가 바뀌어도 활성 기반이 없는 흔적은 유효 영근이 될 수 없다.
    hasEffectiveActivationBasis(rawEvidence[element]));
  const channelRules = SPIRITUAL_ROOT_RULES.channelGates;
  const carried = direct.length >= channelRules.mixedNetworkMinimum
    ? ranked.filter((element) => !direct.includes(element) &&
      rawEvidence[element].channel.potential &&
      (rawEvidence[element].score >= channelRules.carriedActivationMinimum ||
        (direct.length >= 4 && hasEffectiveActivationBasis(rawEvidence[element]))) &&
      rawEvidence[element].channel.integrity >= channelRules.carriedIntegrityMinimum)
    : [];
  const structural = [...direct, ...carried].sort((a, b) => ranked.indexOf(a) - ranked.indexOf(b));
  const [primary, ...secondary] = structural;
  const strongestSecondaryScore = secondary.length
    ? Math.max(...secondary.map((element) => rawEvidence[element].score))
    : Number.NEGATIVE_INFINITY;
  const purity = SPIRITUAL_ROOT_RULES.thresholds;
  const condensesToHeavenly = Boolean(primary) && secondary.length > 0 &&
    rawEvidence[primary].score >= purity.heavenlyPrimaryMin &&
    strongestSecondaryScore <= purity.heavenlySecondaryMax &&
    rawEvidence[primary].score - strongestSecondaryScore >= purity.heavenlyPurityGap;
  const workingStructural = condensesToHeavenly ? [primary] : structural;
  const absorbed = condensesToHeavenly ? secondary : [];
  const effective = awakeningPassed ? workingStructural : [];
  const potential = ranked.filter((element) =>
    !effective.includes(element) && (rawEvidence[element].channel.potential || structural.includes(element)));
  const evidence = Object.fromEntries(ELEMENTS.map((element) => {
    const isEffective = effective.includes(element);
    const isPotential = potential.includes(element);
    const isCarried = carried.includes(element);
    const isAbsorbed = absorbed.includes(element);
    const isPrimary = condensesToHeavenly && element === primary;
    const eligibilityReasons = isCarried
      ? [...rawEvidence[element].eligibilityReasons, "세 개 이상의 완성 기맥이 약한 삼관 통로를 혼합 영근으로 운반함"]
      : rawEvidence[element].eligibilityReasons;
    return [element, {
      ...rawEvidence[element],
      effective: isEffective,
      potential: isPotential,
      selectedRoot: isEffective,
      structuralEligible: rawEvidence[element].structuralEligible || isCarried,
      activationOrigin: isCarried ? "network-assisted" : rawEvidence[element].activationOrigin,
      eligibilityReasons: isPrimary
        ? [...eligibilityReasons, "주근의 강도·부근 상한·순도 격차를 모두 충족하여 천영근으로 응축됨"]
        : eligibilityReasons,
      potentialReasons: isAbsorbed
        ? [...rawEvidence[element].potentialReasons, "독립 통로는 있으나 강한 주근의 순도장 안에서 잠재 기맥으로 흡수됨"]
        : rawEvidence[element].potentialReasons,
    }];
  })) as Record<Element, ElementEvidence>;

  return { evidence, effective, potential, structural };
}

import type { BirthInput, Element } from "@/types/bazi";
import type { RootQualityTier } from "@/types/spiritualRoot";
import { ELEMENTS } from "@/lib/bazi/elementMeta";
import { calculateFourPillars } from "@/lib/calendar/calculateFourPillars";
import { analyzeSpiritualRoots } from "@/lib/spiritual-root/analyzeSpiritualRoots";
import { determineAwakening } from "@/lib/spiritual-root/determineAwakening";
import { hasEffectiveActivationBasis } from "@/lib/spiritual-root/rootActivationEligibility";

export const ROOT_TIERS: RootQualityTier[] = [
  "none", "heavenly", "mutation", "dual", "triple", "quadruple", "five",
];

export interface PopulationSample {
  size: number;
  tierCounts: Record<RootQualityTier, number>;
  elementEffectiveCounts: Record<Element, number>;
  networkAssistedCount: number;
  totalEffectiveCount: number;
  invalidActivationCount: number;
  missingMultiRootProfileCount: number;
  finalMutationInvariantViolations: number;
  balancedInvariantViolations: number;
  strictInvariantViolations: number;
  mutationCandidateRows: number;
  finalMutationRows: number;
  finalMutationIds: Set<string>;
  quadrupleSubtypes: Set<string>;
  fiveSubtypes: Set<string>;
  fiveQiCycles: number;
  fiveQiVariantCounts: Record<string, number>;
  balancedPasses: number;
  strictPasses: number;
}

function emptyCounts<T extends string>(keys: readonly T[]): Record<T, number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
}

function sameElements(left: Element[], right: Element[]): boolean {
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.length === sortedRight.length &&
    sortedLeft.every((element, index) => element === sortedRight[index]);
}

export function runPopulationCohort(initialSeed: number, size: number): PopulationSample {
  let seed = initialSeed >>> 0;
  const random = () => {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
    return seed;
  };
  const sample: PopulationSample = {
    size,
    tierCounts: emptyCounts(ROOT_TIERS),
    elementEffectiveCounts: emptyCounts(ELEMENTS),
    networkAssistedCount: 0,
    totalEffectiveCount: 0,
    invalidActivationCount: 0,
    missingMultiRootProfileCount: 0,
    finalMutationInvariantViolations: 0,
    balancedInvariantViolations: 0,
    strictInvariantViolations: 0,
    mutationCandidateRows: 0,
    finalMutationRows: 0,
    finalMutationIds: new Set<string>(),
    quadrupleSubtypes: new Set<string>(),
    fiveSubtypes: new Set<string>(),
    fiveQiCycles: 0,
    fiveQiVariantCounts: {},
    balancedPasses: 0,
    strictPasses: 0,
  };

  for (let index = 0; index < size; index += 1) {
    const input: BirthInput = {
      judgmentMode: "generous", calendarType: "solar", isLeapMonth: false,
      year: 1900 + random() % 201, month: 1 + random() % 12, day: 1 + random() % 28,
      hour: random() % 24, minute: random() % 60,
      timezone: "Asia/Seoul", country: "대한민국", city: "서울", longitude: 126.978,
      longitudeIsApproximate: true, gender: "unspecified", applyLateZi: false,
      applyTrueSolarTime: false, timeAccuracy: "exact",
      shensha: { enabled: false, huagai: false, guimen: false, yima: false },
    };
    const calculation = calculateFourPillars(input);
    const result = analyzeSpiritualRoots(input, calculation).result;
    sample.tierCounts[result.classification.qualityTier] += 1;

    for (const element of result.primaryElements) {
      const item = result.elementEvidence[element];
      sample.elementEffectiveCounts[element] += 1;
      sample.totalEffectiveCount += 1;
      if (item.activationOrigin === "network-assisted") sample.networkAssistedCount += 1;
      if (!hasEffectiveActivationBasis(item)) sample.invalidActivationCount += 1;
    }

    const profile = result.classification.multiRootProfile;
    if (["quadruple", "five"].includes(result.classification.qualityTier) && !profile) {
      sample.missingMultiRootProfileCount += 1;
    }
    if (result.classification.qualityTier === "quadruple" && profile) {
      sample.quadrupleSubtypes.add(profile.subtype);
    }
    if (result.classification.qualityTier === "five" && profile) {
      sample.fiveSubtypes.add(profile.subtype);
      if (profile.subtype === "오기조원형") {
        sample.fiveQiCycles += 1;
        const variant = profile.fiveRootVariant ?? "미분류";
        sample.fiveQiVariantCounts[variant] = (sample.fiveQiVariantCounts[variant] ?? 0) + 1;
      }
    }

    const activeCandidates = result.mutations.filter((candidate) => candidate.status !== "rejected");
    if (activeCandidates.length > 0) {
      sample.mutationCandidateRows += 1;
    }
    if (result.classification.qualityTier === "mutation") {
      sample.finalMutationRows += 1;
      const selected = result.mutations.find((candidate) => candidate.status === "confirmed");
      if (selected) sample.finalMutationIds.add(selected.id);
      if (!selected || result.primaryElements.length !== 2 || !sameElements(selected.sourceElements, result.primaryElements)) {
        sample.finalMutationInvariantViolations += 1;
      }
    }

    if (determineAwakening("balanced", calculation.pillars, result.elementEvidence, result.awakening.dao).passed) {
      sample.balancedPasses += 1;
      const balancedResult = analyzeSpiritualRoots({ ...input, judgmentMode: "balanced" }, calculation).result;
      if (balancedResult.classification.qualityTier !== result.classification.qualityTier ||
        !sameElements(balancedResult.primaryElements, result.primaryElements)) {
        sample.balancedInvariantViolations += 1;
      }
    }
    if (determineAwakening("strict", calculation.pillars, result.elementEvidence, result.awakening.dao).passed) {
      sample.strictPasses += 1;
      const strictResult = analyzeSpiritualRoots({ ...input, judgmentMode: "strict" }, calculation).result;
      if (strictResult.classification.qualityTier !== result.classification.qualityTier ||
        !sameElements(strictResult.primaryElements, result.primaryElements)) {
        sample.strictInvariantViolations += 1;
      }
    }
  }

  return sample;
}

export function mergePopulationSamples(samples: PopulationSample[]): PopulationSample {
  const merged = runPopulationCohort(0, 0);
  for (const sample of samples) {
    merged.size += sample.size;
    ROOT_TIERS.forEach((tier) => { merged.tierCounts[tier] += sample.tierCounts[tier]; });
    ELEMENTS.forEach((element) => { merged.elementEffectiveCounts[element] += sample.elementEffectiveCounts[element]; });
    merged.networkAssistedCount += sample.networkAssistedCount;
    merged.totalEffectiveCount += sample.totalEffectiveCount;
    merged.invalidActivationCount += sample.invalidActivationCount;
    merged.missingMultiRootProfileCount += sample.missingMultiRootProfileCount;
    merged.finalMutationInvariantViolations += sample.finalMutationInvariantViolations;
    merged.balancedInvariantViolations += sample.balancedInvariantViolations;
    merged.strictInvariantViolations += sample.strictInvariantViolations;
    merged.mutationCandidateRows += sample.mutationCandidateRows;
    merged.finalMutationRows += sample.finalMutationRows;
    merged.fiveQiCycles += sample.fiveQiCycles;
    merged.balancedPasses += sample.balancedPasses;
    merged.strictPasses += sample.strictPasses;
    sample.finalMutationIds.forEach((id) => merged.finalMutationIds.add(id));
    sample.quadrupleSubtypes.forEach((subtype) => merged.quadrupleSubtypes.add(subtype));
    sample.fiveSubtypes.forEach((subtype) => merged.fiveSubtypes.add(subtype));
    Object.entries(sample.fiveQiVariantCounts).forEach(([variant, count]) => {
      merged.fiveQiVariantCounts[variant] = (merged.fiveQiVariantCounts[variant] ?? 0) + count;
    });
  }
  return merged;
}

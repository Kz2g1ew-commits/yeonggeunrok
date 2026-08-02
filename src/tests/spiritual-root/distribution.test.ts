import { describe, expect, it } from "vitest";
import type { RootQualityTier } from "@/types/spiritualRoot";
import { mergePopulationSamples, runPopulationCohort } from "./populationSample";

const SEEDS = [246_813_579, 482_710_357, 0x9e37_79b9, 0x6d2b_79f5];
const COHORT_SIZE = 5_000;

const AGGREGATE_RANGES: Partial<Record<RootQualityTier, [number, number]>> = {
  none: [0, 0.002],
  heavenly: [0.008, 0.018],
  // 목표 하한 2.5%에 20,000개 유한 표본의 오차 여유를 둔다.
  mutation: [0.024, 0.045],
  dual: [0.055, 0.08],
  triple: [0.23, 0.28],
  quadruple: [0.34, 0.4],
  five: [0.24, 0.3],
};

const COHORT_SAFETY_RANGES: Partial<Record<RootQualityTier, [number, number]>> = {
  heavenly: [0.004, 0.025],
  mutation: [0.012, 0.06],
  dual: [0.035, 0.105],
  triple: [0.18, 0.34],
  quadruple: [0.29, 0.47],
  five: [0.18, 0.36],
};

describe("spiritual-root population balance", () => {
  it("keeps the intended rarity order across multiple deterministic cohorts", { timeout: 45_000 }, () => {
    const cohorts = SEEDS.map((seed) => runPopulationCohort(seed, COHORT_SIZE));
    const sample = mergePopulationSamples(cohorts);
    const share = (tier: RootQualityTier) => sample.tierCounts[tier] / sample.size;

    for (const [tier, [minimum, maximum]] of Object.entries(AGGREGATE_RANGES) as Array<[RootQualityTier, [number, number]]>) {
      expect(share(tier), `${tier} aggregate share`).toBeGreaterThanOrEqual(minimum);
      expect(share(tier), `${tier} aggregate share`).toBeLessThanOrEqual(maximum);
    }
    for (const cohort of cohorts) {
      for (const [tier, [minimum, maximum]] of Object.entries(COHORT_SAFETY_RANGES) as Array<[RootQualityTier, [number, number]]>) {
        const cohortShare = cohort.tierCounts[tier] / cohort.size;
        expect(cohortShare, `${tier} cohort share`).toBeGreaterThanOrEqual(minimum);
        expect(cohortShare, `${tier} cohort share`).toBeLessThanOrEqual(maximum);
      }
    }

    expect(share("heavenly")).toBeLessThan(share("mutation"));
    expect(share("mutation")).toBeLessThan(share("dual"));
    expect(share("dual")).toBeLessThan(share("five"));
    expect(share("five") + share("quadruple")).toBeGreaterThan(0.5);
    expect(sample.invalidActivationCount).toBe(0);
    expect(sample.missingMultiRootProfileCount).toBe(0);
    expect(sample.balancedInvariantViolations).toBe(0);
    expect(sample.strictInvariantViolations).toBe(0);
    expect(sample.quadrupleSubtypes.size).toBeGreaterThanOrEqual(5);
    expect(sample.fiveSubtypes.size).toBeGreaterThanOrEqual(5);
    expect(sample.fiveQiCycles / sample.size).toBeGreaterThan(0.005);
    expect(sample.fiveQiCycles / sample.size).toBeLessThan(0.04);
    for (const variant of ["원융", "유통", "편기", "탁류"]) {
      expect(sample.fiveQiVariantCounts[variant] ?? 0, `${variant} five-qi variant`).toBeGreaterThan(0);
    }
    const networkAssistedShare = sample.networkAssistedCount / sample.totalEffectiveCount;
    expect(networkAssistedShare).toBeGreaterThan(0.37);
    expect(networkAssistedShare).toBeLessThan(0.42);
    expect(sample.balancedPasses / sample.size).toBeGreaterThan(0.11);
    expect(sample.balancedPasses / sample.size).toBeLessThan(0.15);
    expect(sample.strictPasses / sample.size).toBeGreaterThan(0.005);
    expect(sample.strictPasses / sample.size).toBeLessThan(0.015);

    expect(sample.mutationCandidateRows).toBeGreaterThan(sample.finalMutationRows);
    expect(sample.finalMutationIds.size).toBeGreaterThanOrEqual(11);
    expect(sample.finalMutationIds).toContain("crystal");
    expect(sample.finalMutationIds).toContain("cloud");
    expect((sample.finalMutationCounts.crystal ?? 0) / sample.size).toBeGreaterThan(0.001);
    expect((sample.finalMutationCounts.crystal ?? 0) / sample.size).toBeLessThan(0.003);
    expect(sample.finalMutationCounts.cloud ?? 0).toBeGreaterThan(0);
    expect(sample.finalMutationCounts.cloud ?? 0).toBeLessThan(10);
    expect(sample.mutationCandidateCounts.crystal ?? 0).toBeGreaterThan(sample.finalMutationCounts.crystal ?? 0);
    expect(sample.mutationCandidateCounts.cloud ?? 0).toBeGreaterThan(sample.finalMutationCounts.cloud ?? 0);
    expect(sample.confirmedSelectionGroupViolations).toBe(0);
    expect(sample.confirmedSourcePairViolations).toBe(0);
    expect(sample.finalMutationInvariantViolations).toBe(0);
  });
});

import type { BirthInput, Element, FourPillarsCalculation } from "@/types/bazi";
import type { ConfidenceBreakdown, ElementEvidence, MutationCandidate } from "@/types/spiritualRoot";
import { ELEMENTS } from "@/lib/bazi/elementMeta";
import { SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";

export function confidenceLabel(value: number): string {
  if (value >= 90) return "매우 명확";
  if (value >= 75) return "유력";
  if (value >= 55) return "가능성 높음";
  if (value >= 35) return "경계형";
  return "판정 불안정";
}

export function calculateConfidence(
  input: BirthInput,
  calculation: FourPillarsCalculation,
  evidence: Record<Element, ElementEvidence>,
  mutations: MutationCandidate[],
  conflictCount: number,
): { confidence: number; label: string; breakdown: ConfidenceBreakdown } {
  const timeAccuracy = input.timeAccuracy === "exact" ? 20 : input.timeAccuracy === "approximate" ? 13 : 6;
  const locationQuality = input.longitude !== undefined
    ? input.longitudeIsApproximate ? 11 : 15
    : input.applyTrueSolarTime ? 5 : 10;

  const boundaryDistance = Math.min(
    calculation.boundary.minutesToTimeBranch,
    calculation.boundary.minutesToSolarTerm ?? 1440,
  );
  const boundarySafety = boundaryDistance >= 120 ? 20 : boundaryDistance >= 60 ? 16 : boundaryDistance > 30 ? 12 : 5;

  const distances = ELEMENTS.map((element) => Math.abs(evidence[element].score - SPIRITUAL_ROOT_RULES.thresholds.effective));
  const closestThreshold = Math.min(...distances);
  const effectiveScores = ELEMENTS.filter((element) => evidence[element].effective).map((element) => evidence[element].score).sort((a, b) => b - a);
  const scoreGap = effectiveScores.length >= 2 ? Math.abs(effectiveScores[0] - effectiveScores[1]) : closestThreshold;
  const scoreClarity = closestThreshold >= 2 && scoreGap >= 2 ? 20 : closestThreshold >= 1 ? 15 : 9;

  const activeMutations = mutations.filter((candidate) => candidate.status !== "rejected");
  const mutationClarity = activeMutations.length === 0 ? 12
    : activeMutations.length === 1 && ["confirmed", "likely"].includes(activeMutations[0].status) ? 15
    : activeMutations.length >= 2 && Math.abs(activeMutations[0].confidence - activeMutations[1].confidence) < 10 ? 7 : 11;
  const ruleConsistency = conflictCount >= 5 ? 4 : conflictCount >= 3 ? 7 : 10;
  const breakdown = { timeAccuracy, locationQuality, boundarySafety, scoreClarity, mutationClarity, ruleConsistency };
  const confidence = Math.max(0, Math.min(100, Object.values(breakdown).reduce((sum, value) => sum + value, 0)));
  return { confidence, label: confidenceLabel(confidence), breakdown };
}

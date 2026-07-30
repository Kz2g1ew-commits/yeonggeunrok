import type { BranchRelations, Element, FourPillars, ShenshaResult } from "./bazi";

export type RootCount = "none" | "single" | "dual" | "triple" | "quadruple" | "five";
export type RootGrade = "low" | "middle" | "high" | "supreme";

export interface ScoreContribution {
  label: string;
  value: number;
  kind: "base" | "bonus" | "penalty";
}

export interface ElementEvidence {
  element: Element;
  score: number;
  visibleStems: string[];
  roots: string[];
  hiddenStems: string[];
  seasonalStrength: number;
  supportScore: number;
  controlPenalty: number;
  combinations: string[];
  clashes: string[];
  effective: boolean;
  potential: boolean;
  reasons: string[];
  contributions: ScoreContribution[];
  monthCommand: boolean;
}

export interface MutationCandidate {
  id: string;
  name: string;
  sourceElements: Element[];
  score: number;
  confidence: number;
  status: "confirmed" | "likely" | "possible" | "rejected";
  satisfiedConditions: string[];
  missingConditions: string[];
  blockers: string[];
  description: string;
}

export interface RootClassification {
  rootCount: RootCount;
  displayName: string;
  relationship?: string;
  grade?: RootGrade;
  originalElements: Element[];
  workingElements: string[];
  missingElement?: Element;
  cultivationSpeed: string;
  adaptability: string;
}

export interface ConfidenceBreakdown {
  timeAccuracy: number;
  locationQuality: number;
  boundarySafety: number;
  scoreClarity: number;
  mutationClarity: number;
  ruleConsistency: number;
}

export interface SpiritualRootResult {
  rootCount: RootCount;
  displayName: string;
  primaryElements: Element[];
  potentialElements: Element[];
  grade?: RootGrade;
  relationship?: string;
  mutations: MutationCandidate[];
  confidence: number;
  confidenceLabel: string;
  confidenceBreakdown: ConfidenceBreakdown;
  elementEvidence: Record<Element, ElementEvidence>;
  strengths: string[];
  weaknesses: string[];
  recommendedPaths: string[];
  recommendedWeapons: string[];
  recommendedTechniques: string[];
  risks: string[];
  growthDirection: string;
  explanations: string[];
  disclaimer: string;
  classification: RootClassification;
}

export interface AnalysisContext {
  pillars: FourPillars;
  evidence: Record<Element, ElementEvidence>;
  relations: BranchRelations;
  shensha: ShenshaResult[];
  season: "spring" | "summer" | "earth" | "autumn" | "winter";
}

export interface AnalysisBundle {
  result: SpiritualRootResult;
  relations: BranchRelations;
  shensha: ShenshaResult[];
}

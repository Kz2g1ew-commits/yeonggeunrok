import type { BranchRelations, Element, FourPillars, RootJudgmentMode, ShenshaResult } from "./bazi";

export type RootCount = "none" | "single" | "dual" | "triple" | "quadruple" | "five";
export type RootGrade = "low" | "middle" | "high" | "supreme";
export type RootQualityTier = "none" | "heavenly" | "mutation" | "dual" | "triple" | "quadruple" | "five";
export type DaoPath = "natural" | "defiant";

export interface DaoContribution {
  path: DaoPath;
  label: string;
  value: number;
  reason: string;
}

export interface DaoAffinityResult {
  path: DaoPath;
  naturalScore: number;
  defiantScore: number;
  score: number;
  contributions: DaoContribution[];
  reasons: string[];
}

export interface AwakeningResult {
  mode: RootJudgmentMode;
  passed: boolean;
  threshold: number;
  apertureScore: number;
  populationRate: number;
  label: string;
  explanation: string;
  completeChannels: Element[];
  potentialChannels: Element[];
  dao: DaoAffinityResult;
}

export interface ScoreContribution {
  label: string;
  value: number;
  kind: "base" | "bonus" | "penalty";
}

export interface RootEvidence {
  branch: string;
  stem: string;
  role: "main" | "middle" | "residual";
  strength: number;
  damaged: boolean;
}

export type RootChannelState = "complete" | "latent" | "hidden" | "floating" | "external" | "sealed" | "dormant";

export interface RootChannelGate {
  score: number;
  passed: boolean;
  reasons: string[];
}

export interface RootChannelEvidence {
  heaven: RootChannelGate;
  earth: RootChannelGate;
  human: RootChannelGate;
  integrity: number;
  completion: number;
  state: RootChannelState;
  complete: boolean;
  potential: boolean;
  reasons: string[];
}

export interface ElementEvidence {
  element: Element;
  /** 계절·생극 전, 4천간+4지지를 240질량으로 환산한 설명용 구성값 */
  presenceScore: number;
  presenceRatio: number;
  baseScore: number;
  /** 월령·통근·생조·극제·합충을 적용한 기맥 활성도 */
  score: number;
  visibleStems: string[];
  roots: string[];
  rootStrength: number;
  rootDetails: RootEvidence[];
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
  structuralEligible: boolean;
  eligibilityReasons: string[];
  potentialReasons: string[];
  selectedRoot: boolean;
  channel: RootChannelEvidence;
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
  qualityTier: RootQualityTier;
  qualityRank: number;
  qualityLabel: string;
  rarityLabel: string;
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
  awakening: AwakeningResult;
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

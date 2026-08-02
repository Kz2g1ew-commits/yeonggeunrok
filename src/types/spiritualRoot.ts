import type { BranchRelations, Element, FourPillars, RootJudgmentMode, ShenshaResult } from "./bazi";

export type RootCount = "none" | "single" | "dual" | "triple" | "quadruple" | "five";
export type RootGrade = "low" | "middle" | "high" | "supreme";
export type RootQualityTier = "none" | "heavenly" | "mutation" | "dual" | "triple" | "quadruple" | "five";
export type DaoPath = "natural" | "defiant";
export type RootConflictLevel = "stable" | "mixed" | "turbulent";
export type RootCycleState = "broken" | "partial" | "strong" | "complete";
export type FiveRootVariant = "유통" | "편기" | "탁류" | "원융";
export type TalentDimensionId = "rootBone" | "insight" | "combat" | "soul" | "providence";
export type TalentTier = "unawakened" | "ordinary" | "promising" | "tianjiao" | "peerless" | "heavenly-favored";
export type PreHeavenNodeId = "taiYuan" | "taiXi" | "mingGong";
export type PreHeavenQiState = "dormant" | "responsive" | "condensed";

export interface PreHeavenNode {
  id: PreHeavenNodeId;
  name: string;
  ganZhi: string;
  naYin: string;
  element: Element;
}

export interface PreHeavenLink {
  from: PreHeavenNodeId;
  to: PreHeavenNodeId;
  label: string;
  kinds: Array<"same-qi" | "generation" | "stem-combination" | "branch-combination" | "same-stem" | "same-branch" | "clash" | "harm" | "break">;
}

export interface PreHeavenQiResult {
  state: PreHeavenQiState;
  stateLabel: string;
  nodes: Record<PreHeavenNodeId, PreHeavenNode>;
  flowFromTaiYuan: boolean;
  flowIntoMingGong: boolean;
  adjacentClash: boolean;
  balancedFlow: boolean;
  connectedResonance: boolean;
  trueBondCount: number;
  disruptionCount: number;
  strictCondensation: boolean;
  links: PreHeavenLink[];
  reasons: string[];
  blockers: string[];
}

export interface AwakeningCondition {
  id: string;
  label: string;
  met: boolean;
}

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
  populationRate: number;
  label: string;
  explanation: string;
  completeChannels: Element[];
  potentialChannels: Element[];
  conditions: AwakeningCondition[];
  preHeaven: PreHeavenQiResult;
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
  clashState: "stable" | "activated" | "shaken" | "damaged" | "uprooted";
  damaged: boolean;
}

export type RootChannelState = "complete" | "latent" | "hidden" | "floating" | "external" | "sealed" | "dormant";
export type RootActivationOrigin = "independent" | "network-assisted" | "none";

export interface ClimateProfile {
  /** 양수는 온열, 음수는 한랭 */
  temperature: number;
  /** 양수는 습윤, 음수는 건조 */
  moisture: number;
  temperatureLabel: "한랭" | "냉량" | "중화" | "온난" | "조열";
  moistureLabel: "조고" | "편조" | "중화" | "윤습" | "한습";
  reasons: string[];
}

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
  activationOrigin: RootActivationOrigin;
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

export interface MultiRootProfile {
  subtype: string;
  fiveRootVariant?: FiveRootVariant;
  dominantElement: Element;
  weakestElement: Element;
  preserveAllRoots: boolean;
  refinementPath: string;
  scoreSpread: number;
  generatingLinks: string[];
  cycleState: RootCycleState;
  cycleLabel: string;
  conflictCount: number;
  conflictLevel: RootConflictLevel;
  conflictLabel: string;
  formationSupport: boolean;
  summary: string;
  strengths: string[];
  cautions: string[];
}

export interface RootClassification {
  rootCount: RootCount;
  displayName: string;
  relationship?: string;
  grade?: RootGrade;
  originalElements: Element[];
  workingElements: string[];
  missingElement?: Element;
  multiRootProfile?: MultiRootProfile;
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

export interface TalentDimension {
  id: TalentDimensionId;
  name: string;
  score: number;
  label: string;
  description: string;
  reasons: string[];
}

export interface TalentSpecialEffect {
  id: string;
  name: string;
  rarity: "uncommon" | "rare" | "very-rare" | "mythic";
  description: string;
  evidence: string[];
  effects: string[];
}

export interface CultivationTalentProfile {
  tier: TalentTier;
  title: string;
  summary: string;
  dimensions: Record<TalentDimensionId, TalentDimension>;
  specialEffects: TalentSpecialEffect[];
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
  climate: ClimateProfile;
  elementEvidence: Record<Element, ElementEvidence>;
  strengths: string[];
  weaknesses: string[];
  recommendedPaths: string[];
  recommendedWeapons: string[];
  recommendedTechniques: string[];
  risks: string[];
  growthDirection: string;
  explanations: string[];
  classification: RootClassification;
  awakening: AwakeningResult;
  talentProfile: CultivationTalentProfile;
}

export interface AnalysisContext {
  pillars: FourPillars;
  evidence: Record<Element, ElementEvidence>;
  relations: BranchRelations;
  shensha: ShenshaResult[];
  season: "spring" | "summer" | "earth" | "autumn" | "winter";
  climate: ClimateProfile;
}

export interface AnalysisBundle {
  result: SpiritualRootResult;
  relations: BranchRelations;
  shensha: ShenshaResult[];
}

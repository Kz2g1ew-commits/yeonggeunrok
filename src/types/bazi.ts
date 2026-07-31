export type Element = "wood" | "fire" | "earth" | "metal" | "water";
export type YinYang = "yang" | "yin";
export type CalendarType = "solar" | "lunar";
export type TimeAccuracy = "exact" | "approximate" | "unknown";
export type RootJudgmentMode = "generous" | "balanced" | "strict";
export type ShenshaId =
  | "huagai" | "guimen" | "yima"
  | "tianyi" | "tiande" | "yuede" | "wenchang" | "taiji"
  | "yangren" | "kuigang" | "jiangxing" | "taohua" | "jiesha";
export type ShenshaCategory = "mystic" | "mobility" | "noble" | "scholar" | "martial" | "charisma";
export type ShenshaPolarity = "auspicious" | "mixed" | "challenging";

export interface ShenshaOptions {
  enabled: boolean;
  huagai: boolean;
  guimen: boolean;
  yima: boolean;
  noble?: boolean;
  scholar?: boolean;
  martial?: boolean;
  charisma?: boolean;
}

export interface HiddenStem {
  stem: string;
  element: Element;
  role: "main" | "middle" | "residual";
  weight: number;
}

export interface Pillar {
  stem: string;
  branch: string;
  stemElement: Element;
  branchElement: Element;
  stemYinYang: YinYang;
  branchYinYang: YinYang;
}

export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

export interface BirthInput {
  judgmentMode: RootJudgmentMode;
  calendarType: CalendarType;
  isLeapMonth: boolean;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  timezone: string;
  country: string;
  city: string;
  longitude?: number;
  longitudeIsApproximate: boolean;
  gender?: "male" | "female" | "unspecified";
  applyLateZi: boolean;
  applyTrueSolarTime: boolean;
  timeAccuracy: TimeAccuracy;
  shensha: ShenshaOptions;
}

export interface TimeCorrection {
  originalLocalISO: string;
  normalizedISO: string;
  correctedLocalISO: string;
  calculationTimeISO: string;
  longitudeCorrectionMinutes: number;
  equationOfTimeMinutes: number;
  totalCorrectionMinutes: number;
  standardMeridian: number;
  approximate: boolean;
}

export interface BoundaryInfo {
  nearBoundary: boolean;
  nearSolarTerm: boolean;
  nearTimeBranch: boolean;
  minutesToSolarTerm?: number;
  solarTermName?: string;
  minutesToTimeBranch: number;
}

export interface FourPillarsCalculation {
  pillars: FourPillars;
  solarDate: { year: number; month: number; day: number };
  lunarDate: { year: number; month: number; day: number; isLeap: boolean };
  correction: TimeCorrection;
  boundary: BoundaryInfo;
  solarTermBasis: string;
  calculationNotes: string[];
}

export interface BranchRelations {
  combinations: string[];
  halfCombinations: string[];
  archingCombinations: string[];
  directionalCombinations: string[];
  sixCombinations: string[];
  clashes: string[];
  punishments: string[];
  harms: string[];
  breaks: string[];
  stemCombinations: string[];
  dynamicCount: number;
}

export interface ShenshaResult {
  id: ShenshaId;
  name: string;
  category: ShenshaCategory;
  polarity: ShenshaPolarity;
  present: boolean;
  evidence: string[];
  traits: string[];
  paths: string[];
  weapons: string[];
  techniques: string[];
  risks: string[];
}

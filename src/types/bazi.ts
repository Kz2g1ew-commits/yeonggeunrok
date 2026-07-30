export type Element = "wood" | "fire" | "earth" | "metal" | "water";
export type YinYang = "yang" | "yin";
export type CalendarType = "solar" | "lunar";
export type TimeAccuracy = "exact" | "approximate" | "unknown";
export type RootJudgmentMode = "generous" | "strict";

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
  shensha: {
    enabled: boolean;
    huagai: boolean;
    guimen: boolean;
    yima: boolean;
  };
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
  directionalCombinations: string[];
  clashes: string[];
  punishments: string[];
  harms: string[];
  breaks: string[];
  stemCombinations: string[];
  dynamicCount: number;
}

export interface ShenshaResult {
  id: "huagai" | "guimen" | "yima";
  name: string;
  present: boolean;
  evidence: string[];
  traits: string[];
}

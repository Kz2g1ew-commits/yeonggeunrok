import type { BirthInput, FourPillarsCalculation } from "@/types/bazi";
import type { AnalysisBundle } from "@/types/spiritualRoot";

export interface StoredAnalysis {
  input: BirthInput;
  calculation: FourPillarsCalculation;
  analysis: AnalysisBundle;
}

let currentAnalysis: StoredAnalysis | null = null;

export function setCurrentAnalysis(value: StoredAnalysis): void {
  currentAnalysis = value;
}

export function getCurrentAnalysis(): StoredAnalysis | null {
  return currentAnalysis;
}

export function clearCurrentAnalysis(): void {
  currentAnalysis = null;
}

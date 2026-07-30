import type { Element, YinYang } from "@/types/bazi";

export interface BranchData {
  korean: string;
  hanja: string;
  element: Element;
  yinYang: YinYang;
}

export const BRANCHES: Record<string, BranchData> = {
  子: { korean: "자", hanja: "子", element: "water", yinYang: "yang" },
  丑: { korean: "축", hanja: "丑", element: "earth", yinYang: "yin" },
  寅: { korean: "인", hanja: "寅", element: "wood", yinYang: "yang" },
  卯: { korean: "묘", hanja: "卯", element: "wood", yinYang: "yin" },
  辰: { korean: "진", hanja: "辰", element: "earth", yinYang: "yang" },
  巳: { korean: "사", hanja: "巳", element: "fire", yinYang: "yin" },
  午: { korean: "오", hanja: "午", element: "fire", yinYang: "yang" },
  未: { korean: "미", hanja: "未", element: "earth", yinYang: "yin" },
  申: { korean: "신", hanja: "申", element: "metal", yinYang: "yang" },
  酉: { korean: "유", hanja: "酉", element: "metal", yinYang: "yin" },
  戌: { korean: "술", hanja: "戌", element: "earth", yinYang: "yang" },
  亥: { korean: "해", hanja: "亥", element: "water", yinYang: "yin" },
};

export const BRANCH_ORDER = Object.keys(BRANCHES);

export function branchKorean(branch: string): string {
  return BRANCHES[branch]?.korean ?? branch;
}

import type { Element, YinYang } from "@/types/bazi";

export interface StemData {
  korean: string;
  hanja: string;
  element: Element;
  yinYang: YinYang;
}

export const STEMS: Record<string, StemData> = {
  甲: { korean: "갑", hanja: "甲", element: "wood", yinYang: "yang" },
  乙: { korean: "을", hanja: "乙", element: "wood", yinYang: "yin" },
  丙: { korean: "병", hanja: "丙", element: "fire", yinYang: "yang" },
  丁: { korean: "정", hanja: "丁", element: "fire", yinYang: "yin" },
  戊: { korean: "무", hanja: "戊", element: "earth", yinYang: "yang" },
  己: { korean: "기", hanja: "己", element: "earth", yinYang: "yin" },
  庚: { korean: "경", hanja: "庚", element: "metal", yinYang: "yang" },
  辛: { korean: "신", hanja: "辛", element: "metal", yinYang: "yin" },
  壬: { korean: "임", hanja: "壬", element: "water", yinYang: "yang" },
  癸: { korean: "계", hanja: "癸", element: "water", yinYang: "yin" },
};

export const STEM_ORDER = Object.keys(STEMS);

export function stemKorean(stem: string): string {
  return STEMS[stem]?.korean ?? stem;
}

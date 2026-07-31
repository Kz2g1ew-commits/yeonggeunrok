import type { ShenshaCategory, ShenshaId, ShenshaPolarity } from "@/types/bazi";

export interface ShenshaDescriptor {
  id: ShenshaId;
  name: string;
  category: ShenshaCategory;
  polarity: ShenshaPolarity;
  traits: string[];
  paths: string[];
  weapons: string[];
  techniques: string[];
  risks: string[];
}

export const TRIAD_SHENSHA_RULES = [
  { group: ["寅", "午", "戌"], huagai: "戌", yima: "申", jiangxing: "午", taohua: "卯", jiesha: "亥" },
  { group: ["申", "子", "辰"], huagai: "辰", yima: "寅", jiangxing: "子", taohua: "酉", jiesha: "巳" },
  { group: ["亥", "卯", "未"], huagai: "未", yima: "巳", jiangxing: "卯", taohua: "子", jiesha: "申" },
  { group: ["巳", "酉", "丑"], huagai: "丑", yima: "亥", jiangxing: "酉", taohua: "午", jiesha: "寅" },
] as const;

export const GUIMEN_PAIRS = [["子", "酉"], ["丑", "午"], ["寅", "未"], ["卯", "申"], ["辰", "亥"], ["巳", "戌"]] as const;

export const TIANYI_BRANCHES: Record<string, readonly string[]> = {
  甲: ["丑", "未"], 戊: ["丑", "未"], 庚: ["丑", "未"],
  乙: ["子", "申"], 己: ["子", "申"],
  丙: ["亥", "酉"], 丁: ["亥", "酉"],
  壬: ["卯", "巳"], 癸: ["卯", "巳"],
  辛: ["寅", "午"],
};

export const WENCHANG_BRANCHES: Record<string, string> = {
  甲: "巳", 乙: "午", 丙: "申", 戊: "申", 丁: "酉", 己: "酉", 庚: "亥", 辛: "子", 壬: "寅", 癸: "卯",
};

export const TAIJI_BRANCHES: Record<string, readonly string[]> = {
  甲: ["子", "午"], 乙: ["子", "午"], 丙: ["卯", "酉"], 丁: ["卯", "酉"],
  戊: ["辰", "戌", "丑", "未"], 己: ["辰", "戌", "丑", "未"],
  庚: ["寅", "亥"], 辛: ["寅", "亥"], 壬: ["巳", "申"], 癸: ["巳", "申"],
};

export const YANGREN_BRANCHES: Record<string, string> = {
  甲: "卯", 乙: "寅", 丙: "午", 丁: "巳", 戊: "午", 己: "巳", 庚: "酉", 辛: "申", 壬: "子", 癸: "亥",
};

export const TIANDE_RULES: Record<string, { kind: "stem" | "branch"; value: string }> = {
  寅: { kind: "stem", value: "丁" }, 卯: { kind: "branch", value: "申" },
  辰: { kind: "stem", value: "壬" }, 巳: { kind: "stem", value: "辛" },
  午: { kind: "branch", value: "亥" }, 未: { kind: "stem", value: "甲" },
  申: { kind: "stem", value: "癸" }, 酉: { kind: "branch", value: "寅" },
  戌: { kind: "stem", value: "丙" }, 亥: { kind: "stem", value: "乙" },
  子: { kind: "branch", value: "巳" }, 丑: { kind: "stem", value: "庚" },
};

export const YUEDE_STEMS: Record<string, string> = {
  寅: "丙", 午: "丙", 戌: "丙", 申: "壬", 子: "壬", 辰: "壬",
  亥: "甲", 卯: "甲", 未: "甲", 巳: "庚", 酉: "庚", 丑: "庚",
};

export const KUIGANG_DAY_PILLARS = new Set(["庚辰", "庚戌", "壬辰", "戊戌"]);

export const SHENSHA_DESCRIPTORS: Record<ShenshaId, ShenshaDescriptor> = {
  huagai: {
    id: "huagai", name: "화개살 華蓋", category: "mystic", polarity: "mixed",
    traits: ["명상", "진법", "부적", "연단", "정신계 저항", "은둔 수행"],
    paths: ["진도·부도 겸수", "연단·참선"], weapons: ["진반", "법필"], techniques: ["포진술", "정심결"], risks: ["고립 수행과 집착"],
  },
  guimen: {
    id: "guimen", name: "귀문관살 鬼門關", category: "mystic", polarity: "mixed",
    traits: ["영혼 감응", "환술", "음기 감지", "꿈·정신계 술법", "주화입마 위험"],
    paths: ["신혼·환도 수련", "귀도 감응술"], weapons: ["혼령등", "섭혼령"], techniques: ["몽환술", "음기감응"], risks: ["환청·심마와 신혼 오염"],
  },
  yima: {
    id: "yima", name: "역마살 驛馬", category: "mobility", polarity: "mixed",
    traits: ["신법", "비행술", "공간 이동", "풍·뇌 변이 가산"],
    paths: ["유행신법", "공간·비행술"], weapons: ["비행검", "천행삭"], techniques: ["축지술", "뇌광둔"], risks: ["기맥의 과속과 정착 불능"],
  },
  tianyi: {
    id: "tianyi", name: "천을귀인 天乙貴人", category: "noble", polarity: "auspicious",
    traits: ["호도 기연", "사문 인연", "위기 구원", "인과 완충"],
    paths: ["호도·공덕법", "인과선법"], weapons: ["호심경", "공덕금련"], techniques: ["호체신광", "인과전이"], risks: [],
  },
  tiande: {
    id: "tiande", name: "천덕귀인 天德貴人", category: "noble", polarity: "auspicious",
    traits: ["천덕호체", "흉기 완충", "심성 안정", "정도 친화"],
    paths: ["천덕정법", "호생공덕도"], weapons: ["덕광보륜"], techniques: ["천덕호광", "청심주"], risks: [],
  },
  yuede: {
    id: "yuede", name: "월덕귀인 月德貴人", category: "noble", polarity: "auspicious",
    traits: ["월령 조화", "인덕", "회복력", "살기 순화"],
    paths: ["월화양생공", "유화심법"], weapons: ["월륜", "옥여의"], techniques: ["월덕회춘", "유광결계"], risks: [],
  },
  wenchang: {
    id: "wenchang", name: "문창귀인 文昌貴人", category: "scholar", polarity: "auspicious",
    traits: ["오성", "공법 해석", "술식 추연", "문자·부도 친화"],
    paths: ["공법 추연", "부문·검결 해석"], weapons: ["법필", "전승옥간"], techniques: ["일념해법", "술식개량"], risks: ["이론 편중"],
  },
  taiji: {
    id: "taiji", name: "태극귀인 太極貴人", category: "scholar", polarity: "auspicious",
    traits: ["도법 감응", "음양 이해", "현학 탐구", "참오력"],
    paths: ["음양태극도", "본원참오"], weapons: ["음양경", "태극도인"], techniques: ["음양전환", "귀원인"], risks: ["현리 탐구에 대한 집착"],
  },
  yangren: {
    id: "yangren", name: "양인살 羊刃", category: "martial", polarity: "challenging",
    traits: ["폭발력", "근접전", "결단", "혈기", "강체 수련"],
    paths: ["패체·혈련공", "근접 파군도"], weapons: ["패도", "중극"], techniques: ["폭혈술", "단맥일격"], risks: ["혈기 폭주와 무리한 돌파"],
  },
  kuigang: {
    id: "kuigang", name: "괴강 魁罡", category: "martial", polarity: "mixed",
    traits: ["강골", "위압", "통솔", "정면 돌파", "강기"],
    paths: ["천강패도", "강기호체"], weapons: ["방천극", "중검"], techniques: ["괴강진신", "파군강"], risks: ["독단과 강경한 심성"],
  },
  jiangxing: {
    id: "jiangxing", name: "장성살 將星", category: "martial", polarity: "mixed",
    traits: ["통솔", "진형 운용", "승부욕", "전장 판단"],
    paths: ["전진도·병진술", "통솔형 검진"], weapons: ["전기", "장창"], techniques: ["군세응집", "검진통솔"], risks: ["지배욕과 과도한 승부심"],
  },
  taohua: {
    id: "taohua", name: "도화살 桃花", category: "charisma", polarity: "mixed",
    traits: ["매혹", "예술 감각", "교섭", "환술 전달력"],
    paths: ["음공·환매도", "교섭·심인술"], weapons: ["옥적", "접선"], techniques: ["미혹음", "화영환신"], risks: ["감정 인과와 매혹술의 역류"],
  },
  jiesha: {
    id: "jiesha", name: "겁살 劫煞", category: "martial", polarity: "challenging",
    traits: ["기습", "쟁탈", "살기 감응", "위기 반응"],
    paths: ["은살도", "기습·탈취술"], weapons: ["쌍비수", "쇄혼조"], techniques: ["잠영보", "탈기수"], risks: ["살기 침식과 인과 원한"],
  },
};

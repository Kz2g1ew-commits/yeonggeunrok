import type { Element } from "@/types/bazi";

export interface MutationRule {
  id: string;
  name: string;
  sourceElements: Element[];
  requiredRelations: string[];
  relationMode?: "support" | "inherent" | "wood-metal-clash";
  preferredSeasons?: string[];
  requiredBranches?: string[];
  optionalMarkers?: string[];
  blockers?: string[];
  minimumScore?: number;
  maximumScoreGap?: number;
  priority: number;
  description: string;
}

export const MUTATION_RULES: MutationRule[] = [
  {
    id: "ice", name: "빙", sourceElements: ["metal", "water"], requiredRelations: ["금생수"],
    relationMode: "inherent",
    preferredSeasons: ["winter"], requiredBranches: ["亥", "子", "丑"],
    blockers: ["강한 화국", "조열한 구조", "제3 유효 영근"], minimumScore: 4, maximumScoreGap: 4,
    priority: 100, description: "응축된 금기가 수기를 차갑고 예리한 빙기로 변화시킵니다.",
  },
  {
    id: "lightning", name: "뇌", sourceElements: ["wood", "fire"], requiredRelations: ["목생화", "동적 충형"],
    relationMode: "inherent",
    optionalMarkers: ["역마", "잠재 수"], blockers: ["과다한 토", "과다한 수", "제3 유효 영근"],
    minimumScore: 4, maximumScoreGap: 3.5, priority: 95, description: "목의 상승성과 화의 폭발성이 동적인 기맥에서 뇌기로 융합됩니다.",
  },
  {
    id: "wind-moist", name: "풍", sourceElements: ["water", "wood"], requiredRelations: ["수생목", "이동성"],
    relationMode: "inherent",
    requiredBranches: ["寅", "卯"], optionalMarkers: ["역마"], blockers: ["토의 심한 정체", "제3 유효 영근"],
    minimumScore: 4, maximumScoreGap: 4, priority: 80, description: "수목의 습윤한 흐름이 유연하고 침투력 있는 풍기로 이어집니다.",
  },
  {
    id: "wind-hot", name: "풍", sourceElements: ["wood", "fire"], requiredRelations: ["목생화", "이동성"],
    relationMode: "inherent",
    requiredBranches: ["寅", "卯"], optionalMarkers: ["역마"], blockers: ["토의 심한 정체", "제3 유효 영근"],
    minimumScore: 4, maximumScoreGap: 4, priority: 79, description: "목화의 상승과 방출이 빠르고 거센 열풍으로 이어집니다.",
  },
  {
    id: "poison-liquid", name: "독", sourceElements: ["water", "wood"], requiredRelations: ["음습", "형해"],
    blockers: ["과다한 화", "제3 유효 영근"], minimumScore: 4, maximumScoreGap: 4,
    priority: 72, description: "수목의 음습한 생장이 액독·침투독의 기맥으로 발현합니다.",
  },
  {
    id: "poison-decay", name: "독", sourceElements: ["wood", "earth"], requiredRelations: ["음습", "형해"],
    blockers: ["과다한 화", "제3 유효 영근"], minimumScore: 4, maximumScoreGap: 4,
    priority: 71, description: "목토의 생장과 정체가 부패독·균독의 기맥으로 발현합니다.",
  },
  {
    id: "lava", name: "용암", sourceElements: ["fire", "earth"], requiredRelations: ["화생토"],
    relationMode: "inherent",
    preferredSeasons: ["summer", "earth"], requiredBranches: ["巳", "午", "未"],
    blockers: ["강한 수", "제3 유효 영근"], minimumScore: 4, maximumScoreGap: 4,
    priority: 90, description: "화기의 열과 토기의 질량이 융합되어 용암의 흐름을 이룹니다.",
  },
  {
    id: "shadow", name: "암", sourceElements: ["water", "earth"], requiredRelations: ["한습", "침잠"],
    preferredSeasons: ["winter", "earth"], optionalMarkers: ["귀문"],
    blockers: ["강한 화", "제3 유효 영근"], minimumScore: 4, maximumScoreGap: 4,
    priority: 78, description: "수토의 침잠성과 은폐성이 결합되어 그림자·영혼 계열로 흐릅니다.",
  },
  {
    id: "light", name: "광", sourceElements: ["fire", "metal"], requiredRelations: ["방출·응축 균형"],
    relationMode: "inherent",
    optionalMarkers: ["잠재 토"], blockers: ["강한 수", "과도한 충돌", "제3 유효 영근"],
    minimumScore: 4, maximumScoreGap: 2.5, priority: 84, description: "화의 방출성과 금의 응축성이 균형을 이루어 광휘를 발합니다.",
  },
  {
    id: "purple-lightning", name: "자뢰", sourceElements: ["fire", "metal"], requiredRelations: ["화금 상극", "충"],
    relationMode: "inherent",
    optionalMarkers: ["잠재 토"], blockers: ["완충 없는 기맥", "제3 유효 영근"],
    minimumScore: 4, maximumScoreGap: 3.5, priority: 86, description: "화금 상극이 토의 완충 아래 폭발적으로 순환하며 자뢰를 이룹니다.",
  },
  {
    id: "sword", name: "검", sourceElements: ["wood", "metal"], requiredRelations: ["금목 상극의 절단 충"],
    relationMode: "wood-metal-clash", optionalMarkers: ["양인", "괴강", "장성"],
    blockers: ["재생할 목근 부족", "날을 세울 금근 부족", "강한 화기", "제3 유효 영근"],
    minimumScore: 4, maximumScoreGap: 3.5, priority: 89,
    description: "금의 절단성이 목의 생장·재생력과 맞물려, 끊임없이 벼리고 되살아나는 검기 기맥을 이룹니다.",
  },
];

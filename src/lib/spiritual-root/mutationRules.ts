import type { Element } from "@/types/bazi";
import type { ClimateProfile } from "@/types/spiritualRoot";

export interface MutationRule {
  id: string;
  name: string;
  sourceElements: Element[];
  requiredRelations: string[];
  relationMode?:
    | "generating-flow"
    | "balanced-polarity"
    | "dynamic-control"
    | "submerged-interface"
    | "wood-metal-clash"
    | "rooted-generation"
    | "thermal-convergence";
  relationFailureConfidenceCap?: number;
  selectionGroup?: "wood-fire-motion" | "fire-metal-polarity" | "water-wood-expression";
  selectionStrategy?: "priority" | "confidence";
  conditions?: MutationCondition[];
  bonuses?: MutationBonus[];
  preferredSeasons?: string[];
  requiredBranches?: string[];
  optionalMarkers?: string[];
  blockers?: string[];
  minimumScore?: number;
  maximumScoreGap?: number;
  priority: number;
  description: string;
}

interface MutationConditionBase {
  points: number;
  confidenceCap: number;
  satisfiedLabel: string;
  missingLabel: string;
  blockerLabel: string;
}

export type MutationCondition =
  | (MutationConditionBase & {
    kind: "root-pattern";
    element: Element;
    branches?: string[];
    roles?: Array<"main" | "middle" | "residual">;
    minimumStrength: number;
  })
  | (MutationConditionBase & {
    kind: "climate-window";
    temperature: [number, number];
    moisture: [number, number];
  })
  | (MutationConditionBase & {
    kind: "climate-labels";
    temperatureLabels: ClimateProfile["temperatureLabel"][];
    moistureLabels: ClimateProfile["moistureLabel"][];
  })
  | (MutationConditionBase & {
    kind: "maximum-dynamic";
    maximum: number;
  })
  | (MutationConditionBase & {
    kind: "blocked-branch-pair";
    pairs: Array<[string, string]>;
  })
  | (MutationConditionBase & {
    kind: "maximum-element-score";
    element: Element;
    maximum: number;
  })
  | (MutationConditionBase & {
    kind: "maximum-score-lead";
    leadingElement: Element;
    trailingElement: Element;
    maximumGap: number;
  });

export interface MutationBonus {
  kind: "branch-pair";
  pairs: Array<[string, string]>;
  points: number;
  label: string;
}

export const MUTATION_RULES: MutationRule[] = [
  {
    id: "ice", name: "빙", sourceElements: ["metal", "water"], requiredRelations: ["금생수"],
    relationMode: "generating-flow",
    preferredSeasons: ["winter"], requiredBranches: ["亥", "子", "丑"],
    blockers: ["강한 화국", "조열한 구조", "제3 유효 영근"], minimumScore: 4, maximumScoreGap: 4,
    priority: 100, description: "응축된 금기가 수기를 차갑고 예리한 빙기로 변화시킵니다.",
  },
  {
    id: "lightning", name: "뇌", sourceElements: ["wood", "fire"], requiredRelations: ["목생화", "동적 충형"],
    relationMode: "generating-flow", selectionGroup: "wood-fire-motion",
    optionalMarkers: ["역마", "잠재 수"], blockers: ["과다한 토", "과다한 수", "제3 유효 영근"],
    minimumScore: 4, maximumScoreGap: 3.5, priority: 95, description: "목의 상승성과 화의 폭발성이 동적인 기맥에서 뇌기로 융합됩니다.",
  },
  {
    id: "wind-moist", name: "풍", sourceElements: ["water", "wood"], requiredRelations: ["수생목", "이동성"],
    relationMode: "generating-flow", selectionGroup: "water-wood-expression", selectionStrategy: "confidence",
    requiredBranches: ["寅", "卯"], optionalMarkers: ["역마"], blockers: ["토의 심한 정체", "제3 유효 영근"],
    minimumScore: 4, maximumScoreGap: 4, priority: 80, description: "수목의 습윤한 흐름이 유연하고 침투력 있는 풍기로 이어집니다.",
  },
  {
    id: "wind-hot", name: "풍", sourceElements: ["wood", "fire"], requiredRelations: ["목생화", "이동성"],
    relationMode: "generating-flow", selectionGroup: "wood-fire-motion",
    requiredBranches: ["寅", "卯"], optionalMarkers: ["역마"], blockers: ["토의 심한 정체", "제3 유효 영근"],
    minimumScore: 4, maximumScoreGap: 4, priority: 79, description: "목화의 상승과 방출이 빠르고 거센 열풍으로 이어집니다.",
  },
  {
    id: "poison-liquid", name: "독", sourceElements: ["water", "wood"], requiredRelations: ["음습", "형해"],
    relationMode: "generating-flow", selectionGroup: "water-wood-expression", selectionStrategy: "confidence",
    blockers: ["과다한 화", "제3 유효 영근"], minimumScore: 4, maximumScoreGap: 4,
    priority: 72, description: "수목의 음습한 생장이 액독·침투독의 기맥으로 발현합니다.",
  },
  {
    id: "poison-decay", name: "독", sourceElements: ["wood", "earth"], requiredRelations: ["음습", "형해"],
    relationMode: "dynamic-control",
    blockers: ["과다한 화", "제3 유효 영근"], minimumScore: 4, maximumScoreGap: 4,
    priority: 71, description: "목토의 생장과 정체가 부패독·균독의 기맥으로 발현합니다.",
  },
  {
    id: "lava", name: "용암", sourceElements: ["fire", "earth"], requiredRelations: ["화생토"],
    relationMode: "generating-flow",
    preferredSeasons: ["summer", "earth"], requiredBranches: ["巳", "午", "未"],
    blockers: ["강한 수", "제3 유효 영근"], minimumScore: 4, maximumScoreGap: 4,
    priority: 90, description: "화기의 열과 토기의 질량이 융합되어 용암의 흐름을 이룹니다.",
  },
  {
    id: "shadow", name: "암", sourceElements: ["water", "earth"], requiredRelations: ["한습", "침잠"],
    relationMode: "submerged-interface",
    preferredSeasons: ["winter", "earth"], optionalMarkers: ["귀문"],
    blockers: ["강한 화", "제3 유효 영근"], minimumScore: 4, maximumScoreGap: 4,
    priority: 78, description: "수토의 침잠성과 은폐성이 결합되어 그림자·영혼 계열로 흐릅니다.",
  },
  {
    id: "light", name: "광", sourceElements: ["fire", "metal"], requiredRelations: ["방출·응축 균형"],
    relationMode: "balanced-polarity", selectionGroup: "fire-metal-polarity",
    optionalMarkers: ["잠재 토"], blockers: ["직접 충", "강한 수", "과도한 동세", "제3 유효 영근"],
    minimumScore: 4, maximumScoreGap: 4, priority: 84, description: "화의 방출성과 금의 응축성이 균형을 이루어 광휘를 발합니다.",
  },
  {
    id: "purple-lightning", name: "자뢰", sourceElements: ["fire", "metal"], requiredRelations: ["화금 상극", "충"],
    relationMode: "dynamic-control", selectionGroup: "fire-metal-polarity",
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
  {
    id: "crystal", name: "정(晶)", sourceElements: ["earth", "metal"], requiredRelations: ["토생금의 응결"],
    relationMode: "rooted-generation", relationFailureConfidenceCap: 64,
    conditions: [
      {
        kind: "root-pattern", element: "earth", branches: ["辰", "戌", "丑", "未"], roles: ["main"],
        minimumStrength: 0.6, points: 7, confidenceCap: 49,
        satisfiedLabel: "토기가 진·술·축·미의 저장근에 단단히 뿌리내림",
        missingLabel: "결정을 기를 토의 저장근이 부족함",
        blockerLabel: "토의 저장근이 없어 결정핵을 만들기 어려움",
      },
      {
        kind: "root-pattern", element: "metal", branches: ["申", "酉"], roles: ["main"],
        minimumStrength: 0.6, points: 7, confidenceCap: 49,
        satisfiedLabel: "금기가 신·유의 본근을 얻어 결정격자를 세움",
        missingLabel: "결정격자를 세울 금의 본근이 부족함",
        blockerLabel: "금의 본근이 없어 토생금이 독립된 결정으로 응축되지 못함",
      },
      {
        kind: "climate-window", temperature: [-1.25, 1.25], moisture: [-1, 1],
        points: 7, confidenceCap: 64,
        satisfiedLabel: "극단을 벗어난 조후가 결정의 안정된 응축을 도움",
        missingLabel: "한열·조습이 극단으로 치우침",
        blockerLabel: "극단 조후가 결정의 성장과 안정성을 깨뜨림",
      },
      {
        kind: "maximum-dynamic", maximum: 1, points: 7, confidenceCap: 64,
        satisfiedLabel: "합충의 동세가 낮아 결정격자가 안정됨",
        missingLabel: "충·형의 동세가 결정격자를 흔듦",
        blockerLabel: "강한 동세가 응축 중인 결정격자를 파쇄함",
      },
      {
        kind: "maximum-score-lead", leadingElement: "earth", trailingElement: "metal", maximumGap: 3.5,
        points: 4, confidenceCap: 64,
        satisfiedLabel: "토가 금을 생하되 묻어 버릴 만큼 과다하지 않음",
        missingLabel: "토의 편중이 금의 발현을 덮음",
        blockerLabel: "토다금매로 금기가 토중에 매몰됨",
      },
      {
        kind: "maximum-element-score", element: "fire", maximum: 9,
        points: 3, confidenceCap: 64,
        satisfiedLabel: "화기가 금의 결정성을 녹일 만큼 강하지 않음",
        missingLabel: "강한 화기가 결정의 응축을 방해함",
        blockerLabel: "강한 화기가 금의 결정격자를 녹임",
      },
      {
        kind: "maximum-element-score", element: "wood", maximum: 9,
        points: 3, confidenceCap: 64,
        satisfiedLabel: "목기가 토의 결정핵을 깨뜨릴 만큼 강하지 않음",
        missingLabel: "강한 목기가 토의 결정핵을 침식함",
        blockerLabel: "강한 목기가 토근을 극하여 결정핵을 깨뜨림",
      },
    ],
    bonuses: [
      {
        kind: "branch-pair", pairs: [["辰", "酉"], ["丑", "酉"]], points: 5,
        label: "진·유 합 또는 축·유 반합이 금기의 결정화를 보조함",
      },
    ],
    blockers: ["토다금매", "강한 화기", "강한 목기", "극단 조후", "제3 유효 영근"],
    minimumScore: 4, maximumScoreGap: 3.5, priority: 88,
    description: "토석의 저장력이 금기를 결정격자로 응축하여 수정·옥석·금강의 안정된 기맥을 이룹니다.",
  },
  {
    id: "cloud", name: "운(雲)", sourceElements: ["fire", "water"], requiredRelations: ["수화기제의 기화·응결"],
    relationMode: "thermal-convergence", relationFailureConfidenceCap: 64,
    conditions: [
      {
        kind: "root-pattern", element: "fire", minimumStrength: 0.6, points: 8, confidenceCap: 49,
        satisfiedLabel: "화기가 실제 통근하여 수기를 기화할 열원을 갖춤",
        missingLabel: "기화의 열원이 될 화근이 부족함",
        blockerLabel: "화기가 무근하여 수기를 운기로 들어 올리지 못함",
      },
      {
        kind: "root-pattern", element: "water", minimumStrength: 0.6, points: 8, confidenceCap: 49,
        satisfiedLabel: "수기가 실제 통근하여 응결할 수원을 갖춤",
        missingLabel: "응결의 수원이 될 수근이 부족함",
        blockerLabel: "수기가 무근하여 지속적인 운무를 이루지 못함",
      },
      {
        kind: "climate-labels", temperatureLabels: ["중화"], moistureLabels: ["중화", "윤습"],
        points: 10, confidenceCap: 64,
        satisfiedLabel: "한열이 중화되고 조습이 중화·윤습하여 기화와 응결이 교대함",
        missingLabel: "한열 중화 또는 중화·윤습 조후가 부족함",
        blockerLabel: "편고한 조후가 기화와 응결의 순환을 끊음",
      },
      {
        kind: "blocked-branch-pair", pairs: [["子", "午"], ["巳", "亥"]],
        points: 8, confidenceCap: 49,
        satisfiedLabel: "자·오 또는 사·해의 직접 수화충이 없어 운기가 안정됨",
        missingLabel: "수화가 직접 충돌하여 기화·응결의 순환이 깨짐",
        blockerLabel: "강한 수화 직접충이 운기를 흩뜨림",
      },
    ],
    blockers: ["직접 수화충", "한열 편중", "조후 극단", "제3 유효 영근"],
    minimumScore: 4, maximumScoreGap: 2.5, priority: 87,
    description: "수화가 기제하여 기화와 응결을 거듭하며 구름·운무·신기루의 변화무쌍한 기맥을 이룹니다.",
  },
];

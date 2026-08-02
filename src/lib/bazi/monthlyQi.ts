import type { Element, FourPillars } from "@/types/bazi";
import type { ClimateProfile, ElementEvidence } from "@/types/spiritualRoot";
import { ELEMENTS } from "./elementMeta";

interface MonthlyQiProfile {
  strength: Record<Element, number>;
  temperature: number;
  moisture: number;
  label: string;
}

const CLIMATE_MODEL = {
  temperatureMassWeight: 0.025,
  moistureMassWeight: 0.02,
  woodMoistureFactor: 0.25,
  earthDrynessFactor: 0.4,
  fireDrynessFactor: 0.15,
  temperatureBands: { cold: -1.25, cool: -0.45, warm: 0.45, hot: 1.25 },
  moistureBands: { dry: -1, somewhatDry: -0.3, moist: 0.3, veryMoist: 1 },
} as const;

/**
 * 계절을 네 덩어리로만 보지 않고 12월지의 사령 차이를 보존한다.
 * 辰·未·戌·丑은 모두 토월이지만 각각 봄·여름·가을·겨울의 여기와
 * 조습이 다르므로 별도 표를 둔다. 수치는 영근 활성도의 상대 가중치다.
 */
export const MONTHLY_QI: Record<string, MonthlyQiProfile> = {
  寅: { strength: { wood: 2, fire: 0.75, earth: -0.75, metal: -1, water: 0 }, temperature: -0.2, moisture: 0.3, label: "초봄의 냉습한 목기" },
  卯: { strength: { wood: 2, fire: 1, earth: -1, metal: -1, water: 0 }, temperature: 0.2, moisture: 0.5, label: "봄의 왕성한 목기" },
  辰: { strength: { wood: 0.5, fire: 0.5, earth: 2, metal: -0.5, water: 0 }, temperature: 0.4, moisture: 0.6, label: "늦봄의 습토와 수고" },
  巳: { strength: { wood: 0, fire: 2, earth: 0.75, metal: -1, water: -0.75 }, temperature: 1.3, moisture: -0.2, label: "초여름의 화기" },
  午: { strength: { wood: 0, fire: 2, earth: 1, metal: -1, water: -0.5 }, temperature: 1.8, moisture: -0.6, label: "한여름의 왕화" },
  未: { strength: { wood: 0, fire: 0.75, earth: 2, metal: -0.5, water: -1 }, temperature: 1.3, moisture: -0.9, label: "늦여름의 조토" },
  申: { strength: { wood: -1, fire: -0.5, earth: 0, metal: 2, water: 0.75 }, temperature: 0.5, moisture: -0.5, label: "초가을의 금기" },
  酉: { strength: { wood: -1, fire: -0.5, earth: 0, metal: 2, water: 1 }, temperature: 0, moisture: -0.6, label: "가을의 왕금" },
  戌: { strength: { wood: -1, fire: 0, earth: 2, metal: 0.75, water: -0.5 }, temperature: -0.2, moisture: -1, label: "늦가을의 조토와 화고" },
  亥: { strength: { wood: 0.75, fire: -1, earth: -0.5, metal: 0, water: 2 }, temperature: -1.3, moisture: 0.8, label: "초겨울의 수기" },
  子: { strength: { wood: 1, fire: -1, earth: -0.5, metal: 0, water: 2 }, temperature: -1.8, moisture: 1, label: "한겨울의 왕수" },
  丑: { strength: { wood: -0.5, fire: -1, earth: 2, metal: 0, water: 0.75 }, temperature: -1.4, moisture: 0.5, label: "늦겨울의 한습토" },
};

export function monthlyQiForBranch(branch: string): MonthlyQiProfile {
  return MONTHLY_QI[branch] ?? MONTHLY_QI.辰;
}

export function seasonalPhaseLabel(value: number): "왕(旺)" | "상(相)" | "휴(休)" | "수(囚)" | "사(死)" {
  if (value >= 1.5) return "왕(旺)";
  if (value >= 0.5) return "상(相)";
  if (value > -0.25) return "휴(休)";
  if (value > -0.85) return "수(囚)";
  return "사(死)";
}

function rounded(value: number): number {
  return Math.round(value * 100) / 100;
}

function temperatureLabel(value: number): ClimateProfile["temperatureLabel"] {
  if (value <= CLIMATE_MODEL.temperatureBands.cold) return "한랭";
  if (value <= CLIMATE_MODEL.temperatureBands.cool) return "냉량";
  if (value < CLIMATE_MODEL.temperatureBands.warm) return "중화";
  if (value < CLIMATE_MODEL.temperatureBands.hot) return "온난";
  return "조열";
}

function moistureLabel(value: number): ClimateProfile["moistureLabel"] {
  if (value <= CLIMATE_MODEL.moistureBands.dry) return "조고";
  if (value <= CLIMATE_MODEL.moistureBands.somewhatDry) return "편조";
  if (value < CLIMATE_MODEL.moistureBands.moist) return "중화";
  if (value < CLIMATE_MODEL.moistureBands.veryMoist) return "윤습";
  return "한습";
}

/** 월지 조후를 중심에 두되 원국 전체 오행 질량이 열·한기와 조·습을 얼마나 보태는지 합산한다. */
export function calculateClimateProfile(
  pillars: FourPillars,
  evidence: Record<Element, ElementEvidence>,
): ClimateProfile {
  const month = monthlyQiForBranch(pillars.month.branch);
  const ratio = Object.fromEntries(ELEMENTS.map((element) => [element, evidence[element].presenceRatio])) as Record<Element, number>;
  const temperature = rounded(month.temperature +
    (ratio.fire - ratio.water) * CLIMATE_MODEL.temperatureMassWeight);
  const moisture = rounded(month.moisture +
    (ratio.water + ratio.wood * CLIMATE_MODEL.woodMoistureFactor -
      ratio.earth * CLIMATE_MODEL.earthDrynessFactor - ratio.fire * CLIMATE_MODEL.fireDrynessFactor) *
      CLIMATE_MODEL.moistureMassWeight);
  return {
    temperature,
    moisture,
    temperatureLabel: temperatureLabel(temperature),
    moistureLabel: moistureLabel(moisture),
    reasons: [
      `월지 ${pillars.month.branch}의 ${month.label}`,
      `원국 화·수 질량을 반영한 한열 ${temperature >= 0 ? "+" : ""}${temperature}`,
      `수·목과 화·토 질량을 반영한 조습 ${moisture >= 0 ? "+" : ""}${moisture}`,
    ],
  };
}

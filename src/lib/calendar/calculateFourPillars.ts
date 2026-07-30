import { DateTime, IANAZone } from "luxon";
import { Lunar, Solar } from "lunar-typescript";
import type { BirthInput, FourPillars, FourPillarsCalculation, Pillar } from "@/types/bazi";
import { STEMS } from "@/lib/bazi/stems";
import { BRANCHES } from "@/lib/bazi/branches";
import { applyTrueSolarTime } from "./trueSolarTime";
import { findNearestSolarTerm } from "./solarTerms";
import { makeBoundaryInfo } from "./timeBranches";

export class BirthInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BirthInputError";
  }
}

function makePillar(ganZhi: string): Pillar {
  const stem = ganZhi.slice(0, 1);
  const branch = ganZhi.slice(1, 2);
  const stemData = STEMS[stem];
  const branchData = BRANCHES[branch];
  if (!stemData || !branchData) throw new BirthInputError(`지원하지 않는 간지입니다: ${ganZhi}`);
  return {
    stem,
    branch,
    stemElement: stemData.element,
    branchElement: branchData.element,
    stemYinYang: stemData.yinYang,
    branchYinYang: branchData.yinYang,
  };
}

function validateInput(input: BirthInput): void {
  if (!Number.isInteger(input.year) || input.year < 1900 || input.year > 2100) {
    throw new BirthInputError("출생 연도는 1900년부터 2100년 사이로 입력해 주세요.");
  }
  if (!Number.isInteger(input.month) || input.month < 1 || input.month > 12) {
    throw new BirthInputError("올바른 출생 월을 입력해 주세요.");
  }
  if (!Number.isInteger(input.day) || input.day < 1 || input.day > 31) {
    throw new BirthInputError("올바른 출생 일을 입력해 주세요.");
  }
  if (!Number.isInteger(input.hour) || input.hour < 0 || input.hour > 23 ||
      !Number.isInteger(input.minute) || input.minute < 0 || input.minute > 59) {
    throw new BirthInputError("올바른 출생 시각을 입력해 주세요.");
  }
  if (!IANAZone.isValidZone(input.timezone)) {
    throw new BirthInputError("지원되는 IANA 시간대를 선택해 주세요.");
  }
  if (input.applyTrueSolarTime && (input.longitude === undefined || input.longitude < -180 || input.longitude > 180)) {
    throw new BirthInputError("진태양시 계산에는 -180°부터 180° 사이의 경도가 필요합니다.");
  }
  if (input.calendarType === "solar" && input.isLeapMonth) {
    throw new BirthInputError("윤달은 음력 입력에서만 선택할 수 있습니다.");
  }
}

function inputToLocalDateTime(input: BirthInput): { local: DateTime; sourceLunar?: Lunar } {
  if (input.calendarType === "solar") {
    const local = DateTime.fromObject(
      { year: input.year, month: input.month, day: input.day, hour: input.hour, minute: input.minute },
      { zone: input.timezone },
    );
    if (!local.isValid) throw new BirthInputError("해당 시간대에 존재하지 않는 날짜 또는 시각입니다.");
    return { local };
  }

  try {
    const lunarMonth = input.isLeapMonth ? -input.month : input.month;
    const sourceLunar = Lunar.fromYmdHms(input.year, lunarMonth, input.day, input.hour, input.minute, 0);
    const solar = sourceLunar.getSolar();
    const local = DateTime.fromObject(
      {
        year: solar.getYear(), month: solar.getMonth(), day: solar.getDay(),
        hour: input.hour, minute: input.minute,
      },
      { zone: input.timezone },
    );
    if (!local.isValid) throw new BirthInputError("변환된 양력 시각이 유효하지 않습니다.");
    if (Math.abs(sourceLunar.getMonth()) !== input.month || sourceLunar.getDay() !== input.day) {
      throw new BirthInputError("해당 음력 월에 존재하지 않는 날짜입니다.");
    }
    return { local, sourceLunar };
  } catch (error) {
    if (error instanceof BirthInputError) throw error;
    throw new BirthInputError("해당 음력 날짜 또는 윤달 조합을 확인할 수 없습니다.");
  }
}

function solarFromDateTime(value: DateTime): Solar {
  return Solar.fromYmdHms(value.year, value.month, value.day, value.hour, value.minute, value.second);
}

export function calculateFourPillars(input: BirthInput): FourPillarsCalculation {
  validateInput(input);
  const { local } = inputToLocalDateTime(input);
  const birthInstant = local.toUTC();

  const correction = input.applyTrueSolarTime
    ? applyTrueSolarTime(local, input.longitude!)
    : {
        corrected: local,
        standardMeridian: (local.offset / 60) * 15,
        longitudeCorrectionMinutes: 0,
        equationOfTimeMinutes: 0,
        totalCorrectionMinutes: 0,
      };

  const correctedLocal = correction.corrected;
  const dayHourTime = input.applyLateZi && correctedLocal.hour === 23
    ? correctedLocal.plus({ days: 1 })
    : correctedLocal;

  // lunar-typescript solar-term timestamps are represented in Chinese standard time.
  // Convert the same instant to Asia/Shanghai for exact Li Chun/Jie boundaries.
  const shanghaiTime = birthInstant.setZone("Asia/Shanghai");
  const termLunar = solarFromDateTime(shanghaiTime).getLunar();
  const termEightChar = termLunar.getEightChar();

  // Day/hour pillars follow the corrected local wall clock. The library's default
  // sect keeps 23:00 on the civil day; applyLateZi advances the day explicitly.
  const dayLunar = solarFromDateTime(dayHourTime).getLunar();
  const dayEightChar = dayLunar.getEightChar();
  dayEightChar.setSect(2);

  const pillars: FourPillars = {
    year: makePillar(termEightChar.getYear()),
    month: makePillar(termEightChar.getMonth()),
    day: makePillar(dayEightChar.getDay()),
    hour: makePillar(dayEightChar.getTime()),
  };

  const localSolar = solarFromDateTime(local);
  const localLunar = localSolar.getLunar();
  const nearestTerm = findNearestSolarTerm(termLunar, birthInstant);
  const boundary = makeBoundaryInfo(correctedLocal, nearestTerm);
  const notes = [
    "연주와 월주는 실제 출생 순간을 중국 표준시로 환산한 뒤 입춘·절입의 정확 시각을 기준으로 산출했습니다.",
    "일주와 시주는 선택한 출생지 시간대의 현지 시각을 기준으로 산출했습니다.",
  ];
  if (input.applyLateZi && correctedLocal.hour === 23) notes.push("야자시 설정에 따라 23시 이후의 일주를 다음 날로 계산했습니다.");
  if (input.applyTrueSolarTime) notes.push("경도차와 균시차 근사식을 적용한 진태양시로 일주·시주를 계산했습니다.");
  if (input.longitudeIsApproximate && input.applyTrueSolarTime) notes.push("도시 중심 경도를 사용한 근사값입니다.");

  return {
    pillars,
    solarDate: { year: localSolar.getYear(), month: localSolar.getMonth(), day: localSolar.getDay() },
    lunarDate: {
      year: localLunar.getYear(), month: Math.abs(localLunar.getMonth()), day: localLunar.getDay(),
      isLeap: localLunar.getMonth() < 0,
    },
    correction: {
      originalLocalISO: local.toISO({ suppressMilliseconds: true }) ?? "",
      normalizedISO: birthInstant.toISO({ suppressMilliseconds: true }) ?? "",
      correctedLocalISO: correctedLocal.toISO({ suppressMilliseconds: true }) ?? "",
      calculationTimeISO: shanghaiTime.toISO({ suppressMilliseconds: true }) ?? "",
      longitudeCorrectionMinutes: correction.longitudeCorrectionMinutes,
      equationOfTimeMinutes: correction.equationOfTimeMinutes,
      totalCorrectionMinutes: correction.totalCorrectionMinutes,
      standardMeridian: correction.standardMeridian,
      approximate: input.longitudeIsApproximate && input.applyTrueSolarTime,
    },
    boundary,
    solarTermBasis: "입춘 기준 연주 · 12절기 절입 기준 월주 · lunar-typescript 1.8.6 Exact 계열",
    calculationNotes: notes,
  };
}

export function isValidBirthInput(input: BirthInput): { valid: boolean; message?: string } {
  try {
    validateInput(input);
    inputToLocalDateTime(input);
    return { valid: true };
  } catch (error) {
    return { valid: false, message: error instanceof Error ? error.message : "입력값을 확인해 주세요." };
  }
}

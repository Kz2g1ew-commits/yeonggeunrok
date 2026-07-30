import { DateTime } from "luxon";
import type { Lunar, Solar } from "lunar-typescript";

const TERM_KOREAN: Record<string, string> = {
  立春: "입춘", 雨水: "우수", 惊蛰: "경칩", 春分: "춘분", 清明: "청명", 谷雨: "곡우",
  立夏: "입하", 小满: "소만", 芒种: "망종", 夏至: "하지", 小暑: "소서", 大暑: "대서",
  立秋: "입추", 处暑: "처서", 白露: "백로", 秋分: "추분", 寒露: "한로", 霜降: "상강",
  立冬: "입동", 小雪: "소설", 大雪: "대설", 冬至: "동지", 小寒: "소한", 大寒: "대한",
};

function solarToShanghaiDateTime(solar: Solar): DateTime {
  return DateTime.fromObject(
    {
      year: solar.getYear(), month: solar.getMonth(), day: solar.getDay(),
      hour: solar.getHour(), minute: solar.getMinute(), second: solar.getSecond(),
    },
    { zone: "Asia/Shanghai" },
  );
}

export function findNearestSolarTerm(lunar: Lunar, birthInstant: DateTime): { name: string; minutes: number } | undefined {
  const entries = Object.entries(lunar.getJieQiTable());
  let nearest: { name: string; minutes: number } | undefined;
  for (const [name, solar] of entries) {
    const term = solarToShanghaiDateTime(solar);
    const minutes = Math.abs(term.toMillis() - birthInstant.toMillis()) / 60000;
    if (!nearest || minutes < nearest.minutes) {
      nearest = { name: TERM_KOREAN[name] ?? name, minutes };
    }
  }
  return nearest;
}

export function seasonFromMonthBranch(branch: string): "spring" | "summer" | "earth" | "autumn" | "winter" {
  if (["寅", "卯"].includes(branch)) return "spring";
  if (["巳", "午"].includes(branch)) return "summer";
  if (["申", "酉"].includes(branch)) return "autumn";
  if (["亥", "子"].includes(branch)) return "winter";
  return "earth";
}

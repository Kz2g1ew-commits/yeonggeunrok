import type { BoundaryInfo } from "@/types/bazi";
import { DateTime } from "luxon";

export const TIME_BRANCH_BOUNDARIES = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];

export function minutesToNearestTimeBranch(time: DateTime): number {
  const minuteOfDay = time.hour * 60 + time.minute + time.second / 60;
  const boundaries = TIME_BRANCH_BOUNDARIES.flatMap((hour) => [hour * 60, hour * 60 - 1440, hour * 60 + 1440]);
  return Math.min(...boundaries.map((boundary) => Math.abs(minuteOfDay - boundary)));
}

export function makeBoundaryInfo(
  time: DateTime,
  solarTerm?: { name: string; minutes: number },
): BoundaryInfo {
  const minutesToTimeBranch = minutesToNearestTimeBranch(time);
  const minutesToSolarTerm = solarTerm?.minutes;
  const nearSolarTerm = minutesToSolarTerm !== undefined && minutesToSolarTerm <= 30;
  const nearTimeBranch = minutesToTimeBranch <= 30;
  return {
    nearBoundary: nearSolarTerm || nearTimeBranch,
    nearSolarTerm,
    nearTimeBranch,
    minutesToSolarTerm,
    solarTermName: solarTerm?.name,
    minutesToTimeBranch,
  };
}

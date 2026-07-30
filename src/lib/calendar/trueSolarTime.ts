import { DateTime } from "luxon";

export interface TrueSolarCorrection {
  corrected: DateTime;
  standardMeridian: number;
  longitudeCorrectionMinutes: number;
  equationOfTimeMinutes: number;
  totalCorrectionMinutes: number;
}

/**
 * Apparent solar time correction.
 * - longitude correction: 4 minutes × (longitude - standard meridian)
 * - equation of time (minute approximation):
 *   9.87 sin(2B) - 7.53 cos(B) - 1.5 sin(B), B = 2π(dayOfYear - 81) / 364
 * The standard meridian follows the IANA-zone UTC offset at the birth instant.
 */
export function applyTrueSolarTime(localTime: DateTime, longitude: number): TrueSolarCorrection {
  const standardMeridian = (localTime.offset / 60) * 15;
  const longitudeCorrectionMinutes = 4 * (longitude - standardMeridian);
  const b = (2 * Math.PI * (localTime.ordinal - 81)) / 364;
  const equationOfTimeMinutes = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  const totalCorrectionMinutes = longitudeCorrectionMinutes + equationOfTimeMinutes;

  return {
    corrected: localTime.plus({ minutes: totalCorrectionMinutes }),
    standardMeridian,
    longitudeCorrectionMinutes,
    equationOfTimeMinutes,
    totalCorrectionMinutes,
  };
}

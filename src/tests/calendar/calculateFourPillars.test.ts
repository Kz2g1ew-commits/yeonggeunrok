import { describe, expect, it } from "vitest";
import { calculateFourPillars } from "@/lib/calendar/calculateFourPillars";
import { birthInput } from "../fixtures";

describe("calculateFourPillars", () => {
  it("matches the library maintainer's published 1986-05-29 reference day", () => {
    const result = calculateFourPillars(birthInput({ year: 1986, month: 5, day: 29, hour: 0, minute: 0 }));
    expect(`${result.pillars.year.stem}${result.pillars.year.branch}`).toBe("丙寅");
    expect(`${result.pillars.month.stem}${result.pillars.month.branch}`).toBe("癸巳");
    expect(`${result.pillars.day.stem}${result.pillars.day.branch}`).toBe("癸酉");
    expect(result.pillars.hour.branch).toBe("子");
  });

  it("changes the year pillar at the exact Li Chun boundary", () => {
    const before = calculateFourPillars(birthInput({ year: 2024, month: 2, day: 4, hour: 17, minute: 25 }));
    const after = calculateFourPillars(birthInput({ year: 2024, month: 2, day: 4, hour: 17, minute: 28 }));
    expect(`${before.pillars.year.stem}${before.pillars.year.branch}`).toBe("癸卯");
    expect(`${after.pillars.year.stem}${after.pillars.year.branch}`).toBe("甲辰");
    expect(after.boundary.nearSolarTerm).toBe(true);
  });

  it("changes the month pillar at a Jie entry boundary", () => {
    const before = calculateFourPillars(birthInput({ year: 2024, month: 3, day: 5, hour: 11, minute: 20 }));
    const after = calculateFourPillars(birthInput({ year: 2024, month: 3, day: 5, hour: 11, minute: 25 }));
    expect(before.pillars.month.branch).toBe("寅");
    expect(after.pillars.month.branch).toBe("卯");
  });

  it("changes the time branch at 23:00 and warns near the boundary", () => {
    const before = calculateFourPillars(birthInput({ hour: 22, minute: 59 }));
    const after = calculateFourPillars(birthInput({ hour: 23, minute: 1 }));
    expect(before.pillars.hour.branch).toBe("亥");
    expect(after.pillars.hour.branch).toBe("子");
    expect(after.boundary.nearTimeBranch).toBe(true);
  });

  it("advances the day pillar when late Zi is enabled", () => {
    const civil = calculateFourPillars(birthInput({ hour: 23, minute: 30, applyLateZi: false }));
    const lateZi = calculateFourPillars(birthInput({ hour: 23, minute: 30, applyLateZi: true }));
    expect(`${civil.pillars.day.stem}${civil.pillars.day.branch}`).not.toBe(`${lateZi.pillars.day.stem}${lateZi.pillars.day.branch}`);
    expect(lateZi.calculationNotes.some((note) => note.includes("야자시"))).toBe(true);
  });

  it("normalizes different time zones to the same instant for year and month", () => {
    const seoul = calculateFourPillars(birthInput({ year: 2024, month: 2, day: 4, hour: 17, minute: 28, timezone: "Asia/Seoul" }));
    const newYork = calculateFourPillars(birthInput({ year: 2024, month: 2, day: 4, hour: 3, minute: 28, timezone: "America/New_York", country: "미국", city: "뉴욕", longitude: -74.006 }));
    expect(seoul.pillars.year).toEqual(newYork.pillars.year);
    expect(seoul.pillars.month).toEqual(newYork.pillars.month);
  });

  it("accepts leap-day Gregorian input", () => {
    const result = calculateFourPillars(birthInput({ year: 2024, month: 2, day: 29 }));
    expect(result.solarDate).toEqual({ year: 2024, month: 2, day: 29 });
  });

  it("converts a known lunar leap month date", () => {
    const result = calculateFourPillars(birthInput({ calendarType: "lunar", isLeapMonth: true, year: 2023, month: 2, day: 1 }));
    expect(result.solarDate).toEqual({ year: 2023, month: 3, day: 22 });
  });

  it("can change a time branch after true-solar-time correction", () => {
    const civil = calculateFourPillars(birthInput({ year: 2024, month: 6, day: 15, hour: 15, minute: 10, applyTrueSolarTime: false }));
    const solar = calculateFourPillars(birthInput({ year: 2024, month: 6, day: 15, hour: 15, minute: 10, applyTrueSolarTime: true, longitudeIsApproximate: false }));
    expect(civil.pillars.hour.branch).toBe("申");
    expect(solar.pillars.hour.branch).toBe("未");
    expect(solar.correction.totalCorrectionMinutes).toBeLessThan(-20);
  });
});

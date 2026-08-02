import { describe, expect, it } from "vitest";
import { monthlyQiForBranch } from "@/lib/bazi/monthlyQi";

describe("12-month qi profiles", () => {
  it("does not flatten the four transitional earth months into one season", () => {
    expect(monthlyQiForBranch("辰").moisture).toBeGreaterThan(0);
    expect(monthlyQiForBranch("未").moisture).toBeLessThan(0);
    expect(monthlyQiForBranch("戌").strength.metal).toBeGreaterThan(monthlyQiForBranch("辰").strength.metal);
    expect(monthlyQiForBranch("丑").strength.water).toBeGreaterThan(monthlyQiForBranch("未").strength.water);
  });
});

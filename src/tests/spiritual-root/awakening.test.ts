import { describe, expect, it } from "vitest";
import { determineAwakening, stableSpiritualRootRoll } from "@/lib/spiritual-root/determineAwakening";
import type { DaoAffinityResult } from "@/types/spiritualRoot";

function dao(score: number): DaoAffinityResult {
  return {
    path: "natural", naturalScore: score, defiantScore: score - 10, score,
    tieBreaker: 1234, contributions: [], reasons: [],
  };
}

describe("determineAwakening", () => {
  it("always opens the gate in generous mode", () => {
    expect(determineAwakening("generous", dao(-10)).passed).toBe(true);
  });

  it("uses a calibrated Dao score boundary for balanced mode", () => {
    expect(determineAwakening("balanced", dao(46.9)).passed).toBe(false);
    expect(determineAwakening("balanced", dao(47)).passed).toBe(true);
  });

  it("uses a calibrated Dao score boundary for strict mode", () => {
    expect(determineAwakening("strict", dao(62.3)).passed).toBe(false);
    expect(determineAwakening("strict", dao(62.4)).passed).toBe(true);
  });

  it("keeps the hash as a deterministic tie breaker only", () => {
    expect(stableSpiritualRootRoll("same-birth-seed")).toBe(stableSpiritualRootRoll("same-birth-seed"));
  });
});

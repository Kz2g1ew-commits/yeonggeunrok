import { describe, expect, it } from "vitest";
import { determineAwakening } from "@/lib/spiritual-root/determineAwakening";
import type { DaoAffinityResult } from "@/types/spiritualRoot";
import { evidenceSet } from "@/tests/fixtures";

function dao(score: number): DaoAffinityResult {
  return {
    path: "natural", naturalScore: score, defiantScore: score - 10, score,
    contributions: [], reasons: [],
  };
}

describe("determineAwakening", () => {
  it("opens the generous gate when at least one three-gate channel is complete", () => {
    expect(determineAwakening("generous", evidenceSet({ wood: 7 }), dao(-10)).passed).toBe(true);
    expect(determineAwakening("generous", evidenceSet({}), dao(100)).passed).toBe(false);
  });

  it("uses channel completion rather than Dao score for balanced mode", () => {
    const evidence = evidenceSet({ wood: 7 });
    evidence.wood.channel.completion = 63.1;
    expect(determineAwakening("balanced", evidence, dao(100)).passed).toBe(false);
    evidence.wood.channel.completion = 63.2;
    expect(determineAwakening("balanced", evidence, dao(-10)).passed).toBe(true);
  });

  it("uses a stricter three-gate completion boundary in strict mode", () => {
    const evidence = evidenceSet({ water: 10 });
    evidence.water.channel.completion = 71;
    expect(determineAwakening("strict", evidence, dao(100)).passed).toBe(false);
    evidence.water.channel.completion = 71.1;
    expect(determineAwakening("strict", evidence, dao(-10)).passed).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { detectShensha } from "@/lib/bazi/shensha";
import { pillar } from "@/tests/fixtures";

const allOn = { enabled: true, huagai: true, guimen: true, yima: true, noble: true, scholar: true, martial: true, charisma: true };

describe("expanded shensha detection", () => {
  it("detects noble and scholarly stars from their proper anchors", () => {
    const result = detectShensha({
      year: pillar("甲", "子"),
      month: pillar("丙", "寅"),
      day: pillar("甲", "午"),
      hour: pillar("丁", "丑"),
    }, allOn);
    const present = new Set(result.filter((item) => item.present).map((item) => item.id));

    expect(present.has("tianyi")).toBe(true);
    expect(present.has("tiande")).toBe(true);
    expect(present.has("yuede")).toBe(true);
    expect(present.has("taiji")).toBe(true);
    expect(present.has("wenchang")).toBe(false);
  });

  it("detects day-pillar and triad martial markers without changing their category", () => {
    const result = detectShensha({
      year: pillar("甲", "寅"),
      month: pillar("丙", "午"),
      day: pillar("庚", "辰"),
      hour: pillar("辛", "酉"),
    }, allOn);
    const byId = Object.fromEntries(result.map((item) => [item.id, item]));

    expect(byId.yangren.present).toBe(true);
    expect(byId.kuigang.present).toBe(true);
    expect(byId.jiangxing.present).toBe(true);
    expect(byId.taohua.present).toBe(true);
    expect(byId.yangren.category).toBe("martial");
    expect(byId.kuigang.evidence[0]).toContain("일주");
  });

  it("can disable disputed schools by group while preserving raw evidence", () => {
    const result = detectShensha({
      year: pillar("甲", "子"), month: pillar("丙", "寅"),
      day: pillar("甲", "午"), hour: pillar("丁", "丑"),
    }, { ...allOn, noble: false });
    const tianyi = result.find((item) => item.id === "tianyi")!;

    expect(tianyi.present).toBe(false);
    expect(tianyi.evidence.length).toBeGreaterThan(0);
    expect(result.find((item) => item.id === "taiji")!.present).toBe(true);
  });
});

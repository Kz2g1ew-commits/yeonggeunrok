import { describe, expect, it } from "vitest";
import type { FourPillars, ShenshaOptions } from "@/types/bazi";
import { detectShensha } from "@/lib/bazi/shensha";
import {
  GUIMEN_PAIRS,
  KUIGANG_DAY_PILLARS,
  TAIJI_BRANCHES,
  TIANDE_RULES,
  TIANYI_BRANCHES,
  TRIAD_SHENSHA_RULES,
  WENCHANG_BRANCHES,
  YANGREN_BRANCHES,
  YINREN_BRANCHES,
  YUEDE_STEMS,
} from "@/lib/bazi/shenshaRules";
import { pillar } from "@/tests/fixtures";

const allOn = {
  enabled: true, school: "classical", huagai: true, guimen: true, yima: true,
  noble: true, scholar: true, martial: true, charisma: true,
} satisfies ShenshaOptions;

function chart(year: [string, string], month: [string, string], day: [string, string], hour: [string, string]): FourPillars {
  return { year: pillar(...year), month: pillar(...month), day: pillar(...day), hour: pillar(...hour) };
}

function resultById(pillars: FourPillars, options: ShenshaOptions = allOn) {
  return Object.fromEntries(detectShensha(pillars, options).map((item) => [item.id, item]));
}

describe("shensha rule tables", () => {
  it("keeps the full classical lookup tables explicit", () => {
    expect(TRIAD_SHENSHA_RULES).toEqual([
      { group: ["寅", "午", "戌"], huagai: "戌", yima: "申", jiangxing: "午", taohua: "卯", jiesha: "亥" },
      { group: ["申", "子", "辰"], huagai: "辰", yima: "寅", jiangxing: "子", taohua: "酉", jiesha: "巳" },
      { group: ["亥", "卯", "未"], huagai: "未", yima: "巳", jiangxing: "卯", taohua: "子", jiesha: "申" },
      { group: ["巳", "酉", "丑"], huagai: "丑", yima: "亥", jiangxing: "酉", taohua: "午", jiesha: "寅" },
    ]);
    expect(GUIMEN_PAIRS).toEqual([["子", "酉"], ["丑", "午"], ["寅", "未"], ["卯", "申"], ["辰", "亥"], ["巳", "戌"]]);
    expect(TIANYI_BRANCHES).toEqual({
      甲: ["丑", "未"], 戊: ["丑", "未"], 庚: ["丑", "未"], 乙: ["子", "申"], 己: ["子", "申"],
      丙: ["亥", "酉"], 丁: ["亥", "酉"], 壬: ["卯", "巳"], 癸: ["卯", "巳"], 辛: ["寅", "午"],
    });
    expect(TAIJI_BRANCHES).toEqual({
      甲: ["子", "午"], 乙: ["子", "午"], 丙: ["卯", "酉"], 丁: ["卯", "酉"],
      戊: ["辰", "戌", "丑", "未"], 己: ["辰", "戌", "丑", "未"],
      庚: ["寅", "亥"], 辛: ["寅", "亥"], 壬: ["巳", "申"], 癸: ["巳", "申"],
    });
    expect(WENCHANG_BRANCHES).toEqual({ 甲: "巳", 乙: "午", 丙: "申", 戊: "申", 丁: "酉", 己: "酉", 庚: "亥", 辛: "子", 壬: "寅", 癸: "卯" });
    expect(YANGREN_BRANCHES).toEqual({ 甲: "卯", 丙: "午", 戊: "午", 庚: "酉", 壬: "子" });
    expect(YINREN_BRANCHES).toEqual({ 乙: "寅", 丁: "巳", 己: "巳", 辛: "申", 癸: "亥" });
    expect(KUIGANG_DAY_PILLARS).toEqual(new Set(["庚辰", "庚戌", "壬辰", "戊戌"]));
  });

  it("covers every month rule for heavenly and monthly virtue", () => {
    expect(TIANDE_RULES).toEqual({
      寅: { kind: "stem", value: "丁" }, 卯: { kind: "branch", value: "申" }, 辰: { kind: "stem", value: "壬" },
      巳: { kind: "stem", value: "辛" }, 午: { kind: "branch", value: "亥" }, 未: { kind: "stem", value: "甲" },
      申: { kind: "stem", value: "癸" }, 酉: { kind: "branch", value: "寅" }, 戌: { kind: "stem", value: "丙" },
      亥: { kind: "stem", value: "乙" }, 子: { kind: "branch", value: "巳" }, 丑: { kind: "stem", value: "庚" },
    });
    expect(YUEDE_STEMS).toEqual({ 寅: "丙", 午: "丙", 戌: "丙", 申: "壬", 子: "壬", 辰: "壬", 亥: "甲", 卯: "甲", 未: "甲", 巳: "庚", 酉: "庚", 丑: "庚" });
  });
});

describe("shensha school and anchor detection", () => {
  it("routes every stem lookup through its declared anchor", () => {
    for (const [stem, targets] of Object.entries(TIANYI_BRANCHES)) {
      const target = targets[0];
      expect(resultById(chart([stem, "辰"], ["丁", "丑"], ["甲", "申"], ["癸", target])).tianyi.present).toBe(true);
    }
    for (const [stem, targets] of Object.entries(TAIJI_BRANCHES)) {
      const target = targets[0];
      expect(resultById(chart([stem, "辰"], ["丁", "丑"], ["甲", "申"], ["癸", target])).taiji.present).toBe(true);
    }
    for (const [stem, target] of Object.entries(WENCHANG_BRANCHES)) {
      expect(resultById(chart(["丙", "辰"], ["丁", "丑"], [stem, "申"], ["癸", target])).wenchang.present).toBe(true);
    }
  });

  it("routes every month-branch virtue lookup through the detector", () => {
    for (const [monthBranch, rule] of Object.entries(TIANDE_RULES)) {
      const yearStem = rule.kind === "stem" ? rule.value : "甲";
      const yearBranch = rule.kind === "branch" ? rule.value : "辰";
      expect(resultById(chart([yearStem, yearBranch], ["丙", monthBranch], ["乙", "午"], ["丁", "酉"])).tiande.present).toBe(true);
    }
    for (const [monthBranch, targetStem] of Object.entries(YUEDE_STEMS)) {
      expect(resultById(chart([targetStem, "辰"], ["丙", monthBranch], ["乙", "午"], ["丁", "酉"])).yuede.present).toBe(true);
    }
  });

  it("routes every triad marker and Guimen pair through the detector", () => {
    for (const rule of TRIAD_SHENSHA_RULES) {
      for (const id of ["huagai", "yima", "jiangxing", "taohua", "jiesha"] as const) {
        expect(resultById(chart(["甲", rule.group[0]], ["丙", "辰"], ["戊", "丑"], ["庚", rule[id]]))[id].present).toBe(true);
      }
    }
    for (const pair of GUIMEN_PAIRS) {
      expect(resultById(chart(["甲", pair[0]], ["丙", "辰"], ["戊", "丑"], ["庚", pair[1]])).guimen.present).toBe(true);
    }
  });

  it("uses the year stem for Taiji in classical mode and adds the day stem only in expanded mode", () => {
    const pillars = chart(["丙", "辰"], ["丁", "丑"], ["甲", "申"], ["癸", "子"]);
    expect(resultById(pillars).taiji.present).toBe(false);
    const expanded = resultById(pillars, { ...allOn, school: "expanded" }).taiji;
    expect(expanded.present).toBe(true);
    expect(expanded.evidence.join(" ")).toContain("일간");
  });

  it("does not mislabel a yin stem as Yangren and exposes Yinren only in expanded mode", () => {
    const pillars = chart(["丙", "辰"], ["丁", "丑"], ["乙", "酉"], ["癸", "寅"]);
    const classical = resultById(pillars);
    const expanded = resultById(pillars, { ...allOn, school: "expanded" });
    expect(classical.yangren.present).toBe(false);
    expect(classical.yinren.present).toBe(false);
    expect(expanded.yangren.present).toBe(false);
    expect(expanded.yinren.present).toBe(true);
  });

  it("recognizes Yangren only for its five yang-stem lookup entries", () => {
    const samples = Object.entries(YANGREN_BRANCHES);
    for (const [stem, branch] of samples) {
      expect(resultById(chart(["乙", "丑"], ["丁", "巳"], [stem, branch], ["癸", "未"])).yangren.present).toBe(true);
    }
  });

  it("recognizes exactly the four Kuigang day pillars", () => {
    for (const item of KUIGANG_DAY_PILLARS) {
      const [stem, branch] = [...item];
      expect(resultById(chart(["甲", "子"], ["丙", "寅"], [stem, branch], ["丁", "卯"])).kuigang.present).toBe(true);
    }
    expect(resultById(chart(["甲", "子"], ["丙", "寅"], ["庚", "申"], ["丁", "卯"])).kuigang.present).toBe(false);
  });
});

describe("shensha strength and damage", () => {
  it("raises repeated, day-position Wenchang to strong status", () => {
    const wenchang = resultById(chart(["丙", "辰"], ["丁", "丑"], ["甲", "巳"], ["癸", "巳"])).wenchang;
    expect(wenchang.occurrenceCount).toBe(2);
    expect(wenchang.strength).toBeGreaterThanOrEqual(72);
    expect(wenchang.status).toBe("strong");
    expect(wenchang.effective).toBe(true);
  });

  it("marks an auspicious star damaged when its seat is severely clashed and punished", () => {
    const wenchang = resultById(chart(["丙", "亥"], ["丁", "寅"], ["甲", "巳"], ["癸", "申"])).wenchang;
    expect(wenchang.present).toBe(true);
    expect(wenchang.damage).toEqual(expect.arrayContaining([expect.stringContaining("충"), expect.stringContaining("형")]));
    expect(wenchang.integrity).toBeLessThan(50);
    expect(wenchang.effective).toBe(false);
    expect(wenchang.status).toBe("damaged");
  });

  it("turns conflict around a challenging star into agitated activation", () => {
    const yangren = resultById(chart(["丙", "酉"], ["丁", "子"], ["甲", "卯"], ["癸", "午"])).yangren;
    expect(yangren.effective).toBe(true);
    expect(yangren.status).toBe("agitated");
    expect(yangren.damage.length).toBeGreaterThanOrEqual(2);
    expect(yangren.strength).toBeGreaterThan(65);
  });

  it("can disable a category while preserving its raw lookup evidence", () => {
    const tianyi = resultById(
      chart(["甲", "子"], ["丙", "寅"], ["甲", "午"], ["丁", "丑"]),
      { ...allOn, noble: false },
    ).tianyi;
    expect(tianyi.present).toBe(false);
    expect(tianyi.effective).toBe(false);
    expect(tianyi.evidence.length).toBeGreaterThan(0);
  });
});

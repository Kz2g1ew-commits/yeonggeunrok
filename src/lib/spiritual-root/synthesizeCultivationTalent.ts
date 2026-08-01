import type { BranchRelations, Element, ShenshaId, ShenshaResult } from "@/types/bazi";
import type {
  AwakeningResult,
  CultivationTalentProfile,
  ElementEvidence,
  RootClassification,
  TalentDimension,
  TalentDimensionId,
  TalentSpecialEffect,
} from "@/types/spiritualRoot";
import { ELEMENTS } from "@/lib/bazi/elementMeta";
import { SHENSHA_STRENGTH_RULES } from "@/lib/bazi/shenshaRules";
import { CULTIVATION_TALENT_RULES as RULES } from "./cultivationTalentRules";

function clamp(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)));
}

function shenshaMultiplier(item: ShenshaResult): number {
  const rules = SHENSHA_STRENGTH_RULES.talentMultiplier;
  const strength = Math.max(rules.minimum, Math.min(rules.maximum, item.strength / rules.center));
  const integrity = item.polarity === "auspicious" ? item.integrity / 100 : 1;
  return strength * integrity;
}

function rounded(value: number): number {
  return Math.round(value * 10) / 10;
}

function dimensionLabel(id: TalentDimensionId, score: number): string {
  const threshold = RULES.dimensions;
  const level = score >= threshold.exceptional ? 4
    : score >= threshold.outstanding ? 3
      : score >= threshold.developed ? 2
        : score >= threshold.sensitive ? 1 : 0;
  const labels: Record<TalentDimensionId, string[]> = {
    rootBone: ["범골", "중등 근골", "상등 근골", "천품 근골", "선천도체급 근골"],
    insight: ["오성이 평범함", "오성이 예민함", "오성이 발달함", "오성이 비범함", "오성이 역천에 가까움"],
    combat: ["전투 감각이 평범함", "전투 감각이 민감함", "전투 재능이 발달함", "전투 재능이 비범함", "천생 투골"],
    soul: ["신혼 감응이 평범함", "신혼 감응이 예민함", "신혼 자질이 발달함", "신혼 자질이 비범함", "선천 신혼체"],
    providence: ["기운이 평범함", "기연 감응이 있음", "기운이 두터움", "천운이 강함", "천도 호도가 짙음"],
  };
  return labels[id][level];
}

function makeDimension(
  id: TalentDimensionId,
  name: string,
  score: number,
  description: string,
  reasons: string[],
): TalentDimension {
  const normalized = clamp(score);
  return { id, name, score: normalized, label: dimensionLabel(id, normalized), description, reasons };
}

export function synthesizeCultivationTalent(
  classification: RootClassification,
  evidence: Record<Element, ElementEvidence>,
  shensha: ShenshaResult[],
  awakening: AwakeningResult,
  relations: BranchRelations,
  innateRoot?: {
    classification: RootClassification;
    evidence: Record<Element, ElementEvidence>;
  },
): CultivationTalentProfile {
  const rootClassification = innateRoot?.classification ?? classification;
  const rootEvidence = innateRoot?.evidence ?? evidence;
  const hasInnateRoot = ELEMENTS.some((element) => rootEvidence[element].effective);
  const effectiveShensha = shensha.filter((item) => item.effective);
  const byId = new Map(effectiveShensha.map((item) => [item.id, item]));
  const has = (id: ShenshaId) => byId.has(id);
  const strong = (id: ShenshaId) => byId.get(id)?.status === "strong";
  const reasons: Record<TalentDimensionId, string[]> = {
    rootBone: [awakening.passed
      ? `${rootClassification.displayName}의 영근 품질을 근골 기반으로 환산`
      : `${rootClassification.displayName}의 선천 기맥 잠재치를 발현 관문과 분리해 환산`],
    insight: [], combat: [], soul: [], providence: [],
  };
  const scores: Record<TalentDimensionId, number> = {
    rootBone: RULES.rootBoneBase[rootClassification.qualityTier],
    insight: RULES.dimensionBase.insight,
    combat: RULES.dimensionBase.combat,
    soul: RULES.dimensionBase.soul,
    providence: RULES.dimensionBase.providence,
  };

  if (rootClassification.grade) scores.rootBone += RULES.rootGradeBonus[rootClassification.grade];
  if (rootClassification.multiRootProfile?.hunyuanQualified) {
    scores.rootBone += RULES.specialRootBonus.hunyuanFive;
    reasons.rootBone.push("오기조원형 혼원 순환이 다근의 한계를 뒤집음");
  } else if (rootClassification.multiRootProfile?.subtype === "오기조원형") {
    scores.rootBone += RULES.specialRootBonus.completeCycleFive;
    reasons.rootBone.push("끊김 없는 오기 상생환이 오영근의 영기 분산을 되돌림");
  } else if (rootClassification.displayName.startsWith("오행균형영근")) {
    scores.rootBone += RULES.specialRootBonus.balancedFive;
    reasons.rootBone.push("오행균형영근의 균일한 기맥이 근골을 보정함");
  } else if (rootClassification.multiRootProfile?.cycleState === "strong") {
    scores.rootBone += RULES.specialRootBonus.strongCycle;
    reasons.rootBone.push("강한 상생 연쇄가 복수 영근의 소모를 줄임");
  }
  const effective = ELEMENTS.filter((element) => rootEvidence[element].effective);
  if (effective.length) {
    const averageCompletion = effective.reduce((sum, element) => sum + rootEvidence[element].channel.completion, 0) / effective.length;
    const completionAdjustment = Math.max(-8, Math.min(8, (averageCompletion - 55) * 0.16));
    scores.rootBone += completionAdjustment;
    reasons.rootBone.push(`유효 기맥 평균 삼관 완성도 ${averageCompletion.toFixed(1)}`);
  }

  for (const item of effectiveShensha) {
    const bonuses = RULES.shenshaBonuses[item.id];
    const multiplier = shenshaMultiplier(item);
    for (const [dimension, value] of Object.entries(bonuses) as Array<[Exclude<TalentDimensionId, "rootBone">, number]>) {
      const applied = rounded(value * multiplier);
      scores[dimension] += applied;
      reasons[dimension].push(`${item.name} 작용도 ${item.strength}·보존도 ${item.integrity} ${applied >= 0 ? "+" : ""}${applied}`);
    }
    const extraOccurrences = Math.max(0, item.occurrenceCount - 1);
    const occurrenceBonus = rounded(Math.min(RULES.extraOccurrenceMaximum, extraOccurrences * RULES.extraOccurrenceBonus) * multiplier);
    if (occurrenceBonus > 0) {
      const primaryDimension: Record<typeof item.category, Exclude<TalentDimensionId, "rootBone">> = {
        mystic: "soul", mobility: "combat", noble: "providence", scholar: "insight", martial: "combat", charisma: "soul",
      };
      scores[primaryDimension[item.category]] += occurrenceBonus;
      reasons[primaryDimension[item.category]].push(`${item.name} 중첩 +${occurrenceBonus}`);
    }
  }

  if (has("wenchang") && has("taiji")) {
    scores.insight += RULES.synergies.insightWenchangTaiji;
    reasons.insight.push(`문창·태극의 해석과 참오 결합 +${RULES.synergies.insightWenchangTaiji}`);
  }
  if (has("taiji") && has("huagai")) {
    scores.insight += RULES.synergies.insightTaijiHuagai;
    reasons.insight.push(`태극·화개의 도법 탐구 결합 +${RULES.synergies.insightTaijiHuagai}`);
  }
  if (has("guimen") && has("taiji") && has("huagai")) {
    scores.soul += RULES.synergies.soulMysticTriad;
    reasons.soul.push(`귀문·태극·화개의 신혼 감응 결합 +${RULES.synergies.soulMysticTriad}`);
  }
  if (has("yangren") && (has("jiangxing") || has("kuigang"))) {
    scores.combat += RULES.synergies.combatBladeCommand;
    reasons.combat.push(`양인과 장성·괴강의 투골 결합 +${RULES.synergies.combatBladeCommand}`);
  }
  if (has("tianyi") && has("tiande") && has("yuede")) {
    scores.providence += RULES.synergies.providenceHeavenMonthVirtue;
    reasons.providence.push(`천을·천덕·월덕 삼귀 호도 +${RULES.synergies.providenceHeavenMonthVirtue}`);
  }
  scores.combat += Math.min(8, relations.dynamicCount * 1.5);
  if (relations.dynamicCount > 0) reasons.combat.push(`충형파해 동세가 실전 반응을 자극함 +${Math.min(8, relations.dynamicCount * 1.5).toFixed(1)}`);

  const dimensions = {
    rootBone: makeDimension("rootBone", "근골", scores.rootBone, "영근·체질이 영기를 담고 버티는 선천 기반", reasons.rootBone),
    insight: makeDimension("insight", "오성", scores.insight, "공법을 이해하고 추연·융합하는 능력", reasons.insight),
    combat: makeDimension("combat", "투골", scores.combat, "실전 판단·폭발력·전투 술식 적응력", reasons.combat),
    soul: makeDimension("soul", "신혼", scores.soul, "정신계·환술·도법 감응과 심마 저항의 기반", reasons.soul),
    providence: makeDimension("providence", "기운", scores.providence, "귀인·기연·호도와 인과 완충의 선협적 표현", reasons.providence),
  } satisfies Record<TalentDimensionId, TalentDimension>;

  const auspiciousCategories = ["tianyi", "tiande", "yuede", "wenchang", "taiji"]
    .filter((id) => has(id as ShenshaId)).length;
  const supportingScores = [dimensions.insight.score, dimensions.combat.score, dimensions.soul.score];
  const heavenlyFavored = awakening.passed && dimensions.providence.score >= RULES.titles.heavenlyFavored.providence &&
    dimensions.rootBone.score >= RULES.titles.heavenlyFavored.rootBone &&
    auspiciousCategories >= RULES.titles.heavenlyFavored.auspiciousCategoryCount &&
    strong("tianyi") && has("tiande") && has("yuede") &&
    Math.max(...supportingScores) >= RULES.titles.heavenlyFavored.supportingDimension;
  const peerless = awakening.passed && dimensions.rootBone.score >= RULES.titles.peerless.rootBone &&
    supportingScores.filter((score) => score >= RULES.titles.peerless.strongDimension).length >= RULES.titles.peerless.strongDimensionCount;
  const tianjiao = awakening.passed && dimensions.rootBone.score >= RULES.titles.tianjiao.rootBone &&
    Math.max(...supportingScores) >= RULES.titles.tianjiao.supportingDimension;
  const promising = awakening.passed && (dimensions.rootBone.score >= RULES.titles.promising.rootBone ||
    Math.max(...supportingScores) >= RULES.titles.promising.alternativeDimension);

  const specialEffects: TalentSpecialEffect[] = [];
  const addEffect = (effect: TalentSpecialEffect) => specialEffects.push(effect);
  if (heavenlyFavored) addEffect({
    id: "heavenly-dao-child", name: "천도지자 天道之子", rarity: "mythic",
    description: "여러 귀인성이 겹치고 실제 영근 각성까지 받쳐 주어 천도의 호도를 받는 주인공형 기운입니다.",
    evidence: effectiveShensha.filter((item) => ["tianyi", "tiande", "yuede", "taiji", "wenchang"].includes(item.id)).map((item) => item.name),
    effects: ["치명적 기연의 생환 보정", "사문·전승과의 강한 인연", "큰 인과를 짊어질 위험"],
  });
  if (dimensions.insight.score >= RULES.dimensions.outstanding + 6) addEffect({
    id: "heaven-defying-insight", name: "역천오성 逆天悟性", rarity: "very-rare",
    description: "기존 공법을 외우는 수준을 넘어 결함을 찾아 보완하고 새로운 술식으로 추연할 자질입니다.",
    evidence: reasons.insight.slice(-4), effects: ["공법 습득·개량 가속", "복합 술식 융합", "과도한 추연으로 심신 소모"],
  });
  if (has("tianyi") && has("tiande") && has("yuede")) addEffect({
    id: "noble-protection", name: "귀인호도 貴人護道", rarity: "rare",
    description: "천을귀인에 천덕·월덕이 호응해 스승·사문·호도자와의 인연이 두터운 형상입니다.",
    evidence: effectiveShensha.filter((item) => ["tianyi", "tiande", "yuede"].includes(item.id)).map((item) => item.name),
    effects: ["사문 인연", "위기 완충", "은혜와 인과의 부채"],
  });
  if (has("taiji") && has("huagai") && has("wenchang") && dimensions.insight.score >= 70) addEffect({
    id: "natural-dao-heart", name: "선천도심 先天道心", rarity: "rare",
    description: "현리 탐구와 고요한 참선 성향이 만나 도법의 본뜻을 붙드는 재능입니다.",
    evidence: [byId.get("taiji")!.name, byId.get("huagai")!.name], effects: ["도법 참오", "진법·부도 친화", "은둔과 집착"],
  });
  if (strong("guimen") && (has("taiji") || has("huagai"))) addEffect({
    id: "mystic-soul", name: "통유신혼 通幽神魂", rarity: "rare",
    description: "음계·꿈·영혼의 파동을 감지하기 쉬운 대신 심마와 오염에도 민감한 신혼형 자질입니다.",
    evidence: effectiveShensha.filter((item) => ["guimen", "taiji", "huagai"].includes(item.id)).map((item) => item.name),
    effects: ["영혼·환술 감응", "음계 탐지", "주화입마 위험"],
  });
  if (has("yangren") && (has("kuigang") || strong("jiangxing")) && dimensions.combat.score >= 70) addEffect({
    id: "battle-bone", name: "천생투골 天生鬪骨", rarity: "rare",
    description: "양인의 폭발력이 장성·괴강의 통솔과 강기에 결속된 전투형 체질입니다.",
    evidence: effectiveShensha.filter((item) => ["yangren", "jiangxing", "kuigang"].includes(item.id)).map((item) => item.name),
    effects: ["근접전 폭발력", "전장 적응", "혈기 폭주 위험"],
  });
  const metalFocused = classification.originalElements.includes("metal") &&
    (classification.originalElements.length <= 2 || classification.multiRootProfile?.dominantElement === "metal");
  if (has("wenchang") && metalFocused && (has("yangren") || has("kuigang")) && dimensions.insight.score >= 64) addEffect({
    id: "clear-sword-heart", name: "검심통명 劍心通明", rarity: "very-rare",
    description: "금 기맥의 절단성과 문창의 해석력이 전투 기세에 이어져 검결을 직관적으로 해부하는 자질입니다.",
    evidence: [byId.get("wenchang")!.name, "유효 금 기맥", has("yangren") ? byId.get("yangren")!.name : byId.get("kuigang")!.name],
    effects: ["검결 습득 가속", "초식 파훼", "살기 과잉 주의"],
  });

  const tier = !awakening.passed ? "unawakened"
    : heavenlyFavored ? "heavenly-favored"
      : peerless ? "peerless"
        : tianjiao ? "tianjiao"
          : promising ? "promising" : "ordinary";
  const title = {
    unawakened: hasInnateRoot ? "영문미개 靈門未開" : "미각성 범골 未覺醒凡骨",
    ordinary: "평범한 수선 자질",
    promising: "영수 靈秀",
    tianjiao: "천교 天驕",
    peerless: "절세천교 絶世天驕",
    "heavenly-favored": "천도지자 天道之子",
  }[tier];
  const ranked = Object.values(dimensions).sort((a, b) => b.score - a.score);
  const summary = `${ranked[0].name} ${ranked[0].score}점과 ${ranked[1].name} ${ranked[1].score}점이 두드러집니다. ${dimensions.insight.label}.`;

  return { tier, title, summary, dimensions, specialEffects };
}

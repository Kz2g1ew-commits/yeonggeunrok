import type { AnalysisContext, MutationCandidate } from "@/types/spiritualRoot";
import { ELEMENT_META } from "@/lib/bazi/elementMeta";
import { MUTATION_RULES, type MutationRule } from "./mutationRules";
import { SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

function addCondition(target: string[], condition: boolean, yes: string, no: string, missing: string[]): number {
  if (condition) {
    target.push(yes);
    return 1;
  }
  missing.push(no);
  return 0;
}

function hasWoodMetalClash(context: AnalysisContext): boolean {
  const branches = Object.values(context.pillars).map((pillar) => pillar.branch);
  return ([
    ["寅", "申"],
    ["卯", "酉"],
  ] as const).some(([wood, metal]) => branches.includes(wood) && branches.includes(metal));
}

function relationSatisfied(rule: MutationRule, context: AnalysisContext): boolean {
  switch (rule.relationMode ?? "support") {
    case "inherent":
      return true;
    case "wood-metal-clash":
      return hasWoodMetalClash(context);
    case "support":
      return rule.sourceElements.some((source) => context.evidence[source].supportScore > 0);
  }
}

function evaluateSpecialConditions(
  rule: MutationRule,
  context: AnalysisContext,
  satisfied: string[],
  missing: string[],
  blockers: string[],
): number {
  const { evidence, relations, season, shensha } = context;
  const dynamic = relations.dynamicCount > 0;
  const fireStrong = evidence.fire.effective && evidence.fire.score >= 9;
  const waterStrong = evidence.water.effective && evidence.water.score >= 9;
  const earthStrong = evidence.earth.effective && evidence.earth.score >= 10;
  const moist = season === "winter" || evidence.water.monthCommand;
  const dryHot = season === "summer" && evidence.fire.score >= 8;
  const hasYima = shensha.some((item) => item.id === "yima" && item.effective);
  const hasGuimen = shensha.some((item) => item.id === "guimen" && item.effective);
  const hasSwordMarker = shensha.some((item) => ["yangren", "kuigang", "jiangxing"].includes(item.id) && item.effective);
  const hasConflict = relations.clashes.length + relations.punishments.length + relations.harms.length > 0;
  let points = 0;

  switch (rule.id) {
    case "ice":
      points += 8 * addCondition(
        satisfied,
        evidence.water.monthCommand || evidence.water.rootStrength >= 1.6,
        "수가 월령 또는 강한 가중 통근을 얻음",
        "수의 계절·가중 통근 세력이 부족함",
        missing,
      );
      if (fireStrong || dryHot) blockers.push("강한 화기 또는 조열함이 금수를 제압함");
      break;
    case "lightning":
      points += 10 * addCondition(satisfied, dynamic, "충·형 등 동적 구조가 존재함", "동적 충·형 구조가 부족함", missing);
      if (evidence.water.potential) { satisfied.push("잠재 수기가 방전 흐름을 보조함"); points += 4; }
      if (earthStrong) blockers.push("강한 토가 목화의 흐름을 막음");
      if (waterStrong && evidence.water.score > evidence.fire.score + 3) blockers.push("강한 수가 화기를 소멸시킴");
      break;
    case "wind-moist":
    case "wind-hot":
      points += 8 * addCondition(satisfied, dynamic || hasYima, "역마 또는 이동성 구조가 있음", "이동성 구조가 부족함", missing);
      if (earthStrong && evidence.earth.score > evidence.wood.score + 3) blockers.push("강한 토가 목기의 이동을 정체시킴");
      break;
    case "poison-liquid":
    case "poison-decay":
      points += 8 * addCondition(satisfied, moist, "음습한 구조가 형성됨", "음습한 환경이 부족함", missing);
      points += 7 * addCondition(satisfied, hasConflict, "형·해·충의 비정상 결합이 있음", "형·해 구조가 부족함", missing);
      if (fireStrong) blockers.push("과도한 화기가 독성을 건조시킴");
      break;
    case "lava":
      points += 8 * addCondition(satisfied, evidence.fire.monthCommand || evidence.earth.monthCommand || dryHot, "조열한 화토 세력이 있음", "화토의 조열한 세력이 부족함", missing);
      if (waterStrong) blockers.push("강한 수기가 용암의 열을 식힘");
      break;
    case "shadow":
      points += 8 * addCondition(satisfied, moist && !fireStrong, "한습하고 화기가 약함", "한습 조건 또는 약한 화 조건이 부족함", missing);
      if (hasGuimen) { satisfied.push("귀문관살이 영혼·그림자 성향을 보조함"); points += 5; }
      if (fireStrong) blockers.push("강한 화기가 은폐성을 해침");
      break;
    case "light":
      points += 9 * addCondition(satisfied, relations.dynamicCount <= 2, "방출과 응축의 충돌이 제어됨", "화금 충돌이 지나치게 거침", missing);
      if (evidence.earth.potential) { satisfied.push("잠재 토가 완충함"); points += 5; }
      if (waterStrong) blockers.push("강한 수기가 화의 방출을 끔");
      if (relations.dynamicCount >= 4) blockers.push("동적 충돌이 광 변이의 균형을 깨뜨림");
      break;
    case "purple-lightning":
      points += 10 * addCondition(satisfied, relations.clashes.length > 0, "지지 충이 화금 상극을 활성화함", "필수 충 구조가 없음", missing);
      if (evidence.earth.potential || (evidence.earth.score >= 2 && !evidence.earth.effective)) {
        satisfied.push("잠재 토가 기맥 붕괴를 완충함"); points += 6;
      } else {
        blockers.push("토의 완충이 부족함");
      }
      break;
    case "sword": {
      const cuttingClash = hasWoodMetalClash(context);
      const bothRooted = evidence.wood.rootStrength >= 0.8 && evidence.metal.rootStrength >= 0.8;
      points += 12 * addCondition(
        satisfied,
        cuttingClash,
        "인·신 또는 묘·유 충이 금목의 절단 상극을 활성화함",
        "금목을 직접 벼리는 인·신·묘·유 충이 부족함",
        missing,
      );
      points += 8 * addCondition(
        satisfied,
        bothRooted,
        "목과 금이 모두 독립된 뿌리를 가져 절단과 재생을 견딤",
        "목근과 금근 중 하나가 약해 반복 정련을 견디기 어려움",
        missing,
      );
      if (!bothRooted) blockers.push("목의 재생근 또는 금의 정련근이 부족함");
      if (hasSwordMarker) { satisfied.push("양인·괴강·장성이 검기의 살벌성과 결단을 보조함"); points += 4; }
      if (fireStrong && evidence.fire.score > evidence.metal.score + 2) blockers.push("강한 화기가 금의 날을 무르게 함");
      break;
    }
  }
  return points;
}

function evaluateRule(rule: MutationRule, context: AnalysisContext): MutationCandidate {
  const satisfied: string[] = [];
  const missing: string[] = [];
  const blockers: string[] = [];
  const effectiveElements = Object.values(context.evidence).filter((item) => item.effective).map((item) => item.element);
  const sourceReady = rule.sourceElements.every((element) => context.evidence[element].effective && context.evidence[element].score >= (rule.minimumScore ?? 4));
  let score = sourceReady ? 40 : rule.sourceElements.filter((element) => context.evidence[element].effective).length * 15;
  if (sourceReady) satisfied.push(`${rule.sourceElements.map((element) => ELEMENT_META[element].label).join("·")} 원재료가 모두 유효 영근`);
  else missing.push("원재료 두 오행이 모두 유효 영근이어야 함");

  const [a, b] = rule.sourceElements;
  const gap = Math.abs(context.evidence[a].score - context.evidence[b].score);
  if (gap <= (rule.maximumScoreGap ?? 4)) {
    satisfied.push(`두 오행의 점수 차가 허용 범위 안임 (${gap.toFixed(1)}점)`);
    score += 10;
  } else {
    missing.push(`두 오행의 점수 차가 큼 (${gap.toFixed(1)}점)`);
    blockers.push("점수 편중이 커서 두 기운의 안정적인 융합이 어려움");
  }

  const hasRequiredRelation = relationSatisfied(rule, context);
  if (hasRequiredRelation) { satisfied.push(`${rule.requiredRelations[0]} 구조를 확인함`); score += 15; }
  else missing.push(`${rule.requiredRelations[0]} 구조가 약함`);

  if (rule.preferredSeasons?.includes(context.season)) {
    satisfied.push("월령이 변이 방향을 지지함"); score += 12;
  } else if (rule.preferredSeasons) {
    missing.push("선호 계절의 지원이 없음");
  }

  if (rule.requiredBranches) {
    const branches = Object.values(context.pillars).map((pillar) => pillar.branch);
    if (rule.requiredBranches.some((branch) => branches.includes(branch))) {
      satisfied.push("변이를 돕는 지지가 존재함"); score += 8;
    } else missing.push("변이를 돕는 핵심 지지가 없음");
  }

  score += evaluateSpecialConditions(rule, context, satisfied, missing, blockers);
  const thirdRoots = effectiveElements.filter((element) => !rule.sourceElements.includes(element));
  if (thirdRoots.length === 0) {
    satisfied.push("융합을 방해할 제3 유효 영근이 없음"); score += 10;
  } else {
    blockers.push(`제3 유효 영근(${thirdRoots.map((element) => ELEMENT_META[element].label).join("·")})이 독립 작용함`);
    score -= 18;
  }

  score -= blockers.length * 12;
  let confidence = clamp(Math.round(score));
  if (!sourceReady) confidence = Math.min(confidence, 49);
  if (thirdRoots.length > 0) confidence = Math.min(confidence, 69);
  if (blockers.length >= 2) confidence = Math.min(confidence, 49);
  const statusRules = SPIRITUAL_ROOT_RULES.mutationStatus;
  const status: MutationCandidate["status"] = confidence >= statusRules.confirmed ? "confirmed"
    : confidence >= statusRules.likely ? "likely"
      : confidence >= statusRules.possible ? "possible" : "rejected";

  return {
    id: rule.id, name: rule.name, sourceElements: rule.sourceElements,
    score: Math.round(score * 10) / 10, confidence, status,
    satisfiedConditions: satisfied, missingConditions: missing, blockers,
    description: rule.description,
  };
}

export function detectMutationRoots(context: AnalysisContext): MutationCandidate[] {
  return MUTATION_RULES.map((rule) => ({ rule, candidate: evaluateRule(rule, context) }))
    .sort((a, b) => b.candidate.confidence - a.candidate.confidence || b.rule.priority - a.rule.priority)
    .map(({ candidate }) => candidate);
}

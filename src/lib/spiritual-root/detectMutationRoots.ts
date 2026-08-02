import type { Element } from "@/types/bazi";
import type { AnalysisContext, MutationCandidate, RootEvidence } from "@/types/spiritualRoot";
import { ELEMENT_META } from "@/lib/bazi/elementMeta";
import { MUTATION_RULES, type MutationFusionRequirement, type MutationRule } from "./mutationRules";
import { SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const MUTATION_STATUS_RANK: Record<MutationCandidate["status"], number> = {
  confirmed: 3, likely: 2, possible: 1, rejected: 0,
};

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

function hasBranchPair(context: AnalysisContext, pairs: Array<[string, string]>): boolean {
  const branches = Object.values(context.pillars).map((pillar) => pillar.branch);
  return pairs.some((pair) => pair.every((branch) => branches.includes(branch)));
}

function matchingRootStrength(
  context: AnalysisContext,
  element: Element,
  options: {
    branches?: string[];
    roles?: Array<"main" | "middle" | "residual">;
    allowedClashStates?: RootEvidence["clashState"][];
  } = {},
): number {
  return context.evidence[element].rootDetails
    .filter((root) =>
      (!options.branches || options.branches.includes(root.branch)) &&
      (!options.roles || options.roles.includes(root.role)) &&
      (!options.allowedClashStates || options.allowedClashStates.includes(root.clashState)))
    .reduce((sum, root) => sum + root.strength, 0);
}

function fusionRequirementSatisfied(requirement: MutationFusionRequirement, context: AnalysisContext): boolean {
  switch (requirement.kind) {
    case "climate-labels":
      return requirement.temperatureLabels.includes(context.climate.temperatureLabel) &&
        requirement.moistureLabels.includes(context.climate.moistureLabel);
    case "score-gap":
      return Math.abs(
        context.evidence[requirement.elements[0]].score - context.evidence[requirement.elements[1]].score,
      ) <= requirement.maximum;
    case "root-pattern":
      return matchingRootStrength(context, requirement.element, {
        allowedClashStates: requirement.allowedClashStates,
      }) >= requirement.minimumStrength;
    case "root-strength-gap": {
      const [a, b] = requirement.elements;
      return Math.abs(
        matchingRootStrength(context, a, { allowedClashStates: requirement.allowedClashStates }) -
        matchingRootStrength(context, b, { allowedClashStates: requirement.allowedClashStates }),
      ) <= requirement.maximum;
    }
  }
}

function evaluateFusionPaths(
  rule: MutationRule,
  context: AnalysisContext,
  satisfied: string[],
  missing: string[],
  blockers: string[],
): { points: number; confidenceCap: number } {
  if (!rule.fusionPaths?.length) return { points: 0, confidenceCap: 100 };
  const completed = rule.fusionPaths.find((path) =>
    path.requirements.every((requirement) => fusionRequirementSatisfied(requirement, context)));
  if (completed) {
    satisfied.push(completed.satisfiedLabel);
    return { points: completed.points, confidenceCap: 100 };
  }

  missing.push(...rule.fusionPaths.map((path) => path.missingLabel));
  blockers.push(rule.fusionPathBlockerLabel ?? "대안 융합 관문이 성립하지 않음");
  return { points: 0, confidenceCap: rule.fusionPathFailureConfidenceCap ?? 64 };
}

function relationSatisfied(rule: MutationRule, context: AnalysisContext): boolean {
  const [source, target] = rule.sourceElements;
  const sourceEvidence = context.evidence[source];
  const targetEvidence = context.evidence[target];
  const grounded = (element: typeof sourceEvidence) => element.monthCommand || element.rootStrength >= SPIRITUAL_ROOT_RULES.roots.visibleConnectionMinimum;
  switch (rule.relationMode ?? "generating-flow") {
    case "generating-flow":
      return targetEvidence.supportScore > 0 || targetEvidence.contributions.some(({ label }) => label.includes(" 유통"));
    case "balanced-polarity":
      return grounded(sourceEvidence) && grounded(targetEvidence) && context.relations.dynamicCount <= 2;
    case "dynamic-control":
      return grounded(sourceEvidence) && grounded(targetEvidence) && context.relations.dynamicCount > 0;
    case "submerged-interface":
      return grounded(sourceEvidence) && grounded(targetEvidence) &&
        context.climate.moisture >= SPIRITUAL_ROOT_RULES.mutationSource.moistThreshold;
    case "wood-metal-clash":
      return hasWoodMetalClash(context);
    case "rooted-generation":
      return grounded(sourceEvidence) && grounded(targetEvidence) &&
        (targetEvidence.supportScore > 0 ||
          targetEvidence.contributions.some(({ label }) =>
            label.includes(`${ELEMENT_META[source].label}생${ELEMENT_META[target].label} 유통`)));
    case "thermal-convergence":
      return grounded(sourceEvidence) && grounded(targetEvidence);
  }
}

function evaluateConfiguredConditions(
  rule: MutationRule,
  context: AnalysisContext,
  satisfied: string[],
  missing: string[],
  blockers: string[],
): { points: number; confidenceCap: number } {
  let points = 0;
  let confidenceCap = 100;

  for (const condition of rule.conditions ?? []) {
    let met = false;
    switch (condition.kind) {
      case "root-pattern": {
        met = matchingRootStrength(context, condition.element, {
          branches: condition.branches,
          roles: condition.roles,
          allowedClashStates: condition.allowedClashStates,
        }) >= condition.minimumStrength;
        break;
      }
      case "climate-window":
        met = context.climate.temperature >= condition.temperature[0] &&
          context.climate.temperature <= condition.temperature[1] &&
          context.climate.moisture >= condition.moisture[0] &&
          context.climate.moisture <= condition.moisture[1];
        break;
      case "climate-labels":
        met = condition.temperatureLabels.includes(context.climate.temperatureLabel) &&
          condition.moistureLabels.includes(context.climate.moistureLabel);
        break;
      case "maximum-dynamic":
        met = context.relations.dynamicCount <= condition.maximum;
        break;
      case "blocked-branch-pair":
        met = !hasBranchPair(context, condition.pairs);
        break;
      case "maximum-element-score":
        met = context.evidence[condition.element].score < condition.maximum;
        break;
      case "maximum-score-lead":
        met = context.evidence[condition.leadingElement].score -
          context.evidence[condition.trailingElement].score <= condition.maximumGap;
        break;
    }

    if (met) {
      satisfied.push(condition.satisfiedLabel);
      points += condition.points;
    } else {
      missing.push(condition.missingLabel);
      blockers.push(condition.blockerLabel);
      confidenceCap = Math.min(confidenceCap, condition.confidenceCap);
    }
  }

  for (const bonus of rule.bonuses ?? []) {
    if (bonus.kind === "branch-pair" && hasBranchPair(context, bonus.pairs)) {
      satisfied.push(bonus.label);
      points += bonus.points;
    }
  }

  return { points, confidenceCap };
}

function mutationSourceReady(rule: MutationRule, context: AnalysisContext): boolean {
  const sourceRules = SPIRITUAL_ROOT_RULES.mutationSource;
  return rule.sourceElements.every((element) => {
    const item = context.evidence[element];
    if (!item.effective || !item.channel.complete || item.score < (rule.minimumScore ?? 4)) return false;
    if (item.activationOrigin === "independent") return true;
    return item.activationOrigin === "network-assisted" &&
      item.score >= sourceRules.networkAssistedMinimumScore &&
      item.rootStrength >= sourceRules.networkAssistedMinimumRoot &&
      (item.monthCommand || item.visibleStems.length > 0);
  });
}

function evaluateSpecialConditions(
  rule: MutationRule,
  context: AnalysisContext,
  satisfied: string[],
  missing: string[],
  blockers: string[],
): number {
  const { evidence, relations, shensha, climate } = context;
  const dynamic = relations.dynamicCount > 0;
  const fireStrong = evidence.fire.effective && evidence.fire.score >= 9;
  const waterStrong = evidence.water.effective && evidence.water.score >= 9;
  const earthStrong = evidence.earth.effective && evidence.earth.score >= 10;
  const climateRules = SPIRITUAL_ROOT_RULES.mutationSource;
  const cold = climate.temperature <= climateRules.coldThreshold;
  const moist = climate.moisture >= climateRules.moistThreshold;
  const dryHot = climate.temperature >= climateRules.hotThreshold && climate.moisture <= climateRules.dryThreshold;
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
      points += 8 * addCondition(satisfied, cold && moist, "한습 조후가 빙기의 응결을 도움", "한습 조후가 충분하지 않음", missing);
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
      points += 8 * addCondition(satisfied, dryHot && (evidence.fire.monthCommand || evidence.earth.monthCommand), "조열한 월지에서 화토 세력이 이어짐", "화토를 굳히는 조열 조후가 부족함", missing);
      if (waterStrong) blockers.push("강한 수기가 용암의 열을 식힘");
      break;
    case "shadow":
      points += 8 * addCondition(satisfied, cold && moist && !fireStrong, "한습하고 화기가 약함", "한습 조건 또는 약한 화 조건이 부족함", missing);
      if (hasGuimen) { satisfied.push("귀문관살이 영혼·그림자 성향을 보조함"); points += 5; }
      if (fireStrong) blockers.push("강한 화기가 은폐성을 해침");
      break;
    case "light":
      points += 10 * addCondition(
        satisfied,
        relations.clashes.length === 0 && relations.dynamicCount <= 2,
        "직접 충이 없어 화의 방출과 금의 응축이 광휘로 제어됨",
        "직접 충 또는 과도한 동세가 광휘의 안정성을 깨뜨림",
        missing,
      );
      if (evidence.earth.potential) { satisfied.push("잠재 토가 완충함"); points += 5; }
      if (waterStrong) blockers.push("강한 수기가 화의 방출을 끔");
      if (relations.clashes.length > 0) blockers.push("지지 충이 광기의 안정된 응축을 자뢰성 폭발로 바꿈");
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
  const sourceReady = mutationSourceReady(rule, context);
  let confidenceCap = 100;
  let score = sourceReady ? 40 : rule.sourceElements.filter((element) => context.evidence[element].effective).length * 15;
  if (sourceReady) satisfied.push(`${rule.sourceElements.map((element) => ELEMENT_META[element].label).join("·")} 원재료가 독립 또는 강한 합류 기맥으로 작동함`);
  else missing.push("원재료 두 오행에 실제 작동 기맥이 필요함");

  const [a, b] = rule.sourceElements;
  const gap = Math.abs(context.evidence[a].score - context.evidence[b].score);
  if ((rule.scoreGapMode ?? "standard") === "standard") {
    if (gap <= (rule.maximumScoreGap ?? 4)) {
      satisfied.push(`두 오행의 점수 차가 허용 범위 안임 (${gap.toFixed(1)}점)`);
      score += 10;
    } else {
      missing.push(`두 오행의 점수 차가 큼 (${gap.toFixed(1)}점)`);
      blockers.push("점수 편중이 커서 두 기운의 안정적인 융합이 어려움");
    }
  }

  const hasRequiredRelation = relationSatisfied(rule, context);
  if (hasRequiredRelation) { satisfied.push(`${rule.requiredRelations[0]} 구조를 확인함`); score += 15; }
  else {
    missing.push(`${rule.requiredRelations[0]} 구조가 약함`);
    if (rule.relationFailureConfidenceCap !== undefined) {
      blockers.push(`${rule.requiredRelations[0]}의 필수 흐름이 성립하지 않음`);
      confidenceCap = Math.min(confidenceCap, rule.relationFailureConfidenceCap);
    }
  }

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

  const fusionPath = evaluateFusionPaths(rule, context, satisfied, missing, blockers);
  score += fusionPath.points;
  confidenceCap = Math.min(confidenceCap, fusionPath.confidenceCap);

  const configuredConditions = evaluateConfiguredConditions(rule, context, satisfied, missing, blockers);
  score += configuredConditions.points;
  confidenceCap = Math.min(confidenceCap, configuredConditions.confidenceCap);
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
  confidence = Math.min(confidence, confidenceCap);
  if (!sourceReady) confidence = Math.min(confidence, 49);
  if (thirdRoots.length > 0) confidence = Math.min(confidence, 69);
  const hasDecisiveBlocker = blockers.some((blocker) =>
    SPIRITUAL_ROOT_RULES.mutationSource.decisiveBlockerPatterns.some((pattern) => blocker.includes(pattern)));
  if (hasDecisiveBlocker) confidence = Math.min(confidence, 64);
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

interface EvaluatedMutation {
  rule: MutationRule;
  candidate: MutationCandidate;
}

function statusFromConfidence(confidence: number): MutationCandidate["status"] {
  const statusRules = SPIRITUAL_ROOT_RULES.mutationStatus;
  return confidence >= statusRules.confirmed ? "confirmed"
    : confidence >= statusRules.likely ? "likely"
      : confidence >= statusRules.possible ? "possible" : "rejected";
}

function enforceSelectionGroups(entries: EvaluatedMutation[]): EvaluatedMutation[] {
  const grouped = new Map<NonNullable<MutationRule["selectionGroup"]>, EvaluatedMutation[]>();
  for (const entry of entries) {
    if (!entry.rule.selectionGroup || entry.candidate.status !== "confirmed") continue;
    const group = grouped.get(entry.rule.selectionGroup) ?? [];
    group.push(entry);
    grouped.set(entry.rule.selectionGroup, group);
  }

  for (const group of grouped.values()) {
    if (group.length < 2) continue;
    const strategy = group[0].rule.selectionStrategy ?? "priority";
    const [winner, ...alternatives] = group.sort((a, b) => strategy === "confidence"
      ? b.candidate.confidence - a.candidate.confidence ||
        b.candidate.score - a.candidate.score ||
        b.rule.priority - a.rule.priority
      : b.rule.priority - a.rule.priority ||
        b.candidate.confidence - a.candidate.confidence ||
        b.candidate.score - a.candidate.score);
    for (const alternative of alternatives) {
      const confidence = Math.min(
        alternative.candidate.confidence,
        SPIRITUAL_ROOT_RULES.mutationStatus.confirmed - 1,
      );
      alternative.candidate = {
        ...alternative.candidate,
        confidence,
        status: statusFromConfidence(confidence),
        blockers: [
          ...alternative.candidate.blockers,
          `동일 원재료에서는 ${winner.candidate.name} 계열의 성립도가 더 높음`,
        ],
      };
    }
  }
  return entries;
}

export function detectMutationRoots(context: AnalysisContext): MutationCandidate[] {
  return enforceSelectionGroups(MUTATION_RULES.map((rule) => ({ rule, candidate: evaluateRule(rule, context) })))
    .sort((a, b) => {
      const statusDelta = MUTATION_STATUS_RANK[b.candidate.status] - MUTATION_STATUS_RANK[a.candidate.status];
      if (statusDelta !== 0) return statusDelta;
      // 같은 원재료에서 갈라지는 변이 계열만 설정 우선순위로 판별한다.
      // 서로 다른 계열은 충족도가 높은 후보를 앞세워 불필요한 간섭을 막는다.
      if (a.candidate.status === "confirmed" && a.rule.selectionGroup && a.rule.selectionGroup === b.rule.selectionGroup) {
        return b.rule.priority - a.rule.priority || b.candidate.confidence - a.candidate.confidence;
      }
      return b.candidate.confidence - a.candidate.confidence || b.rule.priority - a.rule.priority;
    })
    .map(({ candidate }) => candidate);
}

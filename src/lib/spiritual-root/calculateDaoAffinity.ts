import type { BranchRelations, Element, FourPillars } from "@/types/bazi";
import type { DaoAffinityResult, DaoContribution, ElementEvidence } from "@/types/spiritualRoot";
import { ELEMENTS, generatorOf } from "@/lib/bazi/elementMeta";
import { seasonFromMonthBranch } from "@/lib/calendar/solarTerms";
import { SEASON_EXTREME_WEAK, SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";

function rounded(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateDaoAffinity(
  pillars: FourPillars,
  evidence: Record<Element, ElementEvidence>,
  relations: BranchRelations,
): DaoAffinityResult {
  const contributions: DaoContribution[] = [];
  const natural = SPIRITUAL_ROOT_RULES.daoAffinity.natural;
  const defiant = SPIRITUAL_ROOT_RULES.daoAffinity.defiant;
  const add = (path: DaoContribution["path"], label: string, value: number, reason: string) => {
    if (value !== 0) contributions.push({ path, label, value, reason });
  };

  const dayElement = pillars.day.stemElement;
  const day = evidence[dayElement];
  const season = seasonFromMonthBranch(pillars.month.branch);
  const generator = evidence[generatorOf(dayElement)];
  const strongElements = ELEMENTS.filter((element) => evidence[element].structuralEligible);
  const rootedVisible = ELEMENTS.filter((element) =>
    evidence[element].rootStrength >= SPIRITUAL_ROOT_RULES.roots.visibleConnectionMinimum &&
    evidence[element].visibleStems.length > 0).length;
  const scores = ELEMENTS.map((element) => evidence[element].score).sort((a, b) => b - a);
  const spread = scores[0] - scores.at(-1)!;
  const dominantGap = scores[0] - scores[1];
  const generatingLinks = ELEMENTS.filter((element) =>
    evidence[element].contributions.some((item) => item.label.includes(" 유통"))).length;
  const mediationCount = ELEMENTS.filter((element) =>
    evidence[element].contributions.some((item) => item.label.includes("실질 통관"))).length;
  const transformedStemCount = ELEMENTS.filter((element) =>
    evidence[element].combinations.includes("천간합화")).length;
  const fullFormations = relations.combinations.length + relations.directionalCombinations.length;
  const conflictCount = relations.clashes.length + relations.punishments.length + relations.harms.length + relations.breaks.length;
  const rootedDay = day.rootStrength >= SPIRITUAL_ROOT_RULES.roots.dayMasterMinimum;
  const rescued = rootedDay && (day.supportScore > 0 || generator.structuralEligible);
  const hostileSeason = SEASON_EXTREME_WEAK[season] === dayElement;
  const defiantQualified = hostileSeason || spread >= 16 || dominantGap >= 8 ||
    (relations.dynamicCount >= 4 && rescued);

  if (day.monthCommand) add("natural", "득령", natural.monthCommand, "일간 오행이 월령의 본기를 얻었습니다.");
  add("natural", "득지", Math.min(day.rootStrength, 3) * natural.dayRoot, `일간의 가중 통근 강도가 ${day.rootStrength.toFixed(1)}입니다.`);
  if (day.supportScore > 0 || generator.structuralEligible) add("natural", "생조", natural.daySupport, "일간을 생하는 인성 기운이 실제 세력을 갖췄습니다.");
  add("natural", "투간통근", Math.min(rootedVisible, 5) * natural.visibleAndRooted, `${rootedVisible}개 오행이 천간과 지지를 함께 잇습니다.`);
  add("natural", "상생유통", Math.min(generatingLinks, 5) * natural.generatingLink, `${generatingLinks}개의 상생 고리가 이어집니다.`);
  if (generatingLinks === 5) add("natural", "오행순환", natural.completeCycle, "목화토금수의 상생 고리가 완성됩니다.");
  add("natural", "합국", Math.min(fullFormations, 2) * natural.fullFormation, `삼합·방합 ${fullFormations}건이 기세를 모읍니다.`);
  add("natural", "반합", Math.min(relations.halfCombinations.length, 2) * natural.halfFormation, `반합 ${relations.halfCombinations.length}건이 흐름을 보조합니다.`);
  add("natural", "천간합화", Math.min(transformedStemCount, 2) * natural.stemCombination, `인접성과 월령 조건을 갖춘 천간합화 ${transformedStemCount}건이 결속을 만듭니다.`);
  add("natural", "통관", Math.min(mediationCount, 2) * natural.mediation, `${mediationCount}개 오행이 상극 사이를 생으로 이어 줍니다.`);
  if (strongElements.length >= 3 && spread <= 12) add("natural", "청화", natural.clearBalance, "여러 오행이 지나친 편중 없이 역할을 나눕니다.");
  if (relations.dynamicCount === 0) add("natural", "정기", natural.quietStructure, "충형파해가 적어 기맥이 안정적입니다.");
  else add("natural", "충극손상", Math.max(natural.conflictPenalty * conflictCount, -12), `충·형·파·해 ${conflictCount}건이 순행을 흔듭니다.`);
  if (!rootedDay) add("natural", "무근", natural.rootlessPenalty, "일간의 본·중·여기 가중 통근이 유효 기준에 미치지 못했습니다.");

  if (hostileSeason) add("defiant", "역령", defiant.hostileSeason, "일간이 계절적으로 극쇠한 때 태어나 월령의 흐름을 거스릅니다.");
  if (!day.monthCommand) add("defiant", "비득령", defiant.againstCommand, "일간이 월령을 얻지 않고 다른 세력으로 버팁니다.");
  add("defiant", "역근", Math.min(day.rootStrength, 3) * defiant.dayRoot, `불리한 기세 속에서도 일간이 ${day.rootStrength.toFixed(1)}의 가중 뿌리를 유지합니다.`);
  if (day.supportScore > 0 || generator.structuralEligible) add("defiant", "구원", defiant.daySupport, "생조 기운이 역세를 돌파할 구원 통로가 됩니다.");
  if (spread >= 16) add("defiant", "편기집중", defiant.extremeDominance, `최강·최약 오행의 차가 ${spread.toFixed(1)}점으로 한 기세가 극도로 집중됩니다.`);
  if (dominantGap >= 8) add("defiant", "독기돌파", defiant.dominantGap, `최강 오행이 차순위보다 ${dominantGap.toFixed(1)}점 앞서 독자 기맥을 만듭니다.`);
  add("defiant", "동세", Math.min(relations.dynamicCount, 6) * defiant.dynamicStructure, `충형파해의 동적 지수 ${relations.dynamicCount}가 기맥을 격동시킵니다.`);
  if (conflictCount > 0 && rescued) add("defiant", "충중유구", defiant.rescuedConflict, "충극 속에서도 통근과 생조가 남아 끊긴 기맥을 다시 잇습니다.");
  add("defiant", "화국전세", Math.min(fullFormations, 2) * defiant.formation, `합국 ${fullFormations}건이 기존 계절 기세를 전환합니다.`);
  if (hostileSeason && day.score >= 10) add("defiant", "역세득세", defiant.strengthAgainstSeason, "계절적으로 극쇠하지만 일간 오행이 높은 실점수를 확보했습니다.");
  if (day.controlPenalty < 0 && rootedDay) add("defiant", "극중유근", defiant.controlledButRooted, "강한 극을 받으면서도 일간의 유효 뿌리가 남아 있습니다.");
  if (!rootedDay) add("defiant", "무근", defiant.rootlessPenalty, "역천의 기반이 될 가중 통근이 부족합니다.");

  const naturalScore = rounded(contributions.filter((item) => item.path === "natural").reduce((sum, item) => sum + item.value, 0));
  const defiantScore = rounded(contributions.filter((item) => item.path === "defiant").reduce((sum, item) => sum + item.value, 0));
  const path = defiantQualified && defiantScore > naturalScore ? "defiant" : "natural";
  const score = path === "natural" ? naturalScore : defiantScore;
  const reasons = contributions.filter((item) => item.path === path)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 5)
    .map((item) => `${item.label}: ${item.reason}`);

  return { path, naturalScore, defiantScore, score, contributions, reasons };
}

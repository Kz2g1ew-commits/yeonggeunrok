import type { Element, FourPillars } from "@/types/bazi";
import type { ElementEvidence, RootChannelEvidence, RootChannelState } from "@/types/spiritualRoot";
import { CONTROLS, ELEMENTS, GENERATES } from "@/lib/bazi/elementMeta";
import { SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";

const rules = SPIRITUAL_ROOT_RULES.channelGates;

function rounded(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamped(value: number, minimum = 0, maximum = 1): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function normalizedStrength(value: number, scale: number): number {
  return value <= 0 ? 0 : 1 - Math.exp(-value / scale);
}

function channelState(
  heaven: boolean,
  earth: boolean,
  human: boolean,
  integrity: boolean,
  activation: boolean,
): RootChannelState {
  if (heaven && earth && human && integrity && activation) return "complete";
  if (heaven && earth && human && (!integrity || !activation)) return "sealed";
  if (earth && human && !heaven) return "hidden";
  if (heaven && human && !earth) return "floating";
  if (heaven && earth && !human) return "external";
  if ([heaven, earth, human].filter(Boolean).length >= 2) return "latent";
  return "dormant";
}

function humanRelationScore(element: Element, dayElement: Element): { score: number; reason: string } {
  if (element === dayElement) return { score: 3, reason: "일간과 동기하여 인체가 직접 수용함" };
  if (GENERATES[element] === dayElement) return { score: 2.5, reason: "해당 오행이 일간을 생하여 단전에 공급함" };
  if (GENERATES[dayElement] === element) return { score: 2, reason: "일간에서 해당 오행으로 기운이 발출됨" };
  if (CONTROLS[dayElement] === element) return { score: 1.5, reason: "일간이 해당 오행을 다스리는 통로가 있음" };
  return { score: 1, reason: "해당 오행이 일간을 극하여 별도 통관이 필요함" };
}

export function calculateRootChannels(
  pillars: FourPillars,
  evidence: Record<Element, ElementEvidence>,
): Record<Element, ElementEvidence> {
  const dayElement = pillars.day.stemElement;
  const elementScores = ELEMENTS.map((element) => evidence[element].score);
  const maximumScore = Math.max(...elementScores);
  const scoreSpread = maximumScore - Math.min(...elementScores);

  return Object.fromEntries(ELEMENTS.map((element) => {
    const item = evidence[element];
    const heavenReasons: string[] = [];
    const earthReasons: string[] = [];
    const humanReasons: string[] = [];
    const hasFullFormation = item.combinations.includes("삼합") || item.combinations.includes("방합");
    const hasTransformedStem = item.combinations.includes("천간합화");
    const hasFlow = item.contributions.some(({ label }) => label.includes(" 유통"));
    const hasMediation = item.contributions.some(({ label }) => label.includes("실질 통관"));
    const hasTrace = item.visibleStems.length > 0 || item.rootStrength > 0 || item.monthCommand || item.combinations.length > 0;
    const hasEarthTrace = item.rootStrength > 0 || item.monthCommand || hasFullFormation;
    const dominantGap = maximumScore - item.score;
    const collectiveFlow = hasTrace && hasEarthTrace && item.presenceScore > 0 &&
      // 전체 유통은 잠재 활성 역치와 실제 지근을 갖춘 기맥만 보조한다.
      item.score >= SPIRITUAL_ROOT_RULES.structure.potentialScore &&
      dominantGap < SPIRITUAL_ROOT_RULES.structure.collectiveMaximumSpread &&
      (item.score >= rules.activationMinimum ||
        scoreSpread <= SPIRITUAL_ROOT_RULES.structure.collectiveBuriedMaximumSpread ||
        (item.score >= SPIRITUAL_ROOT_RULES.structure.potentialScore &&
          dominantGap < SPIRITUAL_ROOT_RULES.structure.collectiveModerateGap &&
          !(scoreSpread > SPIRITUAL_ROOT_RULES.structure.collectiveHostileSpread && item.seasonalStrength < 0)));

    let heavenScore = 0;
    if (item.visibleStems.length > 0) {
      const value = Math.min(5.5, 2.5 + Math.max(0, item.visibleStems.length - 1));
      heavenScore += value;
      heavenReasons.push(`천간 ${item.visibleStems.length}자가 투출하여 천문을 엶 +${value}`);
    }
    if (item.monthCommand) {
      heavenScore += 1.5;
      heavenReasons.push("월령의 기운이 감응을 보조함 +1.5");
    }
    if (hasFullFormation) {
      heavenScore += 2.5;
      heavenReasons.push("완성 합국이 지기의 외부 발현을 만듦 +2.5");
    }
    if (hasTransformedStem) {
      heavenScore += 2;
      heavenReasons.push("성립한 천간합화가 새 천문을 만듦 +2");
    }
    if (hasFlow) {
      heavenScore += 1;
      heavenReasons.push("상생 유통이 감응 통로를 이어 줌 +1");
    }
    if (item.rootStrength >= 1.2 && item.score >= 4) {
      heavenScore += 1.25;
      heavenReasons.push("강한 내부 뿌리가 천문 가까이 솟음 +1.25");
    }
    if (collectiveFlow && heavenScore < rules.heavenMinimum) {
      const value = rounded(rules.heavenMinimum - heavenScore);
      heavenScore += value;
      heavenReasons.push(`비극단 명식의 전체 유통이 천문을 간접 개방함 +${value}`);
    }

    let earthScore = Math.min(6, item.rootStrength * 2.5);
    if (item.rootStrength > 0) earthReasons.push(`가중 통근 ${item.rootStrength.toFixed(1)}가 지기를 저장함 +${rounded(earthScore)}`);
    if (item.monthCommand) {
      earthScore += 1.5;
      earthReasons.push("월지 본기가 지근을 굳힘 +1.5");
    }
    if (hasFullFormation) {
      earthScore += 2;
      earthReasons.push("완성 합국이 공동 지근을 형성함 +2");
    }
    if (item.rootDetails.length > 0 && item.rootDetails.every(({ damaged }) => damaged)) {
      earthScore = Math.max(0, earthScore - 0.75);
      earthReasons.push("모든 뿌리가 충손되어 지근이 약화됨 -0.75");
    }
    if (collectiveFlow && earthScore < rules.earthMinimum) {
      const value = rounded(rules.earthMinimum - earthScore);
      earthScore += value;
      earthReasons.push(`전체 유통이 미약한 지근을 공동 지맥에 연결함 +${value}`);
    }

    const relation = humanRelationScore(element, dayElement);
    let humanScore = relation.score;
    humanReasons.push(`${relation.reason} +${relation.score}`);
    if (item.supportScore > 0) {
      humanScore += 1;
      humanReasons.push("성립한 생조가 인맥을 보강함 +1");
    }
    if (hasFlow) {
      humanScore += 1;
      humanReasons.push("상생 유통이 단전 순환을 이음 +1");
    }
    if (hasMediation) {
      humanScore += 1;
      humanReasons.push("통관이 상극 사이의 인맥을 이음 +1");
    }
    if (item.visibleStems.length > 0 && item.rootStrength >= SPIRITUAL_ROOT_RULES.roots.visibleConnectionMinimum) {
      humanScore += 0.5;
      humanReasons.push("투간과 통근이 직접 연결됨 +0.5");
    }
    if (collectiveFlow && humanScore < rules.humanMinimum) {
      const value = rounded(rules.humanMinimum - humanScore);
      humanScore += value;
      humanReasons.push(`전체 유통이 일간과의 간접 인맥을 이음 +${value}`);
    }

    let integrity = 1;
    if (item.rootDetails.length > 0 && item.rootDetails.every(({ damaged }) => damaged)) integrity -= 0.25;
    if (item.controlPenalty < 0) integrity -= Math.min(0.3, Math.abs(item.controlPenalty) * 0.1);
    if (item.combinations.includes("천간합·불화")) integrity -= 0.15;
    if (item.contributions.some(({ label }) => label.includes("완전 합화로 원래 오행"))) integrity -= 0.3;
    if (item.score < 0) integrity -= 0.2;
    integrity = rounded(clamped(integrity));

    heavenScore = rounded(heavenScore);
    earthScore = rounded(earthScore);
    humanScore = rounded(humanScore);
    const heavenPassed = heavenScore >= rules.heavenMinimum;
    const earthPassed = earthScore >= rules.earthMinimum;
    const humanPassed = humanScore >= rules.humanMinimum;
    const integrityPassed = integrity >= rules.integrityMinimum;
    const activationPassed = item.score >= rules.activationMinimum || collectiveFlow;
    const state = channelState(heavenPassed, earthPassed, humanPassed, integrityPassed, activationPassed);
    const complete = state === "complete";
    const potential = !complete && state !== "dormant";

    const normalizedParts = [
      normalizedStrength(heavenScore, rules.strongHeaven),
      normalizedStrength(earthScore, rules.strongEarth),
      normalizedStrength(humanScore, rules.strongHuman),
      integrity,
      normalizedStrength(item.score, rules.strongActivation),
    ];
    const bottleneck = Math.min(...normalizedParts);
    const average = normalizedParts.reduce((sum, value) => sum + value, 0) / normalizedParts.length;
    const completion = rounded((bottleneck * rules.bottleneckWeight + average * rules.averageWeight) * 100);
    const gateLabels = [heavenPassed ? "천문" : "천문 미달", earthPassed ? "지근" : "지근 미달", humanPassed ? "인맥" : "인맥 미달"];
    const reasons = [
      `${gateLabels.join("·")} · 완성도 ${completion.toFixed(1)}`,
      !integrityPassed ? "합충극제로 기맥 보존성이 부족함" : !activationPassed ? "세 관문은 이어졌으나 활성도가 부족함" : complete ? "천·지·인 삼관이 모두 이어짐" : "두 관문 이상이 이어진 잠재 통로",
    ];
    const channel: RootChannelEvidence = {
      heaven: { score: heavenScore, passed: heavenPassed, reasons: heavenReasons },
      earth: { score: earthScore, passed: earthPassed, reasons: earthReasons },
      human: { score: humanScore, passed: humanPassed, reasons: humanReasons },
      integrity,
      completion,
      state,
      complete,
      potential,
      reasons,
    };

    return [element, {
      ...item,
      structuralEligible: complete,
      eligibilityReasons: complete ? reasons : [],
      potentialReasons: potential ? reasons : [],
      channel,
    }];
  })) as Record<Element, ElementEvidence>;
}

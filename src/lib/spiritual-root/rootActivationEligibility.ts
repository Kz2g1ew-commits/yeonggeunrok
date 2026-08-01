import type { ElementEvidence } from "@/types/spiritualRoot";
import { SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";

/**
 * 유연 판정의 최소 활성 기반이다. 일반 잠재 역치에 못 미쳐도 0점을 넘는
 * 활성과 실제 통근이 함께 남아 있으면 전체 유통의 도움을 받을 수 있다.
 */
export function hasEffectiveActivationBasis(item: ElementEvidence): boolean {
  if (item.score >= SPIRITUAL_ROOT_RULES.structure.potentialScore) return true;

  return item.score > SPIRITUAL_ROOT_RULES.thresholds.groundedTraceFloor && item.rootStrength > 0;
}

import type { Element } from "@/types/bazi";
import type { ElementEvidence } from "@/types/spiritualRoot";
import { ELEMENTS } from "@/lib/bazi/elementMeta";
import { SPIRITUAL_ROOT_RULES } from "./spiritualRootRules";

export function determineEffectiveRoots(
  rawEvidence: Record<Element, ElementEvidence>,
  awakeningPassed = true,
): {
  evidence: Record<Element, ElementEvidence>;
  effective: Element[];
  potential: Element[];
} {
  const evidence = Object.fromEntries(ELEMENTS.map((element) => {
    const item = rawEvidence[element];
    const hasChannel = item.visibleStems.length > 0 || item.roots.length > 0 || item.monthCommand || item.combinations.length > 0;
    const channelReady = item.score >= SPIRITUAL_ROOT_RULES.thresholds.generousChannel && hasChannel;
    const potential = !awakeningPassed
      ? channelReady
      : !channelReady && item.score >= SPIRITUAL_ROOT_RULES.thresholds.sealedPotential && hasChannel;
    return [element, { ...item, effective: awakeningPassed && channelReady, potential }];
  })) as Record<Element, ElementEvidence>;

  return {
    evidence,
    effective: ELEMENTS.filter((element) => evidence[element].effective)
      .sort((a, b) => evidence[b].score - evidence[a].score),
    potential: ELEMENTS.filter((element) => evidence[element].potential)
      .sort((a, b) => evidence[b].score - evidence[a].score),
  };
}

import type { Element } from "@/types/bazi";
import type { ElementEvidence } from "@/types/spiritualRoot";
import { ELEMENTS } from "@/lib/bazi/elementMeta";

export function determineEffectiveRoots(evidence: Record<Element, ElementEvidence>): {
  effective: Element[];
  potential: Element[];
} {
  return {
    effective: ELEMENTS.filter((element) => evidence[element].effective)
      .sort((a, b) => evidence[b].score - evidence[a].score),
    potential: ELEMENTS.filter((element) => evidence[element].potential)
      .sort((a, b) => evidence[b].score - evidence[a].score),
  };
}

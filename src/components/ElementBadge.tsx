import { Flame, Mountain, Sprout, Sword, Waves } from "lucide-react";
import type { Element } from "@/types/bazi";
import { ELEMENT_META } from "@/lib/bazi/elementMeta";

const ICONS = { wood: Sprout, fire: Flame, earth: Mountain, metal: Sword, water: Waves };

export function ElementBadge({ element, compact = false }: { element: Element; compact?: boolean }) {
  const meta = ELEMENT_META[element];
  const Icon = ICONS[element];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[.035] font-bold ${compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1.5 text-xs"}`} style={{ color: meta.color }}>
      <Icon size={compact ? 11 : 13} aria-hidden="true" /><span>{meta.label} {meta.hanja}</span>
    </span>
  );
}

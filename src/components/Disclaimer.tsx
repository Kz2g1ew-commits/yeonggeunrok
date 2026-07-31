import { Info } from "lucide-react";

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`flex gap-3 rounded-xl border border-[#d8b66a]/15 bg-[#d8b66a]/5 text-[#b9c5ca] ${compact ? "p-3 text-xs" : "p-4 text-sm"}`}>
      <Info className="mt-0.5 size-4 shrink-0 text-[#d8b66a]" aria-hidden="true" />
      <p className="leading-6">영근록은 사주에 기반한 선협식 영근 판별이며 유희적 용도로만 사용합니다.</p>
    </aside>
  );
}

import { Info } from "lucide-react";

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`flex gap-3 rounded-xl border border-[#d8b66a]/15 bg-[#d8b66a]/5 text-[#b9c5ca] ${compact ? "p-3 text-xs" : "p-4 text-sm"}`}>
      <Info className="mt-0.5 size-4 shrink-0 text-[#d8b66a]" aria-hidden="true" />
      <p className="leading-6">본 서비스는 전통 명리학의 간지·오행 체계를 선협 소설의 영근 설정과 결합한 창작·오락용 분석 도구입니다. 실제 운명, 건강, 재산, 관계 또는 미래를 판단하거나 보장하지 않습니다.</p>
    </aside>
  );
}

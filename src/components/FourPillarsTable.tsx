import type { FourPillars } from "@/types/bazi";
import { STEMS, stemKorean } from "@/lib/bazi/stems";
import { BRANCHES, branchKorean } from "@/lib/bazi/branches";
import { ElementBadge } from "./ElementBadge";

const columns = ["year", "month", "day", "hour"] as const;
const labels = { year: "연주", month: "월주", day: "일주", hour: "시주" };

export function FourPillarsTable({ pillars }: { pillars: FourPillars }) {
  return (
    <div className="surface overflow-hidden">
      <div className="border-b border-white/6 px-5 py-4 sm:px-6"><span className="eyebrow">Four pillars</span><h2 className="section-title mt-2">사주팔자 四柱八字</h2></div>
      <div className="overflow-x-auto p-3 sm:p-5">
        <table className="w-full min-w-[520px] table-fixed border-separate border-spacing-1 text-center">
          <thead><tr><th className="w-16 p-2 text-xs text-[#728891]">구분</th>{columns.map((key) => <th key={key} className="p-2 text-xs font-bold text-[#b8c5ca]">{labels[key]}</th>)}</tr></thead>
          <tbody>
            <tr><th className="text-xs text-[#728891]">천간</th>{columns.map((key) => { const stem = pillars[key].stem; return <td key={key} className="rounded-t-xl border border-white/7 bg-white/[.025] p-3"><span className="display-serif block text-3xl" style={{ color: ({ wood: "#62c6a5", fire: "#f47d6d", earth: "#d6a85f", metal: "#c4d0dd", water: "#6daeea" })[STEMS[stem].element] }}>{stem}</span><span className="mt-1 block text-[11px] text-[#80949c]">{stemKorean(stem)} · {STEMS[stem].yinYang === "yang" ? "양" : "음"}</span></td>})}</tr>
            <tr><th className="text-xs text-[#728891]">지지</th>{columns.map((key) => { const branch = pillars[key].branch; return <td key={key} className="border border-white/7 bg-white/[.025] p-3"><span className="display-serif block text-3xl" style={{ color: ({ wood: "#62c6a5", fire: "#f47d6d", earth: "#d6a85f", metal: "#c4d0dd", water: "#6daeea" })[BRANCHES[branch].element] }}>{branch}</span><span className="mt-1 block text-[11px] text-[#80949c]">{branchKorean(branch)} · {BRANCHES[branch].yinYang === "yang" ? "양" : "음"}</span></td>})}</tr>
            <tr><th className="text-xs text-[#728891]">오행</th>{columns.map((key) => <td key={key} className="rounded-b-xl border border-white/7 bg-white/[.025] px-2 py-3"><div className="flex justify-center gap-1"><ElementBadge element={pillars[key].stemElement} compact /><span className="text-[#586e77]">/</span><ElementBadge element={pillars[key].branchElement} compact /></div></td>)}</tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

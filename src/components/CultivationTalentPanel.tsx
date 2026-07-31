import { Brain, Clover, Dna, Ghost, Sparkles, Swords } from "lucide-react";
import type { ShenshaResult } from "@/types/bazi";
import type { CultivationTalentProfile, TalentDimensionId } from "@/types/spiritualRoot";

const DIMENSION_ICON = {
  rootBone: Dna,
  insight: Brain,
  combat: Swords,
  soul: Ghost,
  providence: Clover,
} satisfies Record<TalentDimensionId, typeof Dna>;

const CATEGORY_LABEL = {
  noble: "귀인·덕성",
  scholar: "오성·현학",
  martial: "전투·동세",
  mystic: "신혼·비술",
  mobility: "신법·이동",
  charisma: "매혹·교섭",
};

export function CultivationTalentPanel({ profile, shensha }: { profile: CultivationTalentProfile; shensha: ShenshaResult[] }) {
  const present = shensha.filter((item) => item.present);
  return (
    <section className="surface overflow-hidden">
      <div className="border-b border-white/6 p-5 sm:p-7">
        <span className="eyebrow">Cultivation aptitude</span>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="section-title">선협 재능 종합 · {profile.title}</h2><p className="muted mt-2 max-w-3xl text-sm leading-7">{profile.summary}</p></div>
          <span className="rounded-full border border-[#d8b66a]/20 bg-[#d8b66a]/7 px-3 py-1.5 text-[11px] font-bold text-[#e5c97f]">영근·신살 분리 판정</span>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-5">
        {Object.values(profile.dimensions).map((dimension) => {
          const Icon = DIMENSION_ICON[dimension.id];
          return <article key={dimension.id} className="surface-soft p-4">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-bold text-[#aebdc2]"><Icon size={14} className="text-[#d8b66a]" />{dimension.name}</span><strong className="display-serif text-xl text-[#efd48d]">{dimension.score}</strong></div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-[#567fa4] via-[#62c6a5] to-[#d8b66a]" style={{ width: `${dimension.score}%` }} /></div>
            <strong className="mt-3 block text-sm text-[#dce3e3]">{dimension.label}</strong>
            <p className="mt-1 text-[11px] leading-5 text-[#7f939b]">{dimension.description}</p>
          </article>;
        })}
      </div>

      {profile.specialEffects.length > 0 && <div className="border-t border-white/6 px-5 py-6 sm:px-7">
        <h3 className="flex items-center gap-2 font-bold text-[#e7dcc0]"><Sparkles size={16} className="text-[#d8b66a]" />특수 재능 효과</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {profile.specialEffects.map((effect) => <article key={effect.id} className="rounded-xl border border-[#d8b66a]/14 bg-[#d8b66a]/[.035] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><strong className="display-serif text-lg text-[#efd9a4]">{effect.name}</strong><span className="text-[10px] font-bold text-[#9badb5]">{{ uncommon: "비범", rare: "희귀", "very-rare": "극희귀", mythic: "신화" }[effect.rarity]}</span></div>
            <p className="mt-2 text-xs leading-6 text-[#aebdc2]">{effect.description}</p>
            <p className="mt-2 text-[11px] leading-5 text-[#789099]">근거 · {effect.evidence.join(" · ")}</p>
            <p className="mt-1 text-[11px] leading-5 text-[#9fc0b7]">효과 · {effect.effects.join(" · ")}</p>
          </article>)}
        </div>
      </div>}

      <div className="border-t border-white/6 px-5 py-6 sm:px-7">
        <h3 className="font-bold text-[#e7dcc0]">적용된 신살과 수련 전환</h3>
        {present.length ? <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{present.map((item) => <details key={item.id} className="surface-soft p-4">
          <summary className="cursor-pointer list-none"><span className="text-[10px] font-bold text-[#758b94]">{CATEGORY_LABEL[item.category]}</span><strong className="mt-1 block text-sm text-[#dce3e3]">{item.name}</strong><p className="mt-2 text-xs leading-5 text-[#93a6ad]">{item.traits.slice(0, 4).join(" · ")}</p></summary>
          <div className="mt-3 border-t border-white/6 pt-3 text-[11px] leading-5 text-[#80949b]"><p>판정 근거 · {item.evidence.join(" / ")}</p><p className="mt-1 text-[#a8c8bd]">추천 · {[...item.paths, ...item.weapons, ...item.techniques].slice(0, 5).join(" · ")}</p>{item.risks.length > 0 && <p className="mt-1 text-[#c2a6a2]">주의 · {item.risks.join(" · ")}</p>}</div>
        </details>)}</div> : <p className="muted mt-3 text-sm">선택한 유파 기준에서 뚜렷하게 성립한 신살 부가 성향이 없습니다.</p>}
        <p className="mt-4 text-xs leading-6 text-[#748991]">신살은 영근 개수와 품질을 바꾸지 않습니다. 근골은 영근 구조, 오성·투골·신혼·기운은 신살의 상징을 선협 설정으로 변환한 값이며 실제 성격·지능·행운을 단정하지 않습니다. 신살 판정은 유파에 따라 달라질 수 있습니다.</p>
      </div>
    </section>
  );
}

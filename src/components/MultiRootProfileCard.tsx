import { Activity, CircleAlert, GitBranch, ShieldCheck, Sparkles } from "lucide-react";
import type { RootClassification } from "@/types/spiritualRoot";
import { ELEMENT_META } from "@/lib/bazi/elementMeta";

export function MultiRootProfileCard({ classification }: { classification: RootClassification }) {
  const profile = classification.multiRootProfile;
  if (!profile) return null;

  const maximumLinks = classification.rootCount === "five" ? 5 : 3;
  return (
    <section className="surface p-5 sm:p-7">
      <span className="eyebrow">Multi-root structure</span>
      <h2 className="section-title mt-2">사·오영근 세부 구조</h2>
      <p className="muted mt-2 text-sm leading-7">{profile.summary}</p>

      <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-white/7 bg-white/7 sm:grid-cols-2 lg:grid-cols-5">
        {[
          [Sparkles, "세부 유형", profile.subtype],
          [Activity, "주도 기맥", `${ELEMENT_META[profile.dominantElement].label} ${profile.scoreSpread.toFixed(1)}점 편차`],
          [GitBranch, "상생 유통", `${profile.generatingLinks.length}/${maximumLinks}고리`],
          [ShieldCheck, "순환 상태", profile.cycleLabel],
          [CircleAlert, "충극 상태", `${profile.conflictLabel} ${profile.conflictCount}건`],
        ].map(([Icon, label, value]) => {
          const C = Icon as typeof Sparkles;
          return <div key={String(label)} className="bg-[#0d1d25] p-4"><span className="flex items-center gap-1.5 text-[11px] font-bold text-[#758b94]"><C size={13} />{String(label)}</span><strong className="mt-2 block text-sm text-[#dce3e3]">{String(value)}</strong></div>;
        })}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="surface-soft p-4">
          <h3 className="font-bold text-[#9fd4c2]">운용 강점</h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#aec2c4]">{profile.strengths.map((item) => <li key={item}>· {item}</li>)}</ul>
        </article>
        <article className="surface-soft p-4">
          <h3 className="font-bold text-[#dfb39b]">결핍과 주의점</h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#c5aeaa]">{profile.cautions.map((item) => <li key={item}>· {item}</li>)}</ul>
        </article>
      </div>
      <p className="mt-4 text-xs leading-6 text-[#748991]">이 세부 유형은 사·오영근의 작동 방식을 구분하는 선협 세계관용 해석이며 실제 성격이나 운명을 뜻하지 않습니다.</p>
    </section>
  );
}

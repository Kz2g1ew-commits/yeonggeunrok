import type { Metadata } from "next";
import { InfoPageShell, InfoSection } from "@/components/InfoPageShell";

export const metadata: Metadata = { title: "변이영근 도감" };

const mutations = [
  ["빙 氷", "금 + 수", "금생수, 한습한 월령, 수의 통근, 약한 화", "강한 화국·조열"],
  ["뇌 雷", "목 + 화", "목생화, 충·형·역마의 동성, 균형", "과다한 토·강한 수"],
  ["풍 風", "수 + 목 / 목 + 화", "목기, 인·묘, 이동성", "토의 심한 정체"],
  ["독 毒", "수 + 목 / 목 + 토", "음습, 형·해, 비정상 결합", "과다한 화"],
  ["용암 熔巖", "화 + 토", "화생토, 사·오·미, 조열", "강한 수"],
  ["암 暗", "수 + 토", "한습, 침잠, 귀문 보조", "강한 화"],
  ["광 光", "화 + 금", "직접 충이 없는 방출·응축의 균형, 잠재 토 완충", "강한 수·직접 충·과도한 동세"],
  ["자뢰 紫雷", "화 + 금", "화금 상극, 충, 토의 완충", "완충 없는 기맥"],
  ["검 劍", "목 + 금", "금목 균형, 인·신 또는 묘·유 충, 양쪽 통근", "재생근·정련근 부족, 강한 화기"],
] as const;

export default function MutationsPage() {
  return <InfoPageShell eyebrow="Mutation archive" title="변이영근 도감" intro="두 오행이 있다는 이유만으로 변이가 되지는 않습니다. 유효한 원재료, 관계의 강도, 계절의 지지, 점수 균형과 방해 요소를 함께 확인합니다.">
    <section className="grid gap-4 md:grid-cols-2">{mutations.map(([name, source, condition, blocker], index) => <article key={name} className="surface p-5 sm:p-6"><div className="flex items-start justify-between"><div><span className="text-[10px] font-bold tracking-[.18em] text-[#7b9098]">ARCHIVE {String(index + 1).padStart(2, "0")}</span><h2 className="display-serif mt-2 text-2xl text-[#efdfb7]">{name}</h2></div><span className="rounded-full border border-[#d8b66a]/15 bg-[#d8b66a]/5 px-3 py-1 text-xs font-bold text-[#d8bf7b]">{source}</span></div><p className="muted mt-5 text-sm leading-7"><strong className="text-[#73c7aa]">권장</strong> · {condition}</p><p className="mt-2 text-sm leading-7 text-[#bd918c]"><strong>방해</strong> · {blocker}</p></article>)}</section>
    <InfoSection title="네 단계의 판정"><p><strong className="text-[#e0ce9f]">확정</strong>은 원재료 두 영근이 완전히 융합해 변이 단영근으로 작동하는 상태입니다. 그 아래는 유력, 가능성, 불성립으로 나뉩니다. 제3 유효 영근이 독립적으로 강하면 확정을 막으며, 기본 이영근이나 삼영근에 변이 후보를 덧붙여 표시합니다.</p></InfoSection>
  </InfoPageShell>;
}

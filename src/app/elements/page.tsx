import type { Metadata } from "next";
import { Flame, Mountain, Sprout, Sword, Waves } from "lucide-react";
import { InfoPageShell, InfoSection } from "@/components/InfoPageShell";

export const metadata: Metadata = { title: "오행과 영근" };

const elements = [
  [Sprout, "목 木", "갑·을 / 인·묘", "생장, 유연함, 치유와 속박", "목계 생장공·풍계 신법"],
  [Flame, "화 火", "병·정 / 사·오", "방출, 변화, 열과 밝음", "화계 연화공·연단술"],
  [Mountain, "토 土", "무·기 / 진·술·축·미", "안정, 수용, 질량과 결계", "토계 호체공·진법"],
  [Sword, "금 金", "경·신 / 신·유", "응축, 결단, 절단과 정련", "검계 공법·비검술"],
  [Waves, "수 水", "임·계 / 해·자", "유동, 침잠, 지혜와 환영", "수계 유전공·빙계 술법"],
] as const;

export default function ElementsPage() {
  return <InfoPageShell eyebrow="Five elements" title="오행에서 영근으로" intro="오행은 색만으로 구별하지 않습니다. 글자, 이름, 아이콘과 상생·상극 관계를 함께 표시합니다." disclaimer>
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">{elements.map(([Icon, name, mapping, nature, path]) => <article key={name} className="surface p-5"><Icon className="text-[#d8b66a]" /><h2 className="display-serif mt-4 text-2xl text-[#eee2c5]">{name}</h2><p className="mt-2 text-xs font-bold text-[#71858e]">{mapping}</p><p className="muted mt-4 text-sm leading-6">{nature}</p><p className="mt-4 border-t border-white/6 pt-3 text-xs text-[#bfae7e]">{path}</p></article>)}</section>
    <InfoSection title="상생과 상극"><p><strong className="text-[#e0ce9f]">상생:</strong> 목→화→토→금→수→목. 앞 오행이 뒤 오행의 발현을 돕습니다.</p><p className="mt-2"><strong className="text-[#e0ce9f]">상극:</strong> 목→토→수→화→금→목. 제어는 무조건 나쁜 것이 아니지만, 구원 없이 지나치면 영기 통로를 손상시킬 수 있습니다.</p></InfoSection>
    <InfoSection title="지장간은 숨은 재료입니다"><p>지지 속에 감춰진 천간을 본기·중기·여기로 나눕니다. 원국 구성비에서는 숨은 재료의 양을 보존하고, 기맥 활성도에서는 본·중·여기와 자리·충손에 따라 통근 강도를 다르게 계산합니다. 지장간에 희미하게 존재한다는 사실만으로 유효 영근이 되지는 않지만, 투간과 약근이 함께 남으면 계절에 눌린 잠재 영근이 될 수 있습니다.</p></InfoSection>
  </InfoPageShell>;
}

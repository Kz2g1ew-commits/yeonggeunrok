import type { Metadata } from "next";
import { InfoPageShell, InfoSection } from "@/components/InfoPageShell";

export const metadata: Metadata = { title: "영근 판정 기준" };

export default function GuidePage() {
  return <InfoPageShell eyebrow="Judgement guide" title="영근은 어떻게 판정하나요?" intro="오행의 단순 개수가 아니라, 사주 안에서 실제로 뿌리내리고 드러나 영기를 흡수할 통로를 이루는지 평가합니다." disclaimer>
    <InfoSection title="발현은 도맥 점수로 정합니다" marker="一"><p><strong className="text-[#e0ce9f]">유연 판정</strong>은 체험을 위해 항상 발현합니다. <strong className="text-[#e0ce9f]">균형 판정</strong>은 도맥 56.5점 이상으로 표본상 약 15%, <strong className="text-[#e0ce9f]">엄격 판정</strong>은 68.8점 이상으로 약 1%가 통과합니다. 엄격 모드는 오행별 영근 문턱을 높이지 않으므로 천영근 편향이 생기지 않습니다.</p></InfoSection>
    <InfoSection title="순천도맥과 역천도맥" marker="二"><div className="grid gap-3 sm:grid-cols-2"><div><strong className="text-[#9fc0e8]">순천도맥</strong><p className="mt-2">일간의 득령·통근·생조, 천간과 지지의 연결, 오행 상생 유통, 통관, 합국, 청화와 낮은 충극을 평가합니다. 계절과 기세가 자연스럽게 이어져 도를 감응하는 창작 경로입니다.</p></div><div><strong className="text-[#dfc57f]">역천도맥</strong><p className="mt-2">계절적 극쇠와 충형의 압박 속에서도 뿌리·생조·구원이 남거나, 한 기세가 극도로 집중되어 기존 흐름을 뒤집는 구조를 평가합니다. 불리한 명식 구조를 돌파해 도를 얻는 창작 경로입니다.</p></div></div><p className="mt-3 text-xs text-[#778c94]">두 점수 중 높은 경로를 사용하며 해시는 같은 점수대의 동점 보정에만 관여합니다.</p></InfoSection>
    <InfoSection title="오행 점수는 속성의 강약을 정합니다" marker="三"><div className="grid gap-3 sm:grid-cols-2"><ul className="list-disc pl-5"><li>월령과 왕·상·휴·수·사</li><li>일간, 천간 투출, 지지 통근</li><li>지장간 본·중·여기</li><li>삼합·방합·반합과 천간합</li></ul><ul className="list-disc pl-5"><li>상생 유통과 상극 사이 통관</li><li>충·형·파·해의 뿌리 손상</li><li>계절적 쇠약과 강한 극제</li><li>구원 여부와 합거</li></ul></div><p className="mt-3 text-xs text-[#778c94]">점수가 높은 오행부터 주근·부근이 됩니다. 작동 영근의 개수는 별도의 세계관용 순도 배분값으로 정해 확률 목표를 보호합니다.</p></InfoSection>
    <InfoSection title="적을수록 순도가 높습니다" marker="四"><p>품질 서열은 <strong className="text-[#e0ce9f]">천영근 → 변이영근 → 이영근 → 삼영근 → 사영근 → 오영근</strong>입니다. 보유자 기준 목표 비율은 천 1~2%, 변이 4~6%, 이 10~14%, 삼 18~22%, 사 26~30%, 오 30~36%입니다. 변이 배분을 받더라도 원재료와 융합 조건이 부족하면 이영근으로 남습니다.</p></InfoSection>
    <InfoSection title="모호함을 그대로 보여 줍니다" marker="五"><p>도맥 통과선, 절기나 시진 경계, 출생 시각의 불확실성, 비슷한 변이 후보가 있으면 신뢰도를 낮춥니다. 신뢰도는 실제 운세의 정확도가 아니라 이 창작 규칙 안에서 판정이 얼마나 선명한지를 뜻합니다.</p></InfoSection>
  </InfoPageShell>;
}

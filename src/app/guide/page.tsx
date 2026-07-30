import type { Metadata } from "next";
import { InfoPageShell, InfoSection } from "@/components/InfoPageShell";

export const metadata: Metadata = { title: "영근 판정 기준" };

export default function GuidePage() {
  return <InfoPageShell eyebrow="Judgement guide" title="영근은 어떻게 판정하나요?" intro="오행의 단순 개수가 아니라, 사주 안에서 실제로 뿌리내리고 드러나 영기를 흡수할 통로를 이루는지 평가합니다." disclaimer>
    <InfoSection title="발현 여부와 품질을 분리합니다" marker="一"><p><strong className="text-[#e0ce9f]">유연 판정</strong>은 영근이 있다는 전제로 1.5점 이상이며 투출·통근·월령·합국 중 통로가 확인된 오행을 작동 영근으로 봅니다. <strong className="text-[#e0ce9f]">엄격 판정</strong>은 여기에 인구 약 1%의 세계관용 발현 관문을 먼저 적용합니다. 관문 값은 브라우저에서 결정적으로 계산되므로 같은 입력은 항상 같은 결과가 나오며, 전통 명리 규칙이 아닙니다.</p></InfoSection>
    <InfoSection title="점수는 구조를 요약합니다" marker="二"><div className="grid gap-3 sm:grid-cols-2"><ul className="list-disc pl-5"><li>일간과 같은 오행 +3</li><li>월지 본기 +4, 월령 추가 +2</li><li>추가 천간 투출 +2</li><li>지지 본기 +2</li><li>지장간 본·중·여기 +1.5/+1/+0.5</li><li>삼합·방합 +4, 반합 +2</li></ul><ul className="list-disc pl-5"><li>유일한 뿌리의 충 손상 −2</li><li>계절적 극쇠 −1</li><li>구원 없는 강한 극 −2</li><li>천간에만 있고 무근 −1</li><li>합거로 독립 작용 약화 −1</li></ul></div><p className="mt-3 text-xs text-[#778c94]">모든 수치는 설정 파일에서 변경할 수 있으며, 영근 규칙은 전통 명리 규칙과 분리되어 있습니다.</p></InfoSection>
    <InfoSection title="적을수록 순도가 높습니다" marker="三"><p>품질 서열은 <strong className="text-[#e0ce9f]">천영근 → 변이영근 → 이영근 → 삼영근 → 사영근 → 오영근</strong>입니다. 오행 통로가 많으면 적응성은 넓지만 잡기가 섞여 수련 속도가 느려지는 선협식 설정입니다. 천영근은 한 기맥이 압도적인 고순도 구조에서만 성립하며, 변이영근은 균형 잡힌 두 원재료가 강한 융합 조건까지 충족해야 합니다. 혼원오행영근은 오영근 가운데 별도로 표시되는 극희귀 예외형입니다.</p></InfoSection>
    <InfoSection title="모호함을 그대로 보여 줍니다" marker="四"><p>절기나 시진 경계, 출생 시각의 불확실성, 임계점에 걸친 점수, 비슷한 변이 후보가 있으면 신뢰도를 낮추고 복수 후보를 표시합니다. 신뢰도는 실제 운세의 정확도가 아니라 이 규칙 세트 안에서 판정이 얼마나 선명한지를 뜻합니다.</p></InfoSection>
  </InfoPageShell>;
}

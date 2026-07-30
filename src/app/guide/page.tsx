import type { Metadata } from "next";
import { InfoPageShell, InfoSection } from "@/components/InfoPageShell";

export const metadata: Metadata = { title: "영근 판정 기준" };

export default function GuidePage() {
  return <InfoPageShell eyebrow="Judgement guide" title="영근은 어떻게 판정하나요?" intro="오행의 단순 개수가 아니라, 사주 안에서 실제로 뿌리내리고 드러나 영기를 흡수할 통로를 이루는지 평가합니다." disclaimer>
    <InfoSection title="유효 영근의 두 관문" marker="一"><p>먼저 오행별 점수가 4점 이상이어야 합니다. 이어 투출과 통근의 동시 존재, 월령 획득, 삼합·방합 세력, 또는 일간이면서 뿌리·강한 생조를 가진 조건 중 하나를 만족해야 합니다. 2점 이상 4점 미만은 잠재 영근으로만 표시합니다.</p></InfoSection>
    <InfoSection title="점수는 구조를 요약합니다" marker="二"><div className="grid gap-3 sm:grid-cols-2"><ul className="list-disc pl-5"><li>일간과 같은 오행 +3</li><li>월지 본기 +4, 월령 추가 +2</li><li>추가 천간 투출 +2</li><li>지지 본기 +2</li><li>지장간 본·중·여기 +1.5/+1/+0.5</li><li>삼합·방합 +4, 반합 +2</li></ul><ul className="list-disc pl-5"><li>유일한 뿌리의 충 손상 −2</li><li>계절적 극쇠 −1</li><li>구원 없는 강한 극 −2</li><li>천간에만 있고 무근 −1</li><li>합거로 독립 작용 약화 −1</li></ul></div><p className="mt-3 text-xs text-[#778c94]">모든 수치는 설정 파일에서 변경할 수 있으며, 영근 규칙은 전통 명리 규칙과 분리되어 있습니다.</p></InfoSection>
    <InfoSection title="영근 수와 품계" marker="三"><p>유효 영근 0개는 무영근, 1개는 천영근, 2~5개는 각각 이·삼·사·오영근입니다. 천영근은 점수에 따라 하품·중품·상품·극품으로 나눕니다. 이영근은 상생·상극 관계와 균형·편중을 함께 표시하고, 삼영근은 순생 여부, 사영근은 결핍 오행, 오영근은 혼잡·균형·혼원 순환을 구분합니다.</p></InfoSection>
    <InfoSection title="모호함을 그대로 보여 줍니다" marker="四"><p>절기나 시진 경계, 출생 시각의 불확실성, 임계점에 걸친 점수, 비슷한 변이 후보가 있으면 신뢰도를 낮추고 복수 후보를 표시합니다. 신뢰도는 실제 운세의 정확도가 아니라 이 규칙 세트 안에서 판정이 얼마나 선명한지를 뜻합니다.</p></InfoSection>
  </InfoPageShell>;
}

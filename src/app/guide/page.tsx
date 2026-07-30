import type { Metadata } from "next";
import { InfoPageShell, InfoSection } from "@/components/InfoPageShell";

export const metadata: Metadata = { title: "영근 판정 기준" };

export default function GuidePage() {
  return <InfoPageShell eyebrow="Judgement guide" title="영근은 어떻게 판정하나요?" intro="오행의 단순 개수가 아니라, 사주 안에서 실제로 뿌리내리고 드러나 영기를 흡수할 통로를 이루는지 평가합니다." disclaimer>
    <InfoSection title="발현은 도맥 점수로 정합니다" marker="一"><p><strong className="text-[#e0ce9f]">유연 판정</strong>은 체험을 위해 발현 관문을 엽니다. <strong className="text-[#e0ce9f]">균형 판정</strong>은 도맥 47.0점 이상으로 표본상 약 15%, <strong className="text-[#e0ce9f]">엄격 판정</strong>은 62.4점 이상으로 약 1%가 통과합니다. 어느 모드도 구조적으로 무효인 오행을 승격하지 않습니다.</p></InfoSection>
    <InfoSection title="순천도맥과 역천도맥" marker="二"><div className="grid gap-3 sm:grid-cols-2"><div><strong className="text-[#9fc0e8]">순천도맥</strong><p className="mt-2">일간의 득령·통근·생조, 천간과 지지의 연결, 오행 상생 유통, 통관, 합국, 청화와 낮은 충극을 평가합니다. 계절과 기세가 자연스럽게 이어져 도를 감응하는 창작 경로입니다.</p></div><div><strong className="text-[#dfc57f]">역천도맥</strong><p className="mt-2">계절적 극쇠와 충형의 압박 속에서도 뿌리·생조·구원이 남거나, 한 기세가 극도로 집중되어 기존 흐름을 뒤집는 구조를 평가합니다. 불리한 명식 구조를 돌파해 도를 얻는 창작 경로입니다.</p></div></div><p className="mt-3 text-xs text-[#778c94]">역령·극단 편중·강한 동세와 구원 가운데 하나가 실제로 성립해야 역천 경로를 선택하며, 그 전에는 점수가 높아도 순천 경로를 유지합니다. 해시는 같은 점수대의 동점 보정에만 관여합니다.</p></InfoSection>
    <InfoSection title="구성량과 활성도는 다릅니다" marker="三"><p>먼저 4천간과 4지지를 합계 240의 고정 질량으로 환산해 원국 구성비를 보여 줍니다. 그 뒤 월령, 왕·상·휴·수·사, 본·중·여기 통근, 투간, 생조·극제와 합충을 적용해 별도의 기맥 활성도를 냅니다. 따라서 수 구성 17%가 여름의 극제 때문에 활성 2점 미만일 수 있지만, 수가 0%라는 뜻은 아닙니다.</p></InfoSection>
    <InfoSection title="오행 활성은 단계적으로 계산합니다" marker="四"><div className="grid gap-3 sm:grid-cols-2"><ul className="list-disc pl-5"><li>월령과 왕·상·휴·수·사</li><li>본기·중기·여기의 가중 통근</li><li>투간과 뿌리의 실제 연결</li><li>삼합·방합·반합·공합 구분</li></ul><ul className="list-disc pl-5"><li>성립된 기맥에서만 생조·유통</li><li>강한 중간 오행만 통관 인정</li><li>합이불화와 완전 합화 구분</li><li>겹친 합거·극제 감점에 상한 적용</li></ul></div><p className="mt-3 text-xs text-[#778c94]">독립 관문은 4점과 투간·통근 등의 연결을 요구합니다. 비극단 구조에서는 미약한 오행도 전체 상생망을 통해 참여할 수 있지만, 전체 점수 편차가 14.5점을 넘고 활성 2점 미만인 매몰 기운은 집단 유통으로 승격하지 않습니다.</p></InfoSection>
    <InfoSection title="순도 배분은 강한 기맥을 지우지 않습니다" marker="五"><p>순도값은 천영근 응축과 변이 융합의 기회만 부여합니다. 천영근은 주근 14점 이상, 부근 5점 이하, 격차 9점 이상이어야 하며, 변이는 제3의 독립 유효 영근이 있으면 두 재료만 남기지 않습니다. 5,000개 고정 표본에서는 천 2.06%, 변이 5.14%, 이 11.24%, 삼 18.38%, 사 30.26%, 오 32.08%였고 표본에 따라 달라질 수 있습니다.</p></InfoSection>
    <InfoSection title="모호함을 그대로 보여 줍니다" marker="六"><p>도맥 통과선, 절기나 시진 경계, 출생 시각의 불확실성, 비슷한 변이 후보가 있으면 신뢰도를 낮춥니다. 신뢰도는 실제 운세의 정확도가 아니라 이 창작 규칙 안에서 판정이 얼마나 선명한지를 뜻합니다.</p></InfoSection>
  </InfoPageShell>;
}

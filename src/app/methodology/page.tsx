import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageShell, InfoSection } from "@/components/InfoPageShell";

export const metadata: Metadata = { title: "계산법과 한계" };

export default function MethodologyPage() {
  return <InfoPageShell eyebrow="Methodology" title="계산법과 한계" intro="달력 계산의 기준, 시간 보정 방식, 라이브러리 선택과 불확실성을 투명하게 공개합니다." disclaimer>
    <InfoSection title="네 기둥 산출"><ul className="list-disc pl-5"><li>연주는 양력 1월 1일이 아니라 정확한 입춘 시각에 바뀝니다.</li><li>월주는 음력 월이 아니라 12절기의 절입 시각과 오호둔을 따릅니다.</li><li>일주는 검증된 중국력 라이브러리의 율리우스일 기반 60갑자 계산을 사용합니다.</li><li>시주는 현지의 2시간 시진과 일간에 따른 오서둔을 사용합니다.</li><li>야자시를 켜면 보정된 현지 시각 23시부터 일주를 다음 날로 봅니다.</li></ul></InfoSection>
    <InfoSection title="시간대와 절기 시각"><p>입력 시각은 Luxon과 실행 환경의 IANA 시간대 데이터로 실제 순간(UTC)을 구합니다. `lunar-typescript`의 절기표는 중국 표준시 표현이므로 같은 순간을 `Asia/Shanghai`로 변환해 입춘·절입 경계를 비교합니다. 일주와 시주는 선택한 출생지의 보정된 현지 벽시계를 사용합니다.</p></InfoSection>
    <InfoSection title="진태양시"><p>옵션을 켰을 때만 <code className="text-[#e0ce9f]">4 × (출생지 경도 − 표준 자오선)</code>분의 경도 보정과 <code className="text-[#e0ce9f]">9.87 sin(2B) − 7.53 cos(B) − 1.5 sin(B)</code>분의 균시차 근사식을 더합니다. B는 <code className="text-[#e0ce9f]">2π(연중일−81)/364</code>입니다. 도시 중심 경도는 결과에 근사값으로 표시됩니다.</p></InfoSection>
    <InfoSection title="영근 발현 모드와 희귀도"><p>기본인 유연 판정은 체험을 위해 영근 보유를 전제로 합니다. 엄격 판정은 입력 시각·시간대·도시·명식으로 만든 FNV-1a 결정값이 10,000칸 중 100칸 안에 들 때만 발현하므로 장기 표본상 약 1%가 영근을 얻습니다. 외부 전송이나 난수 저장은 없으며 같은 입력은 같은 결과를 냅니다. 발현자 안에서는 오영근이 가장 흔하고 사·삼·이·변이·천영근 순으로 희귀해지도록 분포 회귀 테스트를 수행합니다. 이 전체 관문은 선협 창작 규칙입니다.</p></InfoSection>
    <InfoSection title="사용 라이브러리와 라이선스"><p><Link className="text-[#dfc57f] underline underline-offset-4" href="https://github.com/6tail/lunar-typescript">lunar-typescript 1.8.6</Link>은 양·음력/윤달, 절기표와 팔자 Exact 계열을 제공하는 MIT 라이선스 라이브러리입니다. 시간대 정규화에는 MIT 라이선스의 <Link className="text-[#dfc57f] underline underline-offset-4" href="https://moment.github.io/luxon/">Luxon 3.7.2</Link>을 사용합니다. 브라우저 밖의 만세력 API는 호출하지 않습니다.</p></InfoSection>
    <InfoSection title="남아 있는 한계"><ul className="list-disc pl-5"><li>명리학의 야자시·신살·합화 판정은 유파마다 다릅니다.</li><li>1900~2100년 범위만 UI에서 지원합니다.</li><li>역사적 표준시와 서머타임은 실행 환경의 IANA 데이터 품질에 영향을 받습니다.</li><li>균시차는 항해용 정밀 천문력이 아닌 일반 근사식입니다.</li><li>30분 경계 경고는 설정 민감도를 알리는 보수적 기준입니다.</li><li>영근·변이·수련 추천은 전부 창작 규칙이며 전통 명리학의 결론이 아닙니다.</li></ul></InfoSection>
  </InfoPageShell>;
}

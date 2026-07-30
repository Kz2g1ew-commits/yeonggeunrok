import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageShell, InfoSection } from "@/components/InfoPageShell";

export const metadata: Metadata = { title: "계산법과 한계" };

export default function MethodologyPage() {
  return <InfoPageShell eyebrow="Methodology" title="계산법과 한계" intro="달력 계산의 기준, 시간 보정 방식, 라이브러리 선택과 불확실성을 투명하게 공개합니다." disclaimer>
    <InfoSection title="네 기둥 산출"><ul className="list-disc pl-5"><li>연주는 양력 1월 1일이 아니라 정확한 입춘 시각에 바뀝니다.</li><li>월주는 음력 월이 아니라 12절기의 절입 시각과 오호둔을 따릅니다.</li><li>일주는 검증된 중국력 라이브러리의 율리우스일 기반 60갑자 계산을 사용합니다.</li><li>시주는 현지의 2시간 시진과 일간에 따른 오서둔을 사용합니다.</li><li>야자시를 켜면 보정된 현지 시각 23시부터 일주를 다음 날로 봅니다.</li></ul></InfoSection>
    <InfoSection title="시간대와 절기 시각"><p>입력 시각은 Luxon과 실행 환경의 IANA 시간대 데이터로 실제 순간(UTC)을 구합니다. `lunar-typescript`의 절기표는 중국 표준시 표현이므로 같은 순간을 `Asia/Shanghai`로 변환해 입춘·절입 경계를 비교합니다. 일주와 시주는 선택한 출생지의 보정된 현지 벽시계를 사용합니다.</p></InfoSection>
    <InfoSection title="진태양시"><p>옵션을 켰을 때만 <code className="text-[#e0ce9f]">4 × (출생지 경도 − 표준 자오선)</code>분의 경도 보정과 <code className="text-[#e0ce9f]">9.87 sin(2B) − 7.53 cos(B) − 1.5 sin(B)</code>분의 균시차 근사식을 더합니다. B는 <code className="text-[#e0ce9f]">2π(연중일−81)/364</code>입니다. 도시 중심 경도는 결과에 근사값으로 표시됩니다.</p></InfoSection>
    <InfoSection title="영근 발현 모드와 도맥"><p>순천도맥은 득령·득지·생조, 투간통근, 성립된 상생 유통·통관, 합국과 청화를 평가합니다. 역천도맥은 역령, 충형의 동세, 극쇠 속 통근·구원, 편기 집중과 충중유구가 실제로 있을 때만 선택됩니다. 30,000개 구조 표본을 다시 보정해 균형 47.0점, 엄격 62.4점의 관문을 적용했고 별도 20,000개 표본에서 15.19%와 1.07%가 통과했습니다. 해시는 1점 미만의 동점 보정에만 쓰며 오행 조건값은 모드에 따라 바뀌지 않습니다.</p></InfoSection>
    <InfoSection title="구조 유효성과 순도"><p>지지 본기와 같은 지장간 본기는 중복 가산하지 않습니다. 본기·중기·여기는 위치와 충손을 반영한 가중 통근으로 바꾸며, 생조의 공급원과 통관의 중간 오행은 먼저 자체 기맥이 성립해야 합니다. 왕지가 빠진 두 글자는 정식 반합보다 약한 공합 후보로 분리합니다. 독립 관문을 통과하지 못한 미약 오행도 최강 오행과의 격차가 17점 미만인 비극단 구조에서는 집단 유통에 참여할 수 있지만, 그 이상 벌어진 편기 구조에서는 독립 관문을 통과해야 합니다. 순도값은 천영근 정제와 변이 융합만 시도하며 무효 오행을 승격하지 않습니다.</p></InfoSection>
    <InfoSection title="명리 개념과 창작 전환"><p><Link className="text-[#dfc57f] underline underline-offset-4" href="https://zh.wikisource.org/wiki/%E6%BB%B4%E5%A4%A9%E9%AB%93">《적천수》</Link>의 계절 기세·오행 순역과 <Link className="text-[#dfc57f] underline underline-offset-4" href="https://zh.wikisource.org/wiki/%E6%BB%B4%E5%A4%A9%E9%AB%93%E9%97%A1%E5%BE%AE">《적천수천미》</Link>의 생화 유통·막힘과 구원 관점을 참고했습니다. 월령을 중심으로 사주 전체의 생극을 본다는 <Link className="text-[#dfc57f] underline underline-offset-4" href="https://vr-d.com/pdf-file/%E5%91%BD%E7%90%86%2F%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%AF%A0%E5%8E%9F%E6%9C%AC.pdf">《자평진전》</Link>의 관점도 반영했습니다. 다만 순천도맥·역천도맥·영근 발현 점수는 이 서비스가 만든 선협 창작 규칙이며 전통 명리의 길흉 판단이 아닙니다.</p></InfoSection>
    <InfoSection title="사용 라이브러리와 라이선스"><p><Link className="text-[#dfc57f] underline underline-offset-4" href="https://github.com/6tail/lunar-typescript">lunar-typescript 1.8.6</Link>은 양·음력/윤달, 절기표와 팔자 Exact 계열을 제공하는 MIT 라이선스 라이브러리입니다. 시간대 정규화에는 MIT 라이선스의 <Link className="text-[#dfc57f] underline underline-offset-4" href="https://moment.github.io/luxon/">Luxon 3.7.2</Link>을 사용합니다. 브라우저 밖의 만세력 API는 호출하지 않습니다.</p></InfoSection>
    <InfoSection title="남아 있는 한계"><ul className="list-disc pl-5"><li>명리학의 야자시·신살·합화 판정은 유파마다 다릅니다.</li><li>1900~2100년 범위만 UI에서 지원합니다.</li><li>역사적 표준시와 서머타임은 실행 환경의 IANA 데이터 품질에 영향을 받습니다.</li><li>균시차는 항해용 정밀 천문력이 아닌 일반 근사식입니다.</li><li>30분 경계 경고는 설정 민감도를 알리는 보수적 기준입니다.</li><li>영근·변이·수련 추천은 전부 창작 규칙이며 전통 명리학의 결론이 아닙니다.</li></ul></InfoSection>
  </InfoPageShell>;
}

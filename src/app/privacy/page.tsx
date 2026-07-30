import type { Metadata } from "next";
import { InfoPageShell, InfoSection } from "@/components/InfoPageShell";

export const metadata: Metadata = { title: "개인정보 처리 안내" };

export default function PrivacyPage() {
  return <InfoPageShell eyebrow="Privacy by design" title="출생 정보는 저장하지 않습니다" intro="생년월일시는 민감한 정보입니다. 영근록의 초기 버전은 계산에 필요한 값을 현재 브라우저 메모리 안에서만 처리합니다.">
    <InfoSection title="수집·저장·전송하지 않는 정보" marker="一"><ul className="list-disc pl-5"><li>생년월일시와 성별을 데이터베이스에 저장하지 않습니다.</li><li>분석을 위해 외부 서버나 외부 만세력 API에 입력값을 전송하지 않습니다.</li><li>localStorage, 쿠키, 분석 기록 저장 기능을 사용하지 않습니다.</li><li>결과 URL에 생년월일시를 쿼리 문자열이나 경로로 넣지 않습니다.</li></ul></InfoSection>
    <InfoSection title="브라우저 안에서의 처리" marker="二"><p>입력값은 사주와 영근 결과를 계산하는 동안 현재 탭의 자바스크립트 메모리에만 존재합니다. 결과 화면을 새로고침하거나 직접 다시 열면 결과가 사라집니다. 브라우저 자체의 자동 완성·방문 기록 정책은 사용 중인 브라우저 설정을 따릅니다.</p></InfoSection>
    <InfoSection title="안전한 결과 공유" marker="三"><p>‘민감정보 없이 요약 복사’는 최종 영근 이름, 주영근, 변이 후보와 판정 신뢰도만 복사합니다. 생년월일시, 출생지, 성별, 원국 여덟 글자는 포함하지 않습니다. 초기 버전에는 서버 업로드형 공유 카드가 없습니다.</p></InfoSection>
    <InfoSection title="향후 저장 기능" marker="四"><p>분석 기록이나 브라우저 저장 기능을 추가할 경우 사용자의 명시적인 선택을 먼저 받고, 저장 대상·기간·삭제 방법을 별도로 안내해야 합니다. 현재 버전은 그러한 기능을 제공하지 않습니다.</p></InfoSection>
  </InfoPageShell>;
}

import type { Element } from "@/types/bazi";
import type { MutationCandidate, RootClassification } from "@/types/spiritualRoot";
import { ELEMENT_META } from "@/lib/bazi/elementMeta";

function labels(elements: Element[]): string {
  return elements.map((element) => ELEMENT_META[element].label).join("·");
}

export function generateCultivationDirection(
  classification: RootClassification,
  effective: Element[],
  potential: Element[],
  mutation?: MutationCandidate,
): string {
  if (classification.multiRootProfile) return classification.multiRootProfile.refinementPath;

  const [primary, ...secondary] = effective;
  const potentialLabel = labels(potential);
  const sealPotential = potential.length > 0
    ? ` ${potentialLabel} 잠재근은 추가 개맥하지 않고 봉근 상태로 눌러 주근의 순도를 지킵니다.`
    : " 다른 속성은 몸 안에 새로 들이지 않고 법보·진법으로만 대응합니다.";

  if (classification.qualityTier === "none") {
    return potential.length > 0
      ? `${ELEMENT_META[potential[0]].label} 잠재근 하나에만 개맥 자원을 모으고, 나머지 잠재 기맥은 억지로 함께 깨우지 않는 길이 알맞습니다.`
      : "강제 개맥으로 여러 약근을 만들기보다 외부 기연으로 하나의 온전한 영기 통로를 먼저 세우는 길이 알맞습니다.";
  }

  if (classification.qualityTier === "mutation" && mutation) {
    return `${labels(mutation.sourceElements)} 두 기맥을 따로 키우지 않고 ${mutation.name} 변이 기맥 하나로 융합·응축합니다.${sealPotential}`;
  }

  if (classification.qualityTier === "heavenly" && primary) {
    return `${ELEMENT_META[primary].label} 주근만 깊게 정련해 천영근의 순도를 높입니다.${sealPotential}`;
  }

  if (classification.qualityTier === "dual" && primary) {
    const secondaryRoot = secondary[0];
    const linked = classification.relationship?.includes("생") || classification.relationship?.includes("균형");
    return linked && secondaryRoot
      ? `${ELEMENT_META[primary].label} 주근과 ${ELEMENT_META[secondaryRoot].label} 부근의 합공만 정련하고 제3 기맥은 열지 않습니다. 변이 융합이 성립하지 않으면 주근 순도를 우선합니다.${sealPotential}`
      : `${ELEMENT_META[primary].label} 주근을 중심으로 정련하고, 충돌하는 ${secondaryRoot ? ELEMENT_META[secondaryRoot].label : "부"}근은 봉근해 천영근화할 여지를 남깁니다.${sealPotential}`;
  }

  if (classification.qualityTier === "triple" && primary) {
    const weakest = effective.at(-1)!;
    const retained = effective.slice(0, -1);
    const temporaryFlow = classification.relationship?.includes("순생")
      ? "순생 사슬은 돌파기까지 활용하되, "
      : "혼잡한 생극을 먼저 가라앉힌 뒤 ";
    return `${temporaryFlow}${ELEMENT_META[weakest].label} 약근을 봉근·세맥하고 ${labels(retained)} 두 기맥으로 응축하는 길이 알맞습니다.${sealPotential}`;
  }

  return primary
    ? `${ELEMENT_META[primary].label} 주근의 통근을 깊게 하고 불필요한 약근은 봉쇄해 기맥 순도를 높입니다.${sealPotential}`
    : "하나의 온전한 기맥을 먼저 세운 뒤 불필요한 약근의 동시 각성을 피합니다.";
}

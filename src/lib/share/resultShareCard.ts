import { ELEMENT_META, ELEMENTS } from "@/lib/bazi/elementMeta";
import type { Element } from "@/types/bazi";
import type { SpiritualRootResult } from "@/types/spiritualRoot";

export interface ResultShareElement {
  element: Element;
  label: string;
  hanja: string;
  activationScore: number;
  color: string;
}

/**
 * 공유 이미지에 허용된 정보만 담는 화이트리스트 모델입니다.
 * 생년월일시, 출생지, 사주 원문을 받을 필드 자체를 두지 않습니다.
 */
export interface ResultShareCardModel {
  serviceName: "영근록";
  rootName: string;
  quality: string;
  primaryRoots: string;
  potentialRoots: string;
  mutation: string;
  elements: ResultShareElement[];
  activationNote: string;
  privacyNote: string;
}

function elementNames(elements: Element[], emptyLabel: string): string {
  return elements.map((element) => `${ELEMENT_META[element].label}(${ELEMENT_META[element].hanja})`).join(" · ") || emptyLabel;
}

function mutationSummary(result: SpiritualRootResult): string {
  const candidate = result.mutations.find(({ status }) => status !== "rejected");
  if (!candidate) return "뚜렷한 후보 없음";

  const statusLabel = {
    confirmed: "확정",
    likely: "유력",
    possible: "가능성",
  }[candidate.status as Exclude<typeof candidate.status, "rejected">];
  return `${candidate.name}영근 · ${statusLabel} ${candidate.confidence}%`;
}

export function buildResultShareCardModel(result: SpiritualRootResult): ResultShareCardModel {
  return {
    serviceName: "영근록",
    rootName: result.displayName,
    quality: `${result.classification.qualityLabel} · ${result.classification.rarityLabel}`,
    primaryRoots: elementNames(result.primaryElements, "미성립"),
    potentialRoots: elementNames(result.potentialElements, "없음"),
    mutation: mutationSummary(result),
    elements: ELEMENTS.map((element) => ({
      element,
      label: ELEMENT_META[element].label,
      hanja: ELEMENT_META[element].hanja,
      activationScore: Number.isFinite(result.elementEvidence[element].score)
        ? Math.max(0, result.elementEvidence[element].score)
        : 0,
      color: ELEMENT_META[element].color,
    })),
    activationNote: "기맥 활성은 월령·통근·생조·극제·합충을 반영한 판정 점수입니다.",
    privacyNote: "출생정보·사주 원문 미포함 · 선협 세계관용 창작 결과",
  };
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function drawTrackedText(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  tracking: number,
): void {
  let cursor = x;
  for (const character of value) {
    context.fillText(character, cursor, y);
    cursor += context.measureText(character).width + tracking;
  }
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("공유 이미지를 PNG로 변환하지 못했습니다."));
    }, "image/png");
  });
}

export async function renderResultShareImage(result: SpiritualRootResult): Promise<Blob> {
  const model = buildResultShareCardModel(result);
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("이 브라우저에서 이미지 캔버스를 사용할 수 없습니다.");

  const background = context.createLinearGradient(0, 0, 1080, 1350);
  background.addColorStop(0, "#071016");
  background.addColorStop(0.52, "#10232c");
  background.addColorStop(1, "#08151c");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const jadeGlow = context.createRadialGradient(70, 150, 0, 70, 150, 520);
  jadeGlow.addColorStop(0, "rgba(98,198,165,0.18)");
  jadeGlow.addColorStop(1, "rgba(98,198,165,0)");
  context.fillStyle = jadeGlow;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const goldGlow = context.createRadialGradient(1010, 120, 0, 1010, 120, 480);
  goldGlow.addColorStop(0, "rgba(216,182,106,0.16)");
  goldGlow.addColorStop(1, "rgba(216,182,106,0)");
  context.fillStyle = goldGlow;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(216,182,106,0.28)";
  context.lineWidth = 2;
  roundedRect(context, 56, 56, 968, 1238, 32);
  context.stroke();

  context.fillStyle = "rgba(216,182,106,0.055)";
  context.font = '700 280px "Noto Serif KR", Batang, serif';
  context.textAlign = "right";
  context.fillText("根", 972, 285);

  context.textAlign = "left";
  context.fillStyle = "#d8b66a";
  context.font = '700 24px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  drawTrackedText(context, "SPIRITUAL ROOT ARCHIVE", 104, 142, 5);

  context.fillStyle = "#f3e6c4";
  context.font = '700 58px "Noto Serif KR", Batang, serif';
  context.fillText(model.serviceName, 104, 222);

  context.fillStyle = "#8398a0";
  context.font = '700 22px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText("최종 영근 판정", 104, 338);

  context.fillStyle = "#f5e5bd";
  context.font = '700 64px "Noto Serif KR", Batang, serif';
  context.fillText(model.rootName, 104, 422, 872);

  context.fillStyle = "rgba(255,255,255,0.032)";
  roundedRect(context, 88, 466, 904, 166, 22);
  context.fill();
  context.strokeStyle = "rgba(155,173,181,0.15)";
  context.lineWidth = 1.5;
  context.stroke();

  const details = [
    ["품질", model.quality],
    ["주영근", model.primaryRoots],
    ["잠재 영근", model.potentialRoots],
    ["변이 후보", model.mutation],
  ];
  details.forEach(([label, value], index) => {
    const x = index % 2 === 0 ? 124 : 554;
    const y = index < 2 ? 505 : 574;
    context.fillStyle = "#7f949c";
    context.font = '700 18px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
    context.fillText(label, x, y);
    context.fillStyle = "#dce3e3";
    context.font = '700 23px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
    context.fillText(value, x, y + 33, 382);
  });

  context.strokeStyle = "rgba(155,173,181,0.1)";
  context.beginPath();
  context.moveTo(520, 486);
  context.lineTo(520, 612);
  context.moveTo(108, 552);
  context.lineTo(972, 552);
  context.stroke();

  context.fillStyle = "rgba(255,255,255,0.032)";
  roundedRect(context, 88, 660, 904, 500, 26);
  context.fill();
  context.strokeStyle = "rgba(155,173,181,0.15)";
  context.stroke();

  context.fillStyle = "#d8c99f";
  context.font = '700 25px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText("오행 기맥 활성", 128, 714);

  const activationMax = Math.max(1, ...model.elements.map(({ activationScore }) => activationScore));

  model.elements.forEach((item, index) => {
    const y = 785 + index * 69;

    context.fillStyle = item.color;
    context.font = '700 30px "Noto Serif KR", Batang, serif';
    context.fillText(item.hanja, 128, y);

    context.fillStyle = "#dce3e3";
    context.font = '700 24px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
    context.fillText(item.label, 174, y);

    context.fillStyle = "rgba(0,0,0,0.28)";
    roundedRect(context, 242, y - 23, 580, 18, 9);
    context.fill();

    if (item.activationScore > 0) {
      context.fillStyle = item.color;
      roundedRect(context, 242, y - 23, Math.max(7, 580 * item.activationScore / activationMax), 18, 9);
      context.fill();
    }

    context.fillStyle = "#dce3e3";
    context.font = '700 25px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
    context.textAlign = "right";
    context.fillText(`${item.activationScore.toFixed(1)}점`, 946, y);
    context.textAlign = "left";
  });

  context.fillStyle = "#8da0a7";
  context.font = '500 20px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText(model.activationNote, 128, 1124);

  context.strokeStyle = "rgba(216,182,106,0.2)";
  context.beginPath();
  context.moveTo(104, 1200);
  context.lineTo(976, 1200);
  context.stroke();

  context.fillStyle = "#9eadaf";
  context.font = '600 21px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText(model.privacyNote, 104, 1258);

  context.fillStyle = "#d8b66a";
  context.font = '700 24px "Noto Serif KR", Batang, serif';
  context.textAlign = "right";
  context.fillText("靈根錄", 976, 1258);

  return canvasToPng(canvas);
}

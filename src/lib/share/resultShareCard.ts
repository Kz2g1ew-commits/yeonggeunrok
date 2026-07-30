import { ELEMENT_META, ELEMENTS } from "@/lib/bazi/elementMeta";
import type { Element } from "@/types/bazi";
import type { SpiritualRootResult } from "@/types/spiritualRoot";

export interface ResultShareElement {
  element: Element;
  label: string;
  hanja: string;
  ratio: number;
  color: string;
}

/**
 * 공유 이미지에 허용된 정보만 담는 화이트리스트 모델입니다.
 * 생년월일시, 출생지, 사주 원문을 받을 필드 자체를 두지 않습니다.
 */
export interface ResultShareCardModel {
  serviceName: "영근록";
  rootName: string;
  elements: ResultShareElement[];
  ratioNote: string;
  privacyNote: string;
}

export function buildResultShareCardModel(result: SpiritualRootResult): ResultShareCardModel {
  return {
    serviceName: "영근록",
    rootName: result.displayName,
    elements: ELEMENTS.map((element) => ({
      element,
      label: ELEMENT_META[element].label,
      hanja: ELEMENT_META[element].hanja,
      ratio: Math.max(0, Math.min(100, result.elementEvidence[element].presenceRatio)),
      color: ELEMENT_META[element].color,
    })),
    ratioNote: "오행 비율은 원국 재료의 구성비이며 기맥 활성도와는 다릅니다.",
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
  roundedRect(context, 88, 492, 904, 590, 26);
  context.fill();
  context.strokeStyle = "rgba(155,173,181,0.15)";
  context.lineWidth = 1.5;
  context.stroke();

  context.fillStyle = "#d8c99f";
  context.font = '700 25px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText("오행 원국 구성비", 128, 557);

  model.elements.forEach((item, index) => {
    const y = 642 + index * 91;

    context.fillStyle = item.color;
    context.font = '700 30px "Noto Serif KR", Batang, serif';
    context.fillText(item.hanja, 128, y);

    context.fillStyle = "#dce3e3";
    context.font = '700 24px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
    context.fillText(item.label, 174, y);

    context.fillStyle = "rgba(0,0,0,0.28)";
    roundedRect(context, 242, y - 23, 580, 18, 9);
    context.fill();

    if (item.ratio > 0) {
      context.fillStyle = item.color;
      roundedRect(context, 242, y - 23, Math.max(7, 580 * item.ratio / 100), 18, 9);
      context.fill();
    }

    context.fillStyle = "#dce3e3";
    context.font = '700 25px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
    context.textAlign = "right";
    context.fillText(`${item.ratio.toFixed(1)}%`, 946, y);
    context.textAlign = "left";
  });

  context.fillStyle = "#8da0a7";
  context.font = '500 20px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText(model.ratioNote, 128, 1030);

  context.strokeStyle = "rgba(216,182,106,0.2)";
  context.beginPath();
  context.moveTo(104, 1142);
  context.lineTo(976, 1142);
  context.stroke();

  context.fillStyle = "#9eadaf";
  context.font = '600 21px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText(model.privacyNote, 104, 1205);

  context.fillStyle = "#d8b66a";
  context.font = '700 24px "Noto Serif KR", Batang, serif';
  context.textAlign = "right";
  context.fillText("靈根錄", 976, 1205);

  return canvasToPng(canvas);
}

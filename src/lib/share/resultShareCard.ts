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

export interface ResultShareTalentDimension {
  name: string;
  score: number;
  label: string;
}

export interface ResultShareTalent {
  title: string;
  summary: string;
  dimensions: ResultShareTalentDimension[];
  specialEffects: string[];
}

export interface ResultShareCultivation {
  paths: string[];
  weaponsAndTechniques: string[];
  strengths: string[];
  cautions: string[];
  growthDirection: string;
}

/**
 * 공유 이미지에 허용된 정보만 담는 화이트리스트 모델입니다.
 * 생년월일시, 출생지, 사주 원문을 받을 필드 자체를 두지 않습니다.
 */
export interface ResultShareCardModel {
  serviceName: "영근록";
  rootName: string;
  rootProfile: string;
  awakening: string;
  quality: string;
  primaryRoots: string;
  potentialRoots: string;
  mutation: string;
  elements: ResultShareElement[];
  talent: ResultShareTalent;
  cultivation: ResultShareCultivation;
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
    rootProfile: result.classification.multiRootProfile?.subtype ?? result.classification.relationship ?? "기본 영근형",
    awakening: result.awakening.label,
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
    talent: {
      title: result.talentProfile.title,
      summary: result.talentProfile.summary,
      dimensions: Object.values(result.talentProfile.dimensions).map(({ name, score, label }) => ({ name, score, label })),
      specialEffects: result.talentProfile.specialEffects.map(({ name }) => name).slice(0, 3),
    },
    cultivation: {
      paths: result.recommendedPaths.slice(0, 4),
      weaponsAndTechniques: [...result.recommendedWeapons, ...result.recommendedTechniques].slice(0, 5),
      strengths: result.strengths.slice(0, 3),
      cautions: [...result.weaknesses, ...result.risks].slice(0, 4),
      growthDirection: result.growthDirection,
    },
    activationNote: "기맥 활성은 월령·통근·생조·극제·합충을 반영한 판정 점수입니다.",
    privacyNote: "출생정보·사주 원문 미포함 · 사주 기반 선협식 영근 판별",
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

function wrapText(
  context: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const characters = Array.from(value.trim());
  const lines: string[] = [];
  let line = "";
  let truncated = false;

  for (const character of characters) {
    const candidate = line + character;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line.trimEnd());
      line = character.trimStart();
      if (lines.length === maxLines) {
        truncated = true;
        break;
      }
    } else {
      line = candidate;
    }
  }
  if (!truncated && line && lines.length < maxLines) lines.push(line.trimEnd());

  if (truncated && lines.length) {
    let last = lines[maxLines - 1];
    while (last && context.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    lines[maxLines - 1] = `${last.trimEnd()}…`;
  }
  return lines;
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): void {
  wrapText(context, value, maxWidth, maxLines).forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight, maxWidth);
  });
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
  canvas.height = 1920;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("이 브라우저에서 이미지 캔버스를 사용할 수 없습니다.");

  const background = context.createLinearGradient(0, 0, 1080, 1920);
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
  roundedRect(context, 56, 56, 968, 1808, 32);
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
  context.fillText("최종 영근 판정", 104, 294);

  context.fillStyle = "#f5e5bd";
  context.font = '700 64px "Noto Serif KR", Batang, serif';
  context.fillText(model.rootName, 104, 374, 872);

  context.fillStyle = "#9fc0b7";
  context.font = '700 24px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText(`세부 구조 · ${model.rootProfile} / ${model.awakening}`, 104, 416, 872);

  context.fillStyle = "rgba(255,255,255,0.032)";
  roundedRect(context, 88, 448, 904, 150, 22);
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
    const y = index < 2 ? 486 : 548;
    context.fillStyle = "#7f949c";
    context.font = '700 18px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
    context.fillText(label, x, y);
    context.fillStyle = "#dce3e3";
    context.font = '700 23px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
    context.fillText(value, x, y + 33, 382);
  });

  context.strokeStyle = "rgba(155,173,181,0.1)";
  context.beginPath();
  context.moveTo(520, 466);
  context.lineTo(520, 580);
  context.moveTo(108, 536);
  context.lineTo(972, 536);
  context.stroke();

  context.fillStyle = "rgba(255,255,255,0.032)";
  roundedRect(context, 88, 628, 904, 370, 26);
  context.fill();
  context.strokeStyle = "rgba(155,173,181,0.15)";
  context.stroke();

  context.fillStyle = "#d8c99f";
  context.font = '700 25px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText("오행 기맥 활성", 128, 680);

  const activationMax = Math.max(1, ...model.elements.map(({ activationScore }) => activationScore));

  model.elements.forEach((item, index) => {
    const y = 741 + index * 48;

    context.fillStyle = item.color;
    context.font = '700 30px "Noto Serif KR", Batang, serif';
    context.fillText(item.hanja, 128, y);

    context.fillStyle = "#dce3e3";
    context.font = '700 24px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
    context.fillText(item.label, 174, y);

    context.fillStyle = "rgba(0,0,0,0.28)";
    roundedRect(context, 242, y - 19, 580, 15, 8);
    context.fill();

    if (item.activationScore > 0) {
      context.fillStyle = item.color;
      roundedRect(context, 242, y - 19, Math.max(7, 580 * item.activationScore / activationMax), 15, 8);
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
  context.font = '500 18px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText(model.activationNote, 128, 972);

  context.fillStyle = "rgba(255,255,255,0.032)";
  roundedRect(context, 88, 1028, 904, 338, 26);
  context.fill();
  context.strokeStyle = "rgba(155,173,181,0.15)";
  context.stroke();

  context.fillStyle = "#d8c99f";
  context.font = '700 25px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText("선협 재능 종합표", 128, 1080);
  context.fillStyle = "#efd9a4";
  context.font = '700 21px "Noto Serif KR", Batang, serif';
  context.textAlign = "right";
  context.fillText(model.talent.title, 948, 1080, 510);
  context.textAlign = "left";

  const talentCardWidth = 158;
  model.talent.dimensions.forEach((talent, index) => {
    const x = 112 + index * 172;
    context.fillStyle = "rgba(4,12,17,0.4)";
    roundedRect(context, x, 1110, talentCardWidth, 164, 18);
    context.fill();
    context.strokeStyle = "rgba(216,182,106,0.12)";
    context.stroke();

    context.fillStyle = "#9fb0b7";
    context.font = '700 19px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
    context.fillText(talent.name, x + 16, 1146, talentCardWidth - 32);
    context.fillStyle = "#efd48d";
    context.font = '700 38px "Noto Serif KR", Batang, serif';
    context.fillText(String(talent.score), x + 16, 1192);
    context.fillStyle = "#c8d2d4";
    context.font = '600 17px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
    drawWrappedText(context, talent.label, x + 16, 1223, talentCardWidth - 32, 23, 2);
  });

  context.fillStyle = "#80949b";
  context.font = '600 18px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  const specialTalents = model.talent.specialEffects.length
    ? model.talent.specialEffects.join(" · ")
    : "뚜렷한 특수 재능 없음";
  context.fillText(`특수 재능 · ${specialTalents}`, 128, 1318, 820);
  context.fillStyle = "#748991";
  context.font = '500 16px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  drawWrappedText(context, model.talent.summary, 128, 1343, 820, 20, 1);

  context.fillStyle = "rgba(255,255,255,0.032)";
  roundedRect(context, 88, 1396, 904, 360, 26);
  context.fill();
  context.strokeStyle = "rgba(155,173,181,0.15)";
  context.stroke();

  context.fillStyle = "#d8c99f";
  context.font = '700 25px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText("수련 설정", 128, 1448);

  const settingColumns = [
    ["추천 공법", model.cultivation.paths.join(" · ") || "기초 납기술"],
    ["무기·술법", model.cultivation.weaponsAndTechniques.join(" · ") || "기맥 개통용 법구"],
    ["강점", model.cultivation.strengths.join(" · ") || "외부 기연에 따른 성장"],
    ["주의", model.cultivation.cautions.join(" · ") || "무리한 강제 개맥"],
  ];
  settingColumns.forEach(([label, value], index) => {
    const x = index % 2 === 0 ? 128 : 558;
    const y = index < 2 ? 1494 : 1604;
    context.fillStyle = index === 3 ? "#c2a6a2" : "#9fc0b7";
    context.font = '700 18px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
    context.fillText(label, x, y);
    context.fillStyle = "#cbd5d7";
    context.font = '500 18px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
    drawWrappedText(context, value, x, y + 30, 386, 25, 3);
  });

  context.strokeStyle = "rgba(155,173,181,0.1)";
  context.beginPath();
  context.moveTo(520, 1478);
  context.lineTo(520, 1685);
  context.moveTo(112, 1580);
  context.lineTo(968, 1580);
  context.stroke();

  context.fillStyle = "#d8b66a";
  context.font = '700 17px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText("성장 방향", 128, 1706);
  context.fillStyle = "#aebdc2";
  context.font = '500 17px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  drawWrappedText(context, model.cultivation.growthDirection, 228, 1706, 720, 22, 2);

  context.strokeStyle = "rgba(216,182,106,0.2)";
  context.beginPath();
  context.moveTo(104, 1800);
  context.lineTo(976, 1800);
  context.stroke();

  context.fillStyle = "#9eadaf";
  context.font = '600 21px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  context.fillText(model.privacyNote, 104, 1844);

  context.fillStyle = "#d8b66a";
  context.font = '700 24px "Noto Serif KR", Batang, serif';
  context.textAlign = "right";
  context.fillText("靈根錄", 976, 1844);

  return canvasToPng(canvas);
}

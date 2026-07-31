"use client";

import { useState } from "react";
import { ImageDown } from "lucide-react";
import { renderResultShareImage } from "@/lib/share/resultShareCard";
import type { SpiritualRootResult } from "@/types/spiritualRoot";

type ShareStatus = "idle" | "rendering" | "downloaded" | "error";

function downloadImage(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "영근록-결과.png";
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function ResultShareButton({ result }: { result: SpiritualRootResult }) {
  const [status, setStatus] = useState<ShareStatus>("idle");

  const downloadResultImage = async () => {
    if (status === "rendering") return;
    setStatus("rendering");

    try {
      const blob = await renderResultShareImage(result);
      downloadImage(blob);
      setStatus("downloaded");
      window.setTimeout(() => setStatus("idle"), 2_200);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 3_000);
    }
  };

  const label: Record<ShareStatus, string> = {
    idle: "결과 이미지 PNG 다운로드",
    rendering: "결과 이미지 만드는 중…",
    downloaded: "PNG 이미지 저장됨",
    error: "이미지 생성 실패",
  };

  return (
    <button
      type="button"
      className="ghost-button"
      onClick={downloadResultImage}
      disabled={status === "rendering"}
      aria-live="polite"
    >
      <ImageDown size={15} />
      {label[status]}
    </button>
  );
}

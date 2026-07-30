"use client";

import { useState } from "react";
import { ImageDown } from "lucide-react";
import { renderResultShareImage } from "@/lib/share/resultShareCard";
import type { SpiritualRootResult } from "@/types/spiritualRoot";

type ShareStatus = "idle" | "rendering" | "copied" | "shared" | "downloaded" | "error";

function downloadImage(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "영근록-결과.png";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function ResultShareButton({ result }: { result: SpiritualRootResult }) {
  const [status, setStatus] = useState<ShareStatus>("idle");

  const shareImage = async () => {
    if (status === "rendering") return;
    setStatus("rendering");

    try {
      const blob = await renderResultShareImage(result);

      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setStatus("copied");
          window.setTimeout(() => setStatus("idle"), 2_200);
          return;
        } catch {
          // 이미지 클립보드를 막는 브라우저에서는 파일 공유나 저장으로 이어집니다.
        }
      }

      const file = new File([blob], "영근록-결과.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "영근록 결과", files: [file] });
        setStatus("shared");
      } else {
        downloadImage(blob);
        setStatus("downloaded");
      }
      window.setTimeout(() => setStatus("idle"), 2_200);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("idle");
        return;
      }
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 3_000);
    }
  };

  const label: Record<ShareStatus, string> = {
    idle: "민감정보 없이 결과 이미지 복사",
    rendering: "결과 이미지 만드는 중…",
    copied: "이미지 복사됨",
    shared: "이미지 공유됨",
    downloaded: "PNG 이미지 저장됨",
    error: "이미지 생성 실패",
  };

  return (
    <button
      type="button"
      className="ghost-button"
      onClick={shareImage}
      disabled={status === "rendering"}
      aria-live="polite"
    >
      <ImageDown size={15} />
      {label[status]}
    </button>
  );
}

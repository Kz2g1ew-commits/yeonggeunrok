/** @vitest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResultShareButton } from "@/components/ResultShareButton";
import { renderResultShareImage } from "@/lib/share/resultShareCard";
import type { SpiritualRootResult } from "@/types/spiritualRoot";

vi.mock("@/lib/share/resultShareCard", () => ({
  renderResultShareImage: vi.fn(),
}));

describe("result image download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(renderResultShareImage).mockResolvedValue(new Blob(["png"], { type: "image/png" }));
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn(() => "blob:result-image") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
  });

  it("downloads a PNG directly without using clipboard or device sharing", async () => {
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    const clipboardWrite = vi.fn();
    const deviceShare = vi.fn();
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { write: clipboardWrite } });
    Object.defineProperty(navigator, "share", { configurable: true, value: deviceShare });

    render(<ResultShareButton result={{} as SpiritualRootResult} />);
    fireEvent.click(screen.getByRole("button", { name: "결과 이미지 PNG 다운로드" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "PNG 이미지 저장됨" })).toBeTruthy());
    expect(renderResultShareImage).toHaveBeenCalledOnce();
    expect(anchorClick).toHaveBeenCalledOnce();
    expect(clipboardWrite).not.toHaveBeenCalled();
    expect(deviceShare).not.toHaveBeenCalled();
  });
});

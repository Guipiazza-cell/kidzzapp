import html2canvas from "html2canvas";

const APP_URL = "https://kidzzapp.lovable.app";

export interface ShareData {
  title: string;
  text: string;
  filename: string;
}

/**
 * Captures a DOM node and shares it as an image via Web Share API.
 * Falls back to download if file sharing is not supported.
 */
export async function captureAndShare(node: HTMLElement, data: ShareData): Promise<boolean> {
  try {
    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png", 0.95)
    );

    if (!blob) throw new Error("Failed to create blob");

    const file = new File([blob], data.filename, { type: "image/png" });

    // Try Web Share API with file
    if (
      typeof navigator !== "undefined" &&
      navigator.canShare?.({ files: [file] }) &&
      navigator.share
    ) {
      try {
        await navigator.share({
          title: data.title,
          text: `${data.text}\n\n${APP_URL}`,
          files: [file],
        });
        return true;
      } catch (e: any) {
        if (e?.name === "AbortError") return false;
        // continue to fallback
      }
    }

    // Fallback: download image
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    // Also copy share text for convenience
    try {
      await navigator.clipboard?.writeText(`${data.text}\n\n${APP_URL}`);
    } catch {
      /* noop */
    }
    return true;
  } catch (err) {
    console.error("[viralShare] capture error:", err);
    return false;
  }
}

/**
 * Renders a React-built node off-screen, captures it, and cleans up.
 * The element passed in must already be in the DOM (visible or off-screen).
 */
export async function shareOffscreen(
  buildNode: () => HTMLElement,
  data: ShareData
): Promise<boolean> {
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0";
  wrapper.style.zIndex = "-1";
  wrapper.style.pointerEvents = "none";
  document.body.appendChild(wrapper);

  const node = buildNode();
  wrapper.appendChild(node);

  // Wait one frame for layout/fonts
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await new Promise((r) => setTimeout(r, 80));

  try {
    return await captureAndShare(node, data);
  } finally {
    wrapper.remove();
  }
}

export function getChildName(): string {
  if (typeof window === "undefined") return "amigo";
  return window.localStorage.getItem("kidzz_child_name") || "amigo";
}

export function getStreak(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(window.localStorage.getItem("kidzz_streak") || "0", 10);
}

import { useEffect, useRef, useState } from "react";

/**
 * Reveals text character by character ("máquina de escrever").
 * - `speed` = ms per character (default 18 ≈ 55 cps, smooth on mobile)
 * - `enabled` = false to skip animation and show full text immediately
 * - `done` is true once the full text is rendered
 *
 * Restarts whenever `text` changes.
 */
export function useTypewriter(text: string, speed = 18, enabled = true) {
  const [shown, setShown] = useState(enabled ? "" : text);
  const [done, setDone] = useState(!enabled);
  const skipRef = useRef(false);

  useEffect(() => {
    skipRef.current = false;
    if (!enabled || !text) {
      setShown(text);
      setDone(true);
      return;
    }
    setShown("");
    setDone(false);

    let i = 0;
    let raf = 0;
    let last = performance.now();

    const tick = (t: number) => {
      if (skipRef.current) {
        setShown(text);
        setDone(true);
        return;
      }
      const dt = t - last;
      const advance = Math.max(1, Math.floor(dt / speed));
      i = Math.min(text.length, i + advance);
      last = t;
      setShown(text.slice(0, i));
      if (i < text.length) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, speed, enabled]);

  /** Call to skip animation and show the full text now. */
  const skip = () => {
    skipRef.current = true;
    setShown(text);
    setDone(true);
  };

  return { shown, done, skip };
}

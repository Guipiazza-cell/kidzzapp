// Pré-carrega assets críticos + os 4 estados do KIDZZ Chameleon.
// Garante que o mascote NUNCA pisque ao trocar de aba ou ao remontar (cache do browser).
import forestBg from "@/assets/premium-forest-bg.jpg";
import cosmicMascot from "@/assets/kidzz/cosmic.webp";
import moonMascot from "@/assets/kidzz/moon.webp";
import explorerMascot from "@/assets/kidzz/explorer.webp";
import musicMascot from "@/assets/kidzz/music.webp";

// Splash + bg + 4 estados do mascote = essencial para zero-flicker em qualquer aba.
const CRITICAL_ASSETS = [forestBg, cosmicMascot];
const SECONDARY_ASSETS = [moonMascot, explorerMascot, musicMascot];

export function preloadAssets() {
  if (typeof window === "undefined") return;
  const run = () => {
    CRITICAL_ASSETS.forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      // Força o decode pra ficar pronto no cache do compositor (evita flash ao re-mountar).
      if ("decode" in img) (img as any).decode?.().catch(() => {});
    });
    const mobileLike = window.matchMedia?.("(max-width: 767px), (pointer: coarse)")?.matches;
    if (mobileLike) return;
    SECONDARY_ASSETS.forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      if ("decode" in img) (img as any).decode?.().catch(() => {});
    });
  };
  const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void) => void);
  if (ric) ric(run);
  else setTimeout(run, 200);
}

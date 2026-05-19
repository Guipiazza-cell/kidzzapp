// Pré-carrega assets críticos + os 4 estados do KIDZZ Chameleon.
// Garante que o mascote NUNCA pisque ao trocar de aba ou ao remontar (cache do browser).
import forestBg from "@/assets/forest-bg-light.jpg";
import cosmicMascot from "@/assets/kidzz/cosmic.webp";
import moonMascot from "@/assets/kidzz/moon.webp";
import explorerMascot from "@/assets/kidzz/explorer.webp";
import musicMascot from "@/assets/kidzz/music.webp";

// Splash + bg + 4 estados do mascote = essencial para zero-flicker em qualquer aba.
const CRITICAL_ASSETS = [forestBg, cosmicMascot, moonMascot, explorerMascot, musicMascot];

export function preloadAssets() {
  if (typeof window === "undefined") return;
  const run = () => {
    CRITICAL_ASSETS.forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  };
  const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void) => void);
  if (ric) ric(run);
  else setTimeout(run, 200);
}

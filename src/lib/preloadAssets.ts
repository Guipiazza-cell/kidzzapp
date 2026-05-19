// Pré-carrega assets críticos + os 4 estados do KIDZZ Chameleon.
// Garante que o mascote NUNCA pisque ao trocar de aba ou ao remontar (cache do browser).
import forestBg from "@/assets/forest-bg-light.jpg";
import kidzzMascot from "@/assets/kidzz/uploaded-chameleon-cutout.webp";

// Splash + bg + mascote principal = essencial para zero-flicker em qualquer aba.
const CRITICAL_ASSETS = [forestBg, kidzzMascot];

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
  };
  const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void) => void);
  if (ric) ric(run);
  else setTimeout(run, 200);
}

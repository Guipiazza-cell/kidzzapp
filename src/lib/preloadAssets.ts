// Pré-carrega APENAS os assets críticos da primeira tela (splash + bg + mascote home).
// Todos os outros mascotes carregam sob demanda quando a aba correspondente abre.
// Antes: 14 imagens (~25MB). Agora: 3 imagens (~600KB) — UX inicial muito mais leve.
import forestBg from "@/assets/forest-bg-light.jpg";
import cosmicMascot from "@/assets/kidzz/cosmic.webp";

// Splash usa o mesmo cosmic.png — único asset de mascote crítico no boot.
const CRITICAL_ASSETS = [forestBg, cosmicMascot];

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

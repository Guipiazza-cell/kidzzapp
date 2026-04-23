// Pré-carrega imagens dos mascotes e backgrounds críticos no startup
// para evitar flicker ao abrir cada aba.
import pixelImg from "@/assets/pixel-chameleon.png";
import aneImg from "@/assets/ane-chameleon.png";
import chameleonBlue from "@/assets/chameleon-blue.png";
import chameleonHappy from "@/assets/chameleon-happy.png";
import chameleonDark from "@/assets/chameleon-dark.png";
import chameleonRed from "@/assets/chameleon-red.png";
import chameleonMain from "@/assets/chameleon.png";
import forestBg from "@/assets/forest-bg-light.jpg";

const ASSETS = [
  pixelImg,
  aneImg,
  chameleonBlue,
  chameleonHappy,
  chameleonDark,
  chameleonRed,
  chameleonMain,
  forestBg,
];

export function preloadAssets() {
  if (typeof window === "undefined") return;
  // Use requestIdleCallback when available so preload doesn't block first paint.
  const run = () => {
    ASSETS.forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  };
  const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void) => void);
  if (ric) ric(run);
  else setTimeout(run, 200);
}

/* ── KIDZZ Avatar — Sistema de camadas reais ──
   Layer system: base (corpo PNG) + olhos (SVG) + boca (SVG) + acessório (SVG)
   - Expressões reais (sem emojis): feliz, triste, surpreso, bravo, curioso, dormindo
   - Trajes reais (overlays SVG anatômicos): astronauta, música, explorador, festa, cientista, super-herói
   - Idle breathing + auto-blink (4-6s) + tap bounce
   - Cor via hue-rotate sobre o PNG base
   - Performance: SVG inline (zero requests), no máximo 4 layers simultâneas
*/

import { forwardRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import aneImg from "@/assets/ane-chameleon.png";
import pixelImg from "@/assets/pixel-chameleon.png";

export type AvatarBase = "ane" | "pixel";
export type AvatarExpression =
  | "feliz"
  | "triste"
  | "surpreso"
  | "bravo"
  | "curioso"
  | "dormindo";
export type AvatarOutfit =
  | "nenhum"
  | "astronauta"
  | "musica"
  | "explorador"
  | "festa"
  | "cientista"
  | "super-heroi";

export interface KidzzAvatarConfig {
  base: AvatarBase;
  expression: AvatarExpression;
  outfit: AvatarOutfit;
  hueRotate: number; // graus (0 = original)
}

const STORAGE_KEY = "kidzz_avatar";

export const DEFAULT_AVATAR: KidzzAvatarConfig = {
  base: "ane",
  expression: "feliz",
  outfit: "nenhum",
  hueRotate: 0,
};

export function loadAvatar(): KidzzAvatarConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_AVATAR, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_AVATAR;
}

export function saveAvatar(cfg: KidzzAvatarConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {}
}

const sizeMap = {
  sm: 80,
  md: 140,
  lg: 200,
  xl: 260,
  hero: 320,
};

interface Props {
  config: KidzzAvatarConfig;
  size?: keyof typeof sizeMap;
  className?: string;
  interactive?: boolean;
  onTap?: () => void;
}

/* ────────────────────────── EYES ────────────────────────── */
/* All eye SVGs use viewBox 0 0 100 100, drawing both eyes anatomically
   over the chameleon's face area (around y=38-50 of the body). */

const Eyes = ({ expression }: { expression: AvatarExpression }) => {
  // Auto blink animation
  const blinkAnim = {
    scaleY: [1, 1, 0.08, 1],
  };
  const blinkTransition = {
    duration: 5,
    repeat: Infinity,
    times: [0, 0.93, 0.96, 1],
    ease: "easeInOut" as const,
  };

  if (expression === "dormindo") {
    return (
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
        <path d="M 32 42 Q 38 45 44 42" stroke="#1a1a2e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M 56 42 Q 62 45 68 42" stroke="#1a1a2e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* Zzz */}
        <text x="72" y="32" fontSize="6" fill="white" opacity="0.6" fontWeight="700">z</text>
        <text x="78" y="26" fontSize="5" fill="white" opacity="0.5" fontWeight="700">z</text>
      </svg>
    );
  }

  // Eye geometry per expression
  const cfg = {
    feliz: { ry: 3.2, pupilR: 1.6, pupilY: 41, cheek: true, arc: true },
    triste: { ry: 4, pupilR: 1.6, pupilY: 43, cheek: false, arc: false, brow: "down" as const },
    surpreso: { ry: 5.5, pupilR: 1.4, pupilY: 41, cheek: false, arc: false, brow: "up" as const },
    bravo: { ry: 3.8, pupilR: 1.8, pupilY: 41, cheek: false, arc: false, brow: "angry" as const },
    curioso: { ry: 4.2, pupilR: 1.6, pupilY: 40, cheek: false, arc: false, brow: "tilt" as const },
    feliz_default: { ry: 4, pupilR: 1.6, pupilY: 41, cheek: false, arc: false },
  };
  const c = (cfg as any)[expression] || cfg.feliz_default;

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
      {/* Brows */}
      {c.brow === "down" && (
        <>
          <path d="M 30 34 L 42 36" stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M 58 36 L 70 34" stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      {c.brow === "up" && (
        <>
          <path d="M 30 32 Q 36 28 42 32" stroke="#1a1a2e" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M 58 32 Q 64 28 70 32" stroke="#1a1a2e" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </>
      )}
      {c.brow === "angry" && (
        <>
          <path d="M 28 32 L 42 36" stroke="#1a1a2e" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 58 36 L 72 32" stroke="#1a1a2e" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      {c.brow === "tilt" && (
        <>
          <path d="M 30 33 L 42 31" stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M 58 32 Q 64 30 70 33" stroke="#1a1a2e" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* Left eye white */}
      <motion.ellipse
        cx="36"
        cy="42"
        rx="3.2"
        ry={c.ry}
        fill="white"
        animate={blinkAnim}
        transition={blinkTransition}
        style={{ transformOrigin: "36px 42px" }}
      />
      {/* Right eye white */}
      <motion.ellipse
        cx="64"
        cy="42"
        rx="3.2"
        ry={c.ry}
        fill="white"
        animate={blinkAnim}
        transition={{ ...blinkTransition, delay: 0.05 }}
        style={{ transformOrigin: "64px 42px" }}
      />
      {/* Pupils */}
      <circle cx="36" cy={c.pupilY} r={c.pupilR} fill="#1a1a2e" />
      <circle cx="64" cy={c.pupilY} r={c.pupilR} fill="#1a1a2e" />
      {/* Highlights */}
      <circle cx="35" cy={c.pupilY - 1} r="0.6" fill="white" opacity="0.9" />
      <circle cx="63" cy={c.pupilY - 1} r="0.6" fill="white" opacity="0.9" />

      {/* Cheek blush for happy */}
      {c.cheek && (
        <>
          <circle cx="28" cy="50" r="2.8" fill="#FF99A8" opacity="0.45" />
          <circle cx="72" cy="50" r="2.8" fill="#FF99A8" opacity="0.45" />
        </>
      )}

      {/* Tear for sad */}
      {expression === "triste" && (
        <motion.circle
          cx="38"
          cy="48"
          r="1.2"
          fill="#7BC5FF"
          opacity="0.85"
          animate={{ cy: [48, 56, 48], opacity: [0.85, 0, 0.85] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
      )}
    </svg>
  );
};

/* ────────────────────────── MOUTH ────────────────────────── */
const Mouth = ({ expression }: { expression: AvatarExpression }) => {
  if (expression === "dormindo") {
    return (
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
        <ellipse cx="50" cy="56" rx="3" ry="1.6" fill="#1a1a2e" opacity="0.6" />
      </svg>
    );
  }
  const paths: Record<AvatarExpression, JSX.Element> = {
    feliz: (
      <>
        <motion.path
          d="M 42 54 Q 50 60 58 54"
          stroke="#1a1a2e"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          animate={{ d: ["M 42 54 Q 50 60 58 54", "M 42 54 Q 50 62 58 54", "M 42 54 Q 50 60 58 54"] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <path d="M 43 54 Q 50 60 57 54 Z" fill="#FF6B8A" opacity="0.45" />
      </>
    ),
    triste: (
      <path
        d="M 42 58 Q 50 52 58 58"
        stroke="#1a1a2e"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    ),
    surpreso: (
      <ellipse cx="50" cy="56" rx="3" ry="3.5" fill="#1a1a2e" />
    ),
    bravo: (
      <path
        d="M 42 56 L 58 56"
        stroke="#1a1a2e"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
    curioso: (
      <path
        d="M 46 56 Q 50 58 54 56"
        stroke="#1a1a2e"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    ),
    dormindo: <></>,
  };
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
      {paths[expression]}
    </svg>
  );
};

/* ────────────────────────── OUTFIT ACCESSORIES ────────────────────────── */
const Outfit = ({ outfit }: { outfit: AvatarOutfit }) => {
  if (outfit === "nenhum") return null;

  const outfits: Record<Exclude<AvatarOutfit, "nenhum">, JSX.Element> = {
    astronauta: (
      // Capacete espacial transparente
      <>
        <ellipse
          cx="50"
          cy="44"
          rx="26"
          ry="24"
          fill="rgba(180, 220, 255, 0.18)"
          stroke="rgba(180, 220, 255, 0.55)"
          strokeWidth="0.8"
        />
        <ellipse cx="42" cy="36" rx="6" ry="4" fill="rgba(255,255,255,0.35)" />
        <rect x="36" y="64" width="28" height="4" rx="2" fill="rgba(150,180,210,0.7)" />
      </>
    ),
    musica: (
      // Headphones com aro e almofadas
      <>
        <path
          d="M 26 42 Q 26 22 50 22 Q 74 22 74 42"
          stroke="#1a1a2e"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="22" y="40" width="8" height="12" rx="3" fill="#FF6B8A" />
        <rect x="70" y="40" width="8" height="12" rx="3" fill="#FF6B8A" />
        <rect x="23" y="42" width="6" height="8" rx="2" fill="#1a1a2e" opacity="0.6" />
        <rect x="71" y="42" width="6" height="8" rx="2" fill="#1a1a2e" opacity="0.6" />
      </>
    ),
    explorador: (
      // Chapéu de explorador (safári)
      <>
        <ellipse cx="50" cy="28" rx="22" ry="3.5" fill="#8B5A2B" />
        <path
          d="M 38 28 Q 38 16 50 16 Q 62 16 62 28 Z"
          fill="#A0744A"
        />
        <rect x="38" y="25" width="24" height="2" fill="#5C3D1F" />
        <circle cx="58" cy="26" r="1.2" fill="#FFD700" />
      </>
    ),
    festa: (
      // Chapéu de festa cônico + confete
      <>
        <polygon points="50,12 42,30 58,30" fill="#FF6B8A" />
        <polygon points="50,12 46,21 50,21" fill="#FFD86E" opacity="0.7" />
        <circle cx="50" cy="12" r="2" fill="#FFD86E" />
        <circle cx="32" cy="34" r="1.2" fill="#7BC5FF" />
        <circle cx="68" cy="36" r="1.2" fill="#9EE493" />
        <circle cx="28" cy="40" r="1" fill="#FF9ECF" />
        <circle cx="72" cy="42" r="1" fill="#FFD86E" />
      </>
    ),
    cientista: (
      // Óculos de proteção + jaleco
      <>
        <rect x="28" y="38" width="44" height="2" rx="1" fill="#1a1a2e" opacity="0.7" />
        <circle cx="36" cy="42" r="6" fill="rgba(180,220,255,0.25)" stroke="#1a1a2e" strokeWidth="1.4" />
        <circle cx="64" cy="42" r="6" fill="rgba(180,220,255,0.25)" stroke="#1a1a2e" strokeWidth="1.4" />
        <path d="M 42 42 L 58 42" stroke="#1a1a2e" strokeWidth="1.4" />
        {/* Jaleco */}
        <path d="M 32 64 L 36 78 L 64 78 L 68 64 Z" fill="white" opacity="0.85" />
        <circle cx="44" cy="70" r="0.8" fill="#1a1a2e" />
        <circle cx="44" cy="74" r="0.8" fill="#1a1a2e" />
      </>
    ),
    "super-heroi": (
      // Máscara + capa
      <>
        {/* Capa atrás */}
        <path
          d="M 22 60 Q 14 76 24 86 L 50 78 L 76 86 Q 86 76 78 60 Z"
          fill="#D32F2F"
          opacity="0.85"
        />
        {/* Máscara */}
        <path
          d="M 28 38 Q 28 34 32 34 L 68 34 Q 72 34 72 38 L 70 46 Q 64 50 50 50 Q 36 50 30 46 Z"
          fill="#1a1a2e"
        />
        <ellipse cx="38" cy="42" rx="3.5" ry="3" fill="white" />
        <ellipse cx="62" cy="42" rx="3.5" ry="3" fill="white" />
        <circle cx="38" cy="42" r="1.6" fill="#1a1a2e" />
        <circle cx="62" cy="42" r="1.6" fill="#1a1a2e" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
      {outfits[outfit as Exclude<AvatarOutfit, "nenhum">]}
    </svg>
  );
};

/* ────────────────────────── MAIN AVATAR ────────────────────────── */
const KidzzAvatar = forwardRef<HTMLDivElement, Props>(
  ({ config, size = "lg", className = "", interactive = true, onTap }, ref) => {
    const [bounce, setBounce] = useState(false);
    const px = sizeMap[size];

    // Mask outfit/eyes/mouth IF dormindo (no overlays except sleep)
    const baseSrc = config.base === "ane" ? aneImg : pixelImg;

    const handleTap = () => {
      if (!interactive) return;
      setBounce(true);
      setTimeout(() => setBounce(false), 420);
      onTap?.();
    };

    return (
      <motion.div
        ref={ref}
        className={`relative select-none ${className}`}
        style={{ width: px, height: px, touchAction: "manipulation" }}
        onPointerDown={handleTap}
        animate={
          bounce
            ? { scale: [1, 0.92, 1.08, 1] }
            : { scale: [1, 1.025, 1], y: [0, -4, 0] }
        }
        transition={
          bounce
            ? { duration: 0.42, ease: "easeOut" }
            : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {/* Soft glow */}
        <div
          className="absolute inset-[-12%] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 216, 110, 0.22), transparent 70%)",
          }}
        />

        {/* BASE — corpo PNG (with hue rotation for color) */}
        <img
          src={baseSrc}
          alt="KIDZZ avatar"
          className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl pointer-events-none"
          draggable={false}
          decoding="async"
          style={{
            filter: `hue-rotate(${config.hueRotate}deg)`,
            transition: "filter 350ms ease",
          }}
        />

        {/* LAYERS — overlay anatomically positioned */}
        <div className="absolute inset-0 transition-opacity duration-250">
          <Eyes expression={config.expression} />
          <Mouth expression={config.expression} />
          <Outfit outfit={config.outfit} />
        </div>
      </motion.div>
    );
  }
);

KidzzAvatar.displayName = "KidzzAvatar";

export default KidzzAvatar;

/* ────────────────────────── PRESET LIBRARIES ────────────────────────── */

export const EXPRESSION_LIBRARY: { id: AvatarExpression; label: string }[] = [
  { id: "feliz", label: "Feliz" },
  { id: "curioso", label: "Curioso" },
  { id: "surpreso", label: "Surpreso" },
  { id: "triste", label: "Triste" },
  { id: "bravo", label: "Bravo" },
  { id: "dormindo", label: "Dormindo" },
];

export const OUTFIT_LIBRARY: { id: AvatarOutfit; label: string }[] = [
  { id: "nenhum", label: "Nenhum" },
  { id: "astronauta", label: "Astronauta" },
  { id: "musica", label: "Música" },
  { id: "explorador", label: "Explorador" },
  { id: "festa", label: "Festa" },
  { id: "cientista", label: "Cientista" },
  { id: "super-heroi", label: "Super-herói" },
];

export const COLOR_LIBRARY: { id: string; label: string; hueRotate: number }[] = [
  { id: "rosa", label: "Rosa Encantado", hueRotate: 0 },
  { id: "dourado", label: "Dourado", hueRotate: -30 },
  { id: "verde", label: "Verde Floresta", hueRotate: 90 },
  { id: "azul", label: "Azul Oceano", hueRotate: 180 },
  { id: "lilas", label: "Lilás Estrelado", hueRotate: 240 },
  { id: "laranja", label: "Laranja Aventura", hueRotate: -60 },
];

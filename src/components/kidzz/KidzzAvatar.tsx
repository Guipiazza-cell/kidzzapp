/* ── KIDZZ Avatar — Sistema de camadas reais (v2 — anatomia corrigida) ──
   Layer system: base (corpo PNG) + olhos (SVG) + boca (SVG) + acessório (SVG)
   - viewBox 100×150 para casar com PNG 1024×1536 (proporção 2:3)
   - Coordenadas anatomicamente alinhadas ao ROSTO do camaleão (parte superior)
     • Olhos da Ane: ~(35, 21) e (62, 23)  — olhos grandes, ligeiramente para os lados
     • Boca: ~y=29 (linha do sorriso)
     • Topo da cabeça: ~y=4-8 (chapéus, capacete)
     • Pescoço/colarinho: ~y=42-50 (jaleco, capa)
   - Expressões reais (sem emojis), idle breathing, auto-blink, tap bounce
*/

import { forwardRef, useState } from "react";
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
  hueRotate: number;
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

/* ─── Anatomy anchors per base (viewBox 100×150) ─── */
/* Ane: rosto centralizado, olhos grandes simétricos */
/* Pixel: cabeça inclinada para a esquerda, olhos um pouco menores */
type Anchors = {
  leftEye: { cx: number; cy: number };
  rightEye: { cx: number; cy: number };
  eyeRx: number;
  eyeRy: number;
  mouth: { cx: number; cy: number };
  headTop: { cx: number; cy: number }; // topo da cabeça (chapéus)
  headCenter: { cx: number; cy: number }; // centro da cabeça (capacete)
  faceWidth: number;
  collar: { cx: number; cy: number }; // pescoço (jaleco/capa)
};

const ANCHORS: Record<AvatarBase, Anchors> = {
  ane: {
    leftEye: { cx: 36, cy: 22 },
    rightEye: { cx: 62, cy: 23 },
    eyeRx: 6.5,
    eyeRy: 7,
    // Boca real da Ane fica logo abaixo dos olhos, na linha do focinho rosado
    mouth: { cx: 50, cy: 36 },
    headTop: { cx: 50, cy: 6 },
    headCenter: { cx: 50, cy: 19 },
    faceWidth: 44,
    collar: { cx: 50, cy: 50 },
  },
  pixel: {
    leftEye: { cx: 38, cy: 24 },
    rightEye: { cx: 60, cy: 25 },
    eyeRx: 5.5,
    eyeRy: 6,
    // Boca do Pixel é menor e mais próxima dos olhos
    mouth: { cx: 49, cy: 37 },
    headTop: { cx: 48, cy: 6 },
    headCenter: { cx: 48, cy: 21 },
    faceWidth: 40,
    collar: { cx: 50, cy: 51 },
  },
};

/* ────────────────────────── EYES ────────────────────────── */
/* Os olhos do PNG já existem — então NÃO desenhamos esclera nova,
   apenas overlays sutis (pálpebras, lágrima, sobrancelhas, brilho extra)
   alinhadas exatamente sobre as posições reais dos olhos. */

const Eyes = ({ expression, anchors }: { expression: AvatarExpression; anchors: Anchors }) => {
  const { leftEye: L, rightEye: R, eyeRx, eyeRy } = anchors;

  // Pálpebra superior (que pisca)
  const lid = (cx: number, cy: number, delay = 0) => (
    <motion.ellipse
      cx={cx}
      cy={cy}
      rx={eyeRx + 0.4}
      ry={eyeRy + 0.4}
      fill="currentColor"
      style={{ transformOrigin: `${cx}px ${cy}px`, color: "var(--avatar-skin, #f5a3c4)" }}
      animate={{ scaleY: [0, 0, 1, 0] }}
      transition={{
        duration: 5.2,
        repeat: Infinity,
        times: [0, 0.92, 0.96, 1],
        delay,
        ease: "easeInOut",
      }}
    />
  );

  if (expression === "dormindo") {
    return (
      <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid meet">
        {/* Pálpebras fechadas cobrindo os olhos do PNG */}
        <ellipse cx={L.cx} cy={L.cy} rx={eyeRx + 1} ry={eyeRy + 1} fill="#d98aac" opacity="0.95" />
        <ellipse cx={R.cx} cy={R.cy} rx={eyeRx + 1} ry={eyeRy + 1} fill="#d98aac" opacity="0.95" />
        <path d={`M ${L.cx - eyeRx} ${L.cy} Q ${L.cx} ${L.cy + 2} ${L.cx + eyeRx} ${L.cy}`} stroke="#1a1a2e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d={`M ${R.cx - eyeRx} ${R.cy} Q ${R.cx} ${R.cy + 2} ${R.cx + eyeRx} ${R.cy}`} stroke="#1a1a2e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* Z's flutuando ao lado direito da cabeça */}
        <motion.g animate={{ y: [-2, -6, -2], opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2.4, repeat: Infinity }}>
          <text x={R.cx + 12} y={R.cy - 6} fontSize="6" fill="white" stroke="#1a1a2e" strokeWidth="0.3" fontWeight="800">z</text>
          <text x={R.cx + 18} y={R.cy - 12} fontSize="4.5" fill="white" stroke="#1a1a2e" strokeWidth="0.2" fontWeight="800">z</text>
        </motion.g>
      </svg>
    );
  }

  // Brows (sobrancelhas) acima dos olhos
  const browY = (e: { cx: number; cy: number }) => e.cy - eyeRy - 1.5;

  return (
    <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid meet">
      {/* Sobrancelhas */}
      {expression === "triste" && (
        <>
          <path d={`M ${L.cx - 4} ${browY(L)} L ${L.cx + 4} ${browY(L) + 2}`} stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" />
          <path d={`M ${R.cx + 4} ${browY(R)} L ${R.cx - 4} ${browY(R) + 2}`} stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      {expression === "bravo" && (
        <>
          <path d={`M ${L.cx - 5} ${browY(L) - 1} L ${L.cx + 5} ${browY(L) + 2.5}`} stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" />
          <path d={`M ${R.cx + 5} ${browY(R) - 1} L ${R.cx - 5} ${browY(R) + 2.5}`} stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
      {expression === "surpreso" && (
        <>
          <path d={`M ${L.cx - 4} ${browY(L) - 2} Q ${L.cx} ${browY(L) - 5} ${L.cx + 4} ${browY(L) - 2}`} stroke="#1a1a2e" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d={`M ${R.cx - 4} ${browY(R) - 2} Q ${R.cx} ${browY(R) - 5} ${R.cx + 4} ${browY(R) - 2}`} stroke="#1a1a2e" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </>
      )}
      {expression === "curioso" && (
        <path d={`M ${R.cx - 4} ${browY(R) - 1} Q ${R.cx} ${browY(R) - 4} ${R.cx + 4} ${browY(R) - 1}`} stroke="#1a1a2e" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      )}

      {/* Pálpebras que piscam (cobrem temporariamente os olhos do PNG) */}
      {lid(L.cx, L.cy, 0)}
      {lid(R.cx, R.cy, 0.06)}

      {/* Brilho extra sobre os olhos para "vida" */}
      <circle cx={L.cx - 1.5} cy={L.cy - 2} r="1" fill="white" opacity="0.95" />
      <circle cx={R.cx - 1.5} cy={R.cy - 2} r="1" fill="white" opacity="0.95" />

      {/* Bochechas rosadas para feliz */}
      {expression === "feliz" && (
        <>
          <ellipse cx={L.cx - 7} cy={L.cy + 6} rx="3.5" ry="2.2" fill="#FF7AA0" opacity="0.45" />
          <ellipse cx={R.cx + 7} cy={R.cy + 6} rx="3.5" ry="2.2" fill="#FF7AA0" opacity="0.45" />
        </>
      )}

      {/* Lágrima para triste */}
      {expression === "triste" && (
        <motion.circle
          cx={L.cx + 1}
          cy={L.cy + eyeRy}
          r="1.2"
          fill="#7BC5FF"
          opacity="0.9"
          animate={{ cy: [L.cy + eyeRy, L.cy + eyeRy + 8], opacity: [0.9, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
      )}
    </svg>
  );
};

/* ────────────────────────── MOUTH ────────────────────────── */
const Mouth = ({ expression, anchors, base }: { expression: AvatarExpression; anchors: Anchors; base: AvatarBase }) => {
  const { mouth: M } = anchors;
  const w = base === "ane" ? 8 : 6.5; // half-width da boca, proporcional ao focinho
  // Tom de cobertura para mascarar a boca neutra do PNG (combina com a pele do mascote)
  const skin = base === "ane" ? "#f5b3cc" : "#cdb89a";

  // Patch base: oval suave que cobre a boca original do PNG na linha do focinho
  const Cover = () => (
    <ellipse cx={M.cx} cy={M.cy} rx={w + 1} ry={2.6} fill={skin} opacity="0.85" />
  );

  if (expression === "dormindo") {
    return (
      <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid meet">
        <Cover />
        <ellipse cx={M.cx} cy={M.cy} rx="2.6" ry="1.1" fill="#1a1a2e" opacity="0.7" />
      </svg>
    );
  }

  const paths: Record<AvatarExpression, JSX.Element> = {
    feliz: (
      <>
        <motion.path
          d={`M ${M.cx - w} ${M.cy - 0.5} Q ${M.cx} ${M.cy + 4.5} ${M.cx + w} ${M.cy - 0.5}`}
          stroke="#1a1a2e"
          strokeWidth="1.7"
          fill="none"
          strokeLinecap="round"
          animate={{ d: [
            `M ${M.cx - w} ${M.cy - 0.5} Q ${M.cx} ${M.cy + 4.5} ${M.cx + w} ${M.cy - 0.5}`,
            `M ${M.cx - w} ${M.cy - 0.5} Q ${M.cx} ${M.cy + 5.5} ${M.cx + w} ${M.cy - 0.5}`,
            `M ${M.cx - w} ${M.cy - 0.5} Q ${M.cx} ${M.cy + 4.5} ${M.cx + w} ${M.cy - 0.5}`,
          ] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        {/* Interior do sorriso (rosa) */}
        <path d={`M ${M.cx - w + 0.8} ${M.cy} Q ${M.cx} ${M.cy + 4} ${M.cx + w - 0.8} ${M.cy} Z`} fill="#E0436A" opacity="0.55" />
      </>
    ),
    triste: (
      <path d={`M ${M.cx - w} ${M.cy + 2.5} Q ${M.cx} ${M.cy - 2} ${M.cx + w} ${M.cy + 2.5}`} stroke="#1a1a2e" strokeWidth="1.7" fill="none" strokeLinecap="round" />
    ),
    surpreso: (
      <ellipse cx={M.cx} cy={M.cy + 0.5} rx="2.6" ry="3.2" fill="#1a1a2e" />
    ),
    bravo: (
      <path d={`M ${M.cx - w} ${M.cy + 0.5} L ${M.cx + w} ${M.cy + 0.5}`} stroke="#1a1a2e" strokeWidth="1.9" strokeLinecap="round" />
    ),
    curioso: (
      <path d={`M ${M.cx - 4.5} ${M.cy + 0.5} Q ${M.cx} ${M.cy + 2.5} ${M.cx + 4.5} ${M.cy - 0.5}`} stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    ),
    dormindo: <></>,
  };
  return (
    <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid meet">
      <Cover />
      {paths[expression]}
    </svg>
  );
};

/* ────────────────────────── OUTFIT ACCESSORIES ────────────────────────── */
const Outfit = ({ outfit, anchors }: { outfit: AvatarOutfit; anchors: Anchors }) => {
  if (outfit === "nenhum") return null;
  const { headTop: HT, headCenter: HC, collar: C, faceWidth: FW, leftEye: L, rightEye: R } = anchors;

  const outfits: Record<Exclude<AvatarOutfit, "nenhum">, JSX.Element> = {
    astronauta: (
      // Capacete envolvendo TODA a cabeça
      <>
        <ellipse cx={HC.cx} cy={HC.cy + 2} rx={FW / 2 + 6} ry={FW / 2 + 4} fill="rgba(180, 220, 255, 0.18)" stroke="rgba(200, 230, 255, 0.7)" strokeWidth="0.9" />
        {/* Reflexo no canto superior do capacete */}
        <ellipse cx={HC.cx - 10} cy={HC.cy - 8} rx="5" ry="3.5" fill="rgba(255,255,255,0.45)" />
        {/* Anel inferior do capacete */}
        <rect x={HC.cx - FW / 2 - 2} y={HC.cy + FW / 2 - 2} width={FW + 4} height="3" rx="1.5" fill="rgba(140,170,200,0.85)" />
      </>
    ),
    musica: (
      // Headphones por cima da cabeça com almofadas nas laterais (na altura dos olhos)
      <>
        <path
          d={`M ${HC.cx - FW / 2 - 1} ${L.cy} Q ${HC.cx - FW / 2 - 1} ${HT.cy - 1} ${HC.cx} ${HT.cy - 2} Q ${HC.cx + FW / 2 + 1} ${HT.cy - 1} ${HC.cx + FW / 2 + 1} ${R.cy}`}
          stroke="#1a1a2e"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        <rect x={HC.cx - FW / 2 - 4} y={L.cy - 3} width="5" height="9" rx="2" fill="#FF6B8A" />
        <rect x={HC.cx + FW / 2 - 1} y={R.cy - 3} width="5" height="9" rx="2" fill="#FF6B8A" />
        <rect x={HC.cx - FW / 2 - 3} y={L.cy - 2} width="3" height="7" rx="1" fill="#1a1a2e" opacity="0.55" />
        <rect x={HC.cx + FW / 2} y={R.cy - 2} width="3" height="7" rx="1" fill="#1a1a2e" opacity="0.55" />
      </>
    ),
    explorador: (
      // Chapéu safári apoiado na testa (acima dos olhos)
      <>
        <ellipse cx={HC.cx} cy={HT.cy + 6} rx={FW / 2 + 5} ry="2.6" fill="#8B5A2B" />
        <path d={`M ${HC.cx - FW / 2 + 2} ${HT.cy + 6} Q ${HC.cx - 8} ${HT.cy - 4} ${HC.cx} ${HT.cy - 4} Q ${HC.cx + 8} ${HT.cy - 4} ${HC.cx + FW / 2 - 2} ${HT.cy + 6} Z`} fill="#A0744A" />
        <rect x={HC.cx - FW / 2 + 2} y={HT.cy + 4} width={FW - 4} height="1.8" fill="#5C3D1F" />
        <circle cx={HC.cx + 6} cy={HT.cy + 4.8} r="1" fill="#FFD700" />
      </>
    ),
    festa: (
      // Chapéu cônico apontando para cima da cabeça
      <>
        <polygon points={`${HC.cx},${HT.cy - 14} ${HC.cx - 7},${HT.cy + 4} ${HC.cx + 7},${HT.cy + 4}`} fill="#FF6B8A" />
        <polygon points={`${HC.cx},${HT.cy - 14} ${HC.cx - 3},${HT.cy - 4} ${HC.cx + 3},${HT.cy - 4}`} fill="#FFD86E" opacity="0.75" />
        <circle cx={HC.cx} cy={HT.cy - 14} r="1.6" fill="#FFD86E" />
        {/* Confetes ao redor */}
        <circle cx={HC.cx - 16} cy={HT.cy + 2} r="1" fill="#7BC5FF" />
        <circle cx={HC.cx + 16} cy={HT.cy + 4} r="1" fill="#9EE493" />
        <circle cx={HC.cx - 20} cy={HT.cy + 10} r="0.9" fill="#FF9ECF" />
        <circle cx={HC.cx + 20} cy={HT.cy + 12} r="0.9" fill="#FFD86E" />
      </>
    ),
    cientista: (
      // Óculos redondos posicionados EXATAMENTE sobre os olhos + jaleco no colarinho
      <>
        {/* Ponte entre os olhos */}
        <path d={`M ${L.cx + 5} ${L.cy} L ${R.cx - 5} ${R.cy}`} stroke="#1a1a2e" strokeWidth="1.4" />
        {/* Aros redondos sobre cada olho */}
        <circle cx={L.cx} cy={L.cy} r={Math.max(6.5, anchors.eyeRx + 1.5)} fill="rgba(200,230,255,0.18)" stroke="#1a1a2e" strokeWidth="1.6" />
        <circle cx={R.cx} cy={R.cy} r={Math.max(6.5, anchors.eyeRx + 1.5)} fill="rgba(200,230,255,0.18)" stroke="#1a1a2e" strokeWidth="1.6" />
        {/* Hastes laterais */}
        <path d={`M ${L.cx - anchors.eyeRx - 1.5} ${L.cy} L ${L.cx - anchors.eyeRx - 5} ${L.cy + 1}`} stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" />
        <path d={`M ${R.cx + anchors.eyeRx + 1.5} ${R.cy} L ${R.cx + anchors.eyeRx + 5} ${R.cy + 1}`} stroke="#1a1a2e" strokeWidth="1.4" strokeLinecap="round" />
        {/* Jaleco no colarinho */}
        <path d={`M ${C.cx - 14} ${C.cy} L ${C.cx - 16} ${C.cy + 16} L ${C.cx + 16} ${C.cy + 16} L ${C.cx + 14} ${C.cy} Z`} fill="white" opacity="0.9" />
        <path d={`M ${C.cx - 14} ${C.cy} L ${C.cx} ${C.cy + 6} L ${C.cx + 14} ${C.cy} Z`} fill="white" opacity="0.95" />
        <circle cx={C.cx - 6} cy={C.cy + 8} r="0.7" fill="#1a1a2e" />
        <circle cx={C.cx - 6} cy={C.cy + 12} r="0.7" fill="#1a1a2e" />
      </>
    ),
    "super-heroi": (
      <>
        {/* Capa atrás (no colarinho) */}
        <path d={`M ${C.cx - 16} ${C.cy + 2} Q ${C.cx - 24} ${C.cy + 24} ${C.cx - 12} ${C.cy + 32} L ${C.cx} ${C.cy + 26} L ${C.cx + 12} ${C.cy + 32} Q ${C.cx + 24} ${C.cy + 24} ${C.cx + 16} ${C.cy + 2} Z`} fill="#D32F2F" opacity="0.9" />
        {/* Máscara cobrindo a área dos olhos */}
        <path d={`M ${L.cx - 9} ${L.cy - 4} Q ${HC.cx} ${HC.cy - 6} ${R.cx + 9} ${R.cy - 4} L ${R.cx + 7} ${R.cy + 6} Q ${HC.cx} ${HC.cy + 4} ${L.cx - 7} ${L.cy + 6} Z`} fill="#1a1a2e" />
        {/* Aberturas para os olhos do PNG aparecerem */}
        <ellipse cx={L.cx} cy={L.cy} rx={anchors.eyeRx + 0.5} ry={anchors.eyeRy + 0.5} fill="white" />
        <ellipse cx={R.cx} cy={R.cy} rx={anchors.eyeRx + 0.5} ry={anchors.eyeRy + 0.5} fill="white" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid meet">
      {outfits[outfit as Exclude<AvatarOutfit, "nenhum">]}
    </svg>
  );
};

/* ────────────────────────── MAIN AVATAR ────────────────────────── */
const KidzzAvatar = forwardRef<HTMLDivElement, Props>(
  ({ config, size = "lg", className = "", interactive = true, onTap }, ref) => {
    const [bounce, setBounce] = useState(false);
    const px = sizeMap[size];
    // Container 2:3 para casar com o PNG
    const w = px;
    const h = Math.round(px * 1.5);

    const baseSrc = config.base === "ane" ? aneImg : pixelImg;
    const anchors = ANCHORS[config.base];

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
        style={{ width: w, height: h, touchAction: "manipulation" }}
        onPointerDown={handleTap}
        animate={
          bounce
            ? { scale: [1, 0.92, 1.08, 1] }
            : { scale: [1, 1.025, 1], y: [0, -3, 0] }
        }
        transition={
          bounce
            ? { duration: 0.42, ease: "easeOut" }
            : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {/* Soft glow */}
        <div
          className="absolute inset-[-8%] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(255, 216, 110, 0.22), transparent 65%)",
          }}
        />

        {/* BASE — corpo PNG (2:3) */}
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

        {/* LAYERS — overlay com viewBox 100×150 alinhado ao PNG */}
        <div className="absolute inset-0 transition-opacity duration-200">
          {/* Acessório atrás dos olhos quando aplicável (capacete, festa) */}
          {(config.outfit === "astronauta" || config.outfit === "festa" || config.outfit === "explorador" || config.outfit === "musica" || config.outfit === "super-heroi") && (
            <Outfit outfit={config.outfit} anchors={anchors} base={config.base} />
          )}
          <Eyes expression={config.expression} anchors={anchors} />
          <Mouth expression={config.expression} anchors={anchors} base={config.base} />
          {/* Cientista (óculos) à frente para alinhar perfeitamente sobre olhos */}
          {config.outfit === "cientista" && <Outfit outfit={config.outfit} anchors={anchors} base={config.base} />}
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

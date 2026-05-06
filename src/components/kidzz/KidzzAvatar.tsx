/* ── KIDZZ Avatar — Sistema de camadas reais (v3 — ancoragem premium) ──
   Layer system: base PNG + overlays SVG ancorados anatomicamente.
   - viewBox 100×150 alinhado ao PNG 1024×1536 (proporção 2:3)
   - Anchors verificados por inspeção do PNG real:
     • Ane: olhos em (36,19) e (64,16) — boca/sorriso em (48,28)
     • Pixel: olhos em (38,26) e (61,27) — boca em (48,35) — já tem óculos próprios!
   - Drop-shadow em overlays para integração visual ("não-colado")
   - Fade suave 200ms entre trocas, idle breathing + auto-blink
   - Sem emojis, sem placeholders, sem círculos genéricos
*/

import { forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import aneImg from "@/assets/ane-chameleon.webp";
import pixelImg from "@/assets/pixel-chameleon.webp";

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

/* ─── Anchors anatômicos (viewBox 100×150) — verificados por inspeção do PNG ─── */
type Anchors = {
  leftEye: { cx: number; cy: number };
  rightEye: { cx: number; cy: number };
  eyeRx: number;
  eyeRy: number;
  mouth: { cx: number; cy: number };
  mouthW: number; // meia-largura da boca real do PNG
  headTop: { cx: number; cy: number };
  headCenter: { cx: number; cy: number };
  faceWidth: number;
  collar: { cx: number; cy: number };
  skin: string; // tom da pele para mascarar features
};

const ANCHORS: Record<AvatarBase, Anchors> = {
  ane: {
    // Olhos enormes, ligeiramente assimétricos (cabeça inclinada à direita)
    leftEye: { cx: 36, cy: 19 },
    rightEye: { cx: 64, cy: 16 },
    eyeRx: 7,
    eyeRy: 7.5,
    mouth: { cx: 48, cy: 28 },
    mouthW: 9,
    headTop: { cx: 48, cy: 4 },
    headCenter: { cx: 48, cy: 17 },
    faceWidth: 48,
    collar: { cx: 48, cy: 47 },
    skin: "#f5b3cc",
  },
  pixel: {
    // Pixel JÁ tem óculos no PNG — overlays devem evitar a área dos óculos
    leftEye: { cx: 38, cy: 26 },
    rightEye: { cx: 61, cy: 27 },
    eyeRx: 5.5,
    eyeRy: 6,
    mouth: { cx: 48, cy: 35 },
    mouthW: 6.5,
    headTop: { cx: 48, cy: 8 },
    headCenter: { cx: 48, cy: 22 },
    faceWidth: 42,
    collar: { cx: 48, cy: 48 },
    skin: "#2a2a3a",
  },
};

/* Drop-shadow comum aplicado em overlays para integrá-los ao corpo */
const SOFT_SHADOW = "drop-shadow(0 1.2px 1.4px rgba(0,0,0,0.25)) drop-shadow(0 0.4px 0.5px rgba(0,0,0,0.18))";

/* ─────────────────────────── EYES ─────────────────────────── */
const Eyes = ({ expression, anchors }: { expression: AvatarExpression; anchors: Anchors }) => {
  const { leftEye: L, rightEye: R, eyeRx, eyeRy, skin } = anchors;

  // Pálpebra que pisca (mesmo tom da pele para fundir com o PNG)
  const lid = (cx: number, cy: number, delay = 0) => (
    <motion.ellipse
      cx={cx}
      cy={cy}
      rx={eyeRx + 0.6}
      ry={eyeRy + 0.6}
      fill={skin}
      animate={{ scaleY: [0, 0, 1, 0] }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
      transition={{
        duration: 5.4,
        repeat: Infinity,
        times: [0, 0.93, 0.965, 1],
        delay,
        ease: "easeInOut",
      }}
    />
  );

  if (expression === "dormindo") {
    return (
      <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid meet" style={{ filter: SOFT_SHADOW }}>
        {/* Pálpebras fechadas — cobrem inteiramente os olhos do PNG */}
        <ellipse cx={L.cx} cy={L.cy} rx={eyeRx + 1.4} ry={eyeRy + 1.4} fill={skin} />
        <ellipse cx={R.cx} cy={R.cy} rx={eyeRx + 1.4} ry={eyeRy + 1.4} fill={skin} />
        <path d={`M ${L.cx - eyeRx} ${L.cy + 0.5} Q ${L.cx} ${L.cy + 2.5} ${L.cx + eyeRx} ${L.cy + 0.5}`} stroke="#1a1a2e" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <path d={`M ${R.cx - eyeRx} ${R.cy + 0.5} Q ${R.cx} ${R.cy + 2.5} ${R.cx + eyeRx} ${R.cy + 0.5}`} stroke="#1a1a2e" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <motion.g animate={{ y: [-2, -6, -2], opacity: [0.4, 0.95, 0.4] }} transition={{ duration: 2.4, repeat: Infinity }}>
          <text x={R.cx + 10} y={R.cy - 8} fontSize="6" fill="white" stroke="#1a1a2e" strokeWidth="0.3" fontWeight="800">z</text>
          <text x={R.cx + 17} y={R.cy - 14} fontSize="4.5" fill="white" stroke="#1a1a2e" strokeWidth="0.2" fontWeight="800">z</text>
        </motion.g>
      </svg>
    );
  }

  const browY = (e: { cx: number; cy: number }) => e.cy - eyeRy - 1.5;

  return (
    <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid meet" style={{ filter: SOFT_SHADOW }}>
      {/* Sobrancelhas reais (substituem expressão neutra do PNG quando não-feliz) */}
      {expression === "triste" && (
        <>
          <path d={`M ${L.cx - 5} ${browY(L)} L ${L.cx + 4} ${browY(L) + 2.5}`} stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
          <path d={`M ${R.cx + 5} ${browY(R)} L ${R.cx - 4} ${browY(R) + 2.5}`} stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {expression === "bravo" && (
        <>
          <path d={`M ${L.cx - 6} ${browY(L) - 1.5} L ${L.cx + 5} ${browY(L) + 3}`} stroke="#1a1a2e" strokeWidth="1.9" strokeLinecap="round" />
          <path d={`M ${R.cx + 6} ${browY(R) - 1.5} L ${R.cx - 5} ${browY(R) + 3}`} stroke="#1a1a2e" strokeWidth="1.9" strokeLinecap="round" />
        </>
      )}
      {expression === "surpreso" && (
        <>
          <path d={`M ${L.cx - 5} ${browY(L) - 2.5} Q ${L.cx} ${browY(L) - 5.5} ${L.cx + 5} ${browY(L) - 2.5}`} stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d={`M ${R.cx - 5} ${browY(R) - 2.5} Q ${R.cx} ${browY(R) - 5.5} ${R.cx + 5} ${browY(R) - 2.5}`} stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {expression === "curioso" && (
        <path d={`M ${R.cx - 5} ${browY(R) - 1.5} Q ${R.cx} ${browY(R) - 4.5} ${R.cx + 5} ${browY(R) - 1.5}`} stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}

      {/* Pálpebras de blink */}
      {lid(L.cx, L.cy, 0)}
      {lid(R.cx, R.cy, 0.08)}

      {/* Brilho extra nos olhos (vida) */}
      <circle cx={L.cx - eyeRx * 0.25} cy={L.cy - eyeRy * 0.4} r={eyeRx * 0.18} fill="white" opacity="0.85" />
      <circle cx={R.cx - eyeRx * 0.25} cy={R.cy - eyeRy * 0.4} r={eyeRx * 0.18} fill="white" opacity="0.85" />

      {/* Bochechas para feliz */}
      {expression === "feliz" && (
        <>
          <ellipse cx={L.cx - 8} cy={L.cy + 8} rx="4" ry="2.4" fill="#FF7AA0" opacity="0.45" />
          <ellipse cx={R.cx + 8} cy={R.cy + 8} rx="4" ry="2.4" fill="#FF7AA0" opacity="0.45" />
        </>
      )}

      {/* Lágrima para triste */}
      {expression === "triste" && (
        <motion.circle
          cx={L.cx + 1.5}
          cy={L.cy + eyeRy}
          r="1.4"
          fill="#7BC5FF"
          animate={{ cy: [L.cy + eyeRy, L.cy + eyeRy + 9], opacity: [0.95, 0] }}
          transition={{ duration: 2.6, repeat: Infinity }}
        />
      )}
    </svg>
  );
};

/* ─────────────────────────── MOUTH ─────────────────────────── */
/* Estratégia: cobrir boca neutra do PNG com um patch de pele com gradiente
   radial (bordas suaves — não-oval duro) e desenhar a expressão por cima. */
const Mouth = ({ expression, anchors, base }: { expression: AvatarExpression; anchors: Anchors; base: AvatarBase }) => {
  const { mouth: M, mouthW: w, skin } = anchors;
  const gradId = `mouth-cover-${base}`;

  const Cover = () => (
    <>
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={skin} stopOpacity="0.95" />
          <stop offset="70%" stopColor={skin} stopOpacity="0.7" />
          <stop offset="100%" stopColor={skin} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={M.cx} cy={M.cy} rx={w + 2.5} ry={3.6} fill={`url(#${gradId})`} />
    </>
  );

  if (expression === "dormindo") {
    return (
      <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid meet" style={{ filter: SOFT_SHADOW }}>
        <Cover />
        <ellipse cx={M.cx} cy={M.cy} rx="2.6" ry="1" fill="#1a1a2e" opacity="0.7" />
      </svg>
    );
  }

  const paths: Record<AvatarExpression, JSX.Element> = {
    feliz: (
      <>
        <motion.path
          d={`M ${M.cx - w} ${M.cy} Q ${M.cx} ${M.cy + 5} ${M.cx + w} ${M.cy}`}
          stroke="#1a1a2e"
          strokeWidth="1.7"
          fill="none"
          strokeLinecap="round"
          animate={{ d: [
            `M ${M.cx - w} ${M.cy} Q ${M.cx} ${M.cy + 5} ${M.cx + w} ${M.cy}`,
            `M ${M.cx - w} ${M.cy} Q ${M.cx} ${M.cy + 5.8} ${M.cx + w} ${M.cy}`,
            `M ${M.cx - w} ${M.cy} Q ${M.cx} ${M.cy + 5} ${M.cx + w} ${M.cy}`,
          ] }}
          transition={{ duration: 2.6, repeat: Infinity }}
        />
        {/* Interior rosado do sorriso */}
        <path d={`M ${M.cx - w + 1} ${M.cy + 0.6} Q ${M.cx} ${M.cy + 4.5} ${M.cx + w - 1} ${M.cy + 0.6} Z`} fill="#E0436A" opacity="0.5" />
      </>
    ),
    triste: (
      <path d={`M ${M.cx - w} ${M.cy + 3} Q ${M.cx} ${M.cy - 2} ${M.cx + w} ${M.cy + 3}`} stroke="#1a1a2e" strokeWidth="1.7" fill="none" strokeLinecap="round" />
    ),
    surpreso: (
      <ellipse cx={M.cx} cy={M.cy + 1} rx="2.8" ry="3.4" fill="#1a1a2e" />
    ),
    bravo: (
      <path d={`M ${M.cx - w} ${M.cy + 1} L ${M.cx + w} ${M.cy + 1}`} stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
    ),
    curioso: (
      <path d={`M ${M.cx - w + 1} ${M.cy + 1} Q ${M.cx} ${M.cy + 3} ${M.cx + w - 1} ${M.cy - 0.5}`} stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    ),
    dormindo: <></>,
  };
  return (
    <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid meet" style={{ filter: SOFT_SHADOW }}>
      <Cover />
      {paths[expression]}
    </svg>
  );
};

/* ─────────────────────── OUTFITS / ACESSÓRIOS ─────────────────────── */
const Outfit = ({ outfit, anchors, base }: { outfit: AvatarOutfit; anchors: Anchors; base: AvatarBase }) => {
  if (outfit === "nenhum") return null;
  const { headTop: HT, headCenter: HC, collar: C, faceWidth: FW, leftEye: L, rightEye: R, eyeRx, eyeRy } = anchors;
  // Lentes do cientista — escala ancorada ao tamanho real dos olhos
  const lensR = eyeRx + 2.2;

  const outfits: Record<Exclude<AvatarOutfit, "nenhum">, JSX.Element> = {
    astronauta: (
      // Capacete envolvendo a cabeça, com profundidade
      <>
        <defs>
          <radialGradient id={`helmet-${base}`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="50%" stopColor="rgba(180,220,255,0.18)" />
            <stop offset="100%" stopColor="rgba(120,160,210,0.32)" />
          </radialGradient>
        </defs>
        <ellipse cx={HC.cx} cy={HC.cy + 3} rx={FW / 2 + 7} ry={FW / 2 + 6} fill={`url(#helmet-${base})`} stroke="rgba(200,230,255,0.75)" strokeWidth="0.9" />
        {/* Reflexo alto */}
        <ellipse cx={HC.cx - 12} cy={HC.cy - 9} rx="6" ry="3.8" fill="rgba(255,255,255,0.55)" />
        {/* Anel inferior do capacete (apoio no pescoço) */}
        <rect x={HC.cx - FW / 2 - 3} y={HC.cy + FW / 2 + 1} width={FW + 6} height="3.5" rx="1.7" fill="rgba(140,170,200,0.92)" />
        <rect x={HC.cx - FW / 2 - 3} y={HC.cy + FW / 2 + 1} width={FW + 6} height="1.2" rx="0.6" fill="rgba(255,255,255,0.5)" />
      </>
    ),
    musica: (
      // Headphones com arco que segue o topo da cabeça e almofadas nas orelhas
      <>
        <path
          d={`M ${HC.cx - FW / 2 - 1.5} ${L.cy + 1} Q ${HC.cx - FW / 2 - 2} ${HT.cy - 1} ${HC.cx} ${HT.cy - 3} Q ${HC.cx + FW / 2 + 2} ${HT.cy - 1} ${HC.cx + FW / 2 + 1.5} ${R.cy + 1}`}
          stroke="#1a1a2e"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        {/* Detalhe da haste (highlight) */}
        <path
          d={`M ${HC.cx - FW / 2 - 1.5} ${L.cy + 1} Q ${HC.cx - FW / 2 - 2} ${HT.cy - 1} ${HC.cx} ${HT.cy - 3.5}`}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.9"
          fill="none"
          strokeLinecap="round"
        />
        {/* Almofadas */}
        <rect x={HC.cx - FW / 2 - 5} y={L.cy - 3} width="6" height="10" rx="2.5" fill="#FF6B8A" />
        <rect x={HC.cx + FW / 2 - 1} y={R.cy - 3} width="6" height="10" rx="2.5" fill="#FF6B8A" />
        {/* Speaker interior */}
        <rect x={HC.cx - FW / 2 - 4} y={L.cy - 2} width="4" height="8" rx="1.5" fill="#1a1a2e" opacity="0.6" />
        <rect x={HC.cx + FW / 2} y={R.cy - 2} width="4" height="8" rx="1.5" fill="#1a1a2e" opacity="0.6" />
      </>
    ),
    explorador: (
      // Chapéu safári apoiado na testa
      <>
        {/* Aba */}
        <ellipse cx={HC.cx} cy={HT.cy + 7} rx={FW / 2 + 6} ry="3" fill="#8B5A2B" />
        <ellipse cx={HC.cx} cy={HT.cy + 6.2} rx={FW / 2 + 6} ry="1.2" fill="#A0744A" />
        {/* Copa */}
        <path d={`M ${HC.cx - FW / 2 + 2} ${HT.cy + 7} Q ${HC.cx - 9} ${HT.cy - 5} ${HC.cx} ${HT.cy - 5} Q ${HC.cx + 9} ${HT.cy - 5} ${HC.cx + FW / 2 - 2} ${HT.cy + 7} Z`} fill="#A0744A" />
        {/* Faixa */}
        <rect x={HC.cx - FW / 2 + 2} y={HT.cy + 5} width={FW - 4} height="2.2" fill="#5C3D1F" />
        {/* Insígnia dourada */}
        <circle cx={HC.cx + 7} cy={HT.cy + 6} r="1.3" fill="#FFD700" stroke="#5C3D1F" strokeWidth="0.4" />
      </>
    ),
    festa: (
      // Chapéu cônico com listras
      <>
        <polygon points={`${HC.cx},${HT.cy - 16} ${HC.cx - 8},${HT.cy + 4} ${HC.cx + 8},${HT.cy + 4}`} fill="#FF6B8A" />
        <polygon points={`${HC.cx},${HT.cy - 16} ${HC.cx - 4},${HT.cy - 5} ${HC.cx + 4},${HT.cy - 5}`} fill="#FFD86E" opacity="0.85" />
        <polygon points={`${HC.cx - 6},${HT.cy + 0.5} ${HC.cx - 8},${HT.cy + 4} ${HC.cx + 8},${HT.cy + 4} ${HC.cx + 6},${HT.cy + 0.5}`} fill="#7BC5FF" opacity="0.6" />
        {/* Pompom no topo */}
        <circle cx={HC.cx} cy={HT.cy - 16} r="1.8" fill="#FFD86E" stroke="#1a1a2e" strokeWidth="0.3" />
        {/* Confetes ao redor */}
        <circle cx={HC.cx - 18} cy={HT.cy + 2} r="1.1" fill="#7BC5FF" />
        <circle cx={HC.cx + 18} cy={HT.cy + 4} r="1.1" fill="#9EE493" />
        <circle cx={HC.cx - 22} cy={HT.cy + 11} r="1" fill="#FF9ECF" />
        <circle cx={HC.cx + 22} cy={HT.cy + 13} r="1" fill="#FFD86E" />
      </>
    ),
    cientista: (
      // Óculos redondos ancorados em cada olho real
      // Para Pixel: sobrepõe os óculos do PNG (combinam) → reforça os aros
      // Para Ane: óculos novos como acessório
      <>
        {/* Ponte fina entre as lentes (segue inclinação real dos olhos) */}
        <path d={`M ${L.cx + lensR - 0.5} ${L.cy} L ${R.cx - lensR + 0.5} ${R.cy}`} stroke="#1a1a2e" strokeWidth="1.6" strokeLinecap="round" />
        {/* Aros redondos sobre cada olho */}
        <circle cx={L.cx} cy={L.cy} r={lensR} fill="rgba(220,240,255,0.18)" stroke="#1a1a2e" strokeWidth="1.9" />
        <circle cx={R.cx} cy={R.cy} r={lensR} fill="rgba(220,240,255,0.18)" stroke="#1a1a2e" strokeWidth="1.9" />
        {/* Brilho de lente */}
        <path d={`M ${L.cx - lensR * 0.55} ${L.cy - lensR * 0.45} A ${lensR * 0.65} ${lensR * 0.65} 0 0 1 ${L.cx - lensR * 0.05} ${L.cy - lensR * 0.72}`} stroke="white" strokeWidth="1.1" fill="none" opacity="0.75" strokeLinecap="round" />
        <path d={`M ${R.cx - lensR * 0.55} ${R.cy - lensR * 0.45} A ${lensR * 0.65} ${lensR * 0.65} 0 0 1 ${R.cx - lensR * 0.05} ${R.cy - lensR * 0.72}`} stroke="white" strokeWidth="1.1" fill="none" opacity="0.75" strokeLinecap="round" />
        {/* Hastes laterais */}
        <path d={`M ${L.cx - lensR} ${L.cy + 0.8} L ${L.cx - lensR - 5.5} ${L.cy + 1.8}`} stroke="#1a1a2e" strokeWidth="1.6" strokeLinecap="round" />
        <path d={`M ${R.cx + lensR} ${R.cy + 0.8} L ${R.cx + lensR + 5.5} ${R.cy + 1.8}`} stroke="#1a1a2e" strokeWidth="1.6" strokeLinecap="round" />
        {/* Jaleco no colarinho — segue contorno do pescoço */}
        <path d={`M ${C.cx - 16} ${C.cy - 1} Q ${C.cx - 18} ${C.cy + 8} ${C.cx - 17} ${C.cy + 18} L ${C.cx + 17} ${C.cy + 18} Q ${C.cx + 18} ${C.cy + 8} ${C.cx + 16} ${C.cy - 1} Z`} fill="white" opacity="0.93" />
        <path d={`M ${C.cx - 16} ${C.cy - 1} L ${C.cx} ${C.cy + 7} L ${C.cx + 16} ${C.cy - 1} Z`} fill="white" />
        {/* Sombra sob a gola */}
        <path d={`M ${C.cx - 16} ${C.cy - 1} L ${C.cx} ${C.cy + 7} L ${C.cx + 16} ${C.cy - 1}`} stroke="#dcdcdc" strokeWidth="0.4" fill="none" />
        <circle cx={C.cx - 6} cy={C.cy + 9} r="0.8" fill="#1a1a2e" />
        <circle cx={C.cx - 6} cy={C.cy + 13} r="0.8" fill="#1a1a2e" />
      </>
    ),
    "super-heroi": (
      <>
        <defs>
          <linearGradient id={`cape-${base}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E04848" />
            <stop offset="100%" stopColor="#9B1A1A" />
          </linearGradient>
        </defs>
        {/* Capa atrás (no colarinho) */}
        <path d={`M ${C.cx - 18} ${C.cy} Q ${C.cx - 26} ${C.cy + 26} ${C.cx - 13} ${C.cy + 34} L ${C.cx} ${C.cy + 28} L ${C.cx + 13} ${C.cy + 34} Q ${C.cx + 26} ${C.cy + 26} ${C.cx + 18} ${C.cy} Z`} fill={`url(#cape-${base})`} />
        {/* Máscara cobrindo a região dos olhos */}
        <path d={`M ${L.cx - 10} ${L.cy - 5} Q ${HC.cx} ${HC.cy - 7} ${R.cx + 10} ${R.cy - 5} L ${R.cx + 8} ${R.cy + 7} Q ${HC.cx} ${HC.cy + 5} ${L.cx - 8} ${L.cy + 7} Z`} fill="#1a1a2e" />
        {/* Aberturas para os olhos do PNG aparecerem */}
        <ellipse cx={L.cx} cy={L.cy} rx={eyeRx + 0.6} ry={eyeRy + 0.6} fill="white" />
        <ellipse cx={R.cx} cy={R.cy} rx={eyeRx + 0.6} ry={eyeRy + 0.6} fill="white" />
        {/* Brilho da máscara */}
        <path d={`M ${L.cx - 8} ${L.cy - 4} Q ${HC.cx - 4} ${HC.cy - 6} ${HC.cx + 2} ${HC.cy - 5}`} stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid meet" style={{ filter: SOFT_SHADOW }}>
      {outfits[outfit as Exclude<AvatarOutfit, "nenhum">]}
    </svg>
  );
};

/* ─────────────────────────── MAIN AVATAR ─────────────────────────── */
const KidzzAvatar = forwardRef<HTMLDivElement, Props>(
  ({ config, size = "lg", className = "", interactive = true, onTap }, ref) => {
    const [bounce, setBounce] = useState(false);
    const px = sizeMap[size];
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

    // Decisão de Z-order: capacete e máscara ficam ATRÁS dos olhos? Não — devem ficar
    // por cima do PNG mas com aberturas para os olhos. Cientista também por cima.
    // Apenas a CAPA do super-herói ficaria atrás idealmente, mas como vem no mesmo
    // SVG do herói, fica ok renderizar tudo por cima.

    return (
      <motion.div
        ref={ref}
        className={`relative select-none ${className}`}
        style={{ width: w, height: h, touchAction: "manipulation" }}
        onPointerDown={handleTap}
        animate={
          bounce
            ? { scale: [1, 0.92, 1.08, 1] }
            : { scale: [1, 1.02, 1], y: [0, -2, 0] }
        }
        transition={
          bounce
            ? { duration: 0.42, ease: "easeOut" }
            : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {/* Glow ambiente */}
        <div
          className="absolute inset-[-8%] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(255, 216, 110, 0.22), transparent 65%)",
          }}
        />

        {/* BASE — corpo PNG */}
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

        {/* OVERLAYS com fade suave entre trocas */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${config.expression}-${config.outfit}`}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <Eyes expression={config.expression} anchors={anchors} />
            <Mouth expression={config.expression} anchors={anchors} base={config.base} />
            {config.outfit !== "nenhum" && (
              <Outfit outfit={config.outfit} anchors={anchors} base={config.base} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    );
  }
);

KidzzAvatar.displayName = "KidzzAvatar";

export default KidzzAvatar;

/* ─────────────────────────── PRESET LIBRARIES ─────────────────────────── */

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

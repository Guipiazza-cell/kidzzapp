/**
 * Kidzz Premium UI — liquid glass iOS (referência: aba Bora).
 *
 * Regras de ouro:
 * - Blur ≥ 28px (cards ≥ 36, dock ≥ 40)
 * - Borda hairline 0.5px com highlight superior inset
 * - Raios: card 28 · panel 24 · chip 18 · pill 999
 * - Hit target ≥ 44pt
 * - Sombra multi-camada (lift + inset top + inset bottom)
 */
import type { CSSProperties } from "react";

export const R = {
  card: 28,
  panel: 24,
  chip: 18,
  btn: 999,
  icon: 16,
  dock: 28,
} as const;

export const PAD = 16;
export const GAP = 12;

export const FONT =
  "'Nunito', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";
export const SERIF = "'Lora', Georgia, 'Times New Roman', serif";

const blur = (px: number, sat = 190) =>
  ({
    backdropFilter: `blur(${px}px) saturate(${sat}%)`,
    WebkitBackdropFilter: `blur(${px}px) saturate(${sat}%)`,
  }) as const;

/* ── Light glass ── */
export const glassLight: CSSProperties = {
  background:
    "linear-gradient(165deg, rgba(255,255,255,.82) 0%, rgba(255,255,255,.52) 42%, rgba(255,252,248,.58) 100%)",
  border: "0.5px solid rgba(255,255,255,.92)",
  borderRadius: R.card,
  boxShadow:
    "0 12px 40px rgba(35,30,22,.16), 0 2px 8px rgba(35,30,22,.06), 0 1px 0 rgba(255,255,255,.95) inset, 0 -10px 22px rgba(255,255,255,.22) inset",
  ...blur(40, 200),
};

export const glassLightSoft: CSSProperties = {
  background:
    "linear-gradient(160deg, rgba(255,255,255,.68) 0%, rgba(255,255,255,.38) 100%)",
  border: "0.5px solid rgba(255,255,255,.82)",
  borderRadius: R.panel,
  boxShadow:
    "0 6px 20px rgba(35,30,22,.1), 0 1px 0 rgba(255,255,255,.9) inset",
  ...blur(32, 190),
};

export const pillGlassLight: CSSProperties = {
  background:
    "linear-gradient(160deg, rgba(255,255,255,.88) 0%, rgba(255,255,255,.52) 100%)",
  border: "0.5px solid rgba(255,255,255,.98)",
  boxShadow:
    "0 8px 20px rgba(35,30,22,.12), 0 1px 0 rgba(255,255,255,1) inset, 0 -4px 10px rgba(255,255,255,.18) inset",
  ...blur(36, 200),
};

/* ── Dark glass (Bora / Sonhos / Memórias / Cinema / Momentos) ── */
export const glassDark: CSSProperties = {
  background:
    "linear-gradient(165deg, rgba(255,245,230,.18) 0%, rgba(255,220,180,.09) 38%, rgba(22,16,12,.48) 100%)",
  border: "0.5px solid rgba(255,235,200,.34)",
  borderRadius: R.card,
  boxShadow:
    "0 12px 40px rgba(0,0,0,.36), 0 1px 0 rgba(255,245,220,.26) inset, 0 -1px 0 rgba(0,0,0,.16) inset, 0 0 0 0.5px rgba(255,255,255,.04)",
  ...blur(44, 200),
};

export const glassDarkSoft: CSSProperties = {
  background:
    "linear-gradient(160deg, rgba(255,240,220,.16) 0%, rgba(30,22,16,.32) 100%)",
  border: "0.5px solid rgba(255,230,200,.24)",
  borderRadius: R.panel,
  boxShadow:
    "0 6px 18px rgba(0,0,0,.22), 0 1px 0 rgba(255,245,220,.2) inset",
  ...blur(32, 190),
};

export const pillGlassDark: CSSProperties = {
  background:
    "linear-gradient(160deg, rgba(255,245,230,.24) 0%, rgba(30,22,14,.42) 100%)",
  border: "0.5px solid rgba(255,235,200,.4)",
  boxShadow:
    "0 8px 20px rgba(0,0,0,.28), 0 1px 0 rgba(255,245,220,.38) inset, 0 -4px 10px rgba(0,0,0,.12) inset",
  ...blur(36, 200),
};

/* ── Dock iOS ── */
export const dockGlassLight: CSSProperties = {
  background:
    "linear-gradient(165deg, rgba(255,255,255,.86) 0%, rgba(255,255,255,.58) 55%, rgba(255,252,248,.62) 100%)",
  border: "0.5px solid rgba(255,255,255,.98)",
  boxShadow:
    "0 18px 48px rgba(40,32,20,.24), 0 4px 12px rgba(40,32,20,.08), 0 1.5px 0 rgba(255,255,255,1) inset, 0 -10px 22px rgba(120,110,90,.08) inset",
  ...blur(44, 200),
};

export const dockGlassDark: CSSProperties = {
  background:
    "linear-gradient(165deg, rgba(255,255,255,.2) 0%, rgba(255,255,255,.1) 50%, rgba(255,255,255,.06) 100%)",
  border: "0.5px solid rgba(255,255,255,.3)",
  boxShadow:
    "0 18px 48px rgba(0,0,0,.52), 0 4px 12px rgba(0,0,0,.2), 0 1px 0 rgba(255,255,255,.4) inset, 0 -10px 22px rgba(0,0,0,.18) inset",
  ...blur(44, 200),
};

/* ── CTAs ── */
export const goldBtn: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "12px 20px",
  minHeight: 44,
  borderRadius: R.btn,
  border: "0.5px solid rgba(255,235,190,.65)",
  background: "linear-gradient(180deg, #FBE09A 0%, #E8A838 48%, #C87818 100%)",
  color: "#2A1608",
  fontFamily: FONT,
  fontWeight: 800,
  fontSize: 13.5,
  letterSpacing: "-0.1px",
  boxShadow:
    "0 8px 24px rgba(180,100,20,.38), 0 1px 0 rgba(255,252,230,.85) inset, 0 -3px 8px rgba(100,50,0,.18) inset",
  cursor: "pointer",
};

export const outlineGoldBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "12px 18px",
  minHeight: 44,
  borderRadius: R.btn,
  border: "0.5px solid rgba(255,220,160,.48)",
  background:
    "linear-gradient(160deg, rgba(255,235,200,.18), rgba(40,28,14,.32))",
  color: "#FFE8C0",
  fontFamily: FONT,
  fontWeight: 800,
  fontSize: 13.5,
  letterSpacing: "-0.1px",
  boxShadow:
    "0 6px 18px rgba(0,0,0,.2), 0 1px 0 rgba(255,240,210,.24) inset",
  ...blur(28, 180),
  cursor: "pointer",
};

export const sectionWrap: CSSProperties = {
  padding: `0 ${PAD}px`,
  marginBottom: GAP + 2,
};

export const hit44: CSSProperties = {
  minWidth: 44,
  minHeight: 44,
};

/** Glass com tint colorido (cards de categoria) */
export const coloredGlass = (
  r: number,
  g: number,
  b: number,
  aTop = 0.48,
  aBot = 0.16,
  opts?: { dark?: boolean; radius?: number },
): CSSProperties => {
  const rgba = (a: number) => `rgba(${r},${g},${b},${a})`;
  const dark = opts?.dark;
  return {
    background: dark
      ? `linear-gradient(165deg, rgba(255,255,255,.2) 0%, ${rgba(aTop)} 30%, ${rgba(aBot)} 100%)`
      : `linear-gradient(165deg, rgba(255,255,255,.9) 0%, ${rgba(aTop)} 32%, ${rgba((aTop + aBot) / 2)} 62%, ${rgba(aBot)} 90%, rgba(255,255,255,.55) 100%)`,
    border: dark
      ? "0.5px solid rgba(255,255,255,.32)"
      : "0.5px solid rgba(255,255,255,.92)",
    borderRadius: opts?.radius ?? R.card,
    boxShadow: dark
      ? `0 14px 36px rgba(0,0,0,.34), 0 0 22px ${rgba(0.18)}, 0 1px 0 rgba(255,255,255,.28) inset, 0 -8px 16px rgba(0,0,0,.14) inset`
      : `0 14px 36px rgba(40,35,25,.14), 0 0 22px ${rgba(0.16)}, 0 1px 0 rgba(255,255,255,.95) inset, 0 -10px 20px ${rgba(0.12)} inset`,
    ...blur(40, 200),
  };
};

/** Sheen layer style for absolute inset overlay */
export const sheenOverlay: CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: "inherit",
  pointerEvents: "none",
  background:
    "linear-gradient(105deg, transparent 0%, rgba(255,255,255,.14) 45%, transparent 70%)",
  mixBlendMode: "soft-light",
};

/** Active tab capsule (dock) */
export const activeTabCapsule = (c: string, cl: string): CSSProperties => ({
  width: 42,
  height: 32,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `radial-gradient(130% 130% at 32% 22%, ${cl} 0%, ${cl} 18%, ${c} 100%)`,
  border: "0.5px solid rgba(255,255,255,.6)",
  boxShadow: `0 6px 16px -2px ${c}b8, 0 0 18px ${c}55, 0 1px 0 rgba(255,255,255,.7) inset`,
});

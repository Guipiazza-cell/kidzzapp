/**
 * Espaço livre acima do dock flutuante do app.
 * Dock ~72px + setas/padding + folga visual + safe-area do iPhone.
 */
export const KALM_DOCK_CLEARANCE =
  "calc(env(safe-area-inset-bottom, 0px) + 188px)";

/** Fundo opaco do KALM (bloqueia MagicalBackground claro). */
export const KALM_BG_SOLID = "#0B1310";

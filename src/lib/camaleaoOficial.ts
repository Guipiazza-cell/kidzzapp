/**
 * Camaleões oficiais (originais do cliente em public/camaleao).
 * Sempre com borda esmaecida (PNG soft) — nunca “foto quadrada”.
 *
 * Poses:
 *  - heart     → Perguntas / default
 *  - arms      → genérico / Cinema / Descobrir / Bora / Rotina
 *  - headphones→ Música / Momentos
 *  - sleepy    → Sonhos / KALM noite
 */

export const CAMALEAO_BASE = "/exemplos/assets/camaleao-oficial";

export const CAMALEAO = {
  heart: `${CAMALEAO_BASE}/heart.png`,
  heartSoft: `${CAMALEAO_BASE}/heart-soft.png`,
  arms: `${CAMALEAO_BASE}/arms.png`,
  armsSoft: `${CAMALEAO_BASE}/arms-soft.png`,
  headphones: `${CAMALEAO_BASE}/headphones.png`,
  headphonesSoft: `${CAMALEAO_BASE}/headphones-soft.png`,
  sleepy: `${CAMALEAO_BASE}/sleepy.png`,
  sleepySoft: `${CAMALEAO_BASE}/sleepy-soft.png`,
} as const;

/** Estilo CSS para o Gui “fazer parte do cenário” (sem retângulo). */
export const CAMALEAO_SCENE_MASK = {
  WebkitMaskImage:
    "radial-gradient(74% 78% at 50% 52%, #000 38%, rgba(0,0,0,.92) 52%, rgba(0,0,0,.55) 68%, rgba(0,0,0,.18) 82%, transparent 96%)",
  maskImage:
    "radial-gradient(74% 78% at 50% 52%, #000 38%, rgba(0,0,0,.92) 52%, rgba(0,0,0,.55) 68%, rgba(0,0,0,.18) 82%, transparent 96%)",
} as const;

export type CamaleaoPose = keyof typeof CAMALEAO;

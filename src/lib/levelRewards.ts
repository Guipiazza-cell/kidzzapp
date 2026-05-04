/**
 * Recompensas por nível — desbloqueia roupas/cores/expressões do Lab.
 *
 * Sistema 100% local: usa o nível do levelSystem para determinar quais
 * itens estão liberados, sem mexer no Stripe/premium. Itens premium
 * permanecem premium; recompensas aqui são "extras" que dão sensação
 * de progresso pra todo mundo.
 */
import { getLevelInfo } from "./levelSystem";

export type RewardKind = "color" | "expression" | "outfit" | "title";

export interface LevelReward {
  level: number;
  kind: RewardKind;
  /** id do item no Lab (quando aplicável) */
  itemId?: string;
  emoji: string;
  label: string;
  description: string;
}

/**
 * Tabela de recompensas. Inclui todos os marcos visuais — desbloqueio
 * é informativo (a UI do Lab continua lendo `LOCKED_*`); aqui ditamos
 * a narrativa da jornada.
 */
export const LEVEL_REWARDS: LevelReward[] = [
  { level: 2, kind: "expression", itemId: "happy", emoji: "😄", label: "Sorriso", description: "Pixel aprende a sorrir!" },
  { level: 3, kind: "color", itemId: "rosa-encantado", emoji: "🌸", label: "Rosa Encantado", description: "Sua primeira cor mágica" },
  { level: 5, kind: "title", emoji: "🌱", label: "Iniciante completo", description: "Você já é um KIDZZ de verdade" },
  { level: 7, kind: "color", itemId: "verde-floresta", emoji: "🌳", label: "Verde Floresta", description: "Cor da natureza" },
  { level: 10, kind: "title", emoji: "✨", label: "Explorador", description: "Sua aura começa a brilhar" },
  { level: 12, kind: "expression", itemId: "curious", emoji: "🤔", label: "Curioso", description: "Olhar de quem quer saber tudo" },
  { level: 15, kind: "color", itemId: "azul-oceano", emoji: "🌊", label: "Azul Oceano", description: "Cor profunda como o mar" },
  { level: 18, kind: "outfit", itemId: "scientist", emoji: "🥽", label: "Cientista", description: "Pronto para descobrir o mundo" },
  { level: 20, kind: "title", emoji: "🌟", label: "Curioso Veterano", description: "Mais de 20 níveis de aventura!" },
  { level: 25, kind: "expression", itemId: "thinking", emoji: "💭", label: "Pensador", description: "Modo cérebro ligado" },
  { level: 30, kind: "title", emoji: "🦋", label: "Aventureiro", description: "Aura nova: ondas brilhantes" },
  { level: 35, kind: "color", itemId: "lilas-estrelado", emoji: "💜", label: "Lilás Estrelado", description: "Cor de quem sonha grande" },
  { level: 40, kind: "outfit", itemId: "explorer", emoji: "🎒", label: "Explorador", description: "Mochila pronta pra aventura" },
  { level: 45, kind: "title", emoji: "🌿", label: "Guardião da Floresta", description: "Você cuida do mundo KIDZZ" },
  { level: 50, kind: "color", itemId: "dourado-magico", emoji: "🌟", label: "Dourado Mágico", description: "Cor lendária — só quem chega aqui" },
  { level: 60, kind: "title", emoji: "🧙", label: "Sábio Explorador", description: "Aura pulsante de energia" },
  { level: 70, kind: "expression", itemId: "loving", emoji: "🥰", label: "Apaixonado", description: "Coração transbordando" },
  { level: 75, kind: "title", emoji: "👑", label: "Mestre KIDZZ", description: "Você é referência" },
  { level: 85, kind: "expression", itemId: "challenging", emoji: "😎", label: "Desafiador", description: "Pronto pra qualquer missão" },
  { level: 90, kind: "title", emoji: "🏆", label: "Lenda KIDZZ", description: "O topo absoluto" },
  { level: 100, kind: "title", emoji: "♾️", label: "Infinito", description: "Você completou a jornada" },
];

export function getNextReward(currentLevel: number): LevelReward | null {
  return LEVEL_REWARDS.find((r) => r.level > currentLevel) ?? null;
}

export function getUnlockedRewards(currentLevel: number): LevelReward[] {
  return LEVEL_REWARDS.filter((r) => r.level <= currentLevel);
}

export function getLockedRewards(currentLevel: number): LevelReward[] {
  return LEVEL_REWARDS.filter((r) => r.level > currentLevel);
}

export function getJourneySnapshot() {
  const info = getLevelInfo();
  return {
    info,
    nextReward: getNextReward(info.level),
    unlocked: getUnlockedRewards(info.level),
    locked: getLockedRewards(info.level),
  };
}

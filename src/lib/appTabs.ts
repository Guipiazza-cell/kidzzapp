export type AppTabConfig = {
  id: AppTab;
  label: string;
  dataTab: string;
  color: string;
  light: string;
  inDock: boolean;
  featured?: boolean;
};

export const APP_TABS_ALL: AppTabConfig[] = [
  { id: "chat", label: "Perguntas", dataTab: "perguntas", color: "#E8821A", light: "#F4A659", inDock: true },
  { id: "discover", label: "Descobrir", dataTab: "descobrir", color: "#46703A", light: "#7FB069", inDock: true },
  { id: "wellness", label: "KALM", dataTab: "kalm", color: "#3FA89B", light: "#6BC7BC", inDock: true },
  { id: "dreams", label: "Sonhos", dataTab: "sonhos", color: "#5E5CC2", light: "#8987DA", inDock: true },
  { id: "explore", label: "Histórias", dataTab: "historias", color: "#C173A6", light: "#D89BC2", inDock: true },
  { id: "play", label: "Brincar", dataTab: "brincar", color: "#DD6A36", light: "#F08E5E", inDock: true },
  { id: "bora", label: "Bora!", dataTab: "bora", color: "#E8821A", light: "#F4A659", inDock: true },
  { id: "routine", label: "Rotina", dataTab: "rotina", color: "#4F8FC9", light: "#7DB0E0", inDock: true },
  { id: "moments", label: "Momentos", dataTab: "momentos", color: "#E5912E", light: "#F4B25E", inDock: true },
  { id: "cinema", label: "Cinema", dataTab: "cinema", color: "#D6A634", light: "#ECC766", inDock: true },
  { id: "music", label: "Música", dataTab: "musica", color: "#5FA15A", light: "#86C281", inDock: true },
  { id: "memories", label: "Memórias", dataTab: "memorias", color: "#C2787F", light: "#D89BA0", inDock: true },
];

// Backwards-compat alias used across the codebase
export const APP_TABS = APP_TABS_ALL.filter((t) => t.inDock) as readonly AppTabConfig[] as any;

export type AppTab =
  | "chat"
  | "discover"
  | "explore"
  | "play"
  | "bora"
  | "cinema"
  | "moments"
  | "wellness"
  | "dreams"
  | "routine"
  | "music"
  | "memories"
  | "achievements";

export const APP_TAB_IDS: AppTab[] = [
  ...APP_TABS_ALL.map((t) => t.id),
  "achievements",
];

export const APP_TAB_DATA: Record<AppTab, string> = {
  chat: "perguntas",
  discover: "descobrir",
  wellness: "kalm",
  dreams: "sonhos",
  explore: "historias",
  play: "brincar",
  bora: "bora",
  routine: "rotina",
  moments: "momentos",
  cinema: "cinema",
  music: "musica",
  memories: "memorias",
  achievements: "memorias",
};

const TAB_ALIASES: Record<string, AppTab> = {
  perguntas: "chat",
  descobrir: "discover",
  discover: "discover",
  kalm: "wellness",
  wellness: "wellness",
  sonhos: "dreams",
  dreams: "dreams",
  historias: "explore",
  histórias: "explore",
  explore: "explore",
  brincar: "play",
  play: "play",
  bora: "bora",
  rotina: "routine",
  routine: "routine",
  momentos: "moments",
  moments: "moments",
  cinema: "cinema",
  // Música agora vive dentro de Brincar — qualquer link antigo redireciona
  musica: "music",
  música: "music",
  music: "music",
  memorias: "memories",
  memórias: "memories",
  memories: "memories",
  achievements: "achievements",
};

export const normalizeAppTab = (tab: string | null | undefined): AppTab | null => {
  if (!tab) return null;
  const key = tab.trim().toLowerCase();
  if ((APP_TAB_IDS as string[]).includes(key)) {
    // Mesmo se o id é válido, aplicamos alias quando necessário (ex: music → play)
    return (TAB_ALIASES[key] as AppTab) ?? (key as AppTab);
  }
  return TAB_ALIASES[key] ?? null;
};

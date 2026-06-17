export const APP_TABS = [
  { id: "chat", label: "Perguntas", dataTab: "perguntas", color: "#E8821A", light: "#F4A659" },
  { id: "wellness", label: "KALM", dataTab: "kalm", color: "#3FA89B", light: "#6BC7BC" },
  { id: "dreams", label: "Sonhos", dataTab: "sonhos", color: "#5E5CC2", light: "#8987DA" },
  { id: "explore", label: "Histórias", dataTab: "historias", color: "#C173A6", light: "#D89BC2" },
  { id: "play", label: "Brincar", dataTab: "brincar", color: "#DD6A36", light: "#F08E5E" },
  { id: "routine", label: "Rotina", dataTab: "rotina", color: "#4F8FC9", light: "#7DB0E0" },
  { id: "moments", label: "Momentos", dataTab: "momentos", color: "#E5912E", light: "#F4B25E" },
  { id: "cinema", label: "Cinema", dataTab: "cinema", color: "#D6A634", light: "#ECC766" },
  { id: "music", label: "Música", dataTab: "musica", color: "#5FA15A", light: "#86C281" },
  { id: "memories", label: "Memórias", dataTab: "memorias", color: "#C2787F", light: "#D89BA0" },
] as const;

export type AppTab = (typeof APP_TABS)[number]["id"] | "achievements";

export const APP_TAB_IDS = [...APP_TABS.map((tab) => tab.id), "achievements"] as AppTab[];

export const APP_TAB_DATA: Record<AppTab, string> = {
  chat: "perguntas",
  wellness: "kalm",
  dreams: "sonhos",
  explore: "historias",
  play: "brincar",
  routine: "rotina",
  moments: "momentos",
  cinema: "cinema",
  music: "musica",
  memories: "memorias",
  achievements: "memorias",
};

const TAB_ALIASES: Record<string, AppTab> = {
  perguntas: "chat",
  kalm: "wellness",
  wellness: "wellness",
  sonhos: "dreams",
  dreams: "dreams",
  historias: "explore",
  histórias: "explore",
  explore: "explore",
  brincar: "play",
  play: "play",
  rotina: "routine",
  routine: "routine",
  momentos: "moments",
  moments: "moments",
  cinema: "cinema",
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
  if ((APP_TAB_IDS as string[]).includes(key)) return key as AppTab;
  return TAB_ALIASES[key] ?? null;
};
/* ── Sistema de Colecionáveis Musicais ── */

export type CollectibleId = "sun_note" | "forest_drum" | "golden_melody" | "moon_song";

export interface Collectible {
  id: CollectibleId;
  name: string;
  emoji: string;
  description: string;
  unlockHint: string;
  gradient: string;
  glow: string;
}

export const COLLECTIBLES: Collectible[] = [
  {
    id: "sun_note",
    name: "Nota do Sol",
    emoji: "☀️",
    description: "A primeira luz que toca a floresta ao amanhecer.",
    unlockHint: "Toque sua primeira nota",
    gradient: "from-amber-300 via-yellow-400 to-orange-400",
    glow: "rgba(251, 191, 36, 0.55)",
  },
  {
    id: "forest_drum",
    name: "Tambor da Floresta",
    emoji: "🥁",
    description: "O batuque ancestral que faz as árvores dançarem.",
    unlockHint: "Toque o tambor 5 vezes",
    gradient: "from-orange-400 via-red-400 to-rose-500",
    glow: "rgba(248, 113, 113, 0.5)",
  },
  {
    id: "golden_melody",
    name: "Melodia Dourada",
    emoji: "✨",
    description: "Uma sequência mágica que só os escolhidos ouvem.",
    unlockHint: "Toque a melodia completa",
    gradient: "from-yellow-300 via-amber-400 to-yellow-600",
    glow: "rgba(252, 211, 77, 0.6)",
  },
  {
    id: "moon_song",
    name: "Canção da Lua",
    emoji: "🌙",
    description: "Uma melodia noturna que acalma a floresta inteira.",
    unlockHint: "Cante junto com alguém especial",
    gradient: "from-indigo-400 via-violet-400 to-purple-500",
    glow: "rgba(167, 139, 250, 0.55)",
  },
];

const STORAGE_KEY = "kidzz_forest_collectibles";
const XP_KEY = "kidzz_xp";

export function getUnlockedCollectibles(): CollectibleId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function unlockCollectible(id: CollectibleId): boolean {
  if (typeof window === "undefined") return false;
  const current = getUnlockedCollectibles();
  if (current.includes(id)) return false;
  current.push(id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  // grant XP
  try {
    const xp = parseInt(window.localStorage.getItem(XP_KEY) || "0", 10);
    window.localStorage.setItem(XP_KEY, String(xp + 25));
  } catch { /* noop */ }
  return true;
}

/* ── Counters used to determine unlocks ── */
const COUNTERS_KEY = "kidzz_forest_counters";

interface ForestCounters {
  notes: number;
  drums: number;
  melodies: number;
  duets: number;
}

export function getCounters(): ForestCounters {
  if (typeof window === "undefined") return { notes: 0, drums: 0, melodies: 0, duets: 0 };
  try {
    const raw = window.localStorage.getItem(COUNTERS_KEY);
    return raw ? JSON.parse(raw) : { notes: 0, drums: 0, melodies: 0, duets: 0 };
  } catch {
    return { notes: 0, drums: 0, melodies: 0, duets: 0 };
  }
}

export function bumpCounter(key: keyof ForestCounters): { counters: ForestCounters; unlocked: CollectibleId | null } {
  const c = getCounters();
  c[key] = (c[key] || 0) + 1;
  if (typeof window !== "undefined") window.localStorage.setItem(COUNTERS_KEY, JSON.stringify(c));

  let unlocked: CollectibleId | null = null;
  if (key === "notes" && c.notes === 1 && unlockCollectible("sun_note")) unlocked = "sun_note";
  if (key === "drums" && c.drums >= 5 && unlockCollectible("forest_drum")) unlocked = "forest_drum";
  if (key === "melodies" && c.melodies >= 1 && unlockCollectible("golden_melody")) unlocked = "golden_melody";
  if (key === "duets" && c.duets >= 1 && unlockCollectible("moon_song")) unlocked = "moon_song";
  return { counters: c, unlocked };
}

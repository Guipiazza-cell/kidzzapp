/* XP musical e streak musical separados — persistidos em localStorage */

const XP_KEY = "kidzz_music_xp";
const STREAK_KEY = "kidzz_music_streak";
const STREAK_DATE_KEY = "kidzz_music_last_date";
const ACHIEVEMENTS_KEY = "kidzz_music_achievements";

export type MusicAction = "listen" | "karaoke" | "dance" | "story" | "create" | "share";

const XP_VALUES: Record<MusicAction, number> = {
  listen: 10,
  karaoke: 12,
  dance: 10,
  story: 15,
  create: 25,
  share: 20,
};

export interface MusicAchievement {
  id: string;
  name: string;
  emoji: string;
  desc: string;
}

export const MUSIC_ACHIEVEMENTS: MusicAchievement[] = [
  { id: "first_song", name: "Primeira Canção", emoji: "🎵", desc: "Cantou pela 1ª vez" },
  { id: "karaoke_star", name: "Estrela do Karaokê", emoji: "🌟", desc: "Concluiu 5 karaokês" },
  { id: "composer", name: "Compositor", emoji: "🎼", desc: "Criou 1ª música" },
  { id: "musical_week", name: "Semana Musical", emoji: "📅", desc: "7 dias de streak musical" },
  { id: "forest_dancer", name: "Dançarino da Floresta", emoji: "💃", desc: "Dançou 5 vezes" },
  { id: "storyteller", name: "Contador de Histórias", emoji: "📖", desc: "Ouviu 3 histórias cantadas" },
];

export function getMusicXp(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(window.localStorage.getItem(XP_KEY) || "0", 10);
}

export function addMusicXp(action: MusicAction): { xp: number; gained: number } {
  if (typeof window === "undefined") return { xp: 0, gained: 0 };
  const gained = XP_VALUES[action];
  const xp = getMusicXp() + gained;
  window.localStorage.setItem(XP_KEY, String(xp));
  bumpStreak();
  // Bridge to global Level System (Bloco 1) — every musical action also
  // contributes to the universal XP/Level so progress is unified.
  try {
    import("./dailyMission").then(({ addXp }) => {
      // Map music action to a MissionAction tier; passes explicit gained
      // value so the level XP is identical to the music XP earned.
      const mapped =
        action === "create" ? "create" :
        action === "story" ? "story" :
        "music";
      addXp(mapped as any, gained);
    });
  } catch { /* noop */ }
  return { xp, gained };
}

export function getMusicStreak(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(window.localStorage.getItem(STREAK_KEY) || "0", 10);
}

function bumpStreak() {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().split("T")[0];
  const last = window.localStorage.getItem(STREAK_DATE_KEY);
  if (last === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const cur = getMusicStreak();
  const next = last === yesterday ? cur + 1 : 1;
  window.localStorage.setItem(STREAK_KEY, String(next));
  window.localStorage.setItem(STREAK_DATE_KEY, today);
}

/* Achievements */
export function getUnlockedAchievements(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(ACHIEVEMENTS_KEY) || "[]"); } catch { return []; }
}

export function unlockAchievement(id: string): MusicAchievement | null {
  if (typeof window === "undefined") return null;
  const cur = getUnlockedAchievements();
  if (cur.includes(id)) return null;
  const next = [...cur, id];
  window.localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(next));
  return MUSIC_ACHIEVEMENTS.find((a) => a.id === id) || null;
}

/* Counters for milestone-based achievements */
const COUNTER_KEY = "kidzz_music_counters";
export interface MusicCounters { karaoke: number; dance: number; story: number; create: number; }
export function getCounters(): MusicCounters {
  if (typeof window === "undefined") return { karaoke: 0, dance: 0, story: 0, create: 0 };
  try { return { karaoke: 0, dance: 0, story: 0, create: 0, ...JSON.parse(window.localStorage.getItem(COUNTER_KEY) || "{}") }; }
  catch { return { karaoke: 0, dance: 0, story: 0, create: 0 }; }
}
export function bumpCounter(key: keyof MusicCounters): MusicAchievement | null {
  if (typeof window === "undefined") return null;
  const c = getCounters();
  c[key] = (c[key] || 0) + 1;
  window.localStorage.setItem(COUNTER_KEY, JSON.stringify(c));
  // Milestone unlocks
  if (key === "karaoke" && c.karaoke === 1) return unlockAchievement("first_song");
  if (key === "karaoke" && c.karaoke === 5) return unlockAchievement("karaoke_star");
  if (key === "dance" && c.dance === 5) return unlockAchievement("forest_dancer");
  if (key === "story" && c.story === 3) return unlockAchievement("storyteller");
  if (key === "create" && c.create === 1) return unlockAchievement("composer");
  if (getMusicStreak() >= 7) return unlockAchievement("musical_week");
  return null;
}

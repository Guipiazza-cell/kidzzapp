/**
 * Habit Loop — Local persistence for daily streak, XP, and notification time.
 * All keys are namespaced with `kidzz_` and stored in localStorage.
 *
 * Design goals:
 *  - Idempotent: calling `incrementDailyStreak` twice on the same day MUST NOT double-count.
 *  - Resilient: malformed localStorage values fall back to safe defaults.
 *  - Server-agnostic: works in guest mode and authenticated mode.
 */

const KEYS = {
  lastActive: "kidzz_last_active",
  streak: "kidzz_streak",
  xp: "kidzz_xp",
  childName: "kidzz_child_name",
  notificationTime: "kidzz_notification_time",
  bestStreak: "kidzz_best_streak",
} as const;

const todayKey = () => new Date().toDateString();

const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toDateString();
};

const safeRead = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeWrite = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage full or blocked — ignore */
  }
};

export interface StreakResult {
  streak: number;
  changed: boolean;       // true if streak was incremented or reset this call
  isNewRecord: boolean;   // true if streak just surpassed previous best
  bestStreak: number;
}

export const getStreak = (): number => {
  const raw = safeRead(KEYS.streak);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export const getBestStreak = (): number => {
  const raw = safeRead(KEYS.bestStreak);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export const getLastActive = (): string | null => safeRead(KEYS.lastActive);

/**
 * Register a daily visit and return updated streak state.
 *  - Same day → no change
 *  - Yesterday → +1
 *  - Older / never → reset to 1
 */
export const incrementDailyStreak = (): StreakResult => {
  const today = todayKey();
  const last = getLastActive();
  const current = getStreak();
  const best = getBestStreak();

  if (last === today) {
    return { streak: current, changed: false, isNewRecord: false, bestStreak: best };
  }

  let next: number;
  if (last === yesterdayKey()) {
    next = current + 1;
  } else {
    next = 1;
  }

  safeWrite(KEYS.streak, String(next));
  safeWrite(KEYS.lastActive, today);

  const isNewRecord = next > best;
  if (isNewRecord) safeWrite(KEYS.bestStreak, String(next));

  return {
    streak: next,
    changed: true,
    isNewRecord,
    bestStreak: Math.max(next, best),
  };
};

export const getXP = (): number => {
  const raw = safeRead(KEYS.xp);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export const addXP = (amount: number): number => {
  const next = Math.max(0, getXP() + amount);
  safeWrite(KEYS.xp, String(next));
  // Bridge into global level system using shared totalXp counter
  try {
    if (typeof window !== "undefined" && amount > 0) {
      import("./dailyMission").then(({ addXp }) => addXp("activity", amount));
    }
  } catch { /* noop */ }
  return next;
};

export const getStoredChildName = (): string => safeRead(KEYS.childName) || "";

export const setStoredChildName = (name: string) => {
  if (name?.trim()) safeWrite(KEYS.childName, name.trim());
};

export const getNotificationTime = (): string | null => safeRead(KEYS.notificationTime);

export const setNotificationTime = (time: string) => {
  if (/^\d{2}:\d{2}$/.test(time)) safeWrite(KEYS.notificationTime, time);
};

// ---------------------------------------------------------------
// Milestones — progressive titles unlocked by consecutive days.
// ---------------------------------------------------------------
export interface Milestone {
  days: number;
  title: string;
  emoji: string;
}

export const MILESTONES: Milestone[] = [
  { days: 3,   title: "Fogo da Curiosidade",  emoji: "🔥" },
  { days: 7,   title: "Semana de Sabedoria",  emoji: "🌟" },
  { days: 14,  title: "Família Curiosa",       emoji: "💛" },
  { days: 30,  title: "Exploradores",          emoji: "🚀" },
  { days: 60,  title: "Elite KIDZZ",           emoji: "👑" },
  { days: 100, title: "Lenda KIDZZ",           emoji: "🏆" },
];

export const getMilestoneProgress = (streak: number) => {
  const next = MILESTONES.find((m) => m.days > streak) ?? MILESTONES[MILESTONES.length - 1];
  const prev = [...MILESTONES].reverse().find((m) => m.days <= streak);
  const prevDays = prev?.days ?? 0;
  const range = Math.max(1, next.days - prevDays);
  const progress = streak >= next.days
    ? 100
    : Math.min(100, Math.max(0, ((streak - prevDays) / range) * 100));
  return {
    next,
    previous: prev,
    progress,
    daysToNext: Math.max(0, next.days - streak),
  };
};

// ---------------------------------------------------------------
// Smart notification copy — dynamic, name-aware, streak-aware.
// Pure function: no side-effects, no scheduling. UI / SW handles delivery.
// ---------------------------------------------------------------
export const getNotificationMessage = (
  childName: string,
  streak: number,
  missedYesterday: boolean,
): string => {
  const name = childName?.trim() || "amigo";
  if (missedYesterday && streak === 0) {
    return `${name} sentiu sua falta ontem 💛 Que tal uma pergunta hoje?`;
  }
  if (streak >= 7) {
    return `🔥 ${streak} dias seguidos! Não quebra a magia agora, ${name} te espera ✨`;
  }
  if (streak >= 3) {
    return `🔥 ${name} está numa sequência incrível de ${streak} dias! Vem brincar.`;
  }
  if (streak === 1 || streak === 2) {
    return `Mais um dia de aventura com ${name}? 🌱 A curiosidade espera você.`;
  }
  return `${name} tem uma pergunta nova guardada pra hoje 💛`;
};

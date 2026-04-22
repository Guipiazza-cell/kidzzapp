/**
 * Daily Mission Loop — Encourages 3 daily actions to drive retention.
 * Tracks: listen 1 song, answer 1 question, see 1 story.
 * Plus: total wisdom XP and per-day completion state.
 *
 * Pure localStorage. Resets on day change.
 */

export type MissionAction = "music" | "question" | "story" | "create";

const MISSION_KEY = "kidzz_daily_mission";
const TOTAL_XP_KEY = "kidzz_total_xp";
const ACTION_COUNT_KEY = "kidzz_session_action_count";

export const XP_VALUES: Record<MissionAction, number> = {
  music: 10,
  question: 10,
  story: 15,
  create: 25,
};

export interface MissionState {
  date: string;            // YYYY-MM-DD
  music: boolean;
  question: boolean;
  story: boolean;
  rewarded: boolean;       // true after celebration shown
}

const todayISO = () => new Date().toISOString().split("T")[0];

const safeRead = (k: string): string | null => {
  try { return localStorage.getItem(k); } catch { return null; }
};
const safeWrite = (k: string, v: string) => {
  try { localStorage.setItem(k, v); } catch { /* noop */ }
};

const empty = (): MissionState => ({
  date: todayISO(),
  music: false,
  question: false,
  story: false,
  rewarded: false,
});

export function getMission(): MissionState {
  const raw = safeRead(MISSION_KEY);
  if (!raw) return empty();
  try {
    const parsed = JSON.parse(raw) as MissionState;
    if (parsed.date !== todayISO()) return empty();
    return parsed;
  } catch {
    return empty();
  }
}

function setMission(m: MissionState) {
  safeWrite(MISSION_KEY, JSON.stringify(m));
}

/**
 * Mark a mission action complete. Returns updated state and whether
 * the full daily mission was just completed by this call.
 */
export function completeMissionStep(action: "music" | "question" | "story"): {
  state: MissionState;
  justCompleted: boolean;
  newlyMarked: boolean;
} {
  const m = getMission();
  const wasComplete = m.music && m.question && m.story;
  const newlyMarked = !m[action];
  m[action] = true;
  const isComplete = m.music && m.question && m.story;
  setMission(m);
  return { state: m, justCompleted: !wasComplete && isComplete, newlyMarked };
}

export function markRewarded() {
  const m = getMission();
  m.rewarded = true;
  setMission(m);
}

export function getMissionProgress(): { done: number; total: number; percent: number } {
  const m = getMission();
  const done = (m.music ? 1 : 0) + (m.question ? 1 : 0) + (m.story ? 1 : 0);
  return { done, total: 3, percent: Math.round((done / 3) * 100) };
}

// ---- Total XP ("pontos de sabedoria") ----
export function getTotalXp(): number {
  const raw = safeRead(TOTAL_XP_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function addXp(action: MissionAction): { total: number; gained: number } {
  const gained = XP_VALUES[action];
  const total = getTotalXp() + gained;
  safeWrite(TOTAL_XP_KEY, String(total));
  return { total, gained };
}

// ---- Session action counter (for parent conversion trigger) ----
export function bumpSessionActions(): number {
  const raw = safeRead(ACTION_COUNT_KEY);
  const cur = raw ? parseInt(raw, 10) : 0;
  const next = (Number.isFinite(cur) ? cur : 0) + 1;
  safeWrite(ACTION_COUNT_KEY, String(next));
  return next;
}

export function getSessionActions(): number {
  const raw = safeRead(ACTION_COUNT_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function resetSessionActions() {
  safeWrite(ACTION_COUNT_KEY, "0");
}

// ---- Conversion trigger (parent-facing) ----
const CONV_SHOWN_KEY = "kidzz_conv_card_last";
export function shouldShowConversionCard(isPremium: boolean): boolean {
  if (isPremium) return false;
  const actions = getSessionActions();
  if (actions < 2) return false;
  const last = safeRead(CONV_SHOWN_KEY);
  if (last === todayISO()) return false;
  return true;
}
export function markConversionCardShown() {
  safeWrite(CONV_SHOWN_KEY, todayISO());
}

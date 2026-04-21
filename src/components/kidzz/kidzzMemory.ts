/* ── KIDZZ Memory Engine ──
   Estado contextual leve baseado em localStorage.
   Permite que o KIDZZ "lembre" de coisas e reaja ao ambiente.
*/

const STORAGE_KEY = "kidzz_memory_v1";

export interface KidzzMemoryState {
  lastVisit?: string;          // ISO date
  lastQuestionAt?: string;     // ISO
  lastQuestionTitle?: string;  // último tema
  streakDays?: number;
  totalVisits?: number;
  hasMetCosmic?: boolean;
  hasMetMoon?: boolean;
  hasMetExplorer?: boolean;
  hasMetMusic?: boolean;
  childName?: string;
}

function read(): KidzzMemoryState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function write(state: KidzzMemoryState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* noop */ }
}

export const kidzzMemory = {
  get: read,

  remember(patch: Partial<KidzzMemoryState>) {
    const cur = read();
    write({ ...cur, ...patch });
  },

  markMet(state: "cosmic" | "moon" | "explorer" | "music") {
    const cur = read();
    const key = `hasMet${state.charAt(0).toUpperCase() + state.slice(1)}` as keyof KidzzMemoryState;
    write({ ...cur, [key]: true });
  },

  bumpVisit() {
    const cur = read();
    write({
      ...cur,
      totalVisits: (cur.totalVisits ?? 0) + 1,
      lastVisit: new Date().toISOString(),
    });
  },

  recordQuestion(title: string) {
    const cur = read();
    write({
      ...cur,
      lastQuestionAt: new Date().toISOString(),
      lastQuestionTitle: title.slice(0, 80),
    });
  },
};

/* Generates a contextual greeting based on time, streak, history. */
export function getContextualGreeting(opts: {
  childName?: string;
  streakDays?: number;
  ageRange?: string | null;
}): { text: string; mood: "curious" | "calm" | "guide" | "happy" } {
  const mem = read();
  const hour = new Date().getHours();
  const name = opts.childName || mem.childName || "amiguinho";
  const streak = opts.streakDays ?? mem.streakDays ?? 0;

  // Night → calm moon energy
  if (hour >= 19 || hour < 6) {
    if (streak >= 3) return { text: `Hora das estrelas, ${name}… ✨`, mood: "calm" };
    return { text: `Boa noite, ${name}. As estrelas chegaram.`, mood: "calm" };
  }

  // Morning
  if (hour < 11) {
    if (streak >= 5) return { text: `${streak} dias juntos! Você está incrível! 🌟`, mood: "happy" };
    if (streak >= 2) return { text: `Bom dia, ${name}! De volta tão cedo?`, mood: "curious" };
    return { text: `Bom dia, ${name}! O que vamos descobrir hoje?`, mood: "curious" };
  }

  // Afternoon
  if (hour < 17) {
    if (mem.lastQuestionTitle && wasYesterday(mem.lastQuestionAt)) {
      return { text: `Ontem sua pergunta foi incrível… vamos continuar?`, mood: "guide" };
    }
    return { text: `Olá, ${name}! Pronto pra explorar?`, mood: "curious" };
  }

  // Evening
  return { text: `Boa tarde, ${name}. O sol está descansando…`, mood: "guide" };
}

function wasYesterday(iso?: string): boolean {
  if (!iso) return false;
  const then = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - then.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return diff > oneDay * 0.5 && diff < oneDay * 2;
}

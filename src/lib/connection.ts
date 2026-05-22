// Termômetro de Conexão Familiar
// Métrica emocional viva — soma micro-ações da família em um índice 0-100.
// Persistência local + decaimento natural (dia sem nada perde pontos).

const KEY = "kidzz_connection_v1";
const DAY_MS = 86_400_000;

export type ConnectionEvent =
  | "ritual_completed"     // +12
  | "sos_used"             // +10
  | "decompression_done"   // +8
  | "wellness_completed"   // +10
  | "moment_added"         // +6
  | "question_asked"       // +3
  | "story_finished";      // +5

const WEIGHTS: Record<ConnectionEvent, number> = {
  ritual_completed: 12,
  sos_used: 10,
  decompression_done: 8,
  wellness_completed: 10,
  moment_added: 6,
  question_asked: 3,
  story_finished: 5,
};

interface State {
  score: number;          // 0–100
  updatedAt: number;      // ms epoch
  lastEvents: Array<{ type: ConnectionEvent; at: number }>;
  streakDays: number;
  lastStreakDate: string; // yyyy-mm-dd
}

const todayKey = () => new Date().toISOString().slice(0, 10);

const seed = (): State => ({
  score: 32,
  updatedAt: Date.now(),
  lastEvents: [],
  streakDays: 0,
  lastStreakDate: "",
});

const read = (): State => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    return { ...seed(), ...JSON.parse(raw) };
  } catch {
    return seed();
  }
};

const write = (s: State) => {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
};

/** Aplica decaimento: -4 pontos por dia sem ação (mas nunca abaixo de 18). */
const decay = (s: State): State => {
  const days = Math.floor((Date.now() - s.updatedAt) / DAY_MS);
  if (days <= 0) return s;
  const next = Math.max(18, s.score - days * 4);
  return { ...s, score: next, updatedAt: Date.now() };
};

export const getConnection = (): State => decay(read());

export const trackConnection = (type: ConnectionEvent) => {
  const cur = decay(read());
  const next: State = {
    ...cur,
    score: Math.min(100, cur.score + WEIGHTS[type]),
    updatedAt: Date.now(),
    lastEvents: [{ type, at: Date.now() }, ...cur.lastEvents].slice(0, 12),
  };
  // streak
  const t = todayKey();
  if (cur.lastStreakDate !== t) {
    const yesterday = new Date(Date.now() - DAY_MS).toISOString().slice(0, 10);
    next.streakDays = cur.lastStreakDate === yesterday ? cur.streakDays + 1 : 1;
    next.lastStreakDate = t;
  }
  write(next);
  window.dispatchEvent(new CustomEvent("kidzz:connection-updated", { detail: next }));
  return next;
};

export const connectionLabel = (score: number): { tag: string; msg: string; tint: string } => {
  if (score >= 85) return { tag: "Floresta viva",      msg: "Vocês estão em ressonância.",        tint: "hsl(140 55% 50%)" };
  if (score >= 65) return { tag: "Conectados",         msg: "O elo está forte hoje.",             tint: "hsl(120 50% 50%)" };
  if (score >= 45) return { tag: "Aquecendo",          msg: "Mais um gesto e vocês decolam.",     tint: "hsl(40 80% 55%)" };
  if (score >= 25) return { tag: "Reconectando",       msg: "Um abraço resolveria muita coisa.",  tint: "hsl(20 80% 60%)" };
  return                  { tag: "Distantes",          msg: "Que tal começar pelo respiro?",      tint: "hsl(0 70% 60%)" };
};

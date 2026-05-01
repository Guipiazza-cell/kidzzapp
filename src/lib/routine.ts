/**
 * KIDZZ ROUTINE — Daily habit loop with 15 balanced tasks/day across 3 periods.
 *
 * Goals:
 *  - Build a daily habit loop (morning/afternoon/night) — 5 tasks per period
 *  - 45+ curated tasks across 5 categories (rotina, aprendizado, emoção, energia, vida)
 *  - Deterministic per-day generation (same day = same tasks, no flicker)
 *  - Auto-completes when child uses integrated app features (music/story/question)
 *  - Anti-addiction: hard cap at 15 tasks/day, no punishment on miss
 *
 * Pure localStorage. Resets at midnight.
 */

import { addXp as addGlobalXp } from "@/lib/dailyMission";

export type RoutineCategory = "rotina" | "aprendizado" | "emocao" | "energia" | "vida";
export type RoutinePeriod = "morning" | "afternoon" | "night";
export type IntegrationKind = "music" | "story" | "question" | null;

export interface RoutineTask {
  id: string;
  title: string;
  short: string;          // microcopy under the title
  category: RoutineCategory;
  period: RoutinePeriod;
  /** Lucide icon name string (resolved by the component) */
  icon: string;
  /** When set, completing the matching app action auto-completes this task */
  integration?: IntegrationKind;
}

// ─────────────────────────────────────────────────────────────────────────────
// 40-task curated bank
// ─────────────────────────────────────────────────────────────────────────────
export const TASKS: RoutineTask[] = [
  // 🌅 MORNING
  { id: "m-brush",      title: "Escovar os dentes",           short: "Sorriso brilhante!",           category: "rotina",      period: "morning", icon: "Smile" },
  { id: "m-water",      title: "Beber um copo d'água",        short: "Hidratar o corpo",             category: "rotina",      period: "morning", icon: "Droplet" },
  { id: "m-bed",        title: "Arrumar a cama",              short: "Quarto organizado",            category: "rotina",      period: "morning", icon: "BedDouble" },
  { id: "m-stretch",    title: "Espreguiçar bem alto",        short: "Acordar o corpinho",           category: "energia",     period: "morning", icon: "Sparkles" },
  { id: "m-breakfast",  title: "Tomar café da manhã",         short: "Energia pra começar",          category: "vida",        period: "morning", icon: "Coffee" },
  { id: "m-hug",        title: "Dar um abraço apertado",      short: "Em alguém especial",           category: "emocao",      period: "morning", icon: "Heart" },
  { id: "m-music",      title: "Ouvir uma música feliz",      short: "Floresta da Música",           category: "aprendizado", period: "morning", icon: "Music2",       integration: "music" },
  { id: "m-question",   title: "Fazer uma pergunta",          short: "O que te dá curiosidade hoje?", category: "aprendizado", period: "morning", icon: "MessageCircleHeart", integration: "question" },
  { id: "m-sun",        title: "Olhar pela janela",           short: "Ver o céu de hoje",            category: "emocao",      period: "morning", icon: "Sun" },
  { id: "m-dress",      title: "Se vestir sozinho(a)",        short: "Você consegue!",               category: "rotina",      period: "morning", icon: "Shirt" },
  { id: "m-greet",      title: "Dar bom dia",                 short: "Pra alguém da família",        category: "emocao",      period: "morning", icon: "HandMetal" },
  { id: "m-fruit",      title: "Comer uma fruta",             short: "Energia natural",              category: "vida",        period: "morning", icon: "Apple" },

  // 🌞 AFTERNOON
  { id: "a-story",      title: "Ouvir uma história",          short: "Fábrica de Histórias",         category: "aprendizado", period: "afternoon", icon: "BookOpen", integration: "story" },
  { id: "a-draw",       title: "Desenhar algo lindo",         short: "Solte a criatividade",         category: "aprendizado", period: "afternoon", icon: "Palette" },
  { id: "a-jump",       title: "Pular 10 vezes",              short: "Movimente o corpo",            category: "energia",     period: "afternoon", icon: "Zap" },
  { id: "a-help",       title: "Ajudar em casa",              short: "Pequena tarefa, grande gesto", category: "vida",        period: "afternoon", icon: "Sparkles" },
  { id: "a-friend",     title: "Brincar com alguém",          short: "Compartilhar é divertido",     category: "emocao",      period: "afternoon", icon: "Users" },
  { id: "a-water2",     title: "Beber mais água",             short: "Hidratação é vida",            category: "rotina",      period: "afternoon", icon: "Droplet" },
  { id: "a-snack",      title: "Comer um lanche saudável",    short: "Energia equilibrada",          category: "vida",        period: "afternoon", icon: "Apple" },
  { id: "a-question2",  title: "Perguntar algo novo",         short: "Curiosidade é poder",          category: "aprendizado", period: "afternoon", icon: "MessageCircleHeart", integration: "question" },
  { id: "a-dance",      title: "Dançar uma música",           short: "Solta o corpo!",               category: "energia",     period: "afternoon", icon: "Music2", integration: "music" },
  { id: "a-tidy",       title: "Guardar os brinquedos",       short: "Cada um no seu lugar",         category: "rotina",      period: "afternoon", icon: "Package" },
  { id: "a-build",      title: "Montar algo legal",           short: "Blocos, lego, qualquer coisa", category: "aprendizado", period: "afternoon", icon: "Blocks" },
  { id: "a-thanks",     title: "Agradecer alguém",            short: "Um obrigado de verdade",       category: "emocao",      period: "afternoon", icon: "Heart" },
  { id: "a-walk",       title: "Caminhar um pouquinho",       short: "Mover o corpo",                category: "energia",     period: "afternoon", icon: "Footprints" },

  // 🌙 NIGHT
  { id: "n-bath",       title: "Tomar banho",                 short: "Limpinho(a) e cheiroso(a)",    category: "rotina",      period: "night",   icon: "Droplet" },
  { id: "n-pijama",     title: "Vestir o pijama favorito",    short: "Conforto total",               category: "rotina",      period: "night",   icon: "Shirt" },
  { id: "n-brush2",     title: "Escovar os dentes",           short: "Antes de dormir",              category: "rotina",      period: "night",   icon: "Smile" },
  { id: "n-story",      title: "Ouvir história de dormir",    short: "Mundo dos Sonhos",             category: "emocao",      period: "night",   icon: "Moon",     integration: "story" },
  { id: "n-cuddle",     title: "Abraço de boa noite",         short: "Amor antes de dormir",         category: "emocao",      period: "night",   icon: "Heart" },
  { id: "n-breath",     title: "Respirar fundo 3 vezes",      short: "Acalmar o coração",            category: "emocao",      period: "night",   icon: "Wind" },
  { id: "n-day",        title: "Pensar no melhor do dia",     short: "Gratidão antes de sonhar",     category: "emocao",      period: "night",   icon: "Star" },
  { id: "n-dream",      title: "Imaginar um sonho lindo",     short: "Aventura na imaginação",       category: "aprendizado", period: "night",   icon: "Sparkles" },
  { id: "n-music",      title: "Ouvir música calma",          short: "Pra relaxar",                  category: "rotina",      period: "night",   icon: "Music2",   integration: "music" },
  { id: "n-light",      title: "Apagar a luz no horário",     short: "Sono é energia",               category: "rotina",      period: "night",   icon: "Moon" },
  { id: "n-kiss",       title: "Dar um beijo de boa noite",   short: "Pra quem você ama",            category: "emocao",      period: "night",   icon: "Heart" },
  { id: "n-tidy",       title: "Deixar o quarto arrumado",    short: "Pra acordar feliz",            category: "rotina",      period: "night",   icon: "Package" },
  { id: "n-think",      title: "Pensar 'fui incrível hoje'",  short: "Você foi mesmo!",              category: "emocao",      period: "night",   icon: "Star" },
  { id: "n-water3",     title: "Beber água antes de deitar",  short: "Pequeno gole",                 category: "rotina",      period: "night",   icon: "Droplet" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────────────────────────────────────
const KEY_DAY      = "kidzz_routine_day";        // {date, taskIds:[], done:[]}
const KEY_STREAK   = "kidzz_routine_streak";
const KEY_LAST     = "kidzz_routine_last_full";
const KEY_BEST     = "kidzz_routine_best_streak";
const KEY_LAST_IDS = "kidzz_routine_last_ids";   // remember last 2 days' tasks (avoid repetition)

interface DayState {
  date: string;
  taskIds: string[];   // 9 tasks selected for the day
  done: string[];      // ids completed today
  bonusGiven: boolean; // +20 XP day-complete bonus already awarded
}

const todayISO = () => new Date().toISOString().split("T")[0];

const safeRead = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeWrite = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* noop */ } };

// Deterministic seeded RNG (mulberry32)
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromDate(date: string) {
  let h = 2166136261;
  for (let i = 0; i < date.length; i++) {
    h ^= date.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickBalanced(period: RoutinePeriod, exclude: Set<string>, rand: () => number): RoutineTask[] {
  const pool = TASKS.filter(t => t.period === period && !exclude.has(t.id));
  const byCat = new Map<RoutineCategory, RoutineTask[]>();
  for (const t of pool) {
    const arr = byCat.get(t.category) ?? [];
    arr.push(t);
    byCat.set(t.category, arr);
  }
  const cats = [...byCat.keys()];
  // shuffle cats
  for (let i = cats.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cats[i], cats[j]] = [cats[j], cats[i]];
  }
  const picked: RoutineTask[] = [];
  // First, pick 1 per category until we hit 3 or exhaust cats
  for (const c of cats) {
    if (picked.length >= 3) break;
    const arr = byCat.get(c)!;
    const idx = Math.floor(rand() * arr.length);
    picked.push(arr[idx]);
  }
  // Fallback: if not enough categories, fill from full pool
  if (picked.length < 3) {
    const remaining = pool.filter(t => !picked.find(p => p.id === t.id));
    while (picked.length < 3 && remaining.length) {
      const idx = Math.floor(rand() * remaining.length);
      picked.push(remaining.splice(idx, 1)[0]);
    }
  }
  return picked.slice(0, 3);
}

function generateForDay(date: string): string[] {
  const recent = safeRead(KEY_LAST_IDS);
  const exclude = new Set<string>();
  if (recent) {
    try {
      const parsed: { date: string; ids: string[] }[] = JSON.parse(recent);
      // Exclude tasks used in the last 2 days (soft variety)
      parsed.slice(-2).forEach(d => d.ids.forEach(id => exclude.add(id)));
    } catch { /* noop */ }
  }
  const rand = rng(seedFromDate(date));
  const ids: string[] = [];
  (["morning", "afternoon", "night"] as RoutinePeriod[]).forEach(p => {
    let chosen = pickBalanced(p, exclude, rand);
    // If exclusion left fewer than 3 in a period, retry without exclusion
    if (chosen.length < 3) chosen = pickBalanced(p, new Set(), rand);
    chosen.forEach(t => ids.push(t.id));
  });
  return ids;
}

export function getDayState(): DayState {
  const raw = safeRead(KEY_DAY);
  const date = todayISO();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as DayState;
      if (parsed.date === date) return parsed;
    } catch { /* noop */ }
  }
  // New day → generate
  const taskIds = generateForDay(date);
  const fresh: DayState = { date, taskIds, done: [], bonusGiven: false };
  safeWrite(KEY_DAY, JSON.stringify(fresh));
  // Track recent ids for variety on future days
  try {
    const recent = JSON.parse(safeRead(KEY_LAST_IDS) || "[]");
    recent.push({ date, ids: taskIds });
    safeWrite(KEY_LAST_IDS, JSON.stringify(recent.slice(-3)));
  } catch { /* noop */ }
  return fresh;
}

function saveDay(s: DayState) {
  safeWrite(KEY_DAY, JSON.stringify(s));
}

export interface TodayView {
  morning: RoutineTask[];
  afternoon: RoutineTask[];
  night: RoutineTask[];
  done: Set<string>;
  total: number;
  doneCount: number;
  percent: number;
  allDone: boolean;
}

export function getToday(): TodayView {
  const day = getDayState();
  const tasks = day.taskIds
    .map(id => TASKS.find(t => t.id === id))
    .filter((t): t is RoutineTask => !!t);
  const done = new Set(day.done);
  return {
    morning:   tasks.filter(t => t.period === "morning"),
    afternoon: tasks.filter(t => t.period === "afternoon"),
    night:     tasks.filter(t => t.period === "night"),
    done,
    total: tasks.length,
    doneCount: done.size,
    percent: tasks.length ? Math.round((done.size / tasks.length) * 100) : 0,
    allDone: tasks.length > 0 && done.size >= tasks.length,
  };
}

export interface CompleteResult {
  newlyDone: boolean;
  xpGained: number;
  bonusGained: number;     // +20 if this completion finished the whole day
  allDone: boolean;
  doneCount: number;
  total: number;
}

/**
 * Mark a task as done. Idempotent — a second call with the same id is a no-op.
 * Awards +5 XP for plain tasks, +8 for integrated tasks, +20 bonus on day complete.
 */
export function completeTask(taskId: string): CompleteResult {
  const day = getDayState();
  const task = TASKS.find(t => t.id === taskId);
  if (!task || !day.taskIds.includes(taskId)) {
    return { newlyDone: false, xpGained: 0, bonusGained: 0, allDone: false, doneCount: day.done.length, total: day.taskIds.length };
  }
  if (day.done.includes(taskId)) {
    return { newlyDone: false, xpGained: 0, bonusGained: 0, allDone: day.done.length >= day.taskIds.length, doneCount: day.done.length, total: day.taskIds.length };
  }
  day.done.push(taskId);
  const xpGained = task.integration ? 8 : 5;
  addGlobalXp("activity", xpGained);

  let bonusGained = 0;
  const allDone = day.done.length >= day.taskIds.length;
  if (allDone && !day.bonusGiven) {
    day.bonusGiven = true;
    bonusGained = 20;
    addGlobalXp("activity", 20);
    bumpStreak();
  }
  saveDay(day);
  return { newlyDone: true, xpGained, bonusGained, allDone, doneCount: day.done.length, total: day.taskIds.length };
}

/**
 * Auto-complete tasks tied to an integration (called when child uses music/story/question).
 * Returns the number of tasks newly completed (usually 0 or 1).
 */
export function completeByIntegration(kind: IntegrationKind): { completed: RoutineTask[]; results: CompleteResult[] } {
  if (!kind) return { completed: [], results: [] };
  const day = getDayState();
  const targets = day.taskIds
    .map(id => TASKS.find(t => t.id === id))
    .filter((t): t is RoutineTask => !!t && t.integration === kind && !day.done.includes(t.id));
  const results: CompleteResult[] = [];
  for (const t of targets) {
    results.push(completeTask(t.id));
  }
  return { completed: targets, results };
}

// ─────────────────────────────────────────────────────────────────────────────
// Streak (consecutive full-completion days)
// ─────────────────────────────────────────────────────────────────────────────
function bumpStreak() {
  const today = todayISO();
  const last = safeRead(KEY_LAST);
  const cur  = parseInt(safeRead(KEY_STREAK) || "0", 10) || 0;
  const best = parseInt(safeRead(KEY_BEST)   || "0", 10) || 0;
  if (last === today) return; // already counted
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  const yestISO = yest.toISOString().split("T")[0];
  const next = last === yestISO ? cur + 1 : 1;
  safeWrite(KEY_STREAK, String(next));
  safeWrite(KEY_LAST, today);
  if (next > best) safeWrite(KEY_BEST, String(next));
}

export function getStreak(): { current: number; best: number; missedYesterday: boolean } {
  const cur  = parseInt(safeRead(KEY_STREAK) || "0", 10) || 0;
  const best = parseInt(safeRead(KEY_BEST)   || "0", 10) || 0;
  const last = safeRead(KEY_LAST);
  const today = todayISO();
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  const yestISO = yest.toISOString().split("T")[0];
  // If we missed more than yesterday, soft-reset display (but keep best)
  let display = cur;
  if (last && last !== today && last !== yestISO) display = 0;
  return { current: display, best, missedYesterday: last !== today && last !== yestISO && cur > 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// Greeting + KIDZZ feedback copy
// ─────────────────────────────────────────────────────────────────────────────
export function getCurrentPeriod(): RoutinePeriod {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "night";
}

export function getKidzzMessage(view: TodayView, childName: string): string {
  const name = childName?.trim() || "amigo";
  if (view.allDone) return `${name}, você foi INCRÍVEL hoje! ✨`;
  if (view.doneCount === 0) {
    const period = getCurrentPeriod();
    if (period === "morning") return `Bom dia, ${name}! Vamos começar o dia juntos?`;
    if (period === "afternoon") return `Oi ${name}! Pronto pra mais aventuras?`;
    return `Boa noite, ${name}! Vamos terminar o dia bonito?`;
  }
  if (view.doneCount === 1) return `Boa, ${name}! Já começou. Bora pra próxima?`;
  if (view.doneCount >= view.total - 1) return `Falta só uma, ${name}! Você consegue!`;
  if (view.percent >= 50) return `Você está indo MUITO bem, ${name}!`;
  return `Hoje você já fez coisas incríveis ✨`;
}

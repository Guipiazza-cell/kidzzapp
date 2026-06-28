/**
 * Progresso de leitura por história (memory id).
 * Persistido em localStorage — sem inventar métricas, só registra o que foi lido.
 */
const KEY = "kidzz_story_progress_v1";

export type StoryProgress = {
  page: number;       // 0-indexed page reached
  total: number;      // total pages (scenes)
  pct: number;        // 0..100
  updatedAt: number;
};

type Map = Record<string, StoryProgress>;

const read = (): Map => {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
};
const write = (m: Map) => {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* noop */ }
};

export const getProgress = (id: string): StoryProgress | null => read()[id] ?? null;

export const getAllProgress = (): Map => read();

export const saveProgress = (id: string, page: number, total: number) => {
  if (!id || total <= 0) return;
  const pct = Math.min(100, Math.max(0, Math.round(((page + 1) / total) * 100)));
  const map = read();
  const prev = map[id];
  // Nunca regredir o progresso registrado
  if (prev && prev.pct >= pct) {
    prev.updatedAt = Date.now();
    map[id] = prev;
  } else {
    map[id] = { page, total, pct, updatedAt: Date.now() };
  }
  write(map);
};

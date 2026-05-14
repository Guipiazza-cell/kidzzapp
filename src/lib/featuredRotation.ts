/**
 * KIDZZ — Sistema de rotação automática editorial.
 * Funciona sozinho a longo prazo. Sem necessidade de alterar código.
 *
 * Regras:
 *  - "Filme da Semana" muda a cada 7 dias (ISO week).
 *  - Cards "Em alta hoje" alternam diariamente.
 *  - Determinístico: mesma data → mesma curadoria (estabilidade visual).
 */
import { MOVIES, type Movie } from "@/data/movies";

const MS_PER_DAY = 86_400_000;
// Epoch: 2024-01-01 (segunda-feira) — base estável para semanas.
const EPOCH_MS = Date.UTC(2024, 0, 1);

const dayIndex = (now = Date.now()) =>
  Math.floor((now - EPOCH_MS) / MS_PER_DAY);

const weekIndex = (now = Date.now()) =>
  Math.floor(dayIndex(now) / 7);

/* Filme da semana: prefere `destaque: true`, fallback no acervo total */
export const getWeeklyMovie = (now = Date.now()): Movie => {
  const featured = MOVIES.filter((m) => m.destaque);
  const pool = featured.length > 0 ? featured : MOVIES;
  return pool[weekIndex(now) % pool.length];
};

/* Top 3 do dia — ignora o filme da semana p/ não duplicar */
export const getDailyHighlights = (count = 3, now = Date.now()): Movie[] => {
  const weekly = getWeeklyMovie(now);
  const pool = MOVIES.filter((m) => m.id !== weekly.id);
  const start = (dayIndex(now) * 3) % pool.length;
  const out: Movie[] = [];
  for (let i = 0; i < count; i++) out.push(pool[(start + i * 7) % pool.length]);
  return out;
};

/* "Novo na curadoria" — combina flags `novo` + rotação leve */
export const getNewArrivals = (now = Date.now()): Movie[] => {
  const novos = MOVIES.filter((m) => m.novo);
  if (novos.length === 0) return [];
  const offset = dayIndex(now) % novos.length;
  return [...novos.slice(offset), ...novos.slice(0, offset)];
};

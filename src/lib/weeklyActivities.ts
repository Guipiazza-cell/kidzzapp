/**
 * Atividades semanais — pool curado + IA refresca
 * ─────────────────────────────────────────────────
 * O usuário sempre vê 10 atividades por semana. Estratégia:
 *  1. Pool estático com ~40 atividades (4 categorias × 10).
 *  2. `pickWeeklyFromPool(seed)` sorteia 10 determinísticas pela semana ISO
 *     → mesmas 10 atividades durante toda a semana, mudam na segunda.
 *  3. Quando online, edge function `generate-activities` retorna 10 atividades
 *     personalizadas pela idade/interesses; resultado é cacheado em
 *     localStorage com a chave da semana e usado em vez do pool.
 *  4. Fallback: se IA falhar ou demorar, mostra pool imediatamente
 *     (zero loading bloqueante).
 */

export type ActivityCategory = "movimento" | "criatividade" | "familia" | "desafio";

export interface Activity {
  id: string;
  title: string;
  emoji: string;
  category: ActivityCategory;
  /** Descrição curta motivacional (1-2 frases) */
  description: string;
  /** XP ganho ao concluir */
  xp: number;
}

const CATEGORY_META: Record<
  ActivityCategory,
  { label: string; color: string; emoji: string }
> = {
  movimento: { label: "Movimento", color: "hsl(140 70% 55%)", emoji: "🏃" },
  criatividade: { label: "Criatividade", color: "hsl(280 70% 65%)", emoji: "🎨" },
  familia: { label: "Família", color: "hsl(340 75% 65%)", emoji: "💛" },
  desafio: { label: "Desafio", color: "hsl(35 95% 60%)", emoji: "⚡" },
};

export function getCategoryMeta(c: ActivityCategory) {
  return CATEGORY_META[c];
}

/* ── Pool curado ── */
export const ACTIVITY_POOL: Activity[] = [
  // Movimento
  { id: "m1", title: "Dance pelos cômodos", emoji: "💃", category: "movimento", description: "Coloque uma música e dance da sala até o quarto.", xp: 15 },
  { id: "m2", title: "Pula corda imaginário", emoji: "🪢", category: "movimento", description: "Pule 20 vezes fingindo que tem uma corda.", xp: 10 },
  { id: "m3", title: "Estátua musical", emoji: "🗿", category: "movimento", description: "Dance e pare quando alguém pausar a música.", xp: 15 },
  { id: "m4", title: "Caminhada do ursinho", emoji: "🐻", category: "movimento", description: "Ande de quatro pela casa imitando um urso.", xp: 10 },
  { id: "m5", title: "10 polichinelos", emoji: "🤸", category: "movimento", description: "Faça 10 polichinelos rápidos e respire fundo.", xp: 10 },
  { id: "m6", title: "Equilibre num pé só", emoji: "🦩", category: "movimento", description: "Quanto tempo consegue ficar num pé só?", xp: 10 },
  { id: "m7", title: "Caça ao tesouro", emoji: "🗺️", category: "movimento", description: "Encontre 5 objetos amarelos pela casa.", xp: 20 },
  { id: "m8", title: "Pular como sapo", emoji: "🐸", category: "movimento", description: "Pule 10 vezes agachado como um sapo.", xp: 10 },
  { id: "m9", title: "Imite um animal", emoji: "🦒", category: "movimento", description: "Escolha um animal e imite ele por 1 minuto.", xp: 10 },
  { id: "m10", title: "Brinque de espelho", emoji: "🪞", category: "movimento", description: "Imite tudo que outra pessoa fizer.", xp: 15 },

  // Criatividade
  { id: "c1", title: "Construa uma cabana", emoji: "🏕️", category: "criatividade", description: "Use almofadas e lençóis para fazer um esconderijo.", xp: 25 },
  { id: "c2", title: "Desenhe seu herói", emoji: "🦸", category: "criatividade", description: "Crie um super-herói novo no papel.", xp: 20 },
  { id: "c3", title: "Invente um nome maluco", emoji: "🎲", category: "criatividade", description: "Misture 2 nomes e crie um personagem.", xp: 10 },
  { id: "c4", title: "Conte uma história", emoji: "📖", category: "criatividade", description: "Invente uma história com 3 palavras: gato, lua, sorvete.", xp: 20 },
  { id: "c5", title: "Faça um carimbo", emoji: "🥔", category: "criatividade", description: "Use uma batata cortada para carimbar formas.", xp: 25 },
  { id: "c6", title: "Origami simples", emoji: "📄", category: "criatividade", description: "Dobre um avião de papel e faça ele voar.", xp: 15 },
  { id: "c7", title: "Cante inventando a letra", emoji: "🎤", category: "criatividade", description: "Pegue uma melodia e invente a letra do nada.", xp: 15 },
  { id: "c8", title: "Desenhe seu sonho", emoji: "💭", category: "criatividade", description: "O sonho mais legal que você já teve.", xp: 20 },
  { id: "c9", title: "Crie um robô", emoji: "🤖", category: "criatividade", description: "Use caixas de papelão pra montar um robô.", xp: 25 },
  { id: "c10", title: "Faça uma máscara", emoji: "🎭", category: "criatividade", description: "Recorte e pinte uma máscara de animal.", xp: 25 },

  // Família
  { id: "f1", title: "Dance com seu pai/mãe", emoji: "💃", category: "familia", description: "Escolha 1 música e dance com alguém da família.", xp: 25 },
  { id: "f2", title: "Conte uma piada", emoji: "🤣", category: "familia", description: "Faça alguém da família rir hoje.", xp: 15 },
  { id: "f3", title: "Abrace forte 3 vezes", emoji: "🤗", category: "familia", description: "Abrace alguém que você ama 3 vezes seguidas.", xp: 10 },
  { id: "f4", title: "Cozinhe junto", emoji: "🍳", category: "familia", description: "Ajude a fazer um lanche simples na cozinha.", xp: 25 },
  { id: "f5", title: "Pergunte da infância", emoji: "👵", category: "familia", description: "Pergunte ao adulto sobre o brinquedo favorito dele quando criança.", xp: 20 },
  { id: "f6", title: "Faça um desenho de presente", emoji: "🎁", category: "familia", description: "Desenhe e dê de presente pra alguém da família.", xp: 20 },
  { id: "f7", title: "Brinquem de mímica", emoji: "🤐", category: "familia", description: "Joguem mímica em família por 10 minutos.", xp: 20 },
  { id: "f8", title: "Diga 3 elogios", emoji: "💌", category: "familia", description: "Diga 3 coisas legais para alguém da família.", xp: 15 },
  { id: "f9", title: "Conte como foi seu dia", emoji: "📅", category: "familia", description: "Conte a parte mais legal e a mais difícil do seu dia.", xp: 15 },
  { id: "f10", title: "Brinquem de esconder", emoji: "🙈", category: "familia", description: "Joguem esconde-esconde pela casa.", xp: 20 },

  // Desafio leve
  { id: "d1", title: "Beba 3 copos d'água", emoji: "💧", category: "desafio", description: "Beba 3 copos cheios ao longo do dia.", xp: 15 },
  { id: "d2", title: "Arrume sua cama", emoji: "🛏️", category: "desafio", description: "Arrume sua cama assim que acordar.", xp: 10 },
  { id: "d3", title: "Guarde 5 brinquedos", emoji: "🧸", category: "desafio", description: "Guarde 5 brinquedos no lugar certo.", xp: 10 },
  { id: "d4", title: "Aprenda 1 palavra nova", emoji: "📚", category: "desafio", description: "Pergunte e aprenda 1 palavra que não conhece.", xp: 15 },
  { id: "d5", title: "Faça silêncio 1 minuto", emoji: "🤫", category: "desafio", description: "Fique em silêncio total escutando os sons da casa.", xp: 10 },
  { id: "d6", title: "Conte até 30", emoji: "🔢", category: "desafio", description: "Conte de 1 até 30 sem errar.", xp: 10 },
  { id: "d7", title: "Escove os dentes cantando", emoji: "🦷", category: "desafio", description: "Cante uma música inteira escovando os dentes.", xp: 10 },
  { id: "d8", title: "Diga 'obrigado' 5 vezes", emoji: "🙏", category: "desafio", description: "Agradeça 5 coisas hoje.", xp: 15 },
  { id: "d9", title: "Olhe pela janela 2 min", emoji: "🪟", category: "desafio", description: "Observe lá fora e conte o que viu.", xp: 10 },
  { id: "d10", title: "Respiração profunda", emoji: "🌬️", category: "desafio", description: "Inspire fundo e expire devagar 5 vezes.", xp: 10 },
];

/* ── Sorteio determinístico por semana ── */

/** ISO week key: "2025-W17" — muda toda segunda-feira */
export function getWeekKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7; // segunda = 0
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week = Math.round(
    ((date.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7
  ) + 1;
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Hash determinístico simples (string → int) */
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Sorteia 10 atividades determinísticas pela semana, garantindo mix de categorias */
export function pickWeeklyFromPool(seed: string): Activity[] {
  const baseHash = hashStr(seed);
  const result: Activity[] = [];
  const used = new Set<string>();
  const cats: ActivityCategory[] = ["movimento", "criatividade", "familia", "desafio"];
  // Garante pelo menos 2 de cada categoria (8) + 2 livres
  for (const cat of cats) {
    const items = ACTIVITY_POOL.filter((a) => a.category === cat);
    for (let n = 0; n < 2; n++) {
      const idx = (baseHash + n * 7 + cat.charCodeAt(0) * 13) % items.length;
      let pick = items[idx];
      let bump = 0;
      while (used.has(pick.id) && bump < items.length) {
        bump++;
        pick = items[(idx + bump) % items.length];
      }
      used.add(pick.id);
      result.push(pick);
    }
  }
  // 2 atividades extras livres
  for (let n = 0; n < 2; n++) {
    const idx = (baseHash + n * 31) % ACTIVITY_POOL.length;
    let pick = ACTIVITY_POOL[idx];
    let bump = 0;
    while (used.has(pick.id) && bump < ACTIVITY_POOL.length) {
      bump++;
      pick = ACTIVITY_POOL[(idx + bump) % ACTIVITY_POOL.length];
    }
    used.add(pick.id);
    result.push(pick);
  }
  return result;
}

/* ── Cache da semana (IA + pool) ── */

const WEEK_CACHE_KEY = "kidzz_weekly_activities_v1";
const COMPLETED_KEY = "kidzz_weekly_completed_v1";

interface WeekCache {
  weekKey: string;
  activities: Activity[];
  source: "pool" | "ai";
}

export function loadWeeklyCache(currentWeek: string): WeekCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(WEEK_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WeekCache;
    if (parsed.weekKey !== currentWeek) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveWeeklyCache(cache: WeekCache) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WEEK_CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* noop */
  }
}

/** Conjunto de IDs concluídos nesta semana (reseta toda segunda) */
export function loadCompletedSet(currentWeek: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(COMPLETED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as { weekKey: string; ids: string[] };
    if (parsed.weekKey !== currentWeek) return new Set();
    return new Set(parsed.ids);
  } catch {
    return new Set();
  }
}

export function saveCompletedSet(currentWeek: string, ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      COMPLETED_KEY,
      JSON.stringify({ weekKey: currentWeek, ids: Array.from(ids) })
    );
  } catch {
    /* noop */
  }
}

/** Devolve a "atividade do dia" — 1 destacada por dia entre as não concluídas */
export function pickDailyHighlight(
  weekly: Activity[],
  completed: Set<string>,
  d = new Date()
): Activity | null {
  const remaining = weekly.filter((a) => !completed.has(a.id));
  if (remaining.length === 0) return null;
  const dayIdx = d.getDay() + d.getDate(); // varia por dia
  return remaining[dayIdx % remaining.length];
}

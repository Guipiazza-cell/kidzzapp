/**
 * Catálogo único de experiências KALM.
 * 5 grupos: Quick Relief, Parent Reset, Connection, Soundscapes, Journeys.
 *
 * Cada experiência tem:
 *  - id estável (usado pelo mapeamento SOS → KALM)
 *  - kind: como o Player a renderiza
 *  - tier: free / premium
 */

export type KalmTier = "free" | "premium";

export type KalmKind =
  | "breathing"   // respiração guiada com timer
  | "timer"       // pausa silenciosa com timer (1/3/5 min)
  | "soundscape"  // loop ambiente (AmbientSoundEngine)
  | "journey"     // jornada com N dias
  | "ritual";     // texto guiado + passos

export type KalmExperience = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  duration: string;       // texto curto ("1 min", "5 min", "loop")
  kind: KalmKind;
  tier: KalmTier;
  tint: string;           // hsl
  // específicos por tipo
  breath?: { in: number; hold: number; out: number; cycles: number };
  timerSec?: number;
  audioUrl?: string;
  steps?: string[];
  days?: number;
};

export type KalmSection = {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  tone: "light" | "adult" | "family"; // controla o visual
  items: KalmExperience[];
};

const sage = "hsl(150 30% 55%)";
const emerald = "hsl(150 38% 36%)";
const serenity = "hsl(205 45% 62%)";
const clay = "hsl(28 45% 60%)";
const moss = "hsl(120 25% 45%)";
const lilac = "hsl(265 35% 65%)";
const ocean = "hsl(200 55% 50%)";

export const KALM_SECTIONS: KalmSection[] = [
  /* ────────── QUICK RELIEF ────────── */
  {
    id: "quick-relief",
    kicker: "Quick Relief",
    title: "Alívio em minutos",
    subtitle: "Pequenas pausas que restauram já.",
    tone: "light",
    items: [
      {
        id: "pause-1min",
        emoji: "🫧",
        title: "Pausa de 1 minuto",
        desc: "Um respiro guiado, simples e curto.",
        duration: "1 min",
        kind: "timer",
        tier: "free",
        tint: sage,
        timerSec: 60,
      },
      {
        id: "breathe-wind",
        emoji: "🍃",
        title: "Respirar com o vento",
        desc: "Inspira 4 · solta 6. Cinco ciclos lentos.",
        duration: "3 min",
        kind: "breathing",
        tier: "premium",
        tint: moss,
        breath: { in: 4, hold: 2, out: 6, cycles: 5 },
      },
      {
        id: "calm-now",
        emoji: "🌊",
        title: "Acalmar agora",
        desc: "Onda lenta com som de oceano.",
        duration: "5 min",
        kind: "soundscape",
        tier: "premium",
        tint: ocean,
        audioUrl: "/audio/ocean-waves.mp3",
        timerSec: 300,
      },
      {
        id: "wind-down",
        emoji: "🌙",
        title: "Desligar devagar",
        desc: "Respiração 4·7·8 para soltar o dia.",
        duration: "4 min",
        kind: "breathing",
        tier: "premium",
        tint: lilac,
        breath: { in: 4, hold: 7, out: 8, cycles: 4 },
      },
    ],
  },

  /* ────────── PARENT RESET ────────── */
  {
    id: "parent-reset",
    kicker: "Parent Reset",
    title: "Para você, mãe e pai",
    subtitle: "Pausas adultas. Cuidar de quem cuida.",
    tone: "adult",
    items: [
      {
        id: "parent-pause",
        emoji: "☕",
        title: "Pausa dos Pais",
        desc: "Cinco minutos só seus, sem culpa.",
        duration: "5 min",
        kind: "timer",
        tier: "free",
        tint: clay,
        timerSec: 300,
      },
      {
        id: "too-much",
        emoji: "🫂",
        title: "Quando tudo parece demais",
        desc: "Ritual de descompressão em 3 passos.",
        duration: "4 min",
        kind: "ritual",
        tier: "premium",
        tint: emerald,
        steps: [
          "Sente-se. Tire o celular do bolso.",
          "Beba um gole de água. Respire fundo três vezes.",
          "Diga em voz baixa: 'eu também mereço pausa'.",
        ],
      },
      {
        id: "recover-energy",
        emoji: "🌙",
        title: "Recuperar energia",
        desc: "Body scan curto para soltar o cansaço.",
        duration: "6 min",
        kind: "breathing",
        tier: "premium",
        tint: lilac,
        breath: { in: 4, hold: 4, out: 6, cycles: 6 },
      },
      {
        id: "breathe-before-react",
        emoji: "🍃",
        title: "Respirar antes de reagir",
        desc: "Três respirações longas antes da próxima fala.",
        duration: "1 min",
        kind: "breathing",
        tier: "free",
        tint: sage,
        breath: { in: 4, hold: 2, out: 6, cycles: 3 },
      },
    ],
  },

  /* ────────── CONNECTION ────────── */
  {
    id: "connection",
    kicker: "Connection",
    title: "Vínculo em família",
    subtitle: "Experiências para fortalecer o que importa.",
    tone: "family",
    items: [
      {
        id: "reconnect-after-conflict",
        emoji: "💚",
        title: "Reconexão após conflito",
        desc: "Três gestos simples para reabrir o canal.",
        duration: "5 min",
        kind: "ritual",
        tier: "premium",
        tint: emerald,
        steps: [
          "Sente-se na altura dele. Diga: 'eu te vejo'.",
          "Pergunte: 'o que você sentiu agora?' — sem corrigir.",
          "Um abraço silencioso. Sem palavras por 20 segundos.",
        ],
      },
      {
        id: "five-min-together",
        emoji: "✨",
        title: "5 minutos juntos",
        desc: "Presença total, sem tela, sem objetivo.",
        duration: "5 min",
        kind: "timer",
        tier: "free",
        tint: sage,
        timerSec: 300,
      },
      {
        id: "family-gratitude",
        emoji: "🌿",
        title: "Gratidão em família",
        desc: "Cada um diz uma coisa boa do dia.",
        duration: "3 min",
        kind: "ritual",
        tier: "premium",
        tint: moss,
        steps: [
          "Sentem-se em roda — pode ser na cama.",
          "Cada um diz uma coisa boa que aconteceu hoje.",
          "Encerrem com um 'obrigado por estar aqui'.",
        ],
      },
      {
        id: "strengthen-bond",
        emoji: "🤝",
        title: "Fortalecendo vínculos",
        desc: "Mini ritual de presença, todos os dias.",
        duration: "Hábito",
        kind: "ritual",
        tier: "premium",
        tint: emerald,
        steps: [
          "Escolham um horário fixo do dia.",
          "Dois minutos juntos, sem distrações.",
          "Olho no olho. Um abraço. Sempre.",
        ],
      },
    ],
  },

  /* ────────── SOUNDSCAPES ────────── */
  {
    id: "soundscapes",
    kicker: "Soundscapes",
    title: "Sons que abraçam",
    subtitle: "Atmosferas longas para ambientar a casa.",
    tone: "light",
    items: [
      {
        id: "sound-rain",
        emoji: "🌧",
        title: "Chuva",
        desc: "Chuva suave, contínua.",
        duration: "loop",
        kind: "soundscape",
        tier: "free",
        tint: serenity,
        audioUrl: "/audio/rain-soft.mp3",
      },
      {
        id: "sound-forest",
        emoji: "🌳",
        title: "Floresta",
        desc: "Folhas, vento, pássaros distantes.",
        duration: "loop",
        kind: "soundscape",
        tier: "premium",
        tint: moss,
        audioUrl: "/audio/forest-calm.mp3",
      },
      {
        id: "sound-ocean",
        emoji: "🌊",
        title: "Oceano",
        desc: "Ondas lentas, respiração do mar.",
        duration: "loop",
        kind: "soundscape",
        tier: "premium",
        tint: ocean,
        audioUrl: "/audio/ocean-waves.mp3",
      },
      {
        id: "sound-night",
        emoji: "🌙",
        title: "Noite tranquila",
        desc: "Brisa fina e ruído branco gentil.",
        duration: "loop",
        kind: "soundscape",
        tier: "premium",
        tint: lilac,
        audioUrl: "/audio/white-noise.mp3",
      },
      {
        id: "sound-river",
        emoji: "🛶",
        title: "Rio suave",
        desc: "Água correndo, sem pressa.",
        duration: "loop",
        kind: "soundscape",
        tier: "premium",
        tint: sage,
        audioUrl: "/audio/forest-calm.mp3",
      },
    ],
  },

  /* ────────── JOURNEYS ────────── */
  {
    id: "journeys",
    kicker: "Journeys",
    title: "Jornadas completas",
    subtitle: "Experiências de vários dias para construir hábito.",
    tone: "light",
    items: [
      {
        id: "journey-7-calm",
        emoji: "🌿",
        title: "7 dias de calma",
        desc: "Uma prática curta por dia, durante uma semana.",
        duration: "7 dias",
        kind: "journey",
        tier: "premium",
        tint: emerald,
        days: 7,
      },
      {
        id: "journey-7-nights",
        emoji: "🌙",
        title: "7 noites melhores",
        desc: "Ritual de sono em sete passos noturnos.",
        duration: "7 noites",
        kind: "journey",
        tier: "premium",
        tint: lilac,
        days: 7,
      },
      {
        id: "journey-courage",
        emoji: "🦁",
        title: "Coragem para pequenos medos",
        desc: "Cinco encontros para transformar medo em coragem.",
        duration: "5 dias",
        kind: "journey",
        tier: "premium",
        tint: clay,
        days: 5,
      },
      {
        id: "journey-family-reconnect",
        emoji: "💚",
        title: "Reconexão familiar",
        desc: "Sete dias de gestos simples para o vínculo.",
        duration: "7 dias",
        kind: "journey",
        tier: "premium",
        tint: sage,
        days: 7,
      },
    ],
  },
];

export const findExperience = (id: string): KalmExperience | undefined => {
  for (const s of KALM_SECTIONS) {
    const m = s.items.find((it) => it.id === id);
    if (m) return m;
  }
  return undefined;
};

/**
 * Motor emocional global do KIDZZ
 * ─────────────────────────────────
 * Detecta o estado da criança a partir de sinais leves (streak, XP do dia,
 * tempo desde última interação) e expõe um humor sugerido para o mascote +
 * uma fala curta. NÃO faz chamadas externas — tudo local, instantâneo.
 *
 * Sinais usados:
 *  - streak (profile.streak_days) → orgulhoso quando >= 3
 *  - XP do dia (dailyMission) → animado quando há ganhos hoje
 *  - inatividade > 24h → sente falta
 *  - level-up recente (event kidzz:level-up) → festivo por 30s
 */
export type EmotionalMood =
  | "celebrate" // acabou de subir nível
  | "proud" // streak forte
  | "excited" // ganhou XP hoje
  | "missed" // sem entrar há +1 dia
  | "calm"; // estado neutro

export interface EmotionalSignal {
  mood: EmotionalMood;
  speech: string;
  emoji: string;
}

const LAST_SEEN_KEY = "kidzz_last_seen_at";
const LEVELUP_AT_KEY = "kidzz_levelup_at";

export function markSeen() {
  try {
    localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
  } catch {
    /* noop */
  }
}

export function markLevelUp() {
  try {
    localStorage.setItem(LEVELUP_AT_KEY, String(Date.now()));
  } catch {
    /* noop */
  }
}

function readNum(key: string): number {
  try {
    const v = Number(localStorage.getItem(key));
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
}

export function readEmotionalSignal(input: {
  childName?: string;
  streakDays?: number;
  dailyXp?: number;
}): EmotionalSignal {
  const name = input.childName || "amigo";
  const streak = input.streakDays ?? 0;
  const dailyXp = input.dailyXp ?? 0;
  const now = Date.now();
  const lastSeen = readNum(LAST_SEEN_KEY);
  const lastLevelUp = readNum(LEVELUP_AT_KEY);

  // Celebra por 30s após level-up
  if (lastLevelUp && now - lastLevelUp < 30_000) {
    return {
      mood: "celebrate",
      speech: `Você é incrível, ${name}! ✨`,
      emoji: "🎉",
    };
  }

  // Sente falta após 24h sem ver
  if (lastSeen && now - lastSeen > 24 * 60 * 60 * 1000) {
    return {
      mood: "missed",
      speech: `Senti sua falta, ${name}! 💚`,
      emoji: "🥺",
    };
  }

  if (streak >= 3) {
    return {
      mood: "proud",
      speech: `${streak} dias seguidos! Que orgulho! 🔥`,
      emoji: "🏅",
    };
  }

  if (dailyXp > 0) {
    return {
      mood: "excited",
      speech: `Vamos continuar, ${name}? 🚀`,
      emoji: "⚡",
    };
  }

  return {
    mood: "calm",
    speech: `Pronto pra brincar, ${name}? 💚`,
    emoji: "🦎",
  };
}

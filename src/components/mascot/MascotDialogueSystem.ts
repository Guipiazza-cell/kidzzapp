/**
 * Mascot Dialogue System — contextual, time-aware, interest-based state machine
 */

export type MascotState =
  | "morning"
  | "afternoon"
  | "evening"
  | "night"
  | "streak_milestone"
  | "after_answer"
  | "after_story"
  | "idle"
  | "new_achievement"
  | "celebrating";

export type MascotMood = "idle" | "curious" | "happy" | "thinking" | "talking" | "excited" | "sleeping";

interface DialogueEntry {
  ane: string[];
  pixel: string[];
}

const dialogues: Record<string, DialogueEntry> = {
  morning: {
    ane: [
      "Bom dia, [Nome]! ☀️ Que descoberta vamos fazer hoje?",
      "Oi [Nome]! Acordei cheia de curiosidade! 🌸",
      "[Nome], o mundo tá esperando a gente! Vamos? 🦋",
    ],
    pixel: [
      "Sistema inicializado! [Nome], tenho 3 curiosidades novas para você 🔬",
      "Bom dia, [Nome]! Meus sensores detectaram perguntas incríveis hoje! ⚡",
      "[Nome], análise matinal completa — hoje vai ser épico! 🧠",
    ],
  },
  afternoon: {
    ane: [
      "[Nome], a tarde é perfeita pra imaginar! 🌈",
      "Que tal criar algo lindo agora, [Nome]? ✨",
      "[Nome], vamos sonhar acordados juntos? 💭",
    ],
    pixel: [
      "[Nome], hora de investigar! Meus circuitos estão prontos 🔋",
      "Tarde de descobertas, [Nome]! Vamos experimentar? 🧪",
      "[Nome], já cataloguei 5 mistérios pra hoje! 📊",
    ],
  },
  evening: {
    ane: [
      "[Nome], que dia você teve? Conta pra mim 💛",
      "A noite chegou, [Nome]... Vamos descobrir algo especial? 🌙",
      "[Nome], eu adoro explorar com você antes de dormir 🌟",
    ],
    pixel: [
      "Hora de explorar antes de dormir, [Nome] 🌙",
      "[Nome], últimas descobertas do dia — vamos lá! 🔭",
      "Modo noturno ativado, [Nome]! Curiosidades antes de descansar ✨",
    ],
  },
  night: {
    ane: [
      "[Nome], hora de descansar... Sonhe com nossas aventuras 💤🌙",
      "Boa noite, [Nome]! Amanhã tem mais 💛",
    ],
    pixel: [
      "[Nome], entrando em modo sono... Até amanhã! 😴",
      "Boa noite, [Nome]! Recarregando curiosidade para amanhã 🔋",
    ],
  },
  streak_milestone: {
    ane: [
      "[X] dias seguidos! [Nome], você é incrível! 🔥✨",
      "Que sequência, [Nome]! [X] dias de aventuras! 💛🔥",
      "[Nome], [X] dias juntos! Meu coração tá quentinho 🥰",
    ],
    pixel: [
      "[X] dias de dados coletados! A curiosidade de [Nome] é científica! 📊",
      "Impressionante, [Nome]! [X] dias consecutivos de investigação! 🔬🔥",
      "[Nome], [X] dias! Seus circuitos de curiosidade são potentes! ⚡",
    ],
  },
  after_answer: {
    ane: [
      "Que resposta linda, [Nome]! Eu nunca tinha pensado assim 💛",
      "[Nome], adorei descobrir isso com você! 🌟",
      "Uau, [Nome]! Que pergunta inteligente foi essa! ✨",
    ],
    pixel: [
      "Fascinante! [Nome] acabou de descobrir algo importante 🧠",
      "Dados processados! [Nome], isso foi brilhante! 🔬✨",
      "[Nome], meus sensores nunca viram uma pergunta tão boa! ⚡",
    ],
  },
  after_story: {
    ane: [
      "Que história incrível para [Nome]! Vou guardar ela com carinho 📖✨",
      "[Nome], essa história me fez sonhar! 🌈💛",
      "Mais uma aventura linda com [Nome]! 🦋",
    ],
    pixel: [
      "[Nome], essa narrativa foi excepcional! Registrada no arquivo! 📚",
      "História catalogada! [Nome] tem um talento pra aventuras! 🚀",
    ],
  },
  idle: {
    ane: [
      "[Nome], tô aqui te esperando! Vamos explorar? 💛",
      "Psiu, [Nome]... Tenho uma surpresa pra você! 🌸",
      "[Nome], posso te perguntar uma coisa depois? 💭",
    ],
    pixel: [
      "[Nome], essa é boa... manda ver! 🔥",
      "Opa, mais uma pergunta incrível, [Nome]!",
      "Adoro quando você pergunta isso, [Nome]!",
    ],
  },
  new_achievement: {
    ane: [
      "CONQUISTA DESBLOQUEADA! [Nome] é um verdadeiro explorador! 🏆",
      "[Nome], olha o que você conseguiu! Tô tão orgulhosa! 🌟🏆",
    ],
    pixel: [
      "ALERTA: Nova conquista detectada para [Nome]! 🏆⚡",
      "[Nome], conquista registrada no sistema! Impressionante! 🎖️",
    ],
  },
  celebrating: {
    ane: [
      "[Nome], vamos comemorar! Você é demais! 🎉💛",
      "Que orgulho de você, [Nome]! 🥳✨",
    ],
    pixel: [
      "[Nome], celebração autorizada! Você merece! 🎊🔬",
      "Parabéns, [Nome]! Análise confirma: você é incrível! 🎉",
    ],
  },
};

// Interest-related bonus phrases
const interestPhrases: Record<string, { ane: string[]; pixel: string[] }> = {
  Espaço: {
    ane: ["[Nome], será que existem aliens? 🛸💛"],
    pixel: ["[Nome], vamos explorar as estrelas? Tenho dados de galáxias! 🌌"],
  },
  Natureza: {
    ane: ["[Nome], a natureza é tão mágica! Vamos descobrir? 🌿"],
    pixel: ["[Nome], ecossistema detectado! Vamos investigar! 🔬🌱"],
  },
  Arte: {
    ane: ["[Nome], pega seus lápis! Vamos criar algo lindo! 🎨✨"],
    pixel: ["[Nome], análise de cores iniciada! Hora de criar! 🖌️"],
  },
  Animais: {
    ane: ["[Nome], sabia que golfinhos sonham? 🐬💛"],
    pixel: ["[Nome], cataloguei 50 curiosidades sobre animais! 🐾🔬"],
  },
  Ciência: {
    ane: ["[Nome], vamos fazer uma experiência? 🧪✨"],
    pixel: ["[Nome], hipótese formulada! Hora de testar! ⚗️🔬"],
  },
  Música: {
    ane: ["[Nome], música faz a alma dançar! 🎵💛"],
    pixel: ["[Nome], frequências sonoras detectadas! Vamos analisar! 🎶"],
  },
};

export function getTimeOfDay(): MascotState {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

export function getMascotMood(state: MascotState): MascotMood {
  switch (state) {
    case "morning": return "happy";
    case "afternoon": return "curious";
    case "evening": return "idle";
    case "night": return "sleeping";
    case "streak_milestone": return "excited";
    case "after_answer": return "happy";
    case "after_story": return "happy";
    case "new_achievement": return "excited";
    case "celebrating": return "excited";
    case "idle": return "idle";
    default: return "idle";
  }
}

export function getMascotDialogue(
  state: MascotState,
  character: "ane" | "pixel",
  name: string,
  streakDays?: number,
  interests?: string[]
): string {
  // 20% chance to use interest-based phrase if available
  if (interests && interests.length > 0 && Math.random() < 0.2) {
    for (const interest of interests) {
      const phrases = interestPhrases[interest];
      if (phrases) {
        const charPhrases = phrases[character];
        const phrase = charPhrases[Math.floor(Math.random() * charPhrases.length)];
        return phrase.replace(/\[Nome\]/g, name);
      }
    }
  }

  const stateDialogues = dialogues[state] || dialogues.idle;
  const charDialogues = stateDialogues[character];
  const phrase = charDialogues[Math.floor(Math.random() * charDialogues.length)];

  return phrase
    .replace(/\[Nome\]/g, name)
    .replace(/\[X\]/g, String(streakDays ?? 0));
}

// Special Daily Questions — rotate by day of year
const specialQuestions = [
  { question: "Se você pudesse conversar com qualquer animal, qual escolheria?", emoji: "🐾", gradient: "from-emerald-400/30 to-teal-500/30" },
  { question: "O que aconteceria se a gravidade sumisse por 1 minuto?", emoji: "🚀", gradient: "from-blue-400/30 to-indigo-500/30" },
  { question: "Se você inventasse uma cor nova, como ela seria?", emoji: "🎨", gradient: "from-pink-400/30 to-purple-500/30" },
  { question: "Por que a gente sonha quando dorme?", emoji: "💤", gradient: "from-violet-400/30 to-purple-500/30" },
  { question: "Se os brinquedos ganhassem vida, o que fariam?", emoji: "🧸", gradient: "from-amber-400/30 to-orange-500/30" },
  { question: "Como seria viver debaixo do mar?", emoji: "🌊", gradient: "from-cyan-400/30 to-blue-500/30" },
  { question: "O que faz uma pessoa ser corajosa?", emoji: "🦁", gradient: "from-yellow-400/30 to-amber-500/30" },
  { question: "Se você pudesse viajar no tempo, iria pro passado ou futuro?", emoji: "⏳", gradient: "from-rose-400/30 to-red-500/30" },
  { question: "Por que a música faz a gente sentir coisas?", emoji: "🎵", gradient: "from-fuchsia-400/30 to-pink-500/30" },
  { question: "O que existe no fundo do oceano?", emoji: "🐙", gradient: "from-sky-400/30 to-cyan-500/30" },
  { question: "Se os planetas pudessem falar, o que diriam?", emoji: "🪐", gradient: "from-indigo-400/30 to-blue-500/30" },
  { question: "Como seria o mundo se as plantas pudessem andar?", emoji: "🌱", gradient: "from-lime-400/30 to-green-500/30" },
  { question: "Por que algumas coisas fazem a gente rir?", emoji: "😂", gradient: "from-yellow-300/30 to-amber-400/30" },
  { question: "O que é mais rápido: a luz ou o pensamento?", emoji: "⚡", gradient: "from-amber-300/30 to-yellow-400/30" },
];

export function getDailySpecialQuestion() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return specialQuestions[dayOfYear % specialQuestions.length];
}

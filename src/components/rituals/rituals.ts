// Rituais da Família — micro-cerimônias diárias (manhã/noite)
// Cada ritual é uma sequência cinematográfica curta, narrada por voz suave.

export type RitualId = "morning" | "lunch" | "evening" | "night";

export interface RitualStep {
  /** título mostrado em letras grandes */
  title: string;
  /** subtítulo poético */
  subtitle: string;
  /** frase narrada (ElevenLabs) */
  voice: string;
  /** duração mínima do passo em ms (auto-advance) */
  duration: number;
  /** ação opcional sugerida (mostrada como chip) */
  action?: string;
}

export interface RitualDef {
  id: RitualId;
  /** janela horária [startHour, endHour) em que aparece no Home */
  window: [number, number];
  label: string;
  eyebrow: string;
  /** emoji para o card */
  emoji: string;
  /** gradiente do hero */
  gradient: string;
  /** cor de glow */
  glow: string;
  /** duração total estimada (segundos) */
  totalSeconds: number;
  steps: RitualStep[];
  /** frase de encerramento */
  closing: { title: string; subtitle: string; voice: string };
}

export const RITUALS: Record<RitualId, RitualDef> = {
  morning: {
    id: "morning",
    window: [5, 11],
    label: "Ritual da manhã",
    eyebrow: "3 minutos para começar bem",
    emoji: "🌅",
    gradient: "linear-gradient(135deg, hsl(35 80% 88%) 0%, hsl(45 70% 92%) 50%, hsl(180 40% 90%) 100%)",
    glow: "hsl(35 90% 70%)",
    totalSeconds: 180,
    steps: [
      {
        title: "Boa manhã",
        subtitle: "Antes da correria começar",
        voice: "Bom dia. Antes que a correria do dia comece, vamos parar por um instante. Só você e seu filho. Respire fundo.",
        duration: 9000,
      },
      {
        title: "Um abraço",
        subtitle: "Sem pressa, sem palavras",
        voice: "Agora, abrace seu filho. Sem pressa. Sem dizer nada. Sinta o corpinho dele encostando no seu. Essa é a memória dele de você.",
        duration: 11000,
        action: "Abraçar 10 segundos",
      },
      {
        title: "Uma intenção",
        subtitle: "Como vocês querem que seja o dia",
        voice: "Diga uma palavra para hoje. Pode ser alegria. Calma. Coragem. Ou apenas: juntos. Essa palavra vai guiar vocês.",
        duration: 10000,
        action: "Escolher uma palavra",
      },
    ],
    closing: {
      title: "Vocês estão prontos.",
      subtitle: "O dia agora pode começar.",
      voice: "Vocês estão prontos. O dia agora pode começar — com mais leveza.",
    },
  },
  lunch: {
    id: "lunch",
    window: [11, 15],
    label: "Pausa do meio-dia",
    eyebrow: "Reconectar em 90 segundos",
    emoji: "☀️",
    gradient: "linear-gradient(135deg, hsl(50 80% 92%) 0%, hsl(30 60% 90%) 100%)",
    glow: "hsl(40 90% 70%)",
    totalSeconds: 90,
    steps: [
      {
        title: "Pausa",
        subtitle: "Mesmo no meio do caos",
        voice: "Pare um instante. Não importa o que está acontecendo. Esse minuto é seu.",
        duration: 8000,
      },
      {
        title: "Olhe nos olhos",
        subtitle: "Por 5 segundos inteiros",
        voice: "Olhe nos olhos do seu filho por cinco segundos. Sem dizer nada. Só olhe. Ele vai sentir.",
        duration: 9000,
        action: "Contato visual",
      },
    ],
    closing: {
      title: "Pequeno gesto. Grande memória.",
      subtitle: "Vocês reconectaram.",
      voice: "Pequeno gesto, grande memória. Vocês reconectaram.",
    },
  },
  evening: {
    id: "evening",
    window: [17, 20],
    label: "Hora do reencontro",
    eyebrow: "Transição suave para a noite",
    emoji: "🌆",
    gradient: "linear-gradient(135deg, hsl(20 70% 88%) 0%, hsl(280 40% 90%) 100%)",
    glow: "hsl(20 80% 70%)",
    totalSeconds: 150,
    steps: [
      {
        title: "O dia acabou",
        subtitle: "Solte o que ficou pra trás",
        voice: "O dia de trabalho acabou. Antes de entrar em casa, deixe os problemas do dia do lado de fora.",
        duration: 9000,
      },
      {
        title: "O melhor da manhã",
        subtitle: "Pergunte ao seu filho",
        voice: "Pergunte: qual foi a coisa mais legal que aconteceu hoje com você? Escute de verdade. Sem celular.",
        duration: 10000,
        action: "Perguntar e escutar",
      },
      {
        title: "Conte a sua",
        subtitle: "Ele quer saber também",
        voice: "Agora conte a sua. Pode ser pequena. Ele vai amar fazer parte do seu mundo.",
        duration: 9000,
      },
    ],
    closing: {
      title: "Estão em casa.",
      subtitle: "Juntos.",
      voice: "Vocês estão em casa. Juntos. Esse é o lugar certo.",
    },
  },
  night: {
    id: "night",
    window: [20, 24],
    label: "Ritual do sono",
    eyebrow: "Despedida do dia em 4 minutos",
    emoji: "🌙",
    gradient: "linear-gradient(135deg, hsl(240 40% 25%) 0%, hsl(270 35% 35%) 50%, hsl(220 40% 30%) 100%)",
    glow: "hsl(260 70% 70%)",
    totalSeconds: 240,
    steps: [
      {
        title: "Luz baixa",
        subtitle: "Os sons do mundo se acalmam",
        voice: "É hora de desacelerar. Abaixe a luz. Sinta o silêncio chegando. O dia foi grande.",
        duration: 10000,
        action: "Diminuir a luz",
      },
      {
        title: "Três gratidões",
        subtitle: "O que foi bom hoje",
        voice: "Digam, juntos, três coisas boas que aconteceram hoje. Pequenas coisas contam. Um sorriso. Um lanche. Um abraço.",
        duration: 12000,
        action: "Compartilhar 3 momentos",
      },
      {
        title: "Um beijo",
        subtitle: "Memória que fica",
        voice: "Dê um beijo de boa noite. Diga: eu te amo, não importa o que aconteça. Essa frase fica para sempre.",
        duration: 10000,
        action: "Boa noite com amor",
      },
      {
        title: "Sonhe bonito",
        subtitle: "Até amanhã",
        voice: "Agora feche os olhos. Amanhã vocês se encontram de novo. Sonhe bonito.",
        duration: 9000,
      },
    ],
    closing: {
      title: "Boa noite.",
      subtitle: "Vocês fizeram bonito hoje.",
      voice: "Boa noite. Vocês fizeram bonito hoje.",
    },
  },
};

export const getCurrentRitual = (): RitualDef => {
  const h = new Date().getHours();
  const found = (Object.values(RITUALS) as RitualDef[]).find(
    (r) => h >= r.window[0] && h < r.window[1]
  );
  return found || RITUALS.night;
};

/**
 * KALM v2 — catálogo único de dados (atividades, motores, jornadas, slots).
 * Todos os textos são EXATOS do brief.
 */

export type Motor =
  | "corpo"          // nervo vago, exalação, abraço, riso
  | "interocepcao"   // sentir coração/barriga
  | "grounding"      // 5-4-3-2-1, sentidos, glitter
  | "gratidao"
  | "bondade"
  | "saborear"
  | "visualizacao"
  | "toque"
  | "ocitocina"
  | "conexao"
  | "exalacao"
  | "nutricao"       // comer com atenção, cozinhar junto (SEM linguagem de dieta)
  | "hidratacao";    // beber água juntos

export type ActivityKind =
  | "breath"      // círculo expande/contrai
  | "hum"         // ondas (zumbido)
  | "glitter"     // frasco de glitter
  | "heart"       // batimento
  | "steps"       // passos simples com timer por passo
  | "scan";       // 5-4-3-2-1

export type Activity = {
  id: string;
  audience: "kid" | "parent";
  title: string;
  duration: string;
  durationSec: number;     // total estimado
  oneLine: string;         // descrição do card
  motor: Motor;
  kind: ActivityKind;
  steps: string[];         // textos guiados na ordem
  premium?: boolean;
  imgSlot: string;         // ex.: imgAtiv_pausa1min
};

// 15 crianças
const KIDS: Activity[] = [
  {
    id: "pausa-1min", audience: "kid",
    title: "Pausa de 1 minuto", duration: "1 min", durationSec: 60,
    oneLine: "Um abraço apertado em algo que te faz bem.",
    motor: "corpo", kind: "steps",
    steps: [
      "Pega uma almofada ou abraça alguém que você ama.",
      "Aperta bem forte, o abraço mais gostoso do mundo.",
      "Conta comigo devagar até 20.",
      "Solta devagar. Como você está agora?",
    ],
    imgSlot: "imgAtiv_pausa1min",
  },
  {
    id: "sentir-vento", audience: "kid",
    title: "Sentir o vento", duration: "2 min", durationSec: 120,
    oneLine: "Deixe o vento te levar e traga mais leveza para o seu dia.",
    motor: "grounding", kind: "steps",
    steps: [
      "Vai até uma janela ou um ventinho.",
      "Fecha os olhos e sente o ar no rosto.",
      "Imagina que o vento leva embora o que pesou hoje.",
      "Respira fundo três vezes.",
    ],
    imgSlot: "imgAtiv_sentirVento",
  },
  {
    id: "nuvem-macia", audience: "kid", premium: true,
    title: "Nuvem macia", duration: "3 min", durationSec: 180,
    oneLine: "Feche os olhos e se imagine deitado numa nuvem.",
    motor: "visualizacao", kind: "steps",
    steps: [
      "Deita confortável e fecha os olhos.",
      "Você está numa nuvem fofa e quentinha.",
      "Ela balança devagar, te embalando.",
      "O corpo fica pesado e relaxado.",
    ],
    imgSlot: "imgAtiv_nuvem",
  },
  {
    id: "soltar-balao", audience: "kid",
    title: "Soltar o balão", duration: "2 min", durationSec: 120,
    oneLine: "Coloque o que te incomoda no balão e deixe ir.",
    motor: "grounding", kind: "steps",
    steps: [
      "Pensa em algo que te deixou triste ou bravo.",
      "Coloca isso dentro de um balão.",
      "Solta e vê ele subir, sumir no céu.",
      "Respira: foi embora.",
    ],
    imgSlot: "imgAtiv_balao",
  },
  {
    id: "bolhas-magicas", audience: "kid",
    title: "Bolhas mágicas", duration: "2 min", durationSec: 120,
    oneLine: "Sopre devagar e imagine que cada bolha leva embora suas preocupações.",
    motor: "exalacao", kind: "breath",
    steps: [
      "Tem um potinho de bolhas na sua mão.",
      "Puxa o ar pelo nariz devagar.",
      "Sopra bem devagar, a maior bolha do mundo.",
      "Cada bolha leva uma preocupação. Faz mais cinco.",
    ],
    imgSlot: "imgAtiv_bolhas",
  },
  {
    id: "alongamento-urso", audience: "kid",
    title: "Alongamento do urso", duration: "3 min", durationSec: 180,
    oneLine: "Espreguiçar o corpo é acordar a calma que existe em você.",
    motor: "corpo", kind: "steps",
    steps: [
      "Braços bem alto, como um urso acordando.",
      "Espreguiça na ponta dos pés.",
      "Solta os braços e balança como gelatina.",
      "Repete devagar três vezes.",
    ],
    imgSlot: "imgAtiv_urso",
  },
  {
    id: "zumbido-camaleao", audience: "kid",
    title: "Zumbido do camaleão", duration: "1-2 min", durationSec: 90,
    oneLine: "Faça 'mmm' de boca fechada e sinta o cosquinho. Acalma por dentro.",
    motor: "corpo", kind: "hum",
    steps: [
      "Boca fechada, zumbido baixinho: mmmmm.",
      "Sente a vibração na boca e no rosto.",
      "Puxa o ar e faz de novo, bem longo.",
      "Cinco zumbidos, cada um mais longo.",
    ],
    imgSlot: "imgAtiv_zumbido",
  },
  {
    id: "escuta-coracao", audience: "kid",
    title: "Escuta o coração", duration: "1 min", durationSec: 60,
    oneLine: "Sente teu coração bater. Ele conta como você está.",
    motor: "interocepcao", kind: "heart",
    steps: [
      "Mão no peito, fica quietinho.",
      "Sente bater: tum-tum.",
      "Pula no lugar 15 vezes!",
      "Mão de novo: sentiu rápido? Respira até acalmar.",
    ],
    imgSlot: "imgAtiv_coracao",
  },
  {
    id: "aperta-limao", audience: "kid",
    title: "Aperta e solta o limão", duration: "1 min", durationSec: 60,
    oneLine: "Aperta os punhos como se espremesse limões. Depois solta.",
    motor: "corpo", kind: "steps",
    steps: [
      "Um limão em cada mão.",
      "Aperta forte pra tirar o suco! Segura.",
      "Solta tudo. Sente a mão molinha.",
      "De novo com ombros e rosto.",
    ],
    imgSlot: "imgAtiv_limao",
  },
  {
    id: "frasco-calma", audience: "kid",
    title: "Frasco da calma", duration: "3 min", durationSec: 180,
    oneLine: "Sacode o frasco de glitter e respira até tudo se acalmar.",
    motor: "grounding", kind: "glitter",
    steps: [
      "Pega (ou imagina) o frasco de glitter.",
      "Sacode! É assim que ficam as emoções bravas.",
      "Respira e observa o glitter descer.",
      "Quando assentar, sua mente acalmou.",
    ],
    imgSlot: "imgAtiv_frasco",
  },
  {
    id: "cinco-sentidos", audience: "kid",
    title: "Caça aos sentidos (5-4-3-2-1)", duration: "3 min", durationSec: 180,
    oneLine: "Uma caça ao tesouro com os cinco sentidos para voltar ao agora.",
    motor: "grounding", kind: "scan",
    steps: [
      "5 coisas que você VÊ.",
      "4 que você TOCA.",
      "3 sons.",
      "2 cheiros.",
      "1 gosto.",
    ],
    imgSlot: "imgAtiv_sentidos",
  },
  {
    id: "tres-boas", audience: "kid",
    title: "Três coisas boas", duration: "2 min", durationSec: 120,
    oneLine: "Antes de dormir, diga três coisas boas que aconteceram hoje.",
    motor: "gratidao", kind: "steps",
    steps: [
      "Pensa no dia inteiro.",
      "Fala a primeira coisa boa.",
      "A segunda.",
      "A terceira. Quer guardar no Jarro?",
    ],
    imgSlot: "imgAtiv_tresBoas",
  },
  {
    id: "missao-bondade", audience: "kid",
    title: "Missão bondade secreta", duration: "o dia", durationSec: 60,
    oneLine: "Sua missão: fazer uma gentileza escondida hoje, sem contar.",
    motor: "bondade", kind: "steps",
    steps: [
      "Missão secreta: algo bom pra alguém da casa.",
      "Arrumar, ajudar, um abraço surpresa.",
      "O segredo é não contar!",
      "Amanhã conta pro Kidzz.",
    ],
    imgSlot: "imgAtiv_bondade",
  },
  {
    id: "caca-beleza", audience: "kid",
    title: "Caça à beleza", duration: "5 min", durationSec: 300,
    oneLine: "Ache uma coisa bonita hoje e mostre para alguém que você ama.",
    motor: "saborear", kind: "steps",
    steps: [
      "Olha o mundo com olhos de explorador.",
      "Acha UMA coisa bonita.",
      "Observa de verdade.",
      "Mostra pra família. Beleza dividida é dobrada.",
    ],
    imgSlot: "imgAtiv_beleza",
  },
  {
    id: "festival-risada", audience: "kid",
    title: "Festival da risada", duration: "2 min", durationSec: 120,
    oneLine: "Rir de verdade, junto, acalma o corpo e aproxima a família.",
    motor: "corpo", kind: "steps",
    steps: [
      "Chama alguém da família.",
      "Caretas até alguém rir.",
      "História engraçada, cócegas leves, dança boba.",
      "Riam por 1 minuto!",
    ],
    imgSlot: "imgAtiv_risada",
  },
];

// 9 adultos
const PARENTS: Activity[] = [
  { id: "cafe-sem-culpa", audience: "parent",
    title: "Café sem culpa", duration: "5 min", durationSec: 300,
    oneLine: "Cinco minutos só seus para respirar e recarregar suas energias.",
    motor: "saborear", kind: "steps",
    steps: [
      "Tira o celular do bolso.",
      "Sente o calor da xícara nas mãos.",
      "Cada gole, respira fundo.",
      "Cinco minutos pra você, sem culpa.",
    ],
    imgSlot: "imgAtiv_cafe",
  },
  { id: "massagem-amor", audience: "parent",
    title: "Massagem do amor", duration: "5 min", durationSec: 300,
    oneLine: "Seu filho pode ser o seu lugar de paz.",
    motor: "toque", kind: "steps",
    steps: [
      "Sente-se com seu filho do seu lado.",
      "Massagem leve nas costas dele em círculos.",
      "Sinta a respiração de vocês desacelerar.",
      "Termine com um abraço silencioso.",
    ],
    imgSlot: "imgAtiv_massagem",
  },
  { id: "abraco-20s", audience: "parent",
    title: "Abraço de 20 segundos", duration: "3 min", durationSec: 180,
    oneLine: "Um abraço apertado de 20 segundos acalma o coração de vocês dois.",
    motor: "ocitocina", kind: "steps",
    steps: [
      "Abrace seu filho com vontade.",
      "Conte mentalmente até 20.",
      "Sinta o corpo dos dois desacelerar.",
      "Repita uma vez mais.",
    ],
    imgSlot: "imgAtiv_abraco",
  },
  { id: "maos-cuidam", audience: "parent",
    title: "Mãos que cuidam", duration: "4 min", durationSec: 240,
    oneLine: "Pequenos gestos de cuidado que nutrem e fortalecem.",
    motor: "toque", kind: "steps",
    steps: [
      "Pegue as mãos do seu filho nas suas.",
      "Olhe cada dedo, lembre quando eram menores.",
      "Faça uma massagem leve nas palmas.",
      "Diga: 'eu cuido de você'.",
    ],
    imgSlot: "imgAtiv_maos",
  },
  { id: "olhos-nos-olhos", audience: "parent",
    title: "Olhos nos olhos", duration: "5 min", durationSec: 300,
    oneLine: "Cinco minutos de atenção total que fortalecem o vínculo.",
    motor: "conexao", kind: "steps",
    steps: [
      "Sentem-se frente a frente.",
      "Cinco minutos olhando nos olhos, sem pressa.",
      "Sem corrigir, sem julgar.",
      "Termine com um sorriso.",
    ],
    imgSlot: "imgAtiv_olhos",
  },
  { id: "caminhada-maos", audience: "parent",
    title: "Caminhada de mãos dadas", duration: "5 min", durationSec: 300,
    oneLine: "Conectem-se com a natureza e um com o outro.",
    motor: "saborear", kind: "steps",
    steps: [
      "Saiam de casa, mesmo que pelo quintal.",
      "Andem de mãos dadas, devagar.",
      "Observem três coisas bonitas no caminho.",
      "Voltem agradecendo o momento.",
    ],
    imgSlot: "imgAtiv_caminhada",
  },
  { id: "tres-gratidoes", audience: "parent",
    title: "Três gratidões antes de dormir", duration: "3 min", durationSec: 180,
    oneLine: "Termine o dia nomeando três coisas boas.",
    motor: "gratidao", kind: "steps",
    steps: [
      "Antes de fechar os olhos, pense no dia.",
      "Nomeie a primeira coisa boa.",
      "A segunda.",
      "A terceira. Durma com isso no coração.",
    ],
    imgSlot: "imgAtiv_gratidoes",
  },
  { id: "elogio-especifico", audience: "parent",
    title: "Elogio específico", duration: "1 min", durationSec: 60,
    oneLine: "Diga ao seu filho algo específico que admirou nele hoje.",
    motor: "bondade", kind: "steps",
    steps: [
      "Pense em UM momento do dia dele.",
      "Olhe nos olhos.",
      "Diga: 'eu vi como você...' (algo específico).",
      "Espere ele responder. Não acrescente nada.",
    ],
    imgSlot: "imgAtiv_elogio",
  },
  { id: "diario-uma-linha", audience: "parent",
    title: "Diário de uma linha", duration: "2 min", durationSec: 120,
    oneLine: "Escreva só uma frase boa sobre o dia.",
    motor: "gratidao", kind: "steps",
    steps: [
      "Pegue papel ou bloco do celular.",
      "Escreva UMA frase boa do dia.",
      "Pode guardar no Jarro também.",
      "Amanhã, mais uma.",
    ],
    imgSlot: "imgAtiv_diario",
  },
];

export const ACTIVITIES: Activity[] = [...KIDS, ...PARENTS];
export const KID_ACTIVITIES = KIDS;
export const PARENT_ACTIVITIES = PARENTS;

export const findActivity = (id: string) => ACTIVITIES.find((a) => a.id === id);

// ── Cores por motor (tints) ─────────────────────────────────
export const MOTOR_TINT: Record<Motor, string> = {
  corpo:        "#7FB069",  // sálvia
  interocepcao: "#D98C7A",  // rosa
  grounding:    "#6C5CB8",  // lilás
  gratidao:     "#C9A227",  // dourado
  bondade:      "#E8821A",  // âmbar
  saborear:     "#46703A",  // verde escuro
  visualizacao: "#6C5CB8",
  toque:        "#D98C7A",
  ocitocina:    "#D98C7A",
  conexao:      "#46703A",
  exalacao:     "#7FB069",
  nutricao:     "#E8821A",  // âmbar/laranja quente (comida colorida)
  hidratacao:   "#4F8FC9",  // azul água
};

// ── Jornadas (multi-dias) ───────────────────────────────────
export type Journey = {
  id: string;
  title: string;
  desc: string;
  days: number;
  premium: boolean;
  emoji: string;
  imgSlot: string;
};

export const JOURNEYS: Journey[] = [
  { id: "j-7-calma", title: "7 dias de calma",
    desc: "Uma prática curta por dia, durante uma semana.",
    days: 7, premium: true, emoji: "🌿", imgSlot: "imgJorn_7calma" },
  { id: "j-coragem", title: "Coragem para pequenos medos",
    desc: "Cinco encontros para transformar medo em coragem.",
    days: 5, premium: true, emoji: "🦁", imgSlot: "imgJorn_coragem" },
  { id: "j-reconexao", title: "Reconexão familiar",
    desc: "Sete dias de gestos simples para fortalecer o vínculo.",
    days: 7, premium: false, emoji: "💚", imgSlot: "imgJorn_reconexao" },
];

// ── Pequenas vitórias ───────────────────────────────────────
export type Win = { id: string; emoji: string; label: string };
export const WINS: Win[] = [
  { id: "agradeci", emoji: "🙏", label: "Agradeci alguém" },
  { id: "agua", emoji: "💧", label: "Bebi mais água" },
  { id: "ajudei", emoji: "🤝", label: "Ajudei alguém" },
  { id: "corajoso", emoji: "🦁", label: "Fui corajoso" },
  { id: "tarefa", emoji: "✅", label: "Terminei uma tarefa" },
  { id: "dentes", emoji: "🦷", label: "Escovei os dentes" },
];

// ── Selos / Coleção de momentos ─────────────────────────────
export type Badge = {
  id: string;
  emoji: string;
  label: string;
  gradient: string;
  condition: "first-mood" | "5-jars" | "3-wins-day" | "first-activity" | "3-day-streak";
};

export const BADGES: Badge[] = [
  { id: "folha-calma",  emoji: "🍀", label: "Folha da Calma",
    gradient: "linear-gradient(135deg,#7FB069,#46703A)", condition: "first-activity" },
  { id: "estrela-gratidao", emoji: "⭐", label: "Estrela da Gratidão",
    gradient: "linear-gradient(135deg,#FFD86B,#C9A227)", condition: "5-jars" },
  { id: "coracao-coragem", emoji: "❤️", label: "Coração da Coragem",
    gradient: "linear-gradient(135deg,#FF8FA3,#D63F5C)", condition: "first-mood" },
  { id: "arco-iris", emoji: "🌈", label: "Arco-íris da Gentileza",
    gradient: "linear-gradient(135deg,#9BD0FF,#A78BFA)", condition: "3-wins-day" },
  { id: "borboleta", emoji: "🦋", label: "Borboleta da Alegria",
    gradient: "linear-gradient(135deg,#7CD3F2,#3FA89B)", condition: "3-day-streak" },
];

// ── Slots nomeados (vazios — usuário pluga depois) ──────────
export const SLOTS = {
  imgChamMeditando: "",
  fotoFamilia: "",
  somFloresta: "",
  meditacaoGuiada: "",
  sonsNatureza: "",
  narracaoNuvem: "",
  chuva: "", floresta: "", oceano: "", noite: "", rio: "",
};

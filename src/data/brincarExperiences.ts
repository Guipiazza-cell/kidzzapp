// Curadoria premium de experiências da aba BRINCAR
// Foco: criatividade, descoberta, conexão familiar — fora das telas

export type BrincarTipo = "offline" | "criatividade" | "familia" | "viagem";
export type BrincarEnergia = "baixa" | "media" | "alta";

export interface BrincarExperience {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  idadeMin: number;
  idadeMax: number;
  tempo: string;
  energia: BrincarEnergia;
  ambiente: string[];
  tipo: BrincarTipo;
  destaque: boolean;
  emoji: string;
  cor: string;
  gradient: string;
  premium: boolean;
}

const exp = (
  id: string,
  titulo: string,
  descricao: string,
  categoria: string,
  emoji: string,
  gradient: string,
  cor: string,
  tipo: BrincarTipo,
  tempo = "5–10 min",
  energia: BrincarEnergia = "media",
  ambiente: string[] = ["casa"],
  premium = false,
  idadeMin = 3,
  idadeMax = 10,
  destaque = false,
): BrincarExperience => ({
  id, titulo, descricao, categoria, idadeMin, idadeMax, tempo, energia,
  ambiente, tipo, destaque, emoji, cor, gradient, premium,
});

export const BRINCAR_EXPERIENCES: BrincarExperience[] = [
  // EXPLORAR
  exp("explorar-cores", "Caça às Cores", "Quem encontra primeiro algo amarelo?", "Explorar", "🌈",
    "linear-gradient(135deg,#fbbf24,#f97316)", "hsl(40 90% 55%)", "offline", "3–5 min", "baixa", ["casa","rua","carro"], false, 3, 10, true),
  exp("explorar-detetive", "Missão Detetive", "Descubra 3 objetos redondos ao seu redor.", "Explorar", "🔎",
    "linear-gradient(135deg,#60a5fa,#3b82f6)", "hsl(217 90% 60%)", "offline", "5 min", "baixa", ["casa","rua"]),
  exp("explorar-animal", "Animal Misterioso", "Imite um animal até alguém descobrir qual é.", "Explorar", "🦁",
    "linear-gradient(135deg,#f59e0b,#b45309)", "hsl(35 90% 50%)", "offline", "5 min", "alta"),
  exp("explorar-natureza", "Explorador da Natureza", "Encontre algo lá fora em que você nunca tinha reparado.", "Explorar", "🌳",
    "linear-gradient(135deg,#34d399,#059669)", "hsl(155 70% 45%)", "offline", "10 min", "media", ["rua","parque"]),
  exp("explorar-nuvens", "Histórias nas Nuvens", "Inventem formas olhando para o céu.", "Explorar", "☁️",
    "linear-gradient(135deg,#a5b4fc,#6366f1)", "hsl(230 80% 70%)", "offline", "5 min", "baixa", ["rua","parque"], true),

  // CRIATIVIDADE
  exp("criar-caixa", "Caixa Mágica", "Transforme uma caixa de papelão em qualquer coisa.", "Criatividade", "📦",
    "linear-gradient(135deg,#f472b6,#db2777)", "hsl(330 80% 60%)", "criatividade", "15 min", "media", ["casa"], false, 3, 10, true),
  exp("criar-personagem", "Personagem Inventado", "Crie um personagem engraçado e dê um nome.", "Criatividade", "🎭",
    "linear-gradient(135deg,#c084fc,#7c3aed)", "hsl(265 80% 65%)", "criatividade", "10 min", "media"),
  exp("criar-planeta", "Planeta Novo", "Inventem juntos um planeta — quem mora lá?", "Criatividade", "🚀",
    "linear-gradient(135deg,#818cf8,#4f46e5)", "hsl(240 70% 60%)", "criatividade", "10 min", "media", ["casa"], true),
  exp("criar-animal", "Animal Impossível", "Misture 3 animais diferentes e desenhe.", "Criatividade", "🦖",
    "linear-gradient(135deg,#10b981,#0d9488)", "hsl(170 70% 45%)", "criatividade", "15 min", "media", ["casa"], true),
  exp("criar-filme", "Mini Filme", "Inventem uma cena e atuem juntos.", "Criatividade", "🎬",
    "linear-gradient(135deg,#fb923c,#ea580c)", "hsl(20 90% 55%)", "criatividade", "15 min", "alta", ["casa"], true),

  // CONEXÃO FAMILIAR
  exp("familia-melhor", "Melhor Parte do Dia", "Cada um conta uma coisa boa que aconteceu hoje.", "Família", "💛",
    "linear-gradient(135deg,#fde68a,#f59e0b)", "hsl(45 95% 60%)", "familia", "5 min", "baixa", ["casa","mesa"], false, 3, 10, true),
  exp("familia-aprendi", "Algo que Aprendi", "Qual foi a sua descoberta de hoje?", "Família", "🌱",
    "linear-gradient(135deg,#86efac,#16a34a)", "hsl(140 70% 50%)", "familia", "5 min", "baixa", ["casa","mesa"]),
  exp("familia-superpoder", "Superpoder", "Qual superpoder você teria — e por quê?", "Família", "✨",
    "linear-gradient(135deg,#a78bfa,#6d28d9)", "hsl(260 80% 65%)", "familia", "5 min", "baixa", ["casa","carro"]),
  exp("familia-gentileza", "Gentileza", "Conte algo gentil que você viu ou fez.", "Família", "🤝",
    "linear-gradient(135deg,#f9a8d4,#db2777)", "hsl(330 75% 65%)", "familia", "5 min", "baixa", ["casa","mesa"], true),

  // VIAGEM — CARRO
  exp("carro-detetive", "Detetive da Estrada", "Quem encontra primeiro uma placa vermelha?", "Carro", "🚗",
    "linear-gradient(135deg,#ef4444,#b91c1c)", "hsl(0 80% 55%)", "viagem", "10 min", "baixa", ["carro"]),
  exp("carro-musica", "Continue a Música", "Cada pessoa canta uma palavra da música.", "Carro", "🎵",
    "linear-gradient(135deg,#fb7185,#e11d48)", "hsl(350 85% 60%)", "viagem", "10 min", "media", ["carro"]),
  exp("carro-proibida", "Palavra Proibida", "Escolham uma palavra proibida pela viagem.", "Carro", "🔤",
    "linear-gradient(135deg,#facc15,#ca8a04)", "hsl(50 95% 55%)", "viagem", "longa", "baixa", ["carro"], true),
  exp("carro-quemsoueu", "Quem Sou Eu?", "Descubra o personagem fazendo perguntas.", "Carro", "🌎",
    "linear-gradient(135deg,#22d3ee,#0e7490)", "hsl(190 80% 50%)", "viagem", "10 min", "baixa", ["carro"]),
  exp("carro-letras", "Caça às Letras", "Encontre as letras do seu nome em placas.", "Carro", "👀",
    "linear-gradient(135deg,#a3e635,#4d7c0f)", "hsl(80 70% 50%)", "viagem", "10 min", "baixa", ["carro"]),

  // VIAGEM — RESTAURANTE
  exp("rest-chef", "Chef Inventor", "Invente um prato com nome engraçado.", "Restaurante", "🍔",
    "linear-gradient(135deg,#fb923c,#c2410c)", "hsl(20 85% 55%)", "viagem", "5 min", "baixa", ["restaurante"]),
  exp("rest-voz", "Voz Misteriosa", "Peça algo usando uma voz divertida.", "Restaurante", "🎭",
    "linear-gradient(135deg,#e879f9,#a21caf)", "hsl(290 80% 60%)", "viagem", "5 min", "baixa", ["restaurante"], true),
  exp("rest-observador", "Observador", "Descubra algo engraçado ao redor.", "Restaurante", "👀",
    "linear-gradient(135deg,#60a5fa,#1d4ed8)", "hsl(220 85% 55%)", "viagem", "5 min", "baixa", ["restaurante"]),
  exp("rest-historia", "História da Mesa", "Inventem juntos uma história enquanto esperam.", "Restaurante", "📖",
    "linear-gradient(135deg,#fbbf24,#b45309)", "hsl(35 90% 55%)", "viagem", "10 min", "media", ["restaurante"]),

  // VIAGEM — AVIÃO
  exp("aviao-aeroporto", "Missão Aeroporto", "Quem acha primeiro algo azul?", "Avião", "✈️",
    "linear-gradient(135deg,#38bdf8,#0369a1)", "hsl(200 90% 55%)", "viagem", "10 min", "baixa", ["aeroporto","aviao"]),
  exp("aviao-nuvens", "Histórias nas Nuvens", "Inventem formas olhando pela janela.", "Avião", "☁️",
    "linear-gradient(135deg,#bae6fd,#0284c7)", "hsl(200 90% 75%)", "viagem", "10 min", "baixa", ["aviao"]),
  exp("aviao-som", "Som Misterioso", "Descubram sons ao redor — o que é cada um?", "Avião", "🎧",
    "linear-gradient(135deg,#c4b5fd,#6d28d9)", "hsl(260 70% 70%)", "viagem", "5 min", "baixa", ["aviao","aeroporto"], true),
  exp("aviao-historia", "História Infinita", "Cada pessoa continua a história em uma frase.", "Avião", "📖",
    "linear-gradient(135deg,#fcd34d,#b45309)", "hsl(40 90% 60%)", "viagem", "longa", "media", ["aviao","carro"]),
];

export const BRINCAR_HERO_ROTATION = [
  { id: "hero-missao", titulo: "Missão do Dia", subtitulo: "Uma descoberta para viver agora",
    emoji: "🌈", gradient: "linear-gradient(135deg,#fbbf24 0%,#fb923c 50%,#f43f5e 100%)" },
  { id: "hero-aventura", titulo: "Aventura da Viagem", subtitulo: "Diversão para qualquer trajeto",
    emoji: "🚗", gradient: "linear-gradient(135deg,#38bdf8 0%,#6366f1 50%,#8b5cf6 100%)" },
  { id: "hero-criar", titulo: "Desafio Criativo", subtitulo: "Inventem algo juntos hoje",
    emoji: "🧠", gradient: "linear-gradient(135deg,#c084fc 0%,#a855f7 50%,#7c3aed 100%)" },
  { id: "hero-explorar", titulo: "Explore Hoje", subtitulo: "Olhe o mundo com outros olhos",
    emoji: "🌳", gradient: "linear-gradient(135deg,#34d399 0%,#10b981 50%,#0d9488 100%)" },
  { id: "hero-familia", titulo: "Momento em Família", subtitulo: "Um instante para se conectar",
    emoji: "🎭", gradient: "linear-gradient(135deg,#f9a8d4 0%,#ec4899 50%,#db2777 100%)" },
];

// Curadoria diária determinística (sem aleatoriedade entre renders)
export function pickHeroOfDay() {
  const day = Math.floor(Date.now() / 86_400_000);
  const hero = BRINCAR_HERO_ROTATION[day % BRINCAR_HERO_ROTATION.length];
  const offlinePool = BRINCAR_EXPERIENCES.filter((e) => e.tipo !== "viagem");
  const experience = offlinePool[day % offlinePool.length];
  return { hero, experience };
}

export const BRINCAR_CATEGORIAS_OFFLINE = ["Explorar", "Criatividade", "Família"] as const;
export const BRINCAR_CATEGORIAS_VIAGEM = ["Carro", "Restaurante", "Avião"] as const;

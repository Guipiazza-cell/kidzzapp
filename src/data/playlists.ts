/**
 * KIDZZ — Playlists Momentos (catálogo completo)
 *
 * Cada playlist tem `spotifyId` vazio por padrão. Quando os IDs reais
 * forem definidos, basta preencher esse campo — o `embedUrl` e o
 * `spotifyUrl` são derivados automaticamente.
 */

export type PlaylistMood = "calma" | "energia" | "criatividade" | "vinculo" | "sono";
export type PlaylistCategoria = "familia" | "manha" | "tarde" | "noite" | "viagem";
export type PlaylistIdioma = "pt" | "en";

export type Playlist = {
  id: string;
  spotifyId: string;
  spotifyUrl: string;
  embedUrl: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  idadeMin: number;
  idadeMax: number;
  idioma: PlaylistIdioma;
  mood: PlaylistMood;
  categoria: PlaylistCategoria;
  totalMusicas: number;
  duracaoMin: number;
  destaque: boolean;
  novo: boolean;
  premium: boolean;
  gradient: string;
  emoji: string;
  cor: string;
};

const make = (
  id: string,
  spotifyId: string,
  data: Omit<Playlist, "id" | "spotifyId" | "spotifyUrl" | "embedUrl">,
): Playlist => ({
  id,
  spotifyId,
  spotifyUrl: spotifyId ? `https://open.spotify.com/playlist/${spotifyId}` : "",
  embedUrl: spotifyId
    ? `https://open.spotify.com/embed/playlist/${spotifyId}?utm_source=generator&theme=0`
    : "",
  ...data,
});

export const PLAYLISTS: Playlist[] = [
  // ───────── 2-4 anos ─────────
  make("acalanto-kidzz", "", {
    titulo: "Acalanto do Kidzz",
    subtitulo: "Sussurros para fechar o dia",
    descricao: "Canções de ninar para os primeiros sonhos.",
    idadeMin: 2, idadeMax: 4, idioma: "pt", mood: "sono", categoria: "noite",
    totalMusicas: 10, duracaoMin: 28, destaque: true, novo: false, premium: false,
    gradient: "linear-gradient(135deg, #1a0533, #3b0764, #581c87)",
    emoji: "🌙", cor: "#7C3AED",
  }),
  make("bom-dia-baby", "", {
    titulo: "Bom Dia Baby",
    subtitulo: "A luz acorda devagar",
    descricao: "Energia leve para o despertar dos pequenos.",
    idadeMin: 2, idadeMax: 4, idioma: "pt", mood: "energia", categoria: "manha",
    totalMusicas: 8, duracaoMin: 22, destaque: false, novo: true, premium: false,
    gradient: "linear-gradient(135deg, #451a03, #92400e, #d97706)",
    emoji: "☀️", cor: "#F59E0B",
  }),
  make("hora-soneca", "", {
    titulo: "Hora da Soneca",
    subtitulo: "Pausa do meio-dia",
    descricao: "Sons macios para a soneca da tarde.",
    idadeMin: 2, idadeMax: 4, idioma: "pt", mood: "calma", categoria: "tarde",
    totalMusicas: 12, duracaoMin: 35, destaque: false, novo: false, premium: false,
    gradient: "linear-gradient(135deg, #0c1445, #1e3a5f, #1e40af)",
    emoji: "💤", cor: "#3B82F6",
  }),
  make("dancando-kidzz", "", {
    titulo: "Dançando com o Kidzz",
    subtitulo: "Movimento e alegria",
    descricao: "Ritmos para soltar o corpo em casa.",
    idadeMin: 2, idadeMax: 4, idioma: "pt", mood: "energia", categoria: "tarde",
    totalMusicas: 9, duracaoMin: 25, destaque: false, novo: true, premium: false,
    gradient: "linear-gradient(135deg, #4a044e, #86198f, #c026d3)",
    emoji: "💃", cor: "#D946EF",
  }),
  make("good-morning-baby", "", {
    titulo: "Good Morning Baby",
    subtitulo: "Sunshine wake up",
    descricao: "Manhãs em inglês para começar o dia.",
    idadeMin: 2, idadeMax: 4, idioma: "en", mood: "energia", categoria: "manha",
    totalMusicas: 10, duracaoMin: 26, destaque: false, novo: false, premium: false,
    gradient: "linear-gradient(135deg, #431407, #9a3412, #ea580c)",
    emoji: "🌅", cor: "#F97316",
  }),

  // ───────── 5-7 anos ─────────
  make("super-manha-kidzz", "", {
    titulo: "Super Manhã KIDZZ",
    subtitulo: "Foguete pra começar o dia",
    descricao: "Energia inteligente para acordar ligado.",
    idadeMin: 5, idadeMax: 7, idioma: "pt", mood: "energia", categoria: "manha",
    totalMusicas: 11, duracaoMin: 30, destaque: true, novo: false, premium: false,
    gradient: "linear-gradient(135deg, #052e16, #14532d, #15803d)",
    emoji: "🚀", cor: "#22C55E",
  }),
  make("viagem-familia", "", {
    titulo: "Viagem em Família",
    subtitulo: "Estrada que vira memória",
    descricao: "Pra cantar junto no caminho.",
    idadeMin: 5, idadeMax: 7, idioma: "pt", mood: "vinculo", categoria: "viagem",
    totalMusicas: 15, duracaoMin: 45, destaque: false, novo: false, premium: false,
    gradient: "linear-gradient(135deg, #0c2a3e, #075985, #0284c7)",
    emoji: "✈️", cor: "#0EA5E9",
  }),
  make("pai-e-filho", "", {
    titulo: "Momento Pai e Filho",
    subtitulo: "Só vocês dois",
    descricao: "Trilha para conversas e abraços.",
    idadeMin: 5, idadeMax: 7, idioma: "pt", mood: "vinculo", categoria: "familia",
    totalMusicas: 12, duracaoMin: 36, destaque: false, novo: true, premium: false,
    gradient: "linear-gradient(135deg, #4c0519, #9f1239, #e11d48)",
    emoji: "❤️", cor: "#F43F5E",
  }),
  make("hora-aventura", "", {
    titulo: "Hora da Aventura",
    subtitulo: "Mapa do tesouro sonoro",
    descricao: "Imaginação aberta para brincar.",
    idadeMin: 5, idadeMax: 7, idioma: "pt", mood: "criatividade", categoria: "tarde",
    totalMusicas: 10, duracaoMin: 28, destaque: false, novo: false, premium: false,
    gradient: "linear-gradient(135deg, #1c1917, #44403c, #78716c)",
    emoji: "🗺️", cor: "#A8A29E",
  }),
  make("kidz-adventure-time", "", {
    titulo: "Kidz Adventure Time",
    subtitulo: "Adventure in english",
    descricao: "Aventuras musicais em inglês.",
    idadeMin: 5, idadeMax: 7, idioma: "en", mood: "energia", categoria: "tarde",
    totalMusicas: 13, duracaoMin: 38, destaque: false, novo: false, premium: true,
    gradient: "linear-gradient(135deg, #0f3460, #16213e, #1a1a2e)",
    emoji: "🌍", cor: "#6366F1",
  }),

  // ───────── 8-10 anos ─────────
  make("energia-criativa", "", {
    titulo: "Energia Criativa",
    subtitulo: "Ateliê em movimento",
    descricao: "Pra desenhar, escrever e criar.",
    idadeMin: 8, idadeMax: 10, idioma: "pt", mood: "criatividade", categoria: "tarde",
    totalMusicas: 14, duracaoMin: 42, destaque: true, novo: false, premium: false,
    gradient: "linear-gradient(135deg, #2d1b69, #5b21b6, #7c3aed)",
    emoji: "🎨", cor: "#8B5CF6",
  }),
  make("relaxar-respirar", "", {
    titulo: "Relaxar e Respirar",
    subtitulo: "Inspira… expira… recomeça",
    descricao: "Sons orgânicos para acalmar.",
    idadeMin: 8, idadeMax: 10, idioma: "pt", mood: "calma", categoria: "noite",
    totalMusicas: 10, duracaoMin: 30, destaque: false, novo: false, premium: false,
    gradient: "linear-gradient(135deg, #052e16, #065f46, #0d9488)",
    emoji: "🌿", cor: "#14B8A6",
  }),
  make("exploradores-kidzz", "", {
    titulo: "Exploradores KIDZZ",
    subtitulo: "Janela para o universo",
    descricao: "Curiosidade e descoberta.",
    idadeMin: 8, idadeMax: 10, idioma: "pt", mood: "criatividade", categoria: "viagem",
    totalMusicas: 12, duracaoMin: 35, destaque: false, novo: true, premium: false,
    gradient: "linear-gradient(135deg, #0d0b1a, #1e1b4b, #312e81)",
    emoji: "🔭", cor: "#4F46E5",
  }),
  make("creative-flow", "", {
    titulo: "Creative Flow",
    subtitulo: "Make it sound right",
    descricao: "Fluxo criativo em inglês.",
    idadeMin: 8, idadeMax: 10, idioma: "en", mood: "criatividade", categoria: "tarde",
    totalMusicas: 16, duracaoMin: 48, destaque: false, novo: false, premium: true,
    gradient: "linear-gradient(135deg, #1c0a2e, #3b0764, #6d28d9)",
    emoji: "🎸", cor: "#7C3AED",
  }),

  // ───────── Família ─────────
  make("cafe-familia", "", {
    titulo: "Café da Manhã em Família",
    subtitulo: "Mesa cheia, coração leve",
    descricao: "Trilha para a primeira refeição juntos.",
    idadeMin: 2, idadeMax: 10, idioma: "pt", mood: "energia", categoria: "manha",
    totalMusicas: 10, duracaoMin: 28, destaque: false, novo: false, premium: false,
    gradient: "linear-gradient(135deg, #431407, #7c2d12, #c2410c)",
    emoji: "☕", cor: "#EA580C",
  }),
  make("viagem-carro", "", {
    titulo: "Viagem de Carro",
    subtitulo: "Estrada com janela aberta",
    descricao: "Pra cantar até chegar.",
    idadeMin: 2, idadeMax: 10, idioma: "pt", mood: "energia", categoria: "viagem",
    totalMusicas: 18, duracaoMin: 55, destaque: true, novo: true, premium: false,
    gradient: "linear-gradient(135deg, #0c1445, #1d4ed8, #2563eb)",
    emoji: "🚗", cor: "#3B82F6",
  }),
  make("chuva-cobertor", "", {
    titulo: "Chuva e Cobertor",
    subtitulo: "Aconchego de tarde fria",
    descricao: "Quando chove, a casa abraça.",
    idadeMin: 2, idadeMax: 10, idioma: "pt", mood: "calma", categoria: "tarde",
    totalMusicas: 12, duracaoMin: 40, destaque: false, novo: false, premium: false,
    gradient: "linear-gradient(135deg, #1e1b4b, #3730a3, #4338ca)",
    emoji: "🌧️", cor: "#6366F1",
  }),
  make("domingo-leve", "", {
    titulo: "Domingo Leve",
    subtitulo: "Sem pressa, sem agenda",
    descricao: "Trilha para a manhã sem despertador.",
    idadeMin: 2, idadeMax: 10, idioma: "pt", mood: "vinculo", categoria: "familia",
    totalMusicas: 11, duracaoMin: 32, destaque: false, novo: false, premium: false,
    gradient: "linear-gradient(135deg, #365314, #4d7c0f, #65a30d)",
    emoji: "🌻", cor: "#84CC16",
  }),
  make("antes-de-dormir", "", {
    titulo: "Antes de Dormir",
    subtitulo: "Última história do dia",
    descricao: "Trilha para o ritual da noite.",
    idadeMin: 2, idadeMax: 10, idioma: "pt", mood: "sono", categoria: "noite",
    totalMusicas: 14, duracaoMin: 45, destaque: false, novo: false, premium: false,
    gradient: "linear-gradient(135deg, #0d0b1a, #1e0a3c, #2d1b69)",
    emoji: "🌌", cor: "#6D28D9",
  }),
  make("sunday-chill-family", "", {
    titulo: "Sunday Chill Family",
    subtitulo: "Slow Sunday vibes",
    descricao: "Domingo em inglês, no ritmo certo.",
    idadeMin: 2, idadeMax: 10, idioma: "en", mood: "calma", categoria: "familia",
    totalMusicas: 10, duracaoMin: 30, destaque: false, novo: false, premium: true,
    gradient: "linear-gradient(135deg, #292524, #57534e, #78716c)",
    emoji: "🍂", cor: "#D4A017",
  }),
];

export const getHeroPlaylist = (): Playlist => {
  const novoDestaque = PLAYLISTS.find((p) => p.destaque && p.novo);
  return novoDestaque ?? PLAYLISTS.find((p) => p.destaque) ?? PLAYLISTS[0];
};

export const MOOD_META: Record<PlaylistMood, { label: string; icon: string }> = {
  calma: { label: "Calma", icon: "😴" },
  energia: { label: "Energia", icon: "⚡" },
  criatividade: { label: "Criativo", icon: "🎨" },
  vinculo: { label: "Vínculo", icon: "🤗" },
  sono: { label: "Sono", icon: "🌙" },
};

export const CATEGORIA_META: Record<PlaylistCategoria, { label: string; icon: string }> = {
  manha: { label: "Manhã", icon: "🌅" },
  tarde: { label: "Tarde", icon: "☀️" },
  noite: { label: "Noite", icon: "🌙" },
  viagem: { label: "Viagem", icon: "✈️" },
  familia: { label: "Família", icon: "❤️" },
};

/**
 * KIDZZ — Playlists Momentos
 *
 * Edite aqui para trocar/adicionar playlists. Como usamos o Spotify Embed,
 * basta atualizar a playlist diretamente no Spotify — o app reflete na hora
 * sem precisar de deploy.
 *
 * Para pegar o ID: abra a playlist no Spotify → Compartilhar → Copiar link
 * Ex.: https://open.spotify.com/playlist/37i9dQZF1DWXRqgorJj26U
 *                                          ^^^^^^^^^^^^^^^^^^^^^^
 */

export type PlaylistMood =
  | "sleep"
  | "morning"
  | "travel"
  | "bonding"
  | "calm";

export interface KidzzPlaylist {
  id: string;
  title: string;
  emotionalLine: string;     // frase curta emocional
  description: string;       // subtítulo
  spotifyId: string;         // só o ID, montamos o embed
  mood: PlaylistMood;
  emoji: string;
  /** cor de glow em HSL ou HEX (sem hsl()) */
  glow: string;
  /** gradiente de fundo do card (Tailwind classes) */
  gradient: string;
  /** Marca como nova (mostra selo "NOVO") */
  isNew?: boolean;
  /** Indicação aproximada (atualizamos manualmente, mas o Spotify mostra real) */
  approxTracks?: number;
  approxMinutes?: number;
}

export const PLAYLISTS: KidzzPlaylist[] = [
  {
    id: "sleep",
    title: "Hora de Dormir",
    emoji: "🌙",
    emotionalLine: "O mundo desacelera aqui.",
    description: "Sussurros, ninar e respiração lenta para fechar o dia em paz.",
    spotifyId: "37i9dQZF1DWZd79rJ6a7lp",
    mood: "sleep",
    glow: "#6B8AFF",
    gradient: "from-[#0f1535] via-[#1e1f55] to-[#0d1b2a]",
    approxTracks: 12,
    approxMinutes: 38,
  },
  {
    id: "morning",
    title: "Bom Dia",
    emoji: "☀️",
    emotionalLine: "A luz acorda devagar.",
    description: "Energia leve para começar o dia juntos, sem pressa.",
    spotifyId: "37i9dQZF1DX0UrRvztWcAU",
    mood: "morning",
    glow: "#FFD66B",
    gradient: "from-[#FFE9A8] via-[#FFC97A] to-[#FF9F5A]",
    approxTracks: 14,
    approxMinutes: 42,
    isNew: true,
  },
  {
    id: "travel",
    title: "Viagem em Família",
    emoji: "🚗",
    emotionalLine: "Estrada, janela e memória.",
    description: "Pra cantar junto e transformar o caminho em lembrança.",
    spotifyId: "37i9dQZF1DX1H4LbvY4OJi",
    mood: "travel",
    glow: "#7ED4FF",
    gradient: "from-[#3a8dde] via-[#5ec1ff] to-[#a3e1ff]",
    approxTracks: 18,
    approxMinutes: 56,
  },
  {
    id: "bonding",
    title: "Momento Pai e Filho",
    emoji: "💜",
    emotionalLine: "Só vocês dois, no mesmo ritmo.",
    description: "Trilha emocional para conversas e abraços que ficam.",
    spotifyId: "37i9dQZF1DWVV27DiNWxkR",
    mood: "bonding",
    glow: "#C58AFF",
    gradient: "from-[#5b2a86] via-[#8b5cf6] to-[#c084fc]",
    approxTracks: 10,
    approxMinutes: 34,
  },
  {
    id: "calm",
    title: "Respira com o Camaleão",
    emoji: "🌿",
    emotionalLine: "Inspira… expira… recomeça.",
    description: "Sons orgânicos para acalmar emoções grandes em corpos pequenos.",
    spotifyId: "37i9dQZF1DWZqd5JICZI0u",
    mood: "calm",
    glow: "#9BE7B5",
    gradient: "from-[#1f4a3a] via-[#3f8b6c] to-[#9be7b5]",
    approxTracks: 11,
    approxMinutes: 36,
  },
];

/** Playlist da semana — troque o id quando quiser destacar outra */
export const WEEKLY_PLAYLIST_ID: string = "morning";

export const getWeeklyPlaylist = () =>
  PLAYLISTS.find((p) => p.id === WEEKLY_PLAYLIST_ID) ?? PLAYLISTS[0];

export const getSpotifyEmbedUrl = (spotifyId: string) =>
  `https://open.spotify.com/embed/playlist/${spotifyId}?utm_source=kidzz&theme=0`;

export const getSpotifyOpenUrl = (spotifyId: string) =>
  `https://open.spotify.com/playlist/${spotifyId}`;

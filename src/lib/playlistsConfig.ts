/**
 * KIDZZ — Playlists Momentos
 *
 * Curadoria editorial: 6 playlists familiares premium.
 * IDs do Spotify — basta atualizar a playlist no Spotify para refletir aqui.
 */

export type PlaylistMood =
  | "sleep"
  | "morning"
  | "travel"
  | "bonding"
  | "calm"
  | "sunday";

export interface KidzzPlaylist {
  id: string;
  title: string;
  emotionalLine: string;
  description: string;
  spotifyId: string;
  mood: PlaylistMood;
  emoji: string;
  glow: string;
  gradient: string;
  isNew?: boolean;
  approxTracks?: number;
  approxMinutes?: number;
}

export const PLAYLISTS: KidzzPlaylist[] = [
  {
    id: "sleep",
    title: "Hora de Dormir",
    emoji: "🌙",
    emotionalLine: "O mundo desacelera aqui.",
    description: "Piano, MPB suave e folk leve para fechar o dia em paz.",
    spotifyId: "37i9dQZF1DWZd79rJ6a7lp",
    mood: "sleep",
    glow: "#6B8AFF",
    gradient: "from-[#0f1535] via-[#1e1f55] to-[#0d1b2a]",
    approxTracks: 10,
    approxMinutes: 32,
  },
  {
    id: "morning",
    title: "Bom Dia em Família",
    emoji: "☀️",
    emotionalLine: "A luz acorda devagar.",
    description: "MPB leve, folk feliz e indie acústico para o café da manhã.",
    spotifyId: "37i9dQZF1DX0UrRvztWcAU",
    mood: "morning",
    glow: "#FFD66B",
    gradient: "from-[#3a2a1a] via-[#7a5a2a] to-[#c98a3a]",
    approxTracks: 10,
    approxMinutes: 34,
    isNew: true,
  },
  {
    id: "travel",
    title: "Viagem em Família",
    emoji: "🚗",
    emotionalLine: "Estrada, janela e memória.",
    description: "Folk, pop leve e clássicos pra cantar junto na estrada.",
    spotifyId: "37i9dQZF1DWWMOmoXKqHTD",
    mood: "travel",
    glow: "#7ED4FF",
    gradient: "from-[#0e2a44] via-[#1f4e7a] to-[#3a8dde]",
    approxTracks: 10,
    approxMinutes: 38,
  },
  {
    id: "bonding",
    title: "Pai e Filho",
    emoji: "💜",
    emotionalLine: "Só vocês dois, no mesmo ritmo.",
    description: "Acústicas emocionais para conversas e abraços que ficam.",
    spotifyId: "37i9dQZF1DWVV27DiNWxkR",
    mood: "bonding",
    glow: "#C58AFF",
    gradient: "from-[#2a1340] via-[#5b2a86] to-[#8b5cf6]",
    approxTracks: 10,
    approxMinutes: 36,
  },
  {
    id: "calm",
    title: "Respira com o Camaleão",
    emoji: "🌿",
    emotionalLine: "Inspira… expira… recomeça.",
    description: "Ambient, lo-fi suave e sons da natureza para desacelerar.",
    spotifyId: "37i9dQZF1DWZqd5JICZI0u",
    mood: "calm",
    glow: "#9BE7B5",
    gradient: "from-[#0e2a22] via-[#1f4a3a] to-[#3f8b6c]",
    approxTracks: 10,
    approxMinutes: 35,
  },
  {
    id: "sunday",
    title: "Domingo Leve",
    emoji: "🌧️",
    emotionalLine: "Chuva, cobertor e casa.",
    description: "MPB sofisticada, jazz leve e folk emocional pra ficar em família.",
    spotifyId: "37i9dQZF1DWTvNyxOwkztu",
    mood: "sunday",
    glow: "#E8B8FF",
    gradient: "from-[#1a1530] via-[#3a2a55] to-[#7a5a9a]",
    approxTracks: 10,
    approxMinutes: 37,
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

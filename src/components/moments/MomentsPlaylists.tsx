import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ExternalLink, Music2, Sparkles, Clock, ListMusic, X } from "lucide-react";
import {
  PLAYLISTS,
  AGE_PLAYLISTS,
  getWeeklyPlaylist,
  getSpotifyEmbedUrl,
  getSpotifyOpenUrl,
  type KidzzPlaylist,
  type AgePlaylist,
} from "@/lib/playlistsConfig";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";

interface Props {
  onBack: () => void;
}

/* ---------- Partículas decorativas leves (sem flicker exagerado) ---------- */
const FloatingParticles = ({ color }: { color: string }) => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {Array.from({ length: 6 }).map((_, i) => (
      <motion.span
        key={i}
        className="absolute rounded-full"
        style={{
          width: 4 + (i % 3) * 2,
          height: 4 + (i % 3) * 2,
          background: color,
          filter: "blur(1px)",
          opacity: 0.55,
          left: `${10 + i * 14}%`,
          top: `${20 + (i % 4) * 18}%`,
          boxShadow: `0 0 14px ${color}`,
        }}
        animate={{
          y: [0, -18, 0],
          opacity: [0.35, 0.7, 0.35],
        }}
        transition={{
          duration: 5 + (i % 3),
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.4,
        }}
      />
    ))}
  </div>
);

/* ---------- Modal Spotify Embed ---------- */
type Playable = {
  title: string;
  emoji: string;
  spotifyId: string;
  gradient: string;
  glow: string;
  subtitle?: string;
};

const PlayerSheet = ({
  playlist,
  onClose,
}: {
  playlist: Playable;
  onClose: () => void;
}) => (
  <motion.div
    className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    style={{ background: "rgba(8,10,24,0.55)", backdropFilter: "blur(8px)" }}
  >
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ y: 60, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 40, opacity: 0, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className={`relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden bg-gradient-to-br ${playlist.gradient} p-1 shadow-2xl`}
      style={{ boxShadow: `0 30px 80px -20px ${playlist.glow}80` }}
    >
      <div className="rounded-t-3xl sm:rounded-3xl bg-black/30 backdrop-blur-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-white">
            <span className="text-2xl">{playlist.emoji}</span>
            <div>
              <h3 className="font-black text-base leading-tight">{playlist.title}</h3>
              <p className="text-[11px] opacity-80 font-medium">{playlist.emotionalLine}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-full bg-white/15 text-white flex items-center justify-center active:scale-90 transition"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden bg-black/40">
          <iframe
            title={`Playlist ${playlist.title}`}
            src={getSpotifyEmbedUrl(playlist.spotifyId)}
            width="100%"
            height={380}
            frameBorder={0}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ border: 0, display: "block" }}
          />
        </div>

        <a
          href={getSpotifyOpenUrl(playlist.spotifyId)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-gray-900 font-extrabold text-sm active:scale-[0.98] transition"
        >
          <ExternalLink size={16} /> Abrir no Spotify
        </a>
      </div>
    </motion.div>
  </motion.div>
);

/* ---------- Card grande (hero/destaque) ---------- */
const FeaturedCard = ({
  playlist,
  onOpen,
}: {
  playlist: KidzzPlaylist;
  onOpen: () => void;
}) => (
  <motion.button
    onClick={onOpen}
    whileTap={{ scale: 0.985 }}
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={`relative w-full text-left rounded-3xl overflow-hidden bg-gradient-to-br ${playlist.gradient} p-5 min-h-[180px]`}
    style={{
      boxShadow: `0 20px 50px -18px ${playlist.glow}80, inset 0 1px 0 rgba(255,255,255,0.12)`,
    }}
  >
    <FloatingParticles color={playlist.glow} />
    {/* Glow pulse extremamente sutil */}
    <motion.span
      className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none"
      style={{ background: `radial-gradient(circle, ${playlist.glow}55, transparent 70%)` }}
      animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.85, 0.6] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />

    <div className="relative z-10 flex items-center gap-2 text-white/85 text-[11px] font-bold uppercase tracking-wider">
      <Sparkles size={12} /> Playlist da semana
    </div>
    <h2 className="relative z-10 mt-2 text-white text-2xl font-black leading-tight drop-shadow">
      {playlist.emoji} {playlist.title}
    </h2>
    <p className="relative z-10 mt-1 text-white/90 text-sm font-semibold italic">
      "{playlist.emotionalLine}"
    </p>
    <p className="relative z-10 mt-2 text-white/80 text-xs font-medium leading-snug">
      {playlist.description}
    </p>

    <div className="relative z-10 mt-4 flex items-center justify-between">
      <div className="flex items-center gap-3 text-white/85 text-[11px] font-bold">
        <span className="flex items-center gap-1"><ListMusic size={12} /> {playlist.approxTracks ?? "—"} músicas</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {playlist.approxMinutes ?? "—"} min</span>
      </div>
      <span className="px-3 py-1.5 rounded-full bg-white/95 text-gray-900 text-[11px] font-black flex items-center gap-1.5">
        <Music2 size={12} /> Ouvir
      </span>
    </div>
  </motion.button>
);

/* ---------- Card menor ---------- */
const PlaylistCard = ({
  playlist,
  onOpen,
  index,
}: {
  playlist: KidzzPlaylist;
  onOpen: () => void;
  index: number;
}) => (
  <motion.button
    onClick={onOpen}
    whileTap={{ scale: 0.97 }}
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay: 0.05 * index, ease: "easeOut" }}
    className={`relative w-full text-left rounded-2xl overflow-hidden bg-gradient-to-br ${playlist.gradient} p-4 min-h-[150px]`}
    style={{
      boxShadow: `0 14px 34px -16px ${playlist.glow}90, inset 0 1px 0 rgba(255,255,255,0.1)`,
    }}
  >
    <FloatingParticles color={playlist.glow} />
    {playlist.isNew && (
      <span className="absolute top-2 right-2 z-20 text-[9px] font-black bg-white text-gray-900 px-2 py-0.5 rounded-full shadow">
        NOVO
      </span>
    )}
    <div className="relative z-10 text-3xl drop-shadow-md">{playlist.emoji}</div>
    <h3 className="relative z-10 mt-2 text-white font-black text-base leading-tight">
      {playlist.title}
    </h3>
    <p className="relative z-10 text-white/85 text-[12px] font-medium italic mt-0.5 leading-snug line-clamp-2">
      "{playlist.emotionalLine}"
    </p>
    <div className="relative z-10 mt-2 flex items-center gap-2 text-white/80 text-[10px] font-bold">
      <span className="flex items-center gap-1"><ListMusic size={10} /> {playlist.approxTracks ?? "—"}</span>
      <span className="flex items-center gap-1"><Clock size={10} /> {playlist.approxMinutes ?? "—"} min</span>
    </div>
  </motion.button>
);

/* ============================================================ */
const MomentsPlaylists = ({ onBack }: Props) => {
  const [active, setActive] = useState<KidzzPlaylist | null>(null);
  const weekly = getWeeklyPlaylist();
  const others = PLAYLISTS.filter((p) => p.id !== weekly.id);

  const open = (p: KidzzPlaylist) => {
    haptic("light");
    sfx("click");
    setActive(p);
  };

  return (
    <motion.div
      className="flex-1 flex flex-col relative min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Fundo cinematográfico */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 60% at 50% 0%, rgba(255,214,107,0.18), transparent 60%), linear-gradient(180deg, #0e1226 0%, #14163a 50%, #0b0f24 100%)",
        }}
      />
      <FloatingParticles color="#FFD66B" />

      {/* Header */}
      <header
        className="relative z-10 flex items-center gap-3 px-4 pb-2"
        style={{ paddingTop: "calc(max(env(safe-area-inset-top, 12px), 16px) + 8px)" }}
      >
        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.9 }}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md border border-white/15"
          aria-label="Voltar"
        >
          <ArrowLeft size={22} />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-white text-lg font-black leading-tight">Momentos</h1>
          <p className="text-white/65 text-xs font-semibold">Trilha sonora para a família</p>
        </div>
      </header>

      {/* Scroll */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-32 pt-2 relative z-10"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Hero emocional */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-1 mb-5 text-center"
        >
          <motion.div
            className="inline-block text-5xl drop-shadow-[0_0_18px_rgba(255,214,107,0.55)]"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            🦎
          </motion.div>
          <h2 className="mt-2 text-white font-black text-2xl tracking-tight leading-tight">
            Momentos que ficam.
          </h2>
          <p className="mt-1 text-white/75 text-sm font-medium max-w-xs mx-auto">
            Transformando minutos em memórias através da música.
          </p>
        </motion.section>

        {/* Featured */}
        <FeaturedCard playlist={weekly} onOpen={() => open(weekly)} />

        {/* Lista */}
        <div className="mt-5 mb-2 flex items-center justify-between px-0.5">
          <h3 className="text-white font-black text-sm">Para cada momento</h3>
          <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">
            Atualiza sozinho
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {others.map((p, i) => (
            <PlaylistCard key={p.id} playlist={p} onOpen={() => open(p)} index={i} />
          ))}
        </div>

        <p className="mt-6 text-center text-white/45 text-[11px] font-medium px-6">
          As músicas são atualizadas direto pela curadoria KIDZZ no Spotify.
        </p>
      </div>

      <AnimatePresence>
        {active && <PlayerSheet playlist={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default MomentsPlaylists;

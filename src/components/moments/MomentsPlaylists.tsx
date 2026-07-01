import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ExternalLink, Clock, ListMusic, Play, X } from "lucide-react";
import {
  PLAYLISTS,
  getWeeklyPlaylist,
  getSpotifyEmbedUrl,
  getSpotifyOpenUrl,
  type KidzzPlaylist,
} from "@/lib/playlistsConfig";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";

interface Props {
  onBack: () => void;
}

/* ---------- Player Sheet ---------- */
const PlayerSheet = ({
  playlist,
  onClose,
}: {
  playlist: KidzzPlaylist;
  onClose: () => void;
}) => (
  <motion.div
    className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    style={{ background: "rgba(8,10,24,0.6)", backdropFilter: "blur(10px)" }}
  >
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden bg-[#0f1020]/95 border border-white/10 shadow-2xl"
      style={{ boxShadow: `0 30px 80px -20px ${playlist.glow}55` }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-white min-w-0">
            <span className="text-2xl">{playlist.emoji}</span>
            <div className="min-w-0">
              <h3 className="font-bold text-base leading-tight truncate">{playlist.title}</h3>
              <p className="text-[12px] text-white/85 italic truncate">"{playlist.emotionalLine}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-full bg-white/10 text-white flex items-center justify-center active:scale-90 transition"
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
            style={{ border: 0, display: "block", height: "clamp(232px, 52vh, 380px)" }}
          />
        </div>

        <a
          href={getSpotifyOpenUrl(playlist.spotifyId)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/95 text-gray-900 font-bold text-sm active:scale-[0.98] transition"
        >
          <ExternalLink size={15} /> Abrir no Spotify
        </a>
      </div>
    </motion.div>
  </motion.div>
);

/* ---------- Hero Card (destaque) ---------- */
const HeroCard = ({
  playlist,
  onOpen,
}: {
  playlist: KidzzPlaylist;
  onOpen: () => void;
}) => (
  <motion.button
    onClick={onOpen}
    whileTap={{ scale: 0.99 }}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={`relative w-full text-left rounded-3xl overflow-hidden bg-gradient-to-br ${playlist.gradient} min-h-[200px] border border-white/5`}
    style={{
      boxShadow: `0 24px 60px -24px ${playlist.glow}55`,
    }}
  >
    {/* Glow extremamente sutil */}
    <div
      className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none opacity-40"
      style={{ background: `radial-gradient(circle, ${playlist.glow}55, transparent 70%)` }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

    <div className="relative z-10 p-6 flex flex-col h-full min-h-[200px] justify-end">
      <span className="text-white/85 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
        Em destaque
      </span>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-white text-2xl font-bold leading-tight">
            {playlist.emoji} {playlist.title}
          </h2>
          <p className="mt-1.5 text-white/80 text-sm italic">
            "{playlist.emotionalLine}"
          </p>
          <div className="mt-3 flex items-center gap-3 text-white/70 text-[11px] font-semibold">
            <span className="flex items-center gap-1"><ListMusic size={11} /> {playlist.approxTracks} músicas</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {playlist.approxMinutes} min</span>
          </div>
        </div>
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg">
          <Play size={18} fill="currentColor" className="ml-0.5" />
        </div>
      </div>
    </div>
  </motion.button>
);

/* ---------- Card editorial (carrossel) ---------- */
const EditorialCard = ({
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
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.04 * index, ease: "easeOut" }}
    className={`snap-start flex-shrink-0 text-left rounded-3xl overflow-hidden bg-gradient-to-br ${playlist.gradient} relative border border-white/5`}
    style={{
      width: 200,
      boxShadow: `0 16px 40px -20px ${playlist.glow}66`,
    }}
  >
    <div
      className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none opacity-40"
      style={{ background: `radial-gradient(circle, ${playlist.glow}55, transparent 70%)` }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

    <div className="relative z-10 p-4 h-[220px] flex flex-col justify-between">
      <div className="text-3xl drop-shadow">{playlist.emoji}</div>
      <div>
        <h3 className="text-white text-base font-bold leading-tight">
          {playlist.title}
        </h3>
        <p className="mt-1 text-white/75 text-[12px] italic line-clamp-2 leading-snug">
          "{playlist.emotionalLine}"
        </p>
        <div className="mt-2 text-white/85 text-[10.5px] font-semibold">
          {playlist.approxTracks} músicas · {playlist.approxMinutes} min
        </div>
      </div>
    </div>
  </motion.button>
);

/* ---------- Linha lista (versão minimalista alternativa) ---------- */
const ListRow = ({
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
    whileTap={{ scale: 0.985 }}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: 0.04 * index }}
    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/80 border border-black/5 active:bg-white shadow-sm transition"
  >
    <div
      className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${playlist.gradient} flex-shrink-0`}
      style={{ boxShadow: `0 8px 20px -12px ${playlist.glow}80` }}
    >
      {playlist.emoji}
    </div>
    <div className="flex-1 min-w-0 text-left">
      <h4 className="text-gray-900 text-sm font-bold leading-tight truncate">{playlist.title}</h4>
      <p className="text-gray-700 text-[11.5px] italic truncate">"{playlist.emotionalLine}"</p>
      <p className="text-gray-600 text-[10.5px] font-semibold mt-0.5">
        {playlist.approxTracks} músicas · {playlist.approxMinutes} min
      </p>
    </div>
    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center">
      <Play size={14} fill="currentColor" className="ml-0.5" />
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
      {/* Fundo claro e suave — texto preto legível */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(255,214,107,0.18), transparent 60%), linear-gradient(180deg, #fff7e8 0%, #fdeed3 50%, #fce7c1 100%)",
        }}
      />

      {/* Header — dynamic island */}
      <header
        className="absolute top-0 left-0 right-0 z-30 flex items-center gap-2 px-3 pb-2"
        style={{ paddingTop: "calc(max(env(safe-area-inset-top, 12px), 16px) + 8px)" }}
      >
        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.9 }}
          className="glass-island min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="glass-island flex-1 min-w-0 px-3.5 py-1.5 rounded-2xl font-ui">
          <h1 className="font-display text-[18px] font-semibold leading-tight truncate">Momentos</h1>
          <p className="text-[10.5px] font-semibold leading-tight truncate opacity-80">Curadoria musical em família</p>
        </div>
      </header>

      {/* Scroll */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain relative z-10"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 80px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)",
        }}
      >
        {/* Hero editorial */}
        <section className="px-5 mt-3 mb-6 text-center">
          <div className="flex justify-center">
            <KidzzChameleon state="music" mood="happy" size="md" interactive={false} showParticles={false} />
          </div>
          <h2 className="mt-3 text-gray-900 font-bold text-[26px] tracking-tight leading-tight">
            Momentos que ficam.
          </h2>
          <p className="mt-1.5 text-gray-700 text-[13px] font-medium max-w-xs mx-auto leading-snug">
            Música para viver a infância com presença.
          </p>
        </section>

        {/* Destaque da semana */}
        <section className="px-5 mb-7">
          <HeroCard playlist={weekly} onOpen={() => open(weekly)} />
        </section>

        {/* Carrossel editorial */}
        <section className="mb-7">
          <div className="flex items-baseline justify-between px-5 mb-3">
            <h3 className="text-gray-900 font-bold text-[15px]">Para cada momento</h3>
            <span className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.18em]">
              Curadoria
            </span>
          </div>
          <div
            className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 px-5 snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
          >
            {others.map((p, i) => (
              <EditorialCard key={p.id} playlist={p} onOpen={() => open(p)} index={i} />
            ))}
          </div>
        </section>

        {/* Lista completa */}
        <section className="px-5">
          <h3 className="text-gray-900 font-bold text-[15px] mb-3">Todas as playlists</h3>
          <div className="space-y-2.5">
            {PLAYLISTS.map((p, i) => (
              <ListRow key={p.id} playlist={p} onOpen={() => open(p)} index={i} />
            ))}
          </div>
        </section>

        <p className="mt-8 text-center text-gray-600 text-[11px] font-medium px-6">
          Curadoria KIDZZ · Atualizada direto pelo Spotify
        </p>
      </div>

      <AnimatePresence>
        {active && <PlayerSheet playlist={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default MomentsPlaylists;

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ArrowLeft, X, Sparkles, Play, ExternalLink, Music2 } from "lucide-react";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import {
  PLAYLISTS,
  getHeroPlaylist,
  MOOD_META,
  CATEGORIA_META,
  type Playlist,
  type PlaylistMood,
  type PlaylistCategoria,
  type PlaylistIdioma,
} from "@/data/playlists";

interface Props {
  onBack: () => void;
}

type AgeKey = "all" | "2-4" | "5-7" | "8-10";
type LangKey = "all" | PlaylistIdioma;
type CatKey = "all" | PlaylistCategoria;
type MoodKey = "all" | PlaylistMood;

/* ───────────── Filtro chip ───────────── */
const Chip = ({
  active, onClick, children, color,
}: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string }) => (
  <button
    onClick={onClick}
    className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all whitespace-nowrap border"
    style={{
      background: active ? `${color ?? "#7C3AED"}E6` : "rgba(255,255,255,0.06)",
      borderColor: active ? `${color ?? "#7C3AED"}` : "rgba(255,255,255,0.10)",
      color: active ? "#fff" : "rgba(255,255,255,0.65)",
      backdropFilter: "blur(12px)",
      boxShadow: active ? `0 0 16px ${color ?? "#7C3AED"}59` : "none",
      transform: active ? "scale(1.05)" : "scale(1)",
      transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
    }}
  >
    {children}
  </button>
);

/* ───────────── Skeleton ───────────── */
const CardSkeleton = () => (
  <div className="rounded-[20px] overflow-hidden">
    <div
      className="h-[130px]"
      style={{
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 100%)",
        backgroundSize: "200% 100%",
        animation: "kidzz-skeleton 1.5s ease infinite",
      }}
    />
    <div className="p-3 space-y-2 bg-white/5">
      <div className="h-3 w-3/4 rounded bg-white/10" />
      <div className="h-2.5 w-1/2 rounded bg-white/10" />
    </div>
  </div>
);

/* ───────────── Hero ───────────── */
const HeroPlaylistCard = ({ playlist, onOpen }: { playlist: Playlist; onOpen: () => void }) => {
  const mood = MOOD_META[playlist.mood];
  return (
    <motion.button
      onClick={onOpen}
      whileTap={{ scale: 0.985 }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full text-left rounded-[24px] overflow-hidden h-[180px] mx-0"
      style={{
        background: playlist.gradient,
        backgroundSize: "200% 200%",
        animation: "kidzz-shimmer 8s ease infinite",
        boxShadow: `0 24px 50px -22px ${playlist.cor}80, inset 0 1px 0 rgba(255,255,255,0.12)`,
      }}
    >
      {/* Partículas CSS puras */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              left: `${(i * 11 + 7) % 95}%`,
              top: `${(i * 17 + 12) % 80}%`,
              opacity: 0.35 + ((i % 4) * 0.12),
              animation: `kidzz-float ${6 + (i % 5)}s ease-in-out ${i * 0.3}s infinite`,
              filter: "blur(0.5px)",
            }}
          />
        ))}
      </div>

      {/* Vinheta */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(120% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 100%)" }}
      />

      {/* Topo: badges */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
        <span className="px-2.5 py-1 rounded-full bg-amber-300/90 text-amber-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
          <Sparkles size={10} /> Playlist da Semana
        </span>
        {playlist.novo && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-400/95 text-emerald-950 text-[10px] font-black">
            NOVO
          </span>
        )}
      </div>

      {/* Centro */}
      <div className="relative z-10 h-full flex flex-col items-start justify-center px-5">
        <div className="text-[44px] leading-none drop-shadow-md">{playlist.emoji}</div>
        <h2 className="mt-1 text-white text-[22px] font-black leading-tight drop-shadow">
          {playlist.titulo}
        </h2>
        <p className="text-white/80 text-[12px] font-semibold mt-0.5">
          {playlist.idadeMin}-{playlist.idadeMax} anos · {playlist.idioma === "pt" ? "PT" : "EN"} · {playlist.totalMusicas} músicas · {playlist.duracaoMin}min
        </p>
      </div>

      {/* Rodapé */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
        <span className="px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-white text-[11px] font-bold flex items-center gap-1">
          <span>{mood.icon}</span> {mood.label}
        </span>
        <span className="px-3.5 py-1.5 rounded-full bg-white/20 border border-white/25 text-white text-[12px] font-black flex items-center gap-1.5 backdrop-blur-md">
          <Play size={12} fill="currentColor" /> Ouvir agora
        </span>
      </div>
    </motion.button>
  );
};

/* ───────────── Card ───────────── */
const PlaylistCard = ({ playlist, onOpen }: { playlist: Playlist; onOpen: () => void }) => {
  const mood = MOOD_META[playlist.mood];
  return (
    <motion.button
      layout
      onClick={onOpen}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="text-left rounded-[20px] overflow-hidden bg-white/[0.04] backdrop-blur-md border border-white/5"
    >
      {/* Capa */}
      <div className="relative h-[130px]" style={{ background: playlist.gradient }}>
        {/* Badge idade */}
        <span
          className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold text-white"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
        >
          {playlist.idadeMin}-{playlist.idadeMax}
        </span>

        {/* Premium / Novo */}
        {playlist.premium ? (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-lg text-[10px] font-black"
            style={{ background: "rgba(245,200,66,0.9)", color: "#1a0a2e" }}>
            PREMIUM
          </span>
        ) : playlist.novo ? (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-lg text-[10px] font-black text-white"
            style={{ background: "rgba(34,197,94,0.85)" }}>
            NOVO
          </span>
        ) : null}

        {/* Emoji centro */}
        <div className="absolute inset-0 flex items-center justify-center text-[44px] drop-shadow">
          {playlist.emoji}
        </div>

        {/* Idioma */}
        <span className="absolute bottom-2 left-2 text-[16px]">
          {playlist.idioma === "pt" ? "🇧🇷" : "🇺🇸"}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-white text-[13px] font-bold truncate">{playlist.titulo}</h3>
        <p className="text-white/50 text-[11px] mt-0.5">
          {playlist.totalMusicas} músicas · {playlist.duracaoMin}min
        </p>
        <span
          className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{
            background: `${playlist.cor}26`,
            border: `1px solid ${playlist.cor}40`,
            color: playlist.cor,
          }}
        >
          {mood.icon} {mood.label}
        </span>
      </div>
    </motion.button>
  );
};

/* ───────────── Bottom Sheet Player ───────────── */
const PlayerSheet = ({ playlist, onClose }: { playlist: Playlist; onClose: () => void }) => {
  const mood = MOOD_META[playlist.mood];
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ background: "rgba(8,10,24,0.6)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="relative w-full max-w-md rounded-t-[24px] overflow-hidden"
        style={{
          height: "75vh",
          background: "rgba(13,11,26,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Drag handle */}
        <div className="pt-2 pb-1 flex justify-center">
          <span className="block w-10 h-1 rounded-full bg-white/25" />
        </div>

        <div className="px-5 pb-5 h-full flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-[40px]"
              style={{ background: playlist.gradient }}
            >
              {playlist.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white text-[20px] font-black leading-tight">{playlist.titulo}</h3>
              <p className="text-white/55 text-[13px] mt-0.5">
                {playlist.idadeMin}-{playlist.idadeMax} anos · {playlist.idioma === "pt" ? "🇧🇷" : "🇺🇸"} · {playlist.totalMusicas} músicas · {playlist.duracaoMin}min
              </p>
              <span
                className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
                style={{ background: `${playlist.cor}26`, border: `1px solid ${playlist.cor}40`, color: playlist.cor }}
              >
                {mood.icon} {mood.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] rounded-full bg-white/10 text-white flex items-center justify-center"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Embed ou placeholder */}
          <div className="mt-5 flex-1 min-h-0">
            {playlist.spotifyId ? (
              <iframe
                title={`Playlist ${playlist.titulo}`}
                src={playlist.embedUrl}
                width="100%"
                height={352}
                frameBorder={0}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ borderRadius: 12, border: 0 }}
              />
            ) : (
              <div
                className="rounded-2xl p-6 text-center flex flex-col items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${playlist.cor}1A, rgba(255,255,255,0.03))`,
                  border: `1px solid ${playlist.cor}33`,
                  minHeight: 280,
                }}
              >
                <div className="text-[56px] mb-3">🎵</div>
                <h4 className="text-white text-[17px] font-black">Em breve nesta playlist</h4>
                <p className="text-white/60 text-[13px] mt-1.5 max-w-[260px]">
                  Conteúdo sendo preparado com carinho pela curadoria KIDZZ.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 rounded-full bg-white text-gray-900 text-[13px] font-black flex items-center gap-2"
                >
                  <Music2 size={14} /> Explorar outras playlists
                </button>
              </div>
            )}
          </div>

          {/* Rodapé */}
          {playlist.spotifyUrl && (
            <a
              href={playlist.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-gray-900 font-extrabold text-sm"
            >
              <ExternalLink size={16} /> Abrir no Spotify
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ───────────── Section header ───────────── */
const SectionHeader = ({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) => (
  <div className="px-4 pt-5 pb-2.5">
    <h3 className="text-white text-[16px] font-black flex items-center gap-2">
      <span>{emoji}</span>{title}
    </h3>
    {subtitle && <p className="text-white/55 text-[12px] mt-0.5">{subtitle}</p>}
  </div>
);

/* ============================================================ */
const MomentsPlaylists = ({ onBack }: Props) => {
  const [active, setActive] = useState<Playlist | null>(null);
  const [age, setAge] = useState<AgeKey>("all");
  const [lang, setLang] = useState<LangKey>("all");
  const [cat, setCat] = useState<CatKey>("all");
  const [mood, setMood] = useState<MoodKey>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const hero = useMemo(() => getHeroPlaylist(), []);

  const hasFilter = age !== "all" || lang !== "all" || cat !== "all" || mood !== "all";

  const filtered = useMemo(() => {
    return PLAYLISTS.filter((p) => {
      if (age === "2-4" && !(p.idadeMin <= 4 && p.idadeMax >= 2)) return false;
      if (age === "5-7" && !(p.idadeMin <= 7 && p.idadeMax >= 5)) return false;
      if (age === "8-10" && !(p.idadeMin <= 10 && p.idadeMax >= 8)) return false;
      if (lang !== "all" && p.idioma !== lang) return false;
      if (cat !== "all" && p.categoria !== cat) return false;
      if (mood !== "all" && p.mood !== mood) return false;
      return true;
    });
  }, [age, lang, cat, mood]);

  const inAge = (min: number, max: number) =>
    PLAYLISTS.filter((p) => p.idadeMin >= min && p.idadeMax <= max);
  const familia = PLAYLISTS.filter((p) => p.categoria === "familia");

  const open = (p: Playlist) => {
    haptic("light");
    sfx("click");
    setActive(p);
  };

  const clearFilters = () => {
    setAge("all"); setLang("all"); setCat("all"); setMood("all");
  };

  return (
    <motion.div
      className="flex-1 flex flex-col relative min-h-0 overflow-hidden"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* CSS keyframes */}
      <style>{`
        @keyframes kidzz-shimmer {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        @keyframes kidzz-float {
          0%,100% { transform: translateY(0px); opacity: 0.45 }
          50% { transform: translateY(-12px); opacity: 0.85 }
        }
        @keyframes kidzz-skeleton {
          0% { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
        .kidzz-noscroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Fundo cinematográfico */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 60% at 50% 0%, rgba(255,214,107,0.18), transparent 60%), linear-gradient(180deg, #0e1226 0%, #14163a 50%, #0b0f24 100%)",
        }}
      />

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
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain pt-2 relative z-10"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingBottom: "calc(110px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Hero camaleão */}
        <section className="px-4 flex flex-col items-center text-center mb-3">
          <KidzzChameleon state="music" mood="happy" size="lg" interactive showParticles />
          <h2 className="mt-2 text-white font-black text-2xl tracking-tight leading-tight drop-shadow">
            Momentos que ficam.
          </h2>
          <p className="mt-1 text-white/75 text-sm font-medium max-w-xs">
            Transformando minutos em memórias através da música.
          </p>
        </section>

        {/* Hero playlist */}
        <div className="px-4">
          <HeroPlaylistCard playlist={hero} onOpen={() => open(hero)} />
        </div>

        {/* Filtros */}
        <div className="mt-5 space-y-2">
          <div className="flex gap-2 overflow-x-auto px-4 kidzz-noscroll" style={{ scrollbarWidth: "none" }}>
            <Chip active={age === "all"} onClick={() => setAge("all")}>Todos</Chip>
            <Chip active={age === "2-4"} onClick={() => setAge("2-4")} color="#F59E0B">2-4 anos 🍼</Chip>
            <Chip active={age === "5-7"} onClick={() => setAge("5-7")} color="#22C55E">5-7 anos 🌈</Chip>
            <Chip active={age === "8-10"} onClick={() => setAge("8-10")} color="#8B5CF6">8-10 anos 🚀</Chip>
            <span className="w-px self-stretch bg-white/10 mx-1" />
            <Chip active={lang === "pt"} onClick={() => setLang(lang === "pt" ? "all" : "pt")} color="#22C55E">🇧🇷 Português</Chip>
            <Chip active={lang === "en"} onClick={() => setLang(lang === "en" ? "all" : "en")} color="#3B82F6">🇺🇸 English</Chip>
          </div>
          <div className="flex gap-2 overflow-x-auto px-4 kidzz-noscroll" style={{ scrollbarWidth: "none" }}>
            {(Object.keys(CATEGORIA_META) as PlaylistCategoria[]).map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? "all" : c)} color="#7C3AED">
                {CATEGORIA_META[c].icon} {CATEGORIA_META[c].label}
              </Chip>
            ))}
            <span className="w-px self-stretch bg-white/10 mx-1" />
            {(Object.keys(MOOD_META) as PlaylistMood[]).map((m) => (
              <Chip key={m} active={mood === m} onClick={() => setMood(mood === m ? "all" : m)} color="#F43F5E">
                {MOOD_META[m].icon} {MOOD_META[m].label}
              </Chip>
            ))}
          </div>

          {/* Contador / limpar */}
          <div className="flex items-center justify-between px-4 pt-1">
            <span className="text-white/50 text-[11px] font-bold">{filtered.length} playlists</span>
            {hasFilter && (
              <button
                onClick={clearFilters}
                className="text-white/70 text-[11px] font-bold flex items-center gap-1 px-2 py-1 rounded-full bg-white/10"
              >
                <X size={12} /> Limpar
              </button>
            )}
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 px-4 mt-4">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : hasFilter ? (
          <LayoutGroup>
            <div className="grid grid-cols-2 gap-3 px-4 mt-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((p) => (
                  <PlaylistCard key={p.id} playlist={p} onOpen={() => open(p)} />
                ))}
              </AnimatePresence>
            </div>
            {filtered.length === 0 && (
              <div className="text-center text-white/55 text-sm font-medium px-6 py-12">
                Nenhuma playlist com esses filtros. <br />
                <button onClick={clearFilters} className="mt-2 underline text-white/80">Limpar filtros</button>
              </div>
            )}
          </LayoutGroup>
        ) : (
          <>
            <SectionHeader emoji="🍼" title="Para os Pequeninos" subtitle="2 a 4 anos" />
            <div className="grid grid-cols-2 gap-3 px-4">
              {inAge(2, 4).map((p) => <PlaylistCard key={p.id} playlist={p} onOpen={() => open(p)} />)}
            </div>

            <SectionHeader emoji="🌈" title="Descobrindo o Mundo" subtitle="5 a 7 anos" />
            <div className="grid grid-cols-2 gap-3 px-4">
              {inAge(5, 7).map((p) => <PlaylistCard key={p.id} playlist={p} onOpen={() => open(p)} />)}
            </div>

            <SectionHeader emoji="🚀" title="Quase Crescidos" subtitle="8 a 10 anos" />
            <div className="grid grid-cols-2 gap-3 px-4">
              {inAge(8, 10).map((p) => <PlaylistCard key={p.id} playlist={p} onOpen={() => open(p)} />)}
            </div>

            <SectionHeader emoji="❤️" title="Momentos em Família" subtitle="Para todos juntos" />
            <div className="grid grid-cols-2 gap-3 px-4">
              {familia.map((p) => <PlaylistCard key={p.id} playlist={p} onOpen={() => open(p)} />)}
            </div>
          </>
        )}

        <p className="mt-8 text-center text-white/45 text-[11px] font-medium px-6">
          Curadoria KIDZZ • atualizada direto pelo Spotify.
        </p>
      </div>

      <AnimatePresence>
        {active && <PlayerSheet playlist={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default MomentsPlaylists;

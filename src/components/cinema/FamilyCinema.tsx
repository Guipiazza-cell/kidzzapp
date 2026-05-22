import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Film, Star, Sparkles, X, Play } from "lucide-react";
import {
  EDITORIAL_SECTIONS,
  getMoviesBySection,
  type Movie,
} from "@/data/movies";
import {
  getWeeklyMovie,
  getDailyHighlights,
} from "@/lib/featuredRotation";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";

interface Props {
  onBack: () => void;
}

/* ============================================================ */
/*  Poster — gradient + emoji + título tipográfico              */
/*  (Apple TV editorial style, sem assets externos)             */
/* ============================================================ */
const Poster = ({
  movie,
  size = "md",
}: {
  movie: Movie;
  size?: "sm" | "md" | "lg" | "hero";
}) => {
  const dim =
    size === "hero"
      ? { w: "100%", h: 280, emoji: "text-7xl", title: "text-2xl" }
      : size === "lg"
      ? { w: 180, h: 240, emoji: "text-5xl", title: "text-base" }
      : size === "md"
      ? { w: 152, h: 210, emoji: "text-5xl", title: "text-sm" }
      : { w: 110, h: 150, emoji: "text-3xl", title: "text-[12px]" };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${movie.gradient}`}
      style={{
        width: dim.w,
        height: dim.h,
        boxShadow: `0 18px 40px -22px ${movie.glowColor}aa`,
      }}
    >
      {/* Glow cinematográfico suave */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none opacity-50"
        style={{ background: `radial-gradient(circle, ${movie.glowColor}66, transparent 70%)` }}
      />
      {/* Vinheta inferior */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-between p-3">
        <div className="flex items-start justify-between">
          <span className={`drop-shadow-lg ${dim.emoji}`}>{movie.emoji}</span>
          {movie.novo && (
            <span className="text-[9px] font-black uppercase tracking-wider bg-white/15 backdrop-blur-md text-white px-2 py-0.5 rounded-full border border-white/20">
              Novo
            </span>
          )}
        </div>
        <div>
          <h4 className={`text-white font-bold leading-tight drop-shadow ${dim.title}`}>
            {movie.titulo}
          </h4>
          <p className="text-white/85 text-[10px] font-semibold mt-1 uppercase tracking-wide">
            {movie.faixaEtaria === "familia" ? "Família" : `${movie.faixaEtaria} anos`}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ============================================================ */
/*  Hero — Filme da Semana                                      */
/* ============================================================ */
const HeroFilm = ({ movie, onOpen }: { movie: Movie; onOpen: () => void }) => (
  <motion.button
    onClick={onOpen}
    whileTap={{ scale: 0.99 }}
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55, ease: "easeOut" }}
    className={`relative w-full text-left rounded-3xl overflow-hidden bg-gradient-to-br ${movie.gradient} border border-white/5`}
    style={{
      minHeight: 320,
      boxShadow: `0 30px 70px -28px ${movie.glowColor}aa`,
    }}
  >
    {/* Backdrop glow */}
    <div
      className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none opacity-50"
      style={{ background: `radial-gradient(circle, ${movie.glowColor}77, transparent 70%)` }}
    />
    <div
      className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full pointer-events-none opacity-30"
      style={{ background: `radial-gradient(circle, ${movie.glowColor}55, transparent 70%)` }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

    <div className="relative z-10 p-6 flex flex-col h-full justify-end" style={{ minHeight: 320 }}>
      <span className="text-white/80 text-[10px] font-black uppercase tracking-[0.24em] mb-2 flex items-center gap-1.5">
        <Sparkles size={11} /> Filme da semana
      </span>

      <div className="flex items-end gap-4">
        <span className="text-7xl drop-shadow-2xl leading-none">{movie.emoji}</span>
        <div className="flex-1 min-w-0">
          <h2 className="text-white text-[26px] font-bold leading-tight">{movie.titulo}</h2>
          <p className="mt-2 text-white/85 text-[13.5px] leading-snug italic">
            "{movie.descricao}"
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <Pill icon={<Clock size={11} />} label={movie.duracao} />
        <Pill label={movie.faixaEtaria === "familia" ? "Família" : `${movie.faixaEtaria} anos`} />
        {movie.estudio && <Pill label={movie.estudio} />}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/95 text-gray-900 font-bold text-sm">
          <Film size={15} /> Ver detalhes
        </div>
      </div>
    </div>
  </motion.button>
);

const Pill = ({ icon, label }: { icon?: React.ReactNode; label: string }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/12 backdrop-blur text-white text-[11px] font-semibold border border-white/15">
    {icon}
    {label}
  </span>
);

/* ============================================================ */
/*  Bottom Sheet — detalhe editorial                             */
/* ============================================================ */
const MovieSheet = ({ movie, onClose }: { movie: Movie; onClose: () => void }) => (
  <motion.div
    className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    style={{ background: "rgba(5,7,18,0.7)", backdropFilter: "blur(14px)" }}
  >
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden bg-[#0a0c1f]/98 border border-white/8 max-h-[88vh] flex flex-col"
      style={{ boxShadow: `0 30px 80px -20px ${movie.glowColor}66` }}
    >
      {/* Backdrop visual */}
      <div className={`relative h-44 bg-gradient-to-br ${movie.gradient} flex-shrink-0`}>
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none opacity-60"
          style={{ background: `radial-gradient(circle, ${movie.glowColor}88, transparent 70%)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 min-w-[40px] min-h-[40px] rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center active:scale-90 transition border border-white/10"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="absolute bottom-3 left-5 right-5 flex items-end gap-3">
          <span className="text-6xl drop-shadow-2xl leading-none">{movie.emoji}</span>
          <div className="min-w-0 pb-1">
            <h3 className="text-white text-xl font-bold leading-tight">{movie.titulo}</h3>
            {movie.tituloOriginal && movie.tituloOriginal !== movie.titulo && (
              <p className="text-white/85 text-[11px] italic">{movie.tituloOriginal}</p>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo scrollável */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-5"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <p className="text-white/85 text-[14px] leading-relaxed italic">"{movie.descricao}"</p>

        <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/8">
          <div className="flex items-center gap-1.5 text-white/85 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            <Sparkles size={11} /> Por que recomendamos
          </div>
          <p className="text-white text-[13.5px] leading-snug">{movie.motivoRecomendacao}</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <InfoCard label="Faixa etária" value={movie.faixaEtaria === "familia" ? "Família" : `${movie.faixaEtaria} anos`} />
          <InfoCard label="Duração" value={movie.duracao} />
          {movie.estudio && <InfoCard label="Estúdio" value={movie.estudio} />}
          <InfoCard label="Categoria" value={categoryLabel(movie.categoria)} />
        </div>

        {movie.streaming && movie.streaming.length > 0 && (
          <div>
            <div className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              Onde assistir
            </div>
            <div className="flex flex-wrap gap-2">
              {movie.streaming.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white text-[12px] font-semibold"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 text-amber-300">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              fill={i < movie.ratingKidzz ? "currentColor" : "transparent"}
              className={i < movie.ratingKidzz ? "" : "opacity-25"}
            />
          ))}
          <span className="text-white/80 text-[11px] font-semibold ml-1">
            Curadoria KIDZZ
          </span>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl p-3 bg-white/[0.04] border border-white/[0.06]">
    <div className="text-white/70 text-[9.5px] font-black uppercase tracking-[0.18em]">{label}</div>
    <div className="text-white text-[13px] font-bold mt-0.5 leading-tight">{value}</div>
  </div>
);

const categoryLabel = (c: Movie["categoria"]) =>
  ({ acolhimento: "Acolhimento", aventura: "Aventura", emocional: "Emocional", divertido: "Divertido", criativo: "Criativo" }[c]);

/* ============================================================ */
/*  Carrossel horizontal por seção                              */
/* ============================================================ */
const SectionCarousel = ({
  section,
  onOpen,
}: {
  section: (typeof EDITORIAL_SECTIONS)[number];
  onOpen: (m: Movie) => void;
}) => {
  const movies = useMemo(() => getMoviesBySection(section), [section]);
  return (
    <section className="mb-7">
      <div className="flex items-baseline justify-between px-5 mb-3">
        <div className="min-w-0">
          <h3 className="text-gray-900 font-bold text-[16px] leading-tight">
            <span className="mr-1.5">{section.icon}</span>
            {section.title}
          </h3>
          <p className="text-gray-700 text-[11px] font-medium mt-0.5">{section.subtitle}</p>
        </div>
      </div>
      <div
        className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 px-5 snap-x"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {movies.map((m, i) => (
          <motion.button
            key={m.id}
            onClick={() => onOpen(m)}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.03 * i, ease: "easeOut" }}
            className="snap-start flex-shrink-0"
            style={{ contentVisibility: "auto" as any }}
          >
            <Poster movie={m} size="md" />
          </motion.button>
        ))}
      </div>
    </section>
  );
};

/* ============================================================ */
/*  Tela principal                                              */
/* ============================================================ */
const FamilyCinema = ({ onBack }: Props) => {
  const [active, setActive] = useState<Movie | null>(null);
  const weekly = useMemo(() => getWeeklyMovie(), []);
  const daily = useMemo(() => getDailyHighlights(3), []);

  const open = (m: Movie) => {
    haptic("light");
    sfx("click");
    setActive(m);
  };

  return (
    <motion.div
      className="flex-1 flex flex-col relative min-h-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Fundo claro suave */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 50% at 50% 0%, rgba(244,168,216,0.18), transparent 60%), linear-gradient(180deg, #fdf6ef 0%, #f7ece0 50%, #f0e3d2 100%)",
        }}
      />

      {/* Header */}
      <header
        className="relative z-10 flex items-center gap-3 px-5 pb-2"
        style={{ paddingTop: "calc(max(env(safe-area-inset-top, 12px), 16px) + 8px)" }}
      >
        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.9 }}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-black/[0.06] text-gray-900 border border-black/10"
          aria-label="Voltar"
        >
          <ArrowLeft size={22} />
        </motion.button>
        <div className="flex-1 min-w-0">
          <h1 className="text-gray-900 text-lg font-bold leading-tight">Cinema em Família</h1>
          <p className="text-gray-700 text-[11.5px] font-medium">Curadoria emocional cinematográfica</p>
        </div>
      </header>

      {/* Scroll */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-32 pt-1 relative z-10"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Hero editorial */}
        <section className="px-5 mt-3 mb-6 text-center">
          <div className="flex justify-center">
            <KidzzChameleon state="cosmic" mood="happy" size="md" interactive={false} showParticles={false} />
          </div>
          <h2 className="mt-3 text-gray-900 font-bold text-[26px] tracking-tight leading-tight">
            Momentos que ficam.
          </h2>
          <p className="mt-1.5 text-gray-700 text-[13px] font-medium max-w-xs mx-auto leading-snug">
            Filmes para viver a infância junto.
          </p>
        </section>

        {/* Hero — Filme da Semana */}
        <section className="px-5 mb-7">
          <HeroFilm movie={weekly} onOpen={() => open(weekly)} />
        </section>

        {/* Em alta hoje */}
        <section className="mb-7">
          <div className="flex items-baseline justify-between px-5 mb-3">
            <h3 className="text-gray-900 font-bold text-[15px]">Em alta hoje</h3>
            <span className="text-gray-700 text-[10px] font-bold uppercase tracking-[0.18em]">
              Curadoria
            </span>
          </div>
          <div
            className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 px-5 snap-x"
            style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
          >
            {daily.map((m, i) => (
              <motion.button
                key={m.id}
                onClick={() => open(m)}
                whileTap={{ scale: 0.96 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.04 * i }}
                className="snap-start flex-shrink-0"
              >
                <Poster movie={m} size="lg" />
              </motion.button>
            ))}
          </div>
        </section>

        {/* Seções editoriais */}
        {EDITORIAL_SECTIONS.map((s) => (
          <SectionCarousel key={s.id} section={s} onOpen={open} />
        ))}

        <p className="mt-8 text-center text-gray-700 text-[11px] font-medium px-6">
          Curadoria KIDZZ · Selecionada para sua família
        </p>
      </div>

      <AnimatePresence>
        {active && <MovieSheet movie={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default FamilyCinema;

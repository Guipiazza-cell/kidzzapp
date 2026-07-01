import { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Trophy,
  Shield,
  Bookmark,
  Heart,
  Plane,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAchievementSync } from "@/hooks/useAchievementSync";
import {
  BRINCAR_EXPERIENCES,
  type BrincarExperience,
} from "@/data/brincarExperiences";
import LockedFeature from "@/components/LockedFeature";
import MyActivities from "./MyActivities";
import confetti from "canvas-confetti";

import heroChameleon from "@/assets/brincar-hero-chameleon.jpg";
import imgCabana from "@/assets/brincar-act-cabana.jpg";
import imgCaca from "@/assets/brincar-act-cacatesouro.jpg";
import imgArte from "@/assets/brincar-act-arte.jpg";
import imgAviao from "@/assets/brincar-act-aviao.jpg";

const WordSearchGame = lazy(() => import("./games/WordSearchGame"));
const MemoryGame = lazy(() => import("./games/MemoryGame"));
const HangmanGame = lazy(() => import("./games/HangmanGame"));
const DailyChallengeGame = lazy(() => import("./games/DailyChallengeGame"));
const PixelPulaGame = lazy(() => import("./games/PixelPulaGame"));
const ReactionGame = lazy(() => import("./games/ReactionGame"));
const EmotionsGame = lazy(() => import("./games/EmotionsGame"));
const CreateGame = lazy(() => import("./games/CreateGame"));

type GameId =
  | "pixel-pula"
  | "word"
  | "memory"
  | "hangman"
  | "daily"
  | "reaction"
  | "emotions"
  | "create";

type SubScreen = "home" | "missoes" | "criar" | "jogos";

interface FeaturedActivity {
  id: string;
  titulo: string;
  desc: string;
  img: string;
  tempo: string;
  idade: string;
  energia: "leve" | "média" | "ativa";
  premium?: boolean;
  tint: string; // overlay tint color
}

const FEATURED: FeaturedActivity[] = [
  {
    id: "cabana",
    titulo: "Cabana Secreta",
    desc: "Monte um esconderijo incrível e conte histórias!",
    img: imgCabana,
    tempo: "5 min",
    idade: "3–6 anos",
    energia: "leve",
    tint: "rgba(232,130,26,0.55)",
  },
  {
    id: "caca",
    titulo: "Caça ao Tesouro",
    desc: "Encontre os objetos escondidos pela casa.",
    img: imgCaca,
    tempo: "10 min",
    idade: "4–8 anos",
    energia: "média",
    premium: true,
    tint: "rgba(70,112,58,0.55)",
  },
  {
    id: "arte",
    titulo: "Arte Sem Regras",
    desc: "Liberte a criatividade com tinta e imaginação.",
    img: imgArte,
    tempo: "15 min",
    idade: "3–10 anos",
    energia: "leve",
    tint: "rgba(193,115,166,0.55)",
  },
  {
    id: "aviao",
    titulo: "Aviões de Papel",
    desc: "Quem faz o avião que voa mais longe?",
    img: imgAviao,
    tempo: "7 min",
    idade: "5–9 anos",
    energia: "leve",
    premium: true,
    tint: "rgba(79,143,201,0.55)",
  },
];

const GAMES: {
  id: GameId;
  label: string;
  emoji: string;
  sub: string;
  bgColor: string;
  premium?: boolean;
  isNew?: boolean;
}[] = [
  { id: "memory", label: "Memória", emoji: "🧠", sub: "Grátis para todos", bgColor: "linear-gradient(135deg, hsl(280 65% 65%), hsl(265 70% 55%))" },
  { id: "pixel-pula", label: "Kidzz Pula!", emoji: "🦎", sub: "3 partidas por dia", bgColor: "linear-gradient(135deg, hsl(140 70% 55%), hsl(155 65% 45%))", premium: true, isNew: true },
  { id: "reaction", label: "Reação", emoji: "⚡", sub: "Quão rápido você é?", bgColor: "linear-gradient(135deg, hsl(45 95% 55%), hsl(25 90% 50%))", premium: true, isNew: true },
  { id: "emotions", label: "Emoções", emoji: "💞", sub: "Mundo dos sentimentos", bgColor: "linear-gradient(135deg, hsl(320 70% 60%), hsl(280 65% 55%))", premium: true, isNew: true },
  { id: "create", label: "Eu Crio", emoji: "✨", sub: "Invente uma história", bgColor: "linear-gradient(135deg, hsl(200 75% 60%), hsl(260 70% 55%))", premium: true, isNew: true },
  { id: "word", label: "Caça Palavras", emoji: "🔍", sub: "Encontre as palavras", bgColor: "linear-gradient(135deg, hsl(200 75% 60%), hsl(210 80% 50%))", premium: true },
  { id: "hangman", label: "Forca", emoji: "✏️", sub: "Descubra a palavra", bgColor: "linear-gradient(135deg, hsl(35 90% 60%), hsl(25 90% 55%))", premium: true },
  { id: "daily", label: "Desafio", emoji: "🎯", sub: "Missão especial", bgColor: "linear-gradient(135deg, hsl(340 75% 65%), hsl(0 75% 60%))", premium: true },
];

interface Props {
  onBack: () => void;
  onGameComplete?: () => void;
  onOpenTravel?: () => void;
  onOpenAchievements?: () => void;
  onOpenLab?: () => void;
  onOpenParental?: () => void;
}

const KidzzPlay = ({
  onGameComplete,
  onOpenTravel,
  onOpenAchievements,
  onOpenParental,
}: Props) => {
  const { profile, tier } = useAuth();
  const { trackEvent } = useAchievementSync();
  const isPremium = tier !== "free";
  const childName = profile?.child_name || "amigo";
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  const [sub, setSub] = useState<SubScreen>("home");
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [showPremiumCTA, setShowPremiumCTA] = useState(false);
  const [selectedExp, setSelectedExp] = useState<BrincarExperience | null>(null);
  const [selectedFeatured, setSelectedFeatured] = useState<FeaturedActivity | null>(null);

  const creativeExperiences = useMemo(
    () =>
      BRINCAR_EXPERIENCES.filter(
        (e) => e.tipo === "criatividade" || e.categoria === "Criatividade",
      ),
    [],
  );

  const handleScore = useCallback(
    (pts: number) => {
      setSessionScore((s) => s + pts);
      onGameComplete?.();
      trackEvent("game");
      if (pts >= 15) {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.65 },
          colors: ["#10B981", "#FFD700", "#fff"],
          scalar: 0.85,
        });
      }
    },
    [onGameComplete, trackEvent],
  );

  const handleGameSelect = (id: GameId) => {
    const def = GAMES.find((g) => g.id === id);
    if (!def) return;
    if (def.premium && !isPremium) {
      if (id === "pixel-pula") {
        try {
          const today = new Date().toISOString().slice(0, 10);
          const raw = localStorage.getItem("kidzz_pula_daily") || "{}";
          const obj = JSON.parse(raw);
          const used = obj.date === today ? Number(obj.count) || 0 : 0;
          if (used >= 3) {
            setShowPremiumCTA(true);
            return;
          }
          localStorage.setItem(
            "kidzz_pula_daily",
            JSON.stringify({ date: today, count: used + 1 }),
          );
        } catch {
          /* noop */
        }
        setActiveGame(id);
        return;
      }
      setShowPremiumCTA(true);
      return;
    }
    setActiveGame(id);
  };

  /* ───────── HEADER FLOATING (Pais + Trophy) ───────── */
  const FloatingHeader = (
    <div
      className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4"
      style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 14px)" }}
    >
      {sub !== "home" ? (
        <motion.button
          onClick={() => {
            setSub("home");
            setActiveGame(null);
          }}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/70 backdrop-blur-md border border-white/60 shadow"
          whileTap={{ scale: 0.92 }}
          aria-label="Voltar"
        >
          <ArrowLeft size={20} className="text-[#2A2520]" />
        </motion.button>
      ) : (
        <div />
      )}
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          onClick={onOpenParental}
          whileTap={{ scale: 0.94 }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/75 backdrop-blur-md border border-white/70 shadow-sm min-h-[40px]"
        >
          <Shield size={14} className="text-[#46703A]" strokeWidth={2.4} />
          <span className="text-[13px] font-bold text-[#2A2520]">Pais</span>
        </motion.button>
        <motion.button
          type="button"
          onClick={onOpenAchievements}
          whileTap={{ scale: 0.94 }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/75 backdrop-blur-md border border-white/70 shadow-sm min-h-[40px]"
        >
          <Trophy size={14} className="text-amber-500" strokeWidth={2.4} />
          <span className="text-[13px] font-extrabold text-[#2A2520]">
            {sessionScore}
          </span>
        </motion.button>
      </div>
    </div>
  );

  /* ───────── HOME (matching reference) ───────── */
  const renderHome = () => (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
      style={{
        WebkitOverflowScrolling: "touch",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 60px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 130px)",
      }}
    >
      {/* HERO with chameleon */}
      <section className="relative px-5 pt-2 pb-3">
        <div className="relative">
          <img
            src={heroChameleon}
            alt="Camaleão Kidzz na floresta"
            className="absolute right-[-12px] top-[-6px] w-[58%] max-w-[260px] h-auto object-contain pointer-events-none select-none"
            style={{ filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.22))" }}
          />
          <div className="relative z-10 pr-[44%]">
            <p className="text-[13px] font-semibold text-[#2A2520]/85 flex items-center gap-1.5">
              {greeting}, família!
              <span className="text-base">💚</span>
            </p>
            <h1 className="font-display mt-2 text-[34px] leading-[1.02] font-extrabold text-[#1B1B1B] tracking-tight">
              Brincar
              <br />
              faz parte da{" "}
              <span className="text-[#46703A]">magia</span>
              <br />
              de crescer.
            </h1>
            <p className="mt-3 text-[13px] leading-snug text-[#2A2520]/75 font-medium max-w-[230px]">
              Escolha uma atividade e transforme qualquer momento em diversão, aprendizado e conexão.
            </p>
          </div>
        </div>
      </section>

      {/* 4 CATEGORY CARDS — 2x2 */}
      <section className="px-4 mt-3 grid grid-cols-2 gap-3">
        <CategoryCard
          onClick={() => setSub("missoes")}
          emoji="🎯"
          title="Missões do dia"
          subtitle="Desafios rápidos em família"
          gradient="linear-gradient(135deg, #F4A659 0%, #E8821A 100%)"
          accent="#E8821A"
        />
        <CategoryCard
          onClick={() => setSub("criar")}
          emoji="🧩"
          title="Criar & Imaginar"
          subtitle="Atividades criativas sem limites"
          gradient="linear-gradient(135deg, #7FB069 0%, #46703A 100%)"
          accent="#46703A"
        />
        <CategoryCard
          onClick={() => setSub("jogos")}
          emoji="🎮"
          title="Jogos & Desafios"
          subtitle="Diversão saudável para todos"
          gradient="linear-gradient(135deg, #8987DA 0%, #5E5CC2 100%)"
          accent="#5E5CC2"
        />
        <CategoryCard
          onClick={() => onOpenTravel?.()}
          emoji="✈️"
          title="Modo Viagem"
          subtitle="Atividades para qualquer lugar"
          gradient="linear-gradient(135deg, #7DB0E0 0%, #4F8FC9 100%)"
          accent="#4F8FC9"
          badge="NOVO"
        />
      </section>

      {/* PARA BRINCAR AGORA — horizontal carousel */}
      <section className="mt-6">
        <div className="flex items-end justify-between px-5 mb-3">
          <h2 className="font-display text-[19px] font-extrabold text-[#1B1B1B] tracking-tight flex items-center gap-1.5">
            Para brincar agora
            <Sparkles size={15} className="text-amber-500" />
          </h2>
          <button
            type="button"
            onClick={() => setSub("missoes")}
            className="text-[12px] font-bold text-[#2A2520]/70 flex items-center gap-0.5"
          >
            Ver todas <ArrowRight size={13} />
          </button>
        </div>
        <div className="-mx-1 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FEATURED.map((f) => (
            <FeaturedCard
              key={f.id}
              data={f}
              onOpen={() => {
                if (f.premium && !isPremium) {
                  setShowPremiumCTA(true);
                  return;
                }
                setSelectedFeatured(f);
              }}
            />
          ))}
        </div>
      </section>

      {/* DESAFIOS EM FAMÍLIA */}
      <section className="mt-5 px-4">
        <div className="flex items-end justify-between mb-3 px-1">
          <h2 className="font-display text-[19px] font-extrabold text-[#1B1B1B] tracking-tight flex items-center gap-1.5">
            Desafios em família
            <Sparkles size={15} className="text-amber-500" />
          </h2>
          <button
            type="button"
            onClick={() => setSub("missoes")}
            className="text-[12px] font-bold text-[#2A2520]/70 flex items-center gap-0.5"
          >
            Ver todos <ArrowRight size={13} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setSub("missoes")}
          className="w-full rounded-3xl p-4 text-left border border-white/40 shadow-lg overflow-hidden relative"
          style={{
            background:
              "linear-gradient(135deg, #8987DA 0%, #5E5CC2 60%, #46377A 100%)",
          }}
        >
          <div
            className="absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(closest-side, rgba(255,255,255,0.6), transparent 70%)",
            }}
          />
          <div className="relative flex items-stretch gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-white/95 mb-1">
                <span className="text-sm">👨‍👩‍👧</span>
                <span className="text-[11px] font-bold tracking-wide">
                  Desafio da Semana
                </span>
              </div>
              <h3 className="font-display text-[22px] font-extrabold text-white leading-[1.05] drop-shadow-sm">
                Diversão em Equipe
              </h3>
              <p className="text-[12px] font-medium text-white/90 leading-snug mt-1.5 max-w-[220px]">
                Escolham 3 atividades, completam juntos e ganhem uma conquista especial!
              </p>
              <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-[12px] font-bold backdrop-blur">
                Ver detalhes <ArrowRight size={12} />
              </span>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 pr-1">
              <ProgressRing value={2} total={3} />
              <p className="text-[10px] font-bold text-white/85 text-center leading-tight">
                atividades
                <br />
                concluídas
              </p>
            </div>
            <div className="flex flex-col items-center justify-center min-w-[70px]">
              <p className="text-[10px] font-bold text-white/85 mb-0.5">
                Recompensa
              </p>
              <span className="text-3xl drop-shadow">🏆</span>
              <p className="text-[11px] font-extrabold text-amber-200 mt-0.5">
                ✨ +50 pts
              </p>
            </div>
          </div>
        </button>
      </section>

      {/* IDEIAS RÁPIDAS + Modo Viagem chip */}
      <section className="mt-4 px-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSub("criar")}
          className="flex-1 bg-white/65 backdrop-blur-md border border-white/60 rounded-full px-4 py-3 flex items-center justify-between min-h-[48px] shadow-sm"
        >
          <span className="text-[13px] font-bold text-[#2A2520]">
            <span className="text-[#2A2520]">Ideias rápidas</span>{" "}
            <span className="text-[#2A2520]/65 font-semibold">
              para qualquer lugar
            </span>
          </span>
          <ArrowRight size={14} className="text-[#2A2520]/70" />
        </button>
        <button
          type="button"
          onClick={() => onOpenTravel?.()}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-white font-bold text-[12px] shadow-md min-h-[44px]"
          style={{
            background: "linear-gradient(135deg, #F4A659 0%, #E8821A 100%)",
          }}
        >
          <Plane size={13} />
          Modo Viagem
        </button>
      </section>
    </motion.div>
  );

  /* ───────── SUB: Criar & Imaginar ───────── */
  const renderCriar = () => (
    <motion.div
      key="criar"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
      style={{
        WebkitOverflowScrolling: "touch",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 72px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 130px)",
      }}
    >
      <div className="px-5">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#46703A]">
          Brincar · Criar & Imaginar
        </p>
        <h1 className="font-display text-[28px] font-extrabold text-[#1B1B1B] leading-tight mt-1">
          Atividades criativas
          <br />
          <span className="text-[#46703A]">sem limites</span>
        </h1>
        <p className="mt-2 text-[13px] text-[#2A2520]/75 max-w-[300px]">
          Inventem juntos, façam arte, transformem objetos comuns em magia.
        </p>
      </div>
      <div className="px-4 mt-5 grid grid-cols-2 gap-3">
        {creativeExperiences.map((e) => {
          const locked = e.premium && !isPremium;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => {
                if (locked) {
                  setShowPremiumCTA(true);
                  return;
                }
                setSelectedExp(e);
              }}
              className="relative rounded-3xl overflow-hidden text-left border border-white/40 shadow-md min-h-[170px]"
              style={{ background: e.gradient }}
            >
              <div
                className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-50 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(255,255,255,0.5), transparent 70%)",
                }}
              />
              <div className="relative z-10 p-3 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/90 bg-white/20 rounded-full px-2 py-0.5 border border-white/25">
                    {e.categoria}
                  </span>
                  {locked && (
                    <span className="bg-white/30 backdrop-blur rounded-full p-1">
                      <Lock size={11} className="text-white" />
                    </span>
                  )}
                </div>
                <div
                  className="text-4xl mt-3"
                  style={{ filter: locked ? "blur(2px)" : "none" }}
                >
                  {e.emoji}
                </div>
                <h4 className="mt-2 text-[14px] font-black text-white leading-tight drop-shadow-sm">
                  {e.titulo}
                </h4>
                <p className="text-[11px] text-white/90 font-semibold leading-snug mt-0.5 line-clamp-2">
                  {e.descricao}
                </p>
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-white/95">
                    ⏱ {e.tempo}
                  </span>
                  <span className="text-[10px] font-extrabold text-white/95">
                    {e.energia === "baixa"
                      ? "💛 leve"
                      : e.energia === "media"
                      ? "💚 média"
                      : "🧡 ativa"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  /* ───────── SUB: Jogos ───────── */
  const renderJogos = () => (
    <motion.div
      key="jogos"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
      style={{
        WebkitOverflowScrolling: "touch",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 72px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 130px)",
      }}
    >
      <AnimatePresence mode="wait">
        {!activeGame ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="px-5">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#5E5CC2]">
                Brincar · Jogos & Desafios
              </p>
              <h1 className="font-display text-[28px] font-extrabold text-[#1B1B1B] leading-tight mt-1">
                Diversão saudável
                <br />
                <span className="text-[#5E5CC2]">para todos</span>
              </h1>
              <p className="mt-2 text-[13px] text-[#2A2520]/75 max-w-[300px]">
                Memória, palavras, desafios — escolha o jogo do dia.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 px-4 mt-5">
              {GAMES.map((game) => {
                const locked = game.premium && !isPremium;
                return (
                  <motion.button
                    key={game.id}
                    onClick={() => handleGameSelect(game.id)}
                    className={`relative rounded-3xl p-4 flex flex-col items-center gap-1.5 border min-h-[130px] ${
                      locked
                        ? "border-white/40 opacity-80"
                        : "border-white/40 shadow-md"
                    }`}
                    style={{
                      background: locked
                        ? "rgba(255,255,255,0.55)"
                        : game.bgColor,
                    }}
                    whileTap={locked ? undefined : { scale: 0.96 }}
                  >
                    <span
                      className="text-4xl"
                      style={{ filter: locked ? "blur(2px)" : "none" }}
                    >
                      {game.emoji}
                    </span>
                    <span
                      className={`text-[13px] font-extrabold ${
                        locked ? "text-gray-500" : "text-white"
                      }`}
                    >
                      {game.label}
                    </span>
                    <span
                      className={`text-[10px] font-semibold leading-tight text-center ${
                        locked ? "text-gray-400" : "text-white/85"
                      }`}
                    >
                      {game.sub}
                    </span>
                    {locked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-white/30">
                        <Lock size={18} className="text-gray-600" />
                        <span className="text-[8px] text-gray-700 font-extrabold mt-1">
                          KIDZZ
                        </span>
                      </div>
                    )}
                    {game.isNew && !locked && (
                      <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-amber-400 to-pink-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-white/60">
                        NOVO
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex-1"
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-16 text-sm font-bold text-gray-600">
                  Carregando jogo… ✨
                </div>
              }
            >
              {activeGame === "pixel-pula" && (
                <PixelPulaGame
                  onScore={handleScore}
                  onReaction={() => {}}
                  onOpenAchievements={() => {
                    setActiveGame(null);
                    onOpenAchievements?.();
                  }}
                  onHome={() => setActiveGame(null)}
                />
              )}
              {activeGame === "word" && (
                <WordSearchGame
                  onScore={handleScore}
                  onReaction={() => {}}
                  onOpenAchievements={() => {
                    setActiveGame(null);
                    onOpenAchievements?.();
                  }}
                  onHome={() => setActiveGame(null)}
                />
              )}
              {activeGame === "memory" && (
                <MemoryGame
                  onScore={handleScore}
                  onReaction={() => {}}
                  onOpenAchievements={() => {
                    setActiveGame(null);
                    onOpenAchievements?.();
                  }}
                  onHome={() => setActiveGame(null)}
                />
              )}
              {activeGame === "hangman" && (
                <HangmanGame
                  onScore={handleScore}
                  onReaction={() => {}}
                  onOpenAchievements={() => {
                    setActiveGame(null);
                    onOpenAchievements?.();
                  }}
                  onHome={() => setActiveGame(null)}
                />
              )}
              {activeGame === "reaction" && (
                <ReactionGame
                  onScore={handleScore}
                  onReaction={() => {}}
                  onOpenAchievements={() => {
                    setActiveGame(null);
                    onOpenAchievements?.();
                  }}
                  onHome={() => setActiveGame(null)}
                />
              )}
              {activeGame === "emotions" && (
                <EmotionsGame
                  onScore={handleScore}
                  onReaction={() => {}}
                  onOpenAchievements={() => {
                    setActiveGame(null);
                    onOpenAchievements?.();
                  }}
                  onHome={() => setActiveGame(null)}
                />
              )}
              {activeGame === "create" && (
                <CreateGame
                  onScore={handleScore}
                  onReaction={() => {}}
                  onOpenAchievements={() => {
                    setActiveGame(null);
                    onOpenAchievements?.();
                  }}
                  onHome={() => setActiveGame(null)}
                />
              )}
              {activeGame === "daily" && (
                <DailyChallengeGame
                  onScore={handleScore}
                  onReaction={() => {}}
                  isPremium={isPremium}
                  onOpenAchievements={() => {
                    setActiveGame(null);
                    onOpenAchievements?.();
                  }}
                  onHome={() => setActiveGame(null)}
                />
              )}
            </Suspense>
            <motion.button
              onClick={() => setActiveGame(null)}
              className="absolute z-30 px-4 py-3 rounded-2xl font-extrabold text-white text-sm border border-white/40 bg-emerald-700/90 backdrop-blur-md shadow-xl flex items-center gap-2 min-h-[44px]"
              style={{ bottom: 90, left: 20 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={16} /> Sair do jogo
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden relative min-h-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {FloatingHeader}

      <div className="relative flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {sub === "home" && renderHome()}
          {sub === "missoes" && (
            <motion.div
              key="missoes"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <MyActivities onBack={() => setSub("home")} />
            </motion.div>
          )}
          {sub === "criar" && renderCriar()}
          {sub === "jogos" && renderJogos()}
        </AnimatePresence>
      </div>

      {/* Premium CTA */}
      <AnimatePresence>
        {showPremiumCTA && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPremiumCTA(false)}
          >
            <motion.div
              className="w-full max-w-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <LockedFeature
                type="games"
                requiredTier="kidzz"
                onUpgrade={() => {
                  setShowPremiumCTA(false);
                  window.dispatchEvent(
                    new CustomEvent("kidzz:open-paywall", {
                      detail: { context: "games_locked" },
                    }),
                  );
                }}
              />
              <button
                className="block mx-auto mt-3 text-xs text-white/80 font-bold underline"
                onClick={() => setShowPremiumCTA(false)}
              >
                Agora não
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured activity detail */}
      <AnimatePresence>
        {selectedFeatured && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFeatured(null)}
          >
            <motion.div
              className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden bg-white shadow-2xl"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-48">
                <img
                  src={selectedFeatured.img}
                  alt={selectedFeatured.titulo}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, ${selectedFeatured.tint} 0%, rgba(0,0,0,0.5) 100%)`,
                  }}
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur text-[11px] font-extrabold text-[#2A2520]">
                  ⏱ {selectedFeatured.tempo}
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-display text-[22px] font-extrabold text-white drop-shadow-lg">
                    {selectedFeatured.titulo}
                  </h3>
                  <p className="text-[12px] font-medium text-white/95 leading-snug mt-1">
                    {selectedFeatured.desc}
                  </p>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[11px] font-bold text-[#2A2520]/70">
                  <span className="px-2.5 py-1 rounded-full bg-[#F5EFE3] border border-[#E5D9C0]">
                    🎯 {selectedFeatured.idade}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#F5EFE3] border border-[#E5D9C0] flex items-center gap-1">
                    <Heart size={11} className="text-rose-400" />
                    {selectedFeatured.energia}
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-2xl font-black text-white text-sm shadow-md"
                  style={{
                    background:
                      "linear-gradient(135deg, #F4A659 0%, #E8821A 100%)",
                  }}
                  onClick={() => {
                    handleScore(5);
                    setSelectedFeatured(null);
                  }}
                >
                  ✨ Vamos brincar agora
                </motion.button>
                <button
                  className="text-xs font-bold text-gray-500 mx-auto"
                  onClick={() => setSelectedFeatured(null)}
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generic experience detail (sub-screen Criar) */}
      <AnimatePresence>
        {selectedExp && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedExp(null)}
          >
            <motion.div
              className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden border border-white/30 shadow-2xl"
              style={{ background: selectedExp.gradient }}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center text-4xl border border-white/30">
                    {selectedExp.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/90">
                      {selectedExp.categoria}
                    </p>
                    <h3 className="text-xl font-black text-white leading-tight drop-shadow-sm">
                      {selectedExp.titulo}
                    </h3>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white/95 leading-snug mt-3">
                  {selectedExp.descricao}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-[11px] font-extrabold text-white bg-white/20 border border-white/30 rounded-full px-2.5 py-1">
                    ⏱ {selectedExp.tempo}
                  </span>
                  <span className="text-[11px] font-extrabold text-white bg-white/20 border border-white/30 rounded-full px-2.5 py-1">
                    🎯 {selectedExp.idadeMin}–{selectedExp.idadeMax} anos
                  </span>
                </div>
              </div>
              <div className="bg-white/95 backdrop-blur p-4 flex flex-col gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-2xl font-black text-white text-sm shadow-md min-h-[48px]"
                  style={{ background: selectedExp.gradient }}
                  onClick={() => {
                    handleScore(5);
                    setSelectedExp(null);
                  }}
                >
                  ✨ Vamos viver agora
                </motion.button>
                <button
                  className="text-xs font-bold text-gray-500 mx-auto"
                  onClick={() => setSelectedExp(null)}
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ───────────── SUB-COMPONENTS ───────────── */

const CategoryCard = ({
  onClick,
  emoji,
  title,
  subtitle,
  gradient,
  accent,
  badge,
}: {
  onClick: () => void;
  emoji: string;
  title: string;
  subtitle: string;
  gradient: string;
  accent: string;
  badge?: string;
}) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileTap={{ scale: 0.97 }}
    className="relative rounded-[22px] p-3.5 text-left overflow-hidden border border-white/40 min-h-[160px] flex flex-col justify-between"
    style={{
      background: gradient,
      boxShadow: `0 10px 24px -10px ${accent}66, inset 0 1px 0 rgba(255,255,255,0.3)`,
    }}
  >
    <div
      className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-40 pointer-events-none"
      style={{
        background:
          "radial-gradient(closest-side, rgba(255,255,255,0.55), transparent 70%)",
      }}
    />
    {badge && (
      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-400 text-white text-[9px] font-black shadow-md">
        {badge}
      </span>
    )}
    <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center text-2xl border border-white/30">
      {emoji}
    </div>
    <div className="relative z-10 mt-2">
      <h3 className="font-display text-[15px] font-extrabold text-white leading-tight drop-shadow-sm">
        {title}
      </h3>
      <p className="text-[10.5px] font-semibold text-white/90 leading-snug mt-0.5">
        {subtitle}
      </p>
    </div>
    <div className="relative z-10 self-end mt-1.5">
      <div className="w-7 h-7 rounded-full bg-white/25 backdrop-blur flex items-center justify-center border border-white/30">
        <ChevronRight size={15} className="text-white" strokeWidth={2.4} />
      </div>
    </div>
  </motion.button>
);

const FeaturedCard = ({
  data,
  onOpen,
}: {
  data: FeaturedActivity;
  onOpen: () => void;
}) => (
  <motion.button
    type="button"
    onClick={onOpen}
    whileTap={{ scale: 0.97 }}
    className="relative snap-start flex-shrink-0 w-[170px] rounded-3xl overflow-hidden text-left border border-white/40 shadow-md"
    style={{ minHeight: 230 }}
  >
    <img
      src={data.img}
      alt={data.titulo}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(180deg, ${data.tint} 0%, rgba(0,0,0,0.55) 100%)`,
      }}
    />
    <div className="relative z-10 p-3 flex flex-col h-full min-h-[230px]">
      <div className="flex items-start justify-between">
        <span className="px-2 py-0.5 rounded-full bg-white/85 backdrop-blur text-[10px] font-extrabold text-[#2A2520]">
          {data.tempo}
        </span>
        <span className="w-7 h-7 rounded-full bg-white/25 backdrop-blur flex items-center justify-center border border-white/30">
          <Bookmark size={13} className="text-white" />
        </span>
      </div>
      <div className="mt-auto">
        <h4 className="font-display text-[15px] font-extrabold text-white leading-tight drop-shadow-sm">
          {data.titulo}
        </h4>
        <p className="text-[11px] font-medium text-white/95 leading-snug mt-0.5 line-clamp-2">
          {data.desc}
        </p>
        <div className="mt-2 flex items-center justify-between text-[10px] font-extrabold text-white/95">
          <span className="flex items-center gap-1">
            {data.premium && <Lock size={9} />}
            {data.idade}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={10} className="text-rose-300" />
            {data.energia}
          </span>
        </div>
      </div>
    </div>
  </motion.button>
);

const ProgressRing = ({ value, total }: { value: number; total: number }) => {
  const size = 64;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(value / total, 1);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#FFD66E"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-display font-black text-white text-[18px] leading-none">
        {value}
        <span className="text-white/60">/{total}</span>
      </div>
    </div>
  );
};

export default KidzzPlay;

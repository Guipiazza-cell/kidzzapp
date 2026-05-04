import { useState, useCallback, useEffect, memo, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Search, Brain, Type, Zap, Trophy, Sparkles, Gamepad2, Plane, Target, Heart, Wand2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAchievementSync } from "@/hooks/useAchievementSync";
import KidzzChameleon, { type KidzzMood } from "@/components/kidzz/KidzzChameleon";
import { loadMascotConfig, type LabExpression } from "@/components/lab/KidzzLab";
const WordSearchGame = lazy(() => import("./games/WordSearchGame"));
const MemoryGame = lazy(() => import("./games/MemoryGame"));
const HangmanGame = lazy(() => import("./games/HangmanGame"));
const DailyChallengeGame = lazy(() => import("./games/DailyChallengeGame"));
const PixelPulaGame = lazy(() => import("./games/PixelPulaGame"));
const ReactionGame = lazy(() => import("./games/ReactionGame"));
const EmotionsGame = lazy(() => import("./games/EmotionsGame"));
const CreateGame = lazy(() => import("./games/CreateGame"));
import MyActivities from "./MyActivities";
import confetti from "canvas-confetti";

// Hue values per saved color id — matches KidzzLab/HomeScreen
const HUE_MAP: Record<string, number> = {
  "rosa-encantado": 0,
  "dourado-magico": -30,
  "verde-floresta": 90,
  "azul-oceano": 180,
  "lilas-estrelado": 240,
  "laranja-aventura": -60,
};

// Map saved expression → KidzzMood for the chameleon component
const EXPR_TO_MOOD: Record<LabExpression, KidzzMood> = {
  happy: "happy",
  curious: "curious",
  excited: "happy",
  thinking: "thinking",
  loving: "calm",
  challenging: "guide",
};

type GameId = "pixel-pula" | "word" | "memory" | "hangman" | "daily" | "reaction" | "emotions" | "create";
type View = "menu" | "games" | "activities";

// Estratégia de monetização: 1 jogo grátis por categoria — Memória é o item gratuito.
// Os demais ficam bloqueados para free e disparam o paywall contextual.
const GAMES: { id: GameId; label: string; icon: typeof Search; emoji: string; sub: string; bgColor: string; premium?: boolean; isNew?: boolean }[] = [
  { id: "memory", label: "Memória", icon: Brain, emoji: "🧠", sub: "Grátis para todos", bgColor: "linear-gradient(135deg, hsl(280 65% 65%), hsl(265 70% 55%))" },
  { id: "pixel-pula", label: "Kidzz Pula!", icon: Sparkles, emoji: "🦎", sub: "3 partidas por dia", bgColor: "linear-gradient(135deg, hsl(140 70% 55%), hsl(155 65% 45%))", premium: true, isNew: true },
  { id: "reaction", label: "Reação", icon: Zap, emoji: "⚡", sub: "Quão rápido você é?", bgColor: "linear-gradient(135deg, hsl(45 95% 55%), hsl(25 90% 50%))", premium: true, isNew: true },
  { id: "emotions", label: "Emoções", icon: Heart, emoji: "💞", sub: "Mundo dos sentimentos", bgColor: "linear-gradient(135deg, hsl(320 70% 60%), hsl(280 65% 55%))", premium: true, isNew: true },
  { id: "create", label: "Eu Crio", icon: Wand2, emoji: "✨", sub: "Invente uma história", bgColor: "linear-gradient(135deg, hsl(200 75% 60%), hsl(260 70% 55%))", premium: true, isNew: true },
  { id: "word", label: "Caça Palavras", icon: Search, emoji: "🔍", sub: "Encontre as palavras", bgColor: "linear-gradient(135deg, hsl(200 75% 60%), hsl(210 80% 50%))", premium: true },
  { id: "hangman", label: "Forca", icon: Type, emoji: "✏️", sub: "Descubra a palavra", bgColor: "linear-gradient(135deg, hsl(35 90% 60%), hsl(25 90% 55%))", premium: true },
  { id: "daily", label: "Desafio", icon: Zap, emoji: "🎯", sub: "Missão especial", bgColor: "linear-gradient(135deg, hsl(340 75% 65%), hsl(0 75% 60%))", premium: true },
];

interface Props {
  onBack: () => void;
  onGameComplete?: () => void;
  onOpenTravel?: () => void;
  onOpenAchievements?: () => void;
  onOpenLab?: () => void;
}

const KidzzPlay = ({ onBack, onGameComplete, onOpenTravel, onOpenAchievements, onOpenLab }: Props) => {
  const { profile } = useAuth();
  const { trackEvent } = useAchievementSync();
  const isPremium = profile?.is_premium ?? false;
  const childName = profile?.child_name || "amigo";

  const [view, setView] = useState<View>("menu");
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [mascotMood, setMascotMood] = useState<"idle" | "happy" | "encourage">("idle");
  const [showPremiumCTA, setShowPremiumCTA] = useState(false);

  // Saved KIDZZ config (cor + expressão) — recarregada apenas ao SAIR de "Meu KIDZZ"
  const [mascotConfig, setMascotConfig] = useState(() => loadMascotConfig());
  useEffect(() => {
    if (view === "menu") setMascotConfig(loadMascotConfig());
  }, [view]);
  const savedHue = HUE_MAP[mascotConfig.colorId] ?? 0;
  const savedMood: KidzzMood = EXPR_TO_MOOD[mascotConfig.expression] ?? "happy";

  const handleScore = useCallback((pts: number) => {
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
  }, [onGameComplete, trackEvent]);

  const handleReaction = useCallback((type: "happy" | "encourage") => {
    setMascotMood(type);
    setTimeout(() => setMascotMood("idle"), 1500);
  }, []);

  const handleGameSelect = (id: GameId) => {
    const def = GAMES.find((g) => g.id === id);
    if (!def) return;
    // "Kidzz Pula!" tem limite suave de 3 partidas/dia para free; demais premium = bloqueio total
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
            JSON.stringify({ date: today, count: used + 1 })
          );
        } catch { /* noop */ }
        setActiveGame(id);
        return;
      }
      setShowPremiumCTA(true);
      return;
    }
    setActiveGame(id);
  };

  // Reaction (happy/encourage) wins; otherwise use the saved expression
  const kidzzMood: KidzzMood =
    mascotMood === "happy" ? "happy" : mascotMood === "encourage" ? "curious" : savedMood;

  const heroSpeech =
    view === "games"
      ? activeGame
        ? mascotMood === "happy"
          ? "Muito bem! 🎉"
          : mascotMood === "encourage"
          ? "Quase lá! 💪"
          : "Você consegue! 💚"
        : "Escolha um jogo!"
      : `O que vamos fazer, ${childName}? 💚`;

  /* ── HEADER comum ── */
  const Header = (
    <div
      className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2"
      style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
    >
      <motion.button
        onClick={() => {
          if (view !== "menu") setView("menu");
          else onBack();
          setActiveGame(null);
        }}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/70 border border-white/40 backdrop-blur"
        whileTap={{ scale: 0.9 }}
        aria-label="Voltar"
      >
        <ArrowLeft size={20} className="text-gray-700" />
      </motion.button>
      <div className="text-center flex-1">
        <h1 className="text-base font-extrabold text-gray-800 flex items-center justify-center gap-1.5">
          🎮 Brincar
        </h1>
        <p className="text-[11px] text-gray-500 font-semibold">
          {view === "menu" ? "Escolha sua aventura" : "Jogos rápidos"}
        </p>
      </div>
      <div className="flex items-center gap-1.5 bg-white/70 border border-white/40 px-2.5 py-1.5 rounded-xl backdrop-blur min-w-[44px] min-h-[36px]">
        <Trophy size={14} className="text-amber-500" />
        <span className="text-xs font-extrabold text-gray-700">{sessionScore}</span>
      </div>
    </div>
  );

  /* ── MENU principal: 3 cards grandes ── */
  const renderMenu = () => (
    <motion.div
      key="menu"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col px-4"
    >
      {/* KIDZZ HERO grande — reflete a cor/expressão escolhidas em "Meu KIDZZ" */}
      <div className="relative flex justify-center pt-2 pb-3">
        <motion.div
          className="relative"
          style={{ filter: `hue-rotate(${savedHue}deg)`, transition: "filter 350ms ease" }}
        >
          <KidzzChameleon
            state="play"
            mood={kidzzMood}
            size="xl"
            interactive
            showParticles
          />
          <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white/85 backdrop-blur-md rounded-2xl px-3 py-1.5 border border-white/60 whitespace-nowrap shadow-md"
            key={heroSpeech}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[12px] font-extrabold text-gray-800">{heroSpeech}</p>
          </motion.div>
        </motion.div>
      </div>

      {/* 3 CARDS PRINCIPAIS — Atividades, Jogos, Viagem */}
      <div className="flex-1 flex flex-col gap-3">
        <HubCard
          onClick={() => setView("activities")}
          icon={<Target size={28} className="text-white" />}
          emoji="🎯"
          title="Atividades"
          subtitle="Missões da semana"
          gradient="linear-gradient(135deg, hsl(35 95% 55%), hsl(25 90% 45%))"
          highlight
        />
        <HubCard
          onClick={() => setView("games")}
          icon={<Gamepad2 size={28} className="text-white" />}
          emoji="🎮"
          title="Jogos"
          subtitle="Diversão rápida e desafios"
          gradient="linear-gradient(135deg, hsl(140 70% 50%), hsl(155 65% 40%))"
        />
        {onOpenTravel && (
          <HubCard
            onClick={onOpenTravel}
            icon={<Plane size={28} className="text-white" />}
            emoji="✈️"
            title="Viagem"
            subtitle="Modo fora de casa"
            gradient="linear-gradient(135deg, hsl(200 80% 55%), hsl(220 75% 45%))"
          />
        )}
      </div>

      {/* Stats compactos */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/70 backdrop-blur rounded-2xl p-3 border border-white/50 mt-3"
      >
        <div className="flex items-center justify-between gap-2">
          <Stat label="Hoje" value={sessionScore} suffix="pts" color="text-emerald-600" />
          <div className="w-px h-8 bg-gray-300/50" />
          <Stat
            label="Streak"
            value={profile?.streak_days ?? 0}
            suffix="🔥"
            color="text-orange-500"
          />
          <div className="w-px h-8 bg-gray-300/50" />
          <Stat
            label="Total"
            value={profile?.points ?? 0}
            suffix="pts"
            color="text-amber-500"
          />
        </div>
      </motion.div>
    </motion.div>
  );

  /* ── Games (lista + jogo ativo) ── */
  const renderGames = () => (
    <motion.div
      key="games"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="flex-1 flex flex-col px-4"
    >
      {/* KIDZZ menor no topo — reflete a customização salva */}
      <div
        className="relative flex justify-center pt-1 pb-2"
        style={{ filter: `hue-rotate(${savedHue}deg)`, transition: "filter 350ms ease" }}
      >
        <KidzzChameleon
          state="play"
          mood={kidzzMood}
          size="md"
          interactive={!activeGame}
          showParticles={!activeGame}
        />
      </div>

      <AnimatePresence mode="wait">
        {!activeGame ? (
          <motion.div
            key="games-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-3 pb-4"
          >
            {GAMES.map((game) => {
              const locked = game.premium && !isPremium;
              return (
                <motion.button
                  key={game.id}
                  onClick={() => handleGameSelect(game.id)}
                  className={`relative rounded-2xl p-4 flex flex-col items-center gap-1.5 border transition-all min-h-[120px] ${
                    locked
                      ? "border-gray-200 opacity-70"
                      : "border-white/40 shadow-md"
                  }`}
                  style={{
                    background: locked ? "rgba(255,255,255,0.55)" : game.bgColor,
                  }}
                  whileTap={locked ? undefined : { scale: 0.95 }}
                >
                  <span
                    className="text-3xl"
                    style={{ filter: locked ? "blur(2px)" : "none" }}
                  >
                    {game.emoji}
                  </span>
                  <span
                    className={`text-xs font-extrabold ${
                      locked ? "text-gray-500" : "text-white"
                    }`}
                  >
                    {game.label}
                  </span>
                  <span
                    className={`text-[10px] font-bold leading-tight text-center ${
                      locked ? "text-gray-400" : "text-white/85"
                    }`}
                  >
                    {game.sub}
                  </span>
                  {locked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/30">
                      <Lock size={18} className="text-gray-600" />
                      <span className="text-[8px] text-gray-700 font-extrabold mt-1">
                        Premium
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
          </motion.div>
        ) : (
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex-1 overflow-y-auto pb-24"
          >
            {activeGame === "pixel-pula" && (
              <PixelPulaGame
                onScore={handleScore}
                onReaction={handleReaction}
                onOpenAchievements={() => { setActiveGame(null); onOpenAchievements?.(); }}
                onHome={() => { setActiveGame(null); onBack(); }}
              />
            )}
            {activeGame === "word" && (
              <WordSearchGame
                onScore={handleScore}
                onReaction={handleReaction}
                onOpenAchievements={() => { setActiveGame(null); onOpenAchievements?.(); }}
                onHome={() => { setActiveGame(null); onBack(); }}
              />
            )}
            {activeGame === "memory" && (
              <MemoryGame
                onScore={handleScore}
                onReaction={handleReaction}
                onOpenAchievements={() => { setActiveGame(null); onOpenAchievements?.(); }}
                onHome={() => { setActiveGame(null); onBack(); }}
              />
            )}
            {activeGame === "hangman" && (
              <HangmanGame
                onScore={handleScore}
                onReaction={handleReaction}
                onOpenAchievements={() => { setActiveGame(null); onOpenAchievements?.(); }}
                onHome={() => { setActiveGame(null); onBack(); }}
              />
            )}
            {activeGame === "reaction" && (
              <ReactionGame
                onScore={handleScore}
                onReaction={handleReaction}
                onOpenAchievements={() => { setActiveGame(null); onOpenAchievements?.(); }}
                onHome={() => { setActiveGame(null); onBack(); }}
              />
            )}
            {activeGame === "emotions" && (
              <EmotionsGame
                onScore={handleScore}
                onReaction={handleReaction}
                onOpenAchievements={() => { setActiveGame(null); onOpenAchievements?.(); }}
                onHome={() => { setActiveGame(null); onBack(); }}
              />
            )}
            {activeGame === "create" && (
              <CreateGame
                onScore={handleScore}
                onReaction={handleReaction}
                onOpenAchievements={() => { setActiveGame(null); onOpenAchievements?.(); }}
                onHome={() => { setActiveGame(null); onBack(); }}
              />
            )}
            {activeGame === "daily" && (
              <DailyChallengeGame
                onScore={handleScore}
                onReaction={handleReaction}
                isPremium={isPremium}
                onOpenAchievements={() => {
                  setActiveGame(null);
                  onOpenAchievements?.();
                }}
                onHome={() => {
                  setActiveGame(null);
                  onBack();
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {activeGame && (
        <motion.button
          onClick={() => setActiveGame(null)}
          className="absolute z-30 px-4 py-3 rounded-2xl font-extrabold text-white text-sm border border-white/40 bg-emerald-700/90 backdrop-blur-md shadow-xl flex items-center gap-2 min-h-[44px]"
          style={{ bottom: 90, left: 20 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={16} /> Sair do jogo
        </motion.button>
      )}
    </motion.div>
  );

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Fundo transparente — usa MagicalBackground global para continuidade entre abas */}

      {Header}

      <div className="relative flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {view === "menu" && renderMenu()}
          {view === "games" && renderGames()}
          {view === "activities" && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <MyActivities onBack={() => setView("menu")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Premium CTA overlay */}
      <AnimatePresence>
        {showPremiumCTA && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPremiumCTA(false)}
          >
            <motion.div
              className="mx-6 p-6 rounded-3xl border-2 border-amber-300 text-center bg-white"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-5xl mb-3"
                animate={{ rotate: [0, -10, 10, 0], y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎮
              </motion.div>
              <h3 className="text-lg font-extrabold text-gray-800 mb-2">
                Desbloqueie todos os jogos
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Desafios diários, jogos avançados e diversão sem limites!
              </p>
              <motion.button
                className="w-full py-3 rounded-2xl font-extrabold text-white text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(140 70% 50%), hsl(200 75% 55%))",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPremiumCTA(false)}
              >
                Desbloquear todos os jogos 🎮✨
              </motion.button>
              <button
                className="mt-3 text-xs text-gray-400 font-bold"
                onClick={() => setShowPremiumCTA(false)}
              >
                Agora não
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ── Subcomponentes ── */

interface HubCardProps {
  onClick: () => void;
  icon: React.ReactNode;
  emoji: string;
  title: string;
  subtitle: string;
  gradient: string;
  highlight?: boolean;
}
const HubCard = memo(({ onClick, icon, emoji, title, subtitle, gradient, highlight }: HubCardProps) => (
  <motion.button
    onClick={onClick}
    className="relative w-full rounded-3xl p-4 text-left flex items-center gap-3 shadow-lg border border-white/30 overflow-hidden min-h-[80px]"
    style={{ background: gradient }}
    whileTap={{ scale: 0.97 }}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
  >
    {highlight && (
      <motion.span
        className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-white text-[9px] font-black shadow-md"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        ⭐ HOJE
      </motion.span>
    )}
    <div className="w-14 h-14 rounded-2xl bg-white/25 flex items-center justify-center text-3xl flex-shrink-0 backdrop-blur-sm">
      {emoji}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-base font-black text-white drop-shadow-sm leading-tight">
        {title}
      </h3>
      <p className="text-xs text-white/90 font-semibold leading-snug mt-0.5">
        {subtitle}
      </p>
    </div>
    <div className="opacity-90 flex-shrink-0">{icon}</div>
  </motion.button>
));
HubCard.displayName = "HubCard";

const Stat = ({
  label,
  value,
  suffix,
  color,
}: {
  label: string;
  value: number;
  suffix: string;
  color: string;
}) => (
  <div className="flex-1 text-center">
    <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
      {label}
    </p>
    <p className={`text-base font-black ${color}`}>
      {value}
      <span className="text-[10px] text-gray-400 ml-0.5 font-bold">{suffix}</span>
    </p>
  </div>
);

export default KidzzPlay;

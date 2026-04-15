import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Search, Brain, Type, Zap, Trophy, Flame } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import pixelImg from "@/assets/pixel-chameleon.png";
import WordSearchGame from "./games/WordSearchGame";
import MemoryGame from "./games/MemoryGame";
import HangmanGame from "./games/HangmanGame";
import DailyChallengeGame from "./games/DailyChallengeGame";

type GameId = "word" | "memory" | "hangman" | "daily";

const GAMES: { id: GameId; label: string; icon: typeof Search; emoji: string; sub: string; bgColor: string; premium?: boolean }[] = [
  { id: "word", label: "Caça Palavras", icon: Search, emoji: "🔍", sub: "Encontre palavras escondidas", bgColor: "rgba(45,90,61,0.6)" },
  { id: "memory", label: "Memória", icon: Brain, emoji: "🧠", sub: "Treine sua memória", bgColor: "rgba(26,58,92,0.6)" },
  { id: "hangman", label: "Forca", icon: Type, emoji: "✏️", sub: "Descubra a palavra secreta", bgColor: "rgba(92,58,26,0.6)" },
  { id: "daily", label: "Desafio", icon: Zap, emoji: "🎯", sub: "Missão especial", bgColor: "rgba(58,26,92,0.6)", premium: true },
];

interface Props {
  onBack: () => void;
  onGameComplete?: () => void;
}

const KidzzPlay = ({ onBack, onGameComplete }: Props) => {
  const { profile } = useAuth();
  const isPremium = profile?.is_premium ?? false;
  const childName = profile?.child_name || "Explorador";

  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [mascotMood, setMascotMood] = useState<"idle" | "happy" | "encourage">("idle");
  const [showPremiumCTA, setShowPremiumCTA] = useState(false);

  const handleScore = useCallback((pts: number) => {
    setSessionScore((s) => s + pts);
    onGameComplete?.();
  }, [onGameComplete]);

  const handleReaction = useCallback((type: "happy" | "encourage") => {
    setMascotMood(type);
    setTimeout(() => setMascotMood("idle"), 1500);
  }, []);

  const handleGameSelect = (id: GameId) => {
    if (GAMES.find((g) => g.id === id)?.premium && !isPremium) {
      setShowPremiumCTA(true);
      return;
    }
    setActiveGame(id);
  };

  const mascotAnimation = {
    idle: { y: [0, -4, 0], rotate: [0, 2, -2, 0] },
    happy: { y: [0, -12, 0], rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] },
    encourage: { y: [0, -3, 0], rotate: [0, 5, 0] },
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        background: "linear-gradient(160deg, #064E3B 0%, #065F46 30%, #047857 60%, #0F766E 100%)",
        backgroundImage: `
          linear-gradient(160deg, rgba(6,78,59,0.95) 0%, rgba(6,95,70,0.92) 30%, rgba(4,120,87,0.9) 60%, rgba(15,118,110,0.95) 100%),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cpath d='M20,180 Q40,160 30,140 Q20,120 40,100' stroke='rgba(255,255,255,0.03)' fill='none' stroke-width='2'/%3E%3Cpath d='M160,20 Q180,40 170,60 Q160,80 180,100' stroke='rgba(255,255,255,0.03)' fill='none' stroke-width='2'/%3E%3Ccircle cx='100' cy='50' r='1.5' fill='rgba(255,255,255,0.04)'/%3E%3Ccircle cx='150' cy='150' r='1' fill='rgba(255,255,255,0.03)'/%3E%3C/svg%3E")
        `,
      }}
    >
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating letters */}
        {["A", "B", "?", "7", "★", "+", "Z", "!"].map((char, i) => (
          <motion.div
            key={`letter-${i}`}
            className="absolute text-white/[0.06] font-black"
            style={{
              fontSize: 20 + i * 8,
              top: `${5 + i * 12}%`,
              left: `${8 + (i * 13) % 85}%`,
            }}
            animate={{
              y: [0, -15 - i * 3, 0],
              rotate: [-5, 5, -5],
              opacity: [0.04, 0.1, 0.04],
            }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          >
            {char}
          </motion.div>
        ))}

        {/* Floating shapes */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute border border-emerald-300/[0.08]"
            style={{
              width: 30 + i * 15,
              height: 30 + i * 15,
              borderRadius: i % 2 === 0 ? "50%" : "20%",
              top: `${20 + i * 15}%`,
              right: `${5 + i * 12}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [0.8, 1.1, 0.8],
            }}
            transition={{ duration: 8 + i * 3, repeat: Infinity, ease: "linear" }}
          />
        ))}

        {/* Playful sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300/20"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.8 }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2">
        <motion.button
          onClick={activeGame ? () => setActiveGame(null) : onBack}
          className="p-2 rounded-xl bg-white/5 border border-white/10"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} className="text-white/70" />
        </motion.button>
        <div className="text-center">
          <h1 className="text-base font-bold text-white/90 flex items-center gap-1.5">
            🎮 Kidzz Play
          </h1>
          <p className="text-[10px] text-emerald-300/50">Smart Fun World</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl">
          <Trophy size={14} className="text-yellow-400" />
          <span className="text-xs font-bold text-white/70">{sessionScore}</span>
        </div>
      </div>

      {/* Mascot */}
      <div className="relative z-10 flex justify-center py-2">
        <motion.div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full -m-4"
            style={{
              background: mascotMood === "happy"
                ? "radial-gradient(circle, rgba(16,185,129,0.3), transparent 70%)"
                : "radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)",
            }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div className="relative">
            <motion.img
              src={pixelImg}
              alt="Pixel"
              className="w-20 h-20 object-contain drop-shadow-xl"
              animate={mascotAnimation[mascotMood]}
              transition={{ duration: mascotMood === "happy" ? 0.6 : 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Speech bubble */}
            {/* Speech bubble - contextual */}
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1 border border-white/20 whitespace-nowrap"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-[10px] font-bold text-white/80">
                {mascotMood === "happy"
                  ? "Muito bem! 🎉"
                  : mascotMood === "encourage"
                  ? "Quase lá! 💪"
                  : `Escolha um jogo, ${childName}! 🔬`}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          {!activeGame ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <p className="text-xs text-emerald-300/50 font-medium text-center mb-1">
                Escolha um jogo para começar!
              </p>

              <div className="grid grid-cols-2 gap-3">
                {GAMES.map((game) => {
                  const locked = game.premium && !isPremium;
                  return (
                    <motion.button
                      key={game.id}
                      onClick={() => handleGameSelect(game.id)}
                      className={`relative rounded-2xl p-4 flex flex-col items-center gap-1.5 border transition-all ${
                        locked
                          ? "border-white/5 opacity-70"
                          : "border-white/10 hover:border-white/20"
                      }`}
                      style={{ background: locked ? "rgba(255,255,255,0.03)" : game.bgColor }}
                      whileTap={locked ? undefined : { scale: 0.95 }}
                    >
                      <span className="text-3xl" style={{ filter: locked ? "blur(2px)" : "none" }}>
                        {game.emoji}
                      </span>
                      <span className="text-xs font-bold text-white/80">{game.label}</span>
                      <span className="text-[9px] text-white/40 font-semibold leading-tight">{game.sub}</span>
                      {locked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/20">
                          <Lock size={18} className="text-white/40" />
                          <span className="text-[8px] text-white/30 font-bold mt-1">Premium</span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Stats bar */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-white/40">
                  <Flame size={14} className="text-orange-400" />
                  <span className="text-xs font-bold">{profile?.streak_days ?? 0} dias</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/40">
                  <Trophy size={14} className="text-yellow-400" />
                  <span className="text-xs font-bold">{profile?.points ?? 0} pts</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeGame}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              {activeGame === "word" && (
                <WordSearchGame onScore={handleScore} onReaction={handleReaction} />
              )}
              {activeGame === "memory" && (
                <MemoryGame onScore={handleScore} onReaction={handleReaction} />
              )}
              {activeGame === "hangman" && (
                <HangmanGame onScore={handleScore} onReaction={handleReaction} />
              )}
              {activeGame === "daily" && (
                <DailyChallengeGame
                  onScore={handleScore}
                  onReaction={handleReaction}
                  isPremium={isPremium}
                />
              )}
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
              className="mx-6 p-6 rounded-3xl border border-emerald-400/30 text-center"
              style={{ background: "linear-gradient(160deg, #064E3B, #0F766E)" }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-5xl mb-3"
                animate={{ rotate: [0, -10, 10, 0], y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎮
              </motion.div>
              <h3 className="text-lg font-bold text-white mb-2">
                Desbloqueie todos os jogos
              </h3>
              <p className="text-sm text-emerald-200/50 mb-4">
                Desafios diários, jogos avançados e diversão sem limites!
              </p>
              <motion.button
                className="w-full py-3 rounded-2xl font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg, #10B981, #3B82F6)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPremiumCTA(false)}
              >
                Desbloquear todos os jogos 🎮✨
              </motion.button>
              <button
                className="mt-3 text-xs text-white/30"
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

export default KidzzPlay;

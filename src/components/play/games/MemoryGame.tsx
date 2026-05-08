import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "@/contexts/AuthContext";
import GameResultScreen from "./GameResultScreen";
import { neon, glow, gameGradient } from "@/lib/gameTheme";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";

// Bigger, themed nature sets — animals, plants, ocean
const EMOJI_SETS: { theme: string; emojis: string[]; gradient: string; glow: string }[] = [
  {
    theme: "🌳 Floresta",
    emojis: ["🦊", "🦉", "🐿️", "🦔", "🐝", "🦋"],
    gradient: `linear-gradient(135deg, ${neon.lime}, ${neon.cyan})`,
    glow: "hsl(140 80% 55% / 0.55)",
  },
  {
    theme: "🌊 Oceano",
    emojis: ["🐢", "🐬", "🐠", "🦈", "🐙", "🦀"],
    gradient: `linear-gradient(135deg, ${neon.cyan}, ${neon.violet})`,
    glow: "hsl(190 95% 60% / 0.55)",
  },
  {
    theme: "🌸 Jardim",
    emojis: ["🌻", "🌷", "🌹", "🌺", "🌼", "🍄"],
    gradient: `linear-gradient(135deg, ${neon.magenta}, ${neon.violet})`,
    glow: "hsl(320 90% 65% / 0.55)",
  },
];

interface Props {
  onScore: (pts: number) => void;
  onReaction: (type: "happy" | "encourage") => void;
  onOpenAchievements?: () => void;
  onHome?: () => void;
}

const MemoryGame = ({ onScore, onReaction, onOpenAchievements, onHome }: Props) => {
  const { profile } = useAuth();
  const childName = profile?.child_name || "amigo";
  const [setIdx, setSetIdx] = useState(() => Math.floor(Math.random() * EMOJI_SETS.length));
  const set = EMOJI_SETS[setIdx];
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [locked, setLocked] = useState(false);

  const initGame = useCallback(() => {
    const idx = Math.floor(Math.random() * EMOJI_SETS.length);
    setSetIdx(idx);
    const pairs = [...EMOJI_SETS[idx].emojis, ...EMOJI_SETS[idx].emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    setCards(pairs);
    setFlippedIds([]);
    setMoves(0);
    setCompleted(false);
    setLocked(false);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  const handleFlip = (id: number) => {
    if (locked || completed) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;
    sfx("click");
    haptic("light");

    const newCards = cards.map((c) => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [a, b] = newFlipped;
      if (newCards[a].emoji === newCards[b].emoji) {
        setTimeout(() => {
          const matched = newCards.map((c) =>
            c.id === a || c.id === b ? { ...c, matched: true } : c
          );
          setCards(matched);
          setFlippedIds([]);
          setLocked(false);
          onScore(15);
          onReaction("happy");
          sfx("reward");
          haptic("success");
          if (matched.every((c) => c.matched)) {
            setCompleted(true);
            onScore(30);
            sfx("complete");
            haptic("success");
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.5 },
              colors: ["#A78BFA", "#F472B6", "#FBBF24", "#34D399"],
            });
          }
        }, 450);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === a || c.id === b ? { ...c, flipped: false } : c
            )
          );
          setFlippedIds([]);
          setLocked(false);
          onReaction("encourage");
          sfx("error");
          haptic("light");
        }, 850);
      }
    }
  };

  if (completed) {
    const totalPairs = cards.length / 2;
    const stars: 1 | 2 | 3 =
      moves <= totalPairs + 2 ? 3 : moves <= totalPairs + 5 ? 2 : 1;
    const xp = 30 + (stars === 3 ? 20 : stars === 2 ? 10 : 0);
    const efficiency = Math.max(0, Math.min(100, Math.round((totalPairs / Math.max(1, moves)) * 100)));
    return (
      <GameResultScreen
        correct={totalPairs}
        total={0}
        starsOverride={stars}
        percentOverride={efficiency}
        xp={xp}
        childName={childName}
        activityLabel="Jogo da Memória"
        subtype="memory"
        subtitle={`Concluído em ${moves} jogadas`}
        onReplay={initGame}
        onOpenAchievements={onOpenAchievements ?? (() => {})}
        onHome={onHome ?? (() => {})}
      />
    );
  }

  const matchedCount = cards.filter((c) => c.matched).length / 2;
  const totalPairs = cards.length / 2;

  return (
    <div className="flex flex-col items-center gap-4 px-2 pb-2">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div className="bg-white/75 border border-white/60 rounded-2xl px-3 py-1.5 shadow-sm">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Tema</div>
          <div className="text-sm font-extrabold text-gray-800">{set.theme}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/75 border border-white/60 rounded-2xl px-3 py-1.5 shadow-sm text-center">
            <div className="text-[10px] font-bold text-gray-500">JOGADAS</div>
            <div className="text-sm font-extrabold text-gray-800">{moves}</div>
          </div>
          <div className="bg-white/75 border border-white/60 rounded-2xl px-3 py-1.5 shadow-sm text-center">
            <div className="text-[10px] font-bold text-gray-500">PARES</div>
            <div className="text-sm font-extrabold text-emerald-600">{matchedCount}/{totalPairs}</div>
          </div>
        </div>
      </div>

      {/* Grid: bigger cards w/ depth, fluid for any screen */}
      <div
        className="grid grid-cols-3 w-full mx-auto"
        style={{
          maxWidth: "min(96vw, 420px)",
          gap: "clamp(8px, 2.5vw, 14px)",
        }}
      >
        {cards.map((card) => {
          const revealed = card.flipped || card.matched;
          return (
            <motion.button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              className="relative aspect-square rounded-2xl overflow-hidden"
              style={{
                perspective: 800,
              }}
              whileTap={{ scale: 0.92 }}
              animate={card.matched ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: revealed ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
              >
                {/* Back */}
                <div
                  className="absolute inset-0 rounded-2xl flex items-center justify-center border"
                  style={{
                    background: set.gradient,
                    borderColor: "rgba(255,255,255,0.35)",
                    boxShadow: `0 6px 18px ${set.glow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    backfaceVisibility: "hidden",
                  }}
                >
                  <div className="text-3xl opacity-90 drop-shadow">✨</div>
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none opacity-30"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4), transparent 60%)",
                    }}
                  />
                </div>
                {/* Front */}
                <div
                  className="absolute inset-0 rounded-2xl flex items-center justify-center"
                  style={{
                    background: card.matched
                      ? "linear-gradient(135deg, hsl(140 70% 92%), hsl(150 75% 80%))"
                      : "linear-gradient(135deg, #ffffff, hsl(45 80% 92%))",
                    border: card.matched
                      ? "2px solid hsl(145 70% 50%)"
                      : "2px solid rgba(255,255,255,0.7)",
                    boxShadow: card.matched
                      ? "0 6px 22px rgba(74,222,128,0.55), inset 0 1px 0 rgba(255,255,255,0.5)"
                      : "0 4px 14px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
                    transform: "rotateY(180deg)",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <span
                    className="text-5xl"
                    style={{
                      filter: card.matched
                        ? "drop-shadow(0 2px 6px rgba(34,197,94,0.4))"
                        : "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
                    }}
                  >
                    {card.emoji}
                  </span>
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MemoryGame;

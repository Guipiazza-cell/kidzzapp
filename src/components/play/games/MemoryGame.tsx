import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import GameResultScreen from "./GameResultScreen";

const EMOJI_SETS = [
  ["🌟", "🦋", "🌈", "🎈", "🌻", "🍀"],
  ["🐱", "🐶", "🐰", "🦊", "🐼", "🐸"],
  ["🍎", "🍊", "🍋", "🍇", "🍓", "🫐"],
];

interface Props {
  onScore: (pts: number) => void;
  onReaction: (type: "happy" | "encourage") => void;
  onOpenAchievements?: () => void;
  onHome?: () => void;
}

const MemoryGame = ({ onScore, onReaction }: Props) => {
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [locked, setLocked] = useState(false);

  const initGame = useCallback(() => {
    const set = EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)];
    const pairs = [...set, ...set]
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
          if (matched.every((c) => c.matched)) {
            setCompleted(true);
            onScore(30);
          }
        }, 400);
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
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-4 text-xs text-white/50 font-bold">
        <span>Jogadas: {moves}</span>
        <span>Pares: {cards.filter((c) => c.matched).length / 2}/{cards.length / 2}</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className={`w-16 h-16 rounded-xl text-2xl flex items-center justify-center font-bold border transition-all ${
              card.matched
                ? "bg-emerald-500/20 border-emerald-400/30"
                : card.flipped
                ? "bg-sky-500/20 border-sky-400/40"
                : "bg-white/5 border-white/10"
            }`}
            whileTap={{ scale: 0.9 }}
            animate={card.matched ? { scale: [1, 1.1, 1] } : {}}
          >
            {card.flipped || card.matched ? card.emoji : "❓"}
          </motion.button>
        ))}
      </div>

      {completed && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-lg font-bold text-emerald-300">Incrível! 🧠✨</p>
          <p className="text-xs text-white/40">Em {moves} jogadas</p>
          <motion.button
            onClick={initGame}
            className="mt-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-bold"
            whileTap={{ scale: 0.95 }}
          >
            Jogar novamente
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default MemoryGame;

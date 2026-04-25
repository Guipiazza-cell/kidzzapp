import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import GameResultScreen from "./GameResultScreen";

const WORD_SETS = [
  { words: ["SOL", "LUA", "MAR", "CÉU"], gridSize: 6, theme: "Natureza 🌿" },
  { words: ["PAZ", "LUZ", "BEM", "DOM"], gridSize: 6, theme: "Boas Palavras ✨" },
  { words: ["AMOR", "VIDA", "FLOR", "RIO"], gridSize: 7, theme: "Mundo Lindo 🌍" },
];

const LETTERS = "ABCDEFGHIJLMNOPQRSTUVXZ";

function buildGrid(words: string[], size: number): string[][] {
  const grid: string[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => "")
  );

  for (const word of words) {
    let placed = false;
    for (let attempt = 0; attempt < 50 && !placed; attempt++) {
      const dir = Math.random() > 0.5 ? "h" : "v";
      const maxR = dir === "v" ? size - word.length : size - 1;
      const maxC = dir === "h" ? size - word.length : size - 1;
      const r = Math.floor(Math.random() * (maxR + 1));
      const c = Math.floor(Math.random() * (maxC + 1));

      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const cr = dir === "v" ? r + i : r;
        const cc = dir === "h" ? c + i : c;
        if (grid[cr][cc] !== "" && grid[cr][cc] !== word[i]) {
          canPlace = false;
          break;
        }
      }
      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const cr = dir === "v" ? r + i : r;
          const cc = dir === "h" ? c + i : c;
          grid[cr][cc] = word[i];
        }
        placed = true;
      }
    }
  }

  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (grid[r][c] === "")
        grid[r][c] = LETTERS[Math.floor(Math.random() * LETTERS.length)];

  return grid;
}

interface Props {
  onScore: (pts: number) => void;
  onReaction: (type: "happy" | "encourage") => void;
}

const WordSearchGame = ({ onScore, onReaction }: Props) => {
  const [setIdx, setSetIdx] = useState(() => Math.floor(Math.random() * WORD_SETS.length));
  const wordSet = WORD_SETS[setIdx];
  const [grid, setGrid] = useState<string[][]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const resetGame = useCallback(() => {
    const idx = Math.floor(Math.random() * WORD_SETS.length);
    setSetIdx(idx);
    setGrid(buildGrid(WORD_SETS[idx].words, WORD_SETS[idx].gridSize));
    setSelected([]);
    setFound([]);
    setCompleted(false);
  }, []);

  useEffect(() => {
    setGrid(buildGrid(wordSet.words, wordSet.gridSize));
  }, []);

  const cellKey = (r: number, c: number) => `${r}-${c}`;

  const handleCellClick = (r: number, c: number) => {
    if (completed) return;
    const key = cellKey(r, c);
    const newSel = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    setSelected(newSel);

    const selWord = newSel
      .map((k) => {
        const [rr, cc] = k.split("-").map(Number);
        return grid[rr][cc];
      })
      .join("");

    const match = wordSet.words.find(
      (w) => w === selWord || w === selWord.split("").reverse().join("")
    );
    if (match && !found.includes(match)) {
      const newFound = [...found, match];
      setFound(newFound);
      setSelected([]);
      onScore(10);
      onReaction("happy");
      if (newFound.length === wordSet.words.length) {
        setCompleted(true);
        onScore(25);
      }
    }
  };

  if (!grid.length) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-bold text-emerald-300/70">{wordSet.theme}</p>

      {/* Words to find */}
      <div className="flex flex-wrap gap-2 justify-center">
        {wordSet.words.map((w) => (
          <span
            key={w}
            className={`text-xs font-bold px-2 py-1 rounded-lg transition-all ${
              found.includes(w)
                ? "bg-emerald-500/30 text-emerald-300 line-through"
                : "bg-white/10 text-white/60"
            }`}
          >
            {w}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${wordSet.gridSize}, 1fr)`,
        }}
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const key = cellKey(r, c);
            const isSel = selected.includes(key);
            const isFound = found.some((w) => {
              // simplified check
              return false; // visual only via line-through on word list
            });
            return (
              <motion.button
                key={key}
                onClick={() => handleCellClick(r, c)}
                className={`w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-all border ${
                  isSel
                    ? "bg-emerald-500/30 border-emerald-400/50 text-white"
                    : "bg-white/5 border-white/10 text-white/70"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {letter}
              </motion.button>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {completed && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-lg font-bold text-emerald-300">
              Parabéns! 🎉
            </p>
            <motion.button
              onClick={resetGame}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-bold"
              whileTap={{ scale: 0.95 }}
            >
              Jogar novamente
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordSearchGame;

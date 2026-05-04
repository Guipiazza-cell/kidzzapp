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
  onOpenAchievements?: () => void;
  onHome?: () => void;
}

const WordSearchGame = ({ onScore, onReaction, onOpenAchievements, onHome }: Props) => {
  const { profile } = useAuth();
  const childName = profile?.child_name || "amigo";
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

  if (completed) {
    return (
      <GameResultScreen
        correct={found.length}
        total={wordSet.words.length}
        xp={25 + found.length * 10}
        childName={childName}
        activityLabel="Caça-Palavras"
        subtype="word-search"
        subtitle={`Encontrou todas as ${wordSet.words.length} palavras`}
        onReplay={resetGame}
        onOpenAchievements={onOpenAchievements ?? (() => {})}
        onHome={onHome ?? (() => {})}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 px-2 pb-2">
      <div
        className="px-4 py-1.5 rounded-full border border-emerald-300/40 shadow-sm"
        style={{
          background: "linear-gradient(135deg, hsl(150 60% 92%), hsl(165 70% 85%))",
        }}
      >
        <p className="text-xs font-extrabold text-emerald-700">{wordSet.theme}</p>
      </div>

      {/* Words to find */}
      <div className="flex flex-wrap gap-2 justify-center">
        {wordSet.words.map((w) => (
          <span
            key={w}
            className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border transition-all shadow-sm ${
              found.includes(w)
                ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white border-emerald-300 line-through"
                : "bg-white/80 text-gray-700 border-white/60"
            }`}
            style={
              found.includes(w)
                ? { boxShadow: "0 4px 12px rgba(34,197,94,0.45)" }
                : undefined
            }
          >
            {w}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div
        className="grid gap-1.5 p-3 rounded-2xl border border-white/60 shadow-xl"
        style={{
          gridTemplateColumns: `repeat(${wordSet.gridSize}, 1fr)`,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(220,252,231,0.7))",
        }}
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const key = cellKey(r, c);
            const isSel = selected.includes(key);
            return (
              <motion.button
                key={key}
                onClick={() => handleCellClick(r, c)}
                className="w-10 h-10 rounded-xl text-base font-extrabold flex items-center justify-center border transition-all"
                style={{
                  background: isSel
                    ? "linear-gradient(135deg, hsl(145 70% 50%), hsl(160 70% 40%))"
                    : "linear-gradient(135deg, #ffffff, hsl(150 30% 95%))",
                  borderColor: isSel ? "hsl(145 70% 45%)" : "rgba(255,255,255,0.9)",
                  color: isSel ? "white" : "hsl(150 30% 25%)",
                  boxShadow: isSel
                    ? "0 4px 12px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.4)"
                    : "0 2px 5px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
                }}
                whileTap={{ scale: 0.88 }}
                animate={isSel ? { scale: [1, 1.08, 1] } : {}}
              >
                {letter}
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WordSearchGame;

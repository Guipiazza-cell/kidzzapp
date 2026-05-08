import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useAuth } from "@/contexts/AuthContext";
import GameResultScreen from "./GameResultScreen";
import { neon, glow } from "@/lib/gameTheme";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";

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

interface FoundLine {
  word: string;
  cells: string[];
}

const WordSearchGame = ({ onScore, onReaction, onOpenAchievements, onHome }: Props) => {
  const { profile } = useAuth();
  const childName = profile?.child_name || "amigo";
  const [setIdx, setSetIdx] = useState(() => Math.floor(Math.random() * WORD_SETS.length));
  const wordSet = WORD_SETS[setIdx];
  const [grid, setGrid] = useState<string[][]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [foundLines, setFoundLines] = useState<FoundLine[]>([]);
  const [completed, setCompleted] = useState(false);
  const [flashWord, setFlashWord] = useState<string | null>(null);
  const dragging = useRef(false);
  const lastCell = useRef<string | null>(null);

  const resetGame = useCallback(() => {
    const idx = Math.floor(Math.random() * WORD_SETS.length);
    setSetIdx(idx);
    setGrid(buildGrid(WORD_SETS[idx].words, WORD_SETS[idx].gridSize));
    setSelected([]);
    setFound([]);
    setFoundLines([]);
    setCompleted(false);
  }, []);

  useEffect(() => {
    setGrid(buildGrid(wordSet.words, wordSet.gridSize));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cellKey = (r: number, c: number) => `${r}-${c}`;

  const tryMatch = useCallback(
    (sel: string[]) => {
      const selWord = sel
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
        setFoundLines((prev) => [...prev, { word: match, cells: [...sel] }]);
        setFlashWord(match);
        setTimeout(() => setFlashWord(null), 700);
        setSelected([]);
        onScore(10);
        onReaction("happy");
        sfx("reward");
        haptic("success");
        // soft completion burst
        confetti({
          particleCount: 30,
          spread: 50,
          startVelocity: 28,
          origin: { y: 0.55 },
          colors: ["#10B981", "#FBBF24", "#fff"],
          scalar: 0.7,
        });
        if (newFound.length === wordSet.words.length) {
          setCompleted(true);
          onScore(25);
          sfx("complete");
          haptic("success");
          confetti({
            particleCount: 140,
            spread: 90,
            origin: { y: 0.5 },
            colors: ["#10B981", "#A78BFA", "#FBBF24", "#F472B6"],
          });
        }
        return true;
      }
      return false;
    },
    [grid, wordSet.words, found, onScore, onReaction]
  );

  // Drag selection — collinear cells only (h/v) for clean lines
  const startSelection = (r: number, c: number) => {
    if (completed) return;
    dragging.current = true;
    const key = cellKey(r, c);
    lastCell.current = key;
    setSelected([key]);
    sfx("click");
    haptic("light");
  };

  const extendSelection = (r: number, c: number) => {
    if (!dragging.current || completed) return;
    const key = cellKey(r, c);
    if (key === lastCell.current) return;
    if (selected.includes(key)) return;

    // Enforce straight line from origin
    if (selected.length >= 1) {
      const [r0, c0] = selected[0].split("-").map(Number);
      const sameRow = r === r0;
      const sameCol = c === c0;
      if (!sameRow && !sameCol) return;
      // require contiguous
      const last = selected[selected.length - 1];
      const [lr, lc] = last.split("-").map(Number);
      if (Math.abs(r - lr) + Math.abs(c - lc) !== 1) return;
    }
    lastCell.current = key;
    const next = [...selected, key];
    setSelected(next);
    haptic("light");
    tryMatch(next);
  };

  const endSelection = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (selected.length > 0 && !tryMatch(selected)) {
      // gentle reset
      setTimeout(() => setSelected([]), 180);
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

  // Helper: which finalized lines contain a cell?
  const lineForCell = (key: string) => foundLines.find((l) => l.cells.includes(key));

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
        {wordSet.words.map((w) => {
          const isFound = found.includes(w);
          const isFlashing = flashWord === w;
          return (
            <motion.span
              key={w}
              animate={isFlashing ? { scale: [1, 1.18, 1] } : {}}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border transition-all shadow-sm ${
                isFound
                  ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white border-emerald-300 line-through"
                  : "bg-white/80 text-gray-700 border-white/60"
              }`}
              style={
                isFound
                  ? { boxShadow: "0 4px 14px rgba(34,197,94,0.55)" }
                  : undefined
              }
            >
              {w}
            </motion.span>
          );
        })}
      </div>

      {/* Grid — pointer drag */}
      <div
        className="grid p-3 rounded-2xl border border-white/60 shadow-xl mx-auto select-none"
        style={{
          gridTemplateColumns: `repeat(${wordSet.gridSize}, 1fr)`,
          gap: "clamp(4px, 1.2vw, 8px)",
          maxWidth: "min(96vw, 420px)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(224,242,254,0.7))",
          touchAction: "none",
        }}
        onPointerLeave={endSelection}
        onPointerUp={endSelection}
        onPointerCancel={endSelection}
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const key = cellKey(r, c);
            const isSel = selected.includes(key);
            const finalLine = lineForCell(key);
            const isLocked = !!finalLine;
            return (
              <motion.button
                key={key}
                onPointerDown={(e) => {
                  e.preventDefault();
                  startSelection(r, c);
                }}
                onPointerEnter={() => extendSelection(r, c)}
                className="rounded-xl font-extrabold flex items-center justify-center border aspect-square relative"
                style={{
                  width: "100%",
                  fontSize: "clamp(13px, 3.6vw, 18px)",
                  background: isLocked
                    ? "linear-gradient(135deg, hsl(145 70% 80%), hsl(155 75% 65%))"
                    : isSel
                    ? `linear-gradient(135deg, ${neon.cyan}, ${neon.violet})`
                    : "linear-gradient(135deg, #ffffff, hsl(220 30% 96%))",
                  borderColor: isLocked
                    ? "hsl(145 70% 45%)"
                    : isSel
                    ? neon.cyan
                    : "rgba(255,255,255,0.9)",
                  color: isLocked || isSel ? "white" : "hsl(220 25% 25%)",
                  boxShadow: isLocked
                    ? "0 6px 16px hsl(145 70% 45% / 0.45), inset 0 1px 0 rgba(255,255,255,0.4)"
                    : isSel
                    ? glow.primary
                    : glow.soft,
                  transform: isSel ? "scale(1.06)" : "scale(1)",
                  transition: "transform 160ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms ease, background 200ms ease",
                  willChange: "transform",
                }}
                whileTap={{ scale: 0.94 }}
              >
                {letter}
                {isLocked && (
                  <motion.span
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    initial={{ opacity: 0.7, scale: 0.8 }}
                    animate={{ opacity: 0, scale: 1.4 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{
                      background:
                        "radial-gradient(circle, hsl(48 100% 70% / 0.55), transparent 70%)",
                    }}
                  />
                )}
              </motion.button>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {flashWord && (
          <motion.div
            key={flashWord}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="px-4 py-1.5 rounded-full bg-emerald-500/95 text-white text-xs font-black shadow-lg"
            style={{ boxShadow: "0 6px 18px hsl(140 75% 45% / 0.55)" }}
          >
            ✨ {flashWord} encontrada!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordSearchGame;

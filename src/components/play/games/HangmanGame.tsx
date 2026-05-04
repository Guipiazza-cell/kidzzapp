import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import GameResultScreen from "./GameResultScreen";

const POSITIVE_WORDS = [
  { word: "AMIZADE", hint: "Algo que nos faz sorrir quando estamos juntos" },
  { word: "CORAGEM", hint: "Quando fazemos algo mesmo com medo" },
  { word: "ALEGRIA", hint: "O que sentimos quando estamos felizes" },
  { word: "BONDADE", hint: "Fazer o bem sem esperar nada" },
  { word: "SONHO", hint: "O que imaginamos quando dormimos" },
  { word: "ESTRELA", hint: "Brilha no céu à noite" },
  { word: "ABRAÇO", hint: "Gesto de carinho com os braços" },
  { word: "SORRISO", hint: "Expressão de felicidade no rosto" },
];

const KEYBOARD = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX_ERRORS = 6;

interface Props {
  onScore: (pts: number) => void;
  onReaction: (type: "happy" | "encourage") => void;
  onOpenAchievements?: () => void;
  onHome?: () => void;
}

const HangmanGame = ({ onScore, onReaction, onOpenAchievements, onHome }: Props) => {
  const { profile } = useAuth();
  const childName = profile?.child_name || "amigo";
  const pickWord = () => POSITIVE_WORDS[Math.floor(Math.random() * POSITIVE_WORDS.length)];

  const [current, setCurrent] = useState(pickWord);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [errors, setErrors] = useState(0);

  const word = current.word;
  const won = word.split("").every((l) => guessed.includes(l));
  const lost = errors >= MAX_ERRORS;

  const handleGuess = (letter: string) => {
    if (guessed.includes(letter) || won || lost) return;
    const newGuessed = [...guessed, letter];
    setGuessed(newGuessed);

    if (word.includes(letter)) {
      onScore(5);
      onReaction("happy");
      // Check win
      if (word.split("").every((l) => newGuessed.includes(l))) {
        onScore(20);
      }
    } else {
      setErrors((e) => e + 1);
      onReaction("encourage");
    }
  };

  const reset = useCallback(() => {
    setCurrent(pickWord());
    setGuessed([]);
    setErrors(0);
  }, []);

  const hearts = MAX_ERRORS - errors;

  if (won || lost) {
    // Stars: 3 if won w/ all hearts, 2 if won, 1 if lost
    const stars: 1 | 2 | 3 = won ? (hearts >= MAX_ERRORS - 1 ? 3 : 2) : 1;
    const xp = won ? 25 + hearts * 2 : 5;
    return (
      <GameResultScreen
        correct={won ? 1 : 0}
        total={0}
        starsOverride={stars}
        percentOverride={won ? Math.round((hearts / MAX_ERRORS) * 100) : 0}
        xp={xp}
        childName={childName}
        activityLabel="Forca"
        subtype="hangman"
        subtitle={won ? `Acertou "${word}" com ${hearts}/${MAX_ERRORS} ❤` : `A palavra era "${word}"`}
        onReplay={reset}
        onOpenAchievements={onOpenAchievements ?? (() => {})}
        onHome={onHome ?? (() => {})}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 px-2 pb-2">
      {/* Hearts */}
      <div className="flex gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-white/60 shadow-sm">
        {Array.from({ length: MAX_ERRORS }).map((_, i) => (
          <motion.span
            key={i}
            className="text-xl"
            style={{
              filter:
                i < hearts
                  ? "drop-shadow(0 0 6px rgba(244,63,94,0.6))"
                  : "grayscale(1) opacity(0.4)",
            }}
            animate={i >= hearts ? { scale: 0, opacity: 0 } : { scale: 1 }}
          >
            {i < hearts ? "❤️" : "🤍"}
          </motion.span>
        ))}
      </div>

      {/* Hint card */}
      <div
        className="w-full rounded-2xl px-4 py-3 border border-white/60 shadow-sm text-center"
        style={{
          background:
            "linear-gradient(135deg, hsl(200 80% 92%), hsl(220 70% 88%))",
        }}
      >
        <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700/70 mb-0.5">
          💡 Dica
        </p>
        <p className="text-sm font-extrabold text-gray-800 leading-snug">{current.hint}</p>
      </div>

      {/* Word display */}
      <div className="flex gap-2 justify-center flex-wrap">
        {word.split("").map((letter, i) => {
          const revealed = guessed.includes(letter);
          return (
            <motion.div
              key={i}
              className="w-10 h-12 rounded-xl flex items-center justify-center text-xl font-black border-2"
              style={{
                background: revealed
                  ? "linear-gradient(135deg, hsl(145 70% 55%), hsl(160 70% 45%))"
                  : "rgba(255,255,255,0.85)",
                borderColor: revealed ? "hsl(145 70% 50%)" : "rgba(255,255,255,0.7)",
                color: revealed ? "white" : "hsl(220 20% 30%)",
                boxShadow: revealed
                  ? "0 6px 18px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.4)"
                  : "0 3px 8px rgba(0,0,0,0.1), inset 0 -2px 0 rgba(0,0,0,0.05)",
              }}
              animate={revealed ? { scale: [0.8, 1.15, 1] } : {}}
            >
              {revealed || lost ? letter : "_"}
            </motion.div>
          );
        })}
      </div>

      {/* Keyboard */}
      <div className="flex flex-wrap gap-1.5 justify-center max-w-[330px]">
        {KEYBOARD.map((letter) => {
          const isGuessed = guessed.includes(letter);
          const isCorrect = isGuessed && word.includes(letter);
          const isWrong = isGuessed && !word.includes(letter);
          return (
            <motion.button
              key={letter}
              onClick={() => handleGuess(letter)}
              disabled={isGuessed || won || lost}
              className="w-9 h-10 rounded-xl text-sm font-extrabold flex items-center justify-center border transition-all"
              style={{
                background: isCorrect
                  ? "linear-gradient(135deg, hsl(145 70% 55%), hsl(160 70% 45%))"
                  : isWrong
                  ? "linear-gradient(135deg, hsl(0 60% 80%), hsl(15 60% 75%))"
                  : "linear-gradient(135deg, #ffffff, hsl(220 20% 95%))",
                borderColor: isCorrect
                  ? "hsl(145 70% 45%)"
                  : isWrong
                  ? "hsl(0 60% 70%)"
                  : "rgba(255,255,255,0.9)",
                color: isCorrect ? "white" : isWrong ? "hsl(0 50% 35%)" : "hsl(220 20% 30%)",
                opacity: isWrong ? 0.55 : 1,
                boxShadow: isCorrect
                  ? "0 3px 10px rgba(34,197,94,0.45)"
                  : "0 2px 5px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
              whileTap={!isGuessed ? { scale: 0.88 } : undefined}
            >
              {letter}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default HangmanGame;

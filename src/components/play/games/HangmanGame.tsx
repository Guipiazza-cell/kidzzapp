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

const HangmanGame = ({ onScore, onReaction }: Props) => {
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

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hearts */}
      <div className="flex gap-1">
        {Array.from({ length: MAX_ERRORS }).map((_, i) => (
          <motion.span
            key={i}
            className="text-lg"
            animate={i >= hearts ? { scale: 0, opacity: 0 } : { scale: 1 }}
          >
            {i < hearts ? "💚" : "🤍"}
          </motion.span>
        ))}
      </div>

      {/* Hint */}
      <p className="text-xs text-sky-300/60 text-center font-medium px-4">
        💡 {current.hint}
      </p>

      {/* Word display */}
      <div className="flex gap-1.5 justify-center flex-wrap">
        {word.split("").map((letter, i) => (
          <motion.div
            key={i}
            className={`w-9 h-11 rounded-lg flex items-center justify-center text-lg font-bold border ${
              guessed.includes(letter)
                ? "bg-emerald-500/20 border-emerald-400/40 text-white"
                : "bg-white/5 border-white/15 text-transparent"
            }`}
            animate={guessed.includes(letter) ? { scale: [0.8, 1.1, 1] } : {}}
          >
            {guessed.includes(letter) || lost ? letter : "_"}
          </motion.div>
        ))}
      </div>

      {/* Keyboard */}
      <div className="flex flex-wrap gap-1 justify-center max-w-[300px]">
        {KEYBOARD.map((letter) => {
          const isGuessed = guessed.includes(letter);
          const isCorrect = isGuessed && word.includes(letter);
          const isWrong = isGuessed && !word.includes(letter);
          return (
            <motion.button
              key={letter}
              onClick={() => handleGuess(letter)}
              disabled={isGuessed || won || lost}
              className={`w-8 h-9 rounded-lg text-xs font-bold flex items-center justify-center border transition-all ${
                isCorrect
                  ? "bg-emerald-500/30 border-emerald-400/40 text-emerald-300"
                  : isWrong
                  ? "bg-red-500/10 border-red-400/20 text-red-300/40"
                  : "bg-white/5 border-white/10 text-white/60"
              }`}
              whileTap={!isGuessed ? { scale: 0.85 } : undefined}
            >
              {letter}
            </motion.button>
          );
        })}
      </div>

      {/* Result */}
      <AnimatePresence>
        {(won || lost) && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-lg font-bold">
              {won ? (
                <span className="text-emerald-300">Acertou! 🎉</span>
              ) : (
                <span className="text-sky-300">
                  A palavra era: <span className="text-white">{word}</span> 💪
                </span>
              )}
            </p>
            <p className="text-[10px] text-white/30 mt-1">
              {won ? "Você é demais!" : "Tente de novo, você consegue!"}
            </p>
            <motion.button
              onClick={reset}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-bold"
              whileTap={{ scale: 0.95 }}
            >
              Nova palavra
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HangmanGame;

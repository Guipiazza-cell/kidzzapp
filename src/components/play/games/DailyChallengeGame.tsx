import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import GameResultScreen from "./GameResultScreen";

interface Challenge {
  type: "quiz" | "emoji" | "math";
  question: string;
  options: string[];
  correct: number;
}

const CHALLENGES: Challenge[] = [
  { type: "quiz", question: "Qual planeta é chamado de planeta vermelho?", options: ["Júpiter", "Marte", "Vênus", "Saturno"], correct: 1 },
  { type: "quiz", question: "Qual é o maior oceano do mundo?", options: ["Atlântico", "Índico", "Pacífico", "Ártico"], correct: 2 },
  { type: "emoji", question: "Que animal é esse? 🐘", options: ["Girafa", "Elefante", "Hipopótamo", "Rinoceronte"], correct: 1 },
  { type: "emoji", question: "Que fruta é essa? 🍌", options: ["Maçã", "Laranja", "Banana", "Uva"], correct: 2 },
  { type: "math", question: "Quanto é 7 + 5?", options: ["10", "11", "12", "13"], correct: 2 },
  { type: "math", question: "Quanto é 3 × 4?", options: ["7", "10", "12", "15"], correct: 2 },
  { type: "quiz", question: "Qual animal é o mais rápido?", options: ["Leão", "Águia", "Guepardo", "Cavalo"], correct: 2 },
  { type: "quiz", question: "De onde vem o chocolate?", options: ["Café", "Cacau", "Canela", "Caramelo"], correct: 1 },
];

interface Props {
  onScore: (pts: number) => void;
  onReaction: (type: "happy" | "encourage") => void;
  isPremium: boolean;
  onOpenAchievements?: () => void;
  onHome?: () => void;
}

const DailyChallengeGame = ({ onScore, onReaction, isPremium, onOpenAchievements, onHome }: Props) => {
  const { profile } = useAuth();
  const childName = profile?.child_name || "amigo";
  const today = new Date().toDateString();
  const dailyIdx = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < today.length; i++) hash = ((hash << 5) - hash + today.charCodeAt(i)) | 0;
    return Math.abs(hash) % CHALLENGES.length;
  }, [today]);

  const [questionIdx, setQuestionIdx] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const questions = useMemo(() => {
    const shuffled = [...CHALLENGES];
    // Start from daily index and pick 3
    const picks: Challenge[] = [];
    for (let i = 0; i < 3; i++) {
      picks.push(shuffled[(dailyIdx + i) % shuffled.length]);
    }
    return picks;
  }, [dailyIdx]);

  const current = questions[questionIdx];
  const isFinished = totalAnswered >= questions.length;

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);

    if (idx === current.correct) {
      onScore(20);
      onReaction("happy");
      setScore((s) => s + 1);
    } else {
      onReaction("encourage");
    }

    setTimeout(() => {
      setAnswered(null);
      setTotalAnswered((t) => t + 1);
      if (questionIdx < questions.length - 1) {
        setQuestionIdx((i) => i + 1);
      }
    }, 1200);
  };

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <motion.div
          className="text-5xl"
          animate={{ rotate: [0, -10, 10, 0], y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎯
        </motion.div>
        <p className="text-sm font-bold text-white/70 text-center">
          Desafios diários exclusivos
        </p>
        <p className="text-xs text-white/40 text-center max-w-[240px]">
          Todo dia um novo desafio especial para testar seus conhecimentos!
        </p>
        <motion.button
          className="px-6 py-3 rounded-2xl font-bold text-white text-sm"
          style={{ background: "linear-gradient(135deg, #10B981, #3B82F6)" }}
          whileTap={{ scale: 0.95 }}
        >
          Desbloquear desafios 🎮✨
        </motion.button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <motion.div
        className="flex flex-col items-center gap-3 py-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <span className="text-4xl">🏆</span>
        <p className="text-lg font-bold text-emerald-300">Desafio completo!</p>
        <p className="text-sm text-white/50">
          {score}/{questions.length} acertos
        </p>
        <p className="text-xs text-white/30">Volte amanhã para um novo desafio!</p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < totalAnswered
                ? "bg-emerald-400"
                : i === questionIdx
                ? "bg-sky-400"
                : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={questionIdx}
          className="w-full"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
        >
          <p className="text-center text-white/80 font-bold text-sm mb-4 px-2">
            {current.question}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {current.options.map((opt, i) => {
              let style = "bg-white/5 border-white/10 text-white/70";
              if (answered !== null) {
                if (i === current.correct)
                  style = "bg-emerald-500/30 border-emerald-400/50 text-emerald-300";
                else if (i === answered)
                  style = "bg-orange-500/20 border-orange-400/30 text-orange-300";
              }
              return (
                <motion.button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className={`p-3 rounded-xl text-sm font-bold border transition-all ${style}`}
                  whileTap={answered === null ? { scale: 0.93 } : undefined}
                >
                  {opt}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DailyChallengeGame;

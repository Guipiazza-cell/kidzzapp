import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import GameResultScreen from "./GameResultScreen";
import { neon, glow, gameGradient } from "@/lib/gameTheme";

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
        <div className="text-5xl">🎯</div>
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

  const handleReplay = () => {
    setQuestionIdx(0);
    setAnswered(null);
    setScore(0);
    setTotalAnswered(0);
  };

  if (isFinished) {
    // XP earned this round = 20 per correct (matches onScore awards above)
    const xpEarned = score * 20;
    return (
      <GameResultScreen
        correct={score}
        total={questions.length}
        xp={xpEarned}
        childName={childName}
        activityLabel="Desafio Diário"
        onReplay={handleReplay}
        onOpenAchievements={onOpenAchievements ?? (() => {})}
        onHome={onHome ?? (() => {})}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 px-2 pb-2">
      <div className="flex gap-2">
        {questions.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: 12,
              height: 12,
              background:
                i < totalAnswered
                  ? neon.lime
                  : i === questionIdx
                  ? neon.cyan
                  : "rgba(255,255,255,0.18)",
              boxShadow:
                i === questionIdx
                  ? `0 0 12px ${neon.cyan}`
                  : i < totalAnswered
                  ? `0 0 8px ${neon.lime}`
                  : undefined,
            }}
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
          <div
            className="rounded-2xl px-4 py-3 mb-4 border border-white/50 shadow-md text-center"
            style={{ background: gameGradient.primary, boxShadow: glow.primary }}
          >
            <p className="text-white font-extrabold text-base leading-snug">
              {current.question}
            </p>
          </div>

          <div className="grid grid-cols-2" style={{ gap: "clamp(8px, 2.5vw, 12px)" }}>
            {current.options.map((opt, i) => {
              const isCorrectAnswered = answered !== null && i === current.correct;
              const isWrongAnswered = answered === i && i !== current.correct;
              return (
                <motion.button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className="rounded-2xl text-sm font-extrabold border transition-all flex items-center justify-center"
                  style={{
                    minHeight: "clamp(52px, 12vw, 64px)",
                    padding: "12px",
                    background: isCorrectAnswered
                      ? gameGradient.success
                      : isWrongAnswered
                      ? gameGradient.error
                      : "rgba(255,255,255,0.85)",
                    borderColor: isCorrectAnswered
                      ? neon.lime
                      : isWrongAnswered
                      ? neon.rose
                      : "rgba(255,255,255,0.6)",
                    color: isCorrectAnswered || isWrongAnswered ? "white" : "hsl(220 25% 25%)",
                    boxShadow: isCorrectAnswered
                      ? glow.success
                      : isWrongAnswered
                      ? glow.error
                      : glow.soft,
                  }}
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

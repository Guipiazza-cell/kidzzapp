import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import GameResultScreen from "./GameResultScreen";

interface Props {
  onScore: (pts: number) => void;
  onReaction: (type: "happy" | "encourage") => void;
  onOpenAchievements?: () => void;
  onHome?: () => void;
}

type Emotion = {
  id: string;
  emoji: string;
  label: string;
  scenario: string;
};

const POOL: Emotion[] = [
  { id: "feliz", emoji: "😄", label: "Feliz", scenario: "Quando ganhamos um abraço gostoso…" },
  { id: "triste", emoji: "😢", label: "Triste", scenario: "Quando perdemos algo que a gente amava…" },
  { id: "bravo", emoji: "😠", label: "Bravo", scenario: "Quando tiram nosso brinquedo sem pedir…" },
  { id: "medo", emoji: "😨", label: "Com medo", scenario: "Quando ouvimos um barulho estranho à noite…" },
  { id: "surpreso", emoji: "😲", label: "Surpreso", scenario: "Quando vemos algo inesperado e legal…" },
  { id: "amor", emoji: "🥰", label: "Com amor", scenario: "Quando alguém da família cuida da gente…" },
  { id: "curioso", emoji: "🤔", label: "Curioso", scenario: "Quando vemos algo que queremos descobrir…" },
  { id: "calmo", emoji: "😌", label: "Calmo", scenario: "Quando respiramos fundo e ficamos quietinhos…" },
];

const ROUNDS = 6;

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const EmotionsGame = ({ onScore, onReaction, onOpenAchievements, onHome }: Props) => {
  const { profile } = useAuth();
  const childName = profile?.child_name || "amigo";

  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"ok" | "miss" | null>(null);
  const [done, setDone] = useState(false);

  const sequence = useMemo(() => shuffle(POOL).slice(0, ROUNDS), []);
  const current = sequence[round];

  const options = useMemo(() => {
    if (!current) return [];
    const distractors = shuffle(POOL.filter((p) => p.id !== current.id)).slice(0, 3);
    return shuffle([current, ...distractors]);
  }, [current]);

  const handlePick = useCallback(
    (id: string) => {
      if (picked) return;
      setPicked(id);
      const isOk = id === current.id;
      if (isOk) {
        setCorrect((c) => c + 1);
        setFeedback("ok");
        onReaction("happy");
        onScore(15);
      } else {
        setFeedback("miss");
        onReaction("encourage");
        onScore(3);
      }
      setTimeout(() => {
        setPicked(null);
        setFeedback(null);
        if (round + 1 >= ROUNDS) {
          setDone(true);
        } else {
          setRound((r) => r + 1);
        }
      }, 1100);
    },
    [picked, current, round, onScore, onReaction]
  );

  if (done) {
    const xp = correct * 15 + (ROUNDS - correct) * 3;
    return (
      <GameResultScreen
        correct={correct}
        total={ROUNDS}
        xp={xp}
        childName={childName}
        activityLabel="Mundo das Emoções"
        subtype="emotions"
        onReplay={() => {
          setRound(0);
          setCorrect(0);
          setPicked(null);
          setFeedback(null);
          setDone(false);
        }}
        onOpenAchievements={() => onOpenAchievements?.()}
        onHome={() => onHome?.()}
      />
    );
  }

  return (
    <div className="px-2 pb-4">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="text-xs font-extrabold text-gray-700">
          {round + 1}/{ROUNDS}
        </div>
        <div className="text-[11px] font-extrabold text-emerald-700 bg-white/70 px-2.5 py-1 rounded-xl border border-white/50">
          Acertos: {correct}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="rounded-3xl p-5 mb-4 text-center border border-white/50 shadow-xl"
          style={{
            background:
              "linear-gradient(135deg, hsl(280 60% 65%), hsl(310 60% 55%))",
          }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/80 mb-2">
            Como você se sentiria?
          </p>
          <p className="text-base font-extrabold text-white leading-snug">
            “{current.scenario}”
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isPicked = picked === opt.id;
          const isRight = opt.id === current.id;
          const showRight = picked && isRight;
          const showWrong = isPicked && !isRight;
          return (
            <motion.button
              key={opt.id}
              onClick={() => handlePick(opt.id)}
              disabled={!!picked}
              className="rounded-2xl p-3 flex flex-col items-center gap-1 border min-h-[100px] shadow-md"
              style={{
                background: showRight
                  ? "linear-gradient(135deg, hsl(140 70% 55%), hsl(155 65% 45%))"
                  : showWrong
                  ? "linear-gradient(135deg, hsl(0 75% 60%), hsl(15 75% 50%))"
                  : "rgba(255,255,255,0.78)",
                borderColor: "rgba(255,255,255,0.55)",
              }}
              whileTap={{ scale: 0.95 }}
              animate={
                showRight
                  ? { scale: [1, 1.08, 1] }
                  : showWrong
                  ? { x: [0, -6, 6, -4, 4, 0] }
                  : {}
              }
            >
              <span className="text-3xl">{opt.emoji}</span>
              <span
                className={`text-xs font-extrabold ${
                  showRight || showWrong ? "text-white" : "text-gray-700"
                }`}
              >
                {opt.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 text-center text-sm font-extrabold text-gray-700"
          >
            {feedback === "ok"
              ? `Boa, ${childName}! 💚`
              : "Tudo bem sentir diferente — vamos de novo!"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmotionsGame;

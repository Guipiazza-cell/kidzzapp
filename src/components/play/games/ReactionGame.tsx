import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Zap } from "lucide-react";
import GameResultScreen from "./GameResultScreen";
import { neon, glow } from "@/lib/gameTheme";

interface Props {
  onScore: (pts: number) => void;
  onReaction: (type: "happy" | "encourage") => void;
  onOpenAchievements?: () => void;
  onHome?: () => void;
}

type Phase = "intro" | "waiting" | "go" | "tooSoon" | "result" | "done";

const ROUNDS = 5;

const ReactionGame = ({ onScore, onReaction, onOpenAchievements, onHome }: Props) => {
  const { profile } = useAuth();
  const childName = profile?.child_name || "amigo";

  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const startedAt = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRound = useCallback(() => {
    setPhase("waiting");
    const delay = 900 + Math.random() * 2200;
    timerRef.current = window.setTimeout(() => {
      startedAt.current = performance.now();
      setPhase("go");
    }, delay);
  }, []);

  useEffect(() => () => clearTimer(), []);

  const handleTap = () => {
    if (phase === "intro") {
      setRound(0);
      setTimes([]);
      startRound();
      return;
    }
    if (phase === "waiting") {
      clearTimer();
      setPhase("tooSoon");
      onReaction("encourage");
      return;
    }
    if (phase === "go") {
      const ms = Math.round(performance.now() - startedAt.current);
      setLastMs(ms);
      const newTimes = [...times, ms];
      setTimes(newTimes);
      if (ms < 350) onReaction("happy");
      else onReaction("encourage");
      // XP scaled by reaction time (faster = more)
      const pts = Math.max(2, Math.round(20 - ms / 30));
      onScore(pts);

      if (newTimes.length >= ROUNDS) {
        setPhase("done");
      } else {
        setPhase("result");
      }
      return;
    }
    if (phase === "result" || phase === "tooSoon") {
      setRound((r) => r + 1);
      startRound();
      return;
    }
  };

  if (phase === "done") {
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const stars: 1 | 2 | 3 = avg < 320 ? 3 : avg < 500 ? 2 : 1;
    const xp = Math.max(15, Math.round(80 - avg / 10));
    return (
      <GameResultScreen
        correct={ROUNDS}
        total={0}
        xp={xp}
        childName={childName}
        activityLabel="Reação Rápida"
        subtype="reaction"
        starsOverride={stars}
        subtitle={`Tempo médio: ${avg}ms`}
        onReplay={() => {
          setRound(0);
          setTimes([]);
          setLastMs(null);
          setPhase("intro");
        }}
        onOpenAchievements={() => onOpenAchievements?.()}
        onHome={() => onHome?.()}
      />
    );
  }

  const bg =
    phase === "go"
      ? `linear-gradient(135deg, ${neon.lime}, hsl(160 75% 40%))`
      : phase === "waiting"
      ? `linear-gradient(135deg, ${neon.rose}, ${neon.magenta})`
      : phase === "tooSoon"
      ? `linear-gradient(135deg, ${neon.gold}, hsl(28 95% 55%))`
      : `linear-gradient(135deg, ${neon.cyan}, ${neon.violet})`;

  const title =
    phase === "intro"
      ? "Toque para começar"
      : phase === "waiting"
      ? "Espere o verde…"
      : phase === "go"
      ? "TOQUE AGORA!"
      : phase === "tooSoon"
      ? "Cedo demais! Calma 💚"
      : `${lastMs}ms`;

  const sub =
    phase === "intro"
      ? `${ROUNDS} rodadas, ${childName}!`
      : phase === "result"
      ? "Toque para a próxima"
      : phase === "tooSoon"
      ? "Toque para tentar de novo"
      : phase === "waiting"
      ? "Não toque ainda…"
      : phase === "go"
      ? "Rápido! 🚀"
      : "";

  return (
    <div className="px-2 pb-4">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="text-xs font-extrabold text-gray-700">
          Rodada {Math.min(times.length + 1, ROUNDS)}/{ROUNDS}
        </div>
        <div className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-xl border border-white/50">
          <Zap size={12} className="text-amber-500" />
          <span className="text-[11px] font-extrabold text-gray-700">
            {times.length > 0 ? `${Math.min(...times)}ms` : "—"}
          </span>
        </div>
      </div>

      <motion.button
        onClick={handleTap}
        className="w-full rounded-3xl border border-white/50 shadow-xl flex flex-col items-center justify-center text-white"
        style={{ background: bg, height: "clamp(280px, 55vh, 400px)" }}
        whileTap={{ scale: 0.97 }}
        animate={{
          boxShadow:
            phase === "go"
              ? glow.success + ", 0 0 50px hsl(140 80% 60% / 0.7)"
              : phase === "waiting"
              ? glow.error
              : "0 10px 30px rgba(0,0,0,0.18)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={phase + title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-2 px-6 text-center"
          >
            <div className="text-5xl">
              {phase === "go" ? "⚡" : phase === "waiting" ? "🛑" : phase === "tooSoon" ? "⏰" : phase === "result" ? "✨" : "🎯"}
            </div>
            <h2 className="text-2xl font-black drop-shadow">{title}</h2>
            {sub && <p className="text-sm font-bold text-white/90">{sub}</p>}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {times.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {times.map((t, i) => (
            <span
              key={i}
              className="text-[11px] font-extrabold px-2 py-1 rounded-lg bg-white/70 text-gray-700 border border-white/50"
            >
              {t}ms
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReactionGame;

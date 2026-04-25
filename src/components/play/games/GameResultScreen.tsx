import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { haptic } from "@/lib/haptics";

interface Props {
  /** Number of correct answers (or main score for endless games) */
  correct: number;
  /** Total questions in the round. Pass 0 for endless/score-based games. */
  total: number;
  /** XP awarded for this run */
  xp: number;
  childName: string;
  /** Friendly label for the activity (e.g. "Desafio Diário") */
  activityLabel?: string;
  /** Used in Memories metadata + persistence key. */
  subtype?: string;
  /** Override stars (1-3) when total=0 (endless games). */
  starsOverride?: 1 | 2 | 3;
  /** Override the percent shown in the ring (0-100). Defaults to correct/total. */
  percentOverride?: number;
  /** Custom detail line below stars. Defaults to "X de Y acertos". */
  subtitle?: string;
  onReplay: () => void;
  onOpenAchievements: () => void;
  onHome: () => void;
}

// ── Web Audio: simple synthesized tones (no external assets) ──────────────
const playVictoryTone = () => {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.28);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch { /* noop */ }
};

const playEncouragementTone = () => {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 392.0; // G4
    const start = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.15, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.65);
    setTimeout(() => ctx.close(), 900);
  } catch { /* noop */ }
};

// ── Animated SVG progress ring ─────────────────────────────────────────────
const ProgressRing = ({ percent }: { percent: number }) => {
  const size = 140;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 1000;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimated(eased * percent);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [percent]);

  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="transparent"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="transparent"
        stroke="url(#ringGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * animated) / 100}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="28"
        fontWeight="900"
        fill="white"
        fontFamily="'Nunito', system-ui, sans-serif"
      >
        {Math.round(animated)}%
      </text>
    </svg>
  );
};

// ── Stars ─────────────────────────────────────────────────────────────────
const StarsRow = ({ count }: { count: number }) => (
  <div className="flex gap-2 justify-center">
    {[0, 1, 2].map((i) => {
      const earned = i < count;
      return (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -45, opacity: 0 }}
          animate={
            earned
              ? { scale: [0, 1.4, 1], rotate: 0, opacity: 1 }
              : { scale: 1, opacity: 0.25 }
          }
          transition={{
            delay: i * 0.2,
            duration: 0.45,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          style={{ fontSize: 36, lineHeight: 1, display: "inline-block" }}
          aria-label={earned ? "estrela conquistada" : "estrela bloqueada"}
        >
          {earned ? "⭐" : "☆"}
        </motion.span>
      );
    })}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────
const GameResultScreen = ({
  correct,
  total,
  xp,
  childName,
  activityLabel = "Desafio Diário",
  subtype = "daily-challenge",
  starsOverride,
  percentOverride,
  subtitle,
  onReplay,
  onOpenAchievements,
  onHome,
}: Props) => {
  const { user } = useAuth();
  const persisted = useRef(false);

  const computedPercent =
    typeof percentOverride === "number"
      ? Math.max(0, Math.min(100, Math.round(percentOverride)))
      : total > 0
      ? Math.round((correct / total) * 100)
      : 0;

  const stars: 1 | 2 | 3 =
    starsOverride ?? (computedPercent >= 80 ? 3 : computedPercent >= 50 ? 2 : 1);

  const tone: "high" | "mid" | "low" =
    stars === 3 ? "high" : stars === 2 ? "mid" : "low";

  const headline = useMemo(() => {
    if (tone === "high") return { text: `INCRÍVEL, ${childName}! 🌟`, color: "#FFD700", size: 36 };
    if (tone === "mid") return { text: `Muito bem, ${childName}! 💪`, color: "#FF8C00", size: 36 };
    return { text: `Continue tentando, ${childName}! 🦎`, color: "#7C3AED", size: 32 };
  }, [tone, childName]);

  // Sound + persistence (runs once on mount)
  useEffect(() => {
    if (tone === "high") playVictoryTone();
    else playEncouragementTone();

    if (persisted.current || !user) return;
    persisted.current = true;
    const detail =
      subtitle ?? (total > 0 ? `${childName} acertou ${correct} de ${total} (${computedPercent}%)` : `${childName} fez ${correct} pontos`);
    supabase
      .from("memories")
      .insert({
        user_id: user.id,
        type: "achievement",
        title: `${activityLabel} concluído`,
        content: detail,
        is_special: tone === "high",
        metadata: {
          kind: "game",
          subtype,
          correct,
          total,
          percent: computedPercent,
          stars,
          xp,
        },
      })
      .then(() => { /* fire-and-forget */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-5 py-6 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Mascot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1] }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative"
      >
        <motion.div
          animate={
            tone === "high"
              ? { rotate: [-10, 10, -10] }
              : { y: [0, -6, 0] }
          }
          transition={{
            duration: tone === "high" ? 0.6 : 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ fontSize: 88, lineHeight: 1, display: "inline-block" }}
          aria-label="KIDZZ"
        >
          🦎
        </motion.div>
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          fontFamily: "'Nunito', system-ui, sans-serif",
          fontWeight: 900,
          fontSize: headline.size,
          color: headline.color,
          textAlign: "center",
          letterSpacing: 0.5,
          textShadow: "0 2px 8px rgba(0,0,0,0.35)",
          lineHeight: 1.1,
        }}
      >
        {headline.text}
      </motion.h2>

      {/* Progress ring + XP */}
      <div className="relative">
        <ProgressRing percent={computedPercent} />
        <AnimatePresence>
          <motion.span
            key="xp"
            className="absolute -top-2 right-0 font-black text-emerald-300"
            style={{ fontSize: 18, textShadow: "0 0 10px rgba(16,185,129,0.6)" }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], y: [0, -28, -40, -56] }}
            transition={{ duration: 2.2, ease: "easeOut" }}
          >
            +{xp} XP
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Stars */}
      <StarsRow count={stars} />

      {/* Detail line */}
      <p className="text-sm text-white/60">
        {subtitle ?? (total > 0 ? `${correct} de ${total} acertos` : `${correct} pontos`)}
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
        <motion.button
          onClick={() => { haptic("medium"); onReplay(); }}
          whileTap={{ scale: 0.96 }}
          className="px-5 py-3 rounded-2xl font-extrabold text-white text-sm shadow-lg min-h-[48px]"
          style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
        >
          Jogar de novo 🔄
        </motion.button>
        <motion.button
          onClick={() => { haptic("light"); onOpenAchievements(); }}
          whileTap={{ scale: 0.96 }}
          className="px-5 py-3 rounded-2xl font-extrabold text-sm border-2 border-white/30 text-white/90 min-h-[48px] backdrop-blur-md bg-white/5"
        >
          Ver conquistas 🏆
        </motion.button>
        <motion.button
          onClick={() => { haptic("light"); onHome(); }}
          whileTap={{ scale: 0.96 }}
          className="px-5 py-2 rounded-2xl font-bold text-sm text-white/60 min-h-[40px]"
        >
          Voltar ao início 🏠
        </motion.button>
      </div>
    </motion.div>
  );
};

export default GameResultScreen;

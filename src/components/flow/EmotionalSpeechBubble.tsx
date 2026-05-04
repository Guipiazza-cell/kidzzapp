import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { readEmotionalSignal, type EmotionalSignal } from "@/lib/emotionalState";
import { getMission } from "@/lib/dailyMission";

interface Props {
  childName: string;
  streakDays: number;
}

/**
 * Bolha de fala emocional do KIDZZ.
 * Lê estado local (streak, XP do dia, level-up recente, inatividade)
 * e mostra uma frase contextual curta. Atualiza ao receber level-up.
 */
const EmotionalSpeechBubble = ({ childName, streakDays }: Props) => {
  const [signal, setSignal] = useState<EmotionalSignal>(() =>
    readEmotionalSignal({
      childName,
      streakDays,
      dailyXp: hasDailyAction() ? 1 : 0,
    })
  );

  useEffect(() => {
    const refresh = () =>
      setSignal(
        readEmotionalSignal({
          childName,
          streakDays,
          dailyXp: hasDailyAction() ? 1 : 0,
        })
      );
    refresh();
    window.addEventListener("kidzz:level-up", refresh);
    const t = setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener("kidzz:level-up", refresh);
      clearInterval(t);
    };
  }, [childName, streakDays]);

  const tone = TONE_BY_MOOD[signal.mood];

  return (
    <div className="w-full flex justify-center -mt-2 mb-1 px-4 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={signal.mood + signal.speech}
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="rounded-full px-3.5 py-1.5 backdrop-blur-md border shadow-md flex items-center gap-1.5 max-w-[90%]"
          style={{
            background: tone.bg,
            borderColor: tone.border,
          }}
        >
          <span className="text-base leading-none">{signal.emoji}</span>
          <span
            className="text-[12px] font-extrabold leading-tight truncate"
            style={{ color: tone.text }}
          >
            {signal.speech}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

function hasDailyAction(): boolean {
  try {
    const m = getMission();
    return m.music || m.question || m.story;
  } catch {
    return false;
  }
}

const TONE_BY_MOOD: Record<
  EmotionalSignal["mood"],
  { bg: string; border: string; text: string }
> = {
  celebrate: {
    bg: "linear-gradient(135deg, hsl(45 95% 88% / 0.95), hsl(35 95% 80% / 0.95))",
    border: "hsl(45 90% 60% / 0.55)",
    text: "hsl(30 80% 30%)",
  },
  proud: {
    bg: "linear-gradient(135deg, hsl(15 90% 88% / 0.95), hsl(25 95% 82% / 0.95))",
    border: "hsl(20 85% 55% / 0.5)",
    text: "hsl(15 80% 32%)",
  },
  excited: {
    bg: "linear-gradient(135deg, hsl(140 70% 88% / 0.95), hsl(160 65% 82% / 0.95))",
    border: "hsl(145 65% 50% / 0.5)",
    text: "hsl(150 70% 25%)",
  },
  missed: {
    bg: "linear-gradient(135deg, hsl(320 70% 90% / 0.95), hsl(280 65% 88% / 0.95))",
    border: "hsl(310 60% 60% / 0.5)",
    text: "hsl(320 60% 30%)",
  },
  calm: {
    bg: "rgba(255,255,255,0.78)",
    border: "rgba(255,255,255,0.6)",
    text: "hsl(220 15% 25%)",
  },
};

export default EmotionalSpeechBubble;

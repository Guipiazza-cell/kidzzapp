import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import pixelImg from "@/assets/pixel-chameleon.webp";
import { getMilestoneProgress } from "@/lib/habitLoop";
import { triggerKidzzShare } from "@/components/viral/KidzzShareTrigger";

const SHARE_MILESTONES = new Set([3, 7, 14, 30]);

interface StreakEventDetail {
  streak: number;
  changed: boolean;
  isNewRecord: boolean;
  bestStreak: number;
}

interface Props {
  /** Initial streak (from profile) — overlay also listens for live updates. */
  streakDays: number;
  childName: string;
  previousRecord: number;
}

const StreakCelebration = ({ streakDays, childName, previousRecord }: Props) => {
  const [show, setShow] = useState(false);
  const [streak, setStreak] = useState(streakDays);
  const [isNewRecord, setIsNewRecord] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<StreakEventDetail>).detail;
      // Only celebrate when the streak actually advanced today and reached a milestone-worthy mark
      if (!detail || !detail.changed) return;
      if (detail.streak < 3) return;
      setStreak(detail.streak);
      setIsNewRecord(detail.isNewRecord || detail.streak > previousRecord);
      setShow(true);
      const t = setTimeout(() => setShow(false), detail.isNewRecord ? 2600 : 1800);
      // Auto-open share for milestone streaks (3, 7, 14, 30)
      if (SHARE_MILESTONES.has(detail.streak)) {
        const shareTimer = setTimeout(() => {
          triggerKidzzShare({
            title: `${detail.streak} dias seguidos! 🔥`,
            subtitle: `está há ${detail.streak} dias aprendendo com o Kidzz!`,
            emoji: detail.streak >= 30 ? "🏆" : detail.streak >= 14 ? "💛" : detail.streak >= 7 ? "🌟" : "🔥",
            category: "streak",
            streakDays: detail.streak,
            shareSlug: `streak-${detail.streak}`,
          });
        }, detail.isNewRecord ? 2800 : 2000);
        return () => { clearTimeout(t); clearTimeout(shareTimer); };
      }
      return () => clearTimeout(t);
    };
    window.addEventListener("kidzz:streak", handler);
    return () => window.removeEventListener("kidzz:streak", handler);
  }, [previousRecord]);

  if (!show) return null;

  const milestone = getMilestoneProgress(streak).previous;
  const confettiEmojis = ["🎉", "⭐", "✨", "🎊", "💫", "🌟"];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isNewRecord &&
            confettiEmojis.map((emoji, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl"
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 400,
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1.2, 1, 0.5],
                  rotate: Math.random() * 360,
                }}
                transition={{ duration: 2, delay: i * 0.1, ease: "easeOut" }}
              >
                {emoji}
              </motion.span>
            ))}

          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <motion.img
              src={pixelImg}
              alt="Pixel"
              className="w-24 h-24 object-contain drop-shadow-2xl"
              animate={{ rotate: [0, -8, 8, 0], y: [0, -10, 0] }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
            <motion.div
              className="bg-white/95 backdrop-blur-md rounded-2xl px-5 py-2.5 shadow-xl border border-amber-200/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm font-black text-amber-800 text-center">
                {isNewRecord
                  ? `🎉 Novo recorde! ${streak} dias com ${childName}!`
                  : milestone
                    ? `${milestone.emoji} ${milestone.title}! ${streak} dias com ${childName}`
                    : `👍 ${streak} dias seguidos com ${childName}!`}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreakCelebration;

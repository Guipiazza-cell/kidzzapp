import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import pixelImg from "@/assets/pixel-chameleon.webp";
import aneImg from "@/assets/ane-chameleon.webp";

const SURPRISE_STORAGE_KEY = "kidzz_weekly_surprise";

interface SurpriseReward {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: "rare_question" | "bonus_mission" | "explorer_mode" | "exclusive_story" | "surprise_badge";
}

const REWARDS: SurpriseReward[] = [
  {
    id: "rare_question",
    title: "Pergunta Rara",
    description: "Uma pergunta especial que aparece só 1x por semana!",
    emoji: "💎",
    type: "rare_question",
  },
  {
    id: "bonus_mission",
    title: "Missão Bônus",
    description: "Uma missão secreta de conexão familiar!",
    emoji: "🎯",
    type: "bonus_mission",
  },
  {
    id: "explorer_mode",
    title: "Modo Explorador",
    description: "2 horas sem limite de perguntas! Aproveite!",
    emoji: "🚀",
    type: "explorer_mode",
  },
  {
    id: "exclusive_story",
    title: "História Exclusiva",
    description: "Uma história temática especial só pra você!",
    emoji: "📖",
    type: "exclusive_story",
  },
  {
    id: "surprise_badge",
    title: "Badge Surpresa",
    description: "Uma conquista rara e secreta foi desbloqueada!",
    emoji: "🏅",
    type: "surprise_badge",
  },
];

function getWeekNumber(): number {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.floor(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
}

function getSurpriseState(): { week: number; opened: boolean; rewardIdx: number } | null {
  try {
    const raw = localStorage.getItem(SURPRISE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getWeeklyReward(): { reward: SurpriseReward; alreadyOpened: boolean } {
  const week = getWeekNumber();
  const state = getSurpriseState();

  if (state?.week === week) {
    return { reward: REWARDS[state.rewardIdx], alreadyOpened: state.opened };
  }

  // New week — pick a random reward
  const rewardIdx = Math.floor(Math.random() * REWARDS.length);
  localStorage.setItem(SURPRISE_STORAGE_KEY, JSON.stringify({ week, opened: false, rewardIdx }));
  return { reward: REWARDS[rewardIdx], alreadyOpened: false };
}

interface WeeklySurpriseBoxProps {
  childName: string;
  streakDays: number;
  onRewardClaimed?: (reward: SurpriseReward) => void;
}

const WeeklySurpriseBox = ({ childName, streakDays, onRewardClaimed }: WeeklySurpriseBoxProps) => {
  const [showBox, setShowBox] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [reward, setReward] = useState<SurpriseReward | null>(null);

  useEffect(() => {
    // Only show on Monday or if streak >= 3
    const today = new Date().getDay(); // 0=Sun, 1=Mon
    if (streakDays < 3) return;

    const { reward: weeklyReward, alreadyOpened } = getWeeklyReward();
    if (alreadyOpened) return;

    // Show with a small delay for drama
    const t = setTimeout(() => {
      setReward(weeklyReward);
      setShowBox(true);
    }, 2000);
    return () => clearTimeout(t);
  }, [streakDays]);

  const openBox = useCallback(() => {
    if (!reward) return;
    setShowReward(true);

    // Mark as opened
    const week = getWeekNumber();
    const state = getSurpriseState();
    if (state) {
      localStorage.setItem(SURPRISE_STORAGE_KEY, JSON.stringify({ ...state, opened: true }));
    }

    // Confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["#D4A847", "#F0C85A", "#E8A0B4", "#7C3AED", "#fff"],
      zIndex: 9999,
    });

    onRewardClaimed?.(reward);
  }, [reward, onRewardClaimed]);

  const dismiss = () => {
    setShowBox(false);
    setShowReward(false);
  };

  if (!showBox) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[85] flex items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />

        <motion.div
          className="relative z-10 w-full max-w-sm glass-card rounded-3xl p-6 text-center"
          initial={{ scale: 0.7, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          <motion.button
            onClick={dismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/10 text-gray-500"
            whileTap={{ scale: 0.9 }}
          >
            <X size={16} />
          </motion.button>

          {!showReward ? (
            // Box closed state
            <div className="space-y-4">
              <div className="flex justify-center gap-3">
                <motion.img
                  src={aneImg}
                  alt="Ane"
                  className="w-16 h-16 object-contain"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.img
                  src={pixelImg}
                  alt="Pixel"
                  className="w-16 h-16 object-contain"
                  style={{ filter: "brightness(1.15) drop-shadow(0 0 6px rgba(100,160,255,0.5))" }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                />
              </div>

              <motion.div
                animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-5xl">🎁</span>
              </motion.div>

              <h3 className="text-lg font-black text-gray-800">
                {childName}, sua surpresa semanal chegou!
              </h3>
              <p className="text-xs text-gray-500 font-semibold">
                {streakDays} dias de streak desbloquearam algo especial ✨
              </p>

              <motion.button
                onClick={openBox}
                className="w-full py-3.5 rounded-2xl kid-gradient-orange text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2"
                whileTap={{ scale: 0.95 }}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Gift size={18} />
                Abrir surpresa! 🎉
              </motion.button>
            </div>
          ) : (
            // Reward revealed
            <motion.div
              className="space-y-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.span
                className="text-6xl block"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: 1 }}
              >
                {reward?.emoji}
              </motion.span>

              <h3 className="text-xl font-black text-gray-800">
                {reward?.title}!
              </h3>
              <p className="text-sm text-gray-600 font-semibold">
                {reward?.description}
              </p>

              <div className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-kid-yellow/20 to-kid-orange/20 border border-kid-yellow/30 mx-auto w-fit">
                <Sparkles size={14} className="text-kid-orange" />
                <span className="text-sm font-black text-gray-800">+10 pontos bônus!</span>
              </div>

              <motion.button
                onClick={dismiss}
                className="w-full py-3.5 rounded-2xl kid-gradient-orange text-white font-extrabold text-sm shadow-lg"
                whileTap={{ scale: 0.95 }}
              >
                Incrível! Vamos lá! 🚀
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WeeklySurpriseBox;

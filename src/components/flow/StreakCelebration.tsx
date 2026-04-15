import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import pixelImg from "@/assets/pixel-chameleon.png";

interface Props {
  streakDays: number;
  childName: string;
  previousRecord: number;
}

const StreakCelebration = ({ streakDays, childName, previousRecord }: Props) => {
  const [show, setShow] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const isNewRecord = streakDays > previousRecord && streakDays >= 3;

  useEffect(() => {
    if (streakDays >= 3) {
      setShow(true);
      if (isNewRecord) setShowConfetti(true);
      const t = setTimeout(() => {
        setShow(false);
        setShowConfetti(false);
      }, isNewRecord ? 2500 : 1800);
      return () => clearTimeout(t);
    }
  }, []);

  if (!show) return null;

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
          {/* Confetti particles for new record */}
          {showConfetti && confettiEmojis.map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl pointer-events-none"
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 0,
              }}
              animate={{
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 400,
                opacity: [0, 1, 1, 0],
                scale: [0, 1.2, 1, 0.5],
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            >
              {emoji}
            </motion.span>
          ))}

          {/* Mascot thumbs up */}
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
                  ? `🎉 Novo recorde! ${streakDays} dias com ${childName}!`
                  : `👍 ${streakDays} dias seguidos! Incrível, ${childName}!`}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreakCelebration;

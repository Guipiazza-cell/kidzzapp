import { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Bookmark } from "lucide-react";
import confetti from "canvas-confetti";
import { getMascotDialogue } from "@/components/mascot/MascotDialogueSystem";
import { addXP, incrementDailyStreak } from "@/lib/habitLoop";
import pixelImg from "@/assets/pixel-chameleon.png";
import aneImg from "@/assets/ane-chameleon.png";

// Emotional, varied phrases — never repeat the same one twice in a row.
const EMOTIONAL_PHRASES = (name: string) => [
  `Isso foi incrível, ${name} 💛`,
  `Vocês estão criando algo especial ✨`,
  `Que momento lindo com ${name} 🌟`,
  `Mais uma memória pra guardar pra sempre 💫`,
  `${name} vai lembrar disso 💛`,
  `Sabedoria + amor = momento perfeito 🌈`,
];
const LAST_PHRASE_KEY = "kidzz_last_celebration_phrase";

interface CelebrationScreenProps {
  childName: string;
  pointsEarned?: number;
  streakDays?: number;
  interests?: string[];
  onContinue: () => void;
  onSave?: () => void;
  newAchievement?: { label: string; emoji: string } | null;
  type?: "answer" | "story" | "mission" | "game";
}

const CelebrationScreen = ({
  childName,
  pointsEarned = 1,
  streakDays = 0,
  interests,
  onContinue,
  onSave,
  newAchievement,
  type = "answer",
}: CelebrationScreenProps) => {
  const [mascotPhrase, setMascotPhrase] = useState("");
  const [showContent, setShowContent] = useState(false);

  const celebrate = useCallback((level: "normal" | "achievement") => {
    if (level === "achievement") {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#D4A847", "#F0C85A", "#fff", "#E8A0B4"],
        zIndex: 9999,
      });
    } else {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ["#D4A847", "#fff"],
        scalar: 0.8,
        zIndex: 9999,
      });
    }
  }, []);

  useEffect(() => {
    // 1. Pick a varied emotional phrase (never identical to previous one)
    const pool = EMOTIONAL_PHRASES(childName);
    const last = (() => {
      try { return localStorage.getItem(LAST_PHRASE_KEY); } catch { return null; }
    })();
    const candidates = pool.filter((p) => p !== last);
    const picked = candidates[Math.floor(Math.random() * candidates.length)] ?? pool[0];
    try { localStorage.setItem(LAST_PHRASE_KEY, picked); } catch { /* noop */ }
    setMascotPhrase(picked);

    // 2. Award XP locally (symbolic reward) and register today's visit.
    addXP(pointsEarned * 5);
    incrementDailyStreak();

    // 3. Animation timing
    const t1 = setTimeout(() => setShowContent(true), 400);
    const t2 = setTimeout(() => celebrate(newAchievement ? "achievement" : "normal"), 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const typeLabels = {
    answer: "sabedoria",
    story: "imaginação",
    mission: "conexão familiar",
    game: "diversão",
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <motion.div
        className="relative z-10 w-full max-w-sm flex flex-col items-center"
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.2 }}
      >
        {/* Golden particles background */}
        <div className="absolute inset-0 -m-8 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: "hsl(var(--kid-yellow))",
                top: `${15 + Math.random() * 70}%`,
                left: `${10 + Math.random() * 80}%`,
              }}
              animate={{
                y: [-10, -30, -10],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Mascots celebrating */}
        <div className="flex items-end gap-4 mb-4">
          <motion.img
            src={aneImg}
            alt="Ane"
            className="w-20 h-20 object-contain drop-shadow-xl"
            animate={{
              y: [0, -16, 0],
              rotate: [0, -8, 8, 0],
            }}
            transition={{ duration: 1.2, repeat: 2, ease: "easeInOut" }}
          />
          <motion.img
            src={pixelImg}
            alt="Pixel"
            className="w-20 h-20 object-contain"
            style={{
              filter: "brightness(1.15) drop-shadow(0 0 8px rgba(100,160,255,0.6))",
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -6, 0],
            }}
            transition={{ duration: 1.2, repeat: 2, ease: "easeInOut", delay: 0.15 }}
          />
        </div>

        <AnimatePresence>
          {showContent && (
            <motion.div
              className="w-full glass-card rounded-3xl p-6 text-center space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {/* Mascot speech */}
              <p className="text-sm font-bold text-gray-700 leading-relaxed">
                {mascotPhrase}
              </p>

              {/* XP Badge */}
              <motion.div
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-kid-yellow/20 to-kid-orange/20 border border-kid-yellow/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
              >
                <Sparkles size={14} className="text-kid-orange" />
                <span className="text-sm font-black text-gray-800">
                  +{pointsEarned} pontos de {typeLabels[type]}! ✨
                </span>
              </motion.div>

              {/* New achievement */}
              {newAchievement && (
                <motion.div
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-kid-purple/15 to-kid-pink/15 border border-kid-purple/20"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.6 }}
                >
                  <span className="text-2xl">{newAchievement.emoji}</span>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Nova conquista!</p>
                    <p className="text-xs font-black text-gray-800">{newAchievement.label}</p>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <motion.button
                  onClick={onContinue}
                  className="w-full py-3.5 rounded-2xl kid-gradient-orange text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
                  whileTap={{ scale: 0.95 }}
                >
                  Explorar mais 🚀
                  <ArrowRight size={16} />
                </motion.button>

                {onSave && (
                  <motion.button
                    onClick={() => { onSave(); onContinue(); }}
                    className="w-full py-2.5 text-gray-500 text-xs font-bold flex items-center justify-center gap-1.5"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bookmark size={14} />
                    Salvar esta resposta nas Memórias 💛
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default CelebrationScreen;

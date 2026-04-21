/* ── KIDZZ Hero — personagem central da Home ──
   Mostra greeting contextual via memória + speech bubble live.
*/
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KidzzChameleon, { KidzzMood } from "./KidzzChameleon";
import { kidzzMemory, getContextualGreeting } from "./kidzzMemory";

interface Props {
  childName: string;
  streakDays?: number;
  ageRange?: string | null;
}

export default function KidzzHero({ childName, streakDays, ageRange }: Props) {
  const [greeting, setGreeting] = useState<{ text: string; mood: KidzzMood }>({
    text: `Oi, ${childName}!`,
    mood: "curious",
  });
  const [showBubble, setShowBubble] = useState(true);

  useEffect(() => {
    kidzzMemory.bumpVisit();
    kidzzMemory.remember({ childName, streakDays });
    kidzzMemory.markMet("cosmic");
    const g = getContextualGreeting({ childName, streakDays, ageRange });
    setGreeting({ text: g.text, mood: g.mood as KidzzMood });
  }, [childName, streakDays, ageRange]);

  // Bubble pulses on/off so the character feels alive
  useEffect(() => {
    const iv = setInterval(() => setShowBubble((s) => !s), 6000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex flex-col items-center mt-3 mb-2 relative">
      <AnimatePresence>
        {showBubble && (
          <motion.div
            key={greeting.text}
            className="glass-card rounded-2xl px-4 py-2 mb-2 max-w-[280px] shadow-lg border border-white/30"
            initial={{ opacity: 0, scale: 0.7, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 12 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
          >
            <p className="text-sm text-gray-800 font-bold text-center leading-tight">
              {greeting.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <KidzzChameleon
        state="cosmic"
        mood={greeting.mood}
        size="xl"
        showParticles
        interactive
      />

      <motion.h1
        className="text-xl font-black text-gray-800 text-center leading-tight mt-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Me pergunte qualquer coisa! ✨
      </motion.h1>
      <motion.p
        className="text-[11px] text-gray-500 font-semibold text-center mt-1 max-w-[220px] leading-tight"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Descubra respostas e crie conversas incríveis comigo 💛
      </motion.p>
    </div>
  );
}

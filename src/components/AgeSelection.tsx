import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";
import ChameleonMascot from "./ChameleonMascot";
import ParentalGate from "./ParentalGate";
import ParentalSettings from "./ParentalSettings";
import { useAuth } from "@/contexts/AuthContext";
import jungleBg from "@/assets/jungle-bg.jpg";

const AGE_OPTIONS = [
  { range: "0-3", emoji: "👶", label: "0 a 3 anos", desc: "Sons, cores e palavrinhas simples", color: "from-pink-400 to-rose-500" },
  { range: "3-7", emoji: "🧒", label: "3 a 7 anos", desc: "Historinhas e exemplos do dia a dia", color: "from-emerald-400 to-teal-500" },
  { range: "7-10", emoji: "🧑‍🎓", label: "7 a 10 anos", desc: "Curiosidades e desafios científicos", color: "from-blue-400 to-indigo-500" },
];

const AgeSelection = () => {
  const { profile, updateProfile } = useAuth();
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const childName = profile?.child_name || "Explorador";

  const handleSelectAge = async (range: string) => {
    setSelected(range);
    // Short delay for selection animation
    setTimeout(async () => {
      const updates: Record<string, string> = { age_range: range };
      if (!profile?.child_name) updates.child_name = "Explorador";
      await updateProfile(updates);
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${jungleBg})` }} />
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* Magical fireflies */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed rounded-full"
          style={{
            width: 3 + Math.random() * 3,
            height: 3 + Math.random() * 3,
            left: `${10 + i * 11}%`,
            top: `${15 + (i % 4) * 20}%`,
            background: "hsl(var(--kid-yellow))",
            boxShadow: `0 0 ${6 + i}px hsl(var(--kid-yellow) / 0.5)`,
          }}
          animate={{
            y: [0, -25, 10, 0],
            opacity: [0.2, 0.9, 0.3, 0.2],
          }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <ChameleonMascot size="lg" mood="curious" />
        </motion.div>

        <motion.h1
          className="text-3xl font-extrabold text-white text-center mt-3 drop-shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Olá, {childName}!
        </motion.h1>

        <motion.p
          className="text-white/80 text-center text-base mt-2 max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Qual a sua idade? Assim eu sei como conversar!
        </motion.p>

        <motion.div
          className="w-full max-w-sm mt-5 space-y-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {AGE_OPTIONS.map((opt, i) => (
            <motion.button
              key={opt.range}
              onClick={() => handleSelectAge(opt.range)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${opt.color} text-white shadow-xl transition-all active:scale-95 relative overflow-hidden ${
                selected === opt.range ? "ring-4 ring-white/50" : ""
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.15 }}
            >
              {/* Selection sparkle */}
              {selected === opt.range && (
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.4, 0] }}
                  transition={{ duration: 0.6 }}
                />
              )}
              <motion.span
                className="text-4xl"
                animate={selected === opt.range ? { scale: [1, 1.3, 1], rotate: [0, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                {opt.emoji}
              </motion.span>
              <div className="text-left">
                <p className="font-extrabold text-lg">{opt.label}</p>
                <p className="text-sm text-white/80">{opt.desc}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>

        <motion.button
          onClick={() => setShowParentalGate(true)}
          className="mt-6 flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Shield size={16} />
          Controle Parental
        </motion.button>
      </div>

      <AnimatePresence>
        {showParentalGate && (
          <ParentalGate
            onSuccess={() => { setShowParentalGate(false); setShowSettings(true); }}
            onCancel={() => setShowParentalGate(false)}
          />
        )}
        {showSettings && <ParentalSettings onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default AgeSelection;

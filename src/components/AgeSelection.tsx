import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check } from "lucide-react";
import KidzzChameleon from "./kidzz/KidzzChameleon";
import OnboardingProgress from "./onboarding/OnboardingProgress";
import ParentalGate from "./ParentalGate";
import ParentalSettings from "./ParentalSettings";
import { useAuth } from "@/contexts/AuthContext";
import MagicalBackground from "./MagicalBackground";

const AGE_OPTIONS = [
  { range: "0-3", emoji: "🧒", label: "3 – 5 anos", desc: "Respostas simples e carinhosas", accent: "from-emerald-400 to-teal-400" },
  { range: "3-7", emoji: "🎒", label: "6 – 8 anos", desc: "Histórias e exemplos do dia a dia", accent: "from-sky-400 to-blue-500" },
  { range: "7-10", emoji: "🧠", label: "9 – 12 anos", desc: "Curiosidades e desafios científicos", accent: "from-violet-400 to-purple-500" },
];

const AgeSelection = () => {
  const { updateProfile } = useAuth();
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelectAge = async (range: string) => {
    setSelected(range);
    setTimeout(async () => {
      await updateProfile({ age_range: range });
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[hsl(90,22%,87%)] via-[hsl(90,18%,92%)] to-[hsl(90,22%,87%)] relative">
      <MagicalBackground />

      <div className="relative z-20 pt-[max(env(safe-area-inset-top,16px),20px)] px-6">
        <OnboardingProgress step={2} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-2 pb-6 relative z-10">
        {/* KIDZZ HERO — atento */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <KidzzChameleon state="explorer" mood="curious" size="lg" interactive showParticles />
        </motion.div>

        <motion.h1
          className="text-2xl font-black text-gray-900 text-center mt-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Quantos anos você tem?
        </motion.h1>

        <motion.p
          className="text-gray-600 text-center text-sm mt-1 max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Eu adapto cada resposta para você 💛
        </motion.p>

        <motion.div
          className="w-full max-w-sm mt-6 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {AGE_OPTIONS.map((opt, i) => {
            const isSelected = selected === opt.range;
            return (
              <motion.button
                key={opt.range}
                onClick={() => handleSelectAge(opt.range)}
                className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all active:scale-[0.97] relative overflow-hidden min-h-[72px] ${
                  isSelected
                    ? "glass-card-light ring-2 ring-kid-orange/40"
                    : "glass-card"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.12 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${opt.accent} rounded-l-2xl`} />
                <span className="text-4xl">{opt.emoji}</span>
                <div className="text-left flex-1">
                  <p className="font-extrabold text-gray-900 text-lg">{opt.label}</p>
                  <p className="text-sm text-gray-600">{opt.desc}</p>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-7 h-7 rounded-full bg-kid-green flex items-center justify-center"
                  >
                    <Check size={16} className="text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        <motion.button
          onClick={() => setShowParentalGate(true)}
          className="mt-6 flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-xs font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Shield size={14} />
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

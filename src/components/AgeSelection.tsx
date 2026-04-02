import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check } from "lucide-react";
import ChameleonMascot from "./ChameleonMascot";
import ParentalGate from "./ParentalGate";
import ParentalSettings from "./ParentalSettings";
import { useAuth } from "@/contexts/AuthContext";

const AGE_OPTIONS = [
  { range: "0-3", emoji: "🧒", label: "3 – 5 anos", desc: "Respostas simples e carinhosas", accent: "from-emerald-400 to-teal-400" },
  { range: "3-7", emoji: "🎒", label: "6 – 8 anos", desc: "Histórias e exemplos do dia a dia", accent: "from-sky-400 to-blue-500" },
  { range: "7-10", emoji: "🧠", label: "9 – 12 anos", desc: "Curiosidades e desafios científicos", accent: "from-violet-400 to-purple-500" },
];

const AgeSelection = () => {
  const { profile, updateProfile } = useAuth();
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const childName = profile?.child_name || "Explorador";

  const handleSelectAge = async (range: string) => {
    setSelected(range);
    setTimeout(async () => {
      const updates: Record<string, string> = { age_range: range };
      if (!profile?.child_name) updates.child_name = "Explorador";
      await updateProfile(updates);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[hsl(220,25%,8%)] via-[hsl(220,20%,12%)] to-[hsl(220,25%,8%)]">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Mascot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <ChameleonMascot size="lg" mood="curious" />
        </motion.div>

        <motion.h1
          className="text-2xl font-black text-primary-foreground text-center mt-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Qual a idade do seu filho?
        </motion.h1>

        <motion.p
          className="text-primary-foreground/50 text-center text-sm mt-1 max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Assim a gente adapta cada resposta perfeitamente
        </motion.p>

        {/* Age cards */}
        <motion.div
          className="w-full max-w-sm mt-8 space-y-3"
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
                className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all active:scale-[0.97] relative overflow-hidden ${
                  isSelected
                    ? "glass-card-light ring-2 ring-primary-foreground/30"
                    : "glass-card"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.12 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${opt.accent} rounded-l-2xl`} />
                
                <span className="text-4xl">{opt.emoji}</span>
                <div className="text-left flex-1">
                  <p className="font-extrabold text-primary-foreground text-lg">{opt.label}</p>
                  <p className="text-sm text-primary-foreground/50">{opt.desc}</p>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-7 h-7 rounded-full bg-kid-green flex items-center justify-center"
                  >
                    <Check size={16} className="text-primary-foreground" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Parental control */}
        <motion.button
          onClick={() => setShowParentalGate(true)}
          className="mt-8 flex items-center gap-2 text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors text-xs font-bold"
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

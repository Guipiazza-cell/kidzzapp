import { useState } from "react";
import { motion } from "framer-motion";
import KidzzChameleon from "./kidzz/KidzzChameleon";
import OnboardingProgress from "./onboarding/OnboardingProgress";
import { useAuth } from "@/contexts/AuthContext";
import MagicalBackground from "./MagicalBackground";

const INTEREST_OPTIONS = [
  { id: "animais", label: "Animais", emoji: "🐾" },
  { id: "espaco", label: "Espaço", emoji: "🚀" },
  { id: "arte", label: "Arte", emoji: "🎨" },
  { id: "natureza", label: "Natureza", emoji: "🌿" },
  { id: "aventura", label: "Aventura", emoji: "⚔️" },
  { id: "musica", label: "Música", emoji: "🎵" },
  { id: "ciencia", label: "Ciência", emoji: "🔬" },
  { id: "oceano", label: "Oceano", emoji: "🌊" },
];

const InterestsOnboarding = () => {
  const { profile, updateProfile } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const childName = profile?.child_name || "amigo";

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0 || saving) return;
    setSaving(true);
    try {
      await updateProfile({ child_interests: selected } as any);
    } catch (e) {
      console.error("InterestsOnboarding error", e);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[hsl(90,24%,89%)] via-[hsl(90,20%,93%)] to-[hsl(90,24%,89%)] relative">
      <MagicalBackground />

      <div className="relative z-20 pt-[max(env(safe-area-inset-top,16px),20px)] px-6">
        <OnboardingProgress step={3} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-2 pb-6 relative z-10">
        {/* KIDZZ HERO — animado */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 12 }}
        >
          <KidzzChameleon state="music" mood="happy" size="lg" interactive showParticles />
        </motion.div>

        <motion.h1
          className="text-2xl font-black text-gray-900 text-center mt-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          O que você mais gosta, {childName}? 🌟
        </motion.h1>

        <motion.p
          className="text-gray-600 text-center text-sm mt-1.5 max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Escolha pelo menos 1 — pode escolher quantos quiser
        </motion.p>

        <div className="w-full max-w-sm mt-5 grid grid-cols-2 gap-3 relative z-20">
          {INTEREST_OPTIONS.map((opt, i) => {
            const isSelected = selected.includes(opt.id);
            return (
              <motion.button
                key={opt.id}
                type="button"
                onClick={() => toggle(opt.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 p-4 rounded-2xl transition-all border-2 min-h-[64px] ${
                  isSelected
                    ? "bg-white/90 border-kid-orange shadow-lg scale-[1.03]"
                    : "bg-white/60 border-transparent"
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-sm font-extrabold text-gray-900">
                  {opt.label}
                </span>
                {isSelected && (
                  <span className="ml-auto text-kid-orange font-bold">✓</span>
                )}
              </motion.button>
            );
          })}
        </div>

        <motion.button
          onClick={handleSubmit}
          disabled={selected.length === 0 || saving}
          className="w-full max-w-sm mt-6 py-5 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-yellow text-white font-extrabold text-lg shadow-xl disabled:opacity-40 active:scale-[0.98] transition-transform relative overflow-hidden min-h-[56px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-2xl"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="relative z-10">
            {saving ? "Salvando... ⏳" : selected.length > 0 ? `Vamos lá! 🚀` : "Escolha 1 ou mais"}
          </span>
        </motion.button>

        <motion.p
          className="text-gray-500 text-[10px] mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Você pode mudar isso depois nas configurações
        </motion.p>
      </div>
    </div>
  );
};

export default InterestsOnboarding;

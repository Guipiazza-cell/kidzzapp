import { motion } from "framer-motion";
import { Lock, Sparkles, Crown } from "lucide-react";
import chameleonBlue from "@/assets/chameleon-blue.webp";
import chameleonRed from "@/assets/chameleon-red.webp";
import chameleonDark from "@/assets/chameleon-main.webp";
import chameleonMain from "@/assets/chameleon-main.webp";
import type { SubscriptionTier } from "@/contexts/AuthContext";

interface PremiumCharactersProps {
  tier?: SubscriptionTier;
  onUnlockPress: () => void;
}

const characters = [
  { id: "main", name: "Kidzz", img: chameleonMain, color: "from-emerald-400 to-teal-500", minTier: "free" as const },
  { id: "blue", name: "Azulzz", img: chameleonBlue, color: "from-blue-400 to-indigo-500", minTier: "premium" as const },
  { id: "red", name: "Vermelzz", img: chameleonRed, color: "from-red-400 to-rose-500", minTier: "premium" as const },
  { id: "dark", name: "Sombrzz", img: chameleonDark, color: "from-purple-500 to-violet-700", minTier: "super_premium" as const },
];

const TIER_LEVEL: Record<string, number> = { free: 0, premium: 1, super_premium: 2 };

const PremiumCharacters = ({ tier = "free", onUnlockPress }: PremiumCharactersProps) => {
  const userLevel = TIER_LEVEL[tier] ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <Crown size={20} className="text-kid-yellow" />
        <h3 className="text-lg font-extrabold text-white">Personagens</h3>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {characters.map((char, i) => {
          const charLevel = TIER_LEVEL[char.minTier] ?? 0;
          const isUnlocked = userLevel >= charLevel;

          return (
            <motion.button
              key={char.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i, type: "spring" }}
              onClick={!isUnlocked ? onUnlockPress : undefined}
              className="relative flex flex-col items-center gap-1"
            >
              <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${char.color} p-0.5 shadow-lg ${
                !isUnlocked ? "opacity-60 grayscale-[30%]" : ""
              }`}>
                <img src={char.img} alt={char.name} className="w-full h-full object-cover rounded-2xl" />
                {!isUnlocked && (
                  <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                    <Lock size={18} className="text-white" />
                  </div>
                )}
                {isUnlocked && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-kid-green flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold">✓</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-white/80">{char.name}</span>
              {!isUnlocked && (
                <span className="text-[8px] font-bold text-kid-yellow/80">
                  {char.minTier === "super_premium" ? "Super" : "Premium"}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {userLevel < 2 && (
        <motion.button
          onClick={onUnlockPress}
          className="mt-4 w-full py-3 rounded-2xl kid-gradient-premium text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all active:scale-95"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Sparkles size={18} />
          {userLevel === 0 ? "Desbloquear personagens" : "Desbloquear todos"}
        </motion.button>
      )}
    </motion.div>
  );
};

export default PremiumCharacters;

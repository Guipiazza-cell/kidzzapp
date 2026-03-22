import { motion } from "framer-motion";
import { Lock, Sparkles, Crown } from "lucide-react";
import chameleonBlue from "@/assets/chameleon-blue.png";
import chameleonRed from "@/assets/chameleon-red.png";
import chameleonDark from "@/assets/chameleon-dark.png";
import chameleonMain from "@/assets/chameleon-main.jpeg";

interface PremiumCharactersProps {
  isPremium?: boolean;
  onUnlockPress: () => void;
}

const characters = [
  { id: "main", name: "Kidzz", img: chameleonMain, color: "from-emerald-400 to-teal-500", free: true },
  { id: "blue", name: "Azulzz", img: chameleonBlue, color: "from-blue-400 to-indigo-500", free: false },
  { id: "red", name: "Vermelzz", img: chameleonRed, color: "from-red-400 to-rose-500", free: false },
  { id: "dark", name: "Sombrzz", img: chameleonDark, color: "from-purple-500 to-violet-700", free: false },
];

const PremiumCharacters = ({ isPremium = false, onUnlockPress }: PremiumCharactersProps) => {
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
        {characters.map((char, i) => (
          <motion.button
            key={char.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i, type: "spring" }}
            onClick={!char.free && !isPremium ? onUnlockPress : undefined}
            className="relative flex flex-col items-center gap-1"
          >
            <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${char.color} p-0.5 shadow-lg ${
              !char.free && !isPremium ? "opacity-60 grayscale-[30%]" : ""
            }`}>
              <img
                src={char.img}
                alt={char.name}
                className="w-full h-full object-cover rounded-2xl"
              />
              {!char.free && !isPremium && (
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                  <Lock size={18} className="text-white" />
                </div>
              )}
              {char.free && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-kid-green flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">✓</span>
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold text-white/80">{char.name}</span>
          </motion.button>
        ))}
      </div>

      {!isPremium && (
        <motion.button
          onClick={onUnlockPress}
          className="mt-4 w-full py-3 rounded-2xl kid-gradient-premium text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all active:scale-95"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Sparkles size={18} />
          Desbloquear todos por R$ 14,99/mês
        </motion.button>
      )}
    </motion.div>
  );
};

export default PremiumCharacters;

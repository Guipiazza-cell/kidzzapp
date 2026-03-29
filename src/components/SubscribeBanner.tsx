import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";

interface SubscribeBannerProps {
  onOpenParentalGate: () => void;
  questionsRemaining: number;
  isPremium: boolean;
}

const SubscribeBanner = ({ onOpenParentalGate, questionsRemaining, isPremium }: SubscribeBannerProps) => {
  if (isPremium) return null;

  return (
    <motion.button
      onClick={onOpenParentalGate}
      className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-kid-purple/90 to-kid-pink/90 backdrop-blur-md text-white shadow-lg"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2">
        <Crown size={16} className="text-kid-yellow" />
        <span className="text-xs font-bold">
          {questionsRemaining > 0
            ? `${questionsRemaining} perguntas grátis restantes`
            : "Suas perguntas grátis acabaram"
          }
        </span>
      </div>
      <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
        <Sparkles size={12} />
        <span className="text-[11px] font-extrabold">Assinar</span>
      </div>
    </motion.button>
  );
};

export default SubscribeBanner;

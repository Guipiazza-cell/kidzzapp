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
      className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-purple-50/90 to-pink-50/90 border-b border-purple-200/40"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-2">
        <Crown size={14} className="text-kid-purple" />
        <span className="text-[11px] font-bold text-gray-600">
          {questionsRemaining > 0
            ? `${questionsRemaining} perguntas grátis restantes`
            : "Suas perguntas acabaram"
          }
        </span>
      </div>
      <div className="flex items-center gap-1 bg-gradient-to-r from-kid-purple to-kid-pink px-2.5 py-1 rounded-full shadow-sm">
        <Sparkles size={10} className="text-white" />
        <span className="text-[10px] font-extrabold text-white">Assinar</span>
      </div>
    </motion.button>
  );
};

export default SubscribeBanner;

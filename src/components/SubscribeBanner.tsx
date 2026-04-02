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
      className="w-full flex items-center justify-between px-4 py-2 bg-gradient-to-r from-kid-purple/20 to-kid-pink/20 text-primary-foreground border-b border-primary-foreground/5"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-2">
        <Crown size={14} className="text-kid-yellow" />
        <span className="text-[11px] font-bold text-primary-foreground/60">
          {questionsRemaining > 0
            ? `${questionsRemaining} perguntas grátis restantes`
            : "Suas perguntas acabaram"
          }
        </span>
      </div>
      <div className="flex items-center gap-1 bg-primary-foreground/10 px-2.5 py-1 rounded-full">
        <Sparkles size={10} />
        <span className="text-[10px] font-extrabold text-primary-foreground/70">Assinar</span>
      </div>
    </motion.button>
  );
};

export default SubscribeBanner;

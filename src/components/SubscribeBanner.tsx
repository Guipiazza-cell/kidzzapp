import { motion } from "framer-motion";
import { Crown, Sparkles, Star } from "lucide-react";

interface SubscribeBannerProps {
  onOpenParentalGate: () => void;
  questionsRemaining: number;
  isPremium: boolean;
}

const SubscribeBanner = ({ onOpenParentalGate, questionsRemaining, isPremium }: SubscribeBannerProps) => {
  if (isPremium) {
    return (
      <motion.button
        onClick={onOpenParentalGate}
        className="w-full flex items-center justify-between px-4 py-2 border-b border-emerald-200/30"
        style={{ background: "linear-gradient(90deg, rgba(34,197,94,0.08), rgba(16,185,129,0.06))" }}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-2">
          <Star size={13} className="text-emerald-500" />
          <span className="text-[11px] font-bold text-emerald-700">
            ⭐ KIDZZ Ativo · {questionsRemaining} perguntas
          </span>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={onOpenParentalGate}
      className="w-full flex items-center justify-between px-4 py-2.5 border-b border-amber-200/30"
      style={{ background: "linear-gradient(90deg, rgba(212,168,71,0.08), rgba(245,158,11,0.06))" }}
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-2">
        <Crown size={14} className="text-amber-600" />
        <span className="text-[11px] font-bold text-gray-600">
          {questionsRemaining > 0
            ? `${questionsRemaining} perguntas grátis restantes`
            : "Suas perguntas acabaram"
          }
        </span>
      </div>
      <div
        className="flex items-center gap-1 px-3 py-1 rounded-full shadow-sm"
        style={{ background: "linear-gradient(135deg, #D4A847, #F0C85A)" }}
      >
        <Sparkles size={10} className="text-white" />
        <span className="text-[10px] font-extrabold text-white">✨ Liberar Aventura</span>
      </div>
    </motion.button>
  );
};

export default SubscribeBanner;
import { motion } from "framer-motion";
import { Crown, Sparkles, Star } from "lucide-react";

interface SubscribeBannerProps {
  onOpenParentalGate: () => void;
  questionsRemaining: number;
  isPremium: boolean;
}

const openPlans = () => {
  window.dispatchEvent(new CustomEvent("kidzz:open-plans"));
};

const SubscribeBanner = ({ onOpenParentalGate, questionsRemaining, isPremium }: SubscribeBannerProps) => {
  if (isPremium) {
    return (
      <div className="flex items-center justify-between px-4 py-2 pointer-events-none">
        <motion.button
          onClick={onOpenParentalGate}
          className="glass-island flex items-center gap-2 px-3 py-1.5 pointer-events-auto font-ui"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
        >
          <Star size={13} className="text-emerald-500" />
          <span className="text-[11px] font-bold text-emerald-700">
            ⭐ KIDZZ Ativo · {questionsRemaining} perguntas
          </span>
        </motion.button>
      </div>
    );
  }

  const isLastFree = questionsRemaining === 1;
  const isOver = questionsRemaining <= 0;

  return (
    <div className="flex items-center justify-between px-4 py-2 pointer-events-none">
      {/* Ilha esquerda — status de perguntas */}
      <motion.div
        className="glass-island flex items-center gap-2 px-3 py-1.5 pointer-events-auto font-ui"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Crown size={14} className={isOver ? "text-rose-600" : "text-amber-600"} />
        <span className={`text-[11px] font-bold ${isOver ? "text-rose-700" : "text-gray-700"}`}>
          {isOver
            ? "🔒 Limite atingido"
            : isLastFree
            ? "⚠️ Última pergunta grátis!"
            : `${questionsRemaining} perguntas grátis restantes`}
        </span>
      </motion.div>

      {/* Ilha direita — CTA dourado */}
      <motion.button
        onClick={openPlans}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full shadow-sm pointer-events-auto font-ui"
        style={{ background: "linear-gradient(135deg, #D4A847, #F0C85A)" }}
        animate={isLastFree || isOver ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1.4, repeat: Infinity }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles size={10} className="text-white" />
        <span className="text-[10px] font-extrabold text-white">
          {isOver ? "Assinar agora" : "✨ Liberar tudo"}
        </span>
      </motion.button>
    </div>
  );
};

export default SubscribeBanner;


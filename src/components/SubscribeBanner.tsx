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

  const isLastFree = questionsRemaining === 1;
  const isOver = questionsRemaining <= 0;

  return (
    <motion.button
      onClick={openPlans}
      className="w-full flex items-center justify-between px-4 py-2.5 border-b border-amber-200/30"
      style={{
        background: isOver
          ? "linear-gradient(90deg, rgba(244,63,94,0.10), rgba(236,72,153,0.08))"
          : "linear-gradient(90deg, rgba(212,168,71,0.08), rgba(245,158,11,0.06))",
      }}
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-2">
        <Crown size={14} className={isOver ? "text-rose-600" : "text-amber-600"} />
        <span className={`text-[11px] font-bold ${isOver ? "text-rose-700" : "text-gray-700"}`}>
          {isOver
            ? "🔒 Limite atingido — assine para continuar"
            : isLastFree
            ? "⚠️ Última pergunta grátis!"
            : `${questionsRemaining} perguntas grátis restantes`}
        </span>
      </div>
      <motion.div
        className="flex items-center gap-1 px-3 py-1 rounded-full shadow-sm"
        style={{ background: "linear-gradient(135deg, #D4A847, #F0C85A)" }}
        animate={isLastFree || isOver ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1.4, repeat: Infinity }}
      >
        <Sparkles size={10} className="text-white" />
        <span className="text-[10px] font-extrabold text-white">
          {isOver ? "Assinar agora" : "✨ Liberar tudo"}
        </span>
      </motion.div>
    </motion.button>
  );
};

export default SubscribeBanner;
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { getDailySpecialQuestion } from "./MascotDialogueSystem";
import pixelImg from "@/assets/pixel-chameleon.png";

interface DailyQuestionCardProps {
  childName: string;
  onSubmit: (question: string) => void;
  disabled?: boolean;
}

const DailyQuestionCard = ({ childName, onSubmit, disabled }: DailyQuestionCardProps) => {
  const daily = getDailySpecialQuestion();

  return (
    <motion.div
      className={`w-full max-w-sm rounded-2xl p-4 border border-white/30 relative overflow-hidden bg-gradient-to-br ${daily.gradient}`}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
      style={{
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/15 blur-2xl" />
      </div>

      <div className="relative z-10 flex items-start gap-3">
        {/* Pixel mascot */}
        <motion.img
          src={pixelImg}
          alt="Pixel"
          className="w-12 h-12 object-contain flex-shrink-0"
          animate={{ y: [0, -4, 0], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            filter: "brightness(1.15) drop-shadow(0 0 6px rgba(100,160,255,0.5))",
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={12} className="text-kid-orange" />
            <span className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider">
              Pergunta do dia
            </span>
          </div>

          <p className="text-[10px] text-gray-500 font-bold mb-1.5">
            Pixel tem algo especial para {childName}! ✨
          </p>

          <p className="text-sm font-black text-gray-800 leading-snug mb-2.5">
            <span className="text-lg mr-1">{daily.emoji}</span>
            {daily.question}
          </p>

          <motion.button
            onClick={() => onSubmit(daily.question)}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl kid-gradient-orange text-white text-xs font-extrabold shadow-md disabled:opacity-40 active:scale-95 transition-transform"
            whileTap={{ scale: 0.95 }}
          >
            Explorar essa pergunta
            <ArrowRight size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyQuestionCard;

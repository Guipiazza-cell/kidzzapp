import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, MessageCircle, Star, Crown, ArrowRight } from "lucide-react";
import ChameleonMascot from "./ChameleonMascot";

interface LandingScreenProps {
  onStart: () => void;
  onQuestionClick: (question: string) => void;
}

const QUICK_QUESTIONS = [
  { text: "Por que o céu é azul?", emoji: "🌤️" },
  { text: "Como os dinossauros morreram?", emoji: "🦕" },
  { text: "Por que a gente sonha?", emoji: "💭" },
  { text: "Como os peixes respiram?", emoji: "🐟" },
];

const LandingScreen = forwardRef<HTMLDivElement, LandingScreenProps>(({ onStart, onQuestionClick }, ref) => {
  return (
    <div ref={ref} className="flex-1 flex flex-col items-center justify-start px-5 pt-6 pb-8 overflow-y-auto">
      {/* Hero */}
      <motion.div
        className="text-center max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ChameleonMascot size="lg" />
        
        <h1 className="text-2xl font-extrabold text-white mt-3 drop-shadow-xl leading-tight">
          Seu filho faz perguntas que você não sabe responder?
        </h1>
        
        <p className="text-white/80 text-base mt-2">
          Respostas inteligentes e histórias na hora, para crianças 🧒
        </p>
      </motion.div>

      {/* Quick questions - WOW moment */}
      <motion.div
        className="w-full max-w-sm mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-white/60 text-xs font-bold text-center mb-3 uppercase tracking-wider">
          👆 Toque em uma pergunta e veja a mágica
        </p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_QUESTIONS.map((q, i) => (
            <motion.button
              key={q.text}
              onClick={() => onQuestionClick(q.text)}
              className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-left hover:bg-white/20 transition-all active:scale-95 shadow-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileTap={{ scale: 0.93 }}
            >
              <span className="text-2xl block mb-1">{q.emoji}</span>
              <span className="text-xs font-bold text-white leading-tight">{q.text}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.button
        onClick={onStart}
        className="w-full max-w-sm mt-6 py-4 rounded-3xl bg-gradient-to-r from-kid-orange to-kid-yellow text-white font-extrabold text-lg shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        whileTap={{ scale: 0.97 }}
      >
        Testar agora <ArrowRight size={20} />
      </motion.button>

      {/* Social proof */}
      <motion.div
        className="mt-5 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="text-kid-yellow fill-kid-yellow" />
          ))}
        </div>
        <p className="text-white/70 text-xs font-bold text-center">
          +5.000 perguntas respondidas
        </p>
        <p className="text-white/50 text-xs text-center italic max-w-[260px]">
          "Salvou minhas noites antes de dormir. Meu filho ama!" — Ana, mãe do Pedro
        </p>
      </motion.div>

      {/* Subscribe CTA */}
      <motion.div
        className="w-full max-w-sm mt-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown size={18} className="text-kid-yellow" />
          <span className="text-white font-extrabold text-sm">Quer acesso completo?</span>
        </div>
        <p className="text-white/60 text-xs mb-3">
          Perguntas diárias, voz, histórias e muito mais
        </p>
        <button
          onClick={onStart}
          className="w-full py-3 rounded-2xl kid-gradient-premium text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Sparkles size={16} />
          Ver planos
        </button>
      </motion.div>

      <p className="text-white/30 text-[10px] mt-4 text-center">
        🔒 Seguro e feito para crianças • Sem anúncios
      </p>
    </div>
  );
};

export default LandingScreen;

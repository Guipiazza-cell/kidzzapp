import { forwardRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, Shield, Mic } from "lucide-react";
import ChameleonMascot from "./ChameleonMascot";

interface LandingScreenProps {
  onStart: () => void;
  onQuestionClick: (question: string) => void;
}

const QUICK_QUESTIONS = [
  { text: "Por que o céu é azul?", emoji: "🌤️" },
  { text: "O que acontece quando a gente morre?", emoji: "💭" },
  { text: "Como os bebês nascem?", emoji: "👶" },
  { text: "Por que preciso dormir?", emoji: "😴" },
];

const PARENT_PHRASES = [
  "Hoje você vai responder melhor do que ontem.",
  "Seu filho vai lembrar dessas respostas pra sempre.",
  "Cada pergunta é uma chance de conexão.",
];

const LandingScreen = forwardRef<HTMLDivElement, LandingScreenProps>(({ onStart, onQuestionClick }, ref) => {
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % PARENT_PHRASES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={ref} className="flex-1 flex flex-col items-center px-5 pt-8 pb-8 overflow-y-auto overflow-x-hidden">
      {/* Brand */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ChameleonMascot size="sm" mood="happy" interactive={false} />
        <span className="text-3xl font-black text-primary-foreground tracking-tight drop-shadow-lg">
          Kidzz
        </span>
      </motion.div>

      {/* Dynamic parent phrase */}
      <div className="mt-6 h-14 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIdx}
            className="text-center text-primary-foreground/90 text-lg font-bold max-w-[300px] leading-snug"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {PARENT_PHRASES[phraseIdx]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Main question prompt */}
      <motion.div
        className="w-full max-w-sm mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-primary-foreground/50 text-xs font-bold text-center mb-3 uppercase tracking-widest">
          Qual pergunta seu filho fez hoje?
        </p>

        {/* Question cards - clean grid */}
        <div className="space-y-2">
          {QUICK_QUESTIONS.map((q, i) => (
            <motion.button
              key={q.text}
              onClick={() => onQuestionClick(q.text)}
              className="w-full flex items-center gap-3 glass-card p-4 rounded-2xl text-left active:scale-[0.98] transition-transform"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-2xl flex-shrink-0">{q.emoji}</span>
              <span className="text-sm font-bold text-primary-foreground leading-tight flex-1">
                {q.text}
              </span>
              <ArrowRight size={16} className="text-primary-foreground/30 flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.button
        onClick={onStart}
        className="w-full max-w-sm mt-6 py-4 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-yellow text-primary-foreground font-extrabold text-lg shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.div
          className="absolute inset-0 bg-primary-foreground/10 rounded-2xl"
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <Mic size={20} className="relative z-10" />
        <span className="relative z-10">Responder agora</span>
      </motion.button>

      {/* Social proof - minimal */}
      <motion.div
        className="mt-6 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className="text-kid-yellow fill-kid-yellow" />
          ))}
          <span className="text-primary-foreground/50 text-xs font-bold ml-2">+5.000 perguntas</span>
        </div>
        <p className="text-primary-foreground/40 text-xs text-center italic max-w-[260px]">
          "Salvou minhas noites antes de dormir." — Ana, mãe do Pedro
        </p>
      </motion.div>

      {/* Trust */}
      <motion.div
        className="mt-4 flex items-center gap-2 text-primary-foreground/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <Shield size={12} />
        <span className="text-[10px] font-bold">
          Conteúdo baseado em comunicação infantil responsável
        </span>
      </motion.div>
    </div>
  );
});

LandingScreen.displayName = "LandingScreen";

export default LandingScreen;

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Star, Crown, ArrowRight } from "lucide-react";
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

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.6 + i * 0.04, duration: 0.4, ease: "easeOut" as const },
  }),
};

const LandingScreen = forwardRef<HTMLDivElement, LandingScreenProps>(({ onStart, onQuestionClick }, ref) => {
  const headline = "Seu filho faz perguntas que você não sabe responder?";

  return (
    <div ref={ref} className="flex-1 flex flex-col items-center justify-start px-5 pt-6 pb-8 overflow-y-auto">
      {/* Hero: mascot + brand */}
      <motion.div
        className="text-center max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="flex items-center justify-center gap-3"
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
        >
          <ChameleonMascot size="md" mood="happy" />
          <motion.span
            className="text-4xl font-extrabold text-white drop-shadow-xl tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Kidzz
          </motion.span>
        </motion.div>

        {/* Letter-by-letter headline */}
        <h1 className="text-2xl font-extrabold text-white mt-3 drop-shadow-xl leading-tight">
          {headline.split("").map((char, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className="inline-block"
              style={char === " " ? { width: "0.25em" } : undefined}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="text-white/80 text-base mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          Respostas inteligentes e histórias na hora, para crianças 🧒
        </motion.p>
      </motion.div>

      {/* Quick questions */}
      <motion.div
        className="w-full max-w-sm mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <motion.p
          className="text-white/60 text-xs font-bold text-center mb-3 uppercase tracking-wider"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          👆 Toque em uma pergunta e veja a mágica
        </motion.p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_QUESTIONS.map((q, i) => (
            <motion.button
              key={q.text}
              onClick={() => onQuestionClick(q.text)}
              className="group bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-left hover:bg-white/25 transition-all active:scale-95 shadow-md relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 2.1 + i * 0.12, type: "spring", stiffness: 200 }}
              whileTap={{ scale: 0.93 }}
            >
              {/* Shimmer effect on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                whileHover={{ translateX: "200%" }}
                transition={{ duration: 0.6 }}
              />
              <span className="text-2xl block mb-1">{q.emoji}</span>
              <span className="text-xs font-bold text-white leading-tight">{q.text}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* CTA button */}
      <motion.button
        onClick={onStart}
        className="w-full max-w-sm mt-6 py-4 rounded-3xl bg-gradient-to-r from-kid-orange to-kid-yellow text-white font-extrabold text-lg shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.6 }}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Pulsing glow inside button */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-3xl"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="relative z-10 flex items-center gap-2">
          Testar agora <ArrowRight size={20} />
        </span>
      </motion.button>

      {/* Social proof */}
      <motion.div
        className="mt-5 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 3.1 + i * 0.1, type: "spring", stiffness: 300 }}
            >
              <Star size={14} className="text-kid-yellow fill-kid-yellow" />
            </motion.div>
          ))}
        </div>
        <p className="text-white/70 text-xs font-bold text-center">+5.000 perguntas respondidas</p>
        <motion.p
          className="text-white/50 text-xs text-center italic max-w-[260px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }}
        >
          "Salvou minhas noites antes de dormir. Meu filho ama!" — Ana, mãe do Pedro
        </motion.p>
      </motion.div>

      {/* Premium upsell */}
      <motion.div
        className="w-full max-w-sm mt-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.6 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Crown size={18} className="text-kid-yellow" />
          </motion.div>
          <span className="text-white font-extrabold text-sm">Quer acesso completo?</span>
        </div>
        <p className="text-white/60 text-xs mb-3">Perguntas diárias, voz, histórias e muito mais</p>
        <motion.button
          onClick={onStart}
          className="w-full py-3 rounded-2xl kid-gradient-premium text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
        >
          <Sparkles size={16} />
          Ver planos
        </motion.button>
      </motion.div>

      <p className="text-white/30 text-[10px] mt-4 text-center">
        🔒 Seguro e feito para crianças • Sem anúncios
      </p>
    </div>
  );
});

LandingScreen.displayName = "LandingScreen";

export default LandingScreen;

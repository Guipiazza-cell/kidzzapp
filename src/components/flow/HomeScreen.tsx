import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Mic, Star, Shield, BookOpen } from "lucide-react";
import ChameleonMascot from "../ChameleonMascot";
import VoiceInput from "../VoiceInput";
import ConversionScreen from "../ConversionScreen";
import ParentalGate from "../ParentalGate";
import ParentalSettings from "../ParentalSettings";
import SubscribeBanner from "../SubscribeBanner";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence } from "framer-motion";

const PHRASES = [
  "Você não precisa mais travar na resposta.",
  "Seu filho vai lembrar dessas respostas pra sempre.",
  "Cada pergunta é uma chance de conexão.",
];

const QUICK = [
  { text: "Por que o céu é azul?", emoji: "🌤️" },
  { text: "O que acontece quando a gente morre?", emoji: "💭" },
  { text: "Como os bebês nascem?", emoji: "👶" },
  { text: "Por que preciso dormir?", emoji: "😴" },
];

interface Props {
  onSubmit: (question: string) => void;
  onOpenStoryFactory: () => void;
}

const HomeScreen = ({ onSubmit, onOpenStoryFactory }: Props) => {
  const { profile, canAskQuestion, questionsRemaining, handleCheckout, tier } = useAuth();
  const [input, setInput] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPremium = profile?.is_premium ?? false;
  const isSuperPremium = tier === "super_premium";
  const isFreeLimitReached = !canAskQuestion();

  useEffect(() => {
    const iv = setInterval(() => setPhraseIdx(i => (i + 1) % PHRASES.length), 4000);
    return () => clearInterval(iv);
  }, []);

  const submit = (text: string) => {
    if (!text.trim() || isFreeLimitReached || submitting) return;
    setSubmitting(true);
    onSubmit(text.trim());
  };

  const handleCtaClick = () => {
    if (input.trim()) {
      submit(input);
    } else {
      inputRef.current?.focus();
    }
  };

  const onCheckout = async (plan: "premium" | "super_premium") => {
    setCheckoutLoading(true);
    try { await handleCheckout(plan); } finally { setCheckoutLoading(false); }
  };

  return (
    <motion.div
      className="flex-1 flex flex-col"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <ChameleonMascot size="sm" mood="happy" interactive={false} />
          <span className="text-xl font-black text-primary-foreground tracking-tight">Kidzz</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-primary-foreground font-extrabold glass-card px-3 py-1.5 rounded-full">
            {questionsRemaining()} 💬
          </span>
          {isSuperPremium && (
            <motion.button onClick={onOpenStoryFactory} className="p-2 rounded-xl glass-card text-primary-foreground" whileTap={{ scale: 0.9 }}>
              <BookOpen size={18} />
            </motion.button>
          )}
          <motion.button onClick={() => setShowParentalGate(true)} className="p-2 rounded-xl glass-card text-primary-foreground/50" whileTap={{ scale: 0.9 }}>
            <Shield size={18} />
          </motion.button>
        </div>
      </header>

      <SubscribeBanner onOpenParentalGate={() => setShowParentalGate(true)} questionsRemaining={questionsRemaining()} isPremium={isPremium} />

      {isFreeLimitReached ? (
        <div className="flex-1 overflow-y-auto">
          <ConversionScreen childName={profile?.child_name || "Explorador"} onSubscribe={onCheckout} loading={checkoutLoading} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-5 overflow-y-auto">
          {/* Dynamic phrase */}
          <div className="h-14 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={phraseIdx}
                className="text-center text-primary-foreground/80 text-lg font-bold max-w-[300px] leading-snug"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                {PHRASES[phraseIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Main question */}
          <motion.p
            className="text-primary-foreground/40 text-xs font-bold text-center mb-4 uppercase tracking-widest mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Qual pergunta seu filho fez hoje?
          </motion.p>

          {/* Input area */}
          <motion.div
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-end gap-3">
              <VoiceInput onResult={submit} disabled={submitting} />
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submit(input)}
                  placeholder='Ex: "Pai, o que é morrer?"'
                  className="w-full py-3.5 px-5 rounded-2xl glass-card text-primary-foreground text-sm placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-kid-orange/30 transition-all"
                  disabled={submitting}
                />
              </div>
              <motion.button
                onClick={() => submit(input)}
                disabled={!input.trim() || submitting}
                className="w-12 h-12 rounded-xl kid-gradient-orange shadow-lg flex items-center justify-center disabled:opacity-30 transition-all"
                whileTap={{ scale: 0.9 }}
              >
                <Send size={20} className="text-primary-foreground" />
              </motion.button>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            onClick={handleCtaClick}
            disabled={submitting}
            className="w-full max-w-sm mt-5 py-4 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-yellow text-primary-foreground font-extrabold text-lg shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform relative overflow-hidden disabled:opacity-60"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
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

          {/* Quick questions */}
          <motion.div
            className="w-full max-w-sm mt-6 space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {QUICK.map((q, i) => (
              <motion.button
                key={q.text}
                onClick={() => submit(q.text)}
                disabled={submitting}
                className="w-full flex items-center gap-3 glass-card p-3.5 rounded-2xl text-left active:scale-[0.98] transition-transform disabled:opacity-50"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.08 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-xl flex-shrink-0">{q.emoji}</span>
                <span className="text-sm font-bold text-primary-foreground leading-tight flex-1">{q.text}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Social proof */}
          <motion.div
            className="mt-6 flex items-center gap-0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="text-kid-yellow fill-kid-yellow" />
            ))}
            <span className="text-primary-foreground/40 text-xs font-bold ml-2">+5.000 perguntas respondidas</span>
          </motion.div>

          {/* Trust */}
          <motion.div
            className="mt-3 mb-6 flex items-center gap-2 text-primary-foreground/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <Shield size={12} />
            <span className="text-[10px] font-bold">Conteúdo baseado em comunicação infantil responsável</span>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showParentalGate && (
          <ParentalGate
            onSuccess={() => { setShowParentalGate(false); setShowSettings(true); }}
            onCancel={() => setShowParentalGate(false)}
          />
        )}
        {showSettings && <ParentalSettings onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default HomeScreen;

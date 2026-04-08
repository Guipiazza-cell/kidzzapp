import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, LogIn, Shield, Crown, BookOpen, Heart, Sparkles } from "lucide-react";
import ChameleonMascot from "../ChameleonMascot";
import VoiceInput from "../VoiceInput";
import ParentalGate from "../ParentalGate";
import ParentalSettings from "../ParentalSettings";
import SubscribeBanner from "../SubscribeBanner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const PHRASES = [
  "Você não precisa mais travar na resposta.",
  "Seu filho vai lembrar dessas respostas pra sempre.",
  "Cada pergunta é uma chance de conexão.",
];

const QUICK = [
  { text: "Por que eu sou diferente de todo mundo?", emoji: "🌟" },
  { text: "Como era você quando era criança?", emoji: "💛" },
  { text: "Por que a gente sonha enquanto dorme?", emoji: "💭" },
  { text: "Se eu fosse um super-herói, qual poder eu teria?", emoji: "🦸" },
  { text: "Como nascem as ideias na nossa cabeça?", emoji: "💡" },
  { text: "O que faz alguém ser corajoso de verdade?", emoji: "🦁" },
];

interface Props {
  onSubmit: (question: string) => void;
  onOpenStoryFactory: () => void;
  onOpenMoments?: () => void;
}

const HomeScreen = ({ onSubmit, onOpenStoryFactory, onOpenMoments }: Props) => {
  const { user, profile, canAskQuestion, questionsRemaining, tier, signOut } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showParentalGateForSettings, setShowParentalGateForSettings] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFreeLimitReached = !canAskQuestion();

  useEffect(() => {
    const iv = setInterval(() => setPhraseIdx(i => (i + 1) % PHRASES.length), 4000);
    return () => clearInterval(iv);
  }, []);

  const submit = (text: string) => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    onSubmit(text.trim());
  };

  const handleCtaClick = () => {
    if (isFreeLimitReached) {
      onSubmit("");
      return;
    }
    if (input.trim()) {
      submit(input);
    } else {
      inputRef.current?.focus();
    }
  };

  return (
    <motion.div
      className="flex-1 flex flex-col relative"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header — safe area + breathable */}
      <header className="flex items-center justify-between px-5 pb-2 relative z-10" style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}>
        <div className="flex items-center gap-2.5">
          <ChameleonMascot size="sm" mood="happy" interactive={false} />
          <span className="text-xl font-black text-primary-foreground tracking-tight">Kidzz</span>
        </div>
        <div className="flex items-center gap-3">
          {profile?.is_premium && (
            <span className="text-[10px] text-kid-yellow font-extrabold glass-card px-2.5 py-1 rounded-full flex items-center gap-1">
              <Crown size={11} /> Premium
            </span>
          )}
          <span className="text-xs text-primary-foreground font-extrabold glass-card px-3 py-1.5 rounded-full">
            {questionsRemaining()} 💬
          </span>
          {!user ? (
            <motion.button
              onClick={() => navigate("/auth")}
              className="p-2.5 rounded-xl glass-card text-kid-green"
              whileTap={{ scale: 0.9 }}
            >
              <LogIn size={20} />
            </motion.button>
          ) : (
            <motion.button
              onClick={() => setShowParentalGateForSettings(true)}
              className="p-2.5 rounded-xl glass-card text-primary-foreground/50"
              whileTap={{ scale: 0.9 }}
            >
              <Shield size={20} />
            </motion.button>
          )}
        </div>
      </header>

      <SubscribeBanner onOpenParentalGate={() => setShowParentalGateForSettings(true)} questionsRemaining={questionsRemaining()} isPremium={profile?.is_premium ?? false} />

      <div className="flex-1 flex flex-col items-center px-5 pb-8 overflow-y-auto">
        {/* Dynamic phrase */}
        <div className="h-12 flex items-center justify-center mt-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={phraseIdx}
              className="text-center text-primary-foreground/80 text-base font-bold max-w-[300px] leading-snug"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              {PHRASES[phraseIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Input block */}
        <motion.div
          className="w-full max-w-sm mt-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-primary-foreground/40 text-[11px] font-bold text-center mb-3 uppercase tracking-widest">
            Qual pergunta seu filho fez hoje?
          </p>
          <div className="flex items-end gap-2.5">
            <VoiceInput onResult={submit} disabled={submitting || isFreeLimitReached} />
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit(input)}
                placeholder={isFreeLimitReached ? "Limite atingido" : "Pergunte qualquer coisa 😊"}
                className="w-full py-3.5 px-4 rounded-2xl glass-card text-primary-foreground text-sm placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-kid-orange/30 transition-all disabled:opacity-40"
                disabled={submitting || isFreeLimitReached}
              />
            </div>
            <motion.button
              onClick={() => submit(input)}
              disabled={!input.trim() || submitting || isFreeLimitReached}
              className="w-12 h-12 rounded-xl kid-gradient-orange shadow-lg flex items-center justify-center disabled:opacity-30 transition-all"
              whileTap={{ scale: 0.9 }}
            >
              <Send size={20} className="text-primary-foreground" />
            </motion.button>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          onClick={handleCtaClick}
          disabled={submitting}
          className={`w-full max-w-sm mt-4 py-3.5 rounded-2xl font-extrabold text-base shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform relative overflow-hidden disabled:opacity-60 text-primary-foreground ${
            isFreeLimitReached
              ? "bg-gradient-to-r from-kid-purple to-kid-blue"
              : "bg-gradient-to-r from-kid-orange to-kid-yellow"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.div
            className="absolute inset-0 bg-primary-foreground/10 rounded-2xl"
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          {isFreeLimitReached ? (
            <span className="relative z-10">🔓 Desbloquear acesso completo</span>
          ) : (
            <>
              <Mic size={18} className="relative z-10" />
              <span className="relative z-10">Responder agora</span>
            </>
          )}
        </motion.button>

        {/* Feature Cards */}
        <motion.div
          className="w-full max-w-sm mt-6 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-primary-foreground/40 text-[11px] font-bold text-center uppercase tracking-widest mb-1">
            Explore o Kidzz
          </p>

          {/* Story Factory */}
          <motion.button
            onClick={onOpenStoryFactory}
            className="w-full flex items-center gap-4 p-4 rounded-2xl glass-card border border-kid-purple/20 text-left active:scale-[0.98] transition-transform"
            whileTap={{ scale: 0.97 }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-kid-purple to-kid-blue flex items-center justify-center flex-shrink-0 shadow-lg">
              <BookOpen size={22} className="text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-primary-foreground leading-tight">Criar histórias mágicas</p>
              <p className="text-xs text-primary-foreground/50 mt-0.5">Histórias personalizadas para seu filho</p>
            </div>
            <Sparkles size={16} className="text-kid-purple/60 flex-shrink-0" />
          </motion.button>

          {/* Moments Factory */}
          <motion.button
            onClick={() => onOpenMoments?.()}
            className="w-full flex items-center gap-4 p-4 rounded-2xl glass-card border border-kid-orange/20 text-left active:scale-[0.98] transition-transform"
            whileTap={{ scale: 0.97 }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-kid-orange to-kid-yellow flex items-center justify-center flex-shrink-0 shadow-lg">
              <Heart size={22} className="text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-primary-foreground leading-tight">Criar momentos especiais</p>
              <p className="text-xs text-primary-foreground/50 mt-0.5">Conexões únicas entre pais e filhos</p>
            </div>
            <Sparkles size={16} className="text-kid-orange/60 flex-shrink-0" />
          </motion.button>

          {/* Parental Control */}
          <motion.button
            onClick={() => setShowParentalGateForSettings(true)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl glass-card border border-kid-green/20 text-left active:scale-[0.98] transition-transform"
            whileTap={{ scale: 0.97 }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-kid-green to-kid-blue flex items-center justify-center flex-shrink-0 shadow-lg">
              <Shield size={22} className="text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-primary-foreground leading-tight">Controle dos pais</p>
              <p className="text-xs text-primary-foreground/50 mt-0.5">Segurança e limites personalizados</p>
            </div>
          </motion.button>
        </motion.div>

        {/* Quick questions as chips */}
        <motion.div
          className="w-full max-w-sm mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-primary-foreground/30 text-[10px] font-bold text-center uppercase tracking-widest mb-2">
            Perguntas populares
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK.map((q, i) => (
              <motion.button
                key={q.text}
                onClick={() => submit(q.text)}
                disabled={submitting || isFreeLimitReached}
                className="flex items-center gap-1.5 glass-card px-3 py-2 rounded-full text-left active:scale-[0.97] transition-transform disabled:opacity-40"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.06 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-sm">{q.emoji}</span>
                <span className="text-[11px] font-bold text-primary-foreground/80 leading-tight">{q.text}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Bottom spacer */}
        <div className="mt-6" />
      </div>

      <AnimatePresence>
        {showParentalGateForSettings && (
          <ParentalGate
            onSuccess={() => { setShowParentalGateForSettings(false); setShowSettings(true); }}
            onCancel={() => setShowParentalGateForSettings(false)}
          />
        )}
        {showSettings && <ParentalSettings onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default HomeScreen;

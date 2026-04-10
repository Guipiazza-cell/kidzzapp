import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, LogIn, Shield, Crown, Sparkles } from "lucide-react";
import VoiceInput from "../VoiceInput";
import ParentalGate from "../ParentalGate";
import ParentalSettings from "../ParentalSettings";
import SubscribeBanner from "../SubscribeBanner";
import BottomNav from "./BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import pixelImg from "@/assets/pixel-chameleon.png";
import aneImg from "@/assets/ane-chameleon.png";

const PHRASES = [
  "Cada pergunta é uma chance de conexão.",
  "Seu filho vai lembrar dessas respostas pra sempre.",
  "Você não precisa mais travar na resposta.",
];

const ALL_QUESTIONS = [
  { text: "Por que o céu muda de cor?", emoji: "🌅" },
  { text: "Como os sonhos acontecem?", emoji: "💭" },
  { text: "O que existia antes de tudo?", emoji: "🌌" },
  { text: "Como os animais se comunicam?", emoji: "🐾" },
  { text: "Por que sentimos medo?", emoji: "😨" },
  { text: "Como o cérebro guarda memórias?", emoji: "🧠" },
  { text: "Por que o universo é tão grande?", emoji: "🚀" },
  { text: "Como surgem as ideias?", emoji: "💡" },
  { text: "O que faz algo ser justo ou injusto?", emoji: "⚖️" },
];

const VISIBLE_COUNT = 4;

interface Props {
  onSubmit: (question: string) => void;
  onOpenStoryFactory: () => void;
  onOpenMoments?: () => void;
}

const HomeScreen = ({ onSubmit, onOpenStoryFactory, onOpenMoments }: Props) => {
  const { user, profile, canAskQuestion, questionsRemaining, signOut } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showParentalGateForSettings, setShowParentalGateForSettings] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const inputRef = useRef<HTMLInputElement>(null);

  const isFreeLimitReached = !canAskQuestion();

  const [questionPage, setQuestionPage] = useState(0);
  const totalPages = Math.ceil(ALL_QUESTIONS.length / VISIBLE_COUNT);
  const visibleQuestions = ALL_QUESTIONS.slice(
    questionPage * VISIBLE_COUNT,
    questionPage * VISIBLE_COUNT + VISIBLE_COUNT
  );

  useEffect(() => {
    const iv = setInterval(() => setPhraseIdx((i) => (i + 1) % PHRASES.length), 4000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setQuestionPage((p) => (p + 1) % totalPages), 20000);
    return () => clearInterval(iv);
  }, [totalPages]);

  const submit = (text: string) => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    onSubmit(text.trim());
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "explore") onOpenStoryFactory();
    if (tab === "moments") onOpenMoments?.();
    if (tab === "subscribe") setShowParentalGateForSettings(true);
  };

  const questionsUsed = profile?.questions_used ?? 0;
  const badge =
    questionsUsed >= 20
      ? "Gênio Curioso 🧠"
      : questionsUsed >= 10
      ? "Explorador Incrível 🚀"
      : questionsUsed >= 3
      ? "Conversador Iniciante 💬"
      : null;

  return (
    <motion.div
      className="flex-1 flex flex-col relative"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 pb-2 relative z-10"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
      >
        <div className="flex items-center gap-2.5">
          <img src={pixelImg} alt="Pixel" className="w-9 h-9 object-contain drop-shadow-lg" />
          <span className="text-xl font-black text-gray-800 tracking-tight">
            Kidzz
          </span>
        </div>
        <div className="flex items-center gap-3">
          {profile?.is_premium && (
            <span className="text-[10px] text-kid-yellow font-extrabold glass-card px-2.5 py-1 rounded-full flex items-center gap-1">
              <Crown size={11} /> Premium
            </span>
          )}
          <span className="text-xs text-gray-700 font-extrabold glass-card px-3 py-1.5 rounded-full">
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

      <SubscribeBanner
        onOpenParentalGate={() => setShowParentalGateForSettings(true)}
        questionsRemaining={questionsRemaining()}
        isPremium={profile?.is_premium ?? false}
      />

      <div className="flex-1 flex flex-col items-center px-5 pb-24 overflow-y-auto">
        {/* Characters & greeting */}
        <div className="flex items-end justify-center gap-3 mt-2 mb-1">
          {/* Ane — slides in from left with bounce */}
          <motion.img
            src={aneImg}
            alt="Ane"
            className="w-16 h-16 object-contain drop-shadow-xl cursor-pointer"
            initial={{ opacity: 0, x: -60, rotate: -15 }}
            animate={{
              opacity: 1,
              x: 0,
              rotate: [0, -4, 4, -2, 0],
              y: [0, -4, 0, -2, 0],
            }}
            transition={{
              opacity: { duration: 0.5 },
              x: { type: "spring", stiffness: 180, damping: 14, delay: 0.3 },
              rotate: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
            }}
            whileHover={{ scale: 1.2, rotate: -8 }}
            whileTap={{ scale: 0.8, rotate: 12 }}
          />
          <motion.div
            className="glass-card rounded-2xl px-4 py-2.5 max-w-[220px]"
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.5 }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={phraseIdx}
                className="text-center text-gray-700 text-sm font-bold leading-snug"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {PHRASES[phraseIdx]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
          {/* Pixel — slides in from right with bounce */}
          <motion.img
            src={pixelImg}
            alt="Pixel"
            className="w-16 h-16 object-contain drop-shadow-xl cursor-pointer"
            initial={{ opacity: 0, x: 60, rotate: 15 }}
            animate={{
              opacity: 1,
              x: 0,
              rotate: [0, 5, -3, 2, 0],
              y: [0, -3, 0, -5, 0],
            }}
            transition={{
              opacity: { duration: 0.5 },
              x: { type: "spring", stiffness: 180, damping: 14, delay: 0.4 },
              rotate: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
              y: { duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1 },
            }}
            whileHover={{ scale: 1.2, rotate: 8 }}
            whileTap={{ scale: 0.8, rotate: -12 }}
          />
        </div>

        {/* Main CTA text */}
        <motion.h1
          className="text-2xl font-black text-gray-800 text-center mt-3 mb-1"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Me pergunte qualquer coisa!
        </motion.h1>

        {/* Gamification badge */}
        {badge && (
          <motion.div
            className="glass-card px-3 py-1 rounded-full mb-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-[11px] font-bold text-kid-yellow">{badge}</span>
          </motion.div>
        )}

        {questionsUsed > 0 && (
          <motion.p
            className="text-[11px] text-gray-500 font-bold mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            Você já respondeu {questionsUsed} {questionsUsed === 1 ? "pergunta" : "perguntas"}! ✨
          </motion.p>
        )}

        {/* Input block */}
        <motion.div
          className="w-full max-w-sm mt-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-end gap-2.5">
            <VoiceInput onResult={submit} disabled={submitting || isFreeLimitReached} />
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit(input)}
                placeholder={
                  isFreeLimitReached ? "Limite atingido" : "Digite sua pergunta aqui 😊"
                }
                className="w-full py-4 px-5 rounded-2xl glass-card text-gray-800 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-kid-orange/40 transition-all disabled:opacity-40"
                disabled={submitting || isFreeLimitReached}
              />
            </div>
            <motion.button
              onClick={() => submit(input)}
              disabled={!input.trim() || submitting || isFreeLimitReached}
              className="w-13 h-13 rounded-xl kid-gradient-orange shadow-lg flex items-center justify-center disabled:opacity-30 transition-all"
              whileTap={{ scale: 0.9 }}
            >
              <Send size={22} className="text-white" />
            </motion.button>
          </div>
        </motion.div>

        {/* Question chips — nature style */}
        <motion.div
          className="w-full max-w-sm mt-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-gray-500 text-[10px] font-bold text-center uppercase tracking-widest mb-2.5">
            Perguntas populares
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={questionPage}
              className="grid grid-cols-2 gap-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              {visibleQuestions.map((q) => (
                <motion.button
                  key={q.text}
                  onClick={() => submit(q.text)}
                  disabled={submitting || isFreeLimitReached}
                  className="flex items-center gap-2 glass-card px-3 py-3 rounded-2xl text-left active:scale-[0.97] transition-transform disabled:opacity-40 border border-white/30"
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-base flex-shrink-0">{q.emoji}</span>
                  <span className="text-[11px] font-bold text-gray-700 leading-tight">
                    {q.text}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="mt-6" />
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      <AnimatePresence>
        {showParentalGateForSettings && (
          <ParentalGate
            onSuccess={() => {
              setShowParentalGateForSettings(false);
              setShowSettings(true);
            }}
            onCancel={() => setShowParentalGateForSettings(false)}
          />
        )}
        {showSettings && <ParentalSettings onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default HomeScreen;

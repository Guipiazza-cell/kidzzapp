import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, LogIn, Shield, Crown } from "lucide-react";
import StreakCard from "./StreakCard";
import StreakCelebration from "./StreakCelebration";
import VoiceInput from "../VoiceInput";
import ParentalGate from "../ParentalGate";
import ParentalSettings from "../ParentalSettings";
import SubscribeBanner from "../SubscribeBanner";
import CharacterParticles, { useCharacterParticles } from "./CharacterParticles";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import DailyQuestionCard from "@/components/mascot/DailyQuestionCard";
import { getTimeOfDay, getMascotDialogue, getMascotMood, type MascotState } from "@/components/mascot/MascotDialogueSystem";
import pixelImg from "@/assets/pixel-chameleon.png";
import aneImg from "@/assets/ane-chameleon.png";

const CATEGORIZED_QUESTIONS: Record<string, { text: string; emoji: string; category: string }[]> = {
  "0-3": [
    { text: "Por que o céu é azul?", emoji: "🌤️", category: "Natureza" },
    { text: "Que som o gato faz?", emoji: "🐱", category: "Animais" },
    { text: "De que cor é o sol?", emoji: "☀️", category: "Cores" },
    { text: "Onde moram os peixes?", emoji: "🐠", category: "Natureza" },
    { text: "Por que a chuva cai?", emoji: "🌧️", category: "Natureza" },
    { text: "Como o arco-íris aparece?", emoji: "🌈", category: "Cores" },
  ],
  "3-7": [
    { text: "Por que sentimos saudade?", emoji: "❤️", category: "Emoções" },
    { text: "Como os animais sabem o que fazer?", emoji: "🐾", category: "Natureza" },
    { text: "Por que o céu muda de cor?", emoji: "🌅", category: "Universo" },
    { text: "O que faz alguém ser feliz de verdade?", emoji: "😊", category: "Emoções" },
    { text: "Por que a natureza é tão organizada?", emoji: "🌿", category: "Natureza" },
    { text: "Como surgem as ideias?", emoji: "💡", category: "Mente" },
    { text: "Por que as pessoas pensam diferente?", emoji: "🤔", category: "Filosofia" },
    { text: "Por que lembramos de algumas coisas e esquecemos outras?", emoji: "💭", category: "Mente" },
  ],
  "7-10": [
    { text: "O que existia antes do universo?", emoji: "🌌", category: "Universo" },
    { text: "Por que o tempo existe?", emoji: "⏳", category: "Universo" },
    { text: "Como os pensamentos aparecem?", emoji: "🧠", category: "Mente" },
    { text: "O que é certo e errado?", emoji: "⚖️", category: "Filosofia" },
    { text: "Por que as pessoas pensam diferente?", emoji: "🤔", category: "Filosofia" },
    { text: "Por que sentimos saudade?", emoji: "❤️", category: "Emoções" },
    { text: "Como surgem as ideias?", emoji: "💡", category: "Mente" },
    { text: "Por que a natureza é tão organizada?", emoji: "🌿", category: "Natureza" },
  ],
};

const VISIBLE_COUNT = 6;

const LEVEL_CONFIG: Record<string, { label: string; emoji: string; color: string; next: number }> = {
  iniciante: { label: "Iniciante", emoji: "🌱", color: "text-kid-green", next: 15 },
  curioso: { label: "Curioso", emoji: "🔍", color: "text-kid-blue", next: 50 },
  explorador: { label: "Explorador", emoji: "🚀", color: "text-kid-orange", next: 100 },
  pensador: { label: "Pensador", emoji: "🧠", color: "text-kid-purple", next: 999 },
};

interface Props {
  onSubmit: (question: string) => void;
  onOpenStoryFactory: () => void;
  onOpenMoments?: () => void;
  onOpenAchievements?: () => void;
  onOpenLab?: () => void;
  onOpenPlay?: () => void;
  onOpenTravel?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  hideBottomNav?: boolean;
  characterEvolution?: any;
}

const HomeScreen = ({ onSubmit, onOpenStoryFactory, onOpenMoments, onOpenAchievements, onOpenLab, onOpenPlay, onOpenTravel }: Props) => {
  const { user, profile, canAskQuestion, questionsRemaining, signOut } = useAuth();
  const navigate = useNavigate();
  const { particles, burst } = useCharacterParticles();
  const [input, setInput] = useState("");
  const [showPixelSpeech, setShowPixelSpeech] = useState(true);
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showParentalGateForSettings, setShowParentalGateForSettings] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mascotState, setMascotState] = useState<MascotState>(getTimeOfDay());
  const inputRef = useRef<HTMLInputElement>(null);

  const childName = profile?.child_name || "Explorador";
  const ageRange = profile?.age_range || "3-7";
  const streakDays = profile?.streak_days ?? 0;
  const interests = (profile as any)?.child_interests as string[] | undefined;
  const ageQuestions = CATEGORIZED_QUESTIONS[ageRange] || CATEGORIZED_QUESTIONS["3-7"];

  // Filter questions by child interests when possible
  const filteredQuestions = useMemo(() => {
    if (!interests || interests.length === 0) return ageQuestions;
    const interestCategoryMap: Record<string, string[]> = {
      "Espaço": ["Universo"],
      "Natureza": ["Natureza"],
      "Ciência": ["Mente", "Universo"],
      "Arte": ["Emoções"],
      "Animais": ["Natureza", "Animais"],
    };
    const relevantCategories = interests.flatMap(i => interestCategoryMap[i] || []);
    if (relevantCategories.length === 0) return ageQuestions;
    // Boost interest-matched questions to the top, keep all
    const matched = ageQuestions.filter(q => relevantCategories.includes(q.category));
    const rest = ageQuestions.filter(q => !relevantCategories.includes(q.category));
    return [...matched, ...rest];
  }, [ageQuestions, interests]);

  const isFreeLimitReached = !canAskQuestion();

  const [questionPage, setQuestionPage] = useState(0);
  const totalPages = Math.ceil(filteredQuestions.length / VISIBLE_COUNT);
  const visibleQuestions = filteredQuestions.slice(
    questionPage * VISIBLE_COUNT,
    questionPage * VISIBLE_COUNT + VISIBLE_COUNT
  );

  // Contextual dialogue — regenerates on state change
  const [anePhrase, setAnePhrase] = useState("");
  const [pixelPhrase, setPixelPhrase] = useState("");

  const regenerateDialogues = (state: MascotState) => {
    setAnePhrase(getMascotDialogue(state, "ane", childName, streakDays, interests));
    setPixelPhrase(getMascotDialogue(state, "pixel", childName, streakDays, interests));
  };

  // Set time-based state + streak override
  useEffect(() => {
    const timeState = getTimeOfDay();
    // If streak is notable, show that first
    const effectiveState = streakDays >= 3 && Math.random() < 0.4 ? "streak_milestone" : timeState;
    setMascotState(effectiveState);
    regenerateDialogues(effectiveState);
  }, [childName, streakDays]);

  // Toggle speech bubbles
  useEffect(() => {
    const iv = setInterval(() => {
      setShowPixelSpeech((prev) => !prev);
    }, 5000);
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

  const points = profile?.points ?? 0;
  const level = profile?.level ?? "iniciante";
  const levelInfo = LEVEL_CONFIG[level] || LEVEL_CONFIG.iniciante;
  const levelProgress = Math.min(100, (points / levelInfo.next) * 100);

  return (
    <motion.div
      className="flex-1 flex flex-col relative"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <CharacterParticles particles={particles} />
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
        <div className="flex items-center gap-2">
          {profile?.is_premium && (
            <span className="text-[10px] text-white font-extrabold bg-gradient-to-r from-kid-purple to-kid-pink px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Crown size={11} /> Premium
            </span>
          )}
          <span className="text-xs text-gray-800 font-extrabold glass-card px-3 py-1.5 rounded-full">
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
              className="p-2.5 rounded-xl glass-card text-gray-600"
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

      <div className="flex-1 flex flex-col items-center px-5 overflow-y-auto">
        {/* Streak Celebration overlay */}
        <StreakCelebration streakDays={streakDays} childName={childName} previousRecord={streakDays} />

        {/* Streak Card */}
        <StreakCard streakDays={streakDays} childName={childName} onSubmit={onSubmit} />

        {/* Daily Special Question */}
        <div className="w-full flex justify-center mt-2 mb-1">
          <DailyQuestionCard childName={childName} onSubmit={submit} disabled={submitting || isFreeLimitReached} />
        </div>

        {/* Characters & speech bubbles */}
        <div className="flex items-end justify-center gap-1 mt-2 mb-1">
          {/* Ane */}
          <div className="flex flex-col items-center">
            <AnimatePresence>
              {!showPixelSpeech && (
                <motion.div
                  className="glass-card rounded-xl px-3 py-1.5 mb-1 max-w-[130px]"
                  initial={{ opacity: 0, scale: 0.7, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.7, y: 8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-[10px] text-gray-600 font-bold text-center leading-tight">
                    {anePhrase}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.img
              src={aneImg}
              alt="Ane"
              className="w-24 h-24 object-contain drop-shadow-xl cursor-pointer"
              initial={{ opacity: 0, x: -60, rotate: -15 }}
              animate={{
                opacity: 1,
                x: 0,
                rotate: [0, -4, 4, -2, 0],
                y: [0, -6, 0, -3, 0],
              }}
              transition={{
                opacity: { duration: 0.5 },
                x: { type: "spring", stiffness: 180, damping: 14, delay: 0.3 },
                rotate: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 },
                y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
              }}
              whileHover={{ scale: 1.15, rotate: -8 }}
              whileTap={{ scale: 0.85, rotate: 12 }}
              onClick={(e) => burst(e)}
            />
          </div>

          <div className="flex flex-col items-center mx-1">
            <motion.h1
              className="text-xl font-black text-gray-800 text-center leading-tight"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Oi, {childName}! 👋<br />
              <span className="text-base font-bold text-gray-600">Me pergunte qualquer coisa!</span>
            </motion.h1>
            <motion.p
              className="text-[10px] text-gray-500 font-semibold text-center mt-1 max-w-[180px] leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Descubra respostas e crie conversas incríveis juntos 💛
            </motion.p>
          </div>

          {/* Pixel */}
          <div className="flex flex-col items-center">
            <AnimatePresence>
              {showPixelSpeech && (
                <motion.div
                  className="glass-card rounded-xl px-3 py-1.5 mb-1 max-w-[130px]"
                  initial={{ opacity: 0, scale: 0.7, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.7, y: 8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-[10px] text-gray-600 font-bold text-center leading-tight">
                    {pixelPhrase}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.img
              src={pixelImg}
              alt="Pixel"
              className="w-24 h-24 object-contain cursor-pointer"
              style={{
                filter: "brightness(1.15) drop-shadow(0 0 10px rgba(100,160,255,0.7)) drop-shadow(0 4px 16px rgba(80,140,255,0.4))",
              }}
              initial={{ opacity: 0, x: 60, rotate: 15 }}
              animate={{
                opacity: 1,
                x: 0,
                rotate: [0, 5, -3, 2, 0],
                y: [0, -5, 0, -7, 0],
              }}
              transition={{
                opacity: { duration: 0.5 },
                x: { type: "spring", stiffness: 180, damping: 14, delay: 0.4 },
                rotate: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
                y: { duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1 },
              }}
              whileHover={{ scale: 1.15, rotate: 8 }}
              whileTap={{ scale: 0.85, rotate: -12 }}
              onClick={(e) => burst(e)}
            />
          </div>
        </div>

        {/* Quick access buttons */}
        <div className="flex items-center gap-2 mt-1 mb-1">
          {onOpenLab && (
            <motion.button
              onClick={onOpenLab}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/20 flex items-center gap-1.5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              whileTap={{ scale: 0.93 }}
            >
              <span className="text-sm">🧪</span>
              <span className="text-[10px] font-bold text-purple-700">Lab</span>
            </motion.button>
          )}
          {onOpenPlay && (
            <motion.button
              onClick={onOpenPlay}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-600/20 to-sky-600/20 border border-emerald-400/20 flex items-center gap-1.5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              whileTap={{ scale: 0.93 }}
            >
              <span className="text-sm">🎮</span>
              <span className="text-[10px] font-bold text-emerald-700">Play</span>
            </motion.button>
          )}
        </div>
        {/* Level & Progress */}
        <motion.div
          className="w-full max-w-sm mt-1 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="glass-card rounded-2xl px-4 py-2.5 flex items-center gap-3">
            <span className="text-lg">{levelInfo.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[11px] font-black ${levelInfo.color}`}>{levelInfo.label}</span>
                <span className="text-[10px] font-bold text-gray-400">{points} pts</span>
              </div>
              <Progress value={levelProgress} className="h-1.5 bg-gray-200/50" />
            </div>
          </div>
        </motion.div>

        {/* Input block */}
        <motion.div
          className="w-full max-w-sm"
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

        {/* Question chips — categorized */}
        <motion.div
          className="w-full max-w-sm mt-3 flex-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-gray-500 text-[10px] font-bold text-center uppercase tracking-widest mb-2">
            Perguntas que mudam conversas ✨
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
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-gray-700 leading-tight block">
                      {q.text}
                    </span>
                    <span className="text-[8px] text-gray-400 font-semibold uppercase tracking-wider">
                      {q.category}
                    </span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="mt-3" />
      </div>

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

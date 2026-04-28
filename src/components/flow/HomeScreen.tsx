import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, LogIn, Shield, Crown, Gift } from "lucide-react";
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
import cosmicImg from "@/assets/kidzz/cosmic.png";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";
import KidzzHero from "@/components/kidzz/KidzzHero";
import { kidzzMemory, getContextualGreeting } from "@/components/kidzz/kidzzMemory";
import { loadMascotConfig } from "@/components/lab/KidzzLab";
import DailyMissionCard from "@/components/flow/DailyMissionCard";
import { getTotalXp } from "@/lib/dailyMission";

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
    { text: "Por que o tempo existe?", emoji: "\n", category: "Universo" },
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
  onOpenChallenge?: () => void;
  onOpenReferral?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  hideBottomNav?: boolean;
  characterEvolution?: any;
}

const HomeScreen = ({ onSubmit, onOpenStoryFactory, onOpenMoments, onOpenAchievements, onOpenLab, onOpenPlay, onOpenTravel, onOpenChallenge, onOpenReferral, onTabChange }: Props) => {
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

  const childName = profile?.child_name || "amigo";
  const ageRange = profile?.age_range || "3-7";
  const streakDays = profile?.streak_days ?? 0;
  const interests = (profile as any)?.child_interests as string[] | undefined;
  const ageQuestions = CATEGORIZED_QUESTIONS[ageRange] || CATEGORIZED_QUESTIONS["3-7"];
  const mascotConfig = useMemo(() => loadMascotConfig(), []);
  
  // Color hue-rotate map
  const HUE_MAP: Record<string, number> = {
    "rosa-encantado": 0, "dourado-magico": -30, "verde-floresta": 90,
    "azul-oceano": 180, "lilas-estrelado": 240, "laranja-aventura": -60,
  };
  const mascotHue = HUE_MAP[mascotConfig.colorId] || 0;

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
        className="flex items-center justify-between gap-2 px-3 pb-2 relative z-10"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          <img src={cosmicImg} alt="Kidzz" className="w-8 h-8 object-contain drop-shadow-lg flex-shrink-0" />
          <span className="text-lg font-black text-gray-800 tracking-tight">
            Kidzz
          </span>
          {profile?.is_premium && (
            <span className="text-[9px] text-white font-extrabold bg-gradient-to-r from-kid-purple to-kid-pink px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm flex-shrink-0">
              <Crown size={9} /> Premium
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onOpenReferral && user && (
            <motion.button
              onClick={onOpenReferral}
              className="p-2 rounded-xl glass-card text-purple-500"
              whileTap={{ scale: 0.9 }}
              aria-label="Programa de indicação"
            >
              <Gift size={16} />
            </motion.button>
          )}
          <span className="text-[11px] text-amber-700 font-extrabold glass-card px-2 py-1 rounded-full flex items-center gap-0.5" title="Pontos de sabedoria">
            ✨ {getTotalXp()}
          </span>
          <span className="text-[11px] text-gray-800 font-extrabold glass-card px-2 py-1 rounded-full">
            {questionsRemaining()} 💬
          </span>
          {!user ? (
            <motion.button
              onClick={() => navigate("/auth")}
              className="p-2 rounded-xl glass-card text-kid-green"
              whileTap={{ scale: 0.9 }}
              aria-label="Entrar"
            >
              <LogIn size={18} />
            </motion.button>
          ) : (
            <motion.button
              onClick={() => setShowParentalGateForSettings(true)}
              className="p-2 rounded-xl glass-card text-gray-600"
              whileTap={{ scale: 0.9 }}
              aria-label="Controle parental"
            >
              <Shield size={18} />
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

        {/* Atalhos rápidos removidos — Brincar agora vive no menu inferior */}

        {/* Daily mission loop — drives retention */}
        <div className="w-full flex justify-center mt-2 mb-1">
          <DailyMissionCard
            childName={childName}
            onAction={(target) => {
              if (target === "music") onTabChange?.("music");
              else if (target === "story") onTabChange?.("explore");
              else inputRef.current?.focus();
            }}
          />
        </div>

        {/* Daily Special Question */}
        <div className="w-full flex justify-center mt-2 mb-1">
          <DailyQuestionCard childName={childName} onSubmit={submit} disabled={submitting || isFreeLimitReached} />
        </div>

        {/* KIDZZ Hero — personagem único, vivo, contextual */}
        <KidzzHero childName={childName} streakDays={streakDays} ageRange={profile?.age_range ?? null} />

        {/* Convite — "Me pergunta qualquer coisa" */}
        <motion.p
          className="w-full max-w-sm text-center text-gray-700 text-sm font-extrabold mt-2 mb-1"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Me pergunta qualquer coisa ✨
        </motion.p>

        {/* Input block — DESTAQUE: barra de pergunta + microfone (menor) */}
        <motion.div
          className="w-full max-w-sm relative mt-1"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 180, damping: 18 }}
        >
          {/* Halo pulsante atrás da barra para chamar atenção */}
          <motion.div
            aria-hidden
            className="absolute -inset-2 rounded-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 50%, hsl(var(--kid-orange) / 0.35), transparent 70%)",
              filter: "blur(14px)",
            }}
            animate={{ opacity: [0.55, 0.95, 0.55], scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative flex items-center gap-2">
            <motion.div
              className="flex-shrink-0"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <VoiceInput onResult={submit} disabled={submitting || isFreeLimitReached} />
            </motion.div>
            <motion.div
              className="flex-1 min-w-0 relative"
              animate={{
                boxShadow: [
                  "0 0 0 0 hsl(var(--kid-orange) / 0)",
                  "0 0 0 6px hsl(var(--kid-orange) / 0.18)",
                  "0 0 0 0 hsl(var(--kid-orange) / 0)",
                ],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ borderRadius: 18 }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit(input)}
                placeholder={
                  isFreeLimitReached ? "Limite atingido" : "Escreva ou fale…"
                }
                className="w-full min-w-0 py-4 px-4 rounded-2xl glass-card text-gray-800 text-base font-semibold placeholder:text-gray-500 placeholder:font-semibold placeholder:text-sm focus:outline-none focus:ring-4 focus:ring-kid-orange/50 transition-all disabled:opacity-40 shadow-lg border-2 border-white/60"
                disabled={submitting || isFreeLimitReached}
              />
            </motion.div>
            <motion.button
              onClick={() => submit(input)}
              disabled={!input.trim() || submitting || isFreeLimitReached}
              aria-label="Enviar pergunta"
              className="flex-shrink-0 w-12 h-12 rounded-2xl kid-gradient-orange shadow-xl flex items-center justify-center disabled:opacity-30 transition-all"
              whileTap={{ scale: 0.88 }}
              animate={{
                boxShadow: [
                  "0 8px 20px -4px hsl(var(--kid-orange) / 0.4)",
                  "0 12px 28px -4px hsl(var(--kid-orange) / 0.65)",
                  "0 8px 20px -4px hsl(var(--kid-orange) / 0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Send size={20} className="text-white" />
            </motion.button>
          </div>
        </motion.div>

        {/* MODO VIAGEM — card grande, ABAIXO da barra de pergunta */}
        {onOpenTravel && (
          <motion.button
            onClick={onOpenTravel}
            className="w-full max-w-sm mt-3 mb-1 relative overflow-hidden rounded-3xl p-4 flex items-center gap-3 text-left shadow-lg border border-white/40"
            style={{
              background:
                "linear-gradient(135deg, hsl(220 75% 35%) 0%, hsl(265 65% 40%) 50%, hsl(35 90% 55%) 110%)",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileTap={{ scale: 0.97 }}
            aria-label="Abrir Modo Viagem"
          >
            {/* Stars background */}
            <div className="absolute inset-0 pointer-events-none opacity-50">
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: 2 + (i % 2) * 1.5,
                    height: 2 + (i % 2) * 1.5,
                    top: `${10 + i * 12}%`,
                    left: `${20 + i * 13}%`,
                  }}
                  animate={{ opacity: [0.2, 0.9, 0.2] }}
                  transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>

            <motion.div
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
              animate={{ rotate: [0, -6, 6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              🌍
            </motion.div>

            <div className="relative flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-wider text-amber-200 mb-0.5">
                ⭐ Aventura sonora
              </p>
              <h3 className="text-sm font-black text-white leading-tight">
                Modo Viagem
              </h3>
              <p className="text-[11px] font-semibold text-white/85 leading-tight mt-0.5">
                Explore o mundo com o KIDZZ →
              </p>
            </div>
          </motion.button>
        )}

        {/* Level & Progress — abaixo do Modo Viagem */}
        <motion.div
          className="w-full max-w-sm mt-3 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
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

/* Atalho rápido pequeno usado no topo da Home */
const QuickShortcut = ({
  onClick,
  emoji,
  label,
  gradient,
}: {
  onClick: () => void;
  emoji: string;
  label: string;
  gradient: string;
}) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.92 }}
    className="relative rounded-2xl flex flex-col items-center justify-center gap-1 py-2.5 border border-white/40 shadow-md min-h-[64px]"
    style={{ background: gradient }}
    aria-label={label}
  >
    <span className="text-xl leading-none drop-shadow-sm">{emoji}</span>
    <span className="text-[10px] font-extrabold text-white drop-shadow-sm">
      {label}
    </span>
  </motion.button>
);

export default HomeScreen;

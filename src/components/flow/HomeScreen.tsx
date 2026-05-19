import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, LogIn, Shield, Crown, Gift, BarChart3, Flame, Sparkles, Heart } from "lucide-react";
import StreakCelebration from "./StreakCelebration";
import VoiceInput from "../VoiceInput";
import ParentalGate from "../ParentalGate";
import ParentalSettings from "../ParentalSettings";
import ParentDashboard from "../parental/ParentDashboard";
import SubscribeBanner from "../SubscribeBanner";
import SoundToggle from "../SoundToggle";
import CharacterParticles, { useCharacterParticles } from "./CharacterParticles";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";
import DailyMissionCard from "@/components/flow/DailyMissionCard";
import { getTotalXp } from "@/lib/dailyMission";
import cosmicImg from "@/assets/kidzz/cosmic.webp";
import explorerImg from "@/assets/kidzz/explorer.webp";
import moonImg from "@/assets/kidzz/moon.webp";
import wellnessImg from "@/assets/kidzz/wellness.png";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";

/* ───────────────────────────── KIDZZ HOME • PREMIUM v3 ─────────────────────────────
   Premissas:
   - Hero emocional acolhedor (greeting por horário).
   - Camaleão menor, integrado ao ambiente (não dominante).
   - Pergunta sempre visível (coração do app).
   - HUD minimalista de gamificação (uma linha — sem cards pesados).
   - "Continue sua jornada" — 1 card único.
   - 3 portais premium: Brincar / Sonhos / Wellness.
   - "Hoje para você" — 3 sugestões inteligentes.
   - Modo viagem como faixa secundária discreta.
   Inspiração: Apple Fitness, Headspace, Disney+, VisionOS.
   ─────────────────────────────────────────────────────────────────────────────────── */

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
  ],
  "7-10": [
    { text: "O que existia antes do universo?", emoji: "🌌", category: "Universo" },
    { text: "Por que o tempo existe?", emoji: "⏳", category: "Universo" },
    { text: "Como os pensamentos aparecem?", emoji: "🧠", category: "Mente" },
    { text: "O que é certo e errado?", emoji: "⚖️", category: "Filosofia" },
    { text: "Por que sentimos saudade?", emoji: "❤️", category: "Emoções" },
    { text: "Como surgem as ideias?", emoji: "💡", category: "Mente" },
  ],
};

const SUGGESTION_COUNT = 3;

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

/* ── Greeting emocional contextual ── */
function getGreeting(name: string): { title: string; subtitle: string; mascot: "cosmic" | "explorer" | "moon"; ambient: string } {
  const h = new Date().getHours();
  if (h >= 5 && h < 12)
    return {
      title: `Bom dia, ${name} ☀️`,
      subtitle: "Hoje é um ótimo dia pra descobrir algo novo.",
      mascot: "explorer",
      ambient: "linear-gradient(180deg, hsl(45 90% 88% / 0.6), transparent 70%)",
    };
  if (h >= 12 && h < 18)
    return {
      title: `Olá, ${name} ✨`,
      subtitle: "Pequenos momentos também mudam a infância.",
      mascot: "cosmic",
      ambient: "linear-gradient(180deg, hsl(38 70% 88% / 0.55), transparent 70%)",
    };
  if (h >= 18 && h < 22)
    return {
      title: `Boa noite, ${name} 🌙`,
      subtitle: "Que tal criar uma memória boa antes de dormir?",
      mascot: "moon",
      ambient: "linear-gradient(180deg, hsl(270 45% 85% / 0.55), transparent 70%)",
    };
  return {
    title: `Hora de sonhar, ${name} ✨`,
    subtitle: "A imaginação trabalha melhor agora.",
    mascot: "moon",
    ambient: "linear-gradient(180deg, hsl(240 45% 85% / 0.6), transparent 70%)",
  };
}

/* ── 3 portais premium ── */
const PORTALS = [
  {
    id: "play",
    label: "Brincar",
    sub: "Jogos & energia",
    emoji: "🎮",
    img: explorerImg,
    glow: "hsl(35 90% 60% / 0.45)",
    bg: "linear-gradient(160deg, hsl(35 95% 92%) 0%, hsl(22 70% 86%) 100%)",
    ring: "hsl(35 85% 55% / 0.35)",
  },
  {
    id: "dreams",
    label: "Sonhos",
    sub: "Histórias pra dormir",
    emoji: "🌙",
    img: moonImg,
    glow: "hsl(265 60% 70% / 0.45)",
    bg: "linear-gradient(160deg, hsl(270 50% 92%) 0%, hsl(255 45% 86%) 100%)",
    ring: "hsl(265 60% 60% / 0.35)",
  },
  {
    id: "wellness",
    label: "Wellness",
    sub: "Calma & respiro",
    emoji: "🌿",
    img: wellnessImg,
    glow: "hsl(150 50% 60% / 0.4)",
    bg: "linear-gradient(160deg, hsl(150 35% 92%) 0%, hsl(160 30% 86%) 100%)",
    ring: "hsl(150 40% 50% / 0.3)",
  },
] as const;

const HomeScreen = ({
  onSubmit,
  onOpenMoments,
  onOpenAchievements,
  onOpenPlay,
  onOpenTravel,
  onOpenReferral,
  onTabChange,
}: Props) => {
  const { user, profile, canAskQuestion, questionsRemaining } = useAuth();
  const navigate = useNavigate();
  const { particles } = useCharacterParticles();
  const [input, setInput] = useState("");
  const [showParentalGateForSettings, setShowParentalGateForSettings] = useState(false);
  const [showParentalGateForDashboard, setShowParentalGateForDashboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const childName = profile?.child_name || "amigo";
  const ageRange = profile?.age_range || "3-7";
  const streakDays = profile?.streak_days ?? 0;
  const points = profile?.points ?? 0;
  const interests = (profile as any)?.child_interests as string[] | undefined;
  const ageQuestions = CATEGORIZED_QUESTIONS[ageRange] || CATEGORIZED_QUESTIONS["3-7"];

  // Filter questions by interests
  const filteredQuestions = useMemo(() => {
    if (!interests || interests.length === 0) return ageQuestions;
    const map: Record<string, string[]> = {
      "Espaço": ["Universo"],
      "Natureza": ["Natureza"],
      "Ciência": ["Mente", "Universo"],
      "Arte": ["Emoções"],
      "Animais": ["Natureza", "Animais"],
    };
    const cats = interests.flatMap((i) => map[i] || []);
    if (!cats.length) return ageQuestions;
    const matched = ageQuestions.filter((q) => cats.includes(q.category));
    const rest = ageQuestions.filter((q) => !cats.includes(q.category));
    return [...matched, ...rest];
  }, [ageQuestions, interests]);

  const isFreeLimitReached = !canAskQuestion();
  const [suggestionPage, setSuggestionPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / SUGGESTION_COUNT));
  const visibleSuggestions = filteredQuestions.slice(
    suggestionPage * SUGGESTION_COUNT,
    suggestionPage * SUGGESTION_COUNT + SUGGESTION_COUNT
  );

  useEffect(() => {
    if (totalPages <= 1) return;
    const iv = setInterval(() => setSuggestionPage((p) => (p + 1) % totalPages), 18000);
    return () => clearInterval(iv);
  }, [totalPages]);

  const greeting = useMemo(() => getGreeting(childName), [childName]);
  const xp = getTotalXp();

  const submit = (text: string) => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    haptic("light");
    sfx("click");
    onSubmit(text.trim());
  };

  const openPlans = () => {
    haptic("medium");
    sfx("click");
    window.dispatchEvent(new CustomEvent("kidzz:open-plans"));
  };

  const goPortal = (id: string) => {
    haptic("medium");
    sfx("click");
    if (id === "play") {
      if (onOpenPlay) onOpenPlay();
      else onTabChange?.("play");
    } else if (id === "dreams") onTabChange?.("dreams");
    else if (id === "wellness") onTabChange?.("wellness");
  };

  return (
    <motion.div
      className="flex-1 flex flex-col relative min-h-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <CharacterParticles particles={particles} />

      {/* ── HEADER (clean, premium) ── */}
      <header
        className="flex items-center justify-between gap-2 px-4 pb-1 relative z-10"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 14px)" }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          <img src={cosmicImg} alt="Kidzz" className="w-7 h-7 object-contain drop-shadow flex-shrink-0" />
          <span className="text-[17px] font-black text-gray-800 tracking-tight">Kidzz</span>
          {profile?.is_premium && (
            <span className="text-[9px] text-white font-extrabold bg-gradient-to-r from-kid-purple to-kid-pink px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
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
              <Gift size={15} />
            </motion.button>
          )}
          {!profile?.is_premium && (
            <motion.button
              onClick={openPlans}
              className="px-2.5 py-1.5 rounded-xl kid-gradient-premium text-white flex items-center gap-1 shadow-md"
              whileTap={{ scale: 0.9 }}
              aria-label="Assinatura"
            >
              <Crown size={13} />
              <span className="text-[10px] font-extrabold">Assinar</span>
            </motion.button>
          )}
          {!user ? (
            <motion.button
              onClick={() => navigate("/auth")}
              className="p-2 rounded-xl glass-card text-kid-green"
              whileTap={{ scale: 0.9 }}
              aria-label="Entrar"
            >
              <LogIn size={16} />
            </motion.button>
          ) : (
            <>
              <SoundToggle size={15} />
              <motion.button
                onClick={() => setShowParentalGateForSettings(true)}
                className="p-2 rounded-xl glass-card text-gray-600"
                whileTap={{ scale: 0.9 }}
                aria-label="Controle parental"
              >
                <Shield size={16} />
              </motion.button>
            </>
          )}
        </div>
      </header>

      <SubscribeBanner
        onOpenParentalGate={() => setShowParentalGateForSettings(true)}
        questionsRemaining={questionsRemaining()}
        isPremium={profile?.is_premium ?? false}
      />

      <div
        className="flex-1 min-h-0 flex flex-col items-center px-5 overflow-y-auto overscroll-contain pb-32"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* ── 1. HERO EMOCIONAL ── */}
        <section className="w-full max-w-sm relative pt-2 pb-1">
          {/* Ambient glow contextual */}
          <div
            aria-hidden
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-[320px] h-[200px] pointer-events-none rounded-full"
            style={{ background: greeting.ambient, filter: "blur(28px)" }}
          />
          <div className="relative flex items-center gap-3">
            <motion.div
              className="flex-shrink-0"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.05 }}
            >
              <KidzzChameleon
                state={greeting.mascot}
                mood="curious"
                size="md"
                showParticles={false}
                interactive={false}
              />
            </motion.div>
            <motion.div
              className="flex-1 min-w-0"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
            >
              <h1 className="text-[22px] font-black text-gray-800 leading-tight tracking-tight truncate">
                {greeting.title}
              </h1>
              <p className="text-[13px] font-medium text-gray-600 leading-snug mt-0.5">
                {greeting.subtitle}
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── 2. QUESTION BOX (coração do app) ── */}
        <motion.div
          className="w-full max-w-sm relative mt-3 mb-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 22 }}
        >
          <div
            aria-hidden
            className="absolute -inset-2 rounded-[28px] pointer-events-none opacity-60"
            style={{
              background:
                "radial-gradient(70% 90% at 50% 50%, hsl(var(--soft-gold) / 0.28), transparent 75%)",
              filter: "blur(20px)",
            }}
          />
          <div className="relative surface-premium p-2.5">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <VoiceInput onResult={submit} disabled={submitting || isFreeLimitReached} />
              </div>
              <div className="flex-1 min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit(input)}
                  placeholder={isFreeLimitReached ? "Limite atingido" : "Pergunte qualquer coisa…"}
                  className="w-full min-w-0 py-3 px-3 rounded-2xl bg-white/80 text-gray-800 text-base font-semibold placeholder:text-gray-400 placeholder:font-medium placeholder:text-sm focus:outline-none focus:ring-4 focus:ring-soft-gold/40 transition-all disabled:opacity-40 border border-white/70"
                  disabled={submitting || isFreeLimitReached}
                />
              </div>
              <motion.button
                onClick={() => submit(input)}
                disabled={!input.trim() || submitting || isFreeLimitReached}
                aria-label="Enviar pergunta"
                className="flex-shrink-0 w-11 h-11 rounded-2xl shadow-lg flex items-center justify-center disabled:opacity-30 transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--soft-gold)) 0%, hsl(35 80% 55%) 100%)",
                }}
                whileTap={{ scale: 0.88 }}
              >
                <Send size={18} className="text-white" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── 3. HUD MINIMALISTA (uma linha, leve) ── */}
        <motion.div
          className="w-full max-w-sm grid grid-cols-3 gap-2 mb-3"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <HudPill icon={<Flame size={14} className="text-orange-500" />} label="sequência" value={`${streakDays}d`} />
          <HudPill icon={<Sparkles size={14} className="text-amber-500" />} label="energia" value={`${xp}`} />
          <HudPill icon={<Heart size={14} className="text-rose-400" />} label="curiosidade" value={`${points}`} />
        </motion.div>

        {/* ── 4. CONTINUE SUA JORNADA (1 card) ── */}
        <motion.div
          className="w-full max-w-sm mb-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
        >
          <SectionLabel>Continue sua jornada</SectionLabel>
          <DailyMissionCard
            childName={childName}
            onAction={(target) => {
              if (target === "music") onTabChange?.("music");
              else if (target === "story") onTabChange?.("explore");
              else inputRef.current?.focus();
            }}
          />
        </motion.div>

        {/* ── 5. 3 PORTAIS PREMIUM ── */}
        <motion.section
          className="w-full max-w-sm mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SectionLabel>Experiências</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {PORTALS.map((p, i) => (
              <Portal key={p.id} portal={p} onClick={() => goPortal(p.id)} delay={0.05 * i} />
            ))}
          </div>
        </motion.section>

        {/* ── 6. HOJE PARA VOCÊ (3 sugestões inteligentes) ── */}
        <motion.section
          className="w-full max-w-sm mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58 }}
        >
          <SectionLabel>Hoje para você</SectionLabel>
          <AnimatePresence mode="wait">
            <motion.div
              key={suggestionPage}
              className="flex flex-col gap-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
            >
              {visibleSuggestions.map((q) => (
                <motion.button
                  key={q.text}
                  onClick={() => submit(q.text)}
                  disabled={submitting || isFreeLimitReached}
                  className="surface-premium flex items-center gap-3 px-3.5 py-3 text-left active:scale-[0.98] transition-transform disabled:opacity-40"
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="text-xl flex-shrink-0">{q.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[13px] font-bold text-gray-700 leading-snug block">
                      {q.text}
                    </span>
                    <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                      {q.category}
                    </span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* ── 7. FAIXA SECUNDÁRIA — Modo Viagem & Pais (discreta) ── */}
        <motion.div
          className="w-full max-w-sm grid grid-cols-2 gap-2 mb-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.66 }}
        >
          {onOpenTravel && (
            <button
              type="button"
              onClick={onOpenTravel}
              className="surface-premium min-h-[52px] px-3 py-2 flex items-center gap-2 text-left active:scale-[0.98] transition-transform"
            >
              <span className="text-lg">🌍</span>
              <div className="min-w-0">
                <p className="text-[11px] font-black text-gray-800 leading-tight truncate">Modo Viagem</p>
                <p className="text-[9px] text-gray-500 font-semibold truncate">Aventura sonora</p>
              </div>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowParentalGateForDashboard(true)}
            className="surface-premium min-h-[52px] px-3 py-2 flex items-center gap-2 text-left active:scale-[0.98] transition-transform"
          >
            <BarChart3 size={16} className="text-wellness-deep flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-black text-gray-800 leading-tight truncate">Para os Pais</p>
              <p className="text-[9px] text-gray-500 font-semibold truncate">Insights & controle</p>
            </div>
          </button>
        </motion.div>

        <div className="mt-3" />
      </div>

      {/* Streak celebration overlay (z-index up) */}
      <StreakCelebration streakDays={streakDays} childName={childName} previousRecord={streakDays} />

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
        {showParentalGateForDashboard && (
          <ParentalGate
            onSuccess={() => {
              setShowParentalGateForDashboard(false);
              setShowDashboard(true);
            }}
            onCancel={() => setShowParentalGateForDashboard(false)}
          />
        )}
        {showDashboard && (
          <ParentDashboard
            onClose={() => setShowDashboard(false)}
            onOpenSettings={() => {
              setShowDashboard(false);
              setShowSettings(true);
            }}
            onOpenUpgrade={() => {
              setShowDashboard(false);
              window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context: "premium_feature" } }));
            }}
          />
        )}
        {showSettings && <ParentalSettings onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};

/* ───────────────────── Subcomponentes locais ───────────────────── */

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.18em] mb-1.5 px-1">
    {children}
  </p>
);

const HudPill = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="surface-premium flex items-center gap-1.5 px-2.5 py-2 min-h-[44px] justify-center">
    {icon}
    <div className="flex flex-col leading-none">
      <span className="text-[13px] font-black text-gray-800">{value}</span>
      <span className="text-[8px] text-gray-500 font-semibold uppercase tracking-wider">{label}</span>
    </div>
  </div>
);

const Portal = ({
  portal,
  onClick,
  delay,
}: {
  portal: (typeof PORTALS)[number];
  onClick: () => void;
  delay: number;
}) => (
  <motion.button
    onClick={onClick}
    className="relative rounded-[24px] p-3 flex flex-col items-center text-center overflow-hidden active:scale-[0.96] transition-transform"
    style={{
      background: portal.bg,
      border: `1px solid ${portal.ring}`,
      boxShadow: `0 10px 28px -14px ${portal.glow}, 0 1px 0 rgba(255,255,255,0.6) inset`,
      minHeight: 128,
    }}
    initial={{ opacity: 0, y: 12, scale: 0.92 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 220, damping: 22 }}
    whileTap={{ scale: 0.94 }}
    aria-label={portal.label}
  >
    {/* Soft halo */}
    <div
      aria-hidden
      className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full pointer-events-none"
      style={{ background: `radial-gradient(circle, ${portal.glow}, transparent 70%)`, filter: "blur(12px)" }}
    />
    <motion.div
      className="relative w-14 h-14 flex items-center justify-center"
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <img
        src={portal.img}
        alt=""
        aria-hidden
        className="w-full h-full object-contain drop-shadow-lg select-none"
        draggable={false}
        decoding="async"
      />
    </motion.div>
    <p className="relative text-[12px] font-black text-gray-800 mt-1 leading-tight">{portal.label}</p>
    <p className="relative text-[9px] font-semibold text-gray-600/80 leading-tight mt-0.5">
      {portal.sub}
    </p>
  </motion.button>
);

export default HomeScreen;

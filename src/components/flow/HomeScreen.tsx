import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Shield, Crown, Gift, Bell, Mic, Sparkles, Leaf, Heart, ChevronRight } from "lucide-react";
import StreakCelebration from "./StreakCelebration";
import ParentalGate from "../ParentalGate";
import ParentalSettings from "../ParentalSettings";
import ParentDashboard from "../parental/ParentDashboard";
import SubscribeBanner from "../SubscribeBanner";
import SoundToggle from "../SoundToggle";
import CharacterParticles, { useCharacterParticles } from "./CharacterParticles";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";
import { getTotalXp } from "@/lib/dailyMission";
import explorerImg from "@/assets/kidzz/explorer.webp";
import moonImg from "@/assets/kidzz/moon.webp";
import wellnessImg from "@/assets/kidzz/wellness.png";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";
import SOSCard from "@/components/sos/SOSCard";
import SOSModal from "@/components/sos/SOSModal";
import RitualCard from "@/components/rituals/RitualCard";
import RitualFlow from "@/components/rituals/RitualFlow";
import { getCurrentRitual } from "@/components/rituals/rituals";
import DecompressionCard from "@/components/decompress/DecompressionCard";
import SleepCard from "@/components/sleep/SleepCard";
import SleepMode from "@/components/sleep/SleepMode";
import DecompressionMode from "@/components/decompress/DecompressionMode";
import ConnectionMeter from "@/components/connection/ConnectionMeter";
import ContextualNudge from "@/components/nudges/ContextualNudge";

/* ───────────── KIDZZ HOME • PREMIUM v4 — WHITER / CLEANER / CALMER ─────────────
   Foco: respirável, sofisticado, Apple + Calm + Pixar.
   - Logo KIDZZ centralizado, sem coração, com glow branco suave.
   - Topo: greeting clean (sem foto), notificação + presente discretos.
   - HUD reduzido a 2 mini pills (Energia / Conexão).
   - Card pergunta editorial com mic verde metalizado + CTA "Perguntar".
   - Banner rotativo (Histórias / Wellness / Brincar / Música / Rotina / Sonhos).
   - Cards "Hoje para você" mais brancos, suaves.
   - Dock 2 linhas vem do BottomNav.
   ──────────────────────────────────────────────────────────────────────────── */

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

/* ── Greeting contextual ── */
function getGreeting(name: string): { title: string; subtitle: string; mascot: "cosmic" | "explorer" | "moon" } {
  const h = new Date().getHours();
  if (h >= 5 && h < 12)
    return { title: `Bom dia, ${name} ☀️`, subtitle: "Que bom ter você aqui.", mascot: "explorer" };
  if (h >= 12 && h < 18)
    return { title: `Olá, ${name} ✨`, subtitle: "Pequenos momentos criam grandes memórias.", mascot: "cosmic" };
  if (h >= 18 && h < 22)
    return { title: `Boa noite, ${name} 🌙`, subtitle: "Vamos descobrir algo juntos antes de dormir?", mascot: "moon" };
  return { title: `Hora de sonhar, ${name} ✨`, subtitle: "A imaginação trabalha melhor agora.", mascot: "moon" };
}

/* ── Banners rotativos ── */
const BANNERS = [
  {
    id: "story",
    eyebrow: "Continue sua jornada",
    title: "Hora da história",
    sub: "Vocês estavam em \u201cA floresta dos sonhos\u201d.",
    cta: "Continuar",
    target: "explore",
    img: moonImg,
    tint: "hsl(85 30% 60%)",
    bg: "linear-gradient(135deg, hsl(0 0% 100% / 0.85) 0%, hsl(85 40% 94% / 0.85) 100%)",
  },
  {
    id: "wellness",
    eyebrow: "Momento calmo",
    title: "Respire juntos",
    sub: "3 minutos de respiração guiada.",
    cta: "Iniciar",
    target: "wellness",
    img: wellnessImg,
    tint: "hsl(150 45% 55%)",
    bg: "linear-gradient(135deg, hsl(0 0% 100% / 0.85) 0%, hsl(140 35% 94% / 0.85) 100%)",
  },
  {
    id: "play",
    eyebrow: "Aventura do dia",
    title: "Vamos brincar?",
    sub: "Uma atividade nova esperando vocês.",
    cta: "Descobrir",
    target: "play",
    img: explorerImg,
    tint: "hsl(28 80% 60%)",
    bg: "linear-gradient(135deg, hsl(0 0% 100% / 0.85) 0%, hsl(35 40% 94% / 0.85) 100%)",
  },
] as const;

const HomeScreen = ({
  onSubmit,
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
  const [bannerIdx, setBannerIdx] = useState(0);
  const [sosOpen, setSosOpen] = useState(false);
  const [ritualOpen, setRitualOpen] = useState(false);
  const [decompressOpen, setDecompressOpen] = useState(false);
  const [sleepOpen, setSleepOpen] = useState(false);
  const currentRitual = useMemo(() => getCurrentRitual(), []);
  const showDecompress = useMemo(() => {
    const h = new Date().getHours();
    return h >= 16 && h < 21; // janela do reencontro
  }, []);
  const showSleep = useMemo(() => {
    const h = new Date().getHours();
    return h >= 20 || h < 5; // janela noturna
  }, []);
  const inputRef = useRef<HTMLInputElement>(null);

  const childName = profile?.child_name || "amigo";
  const ageRange = profile?.age_range || "3-7";
  const points = profile?.points ?? 0;
  const interests = (profile as any)?.child_interests as string[] | undefined;
  const ageQuestions = CATEGORIZED_QUESTIONS[ageRange] || CATEGORIZED_QUESTIONS["3-7"];

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

  // Banner auto-rotate
  useEffect(() => {
    const iv = setInterval(() => setBannerIdx((i) => (i + 1) % BANNERS.length), 6000);
    return () => clearInterval(iv);
  }, []);

  const greeting = useMemo(() => getGreeting(childName), [childName]);
  const xp = getTotalXp();
  const streakDays = profile?.streak_days ?? 0;

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

  const goBannerTarget = (target: string) => {
    haptic("medium");
    sfx("click");
    if (target === "play" && onOpenPlay) onOpenPlay();
    else onTabChange?.(target);
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

      {/* ── HEADER PREMIUM: KIDZZ centralizado + ações discretas ── */}
      <header
        className="relative flex items-center justify-between gap-2 px-4 pb-1 z-10"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 14px)" }}
      >
        {/* esquerda — sound + premium badge */}
        <div className="flex items-center gap-1.5 flex-1">
          {user && <SoundToggle size={14} />}
          {profile?.is_premium && (
            <span
              className="text-[9px] text-white font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm"
              style={{ background: "linear-gradient(135deg, hsl(var(--kid-purple)), hsl(var(--kid-pink)))" }}
            >
              <Crown size={9} /> Premium
            </span>
          )}
        </div>

        {/* centro — KIDZZ wordmark com glow branco suave */}
        <div className="relative flex-shrink-0 select-none pointer-events-none">
          <div
            aria-hidden
            className="absolute inset-0 -m-2 rounded-full"
            style={{
              background: "radial-gradient(ellipse, hsl(0 0% 100% / 0.7), transparent 70%)",
              filter: "blur(10px)",
            }}
          />
          <span
            className="relative text-[19px] font-black tracking-[0.2em]"
            style={{
              color: "hsl(var(--premium-ink))",
              textShadow: "0 1px 0 hsl(0 0% 100% / 0.9), 0 0 12px hsl(0 0% 100% / 0.6)",
            }}
          >
            KIDZZ
          </span>
        </div>

        {/* direita — gift + bell + parental */}
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          {onOpenReferral && user && (
            <motion.button
              onClick={() => { haptic("light"); sfx("click"); onOpenReferral(); }}
              className="relative w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: "hsl(0 0% 100% / 0.8)",
                border: "1px solid hsl(0 0% 100% / 0.7)",
                boxShadow: "0 4px 12px -6px hsl(85 28% 40% / 0.25)",
                backdropFilter: "blur(12px)",
              }}
              whileTap={{ scale: 0.9 }}
              aria-label="Convide amigos"
            >
              <Gift size={14} style={{ color: "hsl(var(--wellness-deep))" }} />
              <span
                aria-hidden
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                style={{ background: "hsl(var(--kidzz-green))", boxShadow: "0 0 6px hsl(var(--kidzz-green))" }}
              />
            </motion.button>
          )}
          <motion.button
            onClick={() => setShowParentalGateForDashboard(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: "hsl(0 0% 100% / 0.8)",
              border: "1px solid hsl(0 0% 100% / 0.7)",
              boxShadow: "0 4px 12px -6px hsl(100 15% 18% / 0.18)",
              backdropFilter: "blur(12px)",
            }}
            whileTap={{ scale: 0.9 }}
            aria-label="Notificações"
          >
            <Bell size={14} style={{ color: "hsl(var(--premium-ink-soft))" }} />
          </motion.button>
          {!user ? (
            <motion.button
              onClick={() => navigate("/auth")}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: "hsl(0 0% 100% / 0.8)",
                border: "1px solid hsl(0 0% 100% / 0.7)",
                backdropFilter: "blur(12px)",
              }}
              whileTap={{ scale: 0.9 }}
              aria-label="Entrar"
            >
              <LogIn size={14} style={{ color: "hsl(var(--wellness-deep))" }} />
            </motion.button>
          ) : (
            <motion.button
              onClick={() => setShowParentalGateForSettings(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: "hsl(0 0% 100% / 0.8)",
                border: "1px solid hsl(0 0% 100% / 0.7)",
                backdropFilter: "blur(12px)",
              }}
              whileTap={{ scale: 0.9 }}
              aria-label="Controle parental"
            >
              <Shield size={14} style={{ color: "hsl(var(--premium-ink-soft))" }} />
            </motion.button>
          )}
        </div>
      </header>

      <SubscribeBanner
        onOpenParentalGate={() => setShowParentalGateForSettings(true)}
        questionsRemaining={questionsRemaining()}
        isPremium={profile?.is_premium ?? false}
      />

      <div
        className="flex-1 min-h-0 flex flex-col items-center px-5 overflow-y-auto overscroll-contain pb-44"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* ── 1. HERO — greeting clean + camaleão invadindo ── */}
        <section className="w-full max-w-sm relative pt-3 pb-2">
          <div className="relative flex items-start gap-2">
            <motion.div
              className="flex-1 min-w-0 pt-1"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <h1
                className="text-[26px] font-black leading-[1.1] tracking-tight"
                style={{ color: "hsl(var(--premium-ink))" }}
              >
                {greeting.title.split(",")[0]},{" "}
                <span style={{ color: "hsl(var(--kidzz-green-deep))" }}>
                  {greeting.title.split(",")[1]?.trim() || childName}
                </span>
              </h1>
              <p
                className="text-[13px] font-medium leading-snug mt-1.5"
                style={{ color: "hsl(var(--premium-ink-soft))" }}
              >
                {greeting.subtitle}
              </p>
            </motion.div>

            {/* Camaleão invadindo o lado direito do hero */}
            <motion.div
              className="flex-shrink-0 -mr-3 -mt-2"
              initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.05 }}
            >
              <KidzzChameleon
                state={greeting.mascot}
                mood="curious"
                size="lg"
                showParticles={false}
                interactive={false}
              />
            </motion.div>
          </div>
        </section>

        {/* ── 1.5 TERMÔMETRO DE CONEXÃO — coração emocional da família ── */}
        <div className="mb-3">
          <ConnectionMeter />
        </div>

        {/* ── 1.6 NUDGE CONTEXTUAL — sussurro inteligente ── */}
        <div className="w-full max-w-sm mb-3">
          <ContextualNudge
            onAction={(a) => {
              if (a === "ritual") setRitualOpen(true);
              else if (a === "decompress") setDecompressOpen(true);
              else if (a === "moment-add") {
                onTabChange?.("moments");
                setTimeout(() => window.dispatchEvent(new CustomEvent("kidzz:open-moment-add")), 200);
              }
            }}
          />
        </div>





        {/* ── 2. HUD MINI — apenas Energia + Conexão ── */}
        <motion.div
          className="w-full max-w-sm flex items-center justify-end gap-2 mb-3 -mt-2"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MiniPill
            icon={<Leaf size={11} style={{ color: "hsl(var(--kidzz-green-deep))" }} />}
            label="Energia"
            value={xp}
          />
          <MiniPill
            icon={<Heart size={11} className="text-rose-400 fill-rose-300" />}
            label="Conexão"
            value={Math.max(1, Math.floor(points / 10))}
          />
        </motion.div>

        {/* ── 3. CARD PRINCIPAL — PERGUNTAS (coração do app) ── */}
        <motion.section
          className="w-full max-w-sm relative mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, type: "spring", stiffness: 200, damping: 24 }}
        >
          {/* halo branco premium */}
          <div
            aria-hidden
            className="absolute -inset-3 rounded-[32px] pointer-events-none"
            style={{
              background:
                "radial-gradient(70% 90% at 50% 30%, hsl(0 0% 100% / 0.5), transparent 75%)",
              filter: "blur(20px)",
            }}
          />
          <div className="relative surface-premium px-5 py-5">
            <div className="flex items-start gap-2 mb-3">
              <Sparkles size={16} className="mt-1 flex-shrink-0" style={{ color: "hsl(var(--kidzz-green-deep))" }} />
              <div className="min-w-0">
                <h2
                  className="text-[22px] font-black leading-[1.1] tracking-tight"
                  style={{ color: "hsl(var(--premium-ink))", fontFamily: "Nunito, system-ui" }}
                >
                  Me pergunte qualquer coisa!
                </h2>
                <p
                  className="text-[12px] font-medium leading-snug mt-1.5"
                  style={{ color: "hsl(var(--premium-ink-soft))" }}
                >
                  Descubra respostas e crie conversas incríveis juntos.
                </p>
              </div>
            </div>

            {/* Input + mic + ask */}
            <div className="flex items-center gap-2">
              {/* MIC verde metalizado premium */}
              <motion.button
                type="button"
                aria-label="Falar com Kidzz"
                onClick={() => { haptic("medium"); sfx("click"); }}
                className="mic-metallic relative w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                whileTap={{ scale: 0.92 }}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Mic size={18} strokeWidth={2.4} />
              </motion.button>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit(input)}
                placeholder={isFreeLimitReached ? "Limite atingido" : "Digite ou pergunte…"}
                className="flex-1 min-w-0 py-3 px-3 rounded-2xl text-[15px] font-semibold focus:outline-none transition-all disabled:opacity-40"
                style={{
                  background: "hsl(0 0% 100% / 0.7)",
                  border: "1px solid hsl(85 25% 88% / 0.8)",
                  color: "hsl(var(--premium-ink))",
                }}
                disabled={submitting || isFreeLimitReached}
              />
            </div>

            {/* CTA Perguntar — premium green/white gradient */}
            <motion.button
              type="button"
              onClick={() => submit(input)}
              disabled={!input.trim() || submitting || isFreeLimitReached}
              className="btn-ask-premium relative mt-3 w-full py-3 rounded-2xl text-[14px] font-black tracking-tight flex items-center justify-center gap-1.5 disabled:opacity-40 overflow-hidden"
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -1 }}
            >
              <span className="shine-overlay" aria-hidden />
              <span className="relative">Perguntar</span>
              <Sparkles size={14} className="relative" />
            </motion.button>
          </div>
        </motion.section>

        {/* ── 3.5 SOS KIDZZ — acolhimento emocional ── */}
        <SOSCard onOpen={() => setSosOpen(true)} />

        {/* ── 3.6 RITUAL DA FAMÍLIA — contextual por hora do dia ── */}
        <div className="w-full max-w-sm mt-3">
          <RitualCard onOpen={() => setRitualOpen(true)} />
        </div>

        {/* ── 3.7 DECOMPRESSÃO — janela do reencontro (16h–21h) ── */}
        {showDecompress && (
          <div className="w-full max-w-sm mt-3">
            <DecompressionCard onOpen={() => setDecompressOpen(true)} />
          </div>
        )}

        {/* ── 3.8 MODO DORMIR — janela noturna (20h+) ── */}
        {showSleep && (
          <div className="w-full max-w-sm mt-3">
            <SleepCard onOpen={() => setSleepOpen(true)} />
          </div>
        )}






        {/* ── 4. BANNER ROTATIVO PREMIUM ── */}
        <motion.section
          className="w-full max-w-sm mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46 }}
        >
          <div className="relative h-[150px] rounded-[24px] overflow-hidden">
            <AnimatePresence mode="wait">
              {BANNERS.map((b, i) =>
                i === bannerIdx ? (
                  <motion.button
                    key={b.id}
                    type="button"
                    onClick={() => goBannerTarget(b.target)}
                    className="absolute inset-0 text-left p-4 flex items-center gap-3 overflow-hidden"
                    style={{
                      background: b.bg,
                      border: "1px solid hsl(0 0% 100% / 0.7)",
                      backdropFilter: "blur(22px)",
                      boxShadow: `0 12px 32px -18px ${b.tint.replace(")", " / 0.4)")}`,
                      borderRadius: 24,
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1 mb-1"
                        style={{ color: b.tint }}
                      >
                        <Sparkles size={10} />
                        {b.eyebrow}
                      </p>
                      <h3
                        className="text-[18px] font-black leading-tight tracking-tight"
                        style={{ color: "hsl(var(--premium-ink))" }}
                      >
                        {b.title}
                      </h3>
                      <p
                        className="text-[11px] font-medium leading-snug mt-1"
                        style={{ color: "hsl(var(--premium-ink-soft))" }}
                      >
                        {b.sub}
                      </p>
                      <span
                        className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-[11px] font-black text-white"
                        style={{ background: b.tint, boxShadow: `0 4px 12px -4px ${b.tint.replace(")", " / 0.5)")}` }}
                      >
                        {b.cta} <ChevronRight size={12} />
                      </span>
                    </div>
                    <img
                      src={b.img}
                      alt=""
                      aria-hidden
                      className="w-20 h-20 object-contain drop-shadow-lg flex-shrink-0"
                      draggable={false}
                    />
                  </motion.button>
                ) : null
              )}
            </AnimatePresence>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {BANNERS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setBannerIdx(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === bannerIdx ? 16 : 5,
                    height: 5,
                    background: i === bannerIdx ? "hsl(var(--kidzz-green-deep))" : "hsl(100 10% 60% / 0.4)",
                  }}
                  aria-label={`Banner ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── 5. HOJE PARA VOCÊ — sugestões clean ── */}
        <motion.section
          className="w-full max-w-sm mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.56 }}
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <p
              className="text-[11px] font-black uppercase tracking-[0.16em]"
              style={{ color: "hsl(var(--premium-ink-soft))" }}
            >
              Hoje para você ✨
            </p>
            {onOpenAchievements && (
              <button
                type="button"
                onClick={() => { haptic("light"); sfx("click"); onOpenAchievements(); }}
                className="text-[10px] font-black flex items-center gap-0.5"
                style={{ color: "hsl(var(--kidzz-green-deep))" }}
              >
                Ver todas <ChevronRight size={10} />
              </button>
            )}
          </div>
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
                  className="flex items-center gap-3 px-4 py-3 text-left active:scale-[0.98] transition-transform disabled:opacity-40 rounded-2xl"
                  style={{
                    background: "hsl(0 0% 100% / 0.82)",
                    border: "1px solid hsl(0 0% 100% / 0.7)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 6px 18px -12px hsl(100 15% 18% / 0.15)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-xl flex-shrink-0">{q.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <span
                      className="text-[13px] font-bold leading-snug block"
                      style={{ color: "hsl(var(--premium-ink))" }}
                    >
                      {q.text}
                    </span>
                    <span
                      className="text-[9px] font-semibold uppercase tracking-wider"
                      style={{ color: "hsl(var(--kidzz-green-deep) / 0.7)" }}
                    >
                      {q.category}
                    </span>
                  </div>
                  <ChevronRight size={14} style={{ color: "hsl(var(--premium-ink-soft) / 0.5)" }} />
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.section>

        {/* ── 6. JORNADA DA FAMÍLIA (discreto) ── */}
        <motion.div
          className="w-full max-w-sm mb-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.66 }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: "hsl(0 0% 100% / 0.7)",
              border: "1px solid hsl(0 0% 100% / 0.65)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "hsl(var(--kidzz-green-soft))" }}
            >
              <Heart size={16} style={{ color: "hsl(var(--wellness-deep))" }} fill="currentColor" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-black" style={{ color: "hsl(var(--premium-ink))" }}>
                Jornada da família
              </p>
              <p className="text-[10px] font-medium" style={{ color: "hsl(var(--premium-ink-soft))" }}>
                {streakDays} dias juntos · {points} momentos
              </p>
            </div>
            {onOpenTravel && (
              <button
                type="button"
                onClick={onOpenTravel}
                className="text-[10px] font-black px-2.5 py-1 rounded-full"
                style={{
                  background: "hsl(var(--kidzz-green-soft))",
                  color: "hsl(var(--wellness-deep))",
                }}
              >
                Viagem
              </button>
            )}
          </div>
        </motion.div>

        <div className="mt-2" />
      </div>

      <StreakCelebration streakDays={streakDays} childName={childName} previousRecord={streakDays} />

      <AnimatePresence>
        {showParentalGateForSettings && (
          <ParentalGate
            onSuccess={() => { setShowParentalGateForSettings(false); setShowSettings(true); }}
            onCancel={() => setShowParentalGateForSettings(false)}
          />
        )}
        {showParentalGateForDashboard && (
          <ParentalGate
            onSuccess={() => { setShowParentalGateForDashboard(false); setShowDashboard(true); }}
            onCancel={() => setShowParentalGateForDashboard(false)}
          />
        )}
        {showDashboard && (
          <ParentDashboard
            onClose={() => setShowDashboard(false)}
            onOpenSettings={() => { setShowDashboard(false); setShowSettings(true); }}
            onOpenUpgrade={() => {
              setShowDashboard(false);
              window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context: "premium_feature" } }));
            }}
          />
        )}
        {showSettings && <ParentalSettings onClose={() => setShowSettings(false)} />}
      </AnimatePresence>

      {/* ── SOS Kidzz Modal — bottom sheet cinemático ── */}
      <SOSModal
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        onGoWellness={() => onTabChange?.("wellness")}
      />

      {/* ── Ritual da Família — flow cinemático full-screen ── */}
      <RitualFlow ritual={currentRitual} open={ritualOpen} onClose={() => setRitualOpen(false)} />

      {/* ── Modo Decompressão — 60s só para o adulto ── */}
      <DecompressionMode open={decompressOpen} onClose={() => setDecompressOpen(false)} />

      {/* ── Modo Dormir — boa noite cinemática ── */}
      <SleepMode open={sleepOpen} onClose={() => setSleepOpen(false)} childName={childName} />
    </motion.div>
  );
};

/* ───── subcomponentes ───── */
const MiniPill = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) => (
  <div
    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
    style={{
      background: "hsl(0 0% 100% / 0.78)",
      border: "1px solid hsl(0 0% 100% / 0.7)",
      backdropFilter: "blur(14px)",
      boxShadow: "0 2px 8px -4px hsl(100 15% 18% / 0.12)",
      minHeight: 28,
    }}
  >
    {icon}
    <span className="text-[11px] font-black leading-none" style={{ color: "hsl(var(--premium-ink))" }}>
      {value}
    </span>
    <span
      className="text-[9px] font-semibold uppercase tracking-wider leading-none"
      style={{ color: "hsl(var(--premium-ink-soft))" }}
    >
      {label}
    </span>
  </div>
);

export default HomeScreen;

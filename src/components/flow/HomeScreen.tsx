import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Shield, Crown, Gift, Bell, Mic, Sparkles, Leaf, Heart, ChevronRight, Volume2, Moon } from "lucide-react";
import StreakCelebration from "./StreakCelebration";
import ParentalGate from "../ParentalGate";
import ParentalSettings from "../ParentalSettings";
import ParentDashboard from "../parental/ParentDashboard";
import SoundToggle from "../SoundToggle";
import CharacterParticles, { useCharacterParticles } from "./CharacterParticles";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getTotalXp } from "@/lib/dailyMission";
import chameleonAsset from "@/assets/kidzz/chameleon-heart.png.asset.json";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";
import SOSModal from "@/components/sos/SOSModal";
import RitualFlow from "@/components/rituals/RitualFlow";
import { getCurrentRitual } from "@/components/rituals/rituals";
import DecompressionMode from "@/components/decompress/DecompressionMode";
import SleepMode from "@/components/sleep/SleepMode";

/* ─────────── KIDZZ HOME • CARTÃO POSTAL EMOCIONAL ───────────
   Liquid Glass apenas no chrome (header/dock/pílulas).
   Conteúdo sólido em creme. Camaleão respira. Resto estático.
   ─────────────────────────────────────────────────────────── */

const CREAM = "#FFFCF8";
const CREAM_2 = "#FBF7EF";
const INK = "#2A2520";
const INK_SOFT = "#6B6258";
const SAGE = "#7FB069";
const SAGE_DEEP = "#46703A";
const AMBER = "#E8821A";
const GOLD = "#E2B64C";

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

const SUGGESTION_COUNT = 4;

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

function getGreeting(name: string): { title: string; subtitle: string; icon: string } {
  const h = new Date().getHours();
  if (h >= 5 && h < 12)
    return { title: `Bom dia, ${name}`, subtitle: "Que bom ver vocês juntos agora.", icon: "☀️" };
  if (h >= 12 && h < 18)
    return { title: `Olá, ${name}`, subtitle: "Pequenos momentos criam grandes memórias.", icon: "✨" };
  if (h >= 18 && h < 22)
    return { title: `Boa noite, ${name}`, subtitle: "Vamos descobrir algo juntos antes de dormir?", icon: "🌙" };
  return { title: `Hora de sonhar, ${name}`, subtitle: "A imaginação trabalha melhor agora.", icon: "🌙" };
}

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
  const [sosOpen, setSosOpen] = useState(false);
  const [ritualOpen, setRitualOpen] = useState(false);
  const [decompressOpen, setDecompressOpen] = useState(false);
  const [sleepOpen, setSleepOpen] = useState(false);
  const currentRitual = useMemo(() => getCurrentRitual(), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastTopic, setLastTopic] = useState<{ question: string; when: string } | null>(null);
  const isPremium = profile?.is_premium ?? false;

  useEffect(() => {
    if (!isPremium || !user) return;
    let cancelled = false;
    const today = new Date(); today.setHours(0,0,0,0);
    const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    (async () => {
      try {
        const { data } = await supabase
          .from("kidzz_questions_log")
          .select("question, created_at")
          .eq("user_id", user.id)
          .gte("created_at", sevenDaysAgo.toISOString())
          .lt("created_at", today.toISOString())
          .order("created_at", { ascending: false })
          .limit(1);
        if (cancelled) return;
        if (data && data[0]) {
          const d = new Date(data[0].created_at);
          const diff = Math.floor((today.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000);
          const when = diff === 1 ? "Ontem" : `Há ${diff} dias`;
          setLastTopic({ question: data[0].question, when });
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [isPremium, user]);

  const childName = profile?.child_name || "amigo";
  const ageRange = profile?.age_range || "3-7";
  const points = profile?.points ?? 0;
  const questionsUsed = profile?.questions_used ?? 0;
  const streakDays = profile?.streak_days ?? 0;
  const interests = (profile as any)?.child_interests as string[] | undefined;
  const ageQuestions = CATEGORIZED_QUESTIONS[ageRange] || CATEGORIZED_QUESTIONS["3-7"];

  const filteredQuestions = useMemo(() => {
    if (!interests || interests.length === 0) return ageQuestions;
    const map: Record<string, string[]> = {
      "Espaço": ["Universo"], "Natureza": ["Natureza"],
      "Ciência": ["Mente", "Universo"], "Arte": ["Emoções"],
      "Animais": ["Natureza", "Animais"],
    };
    const cats = interests.flatMap((i) => map[i] || []);
    if (!cats.length) return ageQuestions;
    const matched = ageQuestions.filter((q) => cats.includes(q.category));
    const rest = ageQuestions.filter((q) => !cats.includes(q.category));
    return [...matched, ...rest];
  }, [ageQuestions, interests]);

  const isFreeLimitReached = !canAskQuestion();
  const visibleSuggestions = filteredQuestions.slice(0, SUGGESTION_COUNT);
  const greeting = useMemo(() => getGreeting(childName), [childName]);
  const xp = getTotalXp();
  const connection = Math.max(0, Math.floor(points / 10));
  const level = profile?.level ?? 1;

  const h = new Date().getHours();
  const isNight = h >= 19 || h < 5;
  const heroCTA = isNight
    ? { label: "Ritual do sono", action: () => setRitualOpen(true), icon: <Moon size={16} /> }
    : { label: "Viver este momento", action: () => setRitualOpen(true), icon: <Sparkles size={16} /> };

  const submit = (text: string) => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    haptic("light"); sfx("click");
    onSubmit(text.trim());
  };

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  useEffect(() => () => { try { recognitionRef.current?.stop(); } catch {} }, []);

  const toggleMic = () => {
    haptic("medium"); sfx("click");
    if (isFreeLimitReached || submitting) return;
    if (isListening) { try { recognitionRef.current?.stop(); } catch {}; setIsListening(false); return; }
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { import("sonner").then(({ toast }) => toast.error("Seu navegador não suporta voz. Use Chrome ou Safari! 🎤")); return; }
    const recognition = new SR();
    recognition.lang = "pt-BR"; recognition.continuous = false; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[event.results.length - 1]?.[0]?.transcript?.trim();
      if (transcript) { setInput(transcript); submit(transcript); }
    };
    recognition.onerror = (event: any) => {
      setIsListening(false); recognitionRef.current = null;
      import("sonner").then(({ toast }) => {
        if (event.error === "not-allowed") toast.error("Permita o acesso ao microfone! 🎤");
        else if (event.error === "no-speech") toast.error("Não ouvi nada. Tente de novo! 🎤");
        else if (event.error !== "aborted") toast.error("Erro no reconhecimento de voz. 🎤");
      });
    };
    recognition.onend = () => { setIsListening(false); recognitionRef.current = null; };
    recognitionRef.current = recognition;
    try { recognition.start(); setIsListening(true); } catch { setIsListening(false); recognitionRef.current = null; }
  };

  const openPlans = () => {
    haptic("medium"); sfx("click");
    window.dispatchEvent(new CustomEvent("kidzz:open-plans"));
  };

  // Liquid Glass token (chrome only)
  const glass: React.CSSProperties = {
    background: "rgba(255,252,248,0.55)",
    backdropFilter: "blur(24px) saturate(140%)",
    WebkitBackdropFilter: "blur(24px) saturate(140%)",
    border: "1px solid rgba(255,255,255,0.6)",
    boxShadow: "0 8px 32px rgba(42,37,32,0.10)",
  };

  return (
    <motion.div className="flex-1 flex flex-col relative min-h-0" style={{ background: `linear-gradient(180deg, ${CREAM} 0%, ${CREAM_2} 100%)` }}>
      <CharacterParticles particles={particles} />

      {/* ── HEADER LIQUID GLASS ── */}
      <header
        className="fixed top-0 left-0 right-0 z-[80] flex items-center justify-between gap-2 px-3"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
          paddingBottom: 8,
          ...glass,
          borderRadius: 0,
          borderTop: "none",
          borderBottom: "1px solid rgba(42,37,32,0.06)",
        }}
      >
        {/* esquerda — som + premium */}
        <div className="flex items-center gap-1.5 flex-1">
          {user && (
            <button
              type="button"
              className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95"
              style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(42,37,32,0.06)" }}
              aria-label="Som"
            >
              <SoundToggle size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={openPlans}
            className="min-h-[36px] px-3 rounded-full text-white text-[11px] font-extrabold flex items-center gap-1 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${SAGE} 0%, ${AMBER} 100%)`,
              boxShadow: `0 6px 14px -4px ${AMBER}66, inset 0 1px 0 rgba(255,255,255,.4)`,
              fontFamily: "'Mulish', system-ui, sans-serif",
            }}
            aria-label={isPremium ? "Você é Premium" : "Assinar Premium"}
          >
            <Crown size={12} /> {isPremium ? "Premium" : "Assinar"}
          </button>
        </div>

        {/* centro — KIDZZ */}
        <div
          className="flex-shrink-0 select-none px-3 py-1 rounded-full"
          style={{ ...glass, borderRadius: 999 }}
        >
          <span
            className="text-[16px] tracking-[0.22em] leading-none"
            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 900, color: SAGE_DEEP }}
          >
            KIDZZ
          </span>
        </div>

        {/* direita — presente + sino + escudo (cluster glass) */}
        <div
          className="flex items-center gap-1 flex-1 justify-end p-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(42,37,32,0.06)" }}
        >
          {onOpenReferral && user && (
            <button
              onClick={() => { haptic("light"); sfx("click"); onOpenReferral(); }}
              className="relative w-10 h-10 rounded-full flex items-center justify-center active:scale-95"
              aria-label="Convide amigos"
            >
              <Gift size={16} style={{ color: SAGE_DEEP }} />
              <span aria-hidden className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: SAGE, boxShadow: `0 0 6px ${SAGE}` }} />
            </button>
          )}
          <button
            onClick={() => setShowParentalGateForDashboard(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95"
            aria-label="Notificações"
          >
            <Bell size={16} style={{ color: INK_SOFT }} />
          </button>
          {!user ? (
            <button
              onClick={() => navigate("/auth")}
              className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95"
              aria-label="Entrar"
            >
              <LogIn size={16} style={{ color: SAGE_DEEP }} />
            </button>
          ) : (
            <button
              onClick={() => setShowParentalGateForSettings(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95"
              aria-label="Controle dos Pais"
            >
              <Shield size={16} style={{ color: SAGE_DEEP }} />
            </button>
          )}
        </div>
      </header>

      {/* ── CONTEÚDO ── */}
      <div
        className="flex-1 min-h-0 flex flex-col items-center px-5 overflow-y-auto overscroll-contain"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 78px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 180px)",
        }}
      >
        {/* ── FAIXA STREAK ── */}
        <div className="w-full max-w-sm mb-3 flex justify-center">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full"
            style={{ ...glass, borderRadius: 999 }}
          >
            <span style={{ color: GOLD }}>⭐</span>
            <span className="text-[12px] font-extrabold" style={{ color: SAGE_DEEP, fontFamily: "'Mulish', system-ui, sans-serif" }}>
              Kidzz Ativo · {questionsUsed} pergunta{questionsUsed === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* ── 1. CARTÃO POSTAL / HERÓI ── */}
        <section
          className="w-full max-w-sm relative mb-4 overflow-hidden"
          style={{
            borderRadius: 28,
            background: CREAM,
            border: `1px solid rgba(127,176,105,0.18)`,
            boxShadow: "0 18px 42px -22px rgba(42,37,32,0.22), inset 0 1px 0 rgba(255,255,255,.95)",
          }}
        >
          {/* fundo sálvia→creme suave (placeholder de foto família) */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(120% 80% at 100% 0%, ${SAGE}22 0%, transparent 55%), linear-gradient(180deg, ${CREAM} 0%, ${CREAM_2} 100%)`,
            }}
          />

          <div className="relative p-5 pb-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h1
                  className="leading-[1.05] tracking-tight"
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontWeight: 600,
                    fontSize: 30,
                    color: INK,
                  }}
                >
                  {greeting.title.split(",")[0]},
                  <br />
                  <span style={{ color: SAGE_DEEP, fontWeight: 700 }}>
                    {greeting.title.split(",")[1]?.trim() || childName}
                  </span>{" "}
                  <span style={{ fontSize: 22 }}>{greeting.icon}</span>
                </h1>
                <p
                  className="mt-2 text-[14px] leading-snug"
                  style={{ color: INK_SOFT, fontFamily: "'Mulish', system-ui, sans-serif", maxWidth: 220 }}
                >
                  {greeting.subtitle}
                </p>
              </div>

              {/* Camaleão respirando */}
              <motion.div
                className="flex-shrink-0 relative"
                style={{
                  width: 112, height: 112,
                  filter: `drop-shadow(0 12px 18px ${SAGE}55) drop-shadow(0 0 24px ${SAGE}33)`,
                }}
                animate={{ y: [0, -4, 0], scale: [1, 1.02, 1] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* halo sálvia */}
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{ background: `radial-gradient(circle, ${SAGE}33 0%, transparent 65%)`, filter: "blur(8px)" }}
                />
                <img
                  src={chameleonAsset.url}
                  alt="Kidzz, o camaleão"
                  className="relative w-full h-full object-contain"
                  draggable={false}
                />
              </motion.div>
            </div>

            {/* CTA único */}
            <button
              type="button"
              onClick={() => { haptic("medium"); sfx("click"); heroCTA.action(); }}
              className="mt-4 w-full min-h-[48px] rounded-2xl text-white text-[15px] font-extrabold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              style={{
                background: `linear-gradient(180deg, ${SAGE} 0%, ${SAGE_DEEP} 100%)`,
                boxShadow: `0 10px 22px -8px ${SAGE_DEEP}66, inset 0 1px 0 rgba(255,255,255,.35)`,
                fontFamily: "'Mulish', system-ui, sans-serif",
              }}
            >
              {heroCTA.icon}
              {heroCTA.label}
            </button>
          </div>
        </section>

        {/* ── FAIXA DE VIDA (uma linha de chips glass) ── */}
        <div className="w-full max-w-sm mb-4 flex items-center justify-between gap-2">
          {/* ELO com anel */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full flex-1 min-w-0"
            style={{ ...glass, borderRadius: 999 }}
            aria-label={`Elo ${level}`}
          >
            <div
              className="relative w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `conic-gradient(${SAGE} ${Math.min(100, (xp % 100))}%, rgba(127,176,105,0.18) 0)`,
              }}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: CREAM }}>
                <span className="text-[10px] font-black" style={{ color: SAGE_DEEP }}>{level}</span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider leading-none" style={{ color: INK_SOFT }}>Elo</p>
              <p className="text-[11px] font-extrabold leading-tight truncate" style={{ color: INK }}>{xp} XP</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ ...glass, borderRadius: 999 }}>
            <Leaf size={12} style={{ color: SAGE_DEEP }} />
            <span className="text-[12px] font-extrabold" style={{ color: INK }}>{xp}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: INK_SOFT }}>Energia</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ ...glass, borderRadius: 999 }}>
            <Heart size={12} className="fill-rose-400" style={{ color: "#E11D48" }} />
            <span className="text-[12px] font-extrabold" style={{ color: INK }}>{connection}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: INK_SOFT }}>Conexão</span>
          </div>
        </div>

        {/* ── 5. ME PERGUNTE QUALQUER COISA ── */}
        <section
          className="w-full max-w-sm mb-4 p-5"
          style={{
            borderRadius: 28,
            background: CREAM,
            border: "1px solid rgba(42,37,32,0.06)",
            boxShadow: "0 16px 36px -22px rgba(42,37,32,0.25), inset 0 1px 0 rgba(255,255,255,.95)",
          }}
        >
          <div className="flex items-start gap-2 mb-3">
            <Sparkles size={16} className="mt-1 flex-shrink-0" style={{ color: SAGE_DEEP }} />
            <div className="min-w-0">
              <h2
                className="leading-tight"
                style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, fontWeight: 600, color: INK }}
              >
                Me pergunte qualquer coisa!
              </h2>
              <p className="text-[13px] mt-1" style={{ color: INK_SOFT, fontFamily: "'Mulish', system-ui, sans-serif" }}>
                Descubra respostas e crie conversas incríveis juntos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={isListening ? "Parar de ouvir" : "Falar com Kidzz"}
              onClick={toggleMic}
              className="relative w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white active:scale-95"
              style={{
                background: `linear-gradient(155deg, ${SAGE} 0%, ${SAGE_DEEP} 100%)`,
                boxShadow: isListening
                  ? `0 0 0 4px ${SAGE}55, 0 0 22px ${SAGE}88`
                  : `0 8px 18px -6px ${SAGE_DEEP}77, inset 0 1px 0 rgba(255,255,255,.35)`,
              }}
            >
              {isListening && <span aria-hidden className="absolute inset-0 rounded-full animate-ping" style={{ background: `${SAGE}55` }} />}
              <Mic size={18} strokeWidth={2.4} />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit(input)}
              placeholder={isFreeLimitReached ? "Limite atingido" : "Digite ou pergunte…"}
              className="flex-1 min-w-0 py-3 px-3 rounded-2xl text-[15px] font-semibold focus:outline-none focus:ring-2 disabled:opacity-40"
              style={{
                background: CREAM_2,
                border: "1px solid rgba(42,37,32,0.10)",
                color: INK,
                fontFamily: "'Mulish', system-ui, sans-serif",
              }}
              disabled={submitting || isFreeLimitReached}
              aria-label="Pergunta"
            />
          </div>

          <button
            type="button"
            onClick={() => submit(input)}
            disabled={!input.trim() || submitting || isFreeLimitReached}
            className="mt-3 w-full min-h-[48px] rounded-2xl text-white text-[14px] font-extrabold flex items-center justify-center gap-1.5 disabled:opacity-40 active:scale-[0.98] transition-transform"
            style={{
              background: `linear-gradient(180deg, ${SAGE} 0%, ${SAGE_DEEP} 100%)`,
              boxShadow: `0 10px 22px -8px ${SAGE_DEEP}66, inset 0 1px 0 rgba(255,255,255,.35)`,
              fontFamily: "'Mulish', system-ui, sans-serif",
            }}
          >
            Perguntar <Sparkles size={14} />
          </button>

          {!isPremium && (
            <p className="mt-2 text-center text-[11px]" style={{ color: INK_SOFT }}>
              {questionsRemaining()} perguntas restantes
            </p>
          )}
        </section>

        {/* ── Memória contextual premium ── */}
        {isPremium && lastTopic && (
          <button
            type="button"
            onClick={() => submit(lastTopic.question)}
            className="w-full max-w-sm mb-4 text-left px-4 py-3 rounded-2xl flex items-center gap-3 active:scale-[0.98]"
            style={{
              background: CREAM,
              border: `1px solid ${SAGE}33`,
              boxShadow: "0 8px 20px -12px rgba(42,37,32,0.22)",
            }}
          >
            <span className="text-xl flex-shrink-0">💭</span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: SAGE_DEEP }}>
                {lastTopic.when} {childName} perguntou
              </p>
              <p className="text-[13px] font-semibold truncate" style={{ color: INK }}>{lastTopic.question}</p>
            </div>
            <ChevronRight size={16} style={{ color: INK_SOFT }} />
          </button>
        )}

        {/* ── 6. HOJE PARA VOCÊ ── */}
        <section className="w-full max-w-sm mb-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <p
              className="text-[11px] font-extrabold uppercase tracking-[0.16em]"
              style={{ color: INK_SOFT, fontFamily: "'Mulish', system-ui, sans-serif" }}
            >
              Hoje para você ✨
            </p>
            {onOpenAchievements && (
              <button
                type="button"
                onClick={() => { haptic("light"); sfx("click"); onOpenAchievements?.(); }}
                className="text-[11px] font-extrabold flex items-center gap-0.5"
                style={{ color: SAGE_DEEP }}
              >
                Ver todas <ChevronRight size={12} />
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {visibleSuggestions.map((q) => (
              <button
                key={q.text}
                onClick={() => submit(q.text)}
                disabled={submitting || isFreeLimitReached}
                className="flex items-center gap-3 px-4 py-3 text-left active:scale-[0.98] transition-transform disabled:opacity-40 rounded-2xl"
                style={{
                  background: CREAM,
                  border: "1px solid rgba(42,37,32,0.06)",
                  boxShadow: "0 8px 20px -14px rgba(42,37,32,0.18)",
                  minHeight: 56,
                }}
              >
                <span className="text-xl flex-shrink-0" aria-hidden>{q.emoji}</span>
                <div className="min-w-0 flex-1">
                  <span className="text-[14px] font-bold leading-snug block" style={{ color: INK, fontFamily: "'Mulish', system-ui, sans-serif" }}>
                    {q.text}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: SAGE_DEEP }}>
                    {q.category}
                  </span>
                </div>
                <ChevronRight size={14} style={{ color: INK_SOFT }} />
              </button>
            ))}
          </div>
        </section>

        {/* ── 7. RITUAL DO SONO + SOS ── */}
        <div className="w-full max-w-sm grid grid-cols-1 gap-3 mb-4">
          <button
            type="button"
            onClick={() => { haptic("medium"); sfx("click"); setRitualOpen(true); }}
            className="text-left p-4 rounded-2xl flex items-center gap-3 active:scale-[0.98] transition-transform"
            style={{
              background: "linear-gradient(135deg, #5E5CC2 0%, #46478F 100%)",
              boxShadow: "0 14px 28px -16px rgba(94,92,194,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
              minHeight: 76,
            }}
            aria-label="Ritual do sono"
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.18)" }}>
              <Moon size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[15px] font-extrabold leading-tight" style={{ fontFamily: "'Mulish', system-ui, sans-serif" }}>
                Despedida do dia
              </p>
              <p className="text-white/80 text-[12px]">4 minutos · 4 passos</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <ChevronRight size={18} className="text-white" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => { haptic("medium"); sfx("click"); setSosOpen(true); }}
            className="text-left p-4 rounded-2xl flex items-center gap-3 active:scale-[0.98] transition-transform"
            style={{
              background: "linear-gradient(135deg, #FFF5F3 0%, #FFE7E1 100%)",
              border: "1px solid rgba(220,80,60,0.18)",
              boxShadow: "0 10px 22px -14px rgba(220,80,60,0.35)",
              minHeight: 76,
            }}
            aria-label="SOS Kidzz"
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF6B5A,#E8493A)", boxShadow: "0 6px 14px -4px rgba(232,73,58,0.55)" }}>
              <Heart size={20} className="text-white fill-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: "#C0392B" }}>SOS Kidzz</p>
              <p className="text-[15px] font-extrabold leading-tight" style={{ color: INK, fontFamily: "'Mulish', system-ui, sans-serif" }}>
                Precisa de ajuda agora?
              </p>
              <p className="text-[12px]" style={{ color: INK_SOFT }}>Acolhimento em 1 toque.</p>
            </div>
            <ChevronRight size={18} style={{ color: "#C0392B" }} />
          </button>
        </div>

        {/* ── 8. JORNADA DA FAMÍLIA ── */}
        <button
          type="button"
          onClick={() => onOpenTravel?.()}
          className="w-full max-w-sm mb-2 text-left flex items-center gap-3 p-4 rounded-2xl active:scale-[0.98] transition-transform"
          style={{
            background: `linear-gradient(135deg, ${SAGE}22 0%, ${CREAM} 100%)`,
            border: `1px solid ${SAGE}33`,
            boxShadow: `0 10px 24px -16px ${SAGE_DEEP}55`,
          }}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${SAGE}, ${SAGE_DEEP})` }}>
            <Heart size={18} className="text-white fill-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: SAGE_DEEP }}>Jornada da família</p>
            <p className="text-[14px] font-extrabold" style={{ color: INK, fontFamily: "'Mulish', system-ui, sans-serif" }}>
              {streakDays} dias juntos · {points} momentos
            </p>
          </div>
          <ChevronRight size={16} style={{ color: SAGE_DEEP }} />
        </button>

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

      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} onGoWellness={() => onTabChange?.("wellness")} />
      <RitualFlow ritual={currentRitual} open={ritualOpen} onClose={() => setRitualOpen(false)} />
      <DecompressionMode open={decompressOpen} onClose={() => setDecompressOpen(false)} />
      <SleepMode open={sleepOpen} onClose={() => setSleepOpen(false)} childName={childName} />
    </motion.div>
  );
};

export default HomeScreen;

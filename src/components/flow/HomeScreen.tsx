import { useState, useEffect, useRef, useMemo, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StreakCelebration from "./StreakCelebration";
import ParentalGate from "../ParentalGate";
import ParentalSettings from "../ParentalSettings";
import ParentDashboard from "../parental/ParentDashboard";
import CharacterParticles, { useCharacterParticles } from "./CharacterParticles";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { sfx, isSfxMuted, setSfxMuted } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";
import SOSModal from "@/components/sos/SOSModal";
import RitualFlow from "@/components/rituals/RitualFlow";
import { getCurrentRitual } from "@/components/rituals/rituals";
import KidzzLogo from "@/components/common/KidzzLogo";

/* ───────────── KIDZZ HOME • PERGUNTAS premium v2 ─────────────
   Ref: public/telas/PERGUNTAS/* · Assets: perguntas-v2 (Hermes/Codex)
   Mix Gui (lagarto) + família. Lógica real preservada (mic, sugestões, SOS, ritual, paywall).
   ───────────────────────────────────────────────────────────── */

const PQ = "/exemplos/assets/perguntas-v2";

/** Capa gerada para sugestões conhecidas (senão usa emoji) */
const SUG_COVER: Record<string, string> = {
  peixe: `${PQ}/sug-peixes.png`,
  peixes: `${PQ}/sug-peixes.png`,
  chuva: `${PQ}/sug-chuva.png`,
  "arco-íris": `${PQ}/sug-arcoiris.png`,
  arcoiris: `${PQ}/sug-arcoiris.png`,
  "arco íris": `${PQ}/sug-arcoiris.png`,
};

function suggestionCover(text: string): string | null {
  const t = text.toLowerCase();
  for (const [k, v] of Object.entries(SUG_COVER)) {
    if (t.includes(k)) return v;
  }
  return null;
}

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
function getGreeting(name: string): { saudacao: string; sub: string } {
  const h = new Date().getHours();
  const saudacao = h < 5 ? "Boa noite" : h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  const noite = h >= 18 || h < 5;
  const sub = noite ? "Vamos descobrir algo juntos antes de dormir?" : "Vamos descobrir algo incrível juntos?";
  return { saudacao, sub };
}

/* ── Paleta do design (cores exatas do mockup) ── */
const CREAM = "#FBF4E4";
const CREAM_SOFT = "rgba(240,234,220,.82)";
const GREEN_LIGHT = "#8FE3AD";

/* ── Mini-covers pérola (acentos suaves, sem bloco colorido pesado) ── */
const DISC_VARIANTS: { grad: string; accent: string; arrow: [string, string, string]; badgeColor: string }[] = [
  { grad: "linear-gradient(160deg,#F2FBF4,#D8F0DE 55%,#C0E4C8)", accent: "#5EAE4E", arrow: ["#E8F8EC", "#8FD07A", "#4E9A3A"], badgeColor: "#3E7A42" },
  { grad: "linear-gradient(160deg,#F4F8FD,#DCE8F8 55%,#C8DCF0)", accent: "#5E8EC8", arrow: ["#EEF4FC", "#9EC0EC", "#4E7AB8"], badgeColor: "#3E6A9A" },
  { grad: "linear-gradient(160deg,#FFFBF4,#F8ECD8 55%,#F0DCB8)", accent: "#D0A04A", arrow: ["#FFF6E8", "#F0C878", "#D0A04A"], badgeColor: "#9A7028" },
];

/* ── Helper: botão gloss circular (verde metálico do mockup) ── */
const glossGreen = (size: number, radius = 999): CSSProperties => ({
  flex: "none",
  width: size,
  height: size,
  borderRadius: radius,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "radial-gradient(130% 130% at 30% 22%,#8FE0A0,#4EA35E 55%,#2E7A42)",
  border: "1px solid rgba(255,255,255,.55)",
  boxShadow: "0 8px 18px rgba(40,110,60,.45),inset 0 1.5px 2px rgba(255,255,255,.6)",
});

/* ── Cards "Hoje para você": pérola esbranquiçada (menos contraste com a floresta) ── */
const discCardStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  gap: 13,
  padding: "13px 14px",
  borderRadius: 24,
  cursor: "pointer",
  textAlign: "left",
  width: "100%",
  border: "0.5px solid rgba(255,255,255,.88)",
  background:
    "linear-gradient(155deg, rgba(255,255,255,.94) 0%, rgba(248,250,246,.88) 48%, rgba(236,242,238,.82) 100%)",
  backdropFilter: "blur(36px) saturate(160%)",
  WebkitBackdropFilter: "blur(36px) saturate(160%)",
  boxShadow:
    "0 12px 28px rgba(20,40,20,.16), 0 2px 6px rgba(20,40,20,.05), inset 0 1.5px 0 rgba(255,255,255,.95), inset 0 -1px 0 rgba(200,220,200,.25)",
  fontFamily: "'Nunito',sans-serif",
  transition: "transform .3s cubic-bezier(.34,1.4,.64,1)",
};

/* ── Estilo island do header (glass âmbar escuro) ── */
const islandStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  padding: "7px 5px",
  borderRadius: 999,
  background: "linear-gradient(160deg,rgba(70,58,38,.66),rgba(40,34,22,.5))",
  backdropFilter: "blur(16px) saturate(150%)",
  WebkitBackdropFilter: "blur(16px) saturate(150%)",
  border: "1px solid rgba(230,205,150,.4)",
  boxShadow: "0 8px 20px rgba(0,0,0,.36),inset 0 1.5px 1px rgba(255,240,200,.4)",
};

const KEYFRAMES = `
@keyframes perg-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes perg-shine{0%{transform:translateX(-130%) skewX(-18deg)}60%,100%{transform:translateX(240%) skewX(-18deg)}}
@keyframes perg-cascade{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes perg-heroIn{from{opacity:0;transform:translateY(-14px) scale(1.04)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes perg-micpulse{0%{box-shadow:0 0 0 0 rgba(120,210,130,.6)}100%{box-shadow:0 0 0 14px rgba(120,210,130,0)}}
@keyframes perg-raysweep{0%,100%{opacity:.42;transform:translateX(-4%) rotate(-2deg)}50%{opacity:.78;transform:translateX(4%) rotate(2deg)}}
@keyframes perg-bob1{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-13px) rotate(3deg)}}
@keyframes perg-bob2{0%,100%{transform:translateY(0) rotate(4deg)}50%{transform:translateY(-17px) rotate(-3deg)}}
@keyframes perg-bob3{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes perg-sosring{0%{transform:scale(.8);opacity:.7}100%{transform:scale(1.6);opacity:0}}
@keyframes perg-dust{0%{transform:translateY(0);opacity:0}20%{opacity:.7}100%{transform:translateY(-120px);opacity:0}}
@keyframes perg-playpulse{0%{box-shadow:0 0 0 0 rgba(200,170,240,.55)}100%{box-shadow:0 0 0 15px rgba(200,170,240,0)}}
`;

const HomeScreen = ({
  onSubmit,
  onOpenAchievements,
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
  const [muted, setMuted] = useState(false);
  const currentRitual = useMemo(() => getCurrentRitual(), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const isPremium = profile?.is_premium ?? false;

  useEffect(() => { setMuted(isSfxMuted()); }, []);

  const childName = profile?.child_name || "amigo";
  const ageRange = profile?.age_range || "3-7";
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
  const remaining = questionsRemaining();
  const isOver = remaining <= 0;
  const isLastFree = remaining === 1;

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
  const streakDays = profile?.streak_days ?? 0;
  const introHoje = `${childName}, escolhemos algumas descobertas que combinam com a curiosidade da sua família.`;

  const submit = (text: string) => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    haptic("light");
    sfx("click");
    try {
      onSubmit(text.trim());
    } finally {
      // Se o fluxo não trocar de tela (paywall/limite/guest), libera o botão de novo.
      window.setTimeout(() => setSubmitting(false), 600);
    }
  };

  const toggleSound = () => {
    const next = !muted;
    setSfxMuted(next);
    setMuted(next);
    haptic("light");
    if (!next) sfx("click");
  };

  /* ── Voice input (Web Speech API) ── */
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop(); } catch {}
    };
  }, []);

  const toggleMic = () => {
    haptic("medium");
    sfx("click");
    if (isFreeLimitReached || submitting) return;

    if (isListening) {
      try { recognitionRef.current?.stop(); } catch {}
      setIsListening(false);
      return;
    }

    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      import("sonner").then(({ toast }) =>
        toast.error("Seu navegador não suporta voz. Use Chrome ou Safari! 🎤")
      );
      return;
    }

    const recognition = new SR();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[event.results.length - 1]?.[0]?.transcript?.trim();
      if (transcript) {
        setInput(transcript);
        submit(transcript);
      }
    };
    recognition.onerror = (event: any) => {
      setIsListening(false);
      recognitionRef.current = null;
      import("sonner").then(({ toast }) => {
        if (event.error === "not-allowed") toast.error("Permita o acesso ao microfone! 🎤");
        else if (event.error === "no-speech") toast.error("Não ouvi nada. Tente de novo! 🎤");
        else if (event.error !== "aborted") toast.error("Erro no reconhecimento de voz. 🎤");
      });
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  const openPlans = () => {
    haptic("medium");
    sfx("click");
    window.dispatchEvent(new CustomEvent("kidzz:open-plans"));
  };

  const focusInput = () => {
    haptic("light");
    sfx("click");
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const hasQ = !!input.trim();

  return (
    <motion.div
      className="flex-1 flex flex-col relative min-h-0"
      style={{
        fontFamily: "'Nunito',system-ui,sans-serif",
        background: "linear-gradient(180deg,#3E5E2A 0%,#345224 46%,#284219 100%)",
        overflow: "hidden",
      }}
    >
      <style>{KEYFRAMES}</style>
      <CharacterParticles particles={particles} />

      {/* ── FUNDO CINEMÁTICO — cena + raios + poeira de luz ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-6%",
          left: "-6%",
          width: "112%",
          height: "118%",
          backgroundImage: `url('${PQ}/bg-floresta.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center 28%",
          filter: "blur(1.5px) saturate(1.35) brightness(1.05)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg,rgba(255,244,200,.14) 0%,rgba(90,130,50,.04) 26%,rgba(50,80,30,.14) 66%,rgba(30,55,22,.5) 100%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-14%",
          left: "-10%",
          width: "82%",
          height: "82%",
          pointerEvents: "none",
          background:
            "conic-gradient(from 200deg at 30% 0%,rgba(255,238,170,.26),transparent 22%,rgba(255,232,150,.16) 40%,transparent 60%)",
          filter: "blur(12px)",
          mixBlendMode: "screen",
          animation: "perg-raysweep 11s ease-in-out infinite",
        }}
      />
      <div aria-hidden style={{ position: "absolute", bottom: "22%", left: "14%", width: 4, height: 4, borderRadius: 99, background: "#FFF3CC", boxShadow: "0 0 8px 2px rgba(255,225,150,.8)", animation: "perg-dust 7s linear infinite", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", bottom: "36%", right: "20%", width: 5, height: 5, borderRadius: 99, background: "#EAFBD0", boxShadow: "0 0 9px 2px rgba(200,240,150,.75)", animation: "perg-dust 9s linear 2s infinite", pointerEvents: "none" }} />

      {/* ── SCROLL ── */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          position: "relative",
          zIndex: 2,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)",
        }}
      >
        {/* ── HEADER: som · KIDZZ · presente/sino/pais ── */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "4px 15px 4px",
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)",
            position: "relative",
            zIndex: 6,
          }}
        >
          {/* som */}
          <button
            onClick={toggleSound}
            className="active:scale-90"
            aria-label={muted ? "Ativar sons" : "Silenciar sons"}
            style={{
              flex: "none",
              width: 47,
              height: 47,
              borderRadius: 999,
              cursor: "pointer",
              background: "linear-gradient(160deg,rgba(70,58,38,.66),rgba(40,34,22,.5))",
              backdropFilter: "blur(16px) saturate(150%)",
              WebkitBackdropFilter: "blur(16px) saturate(150%)",
              border: "1px solid rgba(230,205,150,.4)",
              boxShadow: "0 8px 20px rgba(0,0,0,.36),inset 0 1.5px 1px rgba(255,240,200,.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform .2s",
            }}
          >
            {muted ? (
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M11 5 6 9H3v6h3l5 4V5Zm5 4 4 6m0-6-4 6" stroke="#F2E6C8" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ) : (
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M11 5 6 9H3v6h3l5 4V5Zm4.5 3.5a5 5 0 0 1 0 7m2.8-10a9 9 0 0 1 0 13" stroke="#F2E6C8" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </button>

          {/* Logo oficial KIDZZ */}
          <KidzzLogo height={36} style={{ maxWidth: 168 }} />

          {/* presente · sino · pais */}
          <div style={islandStyle}>
            {onOpenReferral && user && (
              <>
                <button
                  onClick={() => { haptic("light"); sfx("click"); onOpenReferral(); }}
                  className="active:scale-90"
                  aria-label="Convide amigos"
                  style={{ position: "relative", width: 31, height: 31, borderRadius: 999, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8M2 7.5h20V12H2zM12 21V7.5M12 7.5H7.8A2.4 2.4 0 1 1 10.2 3C11.6 3 12 7.5 12 7.5Zm0 0h4.2A2.4 2.4 0 1 0 13.8 3C12.4 3 12 7.5 12 7.5Z" stroke="#F2E6C8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <div style={{ width: 1, height: 18, background: "rgba(230,205,150,.3)" }} />
              </>
            )}
            <button
              onClick={() => setShowParentalGateForDashboard(true)}
              className="active:scale-90"
              aria-label="Notificações"
              style={{ position: "relative", width: 31, height: 31, borderRadius: 999, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Zm3.5 9a2.5 2.5 0 0 0 5 0" stroke="#F2E6C8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span style={{ position: "absolute", top: 4, right: 6, width: 6, height: 6, borderRadius: 99, background: "#F0645A", boxShadow: "0 0 0 2px rgba(40,34,22,.95)" }} />
            </button>
            <div style={{ width: 1, height: 18, background: "rgba(230,205,150,.3)" }} />
            <button
              onClick={() => (user ? setShowParentalGateForSettings(true) : navigate("/auth"))}
              className="active:scale-90"
              aria-label={user ? "Área dos pais" : "Entrar"}
              style={{ width: 31, height: 31, borderRadius: 999, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {user ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 2.5V11c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V5.5Z" stroke="#F2E6C8" strokeWidth="1.7" strokeLinejoin="round" /></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3" stroke="#F2E6C8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* ── ÚLTIMA GRÁTIS · LIBERAR TUDO (só free) ── */}
        {!isPremium && (
          <div
            style={{ display: "flex", gap: 10, padding: "12px 15px 4px", position: "relative", zIndex: 5, animation: "perg-cascade .55s cubic-bezier(.22,1,.36,1) .04s both" }}
          >
            <button
              onClick={focusInput}
              className="active:scale-[.985]"
              style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", borderRadius: 19, cursor: "pointer", textAlign: "left", background: "linear-gradient(155deg,rgba(74,60,38,.72),rgba(44,36,22,.6))", backdropFilter: "blur(18px) saturate(150%)", WebkitBackdropFilter: "blur(18px) saturate(150%)", border: "1px solid rgba(255,225,140,.36)", boxShadow: "0 12px 26px rgba(0,0,0,.34),inset 0 1.5px 0 rgba(255,240,200,.18)" }}
            >
              <span style={{ flex: "none", display: "flex", alignItems: "center", gap: 1 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 18h16l-1.4-8.6-4 3.2L12 5l-2.6 7.6-4-3.2L4 18Z" fill="#F5C24E" stroke="#E0A52E" strokeWidth="1" strokeLinejoin="round" /></svg>
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 900, fontSize: 13.5, color: "#FBF4E4", lineHeight: 1.14 }}>
                  {isOver ? "Limite de hoje atingido" : isLastFree ? "Última pergunta grátis!" : `${remaining} perguntas grátis hoje`}
                </span>
                <span style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "rgba(232,224,198,.72)", marginTop: 1 }}>
                  {isOver ? "Libere tudo e continue a jornada." : "Responda agora e mantenha sua sequência."}
                </span>
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m9 6 6 6-6 6" stroke="#E8D9A8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button
              onClick={openPlans}
              className="active:scale-95"
              style={{ flex: "none", display: "flex", alignItems: "center", gap: 7, padding: "11px 16px", borderRadius: 19, cursor: "pointer", background: "linear-gradient(160deg,rgba(120,200,90,.32),rgba(60,140,50,.26))", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)", border: "1px solid rgba(200,240,170,.5)", boxShadow: "0 12px 26px rgba(40,110,40,.32),inset 0 1.5px 0 rgba(255,255,255,.28)" }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 4l1.6 4.8L18 10l-4.4 1.2L12 16l-1.6-4.8L6 10l4.4-1.2L12 4Z" fill="#EAFBD0" stroke="#EAFBD0" strokeWidth=".8" strokeLinejoin="round" /></svg>
              <span style={{ fontWeight: 900, fontSize: 13, color: "#F2FBE8", whiteSpace: "nowrap" }}>Liberar tudo</span>
            </button>
          </div>
        )}

        {/* ── HERO: saudação + Gui + bolhas ── */}
        <div style={{ position: "relative", padding: "12px 15px 2px", zIndex: 4 }}>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 28,
              minHeight: 250,
              padding: "22px 20px 20px",
              background: "linear-gradient(165deg,rgba(96,78,50,.58),rgba(52,42,26,.42))",
              backdropFilter: "blur(40px) saturate(185%)",
              WebkitBackdropFilter: "blur(40px) saturate(185%)",
              border: "0.5px solid rgba(255,228,160,.42)",
              boxShadow: "0 20px 48px rgba(0,0,0,.42),inset 0 2px 0 rgba(255,240,200,.32)",
              animation: "perg-heroIn .7s cubic-bezier(.22,1,.36,1) .08s both",
            }}
          >
            {/* shine sweep */}
            <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: "55%", height: "100%", pointerEvents: "none", background: "linear-gradient(100deg,transparent,rgba(255,244,210,.14) 50%,transparent)", animation: "perg-shine 7s ease-in-out infinite" }} />

            {/* Gui — mascote oficial (melhor cutout) */}
            <img
              src={`${PQ}/gui-hero-v2.png`}
              alt="Gui, o camaleão do Kidzz"
              draggable={false}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `${PQ}/gui-hero.png`;
              }}
              style={{
                position: "absolute",
                right: -6,
                bottom: -4,
                height: 248,
                width: "auto",
                maxWidth: "54%",
                objectFit: "contain",
                objectPosition: "center bottom",
                filter: "drop-shadow(0 16px 28px rgba(0,0,0,.42))",
                animation: "perg-floaty 6s ease-in-out infinite",
                zIndex: 2,
                pointerEvents: "none",
              }}
            />

            {/* bolhas de pergunta */}
            <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3 }}>
              <div style={{ position: "absolute", top: 22, right: 120, width: 38, height: 38, borderRadius: "50% 50% 50% 8px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(150deg,rgba(210,240,180,.5),rgba(140,200,120,.3))", backdropFilter: "blur(6px)", border: "1px solid rgba(230,250,210,.65)", boxShadow: "0 6px 14px rgba(0,0,0,.25)", animation: "perg-bob1 5.5s ease-in-out infinite" }}><span style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: 19, color: "#2E5A2E" }}>?</span></div>
              <div style={{ position: "absolute", top: 6, right: 20, width: 33, height: 33, borderRadius: "50% 50% 8px 50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(150deg,rgba(255,236,170,.55),rgba(240,190,90,.34))", backdropFilter: "blur(6px)", border: "1px solid rgba(255,240,190,.7)", boxShadow: "0 6px 14px rgba(0,0,0,.25)", animation: "perg-bob2 6.5s ease-in-out .6s infinite" }}><span style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: 17, color: "#7A5A10" }}>?</span></div>
              <div style={{ position: "absolute", top: 104, right: 138, width: 28, height: 28, borderRadius: "50% 50% 50% 8px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(150deg,rgba(200,240,180,.5),rgba(120,190,110,.3))", backdropFilter: "blur(6px)", border: "1px solid rgba(230,250,210,.65)", boxShadow: "0 5px 12px rgba(0,0,0,.22)", animation: "perg-bob3 4.8s ease-in-out .3s infinite" }}><span style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: 14, color: "#2E5A2E" }}>?</span></div>
              <div style={{ position: "absolute", top: 150, right: 12, width: 42, height: 33, borderRadius: "50% 50% 50% 10px", display: "flex", alignItems: "center", justifyContent: "center", gap: 3, background: "linear-gradient(150deg,rgba(230,240,220,.5),rgba(180,210,160,.3))", backdropFilter: "blur(6px)", border: "1px solid rgba(240,250,230,.65)", boxShadow: "0 6px 14px rgba(0,0,0,.22)", animation: "perg-bob2 5.9s ease-in-out .9s infinite" }}>
                <span style={{ width: 4, height: 4, borderRadius: 99, background: "#3E5A3A" }} />
                <span style={{ width: 4, height: 4, borderRadius: 99, background: "#3E5A3A" }} />
                <span style={{ width: 4, height: 4, borderRadius: 99, background: "#3E5A3A" }} />
              </div>
            </div>

            <div style={{ position: "relative", zIndex: 4, maxWidth: 192 }}>
              <h1 style={{ margin: 0, fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 34, lineHeight: 1.02, color: CREAM, letterSpacing: "-.6px", textShadow: "0 2px 12px rgba(0,0,0,.4)" }}>{greeting.saudacao},</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 1, minHeight: 44 }}>
                <span style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: 34, lineHeight: 1.02, color: GREEN_LIGHT, letterSpacing: "-.6px", textShadow: "0 2px 12px rgba(0,0,0,.35)" }}>{childName}</span>
                <svg width="27" height="27" viewBox="0 0 24 24" fill="none" style={{ flex: "none" }}><path d="M20 13.5A8 8 0 0 1 10.5 4 8 8 0 1 0 20 13.5Z" fill="#F5C24E" stroke="#E0A52E" strokeWidth="1.1" strokeLinejoin="round" /></svg>
              </div>
              <p style={{ margin: "11px 0 0", fontSize: 14, fontWeight: 700, lineHeight: 1.34, color: CREAM_SOFT, maxWidth: 170, textShadow: "0 1px 8px rgba(0,0,0,.35)" }}>{greeting.sub}</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginTop: 16, padding: "9px 14px 9px 9px", borderRadius: 16, background: "rgba(255,248,228,.16)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,240,200,.34)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.3),0 6px 14px rgba(0,0,0,.2)" }}>
                <div style={{ flex: "none", width: 34, height: 34, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(130% 130% at 30% 22%,#B6F0C0,#4EA35E 60%,#2E7A42)", boxShadow: "0 4px 10px rgba(40,110,60,.4),inset 0 1px 1px rgba(255,255,255,.5)" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="#EAFBEF"><path d="M12 20.3l-7.1-6.9a4.6 4.6 0 0 1 6.4-6.5l.7.7.7-.7a4.6 4.6 0 0 1 6.4 6.5Z" /></svg></div>
                <span style={{ fontSize: 11.5, fontWeight: 800, lineHeight: 1.3, color: "#F2EAD8", maxWidth: 118 }}>Cada resposta aproxima vocês ainda mais.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD "ME PERGUNTE QUALQUER COISA" ── */}
        <div style={{ padding: "14px 15px 0", position: "relative", zIndex: 4, animation: "perg-cascade .55s cubic-bezier(.22,1,.36,1) .16s both" }}>
          <div style={{ borderRadius: 28, padding: 17, background: "linear-gradient(165deg,rgba(90,74,48,.55),rgba(50,40,26,.42))", backdropFilter: "blur(40px) saturate(185%)", WebkitBackdropFilter: "blur(40px) saturate(185%)", border: "0.5px solid rgba(255,228,160,.4)", boxShadow: "0 16px 40px rgba(0,0,0,.36),inset 0 1.5px 0 rgba(255,240,200,.28)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 4l1.6 4.8L18 10l-4.4 1.2L12 16l-1.6-4.8L6 10l4.4-1.2L12 4Z" fill="#8FE0A0" stroke="#4EA35E" strokeWidth="1" strokeLinejoin="round" /></svg>
              <h2 style={{ margin: 0, fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 20, color: CREAM, textShadow: "0 1px 6px rgba(0,0,0,.3)" }}>Me pergunte qualquer coisa!</h2>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 700, color: "rgba(236,228,204,.72)" }}>Descubra respostas e crie conversas incríveis juntos.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* MIC */}
              <motion.button
                type="button"
                onClick={toggleMic}
                aria-label={isListening ? "Parar de ouvir" : "Falar com Kidzz"}
                whileTap={{ scale: 0.9 }}
                style={{
                  ...glossGreen(50),
                  cursor: "pointer",
                  animation: isListening ? undefined : "perg-micpulse 2.1s ease-out infinite",
                  boxShadow: isListening
                    ? "0 0 0 4px rgba(240,90,80,.35),0 0 20px rgba(240,90,80,.5),inset 0 1.5px 2px rgba(255,255,255,.6)"
                    : "0 8px 18px rgba(40,110,60,.45),inset 0 1.5px 2px rgba(255,255,255,.6)",
                }}
              >
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M12 15a3.5 3.5 0 0 0 3.5-3.5v-5a3.5 3.5 0 1 0-7 0v5A3.5 3.5 0 0 0 12 15Zm6-4a6 6 0 0 1-12 0m6 6v3.5m-3 0h6" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </motion.button>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit(input)}
                placeholder={isFreeLimitReached ? "Limite atingido" : "Digite ou pergunte…"}
                disabled={submitting || isFreeLimitReached}
                style={{ flex: 1, minWidth: 0, padding: "15px 16px", borderRadius: 16, border: "1px solid rgba(255,240,200,.3)", background: "rgba(255,248,228,.14)", backdropFilter: "blur(6px)", fontFamily: "'Nunito',sans-serif", fontSize: 16, fontWeight: 700, color: "#F6EFDD", outline: "none", boxShadow: "inset 0 2px 6px rgba(0,0,0,.16)", opacity: isFreeLimitReached ? 0.5 : 1 }}
              />

              {/* SEND */}
              <motion.button
                type="button"
                onClick={() => submit(input)}
                disabled={!hasQ || submitting || isFreeLimitReached}
                whileTap={{ scale: 0.9 }}
                aria-label="Perguntar"
                style={{
                  flex: "none",
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  cursor: hasQ ? "pointer" : "default",
                  border: "1px solid rgba(255,255,255,.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform .2s",
                  color: hasQ ? "#153A16" : "rgba(240,250,230,.7)",
                  background: hasQ ? "radial-gradient(130% 130% at 30% 22%,#C7E8A8,#5EA83E 55%,#3A7A26)" : "rgba(255,255,255,.16)",
                  boxShadow: hasQ ? "0 8px 18px rgba(40,110,40,.45), inset 0 1.5px 1px rgba(255,255,255,.5)" : "inset 0 1px 0 rgba(255,255,255,.3)",
                  opacity: submitting || isFreeLimitReached ? 0.5 : 1,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 12 20 4l-4 16-4.5-6.5L4 12Zm7.5 1.5L20 4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </motion.button>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 12 }}>
              <button
                onClick={() => (user ? setShowParentalGateForSettings(true) : navigate("/auth"))}
                className="active:scale-95"
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 999, cursor: "pointer", background: "rgba(255,248,235,.9)", border: "1px solid rgba(255,255,255,1)", fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 12.5, color: "#2E6B3E", boxShadow: "0 6px 14px rgba(0,0,0,.2)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 2.5V11c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V5.5Z" stroke="#2E6B3E" strokeWidth="1.9" strokeLinejoin="round" /></svg>
                Pais
              </button>
              <button
                onClick={openPlans}
                className="active:scale-95"
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 999, cursor: "pointer", border: "1px solid rgba(255,235,150,.6)", fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 12.5, color: "#5A3A00", background: "radial-gradient(130% 130% at 30% 22%,#FFE9A8,#F5C24E 55%,#E0A52E)", boxShadow: "0 8px 18px rgba(200,150,30,.4),inset 0 1.5px 1px rgba(255,255,255,.6)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#5A3A00"><path d="M4 18h16l-1.4-8.6-4 3.2L12 5l-2.6 7.6-4-3.2L4 18Z" /></svg>
                {isPremium ? "Premium" : "Assinar"}
              </button>
            </div>
          </div>
        </div>

        {/* ── HOJE PARA VOCÊ ── */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "20px 18px 2px", position: "relative", zIndex: 4 }}>
          <h2 style={{ margin: 0, fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 21, color: CREAM, letterSpacing: ".3px", textShadow: "0 1px 8px rgba(0,0,0,.4)" }}>
            Hoje para você <span style={{ fontSize: 16 }}>✦</span>
          </h2>
          {onOpenAchievements && (
            <button
              onClick={() => { haptic("light"); sfx("click"); onOpenAchievements(); }}
              className="active:scale-95"
              style={{ flex: "none", display: "flex", alignItems: "center", gap: 5, padding: "8px 13px", borderRadius: 999, cursor: "pointer", background: "rgba(255,248,228,.14)", border: "1px solid rgba(255,240,200,.3)", backdropFilter: "blur(8px)", fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 11.5, color: "#F2EAD8" }}
            >
              Ver todas <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="m9 6 6 6-6 6" stroke="#F2EAD8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}
        </div>
        <p style={{ margin: 0, padding: "4px 18px 8px", fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: "rgba(224,232,210,.68)", position: "relative", zIndex: 4 }}>{introHoje}</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={suggestionPage}
            style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 15px 6px" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            {visibleSuggestions.map((q, i) => {
              const v = DISC_VARIANTS[i % DISC_VARIANTS.length];
              const cover = suggestionCover(q.text);
              return (
                <button
                  key={q.text}
                  onClick={() => submit(q.text)}
                  disabled={submitting || isFreeLimitReached}
                  className="active:scale-[.98]"
                  style={{ ...discCardStyle, opacity: submitting || isFreeLimitReached ? 0.5 : 1 }}
                >
                  <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: "46%", height: "100%", pointerEvents: "none", background: "linear-gradient(100deg,transparent,rgba(255,255,255,.14) 50%,transparent)", animation: "perg-shine 7s ease-in-out infinite", zIndex: 3 }} />
                  <div style={{ flex: "none", width: 78, height: 78, borderRadius: 18, overflow: "hidden", border: "0.5px solid rgba(255,255,255,.92)", boxShadow: "0 6px 14px rgba(40,60,40,.12), inset 0 1.5px 1px rgba(255,255,255,.7)", position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", background: v.grad }}>
                    {cover ? (
                      <img src={cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <>
                        <span aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(82% 62% at 28% 16%,rgba(255,255,255,.72),rgba(255,255,255,.2) 46%,transparent 70%)" }} />
                        <span style={{ position: "relative", fontSize: 36, lineHeight: 1, filter: "drop-shadow(0 1px 3px rgba(0,0,0,.14))" }}>{q.emoji}</span>
                      </>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 2 }}>
                    <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 16.5, lineHeight: 1.14, color: "#2A3A28" }}>{q.text}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 10.5, fontWeight: 800, color: "#6A7E64" }}>
                      <span style={{ width: 5, height: 5, borderRadius: 99, background: v.accent, boxShadow: "0 0 5px " + v.accent }} />
                      Toque para descobrir
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 7, padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,.72)", border: "1px solid rgba(220,230,220,.9)" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: v.accent, boxShadow: "0 0 6px " + v.accent }} />
                      <span style={{ fontSize: 9.5, fontWeight: 900, color: v.badgeColor }}>{q.category}</span>
                    </div>
                  </div>
                  <div style={{ flex: "none", width: 46, height: 46, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2, background: "radial-gradient(130% 130% at 30% 22%," + v.arrow[0] + "," + v.arrow[1] + " 55%," + v.arrow[2] + ")", border: "1px solid rgba(255,255,255,.65)", boxShadow: "0 8px 16px " + v.arrow[2] + "66, 0 0 14px " + v.arrow[1] + "55, inset 0 1.5px 2px rgba(255,255,255,.6)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* ── SOS KIDZZ ── */}
        <div style={{ padding: "10px 15px 0" }}>
          <button
            onClick={() => { haptic("medium"); sfx("click"); setSosOpen(true); }}
            className="active:scale-[.985]"
            style={{ position: "relative", overflow: "hidden", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 14, padding: "16px 15px", borderRadius: 26, cursor: "pointer", background: "linear-gradient(150deg,rgba(240,180,150,.28),rgba(200,110,90,.2))", backdropFilter: "blur(18px) saturate(150%)", WebkitBackdropFilter: "blur(18px) saturate(150%)", border: "1px solid rgba(255,210,190,.45)", boxShadow: "0 16px 34px rgba(120,40,30,.28),inset 0 1.5px 0 rgba(255,235,225,.4)" }}
          >
            <div style={{ position: "relative", flex: "none", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span aria-hidden style={{ position: "absolute", inset: 14, borderRadius: 999, border: "2px solid rgba(240,110,90,.5)", animation: "perg-sosring 2.4s ease-out infinite" }} />
              <span aria-hidden style={{ position: "absolute", inset: 14, borderRadius: 999, border: "2px solid rgba(240,110,90,.5)", animation: "perg-sosring 2.4s ease-out 1.2s infinite" }} />
              <div style={{ position: "relative", width: 56, height: 56, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(130% 130% at 30% 22%,#FF9E8E,#F0645A 55%,#D23B32)", boxShadow: "0 8px 18px rgba(200,50,40,.5),inset 0 1.5px 2px rgba(255,255,255,.5)" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 20.5l-1.4-1.3C6 15.1 3 12.4 3 9a4.5 4.5 0 0 1 8.2-2.6L12 7l.8-.6A4.5 4.5 0 0 1 21 9c0 3.4-3 6.1-7.6 10.2L12 20.5Z" fill="rgba(255,255,255,.28)" stroke="#fff" strokeWidth="1.5" /><path d="M9 12a2 2 0 1 1 4 0m2.5 0a2 2 0 1 1 0-.1M12 13.5a2 2 0 0 0-2 2m4 0a2 2 0 0 0-2-2" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" /></svg>
              </div>
              <span style={{ position: "absolute", top: 2, left: 2, padding: "3px 8px", borderRadius: 999, background: "linear-gradient(150deg,#FF9E8E,#E24B40)", color: "#fff", fontSize: 9, fontWeight: 900, letterSpacing: ".8px", boxShadow: "0 3px 8px rgba(200,50,40,.5)" }}>SOS</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1.4, color: "#D24B3E", marginBottom: 2 }}>SOS KIDZZ</div>
              <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 19, lineHeight: 1.08, color: "#5A2A1E", marginBottom: 4 }}>Precisa de <span style={{ color: "#E24B3E" }}>apoio</span> agora?</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.35, color: "#7A4A3A", maxWidth: 170 }}>Acolhimento imediato para sua família, sempre que precisar.</div>
            </div>
            <div style={{ flex: "none", width: 44, height: 44, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(130% 130% at 30% 22%,#FF9E8E,#F0645A 55%,#D23B32)", boxShadow: "0 8px 16px rgba(200,50,40,.45),inset 0 1.5px 2px rgba(255,255,255,.5)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </button>
          <div style={{ display: "flex", justifyContent: "center", gap: 9, marginTop: 10 }}>
            {[
              { label: "Sigiloso", d: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z" },
              { label: "Acolhedor", d: "M12 20.3l-7.1-6.9a4.6 4.6 0 0 1 6.4-6.5l.7.7.7-.7a4.6 4.6 0 0 1 6.4 6.5Z" },
              { label: "Imediato", d: "M13 2 4.5 13.5H11l-1 8L19.5 10H13l0-8Z" },
            ].map((c) => (
              <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 999, background: "rgba(255,240,235,.14)", border: "1px solid rgba(255,210,190,.3)", backdropFilter: "blur(6px)", fontSize: 10.5, fontWeight: 900, color: "#F2D0C4" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d={c.d} stroke="#F0908A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {c.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── HORA DO REENCONTRO → Ritual da família ── */}
        <div style={{ padding: "14px 15px 4px" }}>
          <button
            onClick={() => { haptic("medium"); sfx("click"); setRitualOpen(true); }}
            className="active:scale-[.99]"
            style={{ position: "relative", overflow: "hidden", width: "100%", textAlign: "left", display: "flex", alignItems: "stretch", gap: 0, borderRadius: 26, cursor: "pointer", background: "linear-gradient(150deg,rgba(210,180,230,.26),rgba(150,120,200,.2))", backdropFilter: "blur(18px) saturate(150%)", WebkitBackdropFilter: "blur(18px) saturate(150%)", border: "1px solid rgba(225,205,245,.42)", boxShadow: "0 16px 34px rgba(60,40,110,.3),inset 0 1.5px 0 rgba(255,255,255,.32)" }}
          >
            <div style={{ flex: "none", width: 118, position: "relative", overflow: "hidden" }}>
              <img src={`${PQ}/familia-abraco.png`} alt="Família se abraçando" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 22%" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg,transparent 55%,rgba(180,150,220,.55) 100%)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, padding: "15px 14px 15px 13px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: 1.2, color: "#8A6AC0", lineHeight: 1.3, marginBottom: 4 }}>TRANSIÇÃO SUAVE<br />PARA A NOITE</div>
              <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 21, lineHeight: 1.04, color: "#3A2A56", marginBottom: 6 }}>Hora do reencontro</div>
              <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.34, color: "#5E4A7A", maxWidth: 150, marginBottom: 10 }}>Momentos que acolhem, aproximam e transformam o fim do dia em conexão.</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 10.5, fontWeight: 900, color: "#6A5490" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="#8A6AC0" strokeWidth="1.9" /><path d="M12 8v4l2.5 1.5" stroke="#8A6AC0" strokeWidth="1.9" strokeLinecap="round" /></svg>3 min</span>
                <span style={{ width: 1, height: 12, background: "rgba(130,100,180,.35)" }} />
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 7h4l2-2h4l2 2h4v12H4V7Zm8 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" stroke="#8A6AC0" strokeWidth="1.7" strokeLinejoin="round" /></svg>3 passos</span>
              </div>
            </div>
            <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", width: 52, height: 52, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(130% 130% at 30% 22%,#F4EAFB,#C9A8E8 55%,#9A6ACE)", boxShadow: "0 8px 18px rgba(120,70,180,.45),inset 0 1.5px 2px rgba(255,255,255,.6)", animation: "perg-playpulse 2.4s ease-out infinite", zIndex: 3 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z" /></svg>
            </div>
          </button>
        </div>

        {/* ── RODAPÉ ── */}
        <div style={{ padding: "16px 20px 18px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "rgba(180,204,170,.6)", position: "relative", zIndex: 3 }}>
          {streakDays > 0 ? `${streakDays} dias juntos · uma pergunta por dia aproxima a família` : "Uma pergunta por dia aproxima a família"}
        </div>
      </div>

      {/* ── MODAIS ── */}
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

      {/* ── SOS Kidzz Modal ── */}
      <SOSModal
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        onGoWellness={() => onTabChange?.("wellness")}
      />

      {/* ── Ritual da Família ── */}
      <RitualFlow ritual={currentRitual} open={ritualOpen} onClose={() => setRitualOpen(false)} />
    </motion.div>
  );
};

export default HomeScreen;

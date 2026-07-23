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

/* ───────────── KIDZZ HOME • PERGUNTAS — mockup premium 1:1 ─────────────
   Ref visual: mockup floresta clara dourada + Gui + cards glass claros.
   Lógica real: mic, submit, sugestões, SOS, ritual, paywall, parental.
   ───────────────────────────────────────────────────────────────────── */

const PQ = "/exemplos/assets/perguntas-v2";
const BRAND = "/exemplos/assets/brand";

const ASSETS = {
  bg: `${PQ}/bg-floresta.png`,
  /** Soft-edge cutout (sem “quadrado”) */
  gui: `${PQ}/gui-hero-soft.png`,
  guiFallback: `${PQ}/gui-hero-mock.png`,
  guiFallback2: `${BRAND}/gui-cutout-alpha.png`,
  family: `${PQ}/family-ask.png`,
  familyFallback: `${PQ}/familia-abraco.png`,
  peixes: `${PQ}/sug-peixes.png`,
  chuva: `${PQ}/sug-chuva.png`,
  arco: `${PQ}/sug-arcoiris.png`,
};

/** Cards “Hoje para você” — exatamente o trio do mockup (com capas) */
const HOJE_MOCK: { text: string; category: string; cover: string; arrow: string }[] = [
  { text: "Onde moram os peixes?", category: "Natureza", cover: ASSETS.peixes, arrow: "#2E9A6A" },
  { text: "Por que a chuva cai?", category: "Natureza", cover: ASSETS.chuva, arrow: "#3E8AD0" },
  { text: "Como o arco-íris aparece?", category: "Cores", cover: ASSETS.arco, arrow: "#E0A030" },
];

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

const glassLight: CSSProperties = {
  background: "linear-gradient(160deg, rgba(255,255,255,.72), rgba(255,252,245,.55))",
  backdropFilter: "blur(28px) saturate(170%)",
  WebkitBackdropFilter: "blur(28px) saturate(170%)",
  border: "0.5px solid rgba(255,255,255,.85)",
  boxShadow: "0 12px 32px rgba(40,60,20,.12), inset 0 1.5px 0 rgba(255,255,255,.9)",
};

const KEYFRAMES = `
@keyframes perg-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes perg-shine{0%{transform:translateX(-130%) skewX(-16deg)}60%,100%{transform:translateX(240%) skewX(-16deg)}}
@keyframes perg-cascade{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes perg-micpulse{0%{box-shadow:0 0 0 0 rgba(80,180,100,.45)}100%{box-shadow:0 0 0 12px rgba(80,180,100,0)}}
@keyframes perg-dust{0%{transform:translateY(0);opacity:0}20%{opacity:.65}100%{transform:translateY(-100px);opacity:0}}
@keyframes perg-ray{0%,100%{opacity:.35}50%{opacity:.7}}
`;

const HomeScreen = ({
  onSubmit,
  onOpenAchievements,
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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentRitual = useMemo(() => getCurrentRitual(), []);
  const isPremium = profile?.is_premium ?? false;

  useEffect(() => { setMuted(isSfxMuted()); }, []);
  useEffect(() => () => { try { recognitionRef.current?.stop(); } catch { /* */ } }, []);

  const childName = profile?.child_name || "amigo";
  const streakDays = profile?.streak_days ?? 0;
  const isFreeLimitReached = !canAskQuestion();
  const remaining = questionsRemaining();
  const isOver = remaining <= 0;
  const isLastFree = remaining === 1;
  const hasQ = !!input.trim();
  const freeLabel = isOver
    ? "Limite de hoje atingido"
    : isLastFree
      ? "Última pergunta grátis!"
      : `${remaining} perguntas grátis hoje`;
  const freeSub = isOver
    ? "Libere tudo e continue a jornada."
    : "Responda agora e mantenha sua sequência.";

  const submit = (text: string) => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    haptic("light");
    sfx("click");
    try {
      onSubmit(text.trim());
    } finally {
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

  const toggleMic = () => {
    haptic("medium");
    sfx("click");
    if (isFreeLimitReached || submitting) return;
    if (isListening) {
      try { recognitionRef.current?.stop(); } catch { /* */ }
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

  const openParents = () => {
    haptic("light");
    sfx("click");
    if (user) setShowParentalGateForSettings(true);
    else navigate("/auth");
  };

  return (
    <motion.div
      className="flex-1 flex flex-col relative min-h-0"
      style={{
        fontFamily: "'Nunito', system-ui, sans-serif",
        background: "linear-gradient(180deg, #E8F0C8 0%, #F4EED8 48%, #F8F4EA 100%)",
        overflow: "hidden",
      }}
    >
      <style>{KEYFRAMES}</style>
      <CharacterParticles particles={particles} />

      {/* ═══ FUNDO FLORESTA CLARA DOURADA ═══ */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-4%",
          backgroundImage: `url('${ASSETS.bg}')`,
          backgroundSize: "cover",
          backgroundPosition: "center 22%",
          filter: "saturate(1.25) brightness(1.12) contrast(1.02)",
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
            "linear-gradient(180deg, rgba(255,244,200,.28) 0%, rgba(255,250,235,.12) 28%, rgba(248,244,234,.55) 62%, rgba(248,244,234,.92) 88%, #F8F4EA 100%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-8%",
          left: "10%",
          width: "80%",
          height: "50%",
          pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,230,140,.55), transparent 65%)",
          animation: "perg-ray 10s ease-in-out infinite",
          mixBlendMode: "screen",
        }}
      />
      <div aria-hidden style={{ position: "absolute", bottom: "30%", left: "18%", width: 4, height: 4, borderRadius: 99, background: "#FFF3CC", boxShadow: "0 0 8px 2px rgba(255,225,150,.7)", animation: "perg-dust 8s linear infinite", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", bottom: "42%", right: "22%", width: 5, height: 5, borderRadius: 99, background: "#EAFBD0", boxShadow: "0 0 9px 2px rgba(200,240,150,.65)", animation: "perg-dust 10s linear 2s infinite", pointerEvents: "none" }} />

      {/* ═══ SCROLL ═══ */}
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
        {/* ── HEADER ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "0 14px",
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
          }}
        >
          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? "Ativar sons" : "Silenciar"}
            className="active:scale-90"
            style={{
              width: 44, height: 44, borderRadius: 999, flex: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              ...glassLight,
              boxShadow: "0 8px 20px rgba(40,60,20,.14), inset 0 1px 0 rgba(255,255,255,.95)",
            }}
          >
            {muted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M11 5 6 9H3v6h3l5 4V5Zm5 4 4 6m0-6-4 6" stroke="#4A5A38" strokeWidth="1.9" strokeLinecap="round" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M11 5 6 9H3v6h3l5 4V5Zm4.5 3.5a5 5 0 0 1 0 7m2.8-10a9 9 0 0 1 0 13" stroke="#4A5A38" strokeWidth="1.9" strokeLinecap="round" /></svg>
            )}
          </button>

          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <KidzzLogo height={34} light style={{ maxWidth: 160 }} />
            <span
              style={{
                marginTop: 2,
                fontSize: 10.5,
                fontWeight: 700,
                color: "rgba(50,70,40,.72)",
                letterSpacing: ".01em",
                textAlign: "center",
              }}
            >
              Desligue a tela, ligue a infância.{" "}
              <span style={{ color: "#E8A030" }}>♥</span>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "none" }}>
            <button
              type="button"
              onClick={() => setShowParentalGateForDashboard(true)}
              aria-label="Notificações"
              className="active:scale-90"
              style={{
                position: "relative",
                width: 40, height: 40, borderRadius: 999,
                display: "flex", alignItems: "center", justifyContent: "center",
                ...glassLight,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Zm3.5 9a2.5 2.5 0 0 0 5 0" stroke="#4A5A38" strokeWidth="1.8" strokeLinecap="round" /></svg>
              <span style={{ position: "absolute", top: 8, right: 9, width: 7, height: 7, borderRadius: 99, background: "#F0645A", border: "1.5px solid #fff" }} />
            </button>
            <button
              type="button"
              onClick={openParents}
              aria-label="Área dos pais"
              className="active:scale-90"
              style={{
                height: 40, padding: "0 11px", borderRadius: 999,
                display: "flex", alignItems: "center", gap: 5,
                fontWeight: 800, fontSize: 12, color: "#3A4A2A",
                ...glassLight,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 2.5V11c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V5.5Z" stroke="#3FA89B" strokeWidth="1.9" strokeLinejoin="round" /></svg>
              Pais
            </button>
          </div>
        </div>

        {/* ── HERO: copy + Gui ── */}
        <section
          style={{
            position: "relative",
            padding: "10px 16px 4px",
            minHeight: 248,
            animation: "perg-cascade .55s cubic-bezier(.22,1,.36,1) both",
          }}
        >
          <div style={{ position: "relative", zIndex: 3, maxWidth: "54%", paddingTop: 6 }}>
            <h1
              style={{
                margin: 0,
                fontFamily: "'Lora', Georgia, serif",
                fontWeight: 700,
                fontSize: "clamp(28px, 8vw, 34px)",
                lineHeight: 1.08,
                letterSpacing: "-0.5px",
                color: "#1F2E18",
                textShadow: "0 1px 0 rgba(255,255,255,.5)",
              }}
            >
              Pergunte.
              <br />
              Descubra.
              <br />
              <span style={{ color: "#3E9A52" }}>
                Conecte-se.{" "}
                <span style={{ fontSize: "0.72em", color: "#3E9A52" }}>♥</span>
              </span>
            </h1>
            <p
              style={{
                margin: "12px 0 0",
                fontSize: 13.5,
                fontWeight: 700,
                lineHeight: 1.4,
                color: "rgba(40,55,30,.72)",
                maxWidth: 200,
              }}
            >
              Respostas que acolhem, conversas que transformam momentos em memórias.
            </p>
          </div>

          <img
            src={ASSETS.gui}
            alt="Gui, o camaleão Kidzz"
            draggable={false}
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              if (el.src.includes("gui-hero-soft")) el.src = ASSETS.guiFallback;
              else if (el.src.includes("gui-hero-mock")) el.src = ASSETS.guiFallback2;
            }}
            style={{
              position: "absolute",
              right: -4,
              top: -4,
              width: "54%",
              maxWidth: 230,
              height: 260,
              objectFit: "contain",
              objectPosition: "center bottom",
              /* borda suave — some o retângulo */
              WebkitMaskImage:
                "radial-gradient(68% 72% at 52% 48%, #000 48%, rgba(0,0,0,.85) 62%, rgba(0,0,0,.35) 78%, transparent 92%)",
              maskImage:
                "radial-gradient(68% 72% at 52% 48%, #000 48%, rgba(0,0,0,.85) 62%, rgba(0,0,0,.35) 78%, transparent 92%)",
              filter: "drop-shadow(0 16px 26px rgba(40,70,20,.22))",
              animation: "perg-floaty 6.5s ease-in-out infinite",
              pointerEvents: "none",
              zIndex: 2,
              background: "transparent",
              border: "none",
              borderRadius: 0,
            }}
          />
        </section>

        {/* ── 2 PILLS: grátis + liberar ── */}
        {!isPremium && (
          <div
            style={{
              display: "flex",
              gap: 10,
              padding: "10px 16px 4px",
              animation: "perg-cascade .55s cubic-bezier(.22,1,.36,1) .05s both",
            }}
          >
            <button
              type="button"
              onClick={() => { haptic("light"); inputRef.current?.focus(); }}
              className="active:scale-[.98]"
              style={{
                flex: 1.15,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 12px",
                borderRadius: 20,
                textAlign: "left",
                cursor: "pointer",
                ...glassLight,
              }}
            >
              <span
                style={{
                  width: 36, height: 36, borderRadius: 999, flex: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "radial-gradient(130% 130% at 30% 22%, #FFF3C4, #F2C55C 55%, #C98F1E)",
                  boxShadow: "0 4px 10px rgba(180,120,20,.3)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#5A3A00"><path d="M4 18h16l-1.4-8.6-4 3.2L12 5l-2.6 7.6-4-3.2L4 18Z" /></svg>
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 900, fontSize: 13, color: "#2A3A20", lineHeight: 1.15 }}>
                  {freeLabel}
                </span>
                <span style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "rgba(50,70,40,.62)", marginTop: 2 }}>
                  {freeSub}
                </span>
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flex: "none" }}><path d="m9 6 6 6-6 6" stroke="#6A7A58" strokeWidth="2.2" strokeLinecap="round" /></svg>
            </button>
            <button
              type="button"
              onClick={openPlans}
              className="active:scale-[.98]"
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 12px",
                borderRadius: 20,
                textAlign: "left",
                cursor: "pointer",
                background: "linear-gradient(155deg, rgba(255,248,220,.8), rgba(255,236,180,.55))",
                backdropFilter: "blur(24px) saturate(160%)",
                WebkitBackdropFilter: "blur(24px) saturate(160%)",
                border: "0.5px solid rgba(255,230,160,.85)",
                boxShadow: "0 12px 28px rgba(180,130,30,.16), inset 0 1.5px 0 rgba(255,255,255,.9)",
              }}
            >
              <span
                style={{
                  width: 36, height: 36, borderRadius: 999, flex: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "radial-gradient(130% 130% at 30% 22%, #FFE9A8, #F0C24E 55%, #D0A020)",
                  boxShadow: "0 4px 12px rgba(200,140,20,.35)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 4l1.6 4.8L18 10l-4.4 1.2L12 16l-1.6-4.8L6 10l4.4-1.2L12 4Z" fill="#5A3A00" /></svg>
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 900, fontSize: 13, color: "#4A3808" }}>Liberar tudo</span>
                <span style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "rgba(90,70,20,.65)", marginTop: 2 }}>
                  Acesso ilimitado para sua família.
                </span>
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m9 6 6 6-6 6" stroke="#9A7A30" strokeWidth="2.2" strokeLinecap="round" /></svg>
            </button>
          </div>
        )}

        {/* ── CARD PERGUNTA + FAMÍLIA ── */}
        <section
          style={{
            padding: "12px 16px 0",
            animation: "perg-cascade .55s cubic-bezier(.22,1,.36,1) .1s both",
          }}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 26,
              padding: "16px 14px 14px",
              ...glassLight,
              background: "linear-gradient(155deg, rgba(255,255,255,.82), rgba(255,250,240,.68))",
            }}
          >
            <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: "50%", height: "100%", background: "linear-gradient(105deg, transparent, rgba(255,255,255,.35) 50%, transparent)", animation: "perg-shine 7s ease-in-out infinite", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 2, maxWidth: "58%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 4l1.6 4.8L18 10l-4.4 1.2L12 16l-1.6-4.8L6 10l4.4-1.2L12 4Z" fill="#5CB57A" /></svg>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'Lora', Georgia, serif",
                    fontWeight: 600,
                    fontSize: 18,
                    color: "#1F2E18",
                  }}
                >
                  Me pergunte qualquer coisa!
                </h2>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "rgba(50,70,40,.65)", lineHeight: 1.35 }}>
                Descubra respostas e crie conversas incríveis juntos.
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <motion.button
                  type="button"
                  onClick={toggleMic}
                  whileTap={{ scale: 0.9 }}
                  aria-label={isListening ? "Parar de ouvir" : "Falar"}
                  style={{
                    width: 46, height: 46, borderRadius: 999, flex: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "radial-gradient(130% 130% at 30% 22%, #A8E8B8, #4EA35E 55%, #2E7A42)",
                    border: "1px solid rgba(255,255,255,.65)",
                    boxShadow: isListening
                      ? "0 0 0 4px rgba(240,90,80,.3), 0 8px 16px rgba(40,110,60,.35)"
                      : "0 8px 16px rgba(40,110,60,.35), inset 0 1.5px 1px rgba(255,255,255,.55)",
                    animation: isListening ? undefined : "perg-micpulse 2.2s ease-out infinite",
                    cursor: "pointer",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 15a3.5 3.5 0 0 0 3.5-3.5v-5a3.5 3.5 0 1 0-7 0v5A3.5 3.5 0 0 0 12 15Zm6-4a6 6 0 0 1-12 0m6 6v3.5m-3 0h6" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" /></svg>
                </motion.button>

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit(input)}
                  placeholder={isFreeLimitReached ? "Limite atingido" : "Digite ou pergunte…"}
                  disabled={submitting || isFreeLimitReached}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: "13px 14px",
                    borderRadius: 16,
                    border: "1px solid rgba(200,210,180,.55)",
                    background: "rgba(255,255,255,.72)",
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#2A3A20",
                    outline: "none",
                    boxShadow: "inset 0 1px 4px rgba(40,60,20,.06)",
                    opacity: isFreeLimitReached ? 0.5 : 1,
                  }}
                />

                <motion.button
                  type="button"
                  onClick={() => submit(input)}
                  disabled={!hasQ || submitting || isFreeLimitReached}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Enviar pergunta"
                  style={{
                    width: 46, height: 46, borderRadius: 999, flex: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(255,255,255,.7)",
                    cursor: hasQ ? "pointer" : "default",
                    background: hasQ
                      ? "radial-gradient(130% 130% at 30% 22%, #C7E8A8, #5EA83E 55%, #3A7A26)"
                      : "rgba(180,190,160,.35)",
                    boxShadow: hasQ ? "0 8px 16px rgba(40,110,40,.32)" : "none",
                    opacity: submitting || isFreeLimitReached ? 0.5 : 1,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12 20 4l-4 16-4.5-6.5L4 12Zm7.5 1.5L20 4" stroke={hasQ ? "#153A16" : "rgba(60,80,40,.45)"} strokeWidth="1.9" strokeLinecap="round" /></svg>
                </motion.button>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={openParents}
                  className="active:scale-95"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "9px 14px", borderRadius: 999, cursor: "pointer",
                    background: "rgba(255,255,255,.88)",
                    border: "1px solid rgba(255,255,255,1)",
                    fontWeight: 900, fontSize: 12, color: "#2E6B3E",
                    boxShadow: "0 4px 12px rgba(40,60,20,.1)",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 2.5V11c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V5.5Z" stroke="#2E6B3E" strokeWidth="1.9" strokeLinejoin="round" /></svg>
                  Pais
                </button>
                <button
                  type="button"
                  onClick={openPlans}
                  className="active:scale-95"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "9px 16px", borderRadius: 999, cursor: "pointer",
                    border: "1px solid rgba(255,235,150,.7)",
                    fontWeight: 900, fontSize: 12, color: "#5A3A00",
                    background: "radial-gradient(130% 130% at 30% 22%, #FFE9A8, #F5C24E 55%, #E0A52E)",
                    boxShadow: "0 6px 14px rgba(200,140,30,.32)",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#5A3A00"><path d="M4 18h16l-1.4-8.6-4 3.2L12 5l-2.6 7.6-4-3.2L4 18Z" /></svg>
                  {isPremium ? "Premium" : "Assinar"}
                </button>
              </div>
            </div>

            <img
              src={ASSETS.family}
              alt="Família lendo juntos"
              draggable={false}
              onError={(e) => {
                (e.target as HTMLImageElement).src = ASSETS.familyFallback;
              }}
              style={{
                position: "absolute",
                right: -4,
                bottom: 0,
                width: "46%",
                maxWidth: 180,
                height: "88%",
                objectFit: "cover",
                objectPosition: "center 20%",
                borderRadius: "28px 0 0 40%",
                maskImage: "radial-gradient(70% 75% at 55% 48%, #000 42%, transparent 78%)",
                WebkitMaskImage: "radial-gradient(70% 75% at 55% 48%, #000 42%, transparent 78%)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
          </div>
        </section>

        {/* ── HOJE PARA VOCÊ — grid 3 ── */}
        <section style={{ padding: "18px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
            <h2
              style={{
                margin: 0,
                fontFamily: "'Lora', Georgia, serif",
                fontWeight: 600,
                fontSize: 20,
                color: "#1F2E18",
              }}
            >
              Hoje para você{" "}
              <span style={{ fontSize: 14, color: "#D0A030" }}>✦</span>
            </h2>
            {onOpenAchievements && (
              <button
                type="button"
                onClick={() => { haptic("light"); sfx("click"); onOpenAchievements(); }}
                style={{
                  border: "none", background: "none", cursor: "pointer",
                  fontWeight: 900, fontSize: 12, color: "#5A7A48",
                  display: "flex", alignItems: "center", gap: 3, padding: 0,
                }}
              >
                Ver todas
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="m9 6 6 6-6 6" stroke="#5A7A48" strokeWidth="2.2" strokeLinecap="round" /></svg>
              </button>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            {HOJE_MOCK.map((q) => (
              <button
                key={q.text}
                type="button"
                onClick={() => submit(q.text)}
                disabled={submitting || isFreeLimitReached}
                className="active:scale-[.97]"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 20,
                  padding: 0,
                  textAlign: "left",
                  cursor: submitting || isFreeLimitReached ? "default" : "pointer",
                  border: "0.5px solid rgba(255,255,255,.9)",
                  boxShadow: "0 10px 24px rgba(40,60,20,.12)",
                  background: "#fff",
                  opacity: submitting || isFreeLimitReached ? 0.55 : 1,
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                <div style={{ position: "relative", height: 92, overflow: "hidden" }}>
                  <img
                    src={q.cover}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: 8,
                      bottom: 8,
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: q.arrow,
                      boxShadow: "0 4px 10px rgba(0,0,0,.22)",
                      border: "1px solid rgba(255,255,255,.5)",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg>
                  </div>
                </div>
                <div style={{ padding: "8px 9px 10px" }}>
                  <div
                    style={{
                      fontFamily: "'Lora', Georgia, serif",
                      fontWeight: 600,
                      fontSize: 12,
                      lineHeight: 1.2,
                      color: "#1F2E18",
                      minHeight: 30,
                    }}
                  >
                    {q.text}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 7px",
                      borderRadius: 999,
                      background: "rgba(100,160,80,.12)",
                      fontSize: 9,
                      fontWeight: 900,
                      color: "#3E7A42",
                    }}
                  >
                    {q.category}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── SOS ── */}
        <section style={{ padding: "14px 16px 8px" }}>
          <button
            type="button"
            onClick={() => { haptic("medium"); sfx("click"); setSosOpen(true); }}
            className="active:scale-[.985]"
            style={{
              position: "relative",
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 14px",
              borderRadius: 24,
              textAlign: "left",
              cursor: "pointer",
              background: "linear-gradient(150deg, rgba(255,220,210,.75), rgba(255,200,190,.55))",
              border: "0.5px solid rgba(255,210,200,.9)",
              boxShadow: "0 12px 28px rgba(160,60,50,.12), inset 0 1px 0 rgba(255,255,255,.8)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: 48, height: 48, borderRadius: 999, flex: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "radial-gradient(130% 130% at 30% 22%, #FF9E8E, #F0645A 55%, #D23B32)",
                boxShadow: "0 6px 14px rgba(200,50,40,.35)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 20.5l-1.4-1.3C6 15.1 3 12.4 3 9a4.5 4.5 0 0 1 8.2-2.6L12 7l.8-.6A4.5 4.5 0 0 1 21 9c0 3.4-3 6.1-7.6 10.2L12 20.5Z" fill="rgba(255,255,255,.3)" stroke="#fff" strokeWidth="1.5" /></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1, color: "#D24B3E", marginBottom: 2 }}>SOS KIDZZ</div>
              <div style={{ fontFamily: "'Lora', Georgia, serif", fontWeight: 600, fontSize: 17, color: "#5A2A1E", lineHeight: 1.1 }}>
                Precisa de <span style={{ color: "#E24B3E" }}>apoio</span> agora?
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7A4A3A", marginTop: 3, lineHeight: 1.3 }}>
                Acolhimento imediato para sua família, sempre que precisar.
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {["Sigiloso", "Acolhedor", "Imediato"].map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 9.5, fontWeight: 800, color: "#8A5A4A",
                      padding: "3px 8px", borderRadius: 999,
                      background: "rgba(255,255,255,.55)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div
              style={{
                flex: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <img
                src={ASSETS.gui}
                alt=""
                onError={(e) => { (e.target as HTMLImageElement).src = ASSETS.guiFallback; }}
                style={{
                  width: 56,
                  height: 56,
                  objectFit: "contain",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,.12))",
                  WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 55%, transparent 88%)",
                  maskImage: "radial-gradient(circle at 50% 50%, #000 55%, transparent 88%)",
                  background: "transparent",
                }}
              />
              <span
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "radial-gradient(130% 130% at 30% 22%, #FF9E8E, #F0645A 55%, #D23B32)",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 12,
                  boxShadow: "0 6px 14px rgba(200,50,40,.35)",
                }}
              >
                Acessar ›
              </span>
            </div>
          </button>
        </section>

        <div style={{ padding: "10px 20px 8px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "rgba(80,100,60,.5)" }}>
          {streakDays > 0
            ? `${streakDays} dias juntos · uma pergunta por dia aproxima a família`
            : "Uma pergunta por dia aproxima a família"}
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

      <SOSModal
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        onGoWellness={() => onTabChange?.("wellness")}
      />

      <RitualFlow ritual={currentRitual} open={ritualOpen} onClose={() => setRitualOpen(false)} />
    </motion.div>
  );
};

export default HomeScreen;

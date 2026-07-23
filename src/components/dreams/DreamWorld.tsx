/* ── KIDZZ — Sessão Sonhos (premium v2)
   Referência: public/telas/ABA SONHOS/*
   Assets: public/exemplos/assets/sonhos-v2/* (gerados Hermes/Codex gpt-image)
   Pessoas/família — sem lagarto nos assets novos.
   Lógica real preservada (sons, histórias, timer, playlists, paywall).
*/
import {
  useState, useCallback, useRef, useEffect, useMemo, type CSSProperties,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Crown, ChevronRight, Volume2, Headphones,
  X, ExternalLink, Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/hooks/useEntitlement";
import { Slider } from "@/components/ui/slider";
import { AmbientSoundEngine } from "./AmbientSoundEngine";
import { DreamNarrator } from "./DreamNarrator";
import {
  SLEEP_STORIES, SOUND_PRESETS, TIMER_OPTIONS, SLEEP_PLAYLISTS,
  FAMILY_MOMENTS, STORY_CATEGORIES, type SleepCategory, type SoundPreset,
} from "./sleepStories";
import PreSleep from "./PreSleep";
import { haptic } from "@/lib/haptics";
import PremiumSeal from "@/components/common/PremiumSeal";

/* Spring premium reusável para microinterações */
const tapSpring = { type: "spring" as const, stiffness: 420, damping: 28, mass: 0.6 };
const cardTap = { scale: 0.975 };

/* ────────── Tokens visuais premium (ABA SONHOS) ────────── */
const DREAM_BG =
  "linear-gradient(180deg,#2B1A4A 0%,#1E1238 36%,#160C2A 68%,#1A0E28 100%)";
const ASSETS = {
  hero: "/exemplos/assets/sonhos-v2/hero-family.png",
  featHeart: "/exemplos/assets/sonhos-v2/feat-heart.png",
  featStar: "/exemplos/assets/sonhos-v2/feat-star.png",
  featMoon: "/exemplos/assets/sonhos-v2/feat-moon.png",
  featPhoto: "/exemplos/assets/sonhos-v2/feat-photo.png",
  kids: "/exemplos/assets/sonhos-v2/kids-gratitude.png",
} as const;
const HERO_IMG = ASSETS.hero;

/* Liquid glass roxo (nível Bora, paleta noite) */
const glassCard: CSSProperties = {
  background:
    "linear-gradient(165deg, rgba(255,245,255,.16) 0%, rgba(160,120,230,.12) 42%, rgba(30,16,55,.42) 100%)",
  backdropFilter: "blur(40px) saturate(190%)",
  WebkitBackdropFilter: "blur(40px) saturate(190%)",
  border: "0.5px solid rgba(220,190,255,.32)",
  boxShadow:
    "0 12px 40px rgba(10,4,30,.36), 0 1px 0 rgba(255,245,255,.28) inset, 0 -1px 0 rgba(0,0,0,.14) inset",
};

const goldCta: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "15px 18px",
  minHeight: 52,
  borderRadius: 999,
  border: "0.5px solid rgba(255,235,190,.7)",
  background: "linear-gradient(180deg,#FBE8A8 0%,#F0C25A 45%,#E0A030 100%)",
  color: "#2A1608",
  fontFamily: "'Nunito',system-ui,sans-serif",
  fontWeight: 900,
  fontSize: 15,
  boxShadow:
    "0 10px 28px rgba(180,100,20,.4), 0 1px 0 rgba(255,252,230,.9) inset, 0 -3px 8px rgba(100,50,0,.16) inset",
  cursor: "pointer",
};

/* Botão de ícone "gloss" (brilho radial) — helper do design */
const gloss = (
  light: string, mid: string, deep: string, size = 40, radius = 13,
): CSSProperties => ({
  flex: "none", width: size, height: size, borderRadius: radius,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${light} 16%, ${mid} 55%, ${deep} 100%)`,
  boxShadow:
    "0 6px 14px rgba(0,0,0,.35), inset 0 1.5px 2px rgba(255,255,255,.6), inset 0 -4px 8px rgba(0,0,0,.2)",
});

/* Paths SVG (extraídos do design) */
const P = {
  back: "M19 12H5m6-6-6 6 6 6",
  moon: "M20 13.5A8 8 0 0 1 10.5 4 8 8 0 1 0 20 13.5Z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-15v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8",
  wind: "M3 8h10a2.5 2.5 0 1 0-2.5-2.5M3 12h14a2.5 2.5 0 1 1-2.5 2.5M3 16h8a2 2 0 1 1-2 2",
  heart: "M12 20.3l-7.1-6.9a4.6 4.6 0 0 1 6.4-6.5l.7.7.7-.7a4.6 4.6 0 0 1 6.4 6.5Z",
  star: "M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.7-5.3 2.7 1-5.8L3.5 9.7l5.9-.9Z",
  speaker: "M11 5 6 9H3v6h3l5 4V5Zm5.5 3a5 5 0 0 1 0 8m2.5-11a8.5 8.5 0 0 1 0 14",
  book: "M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5v-12ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 0 1.5-1.5v-12ZM11 4v15m2-15v15",
  note: "M9 17.5V6.8a1 1 0 0 1 .8-1l7.4-1.4a1 1 0 0 1 1.2 1v10.1M9 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm9.4-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z",
};

/* Gradientes/subtítulos das paisagens sonoras por categoria */
const SOUND_GRAD: Record<SoundPreset["category"], [string, string]> = {
  agua: ["#3E6FA0", "#1C3A5A"],
  natureza: ["#3E6E56", "#1E3A2E"],
  ambiente: ["#6A5A9A", "#332452"],
  bebe: ["#A05A9A", "#4E2452"],
  instrumento: ["#5E4EA8", "#2A1C54"],
};
const SOUND_SUB: Record<SoundPreset["category"], string> = {
  agua: "Água calma",
  natureza: "Sons da natureza",
  ambiente: "Ambiente",
  bebe: "Para bebês",
  instrumento: "Melodia suave",
};

/* Keyframes locais (prefixo sonh- para evitar colisão global) */
const KEYFRAMES = `
@keyframes sonh-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes sonh-flicker{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.1)}}
@keyframes sonh-sunglow{0%,100%{opacity:.75;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
@keyframes sonh-drift1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,24px) scale(1.16)}}
@keyframes sonh-drift2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-34px,-18px) scale(1.1)}}
@keyframes sonh-shine{0%{transform:translateX(-130%) skewX(-18deg)}60%,100%{transform:translateX(240%) skewX(-18deg)}}
@keyframes sonh-cascade{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
@keyframes sonh-heroIn{from{opacity:0;transform:translateY(-14px) scale(1.04)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes sonh-eq1{0%,100%{height:5px}50%{height:12px}}
@keyframes sonh-eq2{0%,100%{height:11px}50%{height:4px}}
@keyframes sonh-eq3{0%,100%{height:7px}50%{height:13px}}
`;

/* ────────── Backdrop noturno (fundo fixo do design) ────────── */
const STARS = [
  { top: "120px", left: "14%", s: 3, c: "#FFF", d: "3.4s", delay: "0s" },
  { top: "210px", left: "80%", s: 2.5, c: "#FFF", d: "4.2s", delay: "1s" },
  { top: "340px", left: "24%", s: 3, c: "#FFE6C0", d: "5s", delay: ".5s" },
  { top: "520px", left: "70%", s: 2.5, c: "#FFF", d: "3.8s", delay: "1.6s" },
];

const DreamBackdrop = ({ sleepy }: { sleepy: boolean }) => (
  <div
    className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    style={{
      background: DREAM_BG,
      filter: sleepy ? "brightness(0.55) saturate(0.8)" : "none",
      transition: "filter 1.2s ease",
    }}
  >
    <style>{KEYFRAMES}</style>
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(50% 26% at 78% 16%,rgba(255,150,70,.28),transparent 66%),radial-gradient(45% 30% at 15% 55%,rgba(150,110,220,.16),transparent 70%),radial-gradient(60% 34% at 55% 100%,rgba(210,110,90,.18),transparent 70%)",
      }}
    />
    <div
      className="absolute"
      style={{
        top: -40, left: -70, width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(140,100,220,.24),transparent 65%)",
        filter: "blur(30px)", animation: "sonh-drift1 16s ease-in-out infinite",
      }}
    />
    <div
      className="absolute"
      style={{
        bottom: 120, right: -80, width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(220,120,90,.2),transparent 65%)",
        filter: "blur(32px)", animation: "sonh-drift2 19s ease-in-out 3s infinite",
      }}
    />
    {STARS.map((st, i) => (
      <div
        key={i}
        className="absolute rounded-full"
        style={{
          top: st.top, left: st.left, width: st.s, height: st.s, background: st.c,
          boxShadow: `0 0 6px 2px ${st.c === "#FFF" ? "rgba(255,255,255,.7)" : "rgba(255,220,160,.6)"}`,
          animation: `sonh-flicker ${st.d} ease-in-out ${st.delay} infinite`,
        }}
      />
    ))}
  </div>
);

/* ────────── Cabeçalho de seção (estilo do design) ────────── */
const Eyebrow = ({
  d, color, size = 13, sw = 1.9,
}: { d: string; color: string; size?: number; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SectionHead = ({
  icon, eyebrow, color, title, subtitle,
}: {
  icon: React.ReactNode; eyebrow: string; color: string; title: string; subtitle?: string;
}) => (
  <div style={{ padding: "22px 20px 10px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "1.4px", color }}>
        {eyebrow}
      </span>
    </div>
    <h2 style={{ margin: 0, fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 19, color: "#F6EEFC" }}>
      {title}
    </h2>
    {subtitle && (
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(220,206,240,.7)", marginTop: 2 }}>
        {subtitle}
      </div>
    )}
  </div>
);

/* ────────── Main ────────── */
interface Props { onBack: () => void; }
type DreamView = "main" | "story" | "playing" | "presleep";

const DreamWorld = ({ onBack }: Props) => {
  const { profile, handleCheckout } = useAuth();
  const { canUse } = useEntitlement();
  // Sonhos exige plano Premium (kidzz NÃO libera).
  const isPremium = canUse("sonhos");
  const childName = profile?.child_name || "amigo";
  const interests = (profile as any)?.child_interests as string[] | undefined;

  const engineRef = useRef<AmbientSoundEngine | null>(null);
  const narratorRef = useRef<DreamNarrator | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [view, setView] = useState<DreamView>("main");
  const [sleepyMode, setSleepyMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SleepCategory | "all">("all");
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [activeSounds, setActiveSounds] = useState<Record<string, number>>({});
  const [timerMinutes, setTimerMinutes] = useState(20);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [showPremiumBlock, setShowPremiumBlock] = useState(false);
  const [lockedReason, setLockedReason] = useState<string>("");
  const [audioError, setAudioError] = useState<string | null>(null);
  const [openPlaylist, setOpenPlaylist] = useState<string | null>(null);
  const [openMoment, setOpenMoment] = useState<string | null>(null);

  useEffect(() => {
    engineRef.current = new AmbientSoundEngine();
    narratorRef.current = new DreamNarrator();
    return () => {
      engineRef.current?.stopAll();
      narratorRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const canAccess = useCallback((free: boolean) => free || isPremium, [isPremium]);

  const triggerPaywall = (reason: string) => {
    setLockedReason(reason);
    setShowPremiumBlock(true);
    haptic("medium");
  };

  const filteredStories = useMemo(
    () => activeCategory === "all" ? SLEEP_STORIES : SLEEP_STORIES.filter(s => s.category === activeCategory),
    [activeCategory]
  );

  const toggleSound = useCallback(async (id: string, free: boolean) => {
    const sound = SOUND_PRESETS.find((s) => s.id === id);
    if (!sound?.url) {
      setAudioError("Esse som chega em breve 🌙");
      setTimeout(() => setAudioError(null), 2200);
      return;
    }
    if (!canAccess(free)) { triggerPaywall("Sons premium para o ritual de sono."); return; }
    const engine = engineRef.current!;
    setAudioError(null);

    if (activeSounds[id] !== undefined) {
      engine.stop(id);
      setActiveSounds((prev) => { const n = { ...prev }; delete n[id]; return n; });
    } else {
      if (!isPremium && Object.keys(activeSounds).length >= 1) {
        triggerPaywall("Mixe vários sons no plano Premium.");
        return;
      }
      const ok = await engine.start(id, sound.url, 0.5);
      if (ok) setActiveSounds((prev) => ({ ...prev, [id]: 0.5 }));
      else setAudioError(`Não foi possível tocar ${sound.label.toLowerCase()}. Toque novamente.`);
    }
    haptic("light");
  }, [canAccess, isPremium, activeSounds]);

  const setVolume = useCallback((id: string, vol: number) => {
    engineRef.current?.setVolume(id, vol);
    setActiveSounds((prev) => ({ ...prev, [id]: vol }));
  }, []);

  const handleStart = useCallback(() => {
    if (Object.keys(activeSounds).length === 0 && !selectedStory) return;
    setView("playing");
    setIsPlaying(true);
    const seconds = timerMinutes === 0 ? 60 * 60 : timerMinutes * 60;
    setTimeLeft(seconds);

    if (selectedStory) {
      const story = SLEEP_STORIES.find((s) => s.id === selectedStory);
      if (story) {
        setIsNarrating(true);
        narratorRef.current?.speak(story.text, () => setIsNarrating(false));
      }
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          engineRef.current?.fadeOut(8000);
          setTimeout(() => {
            engineRef.current?.stopAll();
            setActiveSounds({});
            setIsPlaying(false);
            setView("main");
          }, 9000);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        if (prev === 31) engineRef.current?.fadeOut(30000);
        return prev - 1;
      });
    }, 1000);
    haptic("medium");
  }, [timerMinutes, selectedStory, activeSounds]);

  const handleStop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    engineRef.current?.stopAll();
    narratorRef.current?.stop();
    setActiveSounds({});
    setIsPlaying(false);
    setIsNarrating(false);
    setView("main");
    setTimeLeft(0);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const hasSelection = Object.keys(activeSounds).length > 0 || !!selectedStory;

  /* ============ STORY DETAIL ============ */
  if (view === "story" && selectedStory) {
    const story = SLEEP_STORIES.find((s) => s.id === selectedStory)!;
    const handleNarrate = () => {
      if (isNarrating) { narratorRef.current?.stop(); setIsNarrating(false); return; }
      setIsNarrating(true);
      narratorRef.current?.speak(story.text, () => setIsNarrating(false));
    };
    return (
      <motion.div
        className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden overscroll-contain"
        style={{
          WebkitOverflowScrolling: "touch",
          fontFamily: "'Nunito',system-ui,sans-serif",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)",
        }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <DreamBackdrop sleepy={sleepyMode} />
        <div className="relative z-10 px-5 pt-6 pb-10">
          <button onClick={() => setView("main")} className="text-white/55 text-sm mb-4 flex items-center gap-1">
            ← Voltar
          </button>
          <div className="text-center mb-6 space-y-2">
            <span className="text-5xl">{story.emoji}</span>
            <h1 className="text-2xl" style={{ fontFamily: "'Lora',serif", fontWeight: 600, color: "#F6EEFC", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
              {story.title}
            </h1>
            <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "1.2px", color: "#FFC98A", textTransform: "uppercase" }}>
              {story.duration} · {story.ageRange ?? "Família"}
            </p>
            {story.verse && (
              <p className="italic text-sm mt-2" style={{ color: "rgba(255,222,180,.8)" }}>{story.verse}</p>
            )}
          </div>

          <motion.button
            onClick={handleNarrate}
            className="w-full py-3.5 rounded-2xl font-bold text-sm mb-6 flex items-center justify-center gap-2 border"
            style={{
              background: isNarrating
                ? "linear-gradient(135deg, rgba(255,201,138,0.22), rgba(150,110,220,0.22))"
                : "rgba(255,255,255,0.08)",
              borderColor: isNarrating ? "rgba(255,201,138,0.4)" : "rgba(200,175,245,0.24)",
              color: "#F6EEFC",
            }}
            whileTap={{ scale: 0.97 }}
          >
            <Headphones size={16} />
            {isNarrating ? "Parar narração" : "Ouvir história"}
            {isNarrating && (
              <span
                className="w-2 h-2 rounded-full ml-1"
                style={{ background: "#FFC98A", boxShadow: "0 0 8px rgba(255,201,138,0.6)" }}
              />
            )}
          </motion.button>

          <div
            className="rounded-3xl p-6 space-y-4"
            style={{
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(200,175,245,0.18)",
            }}
          >
            {story.text.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                className="leading-relaxed"
                style={{
                  color: "#F0EEF6", fontSize: "17px", lineHeight: "1.75",
                  textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                }}
              >
                {paragraph.split("\n").map((line, j, arr) => (
                  <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                ))}
              </p>
            ))}
          </div>

          <p className="text-center mt-6 text-xs italic" style={{ color: "rgba(255,222,180,.55)" }}>
            "Histórias que abraçam."
          </p>
        </div>
      </motion.div>
    );
  }

  /* ============ PLAYING (immersive) ============ */
  if (view === "playing") {
    const totalSeconds = timerMinutes === 0 ? 3600 : timerMinutes * 60;
    const progress = totalSeconds ? 1 - timeLeft / totalSeconds : 0;
    const moonScale = 1 - progress * 0.4;
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ fontFamily: "'Nunito',system-ui,sans-serif" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <DreamBackdrop sleepy />
        <div className="relative z-10 text-center space-y-8 px-6">
          <motion.div
            className="mx-auto rounded-full"
            style={{
              width: 140, height: 140,
              background: "radial-gradient(circle at 35% 35%, #fff8e0, #f5d97a 60%, #b88a3a 100%)",
              boxShadow: `0 0 ${60 * moonScale}px ${20 * moonScale}px rgba(255,220,140,${0.4 * moonScale})`,
            }}
            animate={{ scale: moonScale }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.25em", color: "#FFC98A", textTransform: "uppercase" }}>
            Noite tranquila
          </p>
          <div className="text-5xl font-bold tabular-nums" style={{ color: "#F6EEFC", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            {timerMinutes === 0 ? "∞" : formatTime(timeLeft)}
          </div>
          {isNarrating && (
            <p className="text-xs flex items-center justify-center gap-2" style={{ color: "rgba(255,222,180,.65)" }}>
              <Headphones size={12} /> Narrando história…
            </p>
          )}
          {Object.keys(activeSounds).length > 0 && (
            <div className="flex gap-2 justify-center flex-wrap">
              {Object.keys(activeSounds).map((id) => {
                const s = SOUND_PRESETS.find((p) => p.id === id);
                return s ? (
                  <span
                    key={id}
                    className="text-xs px-3 py-1.5 rounded-full"
                    style={{ color: "rgba(255,255,255,.7)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,175,245,0.2)" }}
                  >
                    <img src={s.icon} alt="" width={14} height={14} style={{ width: 14, height: 14, borderRadius: 4, objectFit: "cover", display: "inline-block", verticalAlign: "middle", marginRight: 4 }} /> {s.label}
                  </span>
                ) : null;
              })}
            </div>
          )}
          <motion.button
            onClick={handleStop}
            className="mt-6 px-10 py-3.5 rounded-full text-sm font-semibold backdrop-blur-md"
            style={{ color: "rgba(255,255,255,.85)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,175,245,0.24)" }}
            whileTap={{ scale: 0.95 }}
          >
            Parar
          </motion.button>
        </div>
      </motion.div>
    );
  }

  /* ============ PRE-SLEEP (respira com o camaleão) ============ */
  if (view === "presleep") {
    return <PreSleep onBack={() => setView("main")} />;
  }

  /* ============ MAIN ============ */
  return (
    <motion.div
      className="fixed inset-0 z-40 overflow-y-auto overflow-x-hidden overscroll-contain"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        WebkitOverflowScrolling: "touch",
        fontFamily: "'Nunito',system-ui,sans-serif",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)",
      }}
    >
      <DreamBackdrop sleepy={sleepyMode} />

      <div className="relative z-10">
        {/* ── HERO ── */}
        <div style={{ position: "relative" }}>
          {/* fundo desfocado da mesma cena */}
          <div
            style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: 414,
              backgroundImage: `url('${HERO_IMG}')`, backgroundSize: "cover", backgroundPosition: "center",
              filter: "blur(46px) saturate(1.45)", opacity: 0.5, transform: "scale(1.22)", pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative", width: "100%", height: 414, willChange: "transform",
              WebkitMaskImage: "radial-gradient(125% 94% at 50% 22%,#000 50%,rgba(0,0,0,.42) 74%,transparent 100%)",
              maskImage: "radial-gradient(125% 94% at 50% 22%,#000 50%,rgba(0,0,0,.42) 74%,transparent 100%)",
              animation: "sonh-heroIn .7s cubic-bezier(.22,1,.36,1) both",
            }}
          >
            <img
              src={HERO_IMG}
              alt="Família lendo juntos na hora de dormir"
              style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center 28%",
                animation: "sonh-floaty 7s ease-in-out infinite", filter: "saturate(1.1) contrast(1.03)",
              }}
            />
            <div
              style={{
                position: "absolute", top: 30, right: 40, width: 110, height: 110, borderRadius: "50%",
                background: "radial-gradient(circle,rgba(255,178,90,.55) 0%,rgba(240,129,46,.3) 55%,rgba(230,110,50,0) 72%)",
                filter: "blur(3px)", animation: "sonh-sunglow 6s ease-in-out infinite", mixBlendMode: "screen",
              }}
            />
            <div
              style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                background: "linear-gradient(180deg,rgba(46,28,76,.18) 0%,rgba(46,28,76,0) 34%,rgba(46,28,76,.5) 78%,rgba(36,22,64,.94) 100%)",
              }}
            />
          </div>

          {/* Header padrão: voltar · Sonhos · troféu · modo soninho (lua, não sol) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "calc(env(safe-area-inset-top, 0px) + 10px) 14px 0",
            }}
          >
            <button
              type="button"
              onClick={() => { haptic("light"); onBack?.(); }}
              aria-label="Voltar"
              className="active:scale-90"
              style={{
                width: 44, height: 44, borderRadius: 999, flex: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,.12)", backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,.28)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.25)",
              }}
            >
              <Eyebrow d={P.back} color="#F6EEFC" size={18} />
            </button>
            <div
              style={{
                flex: 1, minHeight: 44, borderRadius: 999,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: "rgba(255,255,255,.1)", backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,.28)",
                fontSize: 13, fontWeight: 800, color: "#F6EEFC",
              }}
            >
              <Eyebrow d={P.moon} color="#C9A8F0" size={14} />
              Sonhos
            </div>
            <motion.button
              onClick={() => { setSleepyMode((s) => !s); haptic("light"); }}
              aria-pressed={sleepyMode}
              whileTap={{ scale: 0.94 }}
              style={{
                height: 44, padding: "0 12px", borderRadius: 999, cursor: "pointer", flex: "none",
                display: "flex", alignItems: "center", gap: 6,
                background: sleepyMode ? "rgba(255,201,138,.16)" : "rgba(255,255,255,.1)",
                backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                border: `1px solid ${sleepyMode ? "rgba(255,201,138,.5)" : "rgba(255,255,255,.28)"}`,
                fontSize: 12, fontWeight: 800, color: "#F5E9CE",
              }}
            >
              <Eyebrow d={P.moon} color="#FFCF8A" size={14} />
              {sleepyMode ? "Ativo" : "Soninho"}
            </motion.button>
          </div>

          {/* título */}
          <div style={{ padding: "2px 24px", textAlign: "center", position: "relative", animation: "sonh-cascade .6s cubic-bezier(.22,1,.36,1) .06s both" }}>
            <h1 style={{ margin: "0 auto 9px", fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 28, lineHeight: 1.18, color: "#F6EEFC", letterSpacing: "-.35px", maxWidth: 300, textShadow: "0 2px 18px rgba(0,0,0,.45)" }}>
              Uma nova forma de <span style={{ color: "#FFC98A" }}>terminar</span> o dia.
            </h1>
            <p style={{ margin: "0 auto", fontSize: 13, fontWeight: 700, lineHeight: 1.5, color: "rgba(224,210,242,.84)", maxWidth: 280 }}>
              Histórias, sons e momentos para acalmar e conectar a família antes de dormir.
            </p>
          </div>
        </div>

        {/* ── CTA principal (dourado, mockup) ── */}
        <div style={{ padding: "16px 16px 0", animation: "sonh-cascade .6s cubic-bezier(.22,1,.36,1) .14s both" }}>
          <motion.button
            onClick={handleStart}
            disabled={!hasSelection}
            whileTap={{ scale: 0.98 }}
            style={{
              ...goldCta,
              cursor: hasSelection ? "pointer" : "default",
              opacity: hasSelection ? 1 : 0.55,
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, width: "55%", height: "100%", pointerEvents: "none", background: "linear-gradient(105deg,transparent 0%,rgba(255,255,255,.35) 50%,transparent 100%)", animation: "sonh-shine 6s ease-in-out infinite" }} />
            <Eyebrow d={P.moon} color="#2A1608" size={17} />
            Iniciar noite tranquila
          </motion.button>
          {!hasSelection && (
            <p style={{ margin: "8px 4px 0", fontSize: 10.5, fontWeight: 700, color: "rgba(220,206,240,.55)", textAlign: "center" }}>
              Escolha uma história ou um som para começar.
            </p>
          )}
        </div>

        {/* ── Benefícios (ícones 3D gerados) ── */}
        <div
          style={{
            margin: "18px 16px 0",
            padding: "16px 12px 14px",
            borderRadius: 24,
            ...glassCard,
            animation: "sonh-cascade .6s cubic-bezier(.22,1,.36,1) .16s both",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 15, color: "#F6EEFC" }}>
              Noites mágicas que transformam dias!
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { img: ASSETS.featHeart, t: "Mais conexão", d: "Momentos de qualidade em família." },
              { img: ASSETS.featStar, t: "Mais tranquilidade", d: "Sons e histórias que acalmam." },
              { img: ASSETS.featMoon, t: "Melhores sonhos", d: "Rotinas leves e descansadas." },
              { img: ASSETS.featPhoto, t: "Memórias que ficam", d: "Pequenos momentos para sempre." },
            ].map((f) => (
              <div key={f.t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center", padding: "6px 4px" }}>
                <img
                  src={f.img}
                  alt=""
                  style={{
                    width: 56, height: 56, borderRadius: 16, objectFit: "cover",
                    boxShadow: "0 8px 18px rgba(20,8,40,.35), 0 1px 0 rgba(255,255,255,.25) inset",
                    border: "0.5px solid rgba(255,230,255,.28)",
                  }}
                />
                <div style={{ fontSize: 12, fontWeight: 900, color: "#F3ECFA", lineHeight: 1.15 }}>{f.t}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(220,206,240,.62)", lineHeight: 1.25 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── AÇÕES DA NOITE ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, padding: "14px 16px 0", animation: "sonh-cascade .6s cubic-bezier(.22,1,.36,1) .2s both" }}>
          <motion.button
            onClick={() => { setView("presleep"); haptic("light"); }}
            whileTap={{ scale: 0.96 }}
            style={{ position: "relative", overflow: "hidden", borderRadius: 22, padding: "14px 14px 13px", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, ...glassCard }}
          >
            <div style={gloss("#B8E8C0", "#5CB57A", "#2F7A4E")}>
              <Eyebrow d={P.wind} color="#fff" size={19} sw={1.8} />
            </div>
            <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 14.5, color: "#F3ECFA", lineHeight: 1.15 }}>Respiração noturna</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(220,206,240,.7)" }}>Inspira… segura… solta.</div>
          </motion.button>
          <motion.button
            onClick={() => {
              const moment = FAMILY_MOMENTS[Math.floor(Math.random() * FAMILY_MOMENTS.length)];
              setOpenMoment(moment.id);
              haptic("light");
            }}
            whileTap={{ scale: 0.96 }}
            style={{ position: "relative", overflow: "hidden", borderRadius: 22, padding: "14px 14px 13px", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, ...glassCard }}
          >
            <div style={gloss("#F0B8D0", "#E0679B", "#B03A72")}>
              <Eyebrow d={P.heart} color="#fff" size={19} sw={1.8} />
            </div>
            <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 14.5, color: "#F3ECFA", lineHeight: 1.15 }}>Momento em família</div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(220,206,240,.7)" }}>Uma pergunta para a noite.</div>
          </motion.button>
        </div>

        {/* ── A NOITE JÁ ESTÁ PREPARADA (curadoria automática) ── */}
        {(() => {
          const dayIndex = Math.floor(Date.now() / 86_400_000);
          const story = SLEEP_STORIES[dayIndex % SLEEP_STORIES.length];
          const playableSounds = SOUND_PRESETS.filter((s) => !!s.url);
          const sound = playableSounds[dayIndex % playableSounds.length];
          const playlist = SLEEP_PLAYLISTS[dayIndex % SLEEP_PLAYLISTS.length];
          const playMagicSequence = async () => {
            haptic("medium");
            const soundFree = canAccess(sound.free);
            const playlistAllowed = canAccess(false) || playlist.id === "babies";
            const storyAllowed = canAccess(story.free);
            if (storyAllowed) {
              setSelectedStory(story.id);
              setIsNarrating(true);
              narratorRef.current?.speak(story.text, () => {
                setIsNarrating(false);
                if (playlistAllowed) setOpenPlaylist(playlist.id);
              });
            } else if (playlistAllowed) {
              setOpenPlaylist(playlist.id);
            } else {
              triggerPaywall("Sequência mágica completa no plano Premium.");
              return;
            }
            if (soundFree && sound.url) {
              const engine = engineRef.current;
              if (engine && activeSounds[sound.id] === undefined) {
                const ok = await engine.start(sound.id, sound.url, 0.4);
                if (ok) setActiveSounds({ [sound.id]: 0.4 });
              }
            }
          };
          return (
            <section>
              <SectionHead
                icon={<Eyebrow d={P.moon} color="#FFC98A" />}
                eyebrow="HOJE PARA SUA FAMÍLIA"
                color="#FFC98A"
                title="A noite já está preparada"
              />
              <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 11 }}>
                {/* História da noite */}
                <motion.button
                  onClick={() => {
                    if (!canAccess(story.free)) {
                      triggerPaywall(`"${story.title}" está esperando por ${childName}.`);
                      return;
                    }
                    setSelectedStory(story.id);
                    setView("story");
                    haptic("light");
                  }}
                  whileTap={cardTap}
                  transition={tapSpring}
                  style={{
                    display: "flex", alignItems: "center", gap: 13, padding: 14, borderRadius: 20,
                    cursor: "pointer", textAlign: "left",
                    background: "linear-gradient(150deg,rgba(255,255,255,.14),rgba(150,110,220,.14))",
                    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(200,175,245,.28)",
                    boxShadow: "0 10px 22px rgba(40,20,80,.3),inset 0 1.5px 0 rgba(255,255,255,.25)",
                  }}
                >
                  <div
                    style={{
                      flex: "none", width: 46, height: 46, borderRadius: 15,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "radial-gradient(130% 130% at 30% 22%,#FFE9A8,#F2C24C 55%,#C98F1E)",
                      boxShadow: "0 6px 14px rgba(0,0,0,.35),inset 0 1px 1px rgba(255,255,255,.6)",
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d={P.star} /></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "1.2px", color: "rgba(220,206,240,.6)", marginBottom: 3 }}>HISTÓRIA DA NOITE</div>
                    <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 16, color: "#F6EEFC", lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{story.title}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(220,206,240,.65)", marginTop: 1 }}>{story.duration} · {story.ageRange ?? "Família"}</div>
                  </div>
                  {canAccess(story.free)
                    ? <ChevronRight size={18} style={{ color: "rgba(220,206,240,.6)" }} />
                    : <PremiumSeal iconOnly size="sm" />}
                </motion.button>

                {/* Som ideal + Playlist da noite */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                  <motion.button
                    onClick={() => toggleSound(sound.id, sound.free)}
                    whileTap={cardTap}
                    transition={tapSpring}
                    style={{ textAlign: "left", cursor: "pointer", borderRadius: 18, padding: "13px 14px", background: "linear-gradient(150deg,rgba(255,255,255,.12),rgba(120,90,200,.12))", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(200,175,245,.24)", boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.22)" }}
                  >
                    <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "1.2px", color: "#A9C4A0", marginBottom: 7 }}>SOM IDEAL</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <img src={sound.icon} alt="" width={22} height={22} style={{ width: 22, height: 22, borderRadius: 8, objectFit: "cover" }} />
                      <span style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 14, color: "#F3ECFA" }}>{sound.label}</span>
                    </div>
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      if (!canAccess(false) && playlist.id !== "babies") {
                        triggerPaywall("Playlists premium para todas as idades.");
                        return;
                      }
                      setOpenPlaylist(playlist.id);
                      haptic("light");
                    }}
                    whileTap={cardTap}
                    transition={tapSpring}
                    style={{ textAlign: "left", cursor: "pointer", borderRadius: 18, padding: "13px 14px", background: "linear-gradient(150deg,rgba(255,255,255,.12),rgba(120,90,200,.12))", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(200,175,245,.24)", boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.22)" }}
                  >
                    <div style={{ fontSize: 9.5, fontWeight: 900, letterSpacing: "1.2px", color: "#A9B6E8", marginBottom: 7 }}>PLAYLIST DA NOITE</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <img src={playlist.cover} alt="" width={22} height={22} style={{ width: 22, height: 22, borderRadius: 8, objectFit: "cover" }} />
                      <span style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 14, color: "#F3ECFA", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{playlist.title}</span>
                    </div>
                  </motion.button>
                </div>

                {/* Sequência mágica (premium) */}
                <motion.button
                  onClick={playMagicSequence}
                  whileTap={cardTap}
                  transition={tapSpring}
                  style={{
                    width: "100%", padding: "13px", borderRadius: 18, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    fontSize: 13.5, fontWeight: 900, color: "#F6EEFC",
                    background: "linear-gradient(135deg, rgba(180,140,255,0.3), rgba(255,201,138,0.24))",
                    border: "1px solid rgba(255,201,138,0.35)",
                    boxShadow: "0 8px 24px -8px rgba(180,140,255,0.45)",
                  }}
                >
                  <Sparkles size={16} style={{ color: "#FFC98A" }} />
                  Reproduzir sequência mágica
                </motion.button>
              </div>
            </section>
          );
        })()}

        {/* ── TIMER DO SONINHO ── */}
        <section>
          <SectionHead
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="8" stroke="#FFC98A" strokeWidth="1.9" /><path d="M12 9v4l2.5 1.5M9 3h6" stroke="#FFC98A" strokeWidth="1.9" strokeLinecap="round" /></svg>}
            eyebrow="TIMER DO SONINHO"
            color="#FFC98A"
            title="A lua diminui devagar"
            subtitle="Escolha quanto dura sua noite."
          />
          <div style={{ display: "flex", gap: 9, overflowX: "auto", padding: "2px 16px 14px" }} className="scrollbar-none">
            {TIMER_OPTIONS.map((opt) => {
              const on = timerMinutes === opt.minutes;
              return (
                <motion.button
                  key={opt.minutes}
                  onClick={() => { setTimerMinutes(opt.minutes); haptic("light"); }}
                  whileTap={{ scale: 0.94 }}
                  style={{
                    flex: "none", padding: "11px 20px", borderRadius: 16, cursor: "pointer",
                    fontSize: 13, fontWeight: 900, whiteSpace: "nowrap", transition: "all .25s",
                    color: on ? "#FFE7BE" : "rgba(224,210,242,.72)",
                    background: on ? "linear-gradient(150deg,rgba(255,200,120,.18),rgba(240,150,60,.12))" : "rgba(255,255,255,.07)",
                    border: on ? "1.5px solid rgba(255,200,120,.6)" : "1px solid rgba(200,175,245,.2)",
                    boxShadow: on ? "0 6px 16px rgba(240,150,60,.25), inset 0 1px 0 rgba(255,255,255,.2)" : "inset 0 1px 0 rgba(255,255,255,.12)",
                  }}
                >
                  {opt.label}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ── PAISAGENS SONORAS ── */}
        <section>
          <SectionHead
            icon={<Eyebrow d={P.speaker} color="#8AD0B0" />}
            eyebrow="SONS DA NOITE"
            color="#8AD0B0"
            title="Paisagens sonoras"
            subtitle="Toque para embalar o sono."
          />
          {audioError && (
            <div style={{ margin: "0 16px 10px", borderRadius: 12, padding: "8px 12px", textAlign: "center", background: "rgba(127,29,29,0.25)", border: "1px solid rgba(248,113,113,0.28)" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{audioError}</p>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 16px 16px" }} className="scrollbar-none">
            {SOUND_PRESETS.map((sound) => {
              const locked = !canAccess(sound.free);
              const isActive = activeSounds[sound.id] !== undefined;
              const noUrl = !sound.url;
              const [g0, g1] = SOUND_GRAD[sound.category];
              return (
                <motion.button
                  key={sound.id}
                  onClick={() => toggleSound(sound.id, sound.free)}
                  whileTap={(locked || noUrl) ? {} : { scale: 0.97 }}
                  style={{
                    position: "relative", overflow: "hidden", flex: "none", width: 158, height: 122,
                    borderRadius: 20, cursor: "pointer", border: "1px solid rgba(200,175,245,.4)",
                    boxShadow: isActive ? "0 12px 26px rgba(90,58,168,.5)" : "0 10px 22px rgba(20,8,40,.4)",
                    background: `linear-gradient(158deg,${g0},${g1})`,
                    display: "flex", flexDirection: "column", justifyContent: "flex-end",
                    padding: 12, opacity: noUrl ? 0.55 : 1,
                  }}
                >
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.5))", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", top: 11, left: 11, width: 32, height: 32, borderRadius: 11, background: "rgba(255,255,255,.2)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                    <img src={sound.icon} alt="" width={28} height={28} style={{ width: 28, height: 28, borderRadius: 10, objectFit: "cover" }} />
                  </div>
                  <div style={{ position: "absolute", top: 11, right: 11, width: 34, height: 34, borderRadius: 999, background: "rgba(255,255,255,.94)", boxShadow: "0 4px 12px rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isActive ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 2, height: 14 }}>
                        <div style={{ width: 3, borderRadius: 2, background: "#5E3AA8", animation: "sonh-eq1 .7s ease-in-out infinite" }} />
                        <div style={{ width: 3, borderRadius: 2, background: "#5E3AA8", animation: "sonh-eq2 .7s ease-in-out infinite" }} />
                        <div style={{ width: 3, borderRadius: 2, background: "#5E3AA8", animation: "sonh-eq3 .7s ease-in-out infinite" }} />
                      </div>
                    ) : locked ? (
                      <PremiumSeal iconOnly size="sm" />
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="#5E3AA8"><path d="M8 5v14l11-7z" /></svg>
                    )}
                  </div>
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 14.5, color: "#fff", lineHeight: 1.15 }}>{sound.label}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,.82)", marginTop: 1 }}>{noUrl ? "Em breve" : SOUND_SUB[sound.category]}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* MIXAGEM */}
          <AnimatePresence>
            {Object.keys(activeSounds).length > 0 && (
              <motion.div
                style={{ margin: "0 16px 8px", padding: 16, borderRadius: 20, ...glassCard, display: "flex", flexDirection: "column", gap: 12 }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "1.2px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, color: "#8AD0B0" }}>
                  <Volume2 size={12} /> Mix de sons
                </p>
                {Object.entries(activeSounds).map(([id, vol]) => {
                  const s = SOUND_PRESETS.find((p) => p.id === id);
                  return s ? (
                    <div key={id} className="flex items-center gap-3">
                      <img src={s.icon} alt="" className="w-7 h-7 rounded-lg object-cover" />
                      <Slider
                        value={[vol * 100]}
                        onValueChange={([v]) => setVolume(id, v / 100)}
                        max={100} step={1}
                        className="flex-1 [&_[data-radix-slider-track]]:bg-white/10 [&_[data-radix-slider-range]]:bg-amber-300/70 [&_[data-radix-slider-thumb]]:bg-white [&_[data-radix-slider-thumb]]:border-amber-300 [&_[data-radix-slider-thumb]]:w-4 [&_[data-radix-slider-thumb]]:h-4"
                      />
                      <span className="text-xs w-9 text-right" style={{ color: "rgba(220,206,240,.5)" }}>{Math.round(vol * 100)}%</span>
                    </div>
                  ) : null;
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── HISTÓRIAS QUE ABRAÇAM ── */}
        <section>
          <SectionHead
            icon={<Eyebrow d={P.book} color="#C9A8F0" />}
            eyebrow="HISTÓRIAS QUE ABRAÇAM"
            color="#C9A8F0"
            title="Calma para dormir. Memórias para a vida."
          />
          {/* Categorias */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 16px 12px" }} className="scrollbar-none">
            {[{ id: "all", label: "Todas", icon: "/exemplos/assets/icons-3d/sparkle.png" }, ...STORY_CATEGORIES].map((cat) => {
              const on = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  style={{
                    flex: "none", padding: "8px 14px", borderRadius: 999, fontSize: 12, fontWeight: 800,
                    cursor: "pointer", whiteSpace: "nowrap", transition: "all .25s",
                    color: on ? "#E8DCFF" : "rgba(224,210,242,.72)",
                    background: on ? "linear-gradient(150deg,rgba(180,140,255,.28),rgba(120,90,200,.18))" : "rgba(255,255,255,.06)",
                    border: `1px solid ${on ? "rgba(200,175,245,.5)" : "rgba(200,175,245,.2)"}`,
                  }}
                >
                  <img src={cat.icon} alt="" width={16} height={16} style={{ width: 16, height: 16, borderRadius: 5, objectFit: "cover", marginRight: 5, verticalAlign: "middle", display: "inline-block" }} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredStories.map((story) => {
              const locked = !canAccess(story.free);
              const isSelected = selectedStory === story.id;
              return (
                <motion.button
                  key={story.id}
                  onClick={() => {
                    if (locked) {
                      triggerPaywall(`"${story.title}" está esperando por ${childName}.`);
                      return;
                    }
                    setSelectedStory(isSelected ? null : story.id);
                    haptic("light");
                  }}
                  whileTap={locked ? {} : { scale: 0.98 }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 14,
                    borderRadius: 18, textAlign: "left", cursor: "pointer",
                    ...glassCard,
                    background: isSelected ? "linear-gradient(150deg,rgba(180,140,255,.24),rgba(120,90,200,.16))" : glassCard.background,
                    borderColor: isSelected ? "rgba(200,175,245,.5)" : "rgba(200,175,245,.28)",
                    opacity: locked ? 0.55 : 1,
                  }}
                >
                  <div
                    style={{
                      width: 46, height: 46, borderRadius: 14, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 24, flex: "none",
                      background: "rgba(255,255,255,.08)", border: "1px solid rgba(200,175,245,.24)",
                      boxShadow: isSelected ? "0 0 14px rgba(180,140,255,.3)" : "0 0 12px rgba(255,201,138,.1)",
                    }}
                  >
                    {story.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 15, color: "#F6EEFC", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{story.title}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(220,206,240,.55)", marginTop: 2 }}>
                      {story.duration} · {story.ageRange ?? "Família"}{story.category === "biblia" && " · Bíblia infantil"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "none" }}>
                    {isSelected && !locked && (
                      <span
                        onClick={(e) => { e.stopPropagation(); setView("story"); }}
                        style={{ padding: 8, borderRadius: 12, cursor: "pointer", background: "rgba(180,140,255,.22)", border: "1px solid rgba(180,140,255,.3)", display: "flex" }}
                      >
                        <Eyebrow d={P.book} color="#D8C2FF" />
                      </span>
                    )}
                    {locked
                      ? <PremiumSeal iconOnly size="sm" />
                      : isSelected
                        ? <div style={{ width: 24, height: 24, borderRadius: 999, background: "#8A5ED8", display: "flex", alignItems: "center", justifyContent: "center" }}><Play size={11} className="text-white ml-0.5" /></div>
                        : <ChevronRight size={16} style={{ color: "rgba(220,206,240,.3)" }} />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ── PLAYLISTS CALMARIA ── */}
        <section>
          <SectionHead
            icon={<Eyebrow d={P.note} color="#C9A8F0" />}
            eyebrow="PLAYLISTS CALMARIA"
            color="#C9A8F0"
            title="Trilhas para cada idade"
            subtitle="Atualizadas automaticamente pelo Spotify."
          />
          <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 16px 8px", scrollSnapType: "x mandatory" }} className="scrollbar-none">
            {SLEEP_PLAYLISTS.map((pl) => {
              const locked = !canAccess(false) && pl.id !== "babies";
              return (
                <motion.button
                  key={pl.id}
                  onClick={() => {
                    if (locked) { triggerPaywall("Playlists premium para todas as idades."); return; }
                    setOpenPlaylist(pl.id);
                    haptic("light");
                  }}
                  whileTap={cardTap}
                  transition={tapSpring}
                  style={{
                    flex: "none", width: 148, scrollSnapAlign: "start", textAlign: "left",
                    overflow: "hidden", position: "relative", borderRadius: 22, ...glassCard,
                  }}
                >
                  <div style={{ position: "relative", height: 148, overflow: "hidden" }}>
                    <img
                      src={pl.cover}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <div
                      style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(180deg, transparent 40%, rgba(12,6,28,.88) 100%)",
                        pointerEvents: "none",
                      }}
                    />
                    {locked && (
                      <span
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-full"
                        style={{ background: "rgba(0,0,0,.45)", border: "0.5px solid rgba(255,255,255,.25)" }}
                      >
                        <PremiumSeal iconOnly size="sm" />
                      </span>
                    )}
                    <div style={{ position: "absolute", left: 10, right: 10, bottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: ".5px", textTransform: "uppercase", color: pl.glow, textShadow: "0 1px 6px rgba(0,0,0,.5)" }}>
                        {pl.ageRange}
                      </div>
                      <div style={{ fontSize: 13.5, fontFamily: "'Lora',serif", fontWeight: 600, color: "#F6EEFC", lineHeight: 1.15, marginTop: 2, textShadow: "0 1px 8px rgba(0,0,0,.55)" }}>
                        {pl.title}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ── PERGUNTA DA NOITE (pessoas, asset gerado) ── */}
        <section style={{ padding: "8px 16px 0" }}>
          <motion.button
            onClick={() => {
              const moment = FAMILY_MOMENTS.find((x) => x.id === "grateful") ?? FAMILY_MOMENTS[0];
              setOpenMoment(moment.id);
              haptic("light");
            }}
            whileTap={{ scale: 0.985 }}
            style={{
              width: "100%", borderRadius: 24, overflow: "hidden", textAlign: "left", cursor: "pointer",
              ...glassCard, padding: 0, display: "block",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", minHeight: 128 }}>
              <div style={{ padding: "16px 14px 16px 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Eyebrow d={P.heart} color="#FFC98A" size={14} />
                  <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "1.2px", color: "rgba(255,201,138,.85)" }}>
                    PERGUNTA DA NOITE
                  </span>
                </div>
                <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 15, color: "#F6EEFC", lineHeight: 1.3 }}>
                  “Conte 3 coisas pelas quais somos gratos hoje.”
                </div>
              </div>
              <div style={{ position: "relative", minHeight: 128 }}>
                <img
                  src={ASSETS.kids}
                  alt="Crianças lendo juntas"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(22,12,42,.55) 0%, transparent 50%)" }} />
              </div>
            </div>
          </motion.button>
        </section>

        {/* ── MOMENTOS EM FAMÍLIA ── */}
        <section>
          <SectionHead
            icon={<Eyebrow d={P.heart} color="#F0B8D0" />}
            eyebrow="MOMENTOS EM FAMÍLIA"
            color="#F0B8D0"
            title="Menos correria. Mais presença."
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, padding: "0 16px" }}>
            {FAMILY_MOMENTS.map((m) => (
              <motion.button
                key={m.id}
                onClick={() => { setOpenMoment(m.id); haptic("light"); }}
                whileTap={{ scale: 0.97 }}
                style={{ padding: "14px 14px 13px", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, borderRadius: 22, ...glassCard }}
              >
                <img src={m.icon} alt="" width={40} height={40} style={{ width: 40, height: 40, borderRadius: 14, objectFit: "cover", boxShadow: "0 6px 14px rgba(0,0,0,.25)" }} />
                <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 13.5, color: "#F3ECFA", lineHeight: 1.15 }}>{m.title}</div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── Premium upsell ── */}
        {!isPremium && (
          <motion.div
            style={{ margin: "22px 16px 0", padding: 20, borderRadius: 20, textAlign: "center", display: "flex", flexDirection: "column", gap: 12, background: "linear-gradient(150deg,rgba(180,140,255,.2),rgba(255,200,120,.14))", border: "1px solid rgba(255,200,120,.3)", boxShadow: "0 10px 22px rgba(40,20,80,.3), inset 0 1.5px 0 rgba(255,255,255,.25)" }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 16, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,201,138,.18)", border: "1px solid rgba(255,201,138,.3)", boxShadow: "0 0 24px rgba(255,201,138,.2)" }}>
              <Crown size={22} style={{ color: "#FFC98A" }} />
            </div>
            <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 16, color: "#F6EEFC" }}>Desbloqueie a Sessão Sonhos completa</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(220,206,240,.6)", lineHeight: 1.4 }}>
              Histórias bíblicas, mix de sons, playlists e modo soninho automático.
            </div>
            <button
              onClick={() => handleCheckout("premium")}
              style={{ width: "100%", padding: 13, borderRadius: 16, cursor: "pointer", border: "none", fontWeight: 900, fontSize: 14, color: "#fff", background: "linear-gradient(135deg,#8A5ED8,#C98A3A)", boxShadow: "0 10px 24px rgba(90,50,150,.4),inset 0 1px 0 rgba(255,255,255,.3)" }}
            >
              Ativar Premium
            </button>
          </motion.div>
        )}

        <div style={{ padding: "20px 20px 16px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "rgba(200,186,224,.55)" }}>
          Feito para pais e filhos viverem juntos
        </div>
      </div>

      {/* ====== Modal: Playlist Spotify ====== */}
      <AnimatePresence>
        {openPlaylist && (() => {
          const pl = SLEEP_PLAYLISTS.find(p => p.id === openPlaylist)!;
          return (
            <motion.div
              className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpenPlaylist(null)}
            >
              <motion.div
                className="w-full max-w-md rounded-t-[28px] sm:rounded-[28px] overflow-hidden"
                style={{ background: "linear-gradient(180deg, #2C1C4C 0%, #160C2A 100%)", border: "1px solid rgba(200,175,245,0.2)" }}
                initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
                transition={{ type: "spring", stiffness: 280, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ position: "relative", height: 120, overflow: "hidden" }}>
                  <img src={pl.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 20%, #2C1C4C 100%)" }} />
                  <button
                    onClick={() => setOpenPlaylist(null)}
                    className="p-2 rounded-full absolute top-3 right-3"
                    style={{ background: "rgba(0,0,0,0.4)", border: "0.5px solid rgba(255,255,255,.25)" }}
                  >
                    <X size={16} className="text-white" />
                  </button>
                  <div className="absolute left-4 bottom-3 right-12">
                    <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: ".4px", textTransform: "uppercase", color: pl.glow }}>{pl.ageRange}</p>
                    <h3 style={{ fontSize: 18, fontFamily: "'Lora',serif", fontWeight: 600, color: "#F6EEFC" }}>{pl.title}</h3>
                  </div>
                </div>
                <iframe
                  title={pl.title}
                  src={`https://open.spotify.com/embed/playlist/${pl.spotifyId}?utm_source=kidzz&theme=0`}
                  width="100%" height="380"
                  frameBorder={0}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{ display: "block", border: 0, height: "clamp(232px, 52vh, 380px)" }}
                />
                <a
                  href={`https://open.spotify.com/playlist/${pl.spotifyId}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3.5 text-[13px] font-bold"
                  style={{ color: "rgba(255,255,255,.85)", background: "rgba(255,255,255,0.05)" }}
                >
                  <ExternalLink size={14} /> Abrir no Spotify
                </a>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ====== Modal: Momento em família ====== */}
      <AnimatePresence>
        {openMoment && (() => {
          const m = FAMILY_MOMENTS.find(x => x.id === openMoment)!;
          return (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-6"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpenMoment(null)}
            >
              <motion.div
                className="rounded-3xl p-7 max-w-sm w-full text-center space-y-4"
                style={{ background: "linear-gradient(180deg, #2C1C4C, #160C2A)", border: "1px solid rgba(255,201,138,0.25)" }}
                initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
                onClick={(e) => e.stopPropagation()}
              >
                <img src={m.icon} alt="" className="w-16 h-16 rounded-2xl object-cover mx-auto block" />
                <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "1.2px", textTransform: "uppercase", color: "rgba(255,201,138,.7)" }}>{m.title}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#F6EEFC", lineHeight: 1.4 }}>{m.prompt}</p>
                <button
                  onClick={() => setOpenMoment(null)}
                  className="w-full py-3 rounded-2xl font-bold text-sm text-white"
                  style={{ background: "linear-gradient(135deg,#8A5ED8,#C98A3A)" }}
                >
                  Conversamos 💛
                </button>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ====== Modal: Premium block ====== */}
      <AnimatePresence>
        {showPremiumBlock && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPremiumBlock(false)}
          >
            <motion.div
              className="rounded-3xl p-7 max-w-sm w-full text-center space-y-3"
              style={{ background: "linear-gradient(180deg, #2C1C4C, #160C2A)", border: "1px solid rgba(255,201,138,0.3)" }}
              initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.span className="text-5xl block"
                animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                🌙
              </motion.span>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#F6EEFC" }}>{lockedReason}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(220,206,240,.6)", lineHeight: 1.4 }}>
                Sessão Sonhos Premium para {childName}{interests?.[0] ? ` que ama ${interests[0].toLowerCase()}` : ""}.
              </p>
              <button
                onClick={() => { setShowPremiumBlock(false); handleCheckout("premium"); }}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white"
                style={{ background: "linear-gradient(135deg,#8A5ED8,#C98A3A)", boxShadow: "0 10px 30px rgba(90,50,150,0.45)" }}
              >
                ✨ Ativar Premium
              </button>
              <button
                onClick={() => setShowPremiumBlock(false)}
                className="w-full py-2 text-xs font-semibold"
                style={{ color: "rgba(220,206,240,.55)" }}
              >
                Agora não
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DreamWorld;

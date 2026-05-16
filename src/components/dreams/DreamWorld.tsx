/* ── KIDZZ — Sessão Sonhos v6.0 (Premium)
   Hero cinematográfico, fundo adaptativo por horário, Bíblia infantil,
   playlists Spotify, mixagem de sons, timer com lua, respiração com camaleão,
   modo soninho automático, momentos em família.
*/
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon, Play, Lock, Crown, Timer, BookOpen, Music, ChevronRight,
  Volume2, Headphones, Wind, Heart, Disc3, Sun, MoonStar,
  X, ExternalLink, Sparkles,
} from "lucide-react";

/* Spring premium reusável para microinterações */
const tapSpring = { type: "spring" as const, stiffness: 420, damping: 28, mass: 0.6 };
const cardTap = { scale: 0.975 };
import { useAuth } from "@/contexts/AuthContext";
import { Slider } from "@/components/ui/slider";
import { AmbientSoundEngine } from "./AmbientSoundEngine";
import { DreamNarrator } from "./DreamNarrator";
import {
  SLEEP_STORIES, SOUND_PRESETS, TIMER_OPTIONS, SLEEP_PLAYLISTS,
  FAMILY_MOMENTS, STORY_CATEGORIES, type SleepCategory,
} from "./sleepStories";
import PreSleep from "./PreSleep";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";
import { haptic } from "@/lib/haptics";

/* ────────── Background adaptativo por horário ────────── */
type TimePhase = "morning" | "afternoon" | "night";
const getTimePhase = (): TimePhase => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "afternoon";
  return "night";
};

const PHASE_BG: Record<TimePhase, string> = {
  morning: "linear-gradient(180deg, #2a2147 0%, #4a3a78 45%, #6a4a8a 100%)",
  afternoon: "linear-gradient(180deg, #2d1f4a 0%, #5a2f5a 50%, #8a4a3a 100%)",
  night: "linear-gradient(180deg, #07091e 0%, #100a30 45%, #0a0820 100%)",
};

const CinematicBackdrop = ({ phase, sleepy }: { phase: TimePhase; sleepy: boolean }) => {
  // estrelas estáticas memoizadas — sem cintilar
  const stars = useMemo(
    () =>
      Array.from({ length: phase === "night" ? 32 : 12 }).map(() => ({
        size: Math.random() * 2 + 1,
        left: Math.random() * 100,
        top: Math.random() * 75,
        opacity: 0.35 + Math.random() * 0.45,
      })),
    [phase],
  );

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none transition-all duration-[2000ms] overflow-hidden"
      style={{
        background: PHASE_BG[phase],
        filter: sleepy ? "brightness(0.5) saturate(0.75)" : "brightness(1) saturate(1)",
      }}
    >
      {/* Aurora cinematográfica estática */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 45% at 22% 22%, rgba(165,140,255,0.28), transparent 70%), radial-gradient(55% 38% at 82% 68%, rgba(255,200,120,0.20), transparent 72%), radial-gradient(50% 34% at 48% 98%, rgba(120,140,255,0.22), transparent 72%)",
          opacity: 0.75,
        }}
      />

      {/* Faixa de luz volumétrica diagonal — estática */}
      <div
        className="absolute -top-1/4 -left-1/4 w-[150%] h-[60%] pointer-events-none"
        style={{
          background:
            "linear-gradient(110deg, transparent 35%, rgba(180,140,255,0.10) 48%, rgba(255,210,140,0.06) 55%, transparent 70%)",
          filter: "blur(40px)",
          transform: "rotate(-8deg)",
        }}
      />

      {/* Lua à direita (modo noite) — sem pulsar */}
      {phase === "night" && (
        <>
          <div
            className="absolute top-[6%] right-[8%] w-40 h-40 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,220,140,0.26) 0%, rgba(255,210,120,0.12) 45%, transparent 75%)",
              filter: "blur(6px)",
            }}
          />
          <div
            className="absolute top-[8%] right-[10%] w-24 h-24 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #fff8e0, #f5d97a 60%, #b88a3a 100%)",
              boxShadow:
                "0 0 60px 20px rgba(255,220,140,0.32), inset -8px -8px 18px rgba(120,80,30,0.4)",
            }}
          />
        </>
      )}

      {/* Sol/halo manhã/tarde — sem pulsar */}
      {phase !== "night" && (
        <div
          className="absolute top-[6%] right-[12%] w-28 h-28 rounded-full"
          style={{
            background:
              phase === "morning"
                ? "radial-gradient(circle, #ffe8c4, #ffc77a 55%, transparent 75%)"
                : "radial-gradient(circle, #ffd58a, #ff8a4a 60%, transparent 80%)",
            filter: "blur(2px)",
          }}
        />
      )}

      {/* Estrelas estáticas (brilho fixo) */}
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: s.size,
            height: s.size,
            left: `${s.left}%`,
            top: `${s.top}%`,
            opacity: s.opacity,
            boxShadow: `0 0 ${s.size * 2.5}px rgba(255,255,255,0.55)`,
          }}
        />
      ))}

      {/* Névoa volumétrica suave (parte inferior) — estática */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2/5 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(20,15,40,0.45) 55%, rgba(8,6,20,0.75))",
        }}
      />

      {/* Vinheta cinematográfica nas bordas */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </div>
  );
};

/* ────────── Premium glass card ────────── */
const glassCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: "26px",
  boxShadow: "0 8px 40px rgba(0,0,0,0.28)",
};

const SectionTitle = ({
  icon, eyebrow, title, subtitle,
}: { icon?: React.ReactNode; eyebrow?: string; title: string; subtitle?: string }) => (
  <div className="px-1 mb-3">
    {eyebrow && (
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/70 mb-1 flex items-center gap-1.5">
        {icon}
        {eyebrow}
      </p>
    )}
    <h2 className="text-[19px] font-bold text-white leading-tight" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
      {title}
    </h2>
    {subtitle && <p className="text-[13px] text-white/55 mt-0.5">{subtitle}</p>}
  </div>
);

/* ────────── Main ────────── */
interface Props { onBack: () => void; }
type DreamView = "main" | "story" | "playing" | "presleep";

const DreamWorld = ({ onBack }: Props) => {
  const { profile, handleCheckout } = useAuth();
  const isPremium = profile?.is_premium === true;
  const childName = profile?.child_name || "amigo";
  const ageRange = profile?.age_range || "3-7";
  const interests = (profile as any)?.child_interests as string[] | undefined;

  const engineRef = useRef<AmbientSoundEngine | null>(null);
  const narratorRef = useRef<DreamNarrator | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [view, setView] = useState<DreamView>("main");
  const [phase, setPhase] = useState<TimePhase>(getTimePhase());
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
    const phaseTick = setInterval(() => setPhase(getTimePhase()), 60_000);
    return () => {
      clearInterval(phaseTick);
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
        className="fixed inset-0 z-50 overflow-y-auto"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <CinematicBackdrop phase="night" sleepy={sleepyMode} />
        <div className="relative z-10 px-5 pt-6 pb-10 max-w-lg mx-auto">
          <button onClick={() => setView("main")} className="text-white/55 text-sm mb-4 flex items-center gap-1">
            ← Voltar
          </button>
          <div className="text-center mb-6 space-y-2">
            <span className="text-5xl">{story.emoji}</span>
            <h1 className="text-2xl font-bold text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
              {story.title}
            </h1>
            <p className="text-amber-200/60 text-xs font-medium tracking-wide uppercase">
              {story.duration} · {story.ageRange ?? "Família"}
            </p>
            {story.verse && (
              <p className="text-amber-100/75 italic text-sm mt-2">{story.verse}</p>
            )}
          </div>

          <motion.button
            onClick={handleNarrate}
            className="w-full py-3.5 rounded-2xl font-bold text-sm mb-6 flex items-center justify-center gap-2 border"
            style={{
              background: isNarrating
                ? "linear-gradient(135deg, rgba(255,210,120,0.22), rgba(180,140,255,0.22))"
                : "rgba(255,255,255,0.08)",
              borderColor: isNarrating ? "rgba(255,210,120,0.4)" : "rgba(255,255,255,0.12)",
              color: "#F5F5F5",
            }}
            whileTap={{ scale: 0.97 }}
          >
            <Headphones size={16} />
            {isNarrating ? "Parar narração" : "Ouvir história"}
            {isNarrating && (
              <motion.span
                className="w-2 h-2 rounded-full bg-amber-300 ml-1"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
          </motion.button>

          <div
            className="rounded-3xl p-6 space-y-4"
            style={{
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.08)",
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

          <p className="text-center mt-6 text-xs italic text-amber-100/55">
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
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <CinematicBackdrop phase="night" sleepy />
        <div className="relative z-10 text-center space-y-8 px-6">
          <motion.div
            className="mx-auto rounded-full"
            style={{
              width: 140, height: 140,
              background: "radial-gradient(circle at 35% 35%, #fff8e0, #f5d97a 60%, #b88a3a 100%)",
              boxShadow: `0 0 ${60 * moonScale}px ${20 * moonScale}px rgba(255,220,140,${0.4 * moonScale})`,
            }}
            animate={{ scale: [moonScale, moonScale * 1.04, moonScale], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <p className="text-amber-200/60 text-xs font-bold tracking-[0.25em] uppercase">
            Noite tranquila
          </p>
          <div className="text-5xl font-bold tabular-nums text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            {timerMinutes === 0 ? "∞" : formatTime(timeLeft)}
          </div>
          {isNarrating && (
            <motion.p
              className="text-amber-100/65 text-xs flex items-center justify-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Headphones size={12} /> Narrando história…
            </motion.p>
          )}
          {Object.keys(activeSounds).length > 0 && (
            <div className="flex gap-2 justify-center flex-wrap">
              {Object.keys(activeSounds).map((id) => {
                const s = SOUND_PRESETS.find((p) => p.id === id);
                return s ? (
                  <span
                    key={id}
                    className="text-xs px-3 py-1.5 rounded-full text-white/70"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {s.emoji} {s.label}
                  </span>
                ) : null;
              })}
            </div>
          )}
          <motion.button
            onClick={handleStop}
            className="mt-6 px-10 py-3.5 rounded-full text-sm font-semibold backdrop-blur-md text-white/85"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
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
      className="fixed inset-0 z-40 overflow-y-auto pb-24"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <CinematicBackdrop phase={phase} sleepy={sleepyMode} />

      <div className="relative z-10 px-4 pt-8 space-y-8 max-w-lg mx-auto">
        {/* Top utilities */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase text-amber-200"
            style={{ background: "rgba(255,210,120,0.12)", border: "1px solid rgba(255,210,120,0.25)" }}>
            <MoonStar size={12} /> Sessão Sonhos
          </span>
          <button
            onClick={() => { setSleepyMode(s => !s); haptic("light"); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-white/75"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            aria-pressed={sleepyMode}
          >
            {sleepyMode ? <Moon size={12} /> : <Sun size={12} />}
            {sleepyMode ? "Soninho ativo" : "Modo soninho"}
          </button>
        </div>

        {/* HERO */}
        <div className="relative text-center pt-2 pb-2">
          <div className="relative mx-auto" style={{ width: 220, height: 220 }}>
            {/* lanterna ao fundo */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle at 50% 55%, rgba(255,220,140,0.35), transparent 65%)",
                filter: "blur(8px)",
              }}
            />
            <KidzzChameleon state="moon" mood="calm" size="xl" interactive showParticles />
          </div>
          <h1 className="mt-3 text-[26px] font-bold text-white leading-tight px-4"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.55)" }}>
            Uma nova forma de terminar o dia.
          </h1>
          <p className="mt-2 text-[14px] text-white/65 px-4 leading-snug">
            Histórias, sons e momentos para acalmar e conectar a família antes de dormir.
          </p>
        </div>

        {/* CTA principal */}
        <motion.button
          onClick={handleStart}
          disabled={Object.keys(activeSounds).length === 0 && !selectedStory}
          className="w-full py-4 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-2 text-white"
          style={{
            background:
              Object.keys(activeSounds).length === 0 && !selectedStory
                ? "rgba(108,60,224,0.22)"
                : "linear-gradient(135deg, #6c3ce0 0%, #3b82f6 100%)",
            opacity: Object.keys(activeSounds).length === 0 && !selectedStory ? 0.55 : 1,
            textShadow: "0 1px 4px rgba(0,0,0,0.3)",
            boxShadow: "0 12px 40px rgba(108,60,224,0.35)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          <Moon size={18} />
          Iniciar noite tranquila
        </motion.button>

        {/* Atalhos: respiração + presleep */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={() => { setView("presleep"); haptic("light"); }}
            className="p-4 text-left flex flex-col gap-2"
            style={glassCardStyle}
            whileTap={{ scale: 0.98 }}
          >
            <Wind size={18} className="text-amber-200" />
            <p className="text-[14px] font-bold text-white">Respira com o Camaleão</p>
            <p className="text-[11px] text-white/55 leading-snug">Inspira… segura… solta.</p>
          </motion.button>
          <motion.button
            onClick={() => {
              const moment = FAMILY_MOMENTS[Math.floor(Math.random() * FAMILY_MOMENTS.length)];
              setOpenMoment(moment.id);
              haptic("light");
            }}
            className="p-4 text-left flex flex-col gap-2"
            style={glassCardStyle}
            whileTap={{ scale: 0.98 }}
          >
            <Heart size={18} className="text-pink-300" />
            <p className="text-[14px] font-bold text-white">Momento em família</p>
            <p className="text-[11px] text-white/55 leading-snug">Uma pergunta para a noite.</p>
          </motion.button>
        </div>

        {/* HOJE PARA SUA FAMÍLIA — curadoria automática */}
        {(() => {
          const dayIndex = Math.floor(Date.now() / 86_400_000);
          const story = SLEEP_STORIES[dayIndex % SLEEP_STORIES.length];
          const playableSounds = SOUND_PRESETS.filter((s) => !!s.url);
          const sound = playableSounds[dayIndex % playableSounds.length];
          const playlist = SLEEP_PLAYLISTS[dayIndex % SLEEP_PLAYLISTS.length];
          const moment = FAMILY_MOMENTS[dayIndex % FAMILY_MOMENTS.length];
          return (
            <section>
              <SectionTitle
                icon={<MoonStar size={11} />}
                eyebrow="Hoje para sua família"
                title="A noite já está preparada"
                subtitle="Curadoria automática para esse fim de dia."
              />
              <div className="grid grid-cols-2 gap-2.5">
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
                  className="p-4 text-left flex flex-col gap-1.5 col-span-2 relative overflow-hidden"
                  style={{
                    ...glassCardStyle,
                    background:
                      "linear-gradient(135deg, rgba(180,140,255,0.18) 0%, rgba(255,210,120,0.10) 100%)",
                    border: "1px solid rgba(255,210,120,0.22)",
                  }}
                  whileTap={{ scale: 0.985 }}
                >
                  <motion.div
                    className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                    style={{
                      background: "radial-gradient(circle, rgba(255,220,140,0.35), transparent 70%)",
                      filter: "blur(8px)",
                    }}
                    animate={{ opacity: [0.55, 0.95, 0.55] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/75">
                    História da noite
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{story.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-white truncate">{story.title}</p>
                      <p className="text-[11px] text-white/55">
                        {story.duration} · {story.ageRange ?? "Família"}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-white/35" />
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => toggleSound(sound.id, sound.free)}
                  className="p-4 text-left flex flex-col gap-1.5"
                  style={glassCardStyle}
                  whileTap={{ scale: 0.97 }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/70">
                    Som ideal
                  </p>
                  <span className="text-2xl">{sound.emoji}</span>
                  <p className="text-[13px] font-bold text-white leading-tight">{sound.label}</p>
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
                  className="p-4 text-left flex flex-col gap-1.5 relative overflow-hidden"
                  style={glassCardStyle}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 80% 20%, ${playlist.glow}33, transparent 65%)`,
                    }}
                    animate={{ opacity: [0.4, 0.85, 0.4] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: playlist.glow }}>
                    Playlist da noite
                  </p>
                  <span className="text-2xl">{playlist.emoji}</span>
                  <p className="text-[13px] font-bold text-white leading-tight">{playlist.title}</p>
                </motion.button>

                <motion.button
                  onClick={() => { setOpenMoment(moment.id); haptic("light"); }}
                  className="p-4 text-left flex flex-col gap-1.5 col-span-2"
                  style={{
                    ...glassCardStyle,
                    background: "rgba(255,255,255,0.04)",
                  }}
                  whileTap={{ scale: 0.985 }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-pink-200/70">
                    Pergunta da noite
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{moment.emoji}</span>
                    <p className="text-[13px] text-white/85 leading-snug flex-1">"{moment.prompt}"</p>
                  </div>
                </motion.button>
              </div>
            </section>
          );
        })()}

        {/* TIMER DO SONINHO */}
        <section>
          <SectionTitle
            icon={<Timer size={11} />}
            eyebrow="Timer do soninho"
            title="A lua diminui devagar"
            subtitle="Escolha quanto dura sua noite."
          />
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 scrollbar-none">
            {TIMER_OPTIONS.map((opt) => {
              const active = timerMinutes === opt.minutes;
              return (
                <button
                  key={opt.minutes}
                  onClick={() => { setTimerMinutes(opt.minutes); haptic("light"); }}
                  className="shrink-0 px-4 py-2.5 rounded-2xl text-[13px] font-bold transition-all"
                  style={{
                    background: active ? "rgba(255,210,120,0.18)" : "rgba(255,255,255,0.05)",
                    color: active ? "#FFE4B0" : "rgba(255,255,255,0.55)",
                    border: `1px solid ${active ? "rgba(255,210,120,0.4)" : "rgba(255,255,255,0.08)"}`,
                    boxShadow: active ? "0 0 18px rgba(255,210,120,0.2)" : "none",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* HISTÓRIAS QUE ABRAÇAM */}
        <section>
          <SectionTitle
            icon={<BookOpen size={11} />}
            eyebrow="Histórias que abraçam"
            title="Calma para dormir. Memórias para a vida."
          />
          {/* Categorias */}
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 mb-3 pb-1 scrollbar-none">
            {[{ id: "all", label: "Todas", emoji: "✨" }, ...STORY_CATEGORIES].map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all"
                  style={{
                    background: active ? "rgba(180,140,255,0.22)" : "rgba(255,255,255,0.05)",
                    color: active ? "#E8DCFF" : "rgba(255,255,255,0.55)",
                    border: `1px solid ${active ? "rgba(180,140,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {cat.emoji} {cat.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-2.5">
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
                  className="w-full flex items-center gap-3 p-4 text-left transition-all"
                  style={{
                    ...glassCardStyle,
                    background: isSelected ? "rgba(180,140,255,0.18)" : glassCardStyle.background,
                    borderColor: isSelected ? "rgba(180,140,255,0.35)" : "rgba(255,255,255,0.09)",
                    opacity: locked ? 0.55 : 1,
                  }}
                  whileTap={locked ? {} : { scale: 0.98 }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: isSelected ? "0 0 14px rgba(180,140,255,0.3)" : "0 0 12px rgba(255,210,120,0.1)",
                    }}
                  >
                    {story.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[15px] text-white truncate">{story.title}</p>
                    <p className="text-[11px] text-white/45 mt-0.5">
                      {story.duration} · {story.ageRange ?? "Família"}
                      {story.category === "biblia" && " · Bíblia infantil"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && !locked && (
                      <span
                        onClick={(e) => { e.stopPropagation(); setView("story"); }}
                        className="p-2 rounded-xl cursor-pointer"
                        style={{ background: "rgba(180,140,255,0.22)", border: "1px solid rgba(180,140,255,0.3)" }}
                      >
                        <BookOpen size={13} className="text-purple-200" />
                      </span>
                    )}
                    {locked
                      ? <Lock size={16} className="text-white/30" />
                      : isSelected
                        ? <div className="w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center"><Play size={11} className="text-white ml-0.5" /></div>
                        : <ChevronRight size={16} className="text-white/25" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
          <p className="text-center text-[11px] italic text-amber-100/45 mt-3">
            Valores que ficam para a vida.
          </p>
        </section>

        {/* SONS QUE ACALMAM */}
        <section>
          <SectionTitle
            icon={<Music size={11} />}
            eyebrow="Sons que acalmam"
            title="Soundscape para o seu ritual"
            subtitle="Combine sons. Ajuste o volume. Encontre seu silêncio."
          />
          {audioError && (
            <div className="mb-3 rounded-xl px-3 py-2 text-center"
              style={{ background: "rgba(127,29,29,0.25)", border: "1px solid rgba(248,113,113,0.28)" }}>
              <p className="text-xs font-medium text-white">{audioError}</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            {SOUND_PRESETS.map((sound) => {
              const locked = !canAccess(sound.free);
              const isActive = activeSounds[sound.id] !== undefined;
              const noUrl = !sound.url;
              return (
                <motion.button
                  key={sound.id}
                  onClick={() => toggleSound(sound.id, sound.free)}
                  className="relative flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl transition-all"
                  style={{
                    background: isActive ? "rgba(180,140,255,0.22)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isActive ? "rgba(180,140,255,0.35)" : "rgba(255,255,255,0.07)"}`,
                    opacity: noUrl ? 0.55 : (locked ? 0.4 : 1),
                    boxShadow: isActive ? "0 0 18px rgba(180,140,255,0.18)" : "none",
                  }}
                  whileTap={(locked || noUrl) ? {} : { scale: 0.93 }}
                >
                  {locked && !noUrl && <Lock size={9} className="absolute top-1.5 right-1.5 text-white/30" />}
                  {noUrl && (
                    <span className="absolute top-1 right-1 text-[8px] font-bold text-white/40 px-1 rounded bg-white/5">
                      em breve
                    </span>
                  )}
                  <span className="text-2xl">{sound.emoji}</span>
                  <span className="text-[10px] font-bold text-white/65 leading-tight text-center">
                    {sound.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-300"
                      style={{ boxShadow: "0 0 10px rgba(255,220,140,0.7)" }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* MIXAGEM */}
          <AnimatePresence>
            {Object.keys(activeSounds).length > 0 && (
              <motion.div
                className="mt-3 space-y-3 p-4"
                style={glassCardStyle}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-200/70">
                  <Volume2 size={12} /> Mix de sons
                </p>
                {Object.entries(activeSounds).map(([id, vol]) => {
                  const s = SOUND_PRESETS.find((p) => p.id === id);
                  return s ? (
                    <div key={id} className="flex items-center gap-3">
                      <span className="text-xl w-7 text-center">{s.emoji}</span>
                      <Slider
                        value={[vol * 100]}
                        onValueChange={([v]) => setVolume(id, v / 100)}
                        max={100} step={1}
                        className="flex-1 [&_[data-radix-slider-track]]:bg-white/10 [&_[data-radix-slider-range]]:bg-amber-300/70 [&_[data-radix-slider-thumb]]:bg-white [&_[data-radix-slider-thumb]]:border-amber-300 [&_[data-radix-slider-thumb]]:w-4 [&_[data-radix-slider-thumb]]:h-4"
                      />
                      <span className="text-xs w-9 text-right text-white/45">{Math.round(vol * 100)}%</span>
                    </div>
                  ) : null;
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* PLAYLISTS CALMARIA */}
        <section>
          <SectionTitle
            icon={<Disc3 size={11} />}
            eyebrow="Playlists Calmaria"
            title="Trilhas para cada idade"
            subtitle="Atualizadas automaticamente pelo Spotify."
          />
          <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 scrollbar-none snap-x snap-mandatory">
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
                  className="shrink-0 w-[180px] snap-start text-left overflow-hidden relative"
                  style={glassCardStyle}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className={`relative h-32 bg-gradient-to-br ${pl.gradient}`}>
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: `radial-gradient(circle at 50% 50%, ${pl.glow}55, transparent 70%)` }}
                      animate={{ opacity: [0.5, 0.85, 0.5] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <span className="absolute top-3 left-3 text-3xl drop-shadow-lg">{pl.emoji}</span>
                    {locked && (
                      <span className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40">
                        <Lock size={12} className="text-white/80" />
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: pl.glow }}>
                      {pl.ageRange}
                    </p>
                    <p className="text-[14px] font-bold text-white leading-tight mt-0.5">{pl.title}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* MOMENTOS EM FAMÍLIA */}
        <section>
          <SectionTitle
            icon={<Heart size={11} />}
            eyebrow="Momentos em família"
            title="Menos correria. Mais presença."
          />
          <div className="grid grid-cols-2 gap-2.5">
            {FAMILY_MOMENTS.map((m) => (
              <motion.button
                key={m.id}
                onClick={() => { setOpenMoment(m.id); haptic("light"); }}
                className="p-4 text-left flex flex-col gap-1.5"
                style={glassCardStyle}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-2xl">{m.emoji}</span>
                <p className="text-[13px] font-bold text-white leading-tight">{m.title}</p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Premium upsell */}
        {!isPremium && (
          <motion.div
            className="p-5 text-center space-y-3"
            style={{
              ...glassCardStyle,
              background: "linear-gradient(135deg, rgba(180,140,255,0.18) 0%, rgba(255,210,120,0.14) 100%)",
              border: "1px solid rgba(255,210,120,0.25)",
            }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center"
              style={{ background: "rgba(255,210,120,0.18)", border: "1px solid rgba(255,210,120,0.3)", boxShadow: "0 0 24px rgba(255,210,120,0.2)" }}>
              <Crown size={22} className="text-amber-300" />
            </div>
            <p className="text-[15px] font-bold text-white">Desbloqueie a Sessão Sonhos completa</p>
            <p className="text-[12px] text-white/55 leading-snug">
              Histórias bíblicas, mix de sons, playlists e modo soninho automático.
            </p>
            <button
              onClick={() => handleCheckout("premium")}
              className="w-full py-3 rounded-2xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #6c3ce0, #c98a3a)", boxShadow: "0 10px 30px rgba(108,60,224,0.4)" }}
            >
              ✨ Ativar Premium
            </button>
          </motion.div>
        )}

        <p className="text-center text-[11px] italic text-amber-100/45 pt-2">
          "Feito para pais e filhos viverem juntos."
        </p>
      </div>

      {/* ====== Modal: Playlist Spotify ====== */}
      <AnimatePresence>
        {openPlaylist && (() => {
          const pl = SLEEP_PLAYLISTS.find(p => p.id === openPlaylist)!;
          return (
            <motion.div
              className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpenPlaylist(null)}
            >
              <motion.div
                className="w-full max-w-md rounded-t-[28px] sm:rounded-[28px] overflow-hidden"
                style={{ background: "linear-gradient(180deg, #1a1040 0%, #0a0820 100%)", border: "1px solid rgba(255,255,255,0.1)" }}
                initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
                transition={{ type: "spring", stiffness: 280, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: pl.glow }}>{pl.ageRange}</p>
                    <h3 className="text-[18px] font-bold text-white">{pl.emoji} {pl.title}</h3>
                  </div>
                  <button onClick={() => setOpenPlaylist(null)} className="p-2 rounded-full bg-white/10">
                    <X size={16} className="text-white" />
                  </button>
                </div>
                <iframe
                  title={pl.title}
                  src={`https://open.spotify.com/embed/playlist/${pl.spotifyId}?utm_source=kidzz&theme=0`}
                  width="100%" height="380"
                  frameBorder={0}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{ display: "block", border: 0 }}
                />
                <a
                  href={`https://open.spotify.com/playlist/${pl.spotifyId}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3.5 text-[13px] font-bold text-white/85"
                  style={{ background: "rgba(255,255,255,0.05)" }}
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
              className="fixed inset-0 z-[60] flex items-center justify-center p-6"
              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpenMoment(null)}
            >
              <motion.div
                className="rounded-3xl p-7 max-w-sm w-full text-center space-y-4"
                style={{ background: "linear-gradient(180deg, #1a1040, #0a0820)", border: "1px solid rgba(255,210,120,0.25)" }}
                initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-5xl block">{m.emoji}</span>
                <p className="text-[11px] font-bold tracking-widest uppercase text-amber-200/70">{m.title}</p>
                <p className="text-[18px] font-bold text-white leading-snug">{m.prompt}</p>
                <button
                  onClick={() => setOpenMoment(null)}
                  className="w-full py-3 rounded-2xl font-bold text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #6c3ce0, #c98a3a)" }}
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
            className="fixed inset-0 z-[60] flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPremiumBlock(false)}
          >
            <motion.div
              className="rounded-3xl p-7 max-w-sm w-full text-center space-y-3"
              style={{ background: "linear-gradient(180deg, #1a1040, #0a0820)", border: "1px solid rgba(255,210,120,0.3)" }}
              initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.span className="text-5xl block"
                animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                🌙
              </motion.span>
              <p className="text-[16px] font-bold text-white">{lockedReason}</p>
              <p className="text-[13px] text-white/55 leading-snug">
                Sessão Sonhos Premium para {childName}{interests?.[0] ? ` que ama ${interests[0].toLowerCase()}` : ""}.
              </p>
              <button
                onClick={() => { setShowPremiumBlock(false); handleCheckout("premium"); }}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white"
                style={{ background: "linear-gradient(135deg, #6c3ce0, #c98a3a)", boxShadow: "0 10px 30px rgba(108,60,224,0.45)" }}
              >
                ✨ Ativar Premium
              </button>
              <button
                onClick={() => setShowPremiumBlock(false)}
                className="w-full py-2 text-xs font-semibold text-white/55"
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

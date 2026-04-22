import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Play, Pause, Lock, Crown, Timer, BookOpen, Music, ChevronRight, Volume2, Headphones, Wind } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Slider } from "@/components/ui/slider";
import { AmbientSoundEngine } from "./AmbientSoundEngine";
import { DreamNarrator } from "./DreamNarrator";
import { SLEEP_STORIES, SOUND_PRESETS, TIMER_OPTIONS } from "./sleepStories";
import PreSleep from "./PreSleep";

/* ── Floating particles ── */
const DreamParticles = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {Array.from({ length: 25 }).map((_, i) => {
      const size = Math.random() * 3 + 1;
      const isGlow = i < 6;
      return (
        <motion.div
          key={i}
          className={`absolute rounded-full ${isGlow ? "bg-indigo-300/40" : "bg-white/50"}`}
          style={{
            width: isGlow ? size + 2 : size,
            height: isGlow ? size + 2 : size,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: isGlow ? `0 0 ${size * 4}px ${size}px rgba(165,180,252,0.3)` : undefined,
          }}
          animate={{
            opacity: [0.15, 0.7, 0.15],
            scale: [0.8, 1.2, 0.8],
            y: [0, -8, 0],
          }}
          transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
        />
      );
    })}
  </div>
);

/* ── Glassmorphism icon wrapper ── */
const GlassIcon = ({ children, active = false }: { children: React.ReactNode; active?: boolean }) => (
  <div
    className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border transition-all ${
      active
        ? "bg-indigo-500/30 border-indigo-400/40 shadow-[0_0_12px_rgba(129,140,248,0.3)]"
        : "bg-white/[0.07] border-white/10"
    }`}
  >
    {children}
  </div>
);

/* ── Section header ── */
const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <GlassIcon>{icon}</GlassIcon>
    <h2 className="text-[#e2e0f0] text-xs font-bold uppercase tracking-wider">{title}</h2>
  </div>
);

/* ── Main component ── */
interface Props {
  onBack: () => void;
}

type DreamView = "main" | "story" | "playing";

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
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [activeSounds, setActiveSounds] = useState<Record<string, number>>({});
  const [timerMinutes, setTimerMinutes] = useState(20);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [showPremiumBlock, setShowPremiumBlock] = useState(false);
  const [lockedStoryId, setLockedStoryId] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

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

  const toggleSound = useCallback(async (id: string, free: boolean) => {
    if (!canAccess(free)) { setShowPremiumBlock(true); return; }
    const engine = engineRef.current!;
    setAudioError(null);

    if (activeSounds[id] !== undefined) {
      engine.stop(id);
      setActiveSounds((prev) => { const n = { ...prev }; delete n[id]; return n; });
    } else {
      if (!isPremium && Object.keys(activeSounds).length >= 1) {
        setShowPremiumBlock(true);
        return;
      }
      const sound = SOUND_PRESETS.find((s) => s.id === id);
      if (!sound) return;
      setAudioLoading(true);
      const ok = await engine.start(id, sound.url, 0.5);
      setAudioLoading(false);
      if (ok) {
        setActiveSounds((prev) => ({ ...prev, [id]: 0.5 }));
      } else {
        setAudioError(`Não foi possível tocar ${sound.label.toLowerCase()}. Toque para tentar novamente.`);
      }
    }
  }, [canAccess, isPremium, activeSounds]);

  const setVolume = useCallback((id: string, vol: number) => {
    engineRef.current?.setVolume(id, vol);
    setActiveSounds((prev) => ({ ...prev, [id]: vol }));
  }, []);

  const handleNarrateStory = useCallback((storyId: string) => {
    const story = SLEEP_STORIES.find((s) => s.id === storyId);
    if (!story) return;
    if (isNarrating) {
      narratorRef.current?.stop();
      setIsNarrating(false);
      return;
    }
    setIsNarrating(true);
    narratorRef.current?.speak(story.text, () => setIsNarrating(false));
  }, [isNarrating]);

  const handleStart = useCallback(async () => {
    // Ensure audio context is resumed via user interaction
    if (Object.keys(activeSounds).length === 0 && !selectedStory) return;

    setView("playing");
    setIsPlaying(true);
    setTimeLeft(timerMinutes * 60);

    // Narrate story if selected
    if (selectedStory) {
      const story = SLEEP_STORIES.find((s) => s.id === selectedStory);
      if (story) {
        setIsNarrating(true);
        narratorRef.current?.speak(story.text, () => setIsNarrating(false));
      }
    }

    // Timer countdown
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

  /* ── Story detail view ── */
  if (view === "story" && selectedStory) {
    const story = SLEEP_STORIES.find((s) => s.id === selectedStory)!;
    return (
      <motion.div
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{ background: "linear-gradient(180deg, #0a0e27 0%, #1a1040 50%, #0d1b2a 100%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <DreamParticles />
        <div className="relative z-10 px-5 pt-6 pb-10 max-w-lg mx-auto">
          {/* Back */}
          <button
            onClick={() => setView("main")}
            className="text-white/50 text-sm mb-4 flex items-center gap-1"
          >
            ← Voltar
          </button>

          {/* Title */}
          <div className="text-center mb-6 space-y-2">
            <span className="text-4xl">{story.emoji}</span>
            <h1
              className="text-2xl font-bold"
              style={{ color: "#F5F5F5", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
            >
              {story.title}
            </h1>
            <p className="text-indigo-300/60 text-xs">{story.duration} de leitura</p>
          </div>

          {/* Narrate button */}
          <motion.button
            onClick={() => handleNarrateStory(story.id)}
            className="w-full py-3 rounded-xl font-bold text-sm mb-6 flex items-center justify-center gap-2 border"
            style={{
              background: isNarrating
                ? "rgba(129,140,248,0.2)"
                : "rgba(255,255,255,0.07)",
              borderColor: isNarrating ? "rgba(129,140,248,0.4)" : "rgba(255,255,255,0.1)",
              color: "#F5F5F5",
            }}
            whileTap={{ scale: 0.97 }}
          >
            <Headphones size={16} />
            {isNarrating ? "Parar narração" : "Ouvir história"}
            {isNarrating && (
              <motion.span
                className="w-2 h-2 rounded-full bg-indigo-400 ml-1"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
          </motion.button>

          {/* Story text with proper contrast */}
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {story.text.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                className="leading-relaxed"
                style={{
                  color: "#F0EEF6",
                  fontSize: "17px",
                  lineHeight: "1.7",
                  textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                }}
              >
                {paragraph.split("\n").map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < paragraph.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </p>
            ))}
          </div>

          <p
            className="text-center mt-6 text-xs italic"
            style={{ color: "rgba(165,180,252,0.5)" }}
          >
            "Histórias criadas para acalmar e ajudar no sono"
          </p>
        </div>
      </motion.div>
    );
  }

  /* ── Playing view (immersive dark) ── */
  if (view === "playing") {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(180deg, #0a0e27 0%, #1a1040 50%, #0d1b2a 100%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <DreamParticles />
        <div className="relative z-10 text-center space-y-8 px-6">
          <motion.div
            className="text-6xl"
            animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🌙
          </motion.div>

          <p className="text-indigo-200/50 text-sm font-medium tracking-widest uppercase">
            Noite tranquila
          </p>

          <div
            className="text-4xl font-bold tabular-nums"
            style={{ color: "#F5F5F5", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
          >
            {formatTime(timeLeft)}
          </div>

          {isNarrating && (
            <motion.p
              className="text-indigo-300/60 text-xs flex items-center justify-center gap-2"
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
                    className="text-xs px-3 py-1.5 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(224,220,240,0.7)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {s.emoji} {s.label}
                  </span>
                ) : null;
              })}
            </div>
          )}

          <motion.button
            onClick={handleStop}
            className="mt-8 px-10 py-3.5 rounded-full text-sm font-semibold backdrop-blur-md"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "rgba(245,245,245,0.8)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Parar
          </motion.button>
        </div>
      </motion.div>
    );
  }

  /* ── Main dream screen ── */
  return (
    <motion.div
      className="fixed inset-0 z-40 overflow-y-auto pb-20"
      style={{ background: "linear-gradient(180deg, #0f1535 0%, #1e1145 50%, #0d1b2a 100%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <DreamParticles />

      <div className="relative z-10 px-4 pt-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            className="text-5xl"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🌙
          </motion.div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "#F5F5F5", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
          >
            Mundo dos Sonhos
          </h1>
          <p style={{ color: "rgba(200,195,225,0.55)", fontSize: "13px" }}>
            Momento de conexão antes de dormir
          </p>
        </div>

        {/* CTA */}
        <motion.button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl font-bold text-lg shadow-lg"
          style={{
            background:
              Object.keys(activeSounds).length === 0 && !selectedStory
                ? "rgba(108,60,224,0.25)"
                : "linear-gradient(135deg, #6c3ce0 0%, #3b82f6 100%)",
            color: "#F5F5F5",
            opacity: Object.keys(activeSounds).length === 0 && !selectedStory ? 0.5 : 1,
            textShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="flex items-center justify-center gap-2">
            <Moon size={20} />
            Iniciar noite tranquila
          </span>
        </motion.button>

        {/* Timer */}
        <div>
          <SectionHeader icon={<Timer size={14} className="text-indigo-300" />} title="Timer" />
          <div className="flex gap-2">
            {TIMER_OPTIONS.map((opt) => (
              <button
                key={opt.minutes}
                onClick={() => setTimerMinutes(opt.minutes)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: timerMinutes === opt.minutes ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.04)",
                  color: timerMinutes === opt.minutes ? "#e0e0f5" : "rgba(255,255,255,0.4)",
                  border: `1px solid ${timerMinutes === opt.minutes ? "rgba(129,140,248,0.35)" : "rgba(255,255,255,0.05)"}`,
                  boxShadow: timerMinutes === opt.minutes ? "0 0 10px rgba(129,140,248,0.15)" : "none",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stories */}
        <div>
          <SectionHeader icon={<BookOpen size={14} className="text-indigo-300" />} title="Histórias para dormir" />
          <div className="space-y-2">
            {SLEEP_STORIES.map((story) => {
              const locked = !canAccess(story.free);
              const isSelected = selectedStory === story.id;
              return (
                <motion.button
                  key={story.id}
                  onClick={() => {
                    if (locked) { setLockedStoryId(story.id); setShowPremiumBlock(true); return; }
                    setSelectedStory(isSelected ? null : story.id);
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all"
                  style={{
                    background: isSelected ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isSelected ? "rgba(129,140,248,0.3)" : "rgba(255,255,255,0.05)"}`,
                    opacity: locked ? 0.45 : 1,
                  }}
                  whileTap={locked ? {} : { scale: 0.98 }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: isSelected ? "0 0 10px rgba(129,140,248,0.2)" : "none",
                    }}
                  >
                    {story.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: "#F0EEF6", fontSize: "14px", fontWeight: 600 }} className="truncate">
                      {story.title}
                    </p>
                    <p style={{ color: "rgba(200,195,225,0.4)", fontSize: "11px" }}>
                      {story.duration} · Toque para ler
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setView("story"); }}
                        className="p-1.5 rounded-lg"
                        style={{ background: "rgba(129,140,248,0.2)", border: "1px solid rgba(129,140,248,0.3)" }}
                      >
                        <BookOpen size={12} className="text-indigo-300" />
                      </button>
                    )}
                    {locked ? (
                      <Lock size={16} style={{ color: "rgba(255,255,255,0.25)" }} />
                    ) : isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Play size={10} className="text-white ml-0.5" />
                      </div>
                    ) : (
                      <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.15)" }} />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Sounds */}
        <div>
          <SectionHeader icon={<Music size={14} className="text-indigo-300" />} title="Sons relaxantes" />

          {audioLoading && (
            <motion.p
              className="text-center text-xs mb-2"
              style={{ color: "rgba(165,180,252,0.6)" }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Carregando som…
            </motion.p>
          )}

          {audioError && !audioLoading && (
            <div
              className="mb-3 rounded-xl px-3 py-2 text-center"
              style={{
                background: "rgba(127,29,29,0.25)",
                border: "1px solid rgba(248,113,113,0.28)",
                color: "hsl(var(--foreground))",
              }}
            >
              <p className="text-xs font-medium">{audioError}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {SOUND_PRESETS.map((sound) => {
              const locked = !canAccess(sound.free);
              const isActive = activeSounds[sound.id] !== undefined;
              return (
                <motion.button
                  key={sound.id}
                  onClick={() => toggleSound(sound.id, sound.free)}
                  className="relative flex flex-col items-center gap-1.5 py-4 px-2 rounded-xl transition-all"
                  style={{
                    background: isActive ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isActive ? "rgba(129,140,248,0.35)" : "rgba(255,255,255,0.05)"}`,
                    opacity: locked ? 0.35 : 1,
                    boxShadow: isActive ? "0 0 15px rgba(129,140,248,0.15)" : "none",
                  }}
                  whileTap={locked ? {} : { scale: 0.93 }}
                >
                  {locked && <Lock size={10} className="absolute top-1.5 right-1.5" style={{ color: "rgba(255,255,255,0.3)" }} />}
                  <span className="text-2xl">{sound.emoji}</span>
                  <span style={{ color: "rgba(224,220,240,0.65)", fontSize: "10px", fontWeight: 700 }}>{sound.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-indigo-400"
                      style={{ boxShadow: "0 0 8px rgba(129,140,248,0.5)" }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Volume mixer */}
          <AnimatePresence>
            {Object.keys(activeSounds).length > 0 && (
              <motion.div
                className="mt-3 space-y-3 rounded-xl p-4"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(8px)",
                }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "rgba(200,195,225,0.5)" }}>
                  <Volume2 size={12} /> Mix de sons
                  {!isPremium && <Lock size={10} className="ml-1" style={{ color: "rgba(255,255,255,0.25)" }} />}
                </p>
                {Object.entries(activeSounds).map(([id, vol]) => {
                  const s = SOUND_PRESETS.find((p) => p.id === id);
                  return s ? (
                    <div key={id} className="flex items-center gap-3">
                      <span className="text-sm w-6 text-center">{s.emoji}</span>
                      <Slider
                        value={[vol * 100]}
                        onValueChange={([v]) => setVolume(id, v / 100)}
                        max={100}
                        step={1}
                        className="flex-1 [&_[data-radix-slider-track]]:bg-white/10 [&_[data-radix-slider-range]]:bg-indigo-400/60 [&_[data-radix-slider-thumb]]:bg-white [&_[data-radix-slider-thumb]]:border-indigo-400 [&_[data-radix-slider-thumb]]:w-4 [&_[data-radix-slider-thumb]]:h-4"
                      />
                      <span className="text-xs w-8 text-right" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {Math.round(vol * 100)}%
                      </span>
                    </div>
                  ) : null;
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Premium upsell */}
        {!isPremium && (
          <div
            className="rounded-2xl p-5 text-center space-y-3"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(147,51,234,0.1) 100%)",
              border: "1px solid rgba(129,140,248,0.1)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center"
              style={{
                background: "rgba(129,140,248,0.15)",
                border: "1px solid rgba(129,140,248,0.25)",
                boxShadow: "0 0 20px rgba(129,140,248,0.15)",
              }}
            >
              <Crown size={22} className="text-indigo-400" />
            </div>
            <p style={{ color: "#F0EEF6", fontSize: "14px", fontWeight: 700 }}>
              Desbloqueie o Mundo dos Sonhos completo
            </p>
            <p style={{ color: "rgba(200,195,225,0.45)", fontSize: "12px" }}>
              Seu filho dorme melhor. Você descansa melhor.
            </p>
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* Premium block modal */}
      <AnimatePresence>
      {showPremiumBlock && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowPremiumBlock(false); setLockedStoryId(null); }}
          >
            <motion.div
              className="rounded-2xl p-6 max-w-sm w-full text-center space-y-3"
              style={{
                background: "linear-gradient(180deg, #1a1040 0%, #0f1535 100%)",
                border: "1px solid rgba(129,140,248,0.2)",
              }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const lockedStory = lockedStoryId ? SLEEP_STORIES.find(s => s.id === lockedStoryId) : null;
                const freeStory = SLEEP_STORIES.find(s => s.free);
                const interestText = interests && interests.length > 0 ? interests[0].toLowerCase() : "aventuras";
                return (
                  <>
                    <motion.span
                      className="text-5xl block"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      🌙
                    </motion.span>
                    {lockedStory && (
                      <p style={{ color: "#F0EEF6", fontSize: "16px", fontWeight: 700 }}>
                        "{lockedStory.title}" está esperando por {childName}
                      </p>
                    )}
                    <p style={{ color: "rgba(200,195,225,0.55)", fontSize: "13px", lineHeight: "1.5" }}>
                      Esta história foi criada especialmente para crianças de {ageRange} anos que amam {interestText}.
                    </p>
                    <button
                      onClick={() => { setShowPremiumBlock(false); setLockedStoryId(null); handleCheckout("premium"); }}
                      className="w-full py-3 rounded-xl font-bold text-sm"
                      style={{
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        color: "#F5F5F5",
                      }}
                    >
                      ✨ Desbloquear Sonhos Completos
                    </button>
                    {freeStory && (
                      <button
                        onClick={() => {
                          setShowPremiumBlock(false);
                          setLockedStoryId(null);
                          setSelectedStory(freeStory.id);
                        }}
                        className="w-full py-2 text-xs font-semibold"
                        style={{ color: "rgba(200,195,225,0.45)" }}
                      >
                        Continuar com "{freeStory.title}" →
                      </button>
                    )}
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DreamWorld;

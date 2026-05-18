import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Moon, Wind, CloudRain, Heart, Sparkles, Cloud,
  Play, Pause, Heart as HeartIcon, Flame, Sun, Mountain, Waves,
  Leaf, Star, Bird, X, Timer,
} from "lucide-react";
import { haptic } from "@/lib/haptics";
import { AmbientSoundEngine } from "@/components/dreams/AmbientSoundEngine";

/* ── Wellness Hub — Apple-level emotional experience ──
   Calm + Headspace + Endel + Apple Health vibe.
   Self-contained, performance-optimized, semantic tokens only.
*/

interface Props { onBack: () => void; }

type Mood = "sleep" | "breathe" | "relax" | "connect" | "focus" | "calm";

const MOODS: { id: Mood; label: string; icon: typeof Moon; from: string; to: string; }[] = [
  { id: "sleep",    label: "Dormir",   icon: Moon,     from: "260 50% 35%", to: "240 60% 20%" },
  { id: "breathe",  label: "Respirar", icon: Wind,     from: "190 55% 55%", to: "210 60% 40%" },
  { id: "relax",    label: "Relaxar",  icon: CloudRain,from: "200 40% 50%", to: "220 45% 35%" },
  { id: "connect",  label: "Conectar", icon: Heart,    from: "340 60% 60%", to: "320 55% 45%" },
  { id: "focus",    label: "Focar",    icon: Sparkles, from: "45 70% 55%",  to: "30 65% 45%"  },
  { id: "calm",     label: "Acalmar",  icon: Cloud,    from: "150 35% 55%", to: "170 40% 40%" },
];

interface SoundDef { id: string; label: string; icon: typeof Waves; url: string; tint: string; }
const SOUNDS: SoundDef[] = [
  { id: "rain",   label: "Chuva suave",     icon: CloudRain, url: "/audio/rain-soft.mp3",   tint: "200 50% 50%" },
  { id: "ocean",  label: "Oceano",          icon: Waves,     url: "/audio/ocean-waves.mp3", tint: "210 60% 45%" },
  { id: "forest", label: "Floresta",        icon: Leaf,      url: "/audio/forest-calm.mp3", tint: "145 50% 40%" },
  { id: "white",  label: "Ruído branco",    icon: Cloud,     url: "/audio/white-noise.mp3", tint: "220 15% 60%" },
];

interface Experience {
  id: string; title: string; subtitle: string; duration: string;
  mood: Mood; emoji: string; gradient: [string, string];
}
const EXPERIENCES: Experience[] = [
  { id: "rain-cabin", title: "Chuva na Cabana",      subtitle: "Desacelere ouvindo a natureza.",    duration: "20 min", mood: "relax",   emoji: "🌧",  gradient: ["210 50% 45%", "230 55% 30%"] },
  { id: "starlit",    title: "Sob as Estrelas",      subtitle: "Um céu noturno para descansar.",    duration: "15 min", mood: "sleep",   emoji: "✨",  gradient: ["250 55% 35%", "270 60% 20%"] },
  { id: "forest-am",  title: "Amanhecer na Floresta",subtitle: "Acorde com os pássaros.",           duration: "10 min", mood: "focus",   emoji: "🌅",  gradient: ["30 70% 60%",  "15 65% 45%"]  },
  { id: "ocean-deep", title: "Ondas Profundas",      subtitle: "Respire no ritmo do mar.",          duration: "25 min", mood: "calm",    emoji: "🌊",  gradient: ["200 60% 45%", "220 65% 30%"] },
  { id: "fireplace",  title: "Lareira Aconchego",    subtitle: "Calor e silêncio juntos.",          duration: "30 min", mood: "connect", emoji: "🔥",  gradient: ["20 70% 50%",  "10 60% 35%"]  },
  { id: "mountain",   title: "Topo da Montanha",     subtitle: "Ar puro, mente clara.",             duration: "12 min", mood: "breathe", emoji: "🏔",  gradient: ["190 40% 60%", "210 45% 40%"] },
];

const SOS_CARDS = [
  { id: "angry",   label: "Estou irritado",      hint: "Respiração 4-7-8",       icon: Flame,    tint: "10 70% 55%"  },
  { id: "anxious", label: "Estou ansioso",       hint: "Grounding 5-4-3-2-1",    icon: Wind,     tint: "200 55% 50%" },
  { id: "calm-me", label: "Quero me acalmar",    hint: "Respiração quadrada",    icon: Cloud,    tint: "170 40% 50%" },
  { id: "sleep",   label: "Não consigo dormir",  hint: "Respiração do sono",     icon: Moon,     tint: "260 50% 45%" },
  { id: "breathe", label: "Preciso respirar",    hint: "Inhale longo",           icon: Leaf,     tint: "145 45% 45%" },
  { id: "peace",   label: "Quero ficar tranquilo",hint: "Som ambiente",          icon: Star,     tint: "45 65% 55%"  },
];

const RITUALS = [
  { id: "sleep-r",    title: "Ritual do Sono",        meta: "5 min • à noite",       emoji: "🌙" },
  { id: "afternoon",  title: "Pausa da Tarde",        meta: "3 min • respiro",       emoji: "☁️" },
  { id: "parent-kid", title: "Pai & Filho",           meta: "4 min • presença",      emoji: "💛" },
  { id: "gratitude",  title: "Gratidão",              meta: "2 min • abertura",      emoji: "🌸" },
  { id: "breathe-2",  title: "Respirar Juntos",       meta: "3 min • sincronia",     emoji: "🫧" },
  { id: "silence",    title: "Silêncio Leve",         meta: "5 min • escuta",        emoji: "🤍" },
];

const GENTLE_STORIES = [
  { id: "noah",       title: "Noé e a Promessa",            meta: "Esperança",    emoji: "🕊"  },
  { id: "david",      title: "Davi sob as Estrelas",        meta: "Coragem",      emoji: "⭐"  },
  { id: "storm",      title: "Jesus Acalma a Tempestade",   meta: "Paz",          emoji: "🌊" },
  { id: "daniel",     title: "Daniel e a Confiança",        meta: "Confiança",    emoji: "🦁" },
  { id: "gratitude",  title: "Sementes de Gratidão",        meta: "Gratidão",     emoji: "🌱" },
  { id: "kindness",   title: "Bondade ao Próximo",          meta: "Bondade",      emoji: "💛" },
];

const FAVS_KEY = "kidzz_wellness_favs_v1";
const CONTINUE_KEY = "kidzz_wellness_continue_v1";

const useFavorites = () => {
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(FAVS_KEY) || "[]"); } catch { return []; }
  });
  const toggle = useCallback((id: string) => {
    setFavs((cur) => {
      const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
      try { localStorage.setItem(FAVS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    haptic("light");
  }, []);
  return { favs, toggle };
};

const timeOfDayGreeting = () => {
  const h = new Date().getHours();
  if (h < 6)  return { title: "Madrugada calma",  sub: "Respire devagar. Você está seguro." };
  if (h < 12) return { title: "Bom dia, sereno",  sub: "Comece o dia com leveza." };
  if (h < 18) return { title: "Pausa da tarde",   sub: "Um respiro entre os momentos." };
  return       { title: "Noite acolhedora", sub: "Hora de desacelerar." };
};

/* ── Background scene rotation ── */
const SCENES: { id: string; gradient: string; particle: "fireflies" | "dust" | "leaves" | "stars" }[] = [
  { id: "forest",  gradient: "linear-gradient(180deg, hsl(145 40% 25%) 0%, hsl(160 35% 18%) 100%)", particle: "fireflies" },
  { id: "stars",   gradient: "linear-gradient(180deg, hsl(250 50% 18%) 0%, hsl(270 55% 10%) 100%)", particle: "stars" },
  { id: "ocean",   gradient: "linear-gradient(180deg, hsl(210 55% 30%) 0%, hsl(220 60% 18%) 100%)", particle: "dust" },
  { id: "aurora",  gradient: "linear-gradient(180deg, hsl(180 50% 25%) 0%, hsl(280 45% 20%) 100%)", particle: "stars" },
  { id: "fire",    gradient: "linear-gradient(180deg, hsl(20 55% 30%) 0%, hsl(10 50% 18%) 100%)",   particle: "dust" },
  { id: "mountain",gradient: "linear-gradient(180deg, hsl(200 30% 45%) 0%, hsl(220 35% 25%) 100%)", particle: "leaves" },
];

const HeroScene = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SCENES.length), 12000);
    return () => clearInterval(t);
  }, []);
  const scene = SCENES[idx];

  // Particle layer (CSS only)
  const particles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      left: Math.random() * 100,
      top: 20 + Math.random() * 70,
      delay: Math.random() * 4,
      dur: 5 + Math.random() * 4,
      size: 2 + Math.random() * 3,
    }));
  }, [scene.id]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={scene.id}
          className="absolute inset-0"
          style={{ background: scene.gradient }}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>
      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(120% 80% at 50% 40%, transparent 40%, rgba(0,0,0,0.55) 100%)"
      }} />
      {/* Soft blur film */}
      <div className="absolute inset-0 backdrop-blur-[1px]" />
      {/* Particles */}
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.left}%`, top: `${p.top}%`,
            width: p.size, height: p.size,
            background: "white",
            boxShadow: "0 0 8px rgba(255,255,255,0.7)",
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.7, 0], y: [-8, -28] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

/* ── Breathing fullscreen experience ── */
const BreathingExperience = ({ onClose }: { onClose: () => void }) => {
  // 4-7-8 cycle: inhale 4s, hold 7s, exhale 8s — simplified to 4/4/6 for kids
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const phaseLabel = { inhale: "Inspire", hold: "Segure", exhale: "Solte" }[phase];
  useEffect(() => {
    let mounted = true;
    const cycle = async () => {
      const seq: { p: typeof phase; ms: number }[] = [
        { p: "inhale", ms: 4000 },
        { p: "hold",   ms: 4000 },
        { p: "exhale", ms: 6000 },
      ];
      let i = 0;
      while (mounted) {
        setPhase(seq[i].p);
        haptic("light");
        await new Promise(r => setTimeout(r, seq[i].ms));
        i = (i + 1) % seq.length;
      }
    };
    cycle();
    return () => { mounted = false; };
  }, []);
  const scale = phase === "inhale" ? 1.35 : phase === "exhale" ? 0.85 : 1.35;
  const dur = phase === "inhale" ? 4 : phase === "exhale" ? 6 : 4;

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(180deg, hsl(210 55% 18%) 0%, hsl(240 60% 10%) 100%)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <button
        onClick={() => { haptic("light"); onClose(); }}
        className="absolute top-[max(env(safe-area-inset-top),20px)] right-5 w-11 h-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/80"
        aria-label="Fechar respiração"
      >
        <X size={22} />
      </button>

      <motion.div
        className="relative w-[260px] h-[260px] rounded-full"
        animate={{ scale }}
        transition={{ duration: dur, ease: [0.45, 0, 0.55, 1] }}
        style={{
          background: "radial-gradient(circle, hsl(180 70% 55% / 0.55), hsl(220 60% 30% / 0.2) 70%, transparent 100%)",
          boxShadow: "0 0 80px hsl(180 70% 55% / 0.45), inset 0 0 40px hsl(180 70% 70% / 0.3)",
        }}
      >
        <div className="absolute inset-6 rounded-full border border-white/20 backdrop-blur-md" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.p
            key={phaseLabel}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="text-white text-2xl font-light tracking-wide"
          >
            {phaseLabel}
          </motion.p>
        </div>
      </motion.div>

      <p className="mt-12 text-white/60 text-sm font-light">Acompanhe o orb. Respire devagar.</p>
    </motion.div>
  );
};

/* ── Sound player overlay ── */
const SoundPlayer = ({ sound, onClose, engine }: { sound: SoundDef; onClose: () => void; engine: AmbientSoundEngine }) => {
  const [playing, setPlaying] = useState(true);
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    engine.start(sound.id, sound.url, 0.6).then((ok) => { if (!ok) setPlaying(false); });
    return () => { engine.stop(sound.id); };
  }, [sound, engine]);

  useEffect(() => {
    if (!timer) return;
    const t = setTimeout(() => { engine.fadeOut(4000); setTimeout(() => onClose(), 4200); }, timer * 60 * 1000);
    return () => clearTimeout(t);
  }, [timer, engine, onClose]);

  const toggle = () => {
    if (playing) { engine.stop(sound.id); setPlaying(false); }
    else { engine.start(sound.id, sound.url, 0.6); setPlaying(true); }
    haptic("light");
  };

  const Icon = sound.icon;
  return (
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col"
      style={{ background: `linear-gradient(180deg, hsl(${sound.tint} / 0.95) 0%, hsl(220 50% 10%) 100%)` }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button
        onClick={() => { haptic("light"); onClose(); }}
        className="absolute top-[max(env(safe-area-inset-top),20px)] right-5 w-11 h-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/80"
        aria-label="Fechar"
      >
        <X size={22} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        <motion.div
          className="w-48 h-48 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, hsl(${sound.tint} / 0.6), transparent 70%)`,
            boxShadow: `0 0 100px hsl(${sound.tint} / 0.5)`,
          }}
          animate={{ scale: playing ? [1, 1.04, 1] : 1 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon size={64} className="text-white/90" strokeWidth={1.4} />
        </motion.div>

        <div className="text-center">
          <h2 className="text-white text-3xl font-light tracking-wide">{sound.label}</h2>
          <p className="text-white/60 text-sm mt-2 font-light">Som ambiente premium</p>
        </div>

        <button
          onClick={toggle}
          className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center active:scale-95 transition-transform"
          aria-label={playing ? "Pausar" : "Tocar"}
        >
          {playing ? <Pause size={32} className="text-white" /> : <Play size={32} className="text-white ml-1" />}
        </button>

        <div className="flex items-center gap-2 mt-2">
          {[5, 15, 30, 60].map((m) => (
            <button
              key={m}
              onClick={() => { setTimer(m); haptic("light"); }}
              className={`px-4 py-2 rounded-full text-xs font-medium backdrop-blur border transition ${
                timer === m
                  ? "bg-white/25 border-white/40 text-white"
                  : "bg-white/5 border-white/15 text-white/60"
              }`}
            >
              <Timer size={12} className="inline mr-1 -mt-0.5" />{m}m
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Mood Card ── */
const MoodCard = ({ mood, onTap }: { mood: typeof MOODS[number]; onTap: () => void }) => {
  const Icon = mood.icon;
  return (
    <motion.button
      onClick={() => { haptic("light"); onTap(); }}
      whileTap={{ scale: 0.96 }}
      className="relative aspect-square rounded-[22px] overflow-hidden p-4 flex flex-col items-start justify-between text-left"
      style={{
        background: `linear-gradient(135deg, hsl(${mood.from} / 0.85), hsl(${mood.to} / 0.95))`,
        boxShadow: `0 8px 30px hsl(${mood.to} / 0.3), inset 0 1px 0 rgba(255,255,255,0.15)`,
      }}
    >
      <div className="absolute inset-0 backdrop-blur-[2px]" style={{
        background: "radial-gradient(80% 60% at 30% 20%, rgba(255,255,255,0.18), transparent 60%)"
      }} />
      <Icon size={22} className="text-white/95 relative z-10" strokeWidth={1.6} />
      <span className="text-white text-sm font-medium tracking-wide relative z-10">{mood.label}</span>
    </motion.button>
  );
};

/* ── Main Hub ── */
const WellnessHub = ({ onBack }: Props) => {
  const greeting = useMemo(timeOfDayGreeting, []);
  const { favs, toggle } = useFavorites();
  const engineRef = useRef<AmbientSoundEngine | null>(null);
  if (!engineRef.current) engineRef.current = new AmbientSoundEngine();

  const [breathing, setBreathing] = useState(false);
  const [activeSound, setActiveSound] = useState<SoundDef | null>(null);
  const [activeExp, setActiveExp] = useState<Experience | null>(null);

  useEffect(() => () => { engineRef.current?.stopAll(); }, []);

  // Continue listening
  const [continueItem, setContinueItem] = useState<{ id: string; label: string } | null>(() => {
    try { return JSON.parse(localStorage.getItem(CONTINUE_KEY) || "null"); } catch { return null; }
  });
  const saveContinue = (id: string, label: string) => {
    const obj = { id, label };
    setContinueItem(obj);
    try { localStorage.setItem(CONTINUE_KEY, JSON.stringify(obj)); } catch {}
  };

  const openSound = (s: SoundDef) => { saveContinue(s.id, s.label); setActiveSound(s); };

  return (
    <motion.div
      className="fixed inset-0 z-30 flex flex-col"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ background: "linear-gradient(180deg, hsl(180 25% 12%) 0%, hsl(220 30% 8%) 100%)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4"
        style={{ paddingTop: "max(env(safe-area-inset-top), 14px)", paddingBottom: 10 }}
      >
        <button
          onClick={() => { haptic("light"); onBack(); }}
          className="w-11 h-11 rounded-full bg-white/8 backdrop-blur-xl flex items-center justify-center text-white/80 active:scale-95 border border-white/10"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-white/90 text-base font-light tracking-[0.2em] uppercase">Wellness</h1>
        <div className="w-11" />
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch", paddingBottom: 140 }}
      >
        {/* HERO */}
        <section className="relative px-4">
          <div
            className="relative rounded-[28px] overflow-hidden"
            style={{ height: "42vh", minHeight: 300 }}
          >
            <HeroScene />
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <p className="text-white/70 text-xs tracking-[0.25em] uppercase mb-2 font-light">
                  {greeting.title}
                </p>
                <h2 className="text-3xl font-light leading-tight mb-1">{greeting.sub}</h2>
                <p className="text-white/60 text-sm font-light mt-3">
                  🦎 Respire devagar. Eu estou aqui com você.
                </p>
              </motion.div>
              <motion.button
                onClick={() => { haptic("medium"); setBreathing(true); }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-6 self-start px-6 py-3 rounded-full bg-white/95 text-gray-900 text-sm font-medium tracking-wide shadow-xl flex items-center gap-2"
              >
                <Wind size={16} />
                Começar respiração
              </motion.button>
            </div>
          </div>
        </section>

        {/* CONTINUE EXPERIENCE */}
        {continueItem && (
          <section className="px-4 mt-6">
            <button
              onClick={() => {
                const s = SOUNDS.find(x => x.id === continueItem.id);
                if (s) openSound(s);
              }}
              className="w-full rounded-2xl px-4 py-3 flex items-center gap-3 text-left bg-white/[0.06] border border-white/10 backdrop-blur-xl active:scale-[0.99] transition"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Play size={16} className="text-white ml-0.5" />
              </div>
              <div className="flex-1">
                <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase">Continuar</p>
                <p className="text-white text-sm font-light">{continueItem.label}</p>
              </div>
            </button>
          </section>
        )}

        {/* QUICK CALM */}
        <Section title="Como você quer se sentir?">
          <div className="grid grid-cols-3 gap-3 px-4">
            {MOODS.map((m) => (
              <MoodCard key={m.id} mood={m} onTap={() => {
                if (m.id === "breathe") setBreathing(true);
                else {
                  const exp = EXPERIENCES.find(e => e.mood === m.id);
                  if (exp) setActiveExp(exp);
                }
              }} />
            ))}
          </div>
        </Section>

        {/* EXPERIÊNCIAS */}
        <Section title="Experiências">
          <div className="flex gap-3 px-4 overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
            {EXPERIENCES.map((exp) => (
              <motion.button
                key={exp.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => { haptic("light"); setActiveExp(exp); saveContinue(exp.id, exp.title); }}
                className="snap-start flex-shrink-0 w-[260px] h-[170px] rounded-[22px] overflow-hidden relative text-left p-5 flex flex-col justify-between"
                style={{
                  background: `linear-gradient(135deg, hsl(${exp.gradient[0]} / 0.9), hsl(${exp.gradient[1]}))`,
                  boxShadow: `0 12px 36px hsl(${exp.gradient[1]} / 0.35), inset 0 1px 0 rgba(255,255,255,0.12)`,
                }}
              >
                <div className="absolute inset-0" style={{
                  background: "radial-gradient(70% 50% at 80% 20%, rgba(255,255,255,0.18), transparent 60%)"
                }} />
                <span className="text-3xl relative z-10">{exp.emoji}</span>
                <div className="relative z-10">
                  <h3 className="text-white text-lg font-light leading-tight">{exp.title}</h3>
                  <p className="text-white/70 text-xs mt-1 font-light line-clamp-1">{exp.subtitle}</p>
                  <p className="text-white/50 text-[11px] mt-2 tracking-wider">{exp.duration.toUpperCase()}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggle(exp.id); }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/20 backdrop-blur flex items-center justify-center"
                  aria-label="Favoritar"
                >
                  <HeartIcon size={15} className={favs.includes(exp.id) ? "text-pink-300 fill-pink-300" : "text-white/70"} />
                </button>
              </motion.button>
            ))}
          </div>
        </Section>

        {/* SONS DA NATUREZA */}
        <Section title="Sons da Natureza">
          <div className="grid grid-cols-2 gap-3 px-4">
            {SOUNDS.map((s) => {
              const Icon = s.icon;
              return (
                <motion.button
                  key={s.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { haptic("light"); openSound(s); }}
                  className="rounded-2xl p-4 flex items-center gap-3 text-left border border-white/10 backdrop-blur-xl"
                  style={{
                    background: `linear-gradient(135deg, hsl(${s.tint} / 0.25), rgba(255,255,255,0.04))`,
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{ background: `hsl(${s.tint} / 0.35)` }}
                  >
                    <Icon size={20} className="text-white" strokeWidth={1.6} />
                  </div>
                  <span className="text-white text-sm font-light">{s.label}</span>
                </motion.button>
              );
            })}
          </div>
        </Section>

        {/* RITUAIS */}
        <Section title="Rituais">
          <div className="px-4 space-y-2">
            {RITUALS.map((r) => (
              <motion.button
                key={r.id}
                whileTap={{ scale: 0.99 }}
                onClick={() => { haptic("light"); setBreathing(true); }}
                className="w-full rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left bg-white/[0.05] border border-white/10 backdrop-blur-xl"
              >
                <span className="text-2xl">{r.emoji}</span>
                <div className="flex-1">
                  <p className="text-white text-[15px] font-light">{r.title}</p>
                  <p className="text-white/45 text-xs font-light">{r.meta}</p>
                </div>
                <Play size={14} className="text-white/40 ml-1" />
              </motion.button>
            ))}
          </div>
        </Section>

        {/* SOS */}
        <Section title="SOS Emocional" subtitle="Toque o que você sente agora.">
          <div className="grid grid-cols-2 gap-3 px-4">
            {SOS_CARDS.map((s) => {
              const Icon = s.icon;
              return (
                <motion.button
                  key={s.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { haptic("medium"); setBreathing(true); }}
                  className="rounded-2xl p-4 text-left border border-white/10 backdrop-blur-xl min-h-[110px] flex flex-col justify-between"
                  style={{ background: `linear-gradient(140deg, hsl(${s.tint} / 0.22), rgba(255,255,255,0.03))` }}
                >
                  <Icon size={20} className="text-white/85" strokeWidth={1.5} />
                  <div>
                    <p className="text-white text-[13px] font-light leading-snug">{s.label}</p>
                    <p className="text-white/45 text-[10px] mt-1">{s.hint}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </Section>

        {/* HISTÓRIAS SUAVES */}
        <Section title="Histórias suaves" subtitle="Para fechar os olhos com leveza.">
          <div className="flex gap-3 px-4 overflow-x-auto snap-x" style={{ scrollbarWidth: "none" }}>
            {GENTLE_STORIES.map((s) => (
              <motion.button
                key={s.id}
                whileTap={{ scale: 0.97 }}
                className="snap-start flex-shrink-0 w-[180px] h-[210px] rounded-[20px] overflow-hidden relative text-left p-4 flex flex-col justify-end"
                style={{
                  background: "linear-gradient(180deg, hsl(45 50% 35%) 0%, hsl(30 55% 22%) 100%)",
                  boxShadow: "0 10px 30px hsl(30 50% 15% / 0.4)",
                }}
              >
                <div className="absolute inset-0" style={{
                  background: "radial-gradient(60% 40% at 50% 20%, rgba(255,220,150,0.35), transparent 60%)"
                }} />
                <span className="text-4xl absolute top-4 right-4 relative z-10">{s.emoji}</span>
                <div className="relative z-10">
                  <p className="text-white text-base font-light leading-tight">{s.title}</p>
                  <p className="text-white/55 text-[10px] mt-1 tracking-wider uppercase">{s.meta}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </Section>

        {/* FAVORITOS */}
        {favs.length > 0 && (
          <Section title="Seu espaço de calma">
            <div className="px-4 space-y-2">
              {favs.map((id) => {
                const exp = EXPERIENCES.find(e => e.id === id);
                if (!exp) return null;
                return (
                  <button
                    key={id}
                    onClick={() => { haptic("light"); setActiveExp(exp); }}
                    className="w-full rounded-2xl px-4 py-3 flex items-center gap-3 text-left bg-white/[0.05] border border-white/10 backdrop-blur-xl"
                  >
                    <span className="text-2xl">{exp.emoji}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-light">{exp.title}</p>
                      <p className="text-white/45 text-xs">{exp.duration}</p>
                    </div>
                    <HeartIcon size={14} className="text-pink-300 fill-pink-300" />
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* FOOTER */}
        <div className="text-center pt-10 pb-6">
          <p className="text-white/30 text-[11px] tracking-[0.3em] uppercase">Respire • Sinta • Volte</p>
        </div>
      </div>

      <AnimatePresence>
        {breathing && <BreathingExperience onClose={() => setBreathing(false)} />}
        {activeSound && (
          <SoundPlayer
            sound={activeSound}
            engine={engineRef.current!}
            onClose={() => setActiveSound(null)}
          />
        )}
        {activeExp && !activeSound && (
          <motion.div
            className="fixed inset-0 z-[75] flex items-end"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setActiveExp(null)} />
            <motion.div
              initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="relative w-full rounded-t-[28px] p-6 pb-10"
              style={{
                background: `linear-gradient(180deg, hsl(${activeExp.gradient[0]}) 0%, hsl(${activeExp.gradient[1]}) 100%)`,
              }}
            >
              <div className="w-10 h-1 rounded-full bg-white/30 mx-auto mb-5" />
              <span className="text-5xl">{activeExp.emoji}</span>
              <h2 className="text-white text-2xl font-light mt-3">{activeExp.title}</h2>
              <p className="text-white/70 text-sm font-light mt-1">{activeExp.subtitle}</p>
              <p className="text-white/50 text-xs mt-3 tracking-wider">{activeExp.duration.toUpperCase()}</p>
              <button
                onClick={() => {
                  haptic("medium");
                  // Map to closest sound
                  const map: Record<string, string> = {
                    "rain-cabin": "rain", "ocean-deep": "ocean", "forest-am": "forest",
                    "starlit": "white", "fireplace": "white", "mountain": "forest",
                  };
                  const s = SOUNDS.find(x => x.id === map[activeExp.id]) || SOUNDS[0];
                  setActiveExp(null);
                  setTimeout(() => openSound(s), 200);
                }}
                className="mt-6 w-full py-4 rounded-2xl bg-white text-gray-900 font-medium text-[15px] flex items-center justify-center gap-2"
              >
                <Play size={16} />
                Iniciar experiência
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Section = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <section className="mt-8">
    <div className="px-4 mb-3">
      <h3 className="text-white/85 text-[15px] font-light tracking-wide">{title}</h3>
      {subtitle && <p className="text-white/40 text-xs font-light mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </section>
);

export default WellnessHub;

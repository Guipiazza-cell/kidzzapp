import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Users, Music2, Volume2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ForestAudioEngine, FOREST_PRESETS } from "./ForestAudioEngine";
import AneMelodia from "./AneMelodia";
import ForestOnboarding from "./ForestOnboarding";
import SingTogether from "./SingTogether";
import CollectibleAlbum from "./CollectibleAlbum";
import { COLLECTIBLES, bumpCounter, type CollectibleId } from "./forestCollectibles";

interface Props {
  onBack: () => void;
  onXpEarned?: (amount: number) => void;
}

const ONBOARDED_KEY = "kidzz_forest_onboarded";

const SoundForest = ({ onBack, onXpEarned }: Props) => {
  const { profile } = useAuth();
  const childName = profile?.child_name || "amigo";
  const isPremium = profile?.is_premium === true;

  const engineRef = useRef<ForestAudioEngine | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.localStorage.getItem(ONBOARDED_KEY);
  });
  const [showSingTogether, setShowSingTogether] = useState(false);
  const [aneMood, setAneMood] = useState<"idle" | "sing" | "dance" | "happy">("idle");
  const [drumLoopOn, setDrumLoopOn] = useState(false);
  const [unlockedToast, setUnlockedToast] = useState<CollectibleId | null>(null);
  const [albumKey, setAlbumKey] = useState(0);

  useEffect(() => {
    engineRef.current = new ForestAudioEngine();
    return () => engineRef.current?.dispose();
  }, []);

  const completeOnboarding = () => {
    if (typeof window !== "undefined") window.localStorage.setItem(ONBOARDED_KEY, "1");
    setShowOnboarding(false);
  };

  const handleUnlock = (id: CollectibleId | null) => {
    if (!id) return;
    setUnlockedToast(id);
    setAlbumKey((k) => k + 1);
    setAneMood("happy");
    onXpEarned?.(25);
    setTimeout(() => setUnlockedToast(null), 3500);
    setTimeout(() => setAneMood("idle"), 2000);
  };

  const playNote = () => {
    setAneMood("sing");
    const notes = ["C5", "E5", "G5", "A5", "F5"];
    const n = notes[Math.floor(Math.random() * notes.length)];
    engineRef.current?.playNote(n, 1.0, "sine");
    const r = bumpCounter("notes");
    handleUnlock(r.unlocked);
    setTimeout(() => setAneMood("idle"), 1200);
  };

  const playDrum = () => {
    setAneMood("dance");
    engineRef.current?.playDrum();
    const r = bumpCounter("drums");
    handleUnlock(r.unlocked);
    setTimeout(() => setAneMood("idle"), 1000);
  };

  const playMelody = (preset: "golden" | "moon") => {
    setAneMood("sing");
    engineRef.current?.playMelody(preset === "golden" ? FOREST_PRESETS.goldenMelody : FOREST_PRESETS.moonSong, "triangle");
    const r = bumpCounter("melodies");
    handleUnlock(r.unlocked);
    setTimeout(() => setAneMood("idle"), 3000);
  };

  const toggleDrumLoop = () => {
    if (!engineRef.current) return;
    if (drumLoopOn) {
      engineRef.current.stopLoop("forest_pulse");
      setDrumLoopOn(false);
    } else {
      let beat = 0;
      engineRef.current.startLoop("forest_pulse", () => {
        const intensity = FOREST_PRESETS.forestDrumPattern[beat % 8];
        if (intensity > 0) engineRef.current!.playDrum(intensity);
        beat++;
      }, 350);
      setDrumLoopOn(true);
      setAneMood("dance");
    }
  };

  if (showOnboarding) {
    return <ForestOnboarding onComplete={completeOnboarding} childName={childName} />;
  }

  if (showSingTogether) {
    return <SingTogether onBack={() => setShowSingTogether(false)} childName={childName} onCollectibleUnlocked={(id) => handleUnlock(id as CollectibleId)} />;
  }

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        background: "radial-gradient(ellipse at 50% 30%, hsl(145 30% 18%), hsl(220 35% 8%) 70%)",
      }}
    >
      {/* Bokeh background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 22 }).map((_, i) => {
          const size = 8 + (i * 7) % 18;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: `${(i * 71) % 100}%`,
                top: `${(i * 53) % 100}%`,
                background: `radial-gradient(circle, hsl(${45 + (i % 3) * 15} 90% 70% / 0.5), transparent 70%)`,
                filter: "blur(3px)",
              }}
              animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.2, 1] }}
              transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.3 }}
            />
          );
        })}
      </div>

      {/* Header */}
      <div
        className="relative z-10 flex items-center gap-3 px-4 pb-3 border-b border-white/10"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 12px)" }}
      >
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-white text-lg font-extrabold leading-tight">Floresta dos Sons</h1>
          <p className="text-white/60 text-xs font-semibold">A magia toca quando você toca 🍃</p>
        </div>
        <button
          onClick={() => setShowOnboarding(true)}
          className="w-11 h-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center"
          aria-label="Reviver intro"
          title="Reviver intro"
        >
          <Sparkles size={18} className="text-amber-300" />
        </button>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Mascot stage */}
        <div className="flex flex-col items-center gap-3 py-2">
          <AneMelodia mood={aneMood} size="xl" onTap={playNote} />
          <p className="text-white/80 text-xs font-bold text-center max-w-[260px]">
            Toque na Ane para ela cantar uma nota mágica ✨
          </p>
        </div>

        {/* Quick play row */}
        <div className="grid grid-cols-3 gap-3">
          <ActionTile emoji="🎵" label="Nota" onClick={playNote} color="from-amber-400 to-yellow-500" />
          <ActionTile emoji="🥁" label="Tambor" onClick={playDrum} color="from-orange-400 to-rose-500" />
          <ActionTile
            emoji={drumLoopOn ? "⏸" : "🌳"}
            label={drumLoopOn ? "Parar" : "Pulso"}
            onClick={toggleDrumLoop}
            color="from-emerald-400 to-teal-600"
            active={drumLoopOn}
          />
        </div>

        {/* Magic melodies */}
        <div className="rounded-3xl p-4 backdrop-blur-md border border-white/15"
          style={{ background: "linear-gradient(180deg, hsl(45 40% 20% / 0.45), hsl(220 40% 12% / 0.55))" }}>
          <div className="flex items-center gap-2 mb-3">
            <Music2 size={16} className="text-amber-300" />
            <h3 className="text-white text-sm font-extrabold uppercase tracking-wider">Melodias Mágicas</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MelodyCard
              emoji="✨"
              title="Melodia Dourada"
              subtitle="Sequência mágica"
              onPlay={() => playMelody("golden")}
              gradient="from-yellow-400 via-amber-400 to-orange-400"
            />
            <MelodyCard
              emoji="🌙"
              title="Canção da Lua"
              subtitle="Calma noturna"
              onPlay={() => playMelody("moon")}
              gradient="from-indigo-400 via-violet-400 to-purple-500"
            />
          </div>
        </div>

        {/* Sing together — premium */}
        <motion.button
          onClick={() => {
            if (!isPremium) {
              // Trigger contextual paywall through onBack chain handled at parent level
              alert("Disponível no KIDZZ Premium 💛");
              return;
            }
            setShowSingTogether(true);
          }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-3xl p-5 text-left relative overflow-hidden border border-pink-300/30"
          style={{
            background: "linear-gradient(135deg, hsl(340 70% 35%), hsl(280 65% 30%))",
            boxShadow: "0 0 30px hsl(340 70% 40% / 0.4)",
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, hsl(45 95% 70%), transparent 60%)", transform: "translate(30%, -30%)" }} />
          <div className="relative flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl">
              <Users className="text-white" size={26} />
            </div>
            <div className="flex-1">
              <p className="text-white text-base font-extrabold flex items-center gap-2">
                Cantar Juntos {!isPremium && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-900">PRO</span>}
              </p>
              <p className="text-white/80 text-xs font-semibold">Pai canta. {childName} responde. Salvamos no álbum 💛</p>
            </div>
          </div>
        </motion.button>

        {/* Album */}
        <CollectibleAlbum refreshKey={albumKey} />

        {/* Hint */}
        <p className="text-center text-white/40 text-[10px] font-semibold pb-4">
          🍃 Cada som que você toca acende a floresta
        </p>
      </div>

      {/* Unlock toast */}
      <AnimatePresence>
        {unlockedToast && (() => {
          const c = COLLECTIBLES.find((x) => x.id === unlockedToast)!;
          return (
            <motion.div
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] px-4"
              initial={{ y: -50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="rounded-2xl px-5 py-3 backdrop-blur-xl border border-amber-300/40 flex items-center gap-3 shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${c.glow}, hsl(220 40% 14% / 0.85))`, boxShadow: `0 0 40px ${c.glow}` }}>
                <motion.div className="text-3xl" animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] }} transition={{ duration: 0.8 }}>
                  {c.emoji}
                </motion.div>
                <div>
                  <p className="text-amber-200 text-[10px] font-bold uppercase tracking-wider">Desbloqueado!</p>
                  <p className="text-white text-sm font-extrabold">{c.name}</p>
                  <p className="text-white/70 text-[10px] font-semibold">+25 XP ✨</p>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
};

/* ── Tiles ── */
const ActionTile = ({ emoji, label, onClick, color, active }: { emoji: string; label: string; onClick: () => void; color: string; active?: boolean }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.92 }}
    className={`relative rounded-2xl p-4 flex flex-col items-center gap-1 border ${active ? "border-amber-300/60 shadow-[0_0_20px_rgba(251,191,36,0.4)]" : "border-white/15"}`}
    style={{ background: `linear-gradient(135deg, ${active ? "hsl(45 90% 50% / 0.4)" : "hsl(220 30% 18% / 0.6)"}, hsl(220 35% 10% / 0.6))` }}
  >
    <motion.span className={`text-3xl bg-gradient-to-br ${color} bg-clip-text`} animate={active ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.4, repeat: active ? Infinity : 0 }}>
      {emoji}
    </motion.span>
    <span className="text-white text-[11px] font-extrabold">{label}</span>
  </motion.button>
);

const MelodyCard = ({ emoji, title, subtitle, onPlay, gradient }: { emoji: string; title: string; subtitle: string; onPlay: () => void; gradient: string }) => (
  <motion.button
    onClick={onPlay}
    whileTap={{ scale: 0.96 }}
    className="rounded-2xl p-3 flex flex-col items-center gap-1 border border-white/15 relative overflow-hidden"
    style={{ background: "linear-gradient(135deg, hsl(220 30% 18% / 0.7), hsl(220 35% 10% / 0.7))" }}
  >
    <div className={`text-3xl bg-gradient-to-br ${gradient} bg-clip-text drop-shadow`}>{emoji}</div>
    <p className="text-white text-[12px] font-extrabold leading-tight text-center">{title}</p>
    <p className="text-white/60 text-[10px] font-semibold leading-tight text-center">{subtitle}</p>
    <div className="flex items-center gap-1 mt-1 text-amber-300 text-[10px] font-bold">
      <Volume2 size={10} /> Tocar
    </div>
  </motion.button>
);

export default SoundForest;

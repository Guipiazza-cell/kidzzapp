import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, Play, Pause, Sparkles } from "lucide-react";
import { MusicEngine, getTodaysSong, type Song, type SongStep } from "./MusicEngine";
import PixelMusical from "./PixelMusical";
import { addMusicXp, bumpCounter, type MusicAchievement } from "@/lib/musicXp";
import { useMemories } from "@/hooks/useMemories";

interface Props {
  onBack: () => void;
  childName: string;
  onAchievement?: (a: MusicAchievement) => void;
}

const MorningKaraoke = ({ onBack, childName, onAchievement }: Props) => {
  const [song] = useState<Song>(() => getTodaysSong());
  const [stepIndex, setStepIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const engineRef = useRef<MusicEngine | null>(null);
  const { addMemory } = useMemories();

  useEffect(() => {
    engineRef.current = new MusicEngine();
    return () => engineRef.current?.dispose();
  }, []);

  const handlePlay = () => {
    if (!engineRef.current) return;
    if (playing) {
      engineRef.current.stopSong();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    setStepIndex(-1);
    engineRef.current.playSong(
      song,
      (i) => setStepIndex(i),
      () => handleComplete()
    );
  };

  const handleComplete = () => {
    setPlaying(false);
    setCompleted(true);
    setShowCelebration(true);
    addMusicXp("karaoke");
    const ach = bumpCounter("karaoke");
    if (ach) onAchievement?.(ach);
    // Save in memories
    addMemory({
      type: "achievement",
      title: `Cantou: ${song.title}`,
      content: `${childName} concluiu o karaokê com Pixel ${song.emoji}`,
      is_special: false,
      image_url: null,
      metadata: { kind: "karaoke", song_id: song.id, song_title: song.title },
    });
    // Confetti auto-hide
    setTimeout(() => setShowCelebration(false), 3500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        background: "radial-gradient(ellipse at 50% 25%, hsl(210 60% 35%), hsl(220 50% 10%) 75%)",
      }}
    >
      {/* Sun rays bg */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/4 left-1/2 origin-top"
            style={{
              width: 4,
              height: "70vh",
              background: "linear-gradient(to bottom, hsl(50 100% 75% / 0.3), transparent)",
              transform: `translateX(-50%) rotate(${i * 45}deg)`,
            }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pb-3 border-b border-white/10"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 12px)" }}>
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center" aria-label="Voltar">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-white text-lg font-extrabold leading-tight">Bom Dia com Pixel ☀️</h1>
          <p className="text-white/60 text-xs font-semibold">A música de hoje, {childName}!</p>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-between px-4 py-6 overflow-y-auto">
        {/* Pixel */}
        <div className="flex flex-col items-center gap-3 mt-2">
          <PixelMusical mood={playing ? "sing" : completed ? "happy" : "idle"} size="xl" onTap={handlePlay} />
          <div className="text-center">
            <p className="text-amber-200 text-[11px] font-bold uppercase tracking-wider">Música de hoje</p>
            <h2 className="text-white text-2xl font-extrabold mt-1">{song.emoji} {song.title}</h2>
          </div>
        </div>

        {/* Lyrics — current syllable highlighted */}
        <div className="w-full max-w-md my-6">
          <div className="rounded-3xl p-6 backdrop-blur-md border border-white/15 min-h-[140px] flex items-center justify-center"
            style={{ background: "linear-gradient(180deg, hsl(220 40% 18% / 0.5), hsl(220 50% 8% / 0.6))" }}>
            <div className="flex flex-wrap justify-center gap-2">
              {song.steps.map((s, i) => (
                <motion.span
                  key={i}
                  className="text-2xl font-extrabold"
                  animate={{
                    color: i === stepIndex ? "hsl(50 100% 70%)" : i < stepIndex ? "hsl(0 0% 90%)" : "hsl(0 0% 50%)",
                    scale: i === stepIndex ? 1.25 : 1,
                    textShadow: i === stepIndex ? "0 0 18px hsl(50 100% 60%)" : "none",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {s.syllable}
                </motion.span>
              ))}
            </div>
          </div>
          <p className="text-white/50 text-[11px] font-semibold text-center mt-3">
            🎤 Cante junto seguindo as palavras douradas!
          </p>
        </div>

        {/* Big play button */}
        <motion.button
          onClick={handlePlay}
          whileTap={{ scale: 0.94 }}
          className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl"
          style={{
            background: playing
              ? "radial-gradient(circle, hsl(340 80% 60%), hsl(340 70% 40%))"
              : "radial-gradient(circle, hsl(50 95% 65%), hsl(35 90% 50%))",
            boxShadow: playing ? "0 0 40px hsl(340 80% 50%)" : "0 0 40px hsl(50 95% 55%)",
          }}
        >
          {playing ? <Pause size={36} className="text-white" /> : <Mic size={36} className="text-white" />}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/40"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.button>
        <p className="text-white text-sm font-extrabold mt-3">
          {playing ? "Cantando…" : completed ? "Tocar novamente" : "🎤 Cantar junto"}
        </p>
      </div>

      {/* Confetti celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 z-[70] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                style={{ left: "50%", top: "50%" }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 600,
                  rotate: Math.random() * 720,
                  opacity: [1, 1, 0],
                  scale: [0, 1.2, 0.8],
                }}
                transition={{ duration: 2.5, ease: "easeOut" }}
              >
                {["✨", "🎵", "💫", "⭐", "🌟"][i % 5]}
              </motion.div>
            ))}
            <motion.div
              className="rounded-3xl px-6 py-5 backdrop-blur-xl border border-amber-300/50"
              style={{ background: "linear-gradient(135deg, hsl(50 80% 50% / 0.9), hsl(35 80% 40% / 0.9))" }}
              initial={{ scale: 0.5 }} animate={{ scale: 1 }}
            >
              <Sparkles className="mx-auto mb-2 text-white" size={32} />
              <p className="text-white text-xl font-extrabold text-center">Você cantou! 🎉</p>
              <p className="text-amber-100 text-sm font-bold text-center mt-1">+12 sabedoria musical</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MorningKaraoke;

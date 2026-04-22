/* Pré-sono: respiração guiada (4-7-8 simplificado) + canção lenta de embalo.
   Compacto, calmo, sem paywall. */
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wind, Music as MusicIcon, Play } from "lucide-react";

type Phase = "in" | "hold" | "out";
const PHASES: { id: Phase; label: string; duration: number; scale: number }[] = [
  { id: "in",   label: "Inspire…",   duration: 4000, scale: 1.35 },
  { id: "hold", label: "Segure…",    duration: 2500, scale: 1.35 },
  { id: "out",  label: "Solte…",     duration: 6000, scale: 0.85 },
];

interface Props {
  onBack: () => void;
}

const PreSleep = ({ onBack }: Props) => {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [musicOn, setMusicOn] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const phase = PHASES[phaseIdx];

  // Cycle through phases
  useEffect(() => {
    const t = setTimeout(() => {
      setPhaseIdx((i) => {
        const next = (i + 1) % PHASES.length;
        if (next === 0) setCycle((c) => c + 1);
        return next;
      });
    }, phase.duration);
    return () => clearTimeout(t);
  }, [phaseIdx, phase.duration]);

  // Lullaby — slow, sparse, descending notes (Web Audio sintetizado, leve)
  useEffect(() => {
    if (!musicOn) {
      stopRef.current?.();
      return;
    }
    if (typeof window === "undefined") return;
    const Ctx: typeof AudioContext =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    audioCtxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = 0.0;
    master.connect(ctx.destination);
    masterGainRef.current = master;
    // fade in
    master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2);

    // Notes A3 C4 E4 G4 (calm pentatonic-ish), slow tempo
    const notes = [220, 261.63, 329.63, 392, 329.63, 261.63];
    let cancelled = false;

    const playNote = (freq: number, when: number, dur: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(0.18, when + 0.4);
      g.gain.exponentialRampToValueAtTime(0.001, when + dur);
      osc.connect(g);
      g.connect(master);
      osc.start(when);
      osc.stop(when + dur + 0.05);
    };

    let i = 0;
    const beat = 2.6; // segundos por nota — bem lento
    const schedule = () => {
      if (cancelled) return;
      const start = ctx.currentTime + 0.05;
      for (let n = 0; n < 8; n++) {
        playNote(notes[(i + n) % notes.length], start + n * beat, beat * 0.95);
      }
      i = (i + 8) % notes.length;
      setTimeout(schedule, 8 * beat * 1000 - 400);
    };
    schedule();

    stopRef.current = () => {
      cancelled = true;
      try {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
        setTimeout(() => ctx.close(), 1300);
      } catch { /* noop */ }
    };
    return () => {
      stopRef.current?.();
    };
  }, [musicOn]);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: "linear-gradient(180deg, #0a0e27 0%, #1a1040 50%, #0d1b2a 100%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
      >
        <button
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/10 border border-white/15"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} className="text-white/80" />
        </button>
        <p className="text-white/85 text-sm font-extrabold flex items-center gap-1.5">
          <Wind size={14} /> Pré-sono
        </p>
        <button
          onClick={() => setMusicOn((m) => !m)}
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border ${
            musicOn ? "bg-indigo-400/20 border-indigo-400/40" : "bg-white/5 border-white/10"
          }`}
          aria-label="Música"
        >
          <MusicIcon
            size={18}
            className={musicOn ? "text-indigo-200" : "text-white/40"}
          />
        </button>
      </div>

      {/* Breathing orb */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div className="relative" style={{ width: 240, height: 240 }}>
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, hsl(240 70% 75% / 0.45) 0%, hsl(265 70% 60% / 0.25) 60%, transparent 100%)",
              filter: "blur(20px)",
            }}
            animate={{ scale: phase.scale, opacity: phase.id === "out" ? 0.5 : 0.9 }}
            transition={{ duration: phase.duration / 1000, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-6 rounded-full border-2 border-indigo-300/40 backdrop-blur-md"
            style={{
              background:
                "radial-gradient(circle, hsl(240 50% 40% / 0.5), hsl(265 60% 25% / 0.4))",
            }}
            animate={{ scale: phase.scale }}
            transition={{ duration: phase.duration / 1000, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={phase.id}
                className="text-white text-2xl font-extrabold drop-shadow-lg"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                {phase.label}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="mt-10 text-indigo-200/70 text-sm font-semibold text-center max-w-xs">
          Acompanhe o círculo. {cycle === 0 ? "Vamos começar com calma." : `Ciclo ${cycle + 1} • respire fundo 💜`}
        </p>
      </div>

      <p className="text-center text-white/40 text-[11px] font-bold pb-6 px-4">
        Toque em voltar quando estiver com sono 🌙
      </p>
    </motion.div>
  );
};

export default PreSleep;

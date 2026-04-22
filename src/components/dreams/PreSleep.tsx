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
  const [started, setStarted] = useState(false); // gate: só após gesto do usuário
  const [musicOn, setMusicOn] = useState(true);
  const [audioReady, setAudioReady] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const phase = PHASES[phaseIdx];

  // Cycle through phases — só roda após "started"
  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => {
      setPhaseIdx((i) => {
        const next = (i + 1) % PHASES.length;
        if (next === 0) setCycle((c) => c + 1);
        return next;
      });
    }, phase.duration);
    return () => clearTimeout(t);
  }, [phaseIdx, phase.duration, started]);

  // Inicia/para a canção. Só monta AudioContext após gesto do usuário (started=true).
  // Em iOS/Android o AudioContext nasce "suspended" — chamamos resume() de forma síncrona ao toque.
  const startLullaby = useCallback(async () => {
    if (typeof window === "undefined") return;
    const Ctx: typeof AudioContext =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) {
      setAudioReady(false);
      return;
    }
    let ctx: AudioContext;
    try {
      ctx = new Ctx();
    } catch {
      setAudioReady(false);
      return;
    }
    audioCtxRef.current = ctx;

    // iOS/Safari: resume é obrigatório dentro do gesto, e timeout para não travar
    try {
      if (ctx.state === "suspended") {
        await Promise.race([
          ctx.resume(),
          new Promise((_, rej) => setTimeout(() => rej(new Error("resume-timeout")), 1500)),
        ]);
      }
    } catch {
      // se resume falhar, segue sem áudio — UI não trava
      try { ctx.close(); } catch { /* noop */ }
      audioCtxRef.current = null;
      setAudioReady(false);
      return;
    }

    const master = ctx.createGain();
    master.gain.value = 0.0;
    master.connect(ctx.destination);
    masterGainRef.current = master;
    master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2);

    const notes = [220, 261.63, 329.63, 392, 329.63, 261.63];
    let cancelled = false;

    const playNote = (freq: number, when: number, dur: number) => {
      try {
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
      } catch { /* noop */ }
    };

    let i = 0;
    const beat = 2.6;
    let scheduleTimer: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      if (cancelled || ctx.state === "closed") return;
      const start = ctx.currentTime + 0.05;
      for (let n = 0; n < 8; n++) {
        playNote(notes[(i + n) % notes.length], start + n * beat, beat * 0.95);
      }
      i = (i + 8) % notes.length;
      scheduleTimer = setTimeout(schedule, 8 * beat * 1000 - 400);
    };
    schedule();
    setAudioReady(true);

    stopRef.current = () => {
      cancelled = true;
      if (scheduleTimer) clearTimeout(scheduleTimer);
      try {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
        setTimeout(() => {
          try { ctx.close(); } catch { /* noop */ }
        }, 1300);
      } catch { /* noop */ }
      audioCtxRef.current = null;
      masterGainRef.current = null;
      setAudioReady(false);
    };
  }, []);

  // Liga/desliga música conforme toggle, mas SOMENTE depois de started
  useEffect(() => {
    if (!started) return;
    if (musicOn && !audioCtxRef.current) {
      void startLullaby();
    } else if (!musicOn && audioCtxRef.current) {
      stopRef.current?.();
    }
  }, [musicOn, started, startLullaby]);

  // Cleanup geral ao desmontar
  useEffect(() => {
    return () => {
      stopRef.current?.();
    };
  }, []);

  // Handler do botão "Começar" — gesto do usuário; inicia áudio se musicOn
  const handleStart = async () => {
    setStarted(true);
    if (musicOn) {
      await startLullaby();
    }
  };


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

      {/* Conteúdo: gate antes de iniciar (gesto necessário p/ Web Audio em mobile) */}
      {!started ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <motion.div
            className="w-32 h-32 rounded-full mb-8 flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle, hsl(240 70% 75% / 0.45) 0%, hsl(265 70% 60% / 0.2) 60%, transparent 100%)",
            }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Wind size={42} className="text-indigo-200/90" />
          </motion.div>
          <h2 className="text-white text-2xl font-extrabold mb-3">
            Vamos respirar juntos
          </h2>
          <p className="text-indigo-200/80 text-sm font-semibold max-w-xs mb-8">
            Toque em começar para ouvir uma canção lenta e seguir o ritmo da respiração 💜
          </p>
          <button
            onClick={handleStart}
            className="min-h-[52px] px-8 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-extrabold flex items-center gap-2 shadow-lg shadow-indigo-900/40 active:scale-95 transition-transform"
          >
            <Play size={18} fill="currentColor" />
            Começar
          </button>
          <p className="mt-6 text-white/40 text-[11px] font-bold">
            Use fones para uma experiência mais calma 🎧
          </p>
        </div>
      ) : (
        <>
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
            {musicOn && !audioReady && (
              <p className="mt-3 text-indigo-200/50 text-[11px] font-bold">
                Música indisponível neste navegador — siga só a respiração 🌙
              </p>
            )}
          </div>

          <p className="text-center text-white/40 text-[11px] font-bold pb-6 px-4">
            Toque em voltar quando estiver com sono 🌙
          </p>
        </>
      )}

    </motion.div>
  );
};

export default PreSleep;

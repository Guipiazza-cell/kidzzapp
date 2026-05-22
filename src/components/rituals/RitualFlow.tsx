import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, VolumeX, Volume2, ChevronRight, Check } from "lucide-react";
import { RitualDef } from "./rituals";
import { useSosVoice } from "@/components/sos/useSosVoice";
import { trackConnection } from "@/lib/connection";
import { haptic } from "@/lib/haptics";

interface Props {
  ritual: RitualDef;
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen cinematográfico do ritual.
 * Auto-advance baseado no `duration` de cada step.
 * Narração via ElevenLabs (reaproveita useSosVoice).
 */
const RitualFlow = ({ ritual, open, onClose }: Props) => {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const { speak, stop } = useSosVoice();
  const [muted, setMuted] = useState(false);
  const play = (t: string) => { if (!muted) speak(t); };
  const toggleMute = () => { setMuted((m) => { const n = !m; if (n) stop(); return n; }); };
  const isNight = ritual.id === "night";

  // Reset on open
  useEffect(() => {
    if (open) { setIdx(0); setDone(false); }
    else { stop(); }
  }, [open, stop]);

  // Narrate step
  useEffect(() => {
    if (!open || done) return;
    const step = ritual.steps[idx];
    if (step) play(step.voice);
  }, [idx, open, done, ritual.steps, play]);

  // Auto-advance
  useEffect(() => {
    if (!open || done) return;
    const step = ritual.steps[idx];
    if (!step) return;
    const t = setTimeout(() => {
      if (idx < ritual.steps.length - 1) {
        setIdx(idx + 1);
        haptic("light");
      } else {
        setDone(true);
        haptic("medium");
        play(ritual.closing.voice);
        trackConnection("ritual_completed");
      }
    }, step.duration);
    return () => clearTimeout(t);
  }, [idx, open, done, ritual, play]);

  const skip = () => {
    haptic("light");
    if (done) { onClose(); return; }
    if (idx < ritual.steps.length - 1) setIdx(idx + 1);
    else { setDone(true); play(ritual.closing.voice); }
  };

  if (!open) return null;

  const step = ritual.steps[idx];
  const progress = ((idx + (done ? 1 : 0.5)) / ritual.steps.length) * 100;
  const ink = isNight ? "hsl(0 0% 100%)" : "hsl(var(--premium-ink))";
  const inkSoft = isNight ? "hsl(0 0% 100% / 0.75)" : "hsl(var(--premium-ink-soft))";

  return (
    <AnimatePresence>
      <motion.div
        key="ritual-flow"
        className="fixed inset-0 z-[100] flex flex-col"
        style={{ background: ritual.gradient }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Ambient breathing aura */}
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(60% 50% at 50% 40%, ${ritual.glow}, transparent 70%)`,
            opacity: 0.45,
          }}
          animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Header */}
        <div
          className="relative flex items-center justify-between px-5"
          style={{ paddingTop: "max(env(safe-area-inset-top, 16px), 18px)" }}
        >
          <button
            onClick={() => { haptic("light"); stop(); onClose(); }}
            className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
            style={{ background: "hsl(0 0% 100% / 0.25)" }}
            aria-label="Fechar ritual"
          >
            <X size={18} style={{ color: ink }} />
          </button>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: inkSoft }}>
            {ritual.label}
          </div>
          <button
            onClick={toggleMute}
            className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
            style={{ background: "hsl(0 0% 100% / 0.25)" }}
            aria-label={muted ? "Ativar voz" : "Silenciar"}
          >
            {muted ? <VolumeX size={16} style={{ color: ink }} /> : <Volume2 size={16} style={{ color: ink }} />}
          </button>
        </div>

        {/* Progress bar */}
        <div className="relative px-5 mt-4">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(0 0% 100% / 0.2)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: isNight ? "hsl(0 0% 100% / 0.85)" : "hsl(var(--premium-ink) / 0.7)" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-8 text-center">
          <AnimatePresence mode="wait">
            {!done && step && (
              <motion.div
                key={`step-${idx}`}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center"
              >
                {/* Breathing orb */}
                <motion.div
                  className="w-32 h-32 rounded-full mb-8 relative"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, hsl(0 0% 100% / 0.85), ${ritual.glow} 70%)`,
                    boxShadow: `0 20px 60px -10px ${ritual.glow}, 0 2px 0 hsl(0 0% 100% / 0.9) inset`,
                  }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <h2
                  className="text-[34px] font-black leading-[1.05] tracking-tight mb-3"
                  style={{ color: ink, fontFamily: "Nunito, system-ui" }}
                >
                  {step.title}
                </h2>
                <p
                  className="text-[16px] font-medium leading-snug max-w-[280px]"
                  style={{ color: inkSoft }}
                >
                  {step.subtitle}
                </p>
                {step.action && (
                  <div
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold backdrop-blur-md"
                    style={{
                      background: "hsl(0 0% 100% / 0.3)",
                      color: ink,
                      border: "1px solid hsl(0 0% 100% / 0.4)",
                    }}
                  >
                    <Check size={12} /> {step.action}
                  </div>
                )}
              </motion.div>
            )}

            {done && (
              <motion.div
                key="closing"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className="w-24 h-24 rounded-full mb-8 flex items-center justify-center text-5xl"
                  style={{
                    background: "hsl(0 0% 100% / 0.4)",
                    boxShadow: `0 20px 50px -10px ${ritual.glow}`,
                  }}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {ritual.emoji}
                </motion.div>
                <h2 className="text-[32px] font-black leading-[1.05] mb-3" style={{ color: ink }}>
                  {ritual.closing.title}
                </h2>
                <p className="text-[16px] font-medium" style={{ color: inkSoft }}>
                  {ritual.closing.subtitle}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div
          className="relative px-5 pb-8"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom, 24px), 28px)" }}
        >
          <button
            onClick={done ? onClose : skip}
            className="w-full h-14 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 backdrop-blur-md transition-transform active:scale-[0.98]"
            style={{
              background: done ? "hsl(0 0% 100% / 0.95)" : "hsl(0 0% 100% / 0.25)",
              color: done ? "hsl(var(--premium-ink))" : ink,
              boxShadow: done ? `0 10px 30px -10px ${ritual.glow}` : "none",
              border: done ? "none" : "1px solid hsl(0 0% 100% / 0.35)",
            }}
          >
            {done ? "Encerrar com carinho" : <>Próximo passo <ChevronRight size={16} /></>}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RitualFlow;

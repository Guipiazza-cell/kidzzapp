import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, X } from "lucide-react";
import { useSosVoice } from "@/components/sos/useSosVoice";
import { haptic } from "@/lib/haptics";
import { trackConnection } from "@/lib/connection";

interface Props {
  open: boolean;
  onClose: () => void;
  childName?: string;
}

type Phase = "arrive" | "settle" | "drift" | "silence" | "done";

/**
 * SleepMode — global "boa noite" ritual.
 * 4 phases, ~4 min total, ends in soft silence then auto-close.
 *  arrive  (0-10s)  — "Hoje foi um dia..."
 *  settle  (10-60s) — guided slow breath + voice
 *  drift   (60-180s)— ambient hum + occasional whispers
 *  silence (180-240s) — fade to black, no voice
 *  done    — auto-close
 */
const SleepMode = ({ open, onClose, childName }: Props) => {
  const [phase, setPhase] = useState<Phase>("arrive");
  const { speak, stop } = useSosVoice();
  const tRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const name = childName?.trim() || "amor";

  useEffect(() => {
    if (!open) return;
    setPhase("arrive");
    haptic("light");

    // Phase script (best-effort; voice falha em silêncio sem quebrar)
    speak(`Hoje foi um dia inteiro, ${name}. Você pode descansar agora.`);

    const t1 = setTimeout(() => {
      setPhase("settle");
      speak("Solte os ombros. Solte o queixo. Solte o peito. Tudo bem soltar.");
    }, 10_000);
    const t2 = setTimeout(() => {
      setPhase("drift");
      speak("A noite cuida do resto. Eu fico aqui, do seu lado.");
    }, 60_000);
    const t3 = setTimeout(() => {
      setPhase("silence");
      stop();
    }, 180_000);
    const t4 = setTimeout(() => {
      setPhase("done");
      trackConnection("ritual_completed");
      haptic("success");
    }, 240_000);

    tRef.current = [t1, t2, t3, t4];
    return () => {
      tRef.current.forEach(clearTimeout);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Dim viewport via meta theme-color while active
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const meta = document.querySelector('meta[name="theme-color"]');
    const prev = meta?.getAttribute("content") ?? null;
    meta?.setAttribute("content", "#05060a");
    return () => {
      if (meta && prev !== null) meta.setAttribute("content", prev);
    };
  }, [open]);

  const stars = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 4,
      })),
    [open]
  );

  const dim = phase === "silence" || phase === "done" ? 0.92 : phase === "drift" ? 0.5 : 0.2;
  const orbScale = phase === "settle" ? [1, 1.25, 1] : [1, 1.08, 1];
  const orbDuration = phase === "settle" ? 8 : 5;

  const message =
    phase === "arrive"
      ? `Boa noite, ${name}.`
      : phase === "settle"
      ? "Respire com a luz."
      : phase === "drift"
      ? "Apenas descanse."
      : phase === "silence"
      ? "Bons sonhos."
      : "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          style={{
            background:
              "linear-gradient(180deg, hsl(230 50% 6%) 0%, hsl(245 55% 10%) 50%, hsl(260 50% 8%) 100%)",
          }}
        >
          {/* Stars */}
          {stars.map((s) => (
            <motion.span
              key={s.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: s.size,
                height: s.size,
                boxShadow: "0 0 6px rgba(255,255,255,0.9)",
              }}
              animate={{ opacity: [0.2, 0.95, 0.2] }}
              transition={{
                duration: s.duration,
                delay: s.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Breathing orb */}
          <motion.div
            className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
            style={{
              width: 280,
              height: 280,
              marginLeft: -140,
              marginTop: -140,
              background:
                "radial-gradient(circle, hsl(220 90% 80% / 0.55) 0%, hsl(250 80% 60% / 0.25) 45%, transparent 75%)",
              filter: "blur(8px)",
            }}
            animate={{ scale: orbScale, opacity: [0.7, 1, 0.7] }}
            transition={{ duration: orbDuration, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 rounded-full pointer-events-none flex items-center justify-center"
            style={{
              width: 120,
              height: 120,
              marginLeft: -60,
              marginTop: -60,
              background:
                "radial-gradient(circle, hsl(220 95% 92% / 0.95) 0%, hsl(220 95% 80% / 0.4) 70%)",
              boxShadow: "0 0 60px hsl(220 95% 75% / 0.6)",
            }}
            animate={{ scale: orbScale }}
            transition={{ duration: orbDuration, repeat: Infinity, ease: "easeInOut" }}
          >
            <Moon className="text-white/85" size={40} strokeWidth={1.5} />
          </motion.div>

          {/* Message */}
          <div className="absolute inset-x-0 bottom-[28%] flex justify-center pointer-events-none px-8">
            <AnimatePresence mode="wait">
              <motion.p
                key={phase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 1.6, ease: "easeInOut" }}
                className="text-center font-medium text-white/90"
                style={{
                  fontSize: 18,
                  textShadow: "0 1px 14px rgba(0,0,0,0.6)",
                  letterSpacing: 0.3,
                }}
              >
                {message}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Fade-to-black overlay tied to phase */}
          <motion.div
            className="absolute inset-0 bg-black pointer-events-none"
            animate={{ opacity: dim }}
            transition={{ duration: 6, ease: "easeInOut" }}
          />

          {/* Exit */}
          <button
            onClick={() => {
              haptic("light");
              stop();
              onClose();
            }}
            className="absolute top-[max(env(safe-area-inset-top),16px)] right-4 z-10 w-11 h-11 rounded-full flex items-center justify-center text-white/70 hover:text-white"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            aria-label="Sair do modo dormir"
          >
            <X size={18} />
          </button>

          {/* Auto-close after done */}
          {phase === "done" && <AutoClose onClose={onClose} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AutoClose = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 8000);
    return () => clearTimeout(t);
  }, [onClose]);
  return null;
};

export default SleepMode;

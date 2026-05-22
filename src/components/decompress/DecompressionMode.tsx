import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, VolumeX, Volume2 } from "lucide-react";
import { useSosVoice } from "@/components/sos/useSosVoice";
import { haptic } from "@/lib/haptics";
import { trackConnection } from "@/lib/connection";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Decompression Mode — 60s ritual cinemático para o adulto antes
 * de encontrar o filho. Respiração 4-7-8 + narração calma + tela escura.
 *
 * Fases:
 *   0-12s  · "Você chegou. Pare aqui."
 *   12-42s · Respiração guiada (3 ciclos 4-7-8)
 *   42-60s · "Agora vá. Está pronto."
 */

type Phase = "arrive" | "breathe" | "ready" | "done";

const NARRATIONS: Record<Exclude<Phase, "done">, string> = {
  arrive:
    "Você chegou. Antes de abrir a porta, antes de virar pai ou mãe de novo, fique aqui um minuto. Esse minuto é só seu.",
  breathe:
    "Vamos respirar juntos. Inspire por quatro tempos. Segure por sete. Solte devagar por oito. Faça isso três vezes. Eu fico com você.",
  ready:
    "Agora você pode entrar. Mais leve. Mais presente. Seu filho não precisa de um pai perfeito. Precisa de você inteiro, aqui, agora.",
};

const PHASE_DURATION: Record<Exclude<Phase, "done">, number> = {
  arrive: 12000,
  breathe: 30000,
  ready: 18000,
};

const DecompressionMode = ({ open, onClose }: Props) => {
  const [phase, setPhase] = useState<Phase>("arrive");
  const [muted, setMuted] = useState(false);
  const { speak, stop } = useSosVoice();
  const timerRef = useRef<number | null>(null);

  // Reset
  useEffect(() => {
    if (open) setPhase("arrive");
    else stop();
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [open, stop]);

  // Narrate + auto-advance
  useEffect(() => {
    if (!open || phase === "done") return;
    if (!muted) speak(NARRATIONS[phase]);
    const dur = PHASE_DURATION[phase];
    timerRef.current = window.setTimeout(() => {
      haptic("light");
      setPhase((p) => (p === "arrive" ? "breathe" : p === "breathe" ? "ready" : "done"));
    }, dur);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [phase, open, muted, speak]);

  const handleClose = () => { stop(); onClose(); };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="decompress"
        className="fixed inset-0 z-[120] flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background:
            "linear-gradient(180deg, hsl(220 35% 8%) 0%, hsl(240 30% 12%) 50%, hsl(260 28% 14%) 100%)",
        }}
      >
        {/* Ambient living glow */}
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(50% 40% at 50% 45%, hsl(260 60% 35% / 0.55), transparent 70%)",
          }}
          animate={{ opacity: [0.55, 0.85, 0.55] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Header */}
        <div
          className="relative flex items-center justify-between px-5"
          style={{ paddingTop: "max(env(safe-area-inset-top, 16px), 18px)" }}
        >
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
            style={{ background: "hsl(0 0% 100% / 0.12)" }}
            aria-label="Fechar"
          >
            <X size={18} className="text-white/80" />
          </button>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
            Decompressão · 60s
          </div>
          <button
            onClick={() => { setMuted((m) => { if (!m) stop(); return !m; }); }}
            className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
            style={{ background: "hsl(0 0% 100% / 0.12)" }}
            aria-label={muted ? "Ativar voz" : "Silenciar"}
          >
            {muted ? <VolumeX size={16} className="text-white/80" /> : <Volume2 size={16} className="text-white/80" />}
          </button>
        </div>

        {/* Phase content */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-8 text-center">
          <AnimatePresence mode="wait">
            {phase === "arrive" && (
              <motion.div
                key="arrive"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/50 mb-6">
                  Antes de entrar
                </p>
                <h2 className="text-[40px] font-black leading-[1.05] text-white mb-4" style={{ fontFamily: "Nunito, system-ui" }}>
                  Você chegou.
                </h2>
                <p className="text-[17px] font-medium text-white/70 max-w-[280px] mx-auto">
                  Pare aqui. Um minuto inteiro é seu.
                </p>
              </motion.div>
            )}

            {phase === "breathe" && (
              <motion.div
                key="breathe"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center"
              >
                <BreathOrb />
                <p className="mt-10 text-[14px] font-semibold text-white/75 uppercase tracking-widest">
                  4 · 7 · 8
                </p>
                <p className="mt-2 text-[15px] text-white/60 max-w-[260px]">
                  Inspire · Segure · Solte
                </p>
              </motion.div>
            )}

            {phase === "ready" && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/50 mb-6">
                  Agora vá
                </p>
                <h2 className="text-[36px] font-black leading-[1.05] text-white mb-4" style={{ fontFamily: "Nunito, system-ui" }}>
                  Você está pronto.
                </h2>
                <p className="text-[16px] font-medium text-white/70 max-w-[300px] mx-auto">
                  Seu filho não precisa de perfeição. Precisa de você inteiro.
                </p>
              </motion.div>
            )}

            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6"
                  style={{ background: "hsl(0 0% 100% / 0.15)", boxShadow: "0 20px 50px -10px hsl(260 70% 50%)" }}
                >
                  🤍
                </div>
                <h2 className="text-[28px] font-black text-white mb-2">Boa entrada.</h2>
                <p className="text-[15px] text-white/65">Volte sempre que precisar.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div
          className="relative px-5 pb-8"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom, 24px), 28px)" }}
        >
          {phase === "done" ? (
            <button
              onClick={handleClose}
              className="w-full h-14 rounded-2xl font-bold text-[15px] text-white active:scale-[0.98] transition-transform"
              style={{
                background: "linear-gradient(135deg, hsl(260 60% 55%), hsl(280 55% 50%))",
                boxShadow: "0 12px 30px -10px hsl(260 60% 50%)",
              }}
            >
              Encerrar
            </button>
          ) : (
            <p className="text-center text-[12px] text-white/40 font-medium">
              Não pule. Esse minuto importa.
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Orb que pulsa em ciclos 4-7-8 reais (19s por ciclo).
 * Inhale 4s scale up · Hold 7s steady · Exhale 8s scale down.
 */
const BreathOrb = () => {
  return (
    <motion.div
      className="w-44 h-44 rounded-full relative"
      style={{
        background:
          "radial-gradient(circle at 35% 30%, hsl(0 0% 100% / 0.95), hsl(260 70% 65%) 60%, hsl(260 60% 40%) 100%)",
        boxShadow:
          "0 30px 80px -10px hsl(260 70% 50%), 0 4px 0 hsl(0 0% 100% / 0.3) inset",
      }}
      animate={{
        scale: [0.85, 1.12, 1.12, 0.85],
      }}
      transition={{
        duration: 19,
        times: [0, 4 / 19, 11 / 19, 1],
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* breath label */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-white font-black text-[18px] tracking-wider"
        animate={{ opacity: [0, 1, 1, 1, 0] }}
        transition={{ duration: 19, times: [0, 0.05, 0.4, 0.55, 1], repeat: Infinity }}
      >
        <BreathLabel />
      </motion.div>
    </motion.div>
  );
};

const BreathLabel = () => {
  const [label, setLabel] = useState("Inspire");
  useEffect(() => {
    const seq = [
      { t: 0, l: "Inspire" },
      { t: 4000, l: "Segure" },
      { t: 11000, l: "Solte" },
    ];
    let idx = 0;
    const tick = () => {
      setLabel(seq[idx].l);
      idx = (idx + 1) % seq.length;
      const next = idx === 0 ? 8000 : idx === 1 ? 4000 : 7000;
      timer = window.setTimeout(tick, next);
    };
    let timer = window.setTimeout(tick, 0);
    return () => window.clearTimeout(timer);
  }, []);
  return <span>{label}</span>;
};

export default DecompressionMode;

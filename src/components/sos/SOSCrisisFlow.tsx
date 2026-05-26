import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Volume2, VolumeX, ChevronRight,
  Heart, Wind, Hand, Music2, Loader2,
  Moon, Shield, Leaf, Sun, Compass,
} from "lucide-react";
import { useSosVoice } from "./useSosVoice";
import { haptic } from "@/lib/haptics";
import { trackConnection } from "@/lib/connection";
import { useAuth } from "@/contexts/AuthContext";
import type { SosSituation } from "./situations";

/**
 * Fluxo emocional genérico do SOS — alimentado por uma `SosSituation`.
 * 1) Acolhimento (narração ElevenLabs + pausa contemplativa)
 * 2) Respiração guiada (padrão dinâmico por situação)
 * 3) Orientação prática (3 cards)
 * 4) Conteúdo de apoio (playlist + bilhete pros pais)
 */
interface Props {
  situation: SosSituation;
  onBack: () => void;
  onClose: () => void;
  onGoWellness?: () => void;
}

type Step = "acolhimento" | "respiracao" | "pratico" | "apoio";

const ICONS = {
  hand: Hand, wind: Wind, heart: Heart,
  moon: Moon, shield: Shield, leaf: Leaf,
  sun: Sun, compass: Compass,
} as const;

const SOSCrisisFlow = ({ situation, onBack, onClose, onGoWellness }: Props) => {
  const [step, setStep] = useState<Step>("acolhimento");
  const [muted, setMuted] = useState(false);
  const { speak, stop, loading } = useSosVoice();

  useEffect(() => () => stop(), [stop]);

  useEffect(() => {
    if (step === "acolhimento" && !muted) {
      speak(situation.acolhimento.voice);
    } else {
      stop();
    }
  }, [step, muted, speak, stop, situation]);

  const goNext = (next: Step) => {
    haptic("light");
    stop();
    setStep(next);
    if (next === "apoio") trackConnection("sos_used");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-2 pb-3">
        <button
          type="button"
          onClick={() => { stop(); onBack(); }}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "hsl(0 0% 100% / 0.75)", border: "1px solid hsl(0 0% 100% / 0.7)" }}
          aria-label="Voltar"
        >
          <ArrowLeft size={16} style={{ color: "hsl(var(--premium-ink))" }} />
        </button>
        <div className="flex items-center gap-1.5 min-w-0 px-2">
          <span className="text-[18px]" aria-hidden>{situation.emoji}</span>
          <h2
            className="text-[15px] font-black tracking-tight truncate"
            style={{ color: "hsl(var(--premium-ink))" }}
          >
            {situation.label}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => { setMuted((m) => !m); if (!muted) stop(); }}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "hsl(0 0% 100% / 0.75)", border: "1px solid hsl(0 0% 100% / 0.7)" }}
          aria-label={muted ? "Ativar narração" : "Silenciar narração"}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} style={{ color: situation.tint }} />}
        </button>
      </header>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-1.5 mb-4">
        {(["acolhimento", "respiracao", "pratico", "apoio"] as Step[]).map((s) => (
          <span
            key={s}
            className="h-1 rounded-full transition-all"
            style={{
              width: s === step ? 22 : 6,
              background: s === step ? situation.tint : "hsl(0 0% 80% / 0.6)",
            }}
          />
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-1 pb-6">
        <AnimatePresence mode="wait">
          {step === "acolhimento" && (
            <motion.div
              key="acolhimento"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center pt-4"
            >
              {/* Orbe respirando — sem mascote */}
              <div className="relative flex items-center justify-center mb-6" style={{ width: 140, height: 140 }}>
                <motion.span
                  aria-hidden
                  className="absolute rounded-full"
                  style={{
                    width: 140, height: 140,
                    background: `radial-gradient(circle, ${situation.tint.replace(")", " / 0.35)")}, transparent 70%)`,
                    filter: "blur(16px)",
                  }}
                  animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0.85, 0.55] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="relative rounded-full flex items-center justify-center"
                  style={{
                    width: 96, height: 96,
                    background: `linear-gradient(180deg, hsl(var(--sos-from)) 0%, ${situation.tint} 100%)`,
                    boxShadow: `0 0 36px ${situation.tint.replace(")", " / 0.45)")}, inset 0 2px 10px hsl(0 0% 100% / 0.55), inset 0 -8px 18px hsl(0 0% 0% / 0.18)`,
                  }}
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* gloss highlight */}
                  <span
                    aria-hidden
                    className="absolute rounded-full"
                    style={{
                      top: 10, left: 14, width: 38, height: 24,
                      background: "linear-gradient(180deg, hsl(0 0% 100% / 0.7), hsl(0 0% 100% / 0))",
                      filter: "blur(2px)",
                    }}
                  />
                  <Heart size={34} className="text-white fill-white relative" strokeWidth={2.2} />
                </motion.div>
              </div>

              <p
                className="text-[22px] font-black leading-snug max-w-[280px] mb-3 tracking-tight"
                style={{ color: "hsl(var(--premium-ink))" }}
              >
                {situation.acolhimento.title}
              </p>
              <p
                className="text-[15px] font-medium leading-relaxed max-w-[300px] mb-6 whitespace-pre-line"
                style={{ color: "hsl(var(--premium-ink-soft))" }}
              >
                {situation.acolhimento.subtitle}
              </p>
              {loading && (
                <span
                  className="text-[11px] font-medium flex items-center gap-1 mb-4"
                  style={{ color: "hsl(var(--premium-ink-soft))" }}
                >
                  <Loader2 size={11} className="animate-spin" /> preparando voz acolhedora…
                </span>
              )}
              <button
                type="button"
                onClick={() => goNext("respiracao")}
                className="px-6 py-3 rounded-full text-white text-[14px] font-black tracking-tight flex items-center gap-1.5 active:scale-95 transition-transform"
                style={{
                  background: `linear-gradient(180deg, hsl(var(--sos-from)), ${situation.tint})`,
                  boxShadow: `0 8px 22px -8px ${situation.tint.replace(")", " / 0.5)")}`,
                }}
              >
                {situation.acolhimento.cta} <ChevronRight size={14} />
              </button>
            </motion.div>
          )}

          {step === "respiracao" && (
            <BreathingScene
              key="respiracao"
              situation={situation}
              onSpeak={(t) => !muted && speak(t)}
              onDone={() => goNext("pratico")}
            />
          )}

          {step === "pratico" && (
            <motion.div
              key="pratico"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="pt-2"
            >
              <p
                className="text-[11px] font-black uppercase tracking-[0.16em] text-center mb-1"
                style={{ color: situation.tint }}
              >
                {situation.practical.eyebrow}
              </p>
              <h3
                className="text-[20px] font-black text-center mb-4 leading-tight"
                style={{ color: "hsl(var(--premium-ink))" }}
              >
                {situation.practical.title}
              </h3>
              <div className="space-y-2.5 mb-5">
                {situation.practical.tips.map((tip, i) => {
                  const Icon = ICONS[tip.iconKey];
                  return (
                    <motion.div
                      key={tip.title}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 p-3.5 rounded-2xl"
                      style={{
                        background: "hsl(0 0% 100% / 0.82)",
                        border: "1px solid hsl(0 0% 100% / 0.7)",
                        boxShadow: "0 4px 14px -8px hsl(100 15% 18% / 0.12)",
                      }}
                    >
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: situation.tint.replace(")", " / 0.12)") }}
                      >
                        <Icon size={16} style={{ color: situation.tint }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[14px] font-black leading-tight"
                          style={{ color: "hsl(var(--premium-ink))" }}
                        >
                          {tip.title}
                        </p>
                        <p
                          className="text-[12px] font-medium leading-snug mt-0.5"
                          style={{ color: "hsl(var(--premium-ink-soft))" }}
                        >
                          {tip.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => goNext("apoio")}
                className="w-full py-3 rounded-2xl text-white text-[14px] font-black tracking-tight flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                style={{
                  background: `linear-gradient(180deg, hsl(var(--sos-from)), ${situation.tint})`,
                  boxShadow: `0 8px 22px -8px ${situation.tint.replace(")", " / 0.5)")}`,
                }}
              >
                Continuar <ChevronRight size={14} />
              </button>
            </motion.div>
          )}

          {step === "apoio" && (
            <motion.div
              key="apoio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="pt-2"
            >
              <p
                className="text-[11px] font-black uppercase tracking-[0.16em] text-center mb-1"
                style={{ color: situation.tint }}
              >
                {situation.support.eyebrow}
              </p>
              <h3
                className="text-[20px] font-black text-center mb-1 leading-tight"
                style={{ color: "hsl(var(--premium-ink))" }}
              >
                {situation.support.title}
              </h3>
              <p
                className="text-[13px] text-center mb-5 max-w-[280px] mx-auto"
                style={{ color: "hsl(var(--premium-ink-soft))" }}
              >
                {situation.support.intro}
              </p>

              {/* Playlist sugerida */}
              <button
                type="button"
                onClick={() => { haptic("medium"); onGoWellness?.(); onClose(); }}
                className="w-full text-left flex items-center gap-3 p-4 rounded-2xl mb-3 active:scale-[0.98] transition-transform"
                style={{
                  background: `linear-gradient(135deg, hsl(${situation.support.playlist.from} / 0.9), hsl(${situation.support.playlist.to} / 0.9))`,
                  border: "1px solid hsl(0 0% 100% / 0.7)",
                  boxShadow: `0 6px 20px -10px hsl(${situation.support.playlist.accent} / 0.4)`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `hsl(${situation.support.playlist.accent})` }}
                >
                  <Music2 size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[11px] font-black uppercase tracking-wider"
                    style={{ color: `hsl(${situation.support.playlist.accent})` }}
                  >
                    Wellness · {situation.support.playlist.tracks} faixas
                  </p>
                  <p
                    className="text-[15px] font-black leading-tight"
                    style={{ color: "hsl(var(--premium-ink))" }}
                  >
                    {situation.support.playlist.label}
                  </p>
                  <p
                    className="text-[11px] font-medium"
                    style={{ color: "hsl(var(--premium-ink-soft))" }}
                  >
                    {situation.support.playlist.desc}
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: "hsl(var(--premium-ink-soft))" }} />
              </button>

              {/* Mini bilhete pros pais */}
              <div
                className="p-4 rounded-2xl mb-4"
                style={{
                  background: "hsl(0 0% 100% / 0.82)",
                  border: "1px solid hsl(0 0% 100% / 0.7)",
                }}
              >
                <p
                  className="text-[10px] font-black uppercase tracking-[0.16em] mb-1"
                  style={{ color: "hsl(var(--kidzz-green-deep))" }}
                >
                  Pra você, mãe / pai
                </p>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "hsl(var(--premium-ink))" }}
                >
                  {situation.support.parentNote}
                </p>
              </div>

              <button
                type="button"
                onClick={() => { haptic("light"); onClose(); }}
                className="w-full py-3 rounded-2xl text-[14px] font-black tracking-tight active:scale-[0.98] transition-transform"
                style={{
                  background: "hsl(0 0% 100% / 0.7)",
                  border: "1px solid hsl(0 0% 100% / 0.7)",
                  color: "hsl(var(--premium-ink))",
                }}
              >
                {situation.support.closeCta}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ── Respiração guiada — padrão dinâmico por situação ── */
const BreathingScene = ({
  situation, onSpeak, onDone,
}: {
  situation: SosSituation;
  onSpeak: (t: string) => void;
  onDone: () => void;
}) => {
  const { in: inSec, hold: holdSec, out: outSec, cycles: TARGET_CYCLES, intro } = situation.breath;
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    onSpeak(intro);
    let timer: ReturnType<typeof setTimeout>;
    const tick = (p: "in" | "hold" | "out") => {
      setPhase(p);
      const durMs = (p === "in" ? inSec : p === "hold" ? holdSec : outSec) * 1000;
      timer = setTimeout(() => {
        if (p === "in") tick("hold");
        else if (p === "hold") tick("out");
        else {
          setCycle((c) => {
            const next = c + 1;
            if (next >= TARGET_CYCLES) {
              setTimeout(onDone, 600);
              return next;
            }
            tick("in");
            return next;
          });
        }
      }, durMs);
    };
    tick("in");
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = phase === "in" ? "Inspira" : phase === "hold" ? "Segura" : "Solta";
  const scale = phase === "in" ? 1.4 : phase === "hold" ? 1.4 : 0.85;
  const dur = phase === "in" ? inSec : phase === "hold" ? holdSec : outSec;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center pt-2"
    >
      <p
        className="text-[11px] font-black uppercase tracking-[0.16em] mb-1"
        style={{ color: situation.tint }}
      >
        Respiração guiada
      </p>
      <p className="text-[13px] mb-6" style={{ color: "hsl(var(--premium-ink-soft))" }}>
        Ciclo {Math.min(cycle + 1, TARGET_CYCLES)} de {TARGET_CYCLES}
      </p>

      <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
        <motion.span
          aria-hidden
          className="absolute rounded-full"
          style={{
            width: 220, height: 220,
            background: `radial-gradient(circle, ${situation.tint.replace(")", " / 0.28)")}, transparent 70%)`,
            filter: "blur(20px)",
          }}
          animate={{ scale, opacity: phase === "hold" ? 0.9 : 0.6 }}
          transition={{ duration: dur, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: 140, height: 140,
            background: `linear-gradient(180deg, hsl(var(--sos-from)) 0%, ${situation.tint} 100%)`,
            boxShadow: `0 0 40px ${situation.tint.replace(")", " / 0.45)")}, inset 0 2px 10px hsl(0 0% 100% / 0.55), inset 0 -10px 20px hsl(0 0% 0% / 0.18)`,
          }}
          animate={{ scale }}
          transition={{ duration: dur, ease: "easeInOut" }}
        >
          <span
            aria-hidden
            className="absolute rounded-full"
            style={{
              top: 16, left: 22, width: 50, height: 28,
              background: "linear-gradient(180deg, hsl(0 0% 100% / 0.6), hsl(0 0% 100% / 0))",
              filter: "blur(2px)",
            }}
          />
          <span className="text-white text-[18px] font-black tracking-tight relative">{label}</span>
        </motion.div>
      </div>

      <p
        className="text-[12px] mt-8 max-w-[260px] text-center"
        style={{ color: "hsl(var(--premium-ink-soft))" }}
      >
        Acompanhe o ritmo do círculo. Quando quiser, toque pra avançar.
      </p>
      <button
        type="button"
        onClick={onDone}
        className="mt-4 text-[12px] font-black underline-offset-4 hover:underline"
        style={{ color: situation.tint }}
      >
        Pular respiração
      </button>
    </motion.div>
  );
};

export default SOSCrisisFlow;

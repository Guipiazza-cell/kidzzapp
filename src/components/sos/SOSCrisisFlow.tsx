import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX, ChevronRight, Heart, Wind, Hand, Music2, Loader2 } from "lucide-react";
import { useSosVoice } from "./useSosVoice";
import { haptic } from "@/lib/haptics";

/**
 * Fluxo "Crise de choro":
 *  1) Acolhimento emocional (narração + pausa contemplativa)
 *  2) Respiração guiada (60s, círculo expandindo, 4-2-6)
 *  3) Orientação prática (cards)
 *  4) Conteúdo de apoio (playlist + histórias) com CTA p/ wellness
 *
 * Voz: ElevenLabs (Alice) via edge function. Falha silenciosa.
 */
interface Props {
  onBack: () => void;
  onClose: () => void;
  onGoWellness?: () => void;
}

type Step = "acolhimento" | "respiracao" | "pratico" | "apoio";

const ACOLHIMENTO_TEXT =
  "Respira. Seu filho não precisa de perfeição. Precisa sentir segurança. Você está fazendo o suficiente.";

const PRACTICAL_TIPS = [
  { icon: Hand,  title: "Abraço silencioso", desc: "Sem palavras. Só presença. O corpo regula antes da mente." },
  { icon: Wind,  title: "Mude de ambiente",  desc: "Levar pro colo até uma janela ou outro cômodo quebra o ciclo." },
  { icon: Heart, title: "Valide o sentimento", desc: "\u201cTá difícil, né? Tô aqui com você.\u201d Sem corrigir, sem ensinar agora." },
];

const SOSCrisisFlow = ({ onBack, onClose, onGoWellness }: Props) => {
  const [step, setStep] = useState<Step>("acolhimento");
  const [muted, setMuted] = useState(false);
  const { speak, stop, loading } = useSosVoice();

  // Cleanup ao desmontar
  useEffect(() => () => stop(), [stop]);

  // Toca acolhimento ao entrar
  useEffect(() => {
    if (step === "acolhimento" && !muted) {
      speak(ACOLHIMENTO_TEXT);
    } else {
      stop();
    }
  }, [step, muted, speak, stop]);

  const goNext = (next: Step) => {
    haptic("light");
    stop();
    setStep(next);
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
        <div className="flex items-center gap-1.5">
          <span className="text-[18px]" aria-hidden>🔴</span>
          <h2 className="text-[15px] font-black tracking-tight" style={{ color: "hsl(var(--premium-ink))" }}>
            Crise de choro
          </h2>
        </div>
        <button
          type="button"
          onClick={() => { setMuted((m) => !m); if (!muted) stop(); }}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "hsl(0 0% 100% / 0.75)", border: "1px solid hsl(0 0% 100% / 0.7)" }}
          aria-label={muted ? "Ativar narração" : "Silenciar narração"}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} style={{ color: "hsl(var(--sos-to))" }} />}
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
              background: s === step ? "hsl(var(--sos-to))" : "hsl(0 0% 80% / 0.6)",
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
              className="flex flex-col items-center text-center pt-6"
            >
              <motion.div
                className="text-[64px] mb-4"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                🦎
              </motion.div>
              <p
                className="text-[20px] font-black leading-snug max-w-[280px] mb-3"
                style={{ color: "hsl(var(--premium-ink))" }}
              >
                Respira. <span aria-hidden>🌬️</span>
              </p>
              <p
                className="text-[15px] font-medium leading-relaxed max-w-[300px] mb-6"
                style={{ color: "hsl(var(--premium-ink-soft))" }}
              >
                Seu filho não precisa de perfeição.
                <br />
                Precisa sentir segurança.
              </p>
              {loading && (
                <span className="text-[11px] font-medium flex items-center gap-1 mb-4" style={{ color: "hsl(var(--premium-ink-soft))" }}>
                  <Loader2 size={11} className="animate-spin" /> preparando voz acolhedora…
                </span>
              )}
              <button
                type="button"
                onClick={() => goNext("respiracao")}
                className="px-6 py-3 rounded-full text-white text-[14px] font-black tracking-tight flex items-center gap-1.5 active:scale-95 transition-transform"
                style={{
                  background: "linear-gradient(180deg, hsl(var(--sos-from)), hsl(var(--sos-to)))",
                  boxShadow: "0 8px 22px -8px hsl(var(--sos-to) / 0.5)",
                }}
              >
                Respirar juntos <ChevronRight size={14} />
              </button>
            </motion.div>
          )}

          {step === "respiracao" && (
            <BreathingScene
              key="respiracao"
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
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-center mb-1" style={{ color: "hsl(var(--sos-to))" }}>
                Agora, com calma
              </p>
              <h3 className="text-[20px] font-black text-center mb-4 leading-tight" style={{ color: "hsl(var(--premium-ink))" }}>
                Três coisas que ajudam
              </h3>
              <div className="space-y-2.5 mb-5">
                {PRACTICAL_TIPS.map((tip, i) => {
                  const Icon = tip.icon;
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
                      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: "hsl(0 60% 96%)" }}>
                        <Icon size={16} style={{ color: "hsl(var(--sos-to))" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-black leading-tight" style={{ color: "hsl(var(--premium-ink))" }}>
                          {tip.title}
                        </p>
                        <p className="text-[12px] font-medium leading-snug mt-0.5" style={{ color: "hsl(var(--premium-ink-soft))" }}>
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
                  background: "linear-gradient(180deg, hsl(var(--sos-from)), hsl(var(--sos-to)))",
                  boxShadow: "0 8px 22px -8px hsl(var(--sos-to) / 0.5)",
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
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-center mb-1" style={{ color: "hsl(var(--sos-to))" }}>
                Apoio contínuo
              </p>
              <h3 className="text-[20px] font-black text-center mb-1 leading-tight" style={{ color: "hsl(var(--premium-ink))" }}>
                Sons que acalmam
              </h3>
              <p className="text-[13px] text-center mb-5 max-w-[280px] mx-auto" style={{ color: "hsl(var(--premium-ink-soft))" }}>
                Playlist curada para o que veio agora — e o que vem depois.
              </p>

              {/* Playlist sugerida */}
              <button
                type="button"
                onClick={() => { haptic("medium"); onGoWellness?.(); onClose(); }}
                className="w-full text-left flex items-center gap-3 p-4 rounded-2xl mb-3 active:scale-[0.98] transition-transform"
                style={{
                  background: "linear-gradient(135deg, hsl(140 35% 94% / 0.9), hsl(150 30% 88% / 0.9))",
                  border: "1px solid hsl(0 0% 100% / 0.7)",
                  boxShadow: "0 6px 20px -10px hsl(150 30% 30% / 0.25)",
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "hsl(150 45% 55%)" }}>
                  <Music2 size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: "hsl(150 35% 35%)" }}>
                    Wellness · 6 faixas
                  </p>
                  <p className="text-[15px] font-black leading-tight" style={{ color: "hsl(var(--premium-ink))" }}>
                    Acalmar crise
                  </p>
                  <p className="text-[11px] font-medium" style={{ color: "hsl(var(--premium-ink-soft))" }}>
                    chuva suave · canto de pássaros · piano lento
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: "hsl(var(--premium-ink-soft))" }} />
              </button>

              {/* Mini dica de pais */}
              <div className="p-4 rounded-2xl mb-4"
                style={{
                  background: "hsl(0 0% 100% / 0.82)",
                  border: "1px solid hsl(0 0% 100% / 0.7)",
                }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.16em] mb-1" style={{ color: "hsl(var(--kidzz-green-deep))" }}>
                  Pra você, mãe / pai
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: "hsl(var(--premium-ink))" }}>
                  Você acabou de regular um corpo pequeno que ainda não sabe se regular sozinho.
                  Isso é amor em ação. <strong>Você está fazendo bem.</strong>
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
                Estou melhor agora
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ── Respiração guiada — círculo 4-2-6 por ~60s ── */
const BreathingScene = ({ onSpeak, onDone }: { onSpeak: (t: string) => void; onDone: () => void }) => {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [cycle, setCycle] = useState(0); // 5 ciclos = ~60s
  const TARGET_CYCLES = 5;

  useEffect(() => {
    // narração inicial
    onSpeak("Vamos respirar juntos. Inspira pelo nariz, segura, e solta devagar pela boca.");
    let timer: ReturnType<typeof setTimeout>;
    const tick = (p: "in" | "hold" | "out") => {
      setPhase(p);
      const dur = p === "in" ? 4000 : p === "hold" ? 2000 : 6000;
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
      }, dur);
    };
    tick("in");
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = phase === "in" ? "Inspira" : phase === "hold" ? "Segura" : "Solta";
  const scale = phase === "in" ? 1.4 : phase === "hold" ? 1.4 : 0.85;
  const dur = phase === "in" ? 4 : phase === "hold" ? 2 : 6;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center pt-2"
    >
      <p className="text-[11px] font-black uppercase tracking-[0.16em] mb-1" style={{ color: "hsl(var(--sos-to))" }}>
        Respiração guiada
      </p>
      <p className="text-[13px] mb-6" style={{ color: "hsl(var(--premium-ink-soft))" }}>
        Ciclo {Math.min(cycle + 1, TARGET_CYCLES)} de {TARGET_CYCLES}
      </p>

      <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
        {/* halo */}
        <motion.span
          aria-hidden
          className="absolute rounded-full"
          style={{
            width: 220,
            height: 220,
            background: "radial-gradient(circle, hsl(var(--sos-glow) / 0.25), transparent 70%)",
            filter: "blur(20px)",
          }}
          animate={{ scale, opacity: phase === "hold" ? 0.9 : 0.6 }}
          transition={{ duration: dur, ease: "easeInOut" }}
        />
        {/* círculo principal */}
        <motion.div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: 140,
            height: 140,
            background: "linear-gradient(180deg, hsl(var(--sos-from)) 0%, hsl(var(--sos-to)) 100%)",
            boxShadow: "0 0 40px hsl(var(--sos-glow) / 0.4), inset 0 2px 8px hsl(0 100% 90% / 0.4)",
          }}
          animate={{ scale }}
          transition={{ duration: dur, ease: "easeInOut" }}
        >
          <span className="text-white text-[18px] font-black tracking-tight">{label}</span>
        </motion.div>
      </div>

      <p className="text-[12px] mt-8 max-w-[260px] text-center" style={{ color: "hsl(var(--premium-ink-soft))" }}>
        Acompanhe o ritmo do círculo. Quando quiser, toque pra avançar.
      </p>
      <button
        type="button"
        onClick={onDone}
        className="mt-4 text-[12px] font-black underline-offset-4 hover:underline"
        style={{ color: "hsl(var(--sos-to))" }}
      >
        Pular respiração
      </button>
    </motion.div>
  );
};

export default SOSCrisisFlow;

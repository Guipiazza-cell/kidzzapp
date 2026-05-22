import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wind, Sunset, HeartHandshake, Sparkles, Loader2, Volume2, VolumeX, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";

/**
 * Wellness Cinemático — Quick Modes emocionais.
 * 4 modos curtos (≈90s cada): entrada cinemática → respiração + narração
 * ElevenLabs → encerramento emocional ("você merecia esses 2 minutos").
 *
 * Auto-contido: overlay full-screen, não toca no WellnessHub.
 */
export type QuickModeId = "wind" | "afternoon" | "guilt" | "energy";

interface Mode {
  id: QuickModeId;
  emoji: string;
  label: string;
  pitch: string;
  // gradiente atmosférico (hsl)
  from: string;
  to: string;
  glow: string;
  ink: string;
  intro: string;        // narração de abertura
  breath: { in: number; hold: number; out: number; cycles: number; cue: string };
  closing: string;      // narração de encerramento
  closingTitle: string;
  closingNote: string;
  Icon: typeof Wind;
}

const MODES: Mode[] = [
  {
    id: "wind",
    emoji: "🌬️",
    label: "Respirar com o vento",
    pitch: "60s pra desacelerar o corpo todo.",
    from: "200 60% 92%", to: "210 45% 80%", glow: "200 70% 75%", ink: "210 40% 22%",
    intro: "Feche os olhos se puder. Imagine o vento entrando devagar pelo nariz, percorrendo o peito, e saindo mais leve.",
    breath: { in: 4, hold: 2, out: 6, cycles: 5, cue: "vento" },
    closing: "Pronto. Seu corpo agradece. Você merecia esses dois minutos.",
    closingTitle: "Você ficou.",
    closingNote: "Ficar com a respiração é um ato pequeno e raro. Volte sempre que precisar.",
    Icon: Wind,
  },
  {
    id: "afternoon",
    emoji: "🌅",
    label: "Acalmar a tarde",
    pitch: "Pra atravessar o pico do dia com leveza.",
    from: "28 70% 92%", to: "18 55% 82%", glow: "20 80% 75%", ink: "20 40% 22%",
    intro: "A tarde costuma ser o ponto onde o corpo cobra. Vamos baixar o volume agora, juntos.",
    breath: { in: 4, hold: 4, out: 6, cycles: 5, cue: "sol baixando" },
    closing: "A tarde já não pesa igual. Você atravessou com presença.",
    closingTitle: "Atravessou.",
    closingNote: "O resto do dia vai existir do mesmo jeito. Você só não vai mais sozinho(a) nele.",
    Icon: Sunset,
  },
  {
    id: "guilt",
    emoji: "🤍",
    label: "Soltar a culpa",
    pitch: "Pra largar o peso que não é seu hoje.",
    from: "330 35% 94%", to: "300 30% 86%", glow: "320 50% 78%", ink: "310 30% 24%",
    intro: "Culpa de pai e mãe não cabe num corpo só. Vamos devolver pro chão o que não é pra carregar agora.",
    breath: { in: 5, hold: 2, out: 7, cycles: 4, cue: "soltar" },
    closing: "Você é suficiente. Hoje, ontem, e amanhã também. Já basta.",
    closingTitle: "Você é suficiente.",
    closingNote: "Pais perfeitos não existem. Pais presentes, sim. Você é desse tipo.",
    Icon: HeartHandshake,
  },
  {
    id: "energy",
    emoji: "✨",
    label: "Energia gentil",
    pitch: "Pra acordar o corpo sem violência.",
    from: "85 50% 92%", to: "140 35% 84%", glow: "100 50% 75%", ink: "140 35% 22%",
    intro: "Sem pressa. Vamos despertar o corpo do mesmo jeito que se acorda alguém amado: com gentileza.",
    breath: { in: 4, hold: 1, out: 4, cycles: 6, cue: "luz acordando" },
    closing: "Você está acordado(a) por dentro. O dia pode começar quando quiser.",
    closingTitle: "Dia teu.",
    closingNote: "Começar bem é um luxo simples. Você acabou de se dar esse.",
    Icon: Sparkles,
  },
];

/* ── Voz ElevenLabs (cache em memória, fallback silencioso) ── */
const voiceCache = new Map<string, string>();
async function speak(text: string, audioRef: React.MutableRefObject<HTMLAudioElement | null>): Promise<void> {
  if (!text?.trim()) return;
  try { audioRef.current?.pause(); } catch {}
  let dataUri = voiceCache.get(text);
  if (!dataUri) {
    try {
      const { data, error } = await supabase.functions.invoke("elevenlabs-tts", { body: { text } });
      if (error || !(data as any)?.audioContent) return;
      dataUri = `data:audio/mpeg;base64,${(data as any).audioContent}`;
      voiceCache.set(text, dataUri);
    } catch { return; }
  }
  return new Promise((resolve) => {
    const a = new Audio(dataUri);
    audioRef.current = a;
    a.onended = () => resolve();
    a.onerror = () => resolve();
    a.play().catch(() => resolve());
  });
}

/* ────────────── ROOT ────────────── */
type Phase = "picker" | "intro" | "breath" | "closing";

interface Props {
  open: boolean;
  onClose: () => void;
}

const WellnessCinema = ({ open, onClose }: Props) => {
  const [mode, setMode] = useState<Mode | null>(null);
  const [phase, setPhase] = useState<Phase>("picker");
  const [muted, setMuted] = useState(false);
  const [loadingVoice, setLoadingVoice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset ao fechar
  useEffect(() => {
    if (!open) {
      try { audioRef.current?.pause(); } catch {}
      const t = setTimeout(() => { setMode(null); setPhase("picker"); }, 320);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Sequência intro → breath → closing
  useEffect(() => {
    if (!mode) return;
    if (phase === "intro") {
      let cancelled = false;
      (async () => {
        if (!muted) { setLoadingVoice(true); await speak(mode.intro, audioRef); setLoadingVoice(false); }
        else await new Promise((r) => setTimeout(r, 2200));
        if (!cancelled) setPhase("breath");
      })();
      return () => { cancelled = true; };
    }
    if (phase === "closing") {
      if (!muted) speak(mode.closing, audioRef);
    }
  }, [phase, mode, muted]);

  const pickMode = (m: Mode) => {
    haptic("medium"); sfx("click");
    setMode(m);
    setPhase("intro");
  };

  const skipToBreath = () => { try { audioRef.current?.pause(); } catch {} ; setPhase("breath"); };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="wc-backdrop"
            className="fixed inset-0 z-[95]"
            style={{ background: "hsl(0 0% 0% / 0.45)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            key="wc-stage"
            className="fixed inset-x-2 top-4 bottom-4 z-[100] overflow-hidden flex flex-col"
            style={{
              borderRadius: 36,
              background: mode
                ? `linear-gradient(180deg, hsl(${mode.from}) 0%, hsl(${mode.to}) 100%)`
                : "linear-gradient(180deg, hsl(60 30% 99%) 0%, hsl(150 28% 92%) 100%)",
              boxShadow: "0 30px 80px -20px hsl(0 0% 0% / 0.4)",
              maxWidth: 560, margin: "0 auto",
            }}
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            role="dialog" aria-modal="true" aria-label="Wellness cinemático"
          >
            {/* atmosfera — orbe ambiente que pulsa */}
            {mode && (
              <>
                <motion.span
                  aria-hidden
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    top: "10%", left: "50%", x: "-50%",
                    width: 480, height: 480,
                    background: `radial-gradient(circle, hsl(${mode.glow} / 0.45), transparent 65%)`,
                    filter: "blur(40px)",
                  }}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.85, 0.55] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.span
                  aria-hidden
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    bottom: "-10%", right: "-10%",
                    width: 360, height: 360,
                    background: `radial-gradient(circle, hsl(${mode.glow} / 0.3), transparent 70%)`,
                    filter: "blur(50px)",
                  }}
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                />
              </>
            )}

            {/* Top bar */}
            <div className="flex items-center justify-between px-5 pt-5 relative z-10">
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: "hsl(0 0% 100% / 0.6)", border: "1px solid hsl(0 0% 100% / 0.7)" }}
                aria-label={muted ? "Ativar narração" : "Silenciar"}
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} style={{ color: mode ? `hsl(${mode.ink})` : "hsl(var(--premium-ink))" }} />}
              </button>
              <p
                className="text-[10px] font-black uppercase tracking-[0.24em]"
                style={{ color: mode ? `hsl(${mode.ink} / 0.7)` : "hsl(var(--premium-ink-soft))" }}
              >
                {mode ? mode.label : "Modo cinemático"}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: "hsl(0 0% 100% / 0.6)", border: "1px solid hsl(0 0% 100% / 0.7)" }}
                aria-label="Fechar"
              >
                <X size={16} style={{ color: mode ? `hsl(${mode.ink})` : "hsl(var(--premium-ink))" }} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 px-6 pb-8 relative z-10 flex flex-col">
              <AnimatePresence mode="wait">
                {phase === "picker" && (
                  <motion.div
                    key="picker"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.32 }}
                    className="flex-1 flex flex-col justify-center"
                  >
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-center mb-2" style={{ color: "hsl(var(--premium-ink-soft))" }}>
                      Wellness · 4 modos curtos
                    </p>
                    <h2 className="text-[26px] font-black leading-[1.05] text-center tracking-tight mb-1" style={{ color: "hsl(var(--premium-ink))" }}>
                      Como você está agora?
                    </h2>
                    <p className="text-[13px] text-center mb-6 max-w-[320px] mx-auto" style={{ color: "hsl(var(--premium-ink-soft))" }}>
                      Escolha um sentimento. A gente cuida do resto.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {MODES.map((m, i) => (
                        <motion.button
                          key={m.id}
                          type="button"
                          onClick={() => pickMode(m)}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 + i * 0.05 }}
                          whileTap={{ scale: 0.97 }}
                          className="relative text-left p-4 rounded-3xl overflow-hidden"
                          style={{
                            background: `linear-gradient(160deg, hsl(${m.from}) 0%, hsl(${m.to}) 100%)`,
                            border: "1px solid hsl(0 0% 100% / 0.6)",
                            boxShadow: `0 10px 28px -16px hsl(${m.glow} / 0.6)`,
                            minHeight: 132,
                          }}
                        >
                          <span aria-hidden className="absolute -top-6 -right-6 w-24 h-24 rounded-full"
                            style={{ background: `radial-gradient(circle, hsl(${m.glow} / 0.45), transparent 70%)`, filter: "blur(10px)" }}
                          />
                          <m.Icon size={22} style={{ color: `hsl(${m.ink})` }} />
                          <p className="text-[15px] font-black leading-tight mt-3 tracking-tight" style={{ color: `hsl(${m.ink})` }}>
                            {m.label}
                          </p>
                          <p className="text-[11px] font-medium leading-snug mt-1" style={{ color: `hsl(${m.ink} / 0.7)` }}>
                            {m.pitch}
                          </p>
                          <span className="inline-flex items-center gap-0.5 mt-2 text-[10px] font-black" style={{ color: `hsl(${m.ink})` }}>
                            Entrar <ChevronRight size={10} />
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {phase === "intro" && mode && (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 flex flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      className="text-[64px] mb-4"
                      animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      aria-hidden
                    >
                      {mode.emoji}
                    </motion.div>
                    <p className="text-[20px] font-black leading-snug max-w-[320px] tracking-tight mb-3" style={{ color: `hsl(${mode.ink})` }}>
                      {mode.label}
                    </p>
                    <p className="text-[14px] font-medium leading-relaxed max-w-[300px] mb-6" style={{ color: `hsl(${mode.ink} / 0.8)` }}>
                      {mode.intro}
                    </p>
                    {loadingVoice && (
                      <span className="text-[11px] font-medium flex items-center gap-1 mb-2" style={{ color: `hsl(${mode.ink} / 0.7)` }}>
                        <Loader2 size={11} className="animate-spin" /> preparando voz…
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={skipToBreath}
                      className="mt-3 text-[12px] font-black underline-offset-4 hover:underline"
                      style={{ color: `hsl(${mode.ink} / 0.7)` }}
                    >
                      pular para respiração
                    </button>
                  </motion.div>
                )}

                {phase === "breath" && mode && (
                  <BreathScene
                    key="breath"
                    mode={mode}
                    muted={muted}
                    audioRef={audioRef}
                    onDone={() => setPhase("closing")}
                  />
                )}

                {phase === "closing" && mode && (
                  <motion.div
                    key="closing"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 flex flex-col items-center justify-center text-center"
                  >
                    <motion.div
                      className="relative mb-6"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <span aria-hidden className="absolute inset-0 rounded-full"
                        style={{ background: `radial-gradient(circle, hsl(${mode.glow} / 0.5), transparent 70%)`, filter: "blur(18px)" }}
                      />
                      <span className="relative text-[56px] block">🤍</span>
                    </motion.div>
                    <p className="text-[26px] font-black leading-[1.05] tracking-tight mb-3 max-w-[320px]" style={{ color: `hsl(${mode.ink})` }}>
                      {mode.closingTitle}
                    </p>
                    <p className="text-[14px] font-medium leading-relaxed max-w-[300px] mb-8" style={{ color: `hsl(${mode.ink} / 0.8)` }}>
                      {mode.closingNote}
                    </p>
                    <div className="flex flex-col gap-2 w-full max-w-[280px]">
                      <button
                        type="button"
                        onClick={() => { setPhase("picker"); setMode(null); }}
                        className="w-full py-3 rounded-full text-[13px] font-black tracking-tight active:scale-[0.98] transition-transform"
                        style={{
                          background: `linear-gradient(180deg, hsl(0 0% 100% / 0.9), hsl(0 0% 100% / 0.7))`,
                          color: `hsl(${mode.ink})`,
                          border: "1px solid hsl(0 0% 100% / 0.8)",
                          boxShadow: `0 8px 22px -10px hsl(${mode.glow} / 0.6)`,
                        }}
                      >
                        Fazer outro modo
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 rounded-full text-[13px] font-black tracking-tight"
                        style={{ color: `hsl(${mode.ink} / 0.75)` }}
                      >
                        Voltar pro Wellness
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ── Cena de respiração cinematográfica ── */
const BreathScene = ({
  mode, muted, audioRef, onDone,
}: {
  mode: Mode; muted: boolean;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  onDone: () => void;
}) => {
  const { in: inSec, hold: holdSec, out: outSec, cycles: TARGET } = mode.breath;
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = (p: "in" | "hold" | "out") => {
      setPhase(p);
      const ms = (p === "in" ? inSec : p === "hold" ? holdSec : outSec) * 1000;
      timer = setTimeout(() => {
        if (p === "in") tick("hold");
        else if (p === "hold") tick("out");
        else {
          setCycle((c) => {
            const next = c + 1;
            if (next >= TARGET) { setTimeout(onDone, 700); return next; }
            tick("in"); return next;
          });
        }
      }, ms);
    };
    tick("in");
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = phase === "in" ? "Inspira" : phase === "hold" ? "Segura" : "Solta";
  const scale = phase === "in" ? 1.45 : phase === "hold" ? 1.45 : 0.82;
  const dur = phase === "in" ? inSec : phase === "hold" ? holdSec : outSec;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col items-center justify-center"
    >
      <p className="text-[11px] font-black uppercase tracking-[0.22em] mb-1" style={{ color: `hsl(${mode.ink} / 0.7)` }}>
        {mode.breath.cue}
      </p>
      <p className="text-[12px] mb-8" style={{ color: `hsl(${mode.ink} / 0.65)` }}>
        Ciclo {Math.min(cycle + 1, TARGET)} de {TARGET}
      </p>

      <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
        <motion.span
          aria-hidden
          className="absolute rounded-full"
          style={{
            width: 260, height: 260,
            background: `radial-gradient(circle, hsl(${mode.glow} / 0.4), transparent 70%)`,
            filter: "blur(24px)",
          }}
          animate={{ scale, opacity: phase === "hold" ? 0.95 : 0.65 }}
          transition={{ duration: dur, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: 170, height: 170,
            background: `radial-gradient(circle at 32% 28%, hsl(0 0% 100% / 0.95), hsl(${mode.glow} / 0.9) 60%, hsl(${mode.to}) 100%)`,
            boxShadow: `0 0 60px hsl(${mode.glow} / 0.55), inset 0 4px 14px hsl(0 0% 100% / 0.7), inset 0 -12px 24px hsl(${mode.ink} / 0.18)`,
          }}
          animate={{ scale }}
          transition={{ duration: dur, ease: "easeInOut" }}
        >
          <span
            aria-hidden
            className="absolute rounded-full pointer-events-none"
            style={{
              top: 20, left: 30, width: 56, height: 30,
              background: "linear-gradient(180deg, hsl(0 0% 100% / 0.75), hsl(0 0% 100% / 0))",
              filter: "blur(2px)",
            }}
          />
          <span className="text-[20px] font-black tracking-tight relative" style={{ color: `hsl(${mode.ink})` }}>{label}</span>
        </motion.div>
      </div>

      <p className="text-[12px] mt-10 max-w-[280px] text-center" style={{ color: `hsl(${mode.ink} / 0.7)` }}>
        Siga o ritmo do círculo. Quando quiser, toque pra encerrar.
      </p>
      <button
        type="button"
        onClick={() => { try { audioRef.current?.pause(); } catch {} ; onDone(); }}
        className="mt-3 text-[12px] font-black underline-offset-4 hover:underline"
        style={{ color: `hsl(${mode.ink})` }}
      >
        Encerrar com calma
      </button>
    </motion.div>
  );
};

export default WellnessCinema;

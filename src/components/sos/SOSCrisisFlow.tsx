import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Volume2, VolumeX, ChevronRight,
  Heart, Wind, Hand, Music2, Loader2, Share2, BookmarkPlus, Check,
  Moon, Shield, Leaf, Sun, Compass, BookOpen, Sparkles,
} from "lucide-react";
import { useSosVoice } from "./useSosVoice";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import { trackConnection } from "@/lib/connection";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { SosSituation } from "./situations";
import { kalmTargetFor } from "@/components/kalm/sosMap";

/**
 * Fluxo emocional SOS — 6 etapas, sem redirecionamento seco pra Wellness.
 * acolhimento → respiração → prático → continuidade → fechamento → (memória/share)
 */
interface Props {
  situation: SosSituation;
  onBack: () => void;
  onClose: () => void;
  onGoWellness?: () => void;
}

type Step = "acolhimento" | "respiracao" | "pratico" | "continuidade" | "fechamento";

const ICONS = {
  hand: Hand, wind: Wind, heart: Heart,
  moon: Moon, shield: Shield, leaf: Leaf,
  sun: Sun, compass: Compass,
} as const;

const CONTINUITY_ICONS = {
  music: Music2,
  book: BookOpen,
  hug: Heart,
  moon: Moon,
} as const;

const SOSCrisisFlow = ({ situation, onBack, onClose, onGoWellness }: Props) => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const { canUse } = useEntitlement();
  // SOS Emocional exige Premium.
  const isPremium = canUse("sos");
  const [step, setStep] = useState<Step>("acolhimento");
  const [muted, setMuted] = useState(false);
  const [selectedContinuity, setSelectedContinuity] = useState<string | null>(null);
  const [memorySaved, setMemorySaved] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { speak, stop, loading } = useSosVoice();

  const sendFeedback = (key: string, label: string) => {
    if (feedback) return;
    haptic("light");
    sfx("click");
    setFeedback(key);
    try {
      const log = JSON.parse(localStorage.getItem("kidzz_sos_feedback") || "[]");
      log.push({ ts: Date.now(), situation: situation.id, feedback: key, label });
      localStorage.setItem("kidzz_sos_feedback", JSON.stringify(log.slice(-50)));
    } catch { /* noop */ }
    if (key === "continue") {
      setTimeout(() => { onGoWellness?.(); onClose(); }, 600);
    }
  };

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
    sfx("click");
    stop();
    setStep(next);
    if (next === "fechamento") trackConnection("sos_used");
  };

  const saveEmotionalMemory = async () => {
    if (memorySaved) return;
    haptic("success");
    sfx("reward");
    setMemorySaved(true);
    if (!user) return;
    try {
      const closing = situation.closing;
      await supabase.from("memories").insert({
        user_id: user.id,
        type: "sos",
        title: `SOS · ${situation.label}`,
        content: closing
          ? `${closing.title} ${closing.subtitle}`
          : situation.support.parentNote,
        is_special: true,
        metadata: {
          situation_id: situation.id,
          recap: closing?.recap ?? [],
          shareable: closing?.shareable,
        },
      });
      toast({
        title: "Momento salvo 💚",
        description: "Está guardado em Momentos.",
      });
    } catch (err) {
      console.warn("[sos] memory save failed", err);
    }
  };

  const shareMoment = async () => {
    haptic("light");
    sfx("click");
    const text = situation.closing?.shareable ?? situation.support.parentNote;
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({ text: `${text}\n\n— Kidzz` });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n\n— Kidzz`);
        toast({ title: "Copiado", description: "Frase pronta pra compartilhar." });
      }
    } catch {
      /* user cancelled or unsupported */
    }
  };

  const STEPS: Step[] = ["acolhimento", "respiracao", "pratico", "continuidade", "fechamento"];

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
        {STEPS.map((s) => (
          <span
            key={s}
            className="h-1 rounded-full transition-all duration-500"
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

              <motion.p
                className="text-[22px] font-black leading-snug max-w-[280px] mb-3 tracking-tight"
                style={{ color: "hsl(var(--premium-ink))" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {situation.acolhimento.title}
              </motion.p>
              <motion.p
                className="text-[15px] font-medium leading-relaxed max-w-[300px] mb-6 whitespace-pre-line"
                style={{ color: "hsl(var(--premium-ink-soft))" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.7 }}
              >
                {situation.acolhimento.subtitle}
              </motion.p>
              {loading && (
                <span
                  className="text-[11px] font-medium flex items-center gap-1 mb-4"
                  style={{ color: "hsl(var(--premium-ink-soft))" }}
                >
                  <Loader2 size={11} className="animate-spin" /> preparando voz acolhedora…
                </span>
              )}
              <motion.button
                type="button"
                onClick={() => goNext("respiracao")}
                className="px-6 py-3 rounded-full text-white text-[14px] font-black tracking-tight flex items-center gap-1.5 active:scale-95 transition-transform"
                style={{
                  background: `linear-gradient(180deg, hsl(var(--sos-from)), ${situation.tint})`,
                  boxShadow: `0 8px 22px -8px ${situation.tint.replace(")", " / 0.5)")}`,
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.6, duration: 0.5 }}
              >
                {situation.acolhimento.cta} <ChevronRight size={14} />
              </motion.button>
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
                {(isPremium ? situation.practical.tips : situation.practical.tips.slice(0, 1)).map((tip, i) => {
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
              {isPremium ? (
                <button
                  type="button"
                  onClick={() => goNext("continuidade")}
                  className="w-full py-3 rounded-2xl text-white text-[14px] font-black tracking-tight flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                  style={{
                    background: `linear-gradient(180deg, hsl(var(--sos-from)), ${situation.tint})`,
                    boxShadow: `0 8px 22px -8px ${situation.tint.replace(")", " / 0.5)")}`,
                  }}
                >
                  Continuar <ChevronRight size={14} />
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="rounded-2xl p-4 text-center"
                  style={{
                    background: `linear-gradient(135deg, ${situation.tint.replace(")", " / 0.16)")}, hsl(0 0% 100% / 0.5))`,
                    border: "1px solid hsl(0 0% 100% / 0.6)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                  }}
                >
                  <p
                    className="text-[14px] font-black leading-snug"
                    style={{ color: "hsl(var(--premium-ink))" }}
                  >
                    Vocês estão criando algo lindo 💚
                  </p>
                  <p
                    className="text-[12px] font-medium mt-1.5 leading-relaxed"
                    style={{ color: "hsl(var(--premium-ink-soft))" }}
                  >
                    Continue a jornada calmante com técnicas guiadas e playlist contextual.
                  </p>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      haptic("medium");
                      stop();
                      window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context: "sos_journey" } }));
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white font-extrabold text-[12px] shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${situation.tint}, hsl(var(--sos-from)))` }}
                  >
                    🌙 Continuar a jornada
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === "continuidade" && situation.continuity && (
            <motion.div
              key="continuidade"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45 }}
              className="pt-2"
            >
              <motion.p
                className="text-[11px] font-black uppercase tracking-[0.16em] text-center mb-1"
                style={{ color: situation.tint }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              >
                {situation.continuity.eyebrow}
              </motion.p>
              <motion.h3
                className="text-[20px] font-black text-center mb-2 leading-tight max-w-[300px] mx-auto"
                style={{ color: "hsl(var(--premium-ink))" }}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
              >
                {situation.continuity.title}
              </motion.h3>
              <motion.p
                className="text-[12.5px] text-center mb-5 max-w-[280px] mx-auto"
                style={{ color: "hsl(var(--premium-ink-soft))" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.6 }}
              >
                {situation.continuity.subtitle}
              </motion.p>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {situation.continuity.options.map((opt, i) => {
                  const Icon = CONTINUITY_ICONS[opt.iconKey];
                  const isSel = selectedContinuity === opt.title;
                  return (
                    <motion.button
                      key={opt.title}
                      type="button"
                      onClick={() => {
                        haptic("medium");
                        sfx("click");
                        setSelectedContinuity(opt.title);
                      }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 + i * 0.12, duration: 0.45 }}
                      whileTap={{ scale: 0.97 }}
                      className="text-left p-3.5 rounded-2xl relative overflow-hidden"
                      style={{
                        background: isSel
                          ? `linear-gradient(135deg, ${situation.tint.replace(")", " / 0.18)")}, hsl(0 0% 100% / 0.7))`
                          : "hsl(0 0% 100% / 0.82)",
                        border: `1px solid ${isSel ? situation.tint.replace(")", " / 0.55)") : "hsl(0 0% 100% / 0.7)"}`,
                        boxShadow: `0 6px 18px -12px ${situation.tint.replace(")", " / 0.35)")}`,
                        minHeight: 96,
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center mb-1.5"
                        style={{ background: situation.tint.replace(")", " / 0.14)") }}
                      >
                        <Icon size={15} style={{ color: situation.tint }} />
                      </div>
                      <p className="text-[13px] font-black leading-tight" style={{ color: "hsl(var(--premium-ink))" }}>
                        {opt.title}
                      </p>
                      <p className="text-[10.5px] font-medium leading-snug mt-0.5" style={{ color: "hsl(var(--premium-ink-soft))" }}>
                        {opt.desc}
                      </p>
                    </motion.button>
                  );
                })}
              </div>

              <motion.button
                type="button"
                onClick={() => goNext("fechamento")}
                disabled={!selectedContinuity}
                className="w-full py-3 rounded-2xl text-white text-[14px] font-black tracking-tight flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform disabled:opacity-40"
                style={{
                  background: `linear-gradient(180deg, hsl(var(--sos-from)), ${situation.tint})`,
                  boxShadow: `0 8px 22px -8px ${situation.tint.replace(")", " / 0.5)")}`,
                }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }}
              >
                {selectedContinuity ? "Continuar juntos" : "Escolha uma experiência"} <ChevronRight size={14} />
              </motion.button>
            </motion.div>
          )}

          {step === "fechamento" && (
            <motion.div
              key="fechamento"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.55 }}
              className="pt-2 flex flex-col items-center text-center"
            >
              {/* Halo quente de fechamento */}
              <div className="relative flex items-center justify-center mb-5" style={{ width: 120, height: 120 }}>
                <motion.span
                  aria-hidden
                  className="absolute rounded-full"
                  style={{
                    width: 120, height: 120,
                    background: `radial-gradient(circle, ${situation.tint.replace(")", " / 0.35)")}, transparent 70%)`,
                    filter: "blur(20px)",
                  }}
                  animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.85, 0.5] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="relative w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(180deg, hsl(var(--sos-from)) 0%, ${situation.tint} 100%)`,
                    boxShadow: `0 0 28px ${situation.tint.replace(")", " / 0.45)")}, inset 0 2px 8px hsl(0 0% 100% / 0.5)`,
                  }}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 22 }}
                >
                  <Sparkles size={22} className="text-white" />
                </motion.div>
              </div>

              {situation.closing && (
                <>
                  <motion.p
                    className="text-[10px] font-black uppercase tracking-[0.22em] mb-2"
                    style={{ color: situation.tint }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  >
                    {situation.closing.eyebrow}
                  </motion.p>
                  <motion.p
                    className="text-[20px] font-black leading-snug max-w-[300px] mb-3 tracking-tight"
                    style={{ color: "hsl(var(--premium-ink))" }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                  >
                    {situation.closing.title}
                  </motion.p>
                  <motion.p
                    className="text-[14px] font-medium leading-relaxed max-w-[300px] mb-5"
                    style={{ color: "hsl(var(--premium-ink-soft))" }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.1, duration: 0.7 }}
                  >
                    {situation.closing.subtitle}
                  </motion.p>

                  {/* Memória emocional — "Hoje vocês:" */}
                  <motion.div
                    className="w-full p-4 rounded-2xl mb-3 text-left"
                    style={{
                      background: "hsl(0 0% 100% / 0.82)",
                      border: "1px solid hsl(0 0% 100% / 0.7)",
                      boxShadow: `0 8px 20px -14px ${situation.tint.replace(")", " / 0.3)")}`,
                    }}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3.0, duration: 0.6 }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-2" style={{ color: situation.tint }}>
                      ✨ Hoje vocês
                    </p>
                    <ul className="space-y-1.5">
                      {situation.closing.recap.map((r, i) => (
                        <motion.li
                          key={r}
                          className="flex items-center gap-2 text-[13px] font-medium"
                          style={{ color: "hsl(var(--premium-ink))" }}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 3.2 + i * 0.18 }}
                        >
                          <Check size={13} style={{ color: situation.tint }} />
                          {r}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Bilhete pros pais */}
                  <motion.div
                    className="w-full p-4 rounded-2xl mb-3 text-left"
                    style={{
                      background: `linear-gradient(135deg, ${situation.tint.replace(")", " / 0.10)")}, hsl(0 0% 100% / 0.6))`,
                      border: "1px solid hsl(0 0% 100% / 0.7)",
                    }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 3.9, duration: 0.6 }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] mb-1" style={{ color: "hsl(var(--kidzz-green-deep))" }}>
                      Pra você
                    </p>
                    <p className="text-[12.5px] leading-relaxed whitespace-pre-line italic" style={{ color: "hsl(var(--premium-ink))" }}>
                      “{situation.closing.shareable}”
                    </p>
                  </motion.div>

                  {/* Feedback emocional — "Como vocês estão agora?" */}
                  <motion.div
                    className="w-full p-4 rounded-2xl mb-3"
                    style={{
                      background: "hsl(0 0% 100% / 0.78)",
                      border: "1px solid hsl(0 0% 100% / 0.7)",
                    }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 4.1, duration: 0.6 }}
                  >
                    <p
                      className="text-[12.5px] font-black text-center mb-3"
                      style={{ color: "hsl(var(--premium-ink))" }}
                    >
                      Como vocês estão agora?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: "better", emoji: "💚", label: "Melhor" },
                        { key: "still_hard", emoji: "🫂", label: "Ainda difícil" },
                        { key: "helped", emoji: "✨", label: "Ajudou bastante" },
                        { key: "continue", emoji: "🌙", label: "Quero continuar" },
                      ].map((opt) => {
                        const selected = feedback === opt.key;
                        const dimmed = feedback && !selected;
                        return (
                          <motion.button
                            key={opt.key}
                            type="button"
                            onClick={() => sendFeedback(opt.key, opt.label)}
                            whileTap={{ scale: 0.96 }}
                            disabled={!!feedback}
                            className="py-2.5 px-2 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all"
                            style={{
                              background: selected
                                ? `linear-gradient(135deg, ${situation.tint.replace(")", " / 0.22)")}, hsl(0 0% 100% / 0.6))`
                                : "hsl(0 0% 100% / 0.7)",
                              border: selected
                                ? `1px solid ${situation.tint.replace(")", " / 0.55)")}`
                                : "1px solid hsl(0 0% 100% / 0.6)",
                              color: "hsl(var(--premium-ink))",
                              opacity: dimmed ? 0.5 : 1,
                            }}
                          >
                            <span aria-hidden>{opt.emoji}</span>
                            <span className="truncate">{opt.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                    {feedback && (
                      <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-[11px] text-center mt-2.5 font-medium"
                        style={{ color: "hsl(var(--premium-ink-soft))" }}
                      >
                        Obrigado por compartilhar 💚
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Ações de fechamento */}
                  <motion.div
                    className="w-full grid grid-cols-2 gap-2 mb-2"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 4.3, duration: 0.5 }}
                  >
                    <button
                      type="button"
                      onClick={saveEmotionalMemory}
                      disabled={memorySaved}
                      className="py-2.5 rounded-2xl text-[12.5px] font-black flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
                      style={{
                        background: memorySaved ? "hsl(0 0% 100% / 0.5)" : `linear-gradient(180deg, hsl(var(--sos-from)), ${situation.tint})`,
                        color: memorySaved ? "hsl(var(--premium-ink-soft))" : "white",
                        border: "1px solid hsl(0 0% 100% / 0.7)",
                        boxShadow: memorySaved ? "none" : `0 8px 22px -10px ${situation.tint.replace(")", " / 0.55)")}`,
                      }}
                    >
                      {memorySaved ? <><Check size={14} /> Guardado</> : <><BookmarkPlus size={14} /> {situation.closing.saveCta}</>}
                    </button>
                    <button
                      type="button"
                      onClick={shareMoment}
                      className="py-2.5 rounded-2xl text-[12.5px] font-black flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
                      style={{
                        background: "hsl(0 0% 100% / 0.8)",
                        border: "1px solid hsl(0 0% 100% / 0.7)",
                        color: "hsl(var(--premium-ink))",
                      }}
                    >
                      <Share2 size={14} /> Compartilhar
                    </button>
                  </motion.div>

                  {/* Ponte SOS → KALM */}
                  <motion.div
                    className="w-full mt-3 p-4 rounded-3xl text-left relative overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, hsl(150 30% 96%) 0%, hsl(140 35% 88%) 60%, hsl(150 38% 78%) 100%)",
                      border: "1px solid hsl(0 0% 100% / 0.8)",
                      boxShadow: "0 14px 32px -14px hsl(150 35% 25% / 0.45)",
                    }}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 4.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.p
                      className="text-[13px] font-semibold leading-snug mb-1.5"
                      style={{ color: "hsl(150 35% 18%)" }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 4.7, duration: 0.5 }}
                    >
                      Você conseguiu desacelerar este momento.
                    </motion.p>
                    <motion.p
                      className="text-[13px] font-medium leading-snug mb-3"
                      style={{ color: "hsl(150 22% 32%)" }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 5.9, duration: 0.5 }}
                    >
                      Agora podemos cuidar do restante.
                    </motion.p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "linear-gradient(135deg, hsl(150 30% 92%), hsl(150 38% 36%))",
                          boxShadow: "inset 0 2px 8px hsl(0 0% 100% / 0.4)",
                        }}
                      >
                        <Leaf size={20} color="#fff" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-black uppercase tracking-[0.2em]" style={{ color: "hsl(150 35% 24%)" }}>
                          🌿 Continuar no Kalm
                        </p>
                        <p className="text-[11.5px] font-medium leading-snug mt-0.5" style={{ color: "hsl(150 22% 36%)" }}>
                          Experiências guiadas para restaurar calma, conexão e equilíbrio.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        haptic("medium"); sfx("click");
                        const experienceId = kalmTargetFor(situation.id);
                        window.dispatchEvent(new CustomEvent("kidzz:open-kalm", { detail: { experienceId } }));
                        onClose();
                      }}
                      className="mt-3 w-full py-3 rounded-2xl text-white text-[13px] font-black tracking-tight flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
                      style={{
                        background: "linear-gradient(135deg, hsl(150 38% 36%), hsl(150 35% 22%))",
                        boxShadow: "0 10px 28px -12px hsl(150 38% 22% / 0.6)",
                      }}
                    >
                      ✨ Abrir Kalm
                    </button>
                  </motion.div>

                  <motion.button
                    type="button"
                    onClick={() => { haptic("light"); onClose(); }}
                    className="w-full mt-2 py-3 rounded-2xl text-[14px] font-black tracking-tight active:scale-[0.98] transition-transform"
                    style={{
                      background: "hsl(0 0% 100% / 0.7)",
                      border: "1px solid hsl(0 0% 100% / 0.7)",
                      color: "hsl(var(--premium-ink))",
                    }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4.9 }}
                  >
                    {situation.support.closeCta}
                  </motion.button>
                </>
              )}
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
      // feedback respiratório orgânico — apenas no início de in/out
      if (p === "in") haptic("light");
      else if (p === "out") haptic("light");
      const durMs = (p === "in" ? inSec : p === "hold" ? holdSec : outSec) * 1000;
      timer = setTimeout(() => {
        if (p === "in") tick("hold");
        else if (p === "hold") tick("out");
        else {
          setCycle((c) => {
            const next = c + 1;
            if (next >= TARGET_CYCLES) {
              setTimeout(onDone, 800);
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

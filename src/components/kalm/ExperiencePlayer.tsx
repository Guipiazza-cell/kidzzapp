import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Check, Sparkles, Leaf } from "lucide-react";
import { AmbientSoundEngine } from "@/components/dreams/AmbientSoundEngine";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import type { KalmExperience } from "./experiences";

interface Props {
  exp: KalmExperience | null;
  onClose: () => void;
}

/* ───────── helpers ───────── */
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** Mensagem de fechamento emocional por experiência. Cai num default acolhedor. */
const FINALE_COPY: Record<string, { title: string; subtitle: string }> = {
  "pause-1min":               { title: "Pausa concluída.", subtitle: "Um minuto inteiro só pra você. Já é muito." },
  "breathe-wind":             { title: "Sua respiração desacelerou.", subtitle: "O corpo agradece em silêncio." },
  "calm-now":                 { title: "A onda passou.", subtitle: "Você fica. Sempre fica." },
  "wind-down":                { title: "O dia pode descansar agora.", subtitle: "Boa noite começa antes do sono." },
  "parent-pause":             { title: "Você cuidou de quem cuida.", subtitle: "Cinco minutos seus, sem culpa." },
  "too-much":                 { title: "Você sustentou o momento.", subtitle: "Sem perder a conexão. Isso é tudo." },
  "recover-energy":           { title: "Energia recuperada.", subtitle: "Hoje foi pesado. Mas você ficou." },
  "breathe-before-react":     { title: "Você respirou antes de reagir.", subtitle: "Isso já mudou a próxima fala." },
  "reconnect-after-conflict": { title: "O canal está reaberto.", subtitle: "Conexão vale mais que correção." },
  "five-min-together":        { title: "Cinco minutos juntos.", subtitle: "Presença é a memória mais forte." },
  "family-gratitude":         { title: "Gratidão registrada.", subtitle: "Pequenos rituais constroem família." },
  "strengthen-bond":          { title: "Vínculo fortalecido.", subtitle: "Um passo por vez ainda é movimento." },
  "journey-7-nights":         { title: "Boa noite.", subtitle: "Boa noite começa antes do sono." },
  "journey-courage":          { title: "Ele se sentiu seguro.", subtitle: "Porque você estava ali." },
};
const finaleFor = (exp: KalmExperience) =>
  FINALE_COPY[exp.id] ?? { title: "Experiência concluída.", subtitle: "Algo dentro de vocês ficou mais leve." };

const useBreathing = (exp: KalmExperience | null, active: boolean, onDone: () => void) => {
  const b = exp?.breath;
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    if (!b || !active) return;
    setPhase("in"); setCycle(0);
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const tick = (p: "in" | "hold" | "out", c: number) => {
      if (!alive) return;
      setPhase(p); setCycle(c);
      haptic("light");
      const ms = (p === "in" ? b.in : p === "hold" ? b.hold : b.out) * 1000;
      t = setTimeout(() => {
        if (!alive) return;
        if (p === "in") tick("hold", c);
        else if (p === "hold") tick("out", c);
        else {
          const next = c + 1;
          if (next >= b.cycles) { onDone(); return; }
          tick("in", next);
        }
      }, ms);
    };
    tick("in", 0);
    return () => { alive = false; clearTimeout(t); };
  }, [b, active]);
  return { phase, cycle, total: b?.cycles ?? 0 };
};

const ExperiencePlayer = ({ exp, onClose }: Props) => {
  const open = !!exp;
  const engineRef = useRef<AmbientSoundEngine | null>(null);
  const [remain, setRemain] = useState<number>(exp?.timerSec ?? 0);
  const [active, setActive] = useState(true);
  const [stepDone, setStepDone] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (!exp) return;
    setRemain(exp.timerSec ?? 0);
    setActive(true);
    setStepDone(new Set());
    setCompleted(false);
    setFeedback(null);
  }, [exp?.id]);

  // Timer
  useEffect(() => {
    if (!exp || !active || completed) return;
    if (!exp.timerSec) return;
    const iv = setInterval(() => {
      setRemain((r) => {
        const n = Math.max(0, r - 1);
        if (n === 0) setCompleted(true);
        return n;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [exp?.id, active, completed]);

  // Audio
  useEffect(() => {
    if (!exp || exp.kind !== "soundscape" || !exp.audioUrl) return;
    if (!engineRef.current) engineRef.current = new AmbientSoundEngine();
    const eng = engineRef.current as any;
    if (active && !completed) eng?.start?.(exp.id, exp.audioUrl, 0.5);
    else eng?.stop?.(exp.id);
    return () => { eng?.stop?.(exp.id); };
  }, [exp?.id, active, completed]);

  useEffect(() => () => { engineRef.current?.stopAll?.(); }, []);

  const breathing = useBreathing(
    exp && exp.kind === "breathing" ? exp : null,
    active && open && !completed,
    () => { haptic("success"); sfx("complete"); setCompleted(true); }
  );

  // Ritual: detecta conclusão quando todos os passos estão marcados
  useEffect(() => {
    if (!exp || exp.kind !== "ritual" || !exp.steps) return;
    if (!completed && stepDone.size === exp.steps.length && exp.steps.length > 0) {
      haptic("success"); sfx("complete");
      setCompleted(true);
    }
  }, [stepDone, exp, completed]);

  const sendFeedback = (key: string, label: string) => {
    if (feedback || !exp) return;
    haptic("light"); sfx("click");
    setFeedback(key);
    try {
      const log = JSON.parse(localStorage.getItem("kidzz_kalm_feedback") || "[]");
      log.push({ ts: Date.now(), experience: exp.id, feedback: key, label });
      localStorage.setItem("kidzz_kalm_feedback", JSON.stringify(log.slice(-60)));
    } catch { /* noop */ }
    if (key === "continue") {
      // mantém aberto: usuário pode rolar ou fechar. Não força navegação.
    }
  };

  const close = () => {
    haptic("light");
    engineRef.current?.stopAll?.();
    onClose();
  };

  const finale = useMemo(() => (exp ? finaleFor(exp) : null), [exp?.id]);

  if (!exp) return null;

  // Journey: marca como "completo" no botão de marcar dia
  const journeyCompletable = exp.kind === "journey";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="kalm-backdrop"
            className="fixed inset-0 z-[120]"
            style={{ background: "hsl(150 30% 12% / 0.45)", backdropFilter: "blur(10px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            aria-hidden
          />
          <motion.div
            key="kalm-sheet"
            className="fixed inset-x-0 bottom-0 z-[121] flex flex-col"
            style={{
              maxHeight: "94vh",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              background: "linear-gradient(180deg, hsl(48 36% 98%) 0%, hsl(150 28% 94%) 100%)",
              border: "1px solid hsl(0 0% 100% / 0.7)",
              boxShadow: "0 -20px 60px -20px hsl(150 30% 18% / 0.35)",
              paddingBottom: "max(env(safe-area-inset-bottom, 16px), 16px)",
            }}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={exp.title}
          >
            <div className="flex justify-center pt-2.5 pb-1">
              <span className="block w-10 h-1 rounded-full" style={{ background: "hsl(150 15% 65%)" }} />
            </div>

            <header className="flex items-start justify-between px-5 pb-3">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: exp.tint }}>
                  KALM · {exp.duration}
                </p>
                <h2 className="mt-1 text-[22px] font-semibold leading-tight" style={{ color: "hsl(150 35% 18%)", letterSpacing: "-0.01em" }}>
                  {exp.emoji} {exp.title}
                </h2>
                <p className="mt-1 text-[13px]" style={{ color: "hsl(150 12% 40%)" }}>
                  {exp.desc}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90"
                style={{ background: "hsl(0 0% 100% / 0.85)", border: "1px solid hsl(0 0% 100% / 0.7)" }}
                aria-label="Fechar"
              >
                <X size={16} style={{ color: "hsl(150 35% 22%)" }} />
              </button>
            </header>

            {/* Scroll com fundo seguro pra notch + bottom inset */}
            <div
              className="flex-1 min-h-0 overflow-y-auto px-5 pb-8"
              style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}
            >
              {!completed && (
                <>
                  {/* TIMER */}
                  {exp.kind === "timer" && (
                    <div className="flex flex-col items-center text-center pt-2">
                      <motion.div
                        className="relative flex items-center justify-center mb-6"
                        style={{ width: 200, height: 200 }}
                        animate={active ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <span
                          aria-hidden
                          className="absolute rounded-full"
                          style={{
                            width: 200, height: 200,
                            background: `radial-gradient(circle, ${exp.tint.replace(")", " / 0.35)")}, transparent 70%)`,
                            filter: "blur(20px)",
                          }}
                        />
                        <div
                          className="relative w-40 h-40 rounded-full flex items-center justify-center"
                          style={{
                            background: `radial-gradient(circle at 30% 30%, #fff, ${exp.tint})`,
                            boxShadow: `0 30px 60px -30px ${exp.tint}`,
                          }}
                        >
                          <span className="text-[34px] font-semibold tabular-nums" style={{ color: "hsl(150 35% 18%)" }}>
                            {fmt(remain)}
                          </span>
                        </div>
                      </motion.div>
                      <PlayPauseButton active={active} onToggle={() => { haptic("light"); sfx("click"); setActive((a) => !a); }} />
                    </div>
                  )}

                  {/* BREATHING */}
                  {exp.kind === "breathing" && exp.breath && (
                    <div className="flex flex-col items-center text-center pt-2">
                      <p className="text-[12px]" style={{ color: "hsl(150 12% 40%)" }}>
                        Ciclo {Math.min(breathing.cycle + 1, breathing.total)} de {breathing.total}
                      </p>
                      <motion.div
                        className="relative my-6 flex items-center justify-center"
                        style={{ width: 220, height: 220 }}
                      >
                        <motion.div
                          animate={{
                            scale: breathing.phase === "in" ? 1.4 : breathing.phase === "hold" ? 1.4 : 0.85,
                          }}
                          transition={{
                            duration: (breathing.phase === "in" ? exp.breath.in : breathing.phase === "hold" ? exp.breath.hold : exp.breath.out),
                            ease: [0.45, 0, 0.55, 1],
                          }}
                          className="w-32 h-32 rounded-full flex items-center justify-center"
                          style={{
                            background: `radial-gradient(circle at 30% 30%, #fff, ${exp.tint})`,
                            boxShadow: `0 30px 60px -30px ${exp.tint}`,
                          }}
                        >
                          <span className="text-[16px] font-semibold" style={{ color: "hsl(150 35% 18%)" }}>
                            {breathing.phase === "in" ? "Inspira" : breathing.phase === "hold" ? "Segura" : "Solta"}
                          </span>
                        </motion.div>
                      </motion.div>
                      <PlayPauseButton active={active} onToggle={() => { haptic("light"); setActive((a) => !a); }} />
                    </div>
                  )}

                  {/* SOUNDSCAPE */}
                  {exp.kind === "soundscape" && (
                    <div className="flex flex-col items-center text-center pt-2">
                      <motion.div
                        className="relative w-44 h-44 rounded-full flex items-center justify-center mb-5"
                        style={{
                          background: `radial-gradient(circle, ${exp.tint.replace(")", " / 0.45)")}, transparent 70%)`,
                        }}
                        animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <span className="text-[60px]" aria-hidden>{exp.emoji}</span>
                      </motion.div>
                      {exp.timerSec && (
                        <p className="text-[14px] tabular-nums mb-3" style={{ color: "hsl(150 35% 18%)" }}>
                          {fmt(remain)}
                        </p>
                      )}
                      <PlayPauseButton active={active} onToggle={() => { haptic("light"); setActive((a) => !a); }} label={active ? "Pausar som" : "Tocar som"} />
                      <button
                        type="button"
                        onClick={() => { haptic("success"); sfx("complete"); setCompleted(true); }}
                        className="mt-3 text-[12px] font-semibold underline-offset-2 underline"
                        style={{ color: "hsl(150 35% 22%)" }}
                      >
                        Encerrar com gratidão
                      </button>
                    </div>
                  )}

                  {/* RITUAL */}
                  {exp.kind === "ritual" && exp.steps && (
                    <div className="pt-2 space-y-2.5">
                      {exp.steps.map((s, i) => {
                        const done = stepDone.has(i);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              haptic("light"); sfx("click");
                              setStepDone((prev) => {
                                const n = new Set(prev);
                                n.has(i) ? n.delete(i) : n.add(i);
                                return n;
                              });
                            }}
                            className="w-full text-left p-4 rounded-2xl flex items-start gap-3"
                            style={{
                              background: done ? `${exp.tint.replace(")", " / 0.16)")}` : "hsl(0 0% 100% / 0.78)",
                              border: `1px solid ${done ? exp.tint.replace(")", " / 0.45)") : "hsl(0 0% 100% / 0.7)"}`,
                            }}
                          >
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: done ? exp.tint : "hsl(150 12% 88%)", color: done ? "#fff" : "hsl(150 35% 22%)" }}
                            >
                              {done ? <Check size={14} /> : <span className="text-[12px] font-black">{i + 1}</span>}
                            </div>
                            <p className="text-[14px] leading-snug font-medium" style={{ color: "hsl(150 35% 18%)" }}>
                              {s}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* JOURNEY */}
                  {exp.kind === "journey" && (
                    <div className="pt-2">
                      <p className="text-[13px] mb-3 text-center" style={{ color: "hsl(150 12% 40%)" }}>
                        Jornada de {exp.days} dias. Você abre uma prática por dia.
                      </p>
                      <div className="grid grid-cols-7 gap-1.5 mb-4">
                        {Array.from({ length: exp.days ?? 7 }).map((_, i) => (
                          <div
                            key={i}
                            className="aspect-square rounded-2xl flex items-center justify-center text-[13px] font-black"
                            style={{
                              background: i === 0 ? exp.tint : "hsl(150 12% 92%)",
                              color: i === 0 ? "#fff" : "hsl(150 35% 30%)",
                            }}
                          >
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      <div className="p-4 rounded-2xl" style={{ background: "hsl(0 0% 100% / 0.78)", border: "1px solid hsl(0 0% 100% / 0.7)" }}>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: exp.tint }}>
                          Dia 1
                        </p>
                        <p className="mt-1 text-[16px] font-semibold" style={{ color: "hsl(150 35% 18%)" }}>
                          Começar com leveza
                        </p>
                        <p className="mt-1 text-[13px]" style={{ color: "hsl(150 12% 40%)" }}>
                          Hoje a prática é só perceber. Sem objetivo, sem cobrança.
                        </p>
                      </div>
                      {journeyCompletable && (
                        <button
                          type="button"
                          onClick={() => { haptic("success"); sfx("complete"); setCompleted(true); }}
                          className="mt-4 w-full py-3 rounded-2xl text-white font-black text-[13.5px]"
                          style={{ background: `linear-gradient(135deg, ${exp.tint}, hsl(150 38% 26%))` }}
                        >
                          ✨ Concluir prática de hoje
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ───────── GRAND FINALE — fechamento emocional + feedback ───────── */}
              {completed && finale && (
                <motion.div
                  key="finale"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="pt-2 flex flex-col items-center text-center"
                >
                  <div className="relative flex items-center justify-center mb-5" style={{ width: 130, height: 130 }}>
                    <motion.span
                      aria-hidden
                      className="absolute rounded-full"
                      style={{
                        width: 130, height: 130,
                        background: `radial-gradient(circle, ${exp.tint.replace(")", " / 0.4)")}, transparent 70%)`,
                        filter: "blur(20px)",
                      }}
                      animate={{ scale: [1, 1.14, 1], opacity: [0.55, 0.9, 0.55] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="relative w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(180deg, hsl(48 50% 96%), ${exp.tint})`,
                        boxShadow: `0 0 32px ${exp.tint.replace(")", " / 0.5)")}, inset 0 2px 10px hsl(0 0% 100% / 0.55)`,
                      }}
                      initial={{ scale: 0.6 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 180, damping: 22 }}
                    >
                      <Sparkles size={26} className="text-white" />
                    </motion.div>
                  </div>

                  <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-2" style={{ color: exp.tint }}>
                    Fechamento
                  </p>
                  <p
                    className="text-[20px] font-semibold leading-snug max-w-[300px] mb-2 tracking-tight"
                    style={{ color: "hsl(150 35% 18%)" }}
                  >
                    {finale.title}
                  </p>
                  <p
                    className="text-[14px] leading-relaxed max-w-[300px] mb-5"
                    style={{ color: "hsl(150 12% 40%)" }}
                  >
                    {finale.subtitle}
                  </p>

                  {/* Feedback emocional */}
                  <div
                    className="w-full p-4 rounded-2xl mb-3"
                    style={{ background: "hsl(0 0% 100% / 0.8)", border: "1px solid hsl(0 0% 100% / 0.7)" }}
                  >
                    <p className="text-[12.5px] font-black text-center mb-3" style={{ color: "hsl(150 35% 18%)" }}>
                      Como vocês estão agora?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: "better",     emoji: "💚", label: "Melhor" },
                        { key: "still_hard", emoji: "🫂", label: "Ainda difícil" },
                        { key: "helped",     emoji: "✨", label: "Ajudou bastante" },
                        { key: "continue",   emoji: "🌙", label: "Quero continuar" },
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
                                ? `linear-gradient(135deg, ${exp.tint.replace(")", " / 0.22)")}, hsl(0 0% 100% / 0.6))`
                                : "hsl(0 0% 100% / 0.7)",
                              border: selected
                                ? `1px solid ${exp.tint.replace(")", " / 0.55)")}`
                                : "1px solid hsl(0 0% 100% / 0.6)",
                              color: "hsl(150 35% 18%)",
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
                      <p className="text-[11px] text-center mt-2.5 font-medium" style={{ color: "hsl(150 12% 40%)" }}>
                        Obrigado por compartilhar 💚
                      </p>
                    )}
                  </div>

                  {/* Próximo passo */}
                  <button
                    type="button"
                    onClick={close}
                    className="w-full py-3 rounded-2xl text-white font-black text-[13.5px] flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    style={{
                      background: `linear-gradient(135deg, ${exp.tint}, hsl(150 38% 26%))`,
                      boxShadow: `0 10px 28px -12px ${exp.tint.replace(")", " / 0.55)")}`,
                    }}
                  >
                    <Leaf size={14} /> Encerrar com calma
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const PlayPauseButton = ({ active, onToggle, label }: { active: boolean; onToggle: () => void; label?: string }) => (
  <button
    type="button"
    onClick={onToggle}
    className="mt-2 px-6 h-12 rounded-full flex items-center gap-2 font-semibold text-[14px]"
    style={{ background: "hsl(150 35% 22%)", color: "#fff" }}
  >
    {active ? <Pause size={16} /> : <Play size={16} />}
    {label ?? (active ? "Pausar" : "Retomar")}
  </button>
);

export default ExperiencePlayer;

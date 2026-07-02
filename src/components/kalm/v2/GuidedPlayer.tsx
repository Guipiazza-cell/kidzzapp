/**
 * KALM v2 — tela cheia de execução guiada.
 * Suporta breath, hum, glitter, heart, scan, steps.
 * `prefers-reduced-motion` → fallback texto + timer.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { X, Heart } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import type { Activity } from "./data";
import { MOTOR_TINT } from "./data";
import { useBadges, useKalmStreak } from "./state";

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(m.matches);
    handler();
    m.addEventListener?.("change", handler);
    return () => m.removeEventListener?.("change", handler);
  }, []);
  return reduced;
};

interface Props {
  activity: Activity | null;
  onClose: () => void;
  onSaveMoment?: (a: Activity) => void;
}

const PHASE_BREATH = [
  { p: "Inspire", ms: 4000, scale: 1.4 },
  { p: "Segure",  ms: 2000, scale: 1.4 },
  { p: "Solte",   ms: 6000, scale: 1.0 },
];

const BreathingCircle = ({ tint, reduced }: { tint: string; reduced: boolean }) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setI((p) => (p + 1) % PHASE_BREATH.length), PHASE_BREATH[i].ms);
    return () => clearTimeout(t);
  }, [i]);
  const phase = PHASE_BREATH[i];
  if (reduced) {
    return (
      <div className="text-center">
        <p className="text-[26px] font-semibold" style={{ color: tint }}>{phase.p}</p>
        <p className="text-[14px] mt-1" style={{ color: "#5A6660" }}>{Math.round(phase.ms / 1000)}s</p>
      </div>
    );
  }
  return (
    <div className="relative w-[220px] h-[220px] flex items-center justify-center">
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${tint}55, transparent 70%)`,
          filter: "blur(20px)",
          transform: `scale(${phase.scale})`,
          transition: `transform ${phase.ms}ms cubic-bezier(.4,0,.2,1)`,
        }}
      />
      <div
        className="rounded-full flex items-center justify-center"
        style={{
          width: 140, height: 140,
          background: `linear-gradient(135deg, ${tint}cc, ${tint})`,
          transform: `scale(${phase.scale})`,
          transition: `transform ${phase.ms}ms cubic-bezier(.4,0,.2,1)`,
          boxShadow: `0 20px 50px -10px ${tint}88, inset 0 2px 8px rgba(255,255,255,.4)`,
        }}
      >
        <span className="text-white font-semibold text-[18px]">{phase.p}</span>
      </div>
    </div>
  );
};

const GlitterJar = ({ tint }: { tint: string }) => {
  const dots = useMemo(
    () => Array.from({ length: 30 }, (_, i) => ({
      x: (Math.sin(i * 1.7) * 0.5 + 0.5) * 100,
      d: 4 + (i % 4),
      delay: i * 0.08,
    })),
    [],
  );
  return (
    <div className="relative w-[180px] h-[260px] rounded-[36px] overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${tint}33, ${tint}22)`, border: `2px solid ${tint}66` }}>
      {dots.map((d, i) => (
        <span key={i} aria-hidden className="absolute rounded-full"
          style={{
            width: d.d, height: d.d, left: `${d.x}%`, top: "0%",
            background: `linear-gradient(135deg, #FFE08A, ${tint})`,
            boxShadow: `0 0 6px ${tint}aa`,
            animation: `kalm-glitter-fall ${5 + (i % 3)}s cubic-bezier(.4,0,.2,1) ${d.delay}s infinite`,
          }} />
      ))}
      <style>{`
        @keyframes kalm-glitter-fall {
          0% { transform: translateY(-10%); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(110%); opacity: .3; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="kalm-glitter-fall"] { animation: none !important; opacity: .5; }
        }
      `}</style>
    </div>
  );
};

const HumWaves = ({ tint }: { tint: string }) => (
  <div className="relative w-[220px] h-[220px] flex items-center justify-center">
    {[0, 1, 2].map((i) => (
      <span key={i} aria-hidden className="absolute rounded-full"
        style={{
          width: 80, height: 80,
          border: `2px solid ${tint}`,
          animation: `kalm-wave 2.4s ease-out ${i * 0.8}s infinite`,
        }} />
    ))}
    <div className="relative w-20 h-20 rounded-full flex items-center justify-center text-white text-[22px] font-semibold"
      style={{ background: `linear-gradient(135deg, ${tint}cc, ${tint})` }}>mmm</div>
    <style>{`
      @keyframes kalm-wave {
        0% { transform: scale(1); opacity: .7; }
        100% { transform: scale(2.6); opacity: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        [style*="kalm-wave"] { animation: none !important; }
      }
    `}</style>
  </div>
);

const HeartBeat = ({ tint }: { tint: string }) => (
  <div className="w-[180px] h-[180px] flex items-center justify-center">
    <Heart size={120} fill={tint} color={tint}
      style={{ animation: "kalm-beat 1.2s ease-in-out infinite" }} />
    <style>{`
      @keyframes kalm-beat {
        0%, 100% { transform: scale(1); }
        20% { transform: scale(1.12); }
        40% { transform: scale(1); }
        60% { transform: scale(1.08); }
      }
      @media (prefers-reduced-motion: reduce) {
        [style*="kalm-beat"] { animation: none !important; }
      }
    `}</style>
  </div>
);

const GuidedPlayer = ({ activity, onClose, onSaveMoment }: Props) => {
  const reduced = usePrefersReducedMotion();
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);
  const { grant } = useBadges();
  const { markToday } = useKalmStreak();

  useEffect(() => {
    if (!activity) return;
    setStepIdx(0); setDone(false);
    startedRef.current = false;
  }, [activity?.id]);

  useEffect(() => {
    if (!activity || startedRef.current) return;
    startedRef.current = true;
    markToday();
    grant("folha-calma");
  }, [activity, markToday, grant]);

  if (!activity) return null;
  const tint = MOTOR_TINT[activity.motor];
  const totalSteps = activity.steps.length;
  const currentStep = activity.steps[stepIdx];

  const advance = () => {
    haptic("light"); sfx("click");
    if (stepIdx < totalSteps - 1) setStepIdx(stepIdx + 1);
    else setDone(true);
  };

  const renderAnimation = () => {
    switch (activity.kind) {
      case "breath": return <BreathingCircle tint={tint} reduced={reduced} />;
      case "hum":    return <HumWaves tint={tint} />;
      case "glitter":return <GlitterJar tint={tint} />;
      case "heart":  return <HeartBeat tint={tint} />;
      default:       return <BreathingCircle tint={tint} reduced={reduced} />;
    }
  };

  return (
    <div role="dialog" aria-label={activity.title}
      className="fixed inset-0 z-[200] flex flex-col"
      style={{
        background: `linear-gradient(180deg, ${tint}22, #FFFCF8 60%)`,
        fontFamily: "'Nunito', system-ui, sans-serif",
      }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-[max(16px,env(safe-area-inset-top))] pb-3">
        <p className="text-[12px] font-semibold" style={{ color: "#5A6660" }}>
          Melhor com o pai ou a mãe do lado. 💚
        </p>
        <button onClick={onClose} aria-label="Fechar"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white/70 backdrop-blur active:scale-95"
          style={{ border: "1px solid rgba(42,37,32,0.10)" }}>
          <X size={18} style={{ color: "#2A2520" }} />
        </button>
      </div>

      {!done && (
        <>
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
            {renderAnimation()}
            <p className="text-center font-semibold text-[20px] leading-snug max-w-[320px]"
              style={{ color: "#2A2520", fontFamily: "'Nunito', system-ui, sans-serif" }}>
              {currentStep}
            </p>
            <div className="flex items-center gap-1.5">
              {activity.steps.map((_, i) => (
                <span key={i} className="rounded-full transition-all"
                  style={{
                    width: i === stepIdx ? 24 : 6, height: 6,
                    background: i <= stepIdx ? tint : `${tint}33`,
                  }} />
              ))}
            </div>
          </div>
          <div className="px-5 pb-[max(24px,env(safe-area-inset-bottom))]">
            <button onClick={advance}
              className="w-full h-14 rounded-full text-white font-bold text-[16px] active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${tint}, ${tint}dd)`,
                boxShadow: `0 14px 30px -8px ${tint}88`,
              }}>
              {stepIdx < totalSteps - 1 ? "Continuar" : "Terminar"}
            </button>
          </div>
        </>
      )}

      {done && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <h2 className="text-center text-[26px] font-semibold leading-tight"
            style={{ color: "#2A2520", fontFamily: "'Nunito', system-ui, sans-serif" }}>
            Como você está agora?
          </h2>
          <div className="flex gap-3">
            {[{ e: "😌", l: "Melhor" }, { e: "🙂", l: "Igual" }, { e: "🤗", l: "Conectado" }].map((m) => (
              <button key={m.l}
                onClick={() => { haptic("light"); onSaveMoment?.(activity); onClose(); }}
                className="flex flex-col items-center gap-1 w-24 h-24 rounded-2xl bg-white/80 backdrop-blur active:scale-95"
                style={{ border: "1px solid rgba(42,37,32,0.10)" }}>
                <span className="text-[34px]">{m.e}</span>
                <span className="text-[12px] font-semibold" style={{ color: "#2A2520" }}>{m.l}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 w-full max-w-sm">
            <button onClick={() => { onSaveMoment?.(activity); onClose(); }}
              className="w-full h-12 rounded-full text-white font-bold"
              style={{ background: `linear-gradient(135deg, ${tint}, ${tint}dd)` }}>
              Guardar este momento
            </button>
            <button onClick={() => { setStepIdx(0); setDone(false); }}
              className="w-full h-12 rounded-full font-semibold bg-white/80"
              style={{ color: "#2A2520", border: "1px solid rgba(42,37,32,0.10)" }}>
              Fazer de novo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidedPlayer;

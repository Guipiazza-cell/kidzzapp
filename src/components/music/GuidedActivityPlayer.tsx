import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Share2, RotateCw, Save, Play, Pause } from "lucide-react";
import LivingForest from "./LivingForest";
import { useTTS } from "@/hooks/useTTS";
import { useMemories } from "@/hooks/useMemories";
import { addXp } from "@/lib/dailyMission";
import { showXpGained } from "@/components/flow/XpToast";
import { FONT, SERIF, R, PAD } from "@/lib/premiumUi";

export interface GuidedActivity {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  ageRange: string;
  tags: string[];
  kind: "sing" | "clap" | "dance" | "listen" | "play";
  instruction: string;
  slotImg: string;
  slotAudio: string;
  accent: string; // hsl triplet
  parentMark?: boolean;
}

/** Capa premium 3D por atividade (public/exemplos/assets/musica-v2/act-icons) */
const activityCover = (id: string) =>
  `/exemplos/assets/musica-v2/act-icons/${id}.png`;

/** Ícones 3D premium dos bichinhos */
const ANIMAL_ICON = (id: string) =>
  `/exemplos/assets/musica-v2/animal-icons/${id}.png`;

interface Props {
  activity: GuidedActivity;
  childName: string;
  onClose: () => void;
}

/** Sequência real de bichinhos — o que a criança imita */
const ANIMALS = [
  { id: "gato", name: "Gato", emoji: "🐱", sound: "Miau, miau!", tip: "Faz a boca miudinha e faz miau!" },
  { id: "cao", name: "Cachorro", emoji: "🐶", sound: "Au au!", tip: "Abre a boca e late comigo!" },
  { id: "vaca", name: "Vaca", emoji: "🐮", sound: "Muuu!", tip: "Som grave e longo: muuu!" },
  { id: "pato", name: "Pato", emoji: "🦆", sound: "Quá quá!", tip: "Bico para frente: quá quá!" },
  { id: "galinha", name: "Galinha", emoji: "🐔", sound: "Có có có!", tip: "Rapidinho: có có có!" },
  { id: "leao", name: "Leão", emoji: "🦁", sound: "Roooar!", tip: "Peito cheio e ruge forte!" },
  { id: "sapo", name: "Sapo", emoji: "🐸", sound: "Croac croac!", tip: "Bochechas cheias: croac!" },
  { id: "ovelha", name: "Ovelha", emoji: "🐑", sound: "Bééé!", tip: "Som fofo: bééé!" },
] as const;

const CLAP_BEATS = [
  { emoji: "👏", label: "Uma palma", tip: "Bate uma vez!" },
  { emoji: "👏👏", label: "Duas palmas", tip: "Bate duas vezes!" },
  { emoji: "🙌", label: "Palmas no alto", tip: "Bate as mãos lá em cima!" },
  { emoji: "🦵", label: "Joelho", tip: "Bate no joelho no ritmo!" },
] as const;

const DANCE_MOVES = [
  { emoji: "🐸", label: "Sapo", tip: "Pula como sapo!", icon: ANIMAL_ICON("sapo") },
  { emoji: "🐦", label: "Pássaro", tip: "Abre os braços e voa!", icon: ANIMAL_ICON("pato") },
  { emoji: "🐍", label: "Cobrinha", tip: "Rasteja devagar no chão!" },
  { emoji: "🐻", label: "Urso", tip: "Anda pesado, pesado!", icon: ANIMAL_ICON("leao") },
  { emoji: "🐰", label: "Coelho", tip: "Pula rapidinho!", icon: ANIMAL_ICON("ovelha") },
] as const;

const INSTRUMENTS = [
  { emoji: "🥁", label: "Tambor", tip: "Toca o ritmo no peito!" },
  { emoji: "🎸", label: "Violão", tip: "Dedilha no ar!" },
  { emoji: "🎺", label: "Trompete", tip: "Faz o som de trompete!" },
  { emoji: "🎹", label: "Piano", tip: "Dedos dançando no ar!" },
] as const;

type StepCard = {
  emoji: string;
  /** Ícone 3D premium — se existir, substitui o emoji na UI */
  icon?: string;
  label: string;
  tip: string;
  sound?: string;
};

function stepsForActivity(id: string, kind: GuidedActivity["kind"]): StepCard[] {
  if (id === "cancoes-animais" || id === "danca-bichos") {
    return ANIMALS.map((a) => ({
      emoji: a.emoji,
      icon: ANIMAL_ICON(a.id),
      label: a.name,
      tip: a.tip,
      sound: a.sound,
    }));
  }
  if (kind === "clap") return CLAP_BEATS.map((b) => ({ ...b }));
  if (kind === "dance") return DANCE_MOVES.map((m) => ({ ...m }));
  if (kind === "listen" || id === "instrumentos-mundo") {
    return INSTRUMENTS.map((i) => ({ ...i }));
  }
  // sing / play genérico com mais vida
  return [
    { emoji: "🎵", label: "Vamos!", tip: "Canta junto comigo!" },
    { emoji: "🎤", label: "Sua vez", tip: "Solta a voz!" },
    { emoji: "🌟", label: "Mais uma", tip: "Com energia!" },
    { emoji: "💛", label: "Final", tip: "Última com força!" },
  ];
}

const GuidedActivityPlayer = ({ activity, childName, onClose }: Props) => {
  const [phase, setPhase] = useState<"intro" | "playing" | "finished">("intro");
  const [stepIdx, setStepIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<number | null>(null);
  const { speak, stop } = useTTS();
  const { addMemory } = useMemories();

  const steps = useMemo(
    () => stepsForActivity(activity.id, activity.kind),
    [activity.id, activity.kind],
  );
  const isAnimals =
    activity.id === "cancoes-animais" || activity.id === "danca-bichos";

  const gradient = `linear-gradient(145deg, hsl(${activity.accent} / 0.98), hsl(${activity.accent} / 0.55))`;
  const current = steps[stepIdx] ?? steps[0];
  const cover = activityCover(activity.id);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const announceStep = (i: number) => {
    const s = steps[i];
    if (!s) return;
    const line = s.sound
      ? `${s.label}! ${s.sound} ${s.tip}`
      : `${s.label}. ${s.tip}`;
    try {
      speak(line, { rate: 0.9 });
    } catch {
      /* noop */
    }
  };

  const start = () => {
    clearTimer();
    stop();
    setPhase("playing");
    setStepIdx(0);
    announceStep(0);
    // Troca de bicho/passo a cada ~5s
    timerRef.current = window.setInterval(() => {
      setStepIdx((prev) => {
        const next = prev + 1;
        if (next >= steps.length) {
          // reinicia o ciclo (atividade longa) em vez de travar no último
          announceStep(0);
          return 0;
        }
        announceStep(next);
        return next;
      });
    }, 5200) as unknown as number;
  };

  const finish = () => {
    clearTimer();
    stop();
    setPhase("finished");
    try {
      const { gained } = addXp("music");
      showXpGained(gained, "música");
    } catch {
      /* noop */
    }
  };

  useEffect(
    () => () => {
      clearTimer();
      stop();
    },
    [stop],
  );

  const handleSave = async () => {
    try {
      await addMemory({
        kind: "music" as any,
        title: activity.title,
        content: `${childName} viveu "${activity.title}" — ${activity.subtitle}`,
        emoji: isAnimals ? "🐾" : "🎶",
      } as any);
      setSaved(true);
    } catch {
      setSaved(true);
    }
  };

  const handleShare = async () => {
    const text = `🎶 ${childName} adorou "${activity.title}" no Kidzz!`;
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title: activity.title, text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      /* noop */
    }
  };

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden relative min-h-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ fontFamily: FONT }}
    >
      <LivingForest variant="light">
        {/* Header */}
        <div
          className="absolute top-0 left-0 right-0 z-30 flex items-center gap-2"
          style={{
            paddingTop: "max(env(safe-area-inset-top, 12px), 12px)",
            paddingLeft: PAD,
            paddingRight: PAD,
            paddingBottom: 8,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="glass-island min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full"
            aria-label="Fechar"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div className="glass-island flex-1 flex items-center justify-center px-3.5 py-2 rounded-full">
            <p className="text-[12px] font-extrabold text-gray-800 truncate">
              Melhor com o pai ou a mãe do lado
            </p>
          </div>
        </div>

        <div
          className="flex-1 min-h-0 overflow-y-auto flex flex-col"
          style={{
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)",
            paddingLeft: PAD,
            paddingRight: PAD,
          }}
        >
          {/* Hero */}
          <div
            className="relative w-full overflow-hidden shadow-xl mb-4"
            style={{
              borderRadius: R.card,
              border: "0.5px solid rgba(255,255,255,.55)",
              background: gradient,
              minHeight: phase === "playing" ? 280 : 200,
              transition: "min-height .3s ease",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10 pointer-events-none" />
            <div className="relative h-full flex flex-col p-5" style={{ minHeight: "inherit" }}>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-white/90">
                  {activity.minutes} min · {activity.ageRange}
                </p>
                <h1
                  style={{
                    margin: "4px 0 0",
                    fontFamily: SERIF,
                    fontWeight: 600,
                    fontSize: 24,
                    color: "#fff",
                    lineHeight: 1.15,
                    textShadow: "0 2px 12px rgba(0,0,0,.2)",
                  }}
                >
                  {activity.title}
                </h1>
                <p className="text-[13px] font-semibold text-white/92 mt-1">{activity.subtitle}</p>
              </div>

              {/* Bicho / passo atual — grande e central */}
              <div className="flex-1 flex flex-col items-center justify-center py-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={phase === "playing" ? current.label : "intro"}
                    initial={{ opacity: 0, scale: 0.7, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -8 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    className="flex flex-col items-center"
                  >
                    <div
                      style={{
                        width: phase === "playing" ? 156 : 112,
                        height: phase === "playing" ? 156 : 112,
                        borderRadius: 36,
                        display: "grid",
                        placeItems: "center",
                        fontSize: phase === "playing" ? 88 : 56,
                        lineHeight: 1,
                        background: "rgba(255,255,255,.28)",
                        border: "1.5px solid rgba(255,255,255,.55)",
                        boxShadow: "0 16px 36px rgba(0,0,0,.18), 0 1px 0 rgba(255,255,255,.5) inset",
                        backdropFilter: "blur(8px)",
                        overflow: "hidden",
                      }}
                    >
                      {phase === "playing" ? (
                        current.icon ? (
                          <img
                            src={current.icon}
                            alt={current.label}
                            width={156}
                            height={156}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                            draggable={false}
                          />
                        ) : (
                          current.emoji
                        )
                      ) : (
                        <img
                          src={cover}
                          alt=""
                          width={112}
                          height={112}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          draggable={false}
                        />
                      )}
                    </div>
                    {phase === "playing" && (
                      <>
                        <p
                          style={{
                            margin: "14px 0 0",
                            fontFamily: SERIF,
                            fontWeight: 600,
                            fontSize: 28,
                            color: "#fff",
                            textShadow: "0 2px 12px rgba(0,0,0,.25)",
                          }}
                        >
                          {current.label}
                        </p>
                        {current.sound && (
                          <p
                            style={{
                              margin: "4px 0 0",
                              fontSize: 20,
                              fontWeight: 900,
                              color: "rgba(255,255,255,.95)",
                              letterSpacing: "0.02em",
                            }}
                          >
                            {current.sound}
                          </p>
                        )}
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {phase === "playing" && (
                <div className="flex justify-center gap-1.5 pb-1">
                  {steps.map((s, i) => (
                    <span
                      key={s.label}
                      style={{
                        width: i === stepIdx ? 18 : 7,
                        height: 7,
                        borderRadius: 99,
                        background: i === stepIdx ? "#fff" : "rgba(255,255,255,.4)",
                        transition: "width .25s",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Instrução do passo atual */}
          <div
            style={{
              borderRadius: R.card,
              background: "rgba(255,255,255,.9)",
              border: "0.5px solid rgba(255,255,255,.85)",
              boxShadow: "0 10px 28px rgba(40,50,30,.1)",
              padding: "18px 16px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 20,
                color: "#2A2418",
                lineHeight: 1.35,
              }}
            >
              {phase === "playing" ? current.tip : activity.instruction}
            </p>
            {phase === "intro" && isAnimals && (
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#7A6A50",
                }}
              >
                Vão aparecer {steps.length} bichinhos. Imite o som de cada um!
              </p>
            )}
          </div>

          {/* Preview fila de bichos no intro */}
          {phase === "intro" && isAnimals && (
            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                padding: "14px 2px 4px",
                scrollbarWidth: "none",
              }}
            >
              {steps.map((s) => (
                <div
                  key={s.label}
                  style={{
                    flex: "none",
                    width: 64,
                    padding: "10px 6px",
                    borderRadius: 18,
                    background: "rgba(255,255,255,.75)",
                    border: "0.5px solid rgba(255,255,255,.9)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 28, lineHeight: 1 }}>{s.emoji}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#3A3220", marginTop: 4 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex-1" />

          {/* Controles */}
          <AnimatePresence mode="wait">
            {phase === "intro" && (
              <motion.button
                key="intro"
                type="button"
                onClick={start}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-5 rounded-3xl py-4 flex items-center justify-center gap-3 text-white text-[17px] font-black shadow-2xl"
                style={{ background: gradient, minHeight: 52 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Play size={22} className="fill-white" />
                {isAnimals ? "Ver os bichinhos" : "Começar"}
              </motion.button>
            )}
            {phase === "playing" && (
              <motion.button
                key="playing"
                type="button"
                onClick={finish}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-5 rounded-3xl py-4 flex items-center justify-center gap-3 bg-white/90 border border-gray-200 text-gray-800 text-[16px] font-black shadow-lg"
                style={{ minHeight: 52 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Pause size={20} />
                Terminar
              </motion.button>
            )}
            {phase === "finished" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 space-y-3"
              >
                <div className="rounded-3xl p-4 text-center text-white shadow-xl" style={{ background: gradient }}>
                  <p className="font-display text-[22px] font-semibold">Como foi?</p>
                  <p className="text-[13px] font-semibold text-white/90 mt-1">
                    Guarda esse momento com {childName}.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-2xl bg-white/90 border border-white/70 py-3 flex flex-col items-center gap-1 shadow"
                  >
                    <Save size={20} className="text-amber-600" />
                    <span className="text-[12px] font-black text-gray-800">
                      {saved ? "Guardado" : "Guardar"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="rounded-2xl bg-white/90 border border-white/70 py-3 flex flex-col items-center gap-1 shadow"
                  >
                    <Share2 size={20} className="text-amber-600" />
                    <span className="text-[12px] font-black text-gray-800">Compartilhar</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPhase("intro");
                    setStepIdx(0);
                  }}
                  className="w-full rounded-2xl bg-white/70 border border-white/60 py-3 flex items-center justify-center gap-2 text-gray-700 text-[13px] font-black"
                >
                  <RotateCw size={16} />
                  Fazer de novo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LivingForest>
    </motion.div>
  );
};

export default GuidedActivityPlayer;

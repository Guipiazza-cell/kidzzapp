import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Share2, RotateCw, Save, Play, Pause } from "lucide-react";
import LivingForest from "./LivingForest";
import { useTTS } from "@/hooks/useTTS";
import { useMemories } from "@/hooks/useMemories";
import { addXp } from "@/lib/dailyMission";
import { showXpGained } from "@/components/flow/XpToast";

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

const KIND_EMOJI: Record<GuidedActivity["kind"], string> = {
  sing: "🎤", clap: "👏", dance: "💃", listen: "🎧", play: "🥁",
};

interface Props {
  activity: GuidedActivity;
  childName: string;
  onClose: () => void;
}

const GuidedActivityPlayer = ({ activity, childName, onClose }: Props) => {
  const [phase, setPhase] = useState<"intro" | "playing" | "finished">("intro");
  const [pulse, setPulse] = useState(false);
  const [saved, setSaved] = useState(false);
  const beatRef = useRef<number | null>(null);
  const { speak, stop } = useTTS();
  const { addMemory } = useMemories();

  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const gradient = `linear-gradient(135deg, hsl(${activity.accent} / 0.95), hsl(${activity.accent} / 0.55))`;

  const start = () => {
    setPhase("playing");
    try { speak(`${activity.instruction}`, { rate: 0.92 }); } catch {}
    // beat visual (não substitui áudio real do slot)
    if (!reduceMotion) {
      beatRef.current = window.setInterval(() => setPulse((p) => !p), 500) as unknown as number;
    }
  };

  const finish = () => {
    if (beatRef.current) { clearInterval(beatRef.current); beatRef.current = null; }
    stop();
    setPhase("finished");
    try {
      const { gained } = addXp("music");
      showXpGained(gained, "música");
    } catch {}
  };

  useEffect(() => () => {
    if (beatRef.current) clearInterval(beatRef.current);
    stop();
  }, [stop]);

  const handleSave = async () => {
    try {
      await addMemory({
        kind: "music" as any,
        title: activity.title,
        content: `${childName} viveu "${activity.title}" — ${activity.subtitle}`,
        emoji: KIND_EMOJI[activity.kind],
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
    } catch {}
  };

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden relative min-h-0"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <LivingForest variant="light">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-2 px-3 pb-2"
          style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 12px)" }}>
          <button
            onClick={onClose}
            className="glass-island min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full"
            aria-label="Fechar"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div className="glass-island flex-1 flex items-center justify-center px-3.5 py-2 rounded-full">
            <p className="text-[12px] font-extrabold text-gray-800 truncate">
              Melhor com o pai ou a mãe do lado. 💚
            </p>
          </div>
        </div>

        <div
          className="flex-1 min-h-0 overflow-y-auto px-4 flex flex-col"
          style={{
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 68px)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)",
          }}
        >
          {/* Hero — mesmo degradê */}
          <div
            className="relative w-full aspect-[16/10] rounded-[28px] overflow-hidden border border-white/50 shadow-xl mb-4"
            style={{ background: gradient }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 pointer-events-none" />
            <div className="relative h-full flex flex-col justify-between p-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-white/85">
                  {activity.minutes} min · {activity.ageRange}
                </p>
                <h1 className="font-display text-[26px] font-semibold text-white leading-tight drop-shadow">
                  {activity.title}
                </h1>
                <p className="text-[13px] font-semibold text-white/90 mt-1">{activity.subtitle}</p>
              </div>
              <motion.div
                className="self-center text-8xl drop-shadow-2xl"
                animate={phase === "playing" && !reduceMotion ? { scale: pulse ? 1.15 : 1, rotate: pulse ? 4 : -4 } : {}}
                transition={{ duration: 0.3 }}
              >
                {KIND_EMOJI[activity.kind]}
              </motion.div>
            </div>
          </div>

          {/* Instrução grande */}
          <div className="rounded-3xl bg-white/85 backdrop-blur border border-white/60 p-5 text-center shadow">
            <p className="font-display text-[22px] font-semibold text-gray-800 leading-snug">
              {activity.instruction}
            </p>
          </div>

          <div className="flex-1" />

          {/* Controles */}
          <AnimatePresence mode="wait">
            {phase === "intro" && (
              <motion.button
                key="intro"
                onClick={start}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-5 rounded-3xl py-4 flex items-center justify-center gap-3 text-white text-[17px] font-black shadow-2xl"
                style={{ background: gradient }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              >
                <Play size={22} className="fill-white" />
                Começar
              </motion.button>
            )}
            {phase === "playing" && (
              <motion.button
                key="playing"
                onClick={finish}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-5 rounded-3xl py-4 flex items-center justify-center gap-3 bg-white/90 border border-gray-200 text-gray-800 text-[16px] font-black shadow-lg"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              >
                <Pause size={20} />
                Terminar
              </motion.button>
            )}
            {phase === "finished" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="mt-5 space-y-3"
              >
                <div className="rounded-3xl p-4 text-center text-white shadow-xl" style={{ background: gradient }}>
                  <p className="font-display text-[22px] font-semibold">Como foi? 💚</p>
                  <p className="text-[13px] font-semibold text-white/90 mt-1">
                    Guarda esse momento com {childName}.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSave}
                    className="rounded-2xl bg-white/90 border border-white/70 py-3 flex flex-col items-center gap-1 shadow"
                  >
                    <Save size={20} className="text-amber-600" />
                    <span className="text-[12px] font-black text-gray-800">
                      {saved ? "Guardado ✓" : "Guardar"}
                    </span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="rounded-2xl bg-white/90 border border-white/70 py-3 flex flex-col items-center gap-1 shadow"
                  >
                    <Share2 size={20} className="text-amber-600" />
                    <span className="text-[12px] font-black text-gray-800">Compartilhar</span>
                  </button>
                </div>
                <button
                  onClick={() => setPhase("intro")}
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

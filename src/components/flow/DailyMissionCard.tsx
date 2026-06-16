import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Music2, MessageCircle, BookOpen, Check, Sparkles } from "lucide-react";
import { getMission, getMissionProgress, markRewarded, type MissionState } from "@/lib/dailyMission";

interface Props {
  childName: string;
  onAction?: (target: "music" | "question" | "story") => void;
}

const STEPS: { key: keyof Pick<MissionState, "music" | "question" | "story">; icon: typeof Music2; label: string; color: string; }[] = [
  { key: "music",    icon: Music2,        label: "Ouvir 1 música",      color: "text-pink-500" },
  { key: "question", icon: MessageCircle, label: "Responder 1 pergunta", color: "text-amber-500" },
  { key: "story",    icon: BookOpen,      label: "Ver 1 história",       color: "text-purple-500" },
];

export default function DailyMissionCard({ childName, onAction }: Props) {
  const [mission, setMission] = useState<MissionState>(getMission());
  const [showCelebration, setShowCelebration] = useState(false);

  // Re-sync from storage every few seconds (cheap) so cross-screen completion reflects
  useEffect(() => {
    const tick = () => setMission(getMission());
    const iv = setInterval(tick, 1500);
    window.addEventListener("focus", tick);
    return () => { clearInterval(iv); window.removeEventListener("focus", tick); };
  }, []);

  const progress = getMissionProgress();
  const isComplete = progress.done === progress.total;

  // Trigger confetti + celebration the first time it becomes complete in this session
  useEffect(() => {
    if (!isComplete || mission.rewarded) return;
    setShowCelebration(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        startVelocity: 35,
        origin: { y: 0.4 },
        colors: ["#F59E0B", "#EC4899", "#A855F7", "#10B981"],
        scalar: 0.8,
      });
    } catch { /* noop */ }
    markRewarded();
    const t = setTimeout(() => setShowCelebration(false), 4200);
    return () => clearTimeout(t);
  }, [isComplete, mission.rewarded]);

  return (
    <>
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="glass-card-hero px-4 py-3">
          <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px]">🎯</span>
              <span className="text-[11px] font-black uppercase tracking-wide text-gray-700">
                Missão de hoje
              </span>
            </div>
            {isComplete ? (
              <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                <Sparkles size={10} /> Completa!
              </span>
            ) : (
              <span className="text-[10px] font-bold text-gray-500">
                {progress.done}/{progress.total}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {STEPS.map(({ key, icon: Icon, label, color }) => {
              const done = mission[key];
              return (
                <motion.button
                  key={key}
                  onClick={() => onAction?.(key)}
                  className={`relative flex flex-col items-center gap-1 px-1.5 py-2 rounded-xl border transition-colors ${
                    done
                      ? "bg-emerald-50/80 border-emerald-200/80"
                      : "bg-white/60 border-white/50 hover:bg-white/80"
                  }`}
                  whileTap={{ scale: 0.95 }}
                  aria-label={label}
                >
                  <div className="relative">
                    <Icon size={16} className={done ? "text-emerald-500" : color} strokeWidth={2.4} />
                    {done && (
                      <motion.div
                        className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                      >
                        <Check size={7} className="text-white" strokeWidth={4} />
                      </motion.div>
                    )}
                  </div>
                  <span className={`text-[9px] font-bold leading-tight text-center ${done ? "text-emerald-700" : "text-gray-600"}`}>
                    {label.replace(/^(Ouvir|Responder|Ver) 1 /, "")}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center px-6 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl px-6 py-5 shadow-2xl border-2 border-amber-300/60 max-w-xs text-center pointer-events-auto"
              initial={{ scale: 0.7, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
            >
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-base font-black text-gray-800 mb-1">
                Você foi incrível hoje!
              </p>
              <p className="text-xs font-semibold text-gray-500">
                {childName}, missão diária completa 💛
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

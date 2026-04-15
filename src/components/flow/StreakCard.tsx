import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const STREAK_MILESTONES = [
  { days: 3, label: "Fogo na Curiosidade", emoji: "🔥" },
  { days: 7, label: "Semana de Sabedoria", emoji: "🏅" },
  { days: 14, label: "Família Curiosa", emoji: "🏅" },
  { days: 30, label: "Mês de Descobertas", emoji: "🏆" },
  { days: 60, label: "Super Explorador", emoji: "💎" },
  { days: 100, label: "Lenda Kidzz", emoji: "👑" },
];

interface Props {
  streakDays: number;
  childName: string;
  onSubmit?: (text: string) => void;
}

const StreakCard = ({ streakDays, childName, onSubmit }: Props) => {
  const nextMilestone = STREAK_MILESTONES.find((m) => m.days > streakDays) || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
  const prevMilestone = [...STREAK_MILESTONES].reverse().find((m) => m.days <= streakDays);
  const prevDays = prevMilestone?.days || 0;
  const progress = nextMilestone.days > prevDays
    ? Math.min(100, ((streakDays - prevDays) / (nextMilestone.days - prevDays)) * 100)
    : 100;
  const daysToNext = Math.max(0, nextMilestone.days - streakDays);

  // Streak = 0: encouraging start message
  if (streakDays === 0) {
    return (
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3 relative overflow-hidden"
          style={{ background: "rgba(212,120,40,0.12)", border: "1px solid rgba(212,120,40,0.25)" }}
        >
          <span className="text-2xl streak-fire">🌟</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-amber-800 leading-tight">
              Hoje é o Dia 1 com {childName}! 🌟
            </p>
            <p className="text-[10px] text-amber-600/80 font-bold mt-0.5">
              Faça uma pergunta para começar sua jornada
            </p>
          </div>
          {onSubmit && (
            <motion.button
              onClick={() => onSubmit("")}
              className="text-[10px] font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm"
              whileTap={{ scale: 0.95 }}
            >
              Começar →
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  // Active streak ≥ 1
  return (
    <motion.div
      className="w-full max-w-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div
        className="rounded-2xl px-4 py-3 relative overflow-hidden"
        style={{ background: "rgba(212,120,40,0.15)", border: "1px solid rgba(212,120,40,0.3)" }}
      >
        <div className="relative flex items-center gap-3">
          <span className="text-[28px] streak-fire">🔥</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-amber-900 leading-tight">
              {streakDays} {streakDays === 1 ? "dia" : "dias"} seguidos com {childName}!
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex-1">
                <Progress value={progress} className="h-2 bg-amber-200/60" />
              </div>
              <span className="text-[10px] text-amber-700 font-bold whitespace-nowrap">
                {streakDays}/{nextMilestone.days}
              </span>
            </div>
            <p className="text-[10px] text-amber-700/80 font-bold mt-0.5">
              → "{nextMilestone.label}" {nextMilestone.emoji} — Mais {daysToNext} {daysToNext === 1 ? "dia" : "dias"}!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StreakCard;

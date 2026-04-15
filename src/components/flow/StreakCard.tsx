import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import pixelImg from "@/assets/pixel-chameleon.png";

const STREAK_MILESTONES = [
  { days: 3, label: "Fogo na Curiosidade", emoji: "🔥" },
  { days: 7, label: "Semana Mágica", emoji: "⭐" },
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

  // Streak broken or day 0-1
  if (streakDays <= 1) {
    return (
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 px-4 py-3 flex items-center gap-3 relative overflow-hidden">
          <motion.img
            src={pixelImg}
            alt="Pixel"
            className="w-10 h-10 object-contain"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="flex-1 min-w-0">
            {streakDays === 0 ? (
              <>
                <p className="text-sm font-black text-amber-800 leading-tight">
                  {childName} está esperando por você hoje 💛
                </p>
                <p className="text-[10px] text-amber-600 font-bold mt-0.5">
                  Vamos retomar a aventura?
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-black text-amber-800 leading-tight">
                  🌟 Dia 1 da aventura com {childName}!
                </p>
                <p className="text-[10px] text-amber-600 font-bold mt-0.5">
                  Mais {daysToNext} dias = Badge "{nextMilestone.label}" {nextMilestone.emoji}
                </p>
              </>
            )}
          </div>
          {streakDays === 0 && onSubmit && (
            <motion.button
              onClick={() => onSubmit("")}
              className="text-[10px] font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm"
              whileTap={{ scale: 0.95 }}
            >
              Recomeçar →
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  // Active streak ≥ 2
  return (
    <motion.div
      className="w-full max-w-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <div className="rounded-2xl bg-gradient-to-r from-amber-100/80 to-orange-100/80 border border-amber-300/40 px-4 py-3 relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-200/20 to-orange-200/20 rounded-2xl" />
        
        <div className="relative flex items-center gap-3">
          <span className="text-[28px] streak-fire">🔥</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-amber-900 leading-tight">
              {streakDays} dias seguidos com {childName}!
            </p>
            <p className="text-[10px] text-amber-700/80 font-bold mt-0.5">
              Mais {daysToNext} dias = Badge "{nextMilestone.label}" {nextMilestone.emoji}
            </p>
            <div className="mt-1.5">
              <Progress value={progress} className="h-1.5 bg-amber-200/60" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StreakCard;

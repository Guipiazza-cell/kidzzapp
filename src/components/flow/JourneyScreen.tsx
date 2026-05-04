import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Star, Sparkles, Trophy, Music2, BookOpen, Brain, Target, Wand2 } from "lucide-react";
import { getLevelInfo, type LevelInfo } from "@/lib/levelSystem";
import {
  getNextReward,
  getUnlockedRewards,
  getLockedRewards,
  type LevelReward,
} from "@/lib/levelRewards";
import { getMusicXp, getMusicStreak } from "@/lib/musicXp";
import { getMissionProgress } from "@/lib/dailyMission";

interface Props {
  onBack: () => void;
  childName?: string;
}

const tierGradient: Record<LevelInfo["tier"], string> = {
  spark: "linear-gradient(135deg, hsl(45 95% 60%), hsl(25 90% 50%))",
  glow: "linear-gradient(135deg, hsl(290 80% 60%), hsl(330 75% 55%))",
  aura: "linear-gradient(135deg, hsl(200 85% 55%), hsl(240 75% 50%))",
  energy: "linear-gradient(135deg, hsl(140 75% 50%), hsl(180 80% 50%))",
};

/**
 * Sua Jornada — visão completa de progresso, recompensa atual,
 * próxima recompensa, XP por categoria. Otimizado para mobile.
 */
const JourneyScreen = ({ onBack, childName = "amigo" }: Props) => {
  const [info, setInfo] = useState<LevelInfo>(() => getLevelInfo());

  useEffect(() => {
    const refresh = () => setInfo(getLevelInfo());
    window.addEventListener("kidzz:xp-gained", refresh);
    window.addEventListener("kidzz:level-up", refresh);
    return () => {
      window.removeEventListener("kidzz:xp-gained", refresh);
      window.removeEventListener("kidzz:level-up", refresh);
    };
  }, []);

  const next = useMemo(() => getNextReward(info.level), [info.level]);
  const unlocked = useMemo(() => getUnlockedRewards(info.level), [info.level]);
  const locked = useMemo(() => getLockedRewards(info.level), [info.level]);

  const musicXp = getMusicXp();
  const musicStreak = getMusicStreak();
  const mission = getMissionProgress();

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-3 pb-2"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
      >
        <motion.button
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/70 border border-white/40 backdrop-blur"
          whileTap={{ scale: 0.9 }}
          aria-label="Voltar"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </motion.button>
        <div className="text-center flex-1">
          <h1 className="text-base font-extrabold text-gray-800 flex items-center justify-center gap-1.5">
            ✨ Sua Jornada
          </h1>
          <p className="text-[11px] text-gray-500 font-semibold">
            Nível {info.level} de {100}
          </p>
        </div>
        <div className="min-w-[44px]" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4">
        {/* Card de nível atual */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="rounded-3xl p-5 border border-white/40 shadow-xl text-white relative overflow-hidden"
          style={{ background: tierGradient[info.tier] }}
        >
          <motion.div
            className="absolute inset-0 bg-white/15"
            animate={{ x: ["-100%", "120%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/85">
                  Nível atual
                </p>
                <h2 className="text-3xl font-black drop-shadow">
                  {info.level}
                </h2>
                <p className="text-sm font-extrabold text-white/95 mt-0.5">
                  {info.title}
                </p>
              </div>
              <motion.div
                className="text-5xl drop-shadow"
                animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {info.tier === "energy" ? "♾️" : info.tier === "aura" ? "🌟" : info.tier === "glow" ? "✨" : "🌱"}
              </motion.div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] font-extrabold mb-1">
                <span>{info.xpInLevel} XP</span>
                <span>
                  {info.level >= 100 ? "MAX" : `Faltam ${Math.max(0, info.xpForNext - info.xpInLevel)} XP`}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-white/25 overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={false}
                  animate={{ width: `${info.progress * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Próxima recompensa */}
        {next && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-4 border border-amber-300/60 bg-gradient-to-br from-amber-50/90 to-orange-50/85 shadow-md"
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="text-4xl flex-shrink-0"
                animate={{ scale: [1, 1.08, 1], rotate: [0, -6, 6, 0] }}
                transition={{ duration: 2.6, repeat: Infinity }}
              >
                {next.emoji}
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                  Próxima recompensa · Nível {next.level}
                </p>
                <h3 className="text-base font-extrabold text-gray-800 leading-tight">
                  {next.label}
                </h3>
                <p className="text-[11px] font-bold text-gray-600 leading-snug mt-0.5">
                  {next.description}
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-amber-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                initial={false}
                animate={{
                  width: `${Math.min(100, (info.level / next.level) * 100)}%`,
                }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              />
            </div>
            <p className="mt-2 text-[10px] font-extrabold text-amber-700 text-center">
              Faltam {next.level - info.level} {next.level - info.level === 1 ? "nível" : "níveis"}
            </p>
          </motion.div>
        )}

        {/* Stats por categoria */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard icon={<Sparkles size={16} />} label="XP total" value={info.xp} color="text-amber-600" />
          <StatCard icon={<Music2 size={16} />} label="Música" value={musicXp} color="text-pink-600" />
          <StatCard icon={<Star size={16} />} label="Streak música" value={`${musicStreak}d`} color="text-orange-500" />
          <StatCard icon={<Target size={16} />} label="Missão hoje" value={`${mission.done}/${mission.total}`} color="text-emerald-600" />
        </div>

        {/* Recompensas conquistadas */}
        {unlocked.length > 0 && (
          <section>
            <h3 className="text-xs font-black text-gray-700 uppercase tracking-wide mb-2 px-1 flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-500" /> Conquistadas ({unlocked.length})
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {unlocked.map((r) => (
                <RewardChip key={`u-${r.level}`} reward={r} unlocked />
              ))}
            </div>
          </section>
        )}

        {/* A desbloquear */}
        {locked.length > 0 && (
          <section>
            <h3 className="text-xs font-black text-gray-700 uppercase tracking-wide mb-2 px-1 flex items-center gap-1.5">
              <Lock size={14} className="text-gray-500" /> A caminho ({locked.length})
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {locked.slice(0, 9).map((r) => (
                <RewardChip key={`l-${r.level}`} reward={r} unlocked={false} />
              ))}
            </div>
          </section>
        )}

        <p className="text-center text-[11px] font-bold text-gray-500 pt-2">
          Continue brincando, {childName} — toda ação conta! 💚
        </p>
      </div>
    </motion.div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="rounded-2xl p-3 bg-white/75 border border-white/50 shadow-sm"
  >
    <div className={`flex items-center gap-1.5 ${color}`}>
      {icon}
      <span className="text-[10px] font-black uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-lg font-black text-gray-800 mt-1">{value}</div>
  </motion.div>
);

const RewardChip = ({ reward, unlocked }: { reward: LevelReward; unlocked: boolean }) => (
  <motion.div
    whileTap={{ scale: 0.95 }}
    className={`rounded-2xl p-2.5 border flex flex-col items-center text-center min-h-[88px] ${
      unlocked
        ? "bg-white/85 border-amber-200 shadow-sm"
        : "bg-white/45 border-white/40"
    }`}
  >
    <div
      className="text-2xl mb-0.5"
      style={{ filter: unlocked ? "none" : "grayscale(0.6) blur(0.5px)" }}
    >
      {reward.emoji}
    </div>
    <div className={`text-[10px] font-extrabold leading-tight ${unlocked ? "text-gray-800" : "text-gray-500"}`}>
      {reward.label}
    </div>
    <div className={`text-[9px] font-bold mt-0.5 ${unlocked ? "text-amber-600" : "text-gray-400"}`}>
      Nv {reward.level}
    </div>
  </motion.div>
);

export default JourneyScreen;

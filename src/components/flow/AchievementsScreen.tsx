import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Star, Zap, BookOpen, MessageCircle, Sparkles, Lock, Flame, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  icon: typeof Trophy;
  threshold: number;
  type: "questions" | "stories" | "streak" | "points";
  color: string;
  gradient: string;
}

const BADGES: Badge[] = [
  {
    id: "first-question",
    title: "Primeira Pergunta",
    description: "Fez sua primeira pergunta!",
    emoji: "🌱",
    icon: MessageCircle,
    threshold: 1,
    type: "questions",
    color: "text-kid-green",
    gradient: "from-kid-green/20 to-kid-green/5",
  },
  {
    id: "curious-starter",
    title: "Conversador Iniciante",
    description: "Fez 3 perguntas incríveis",
    emoji: "💬",
    icon: MessageCircle,
    threshold: 3,
    type: "questions",
    color: "text-kid-blue",
    gradient: "from-kid-blue/20 to-kid-blue/5",
  },
  {
    id: "explorer",
    title: "Explorador Curioso",
    description: "Fez 10 perguntas! Uau!",
    emoji: "🚀",
    icon: Zap,
    threshold: 10,
    type: "questions",
    color: "text-kid-orange",
    gradient: "from-kid-orange/20 to-kid-orange/5",
  },
  {
    id: "genius",
    title: "Mente Brilhante",
    description: "Fez 20 perguntas brilhantes",
    emoji: "🧠",
    icon: Star,
    threshold: 20,
    type: "questions",
    color: "text-kid-purple",
    gradient: "from-kid-purple/20 to-kid-purple/5",
  },
  {
    id: "master",
    title: "Perguntador Oficial",
    description: "Fez 50 perguntas! Incrível!",
    emoji: "👑",
    icon: Trophy,
    threshold: 50,
    type: "questions",
    color: "text-kid-yellow",
    gradient: "from-kid-yellow/20 to-kid-yellow/5",
  },
  {
    id: "first-story",
    title: "Contador de Histórias",
    description: "Criou sua primeira história",
    emoji: "📖",
    icon: BookOpen,
    threshold: 1,
    type: "stories",
    color: "text-kid-pink",
    gradient: "from-kid-pink/20 to-kid-pink/5",
  },
  {
    id: "storyteller",
    title: "Autor Criativo",
    description: "Criou 5 histórias mágicas",
    emoji: "✨",
    icon: Sparkles,
    threshold: 5,
    type: "stories",
    color: "text-kid-purple",
    gradient: "from-kid-purple/20 to-kid-purple/5",
  },
  {
    id: "streak-3",
    title: "Fogo na Curiosidade",
    description: "3 dias seguidos usando o app",
    emoji: "🔥",
    icon: Flame,
    threshold: 3,
    type: "streak",
    color: "text-kid-orange",
    gradient: "from-kid-orange/20 to-kid-orange/5",
  },
  {
    id: "streak-7",
    title: "Semana de Sabedoria",
    description: "7 dias seguidos de descobertas",
    emoji: "⭐",
    icon: Flame,
    threshold: 7,
    type: "streak",
    color: "text-kid-yellow",
    gradient: "from-kid-yellow/20 to-kid-yellow/5",
  },
  {
    id: "points-50",
    title: "Coletor de Pontos",
    description: "Acumulou 50 pontos de sabedoria",
    emoji: "💎",
    icon: Crown,
    threshold: 50,
    type: "points",
    color: "text-kid-blue",
    gradient: "from-kid-blue/20 to-kid-blue/5",
  },
];

const LEVEL_CONFIG: Record<string, { label: string; emoji: string; color: string; next: number }> = {
  iniciante: { label: "Iniciante", emoji: "🌱", color: "text-kid-green", next: 15 },
  curioso: { label: "Curioso", emoji: "🔍", color: "text-kid-blue", next: 50 },
  explorador: { label: "Explorador", emoji: "🚀", color: "text-kid-orange", next: 100 },
  pensador: { label: "Pensador", emoji: "🧠", color: "text-kid-purple", next: 999 },
};

interface Props {
  onBack: () => void;
}

const AchievementsScreen = ({ onBack }: Props) => {
  const { profile } = useAuth();
  const questionsUsed = profile?.questions_used ?? 0;
  const storiesUsed = profile?.stories_used ?? 0;
  const streakDays = profile?.streak_days ?? 0;
  const points = profile?.points ?? 0;
  const level = profile?.level ?? "iniciante";
  const levelInfo = LEVEL_CONFIG[level] || LEVEL_CONFIG.iniciante;
  const levelProgress = Math.min(100, (points / levelInfo.next) * 100);

  const getCount = (badge: Badge) => {
    switch (badge.type) {
      case "questions": return questionsUsed;
      case "stories": return storiesUsed;
      case "streak": return streakDays;
      case "points": return points;
    }
  };

  const getProgress = (badge: Badge) => {
    return Math.min(100, (getCount(badge) / badge.threshold) * 100);
  };

  const isUnlocked = (badge: Badge) => getCount(badge) >= badge.threshold;
  const unlockedCount = BADGES.filter(isUnlocked).length;

  return (
    <motion.div
      className="flex-1 flex flex-col relative"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header
        className="flex items-center gap-3 px-5 pb-3 relative z-10"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
      >
        <motion.button
          onClick={onBack}
          className="p-2.5 rounded-xl glass-card text-gray-700"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-gray-800">Conquistas de {profile?.child_name || "Explorador"}</h1>
          <p className="text-[11px] text-gray-500 font-bold">
            {unlockedCount}/{BADGES.length} desbloqueadas
          </p>
        </div>
        <motion.div
          className="text-3xl"
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          🏆
        </motion.div>
      </header>

      {/* Level progress card */}
      <div className="px-5 mb-3 relative z-10">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{levelInfo.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-black ${levelInfo.color}`}>Nível: {levelInfo.label}</span>
                <span className="text-[11px] font-bold text-gray-400">{points} pts</span>
              </div>
              <Progress value={levelProgress} className="h-2 mt-1 bg-gray-200/50" />
            </div>
          </div>
          <div className="flex gap-4 pt-2 border-t border-gray-200/30">
            <div className="flex-1 text-center">
              <p className="text-lg font-black text-gray-800">{questionsUsed}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Perguntas</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-lg font-black text-gray-800">{storiesUsed}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Histórias</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-lg font-black text-kid-orange">{streakDays}🔥</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Streak</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-lg font-black text-gray-800">{unlockedCount}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Badges</p>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational message */}
      <div className="px-5 mb-3 relative z-10">
        <p className="text-[11px] text-gray-500 font-semibold text-center italic">
          "Cada pergunta te aproxima do próximo nível. Continue explorando!" ✨
        </p>
      </div>

      {/* Badges grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 relative z-10">
        <div className="grid grid-cols-1 gap-3">
          {BADGES.map((badge, i) => {
            const unlocked = isUnlocked(badge);
            const progress = getProgress(badge);
            const count = getCount(badge);
            const Icon = badge.icon;

            return (
              <motion.div
                key={badge.id}
                className={`glass-card rounded-2xl p-4 border transition-all ${
                  unlocked
                    ? "border-white/40 shadow-lg"
                    : "border-white/20 opacity-75"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${badge.gradient} relative`}
                    animate={unlocked ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {unlocked ? (
                      <span className="text-xl">{badge.emoji}</span>
                    ) : (
                      <Lock size={18} className="text-gray-400" />
                    )}
                    {unlocked && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-kid-green flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: i * 0.06 + 0.3 }}
                      >
                        <span className="text-[8px]">✓</span>
                      </motion.div>
                    )}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-black ${unlocked ? "text-gray-800" : "text-gray-500"}`}>
                        {badge.title}
                      </h3>
                      {unlocked && <Icon size={14} className={badge.color} />}
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                      {badge.description}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Progress
                        value={progress}
                        className="h-1.5 flex-1 bg-gray-200/50"
                      />
                      <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap">
                        {Math.min(count, badge.threshold)}/{badge.threshold}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default AchievementsScreen;

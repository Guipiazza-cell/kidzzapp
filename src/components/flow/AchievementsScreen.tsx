import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Star, Zap, BookOpen, MessageCircle, Sparkles, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import MagicalBackground from "@/components/MagicalBackground";

interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  icon: typeof Trophy;
  threshold: number;
  type: "questions" | "stories";
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
    title: "Explorador Incrível",
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
    title: "Gênio Curioso",
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
    title: "Mestre do Conhecimento",
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
];

interface Props {
  onBack: () => void;
}

const AchievementsScreen = ({ onBack }: Props) => {
  const { profile } = useAuth();
  const questionsUsed = profile?.questions_used ?? 0;
  const storiesUsed = profile?.stories_used ?? 0;

  const getProgress = (badge: Badge) => {
    const count = badge.type === "questions" ? questionsUsed : storiesUsed;
    return Math.min(100, (count / badge.threshold) * 100);
  };

  const isUnlocked = (badge: Badge) => {
    const count = badge.type === "questions" ? questionsUsed : storiesUsed;
    return count >= badge.threshold;
  };

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
          <h1 className="text-xl font-black text-gray-800">Conquistas</h1>
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

      {/* Stats summary */}
      <div className="px-5 mb-4 relative z-10">
        <div className="glass-card rounded-2xl p-4 flex gap-4">
          <div className="flex-1 text-center">
            <p className="text-2xl font-black text-gray-800">{questionsUsed}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Perguntas</p>
          </div>
          <div className="w-px bg-gray-200" />
          <div className="flex-1 text-center">
            <p className="text-2xl font-black text-gray-800">{storiesUsed}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Histórias</p>
          </div>
          <div className="w-px bg-gray-200" />
          <div className="flex-1 text-center">
            <p className="text-2xl font-black text-gray-800">{unlockedCount}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Badges</p>
          </div>
        </div>
      </div>

      {/* Badges grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 relative z-10">
        <div className="grid grid-cols-1 gap-3">
          {BADGES.map((badge, i) => {
            const unlocked = isUnlocked(badge);
            const progress = getProgress(badge);
            const count = badge.type === "questions" ? questionsUsed : storiesUsed;
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
                transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className="flex items-center gap-3">
                  {/* Badge icon */}
                  <motion.div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${badge.gradient} relative`}
                    animate={unlocked ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {unlocked ? (
                      <span className="text-2xl">{badge.emoji}</span>
                    ) : (
                      <Lock size={20} className="text-gray-400" />
                    )}
                    {unlocked && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-kid-green flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: i * 0.08 + 0.3 }}
                      >
                        <span className="text-[10px]">✓</span>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-black ${unlocked ? "text-gray-800" : "text-gray-500"}`}>
                        {badge.title}
                      </h3>
                      {unlocked && (
                        <Icon size={14} className={badge.color} />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                      {badge.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Progress
                        value={progress}
                        className="h-2 flex-1 bg-gray-200/50"
                      />
                      <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">
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

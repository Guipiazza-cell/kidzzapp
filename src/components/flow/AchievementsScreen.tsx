import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Star, Zap, BookOpen, MessageCircle, Sparkles, Flame, Crown, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";
import { useEffect, useRef } from "react";
import { triggerKidzzShare } from "@/components/viral/KidzzShareTrigger";
import type { AchievementCategory } from "@/components/viral/KidzzShareCard";

const TYPE_TO_CATEGORY: Record<string, AchievementCategory> = {
  questions: "questions",
  stories: "story",
  streak: "streak",
  points: "default",
};

interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  icon: typeof Trophy;
  threshold: number;
  type: "questions" | "stories" | "streak" | "points";
  bgColor: string;
}

const BADGES: Badge[] = [
  { id: "first-question", title: "Primeira Pergunta", description: "Fez sua primeira pergunta!", emoji: "💬", icon: MessageCircle, threshold: 1, type: "questions", bgColor: "rgba(34,197,94,0.15)" },
  { id: "curious-starter", title: "Conversador Iniciante", description: "Fez 3 perguntas incríveis", emoji: "🗣️", icon: MessageCircle, threshold: 3, type: "questions", bgColor: "rgba(34,197,94,0.2)" },
  { id: "explorer", title: "Explorador Curioso", description: "Fez 10 perguntas! Uau!", emoji: "🔍", icon: Zap, threshold: 10, type: "questions", bgColor: "rgba(59,130,246,0.15)" },
  { id: "genius", title: "Mente Brilhante", description: "Fez 20 perguntas brilhantes", emoji: "🧠", icon: Star, threshold: 20, type: "questions", bgColor: "rgba(147,51,234,0.15)" },
  { id: "master", title: "Perguntador Oficial", description: "Fez 50 perguntas! Incrível!", emoji: "⭐", icon: Trophy, threshold: 50, type: "questions", bgColor: "rgba(212,168,71,0.2)" },
  { id: "first-story", title: "Contador de Histórias", description: "Criou sua primeira história", emoji: "📖", icon: BookOpen, threshold: 1, type: "stories", bgColor: "rgba(249,115,22,0.15)" },
  { id: "storyteller", title: "Autor Criativo", description: "Criou 5 histórias mágicas", emoji: "✍️", icon: Sparkles, threshold: 5, type: "stories", bgColor: "rgba(236,72,153,0.15)" },
  { id: "streak-3", title: "Fogo na Curiosidade", description: "3 dias seguidos usando o app", emoji: "🔥", icon: Flame, threshold: 3, type: "streak", bgColor: "rgba(249,115,22,0.2)" },
  { id: "streak-7", title: "Semana de Sabedoria", description: "7 dias seguidos de descobertas", emoji: "🌟", icon: Flame, threshold: 7, type: "streak", bgColor: "rgba(245,158,11,0.2)" },
  { id: "streak-14", title: "Família Curiosa", description: "14 dias seguidos de aventura", emoji: "💛", icon: Flame, threshold: 14, type: "streak", bgColor: "rgba(212,168,71,0.2)" },
  { id: "streak-30", title: "Mês de Descobertas", description: "30 dias seguidos! Incrível!", emoji: "🏆", icon: Flame, threshold: 30, type: "streak", bgColor: "rgba(147,51,234,0.2)" },
  { id: "points-50", title: "Coletor de Pontos", description: "Acumulou 50 pontos de sabedoria", emoji: "💎", icon: Crown, threshold: 50, type: "points", bgColor: "rgba(59,130,246,0.2)" },
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
  const celebratedRef = useRef<Set<string>>(new Set());

  const getCount = (badge: Badge) => {
    switch (badge.type) {
      case "questions": return questionsUsed;
      case "stories": return storiesUsed;
      case "streak": return streakDays;
      case "points": return points;
    }
  };

  const getProgress = (badge: Badge) => Math.min(100, (getCount(badge) / badge.threshold) * 100);
  const isUnlocked = (badge: Badge) => getCount(badge) >= badge.threshold;
  const unlockedCount = BADGES.filter(isUnlocked).length;

  const getRemainingText = (badge: Badge) => {
    const remaining = badge.threshold - getCount(badge);
    if (remaining <= 0) return null;
    const unit = badge.type === "questions" ? "pergunta" : badge.type === "stories" ? "história" : badge.type === "streak" ? "dia" : "ponto";
    const plural = remaining > 1 ? "s" : "";
    return `Faltam ${remaining} ${unit}${plural} para desbloquear`;
  };

  return (
    <motion.div
      className="flex-1 flex flex-col relative"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header — dynamic island */}
      <header
        className="absolute top-0 left-0 right-0 z-30 flex items-center gap-3 px-5 pb-3"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
      >
        <motion.button
          onClick={onBack}
          className="glass-island min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="glass-island flex-1 min-w-0 px-3.5 py-1.5 rounded-2xl font-ui">
          <h1 className="font-display text-[17px] font-semibold leading-tight truncate">
            Conquistas de {profile?.child_name || "amigo"}
          </h1>
          <p className="text-[10.5px] font-semibold leading-tight truncate opacity-80">
            {unlockedCount}/{BADGES.length} desbloqueadas
          </p>
        </div>
        <motion.div
          className="glass-island min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full"
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <span className="text-xl">🏆</span>
        </motion.div>
      </header>

      {/* Level progress card */}
      <div
        className="px-5 mb-3 relative z-10"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 64px)" }}
      >
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

      {/* Badges grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 relative z-10">
        <div className="grid grid-cols-1 gap-3">
          {BADGES.map((badge, i) => {
            const unlocked = isUnlocked(badge);
            const progress = getProgress(badge);
            const count = getCount(badge);
            const remaining = getRemainingText(badge);

            return (
              <motion.div
                key={badge.id}
                className={`glass-card rounded-2xl p-4 border transition-all ${
                  unlocked ? "border-white/40 shadow-lg" : "border-white/20"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{ background: badge.bgColor }}
                    animate={unlocked ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {/* Emoji with blur overlay for locked */}
                    <span
                      className="text-2xl relative z-10"
                      style={unlocked ? {} : { opacity: 0.35, filter: "blur(1.5px)" }}
                    >
                      {badge.emoji}
                    </span>
                    {/* Shimmer for unlocked */}
                    {unlocked && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{ background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)" }}
                        animate={{ x: [-60, 60] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                      />
                    )}
                    {unlocked && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-kid-green flex items-center justify-center z-20"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: i * 0.05 + 0.3 }}
                      >
                        <span className="text-[8px]">✓</span>
                      </motion.div>
                    )}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-black ${unlocked ? "text-gray-800" : "text-gray-500"}`}>
                      {badge.title}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                      {badge.description}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Progress value={progress} className="h-1.5 flex-1 bg-gray-200/50" />
                      <span className="text-[9px] font-bold text-gray-500 whitespace-nowrap">
                        {Math.min(count, badge.threshold)}/{badge.threshold}
                      </span>
                    </div>
                    {!unlocked && remaining && (
                      <p className="text-[9px] text-amber-600/70 font-semibold mt-1 italic">
                        {remaining}
                      </p>
                    )}
                  </div>
                  {unlocked && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerKidzzShare({
                          title: badge.title,
                          subtitle: `desbloqueou "${badge.title}"! ${badge.emoji}`,
                          emoji: badge.emoji,
                          category: TYPE_TO_CATEGORY[badge.type] || "default",
                          streakDays: badge.type === "streak" ? streakDays : undefined,
                          shareSlug: `badge-${badge.id}`,
                        });
                      }}
                      className="ml-1 w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-md flex-shrink-0"
                      whileTap={{ scale: 0.9 }}
                      aria-label={`Compartilhar ${badge.title}`}
                    >
                      <Share2 size={14} />
                    </motion.button>
                  )}
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

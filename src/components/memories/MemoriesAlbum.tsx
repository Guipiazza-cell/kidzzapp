import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Share2, Lock, Heart, BookOpen, HelpCircle, Target, Trophy, MessageCircle } from "lucide-react";
import { useMemories, type Memory } from "@/hooks/useMemories";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";
import AchievementsScreen from "@/components/flow/AchievementsScreen";

interface MemoriesAlbumProps {
  onBack: () => void;
  onNavigateToChat?: () => void;
  onNavigateToStories?: () => void;
}

const FILTER_OPTIONS = [
  { id: "all" as const, label: "Todas", icon: Heart },
  { id: "question" as const, label: "Perguntas", icon: HelpCircle },
  { id: "story" as const, label: "Histórias", icon: BookOpen },
  { id: "mission" as const, label: "Missões", icon: Target },
  { id: "achievement" as const, label: "Conquistas", icon: Trophy },
];

const TYPE_CONFIG: Record<string, { emoji: string; color: string; label: string; summary: string }> = {
  question: { emoji: "❓", color: "from-kid-blue/20 to-kid-blue/5", label: "Pergunta", summary: "Curiosidade respondida" },
  story: { emoji: "📖", color: "from-kid-purple/20 to-kid-pink/5", label: "História", summary: "História mágica criada" },
  mission: { emoji: "🎯", color: "from-kid-orange/20 to-kid-yellow/5", label: "Missão", summary: "Missão concluída em família" },
  achievement: { emoji: "🏆", color: "from-kid-yellow/20 to-kid-orange/5", label: "Conquista", summary: "Conquista desbloqueada" },
};

function getMemorySummary(memory: Memory): string {
  const meta = memory.metadata || {};
  // Music-specific
  if (meta.kind === "music" || meta.subtype === "music") return "🎵 Música criada";
  if (meta.kind === "karaoke") return "🎤 Karaokê cantado";
  if (meta.kind === "dance") return "💃 Dança completada";
  if (meta.kind === "sung_story") return "🎼 História cantada";
  // Game-specific
  if (meta.kind === "game" || meta.subtype === "game") return `🎮 Jogo: ${meta.game_name || "concluído"}`;
  // Activity completion
  if (meta.kind === "activity") return "✨ Atividade concluída";
  // Default by type
  return TYPE_CONFIG[memory.type]?.summary || "Memória guardada";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

// Generate a slight random rotation for polaroid effect
function getPolaroidRotation(index: number): number {
  const seed = index * 7 + 3;
  return ((seed % 5) - 2) * 0.8; // -1.6 to +1.6 degrees
}

const MemoryCard = ({
  memory,
  index,
  onToggleSpecial,
  onShare,
  locked,
}: {
  memory: Memory;
  index: number;
  onToggleSpecial: () => void;
  onShare: () => void;
  locked?: boolean;
}) => {
  const config = TYPE_CONFIG[memory.type] || TYPE_CONFIG.question;
  const rotation = getPolaroidRotation(index);

  if (locked) {
    return (
      <motion.div
        className="rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 p-3 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <div className="absolute inset-0 backdrop-blur-md bg-white/20" />
        <Lock size={24} className="text-gray-400 relative z-10" />
        <p className="text-[10px] text-gray-400 font-bold mt-1 relative z-10 text-center">Premium</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-sm overflow-hidden"
      style={{ transform: `rotate(${rotation}deg)` }}
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 200 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Category header */}
      <div className={`px-3 py-2 bg-gradient-to-r ${config.color} flex items-center justify-between`}>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{config.emoji}</span>
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{config.label}</span>
        </div>
        {memory.is_special && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm"
          >
            ⭐
          </motion.span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-xs font-black text-gray-800 leading-snug line-clamp-2">
          {memory.title}
        </p>
        {/* Summary line — what was created */}
        <p className="text-[10px] text-primary font-bold mt-1">
          {getMemorySummary(memory)}
        </p>
        {memory.content && (
          <p className="text-[10px] text-gray-500 font-semibold mt-1 leading-relaxed line-clamp-2">
            {memory.content}
          </p>
        )}

        {/* Date & actions */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
          <span className="text-[9px] text-gray-400 font-semibold">
            {formatDate(memory.created_at)}
          </span>
          <div className="flex items-center gap-1">
            <motion.button
              onClick={(e) => { e.stopPropagation(); onToggleSpecial(); }}
              className={`p-1.5 rounded-lg transition-colors ${memory.is_special ? "bg-kid-yellow/20" : "hover:bg-gray-100"}`}
              whileTap={{ scale: 0.85 }}
            >
              <Star size={12} className={memory.is_special ? "text-kid-yellow fill-kid-yellow" : "text-gray-300"} />
            </motion.button>
            <motion.button
              onClick={(e) => { e.stopPropagation(); onShare(); }}
              className="p-1.5 rounded-lg hover:bg-gray-100"
              whileTap={{ scale: 0.85 }}
            >
              <Share2 size={12} className="text-gray-400" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Monthly retrospective card
const MonthlyRetroCard = ({ memories, childName }: { memories: Memory[]; childName: string }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthMemories = memories.filter(m => {
    const d = new Date(m.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const questions = monthMemories.filter(m => m.type === "question").length;
  const stories = monthMemories.filter(m => m.type === "story").length;
  const missions = monthMemories.filter(m => m.type === "mission").length;

  if (monthMemories.length === 0) return null;

  const monthName = now.toLocaleDateString("pt-BR", { month: "long" });

  return (
    <motion.div
      className="w-full rounded-2xl bg-gradient-to-br from-kid-orange/15 to-kid-yellow/10 border border-kid-orange/20 p-4 mb-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">📊</span>
        <span className="text-xs font-black text-gray-800">
          {childName} em {monthName}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-lg font-black text-kid-blue">{questions}</p>
          <p className="text-[9px] text-gray-500 font-bold">perguntas</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-kid-purple">{stories}</p>
          <p className="text-[9px] text-gray-500 font-bold">histórias</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-kid-orange">{missions}</p>
          <p className="text-[9px] text-gray-500 font-bold">missões</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-gray-800">{monthMemories.length}</p>
          <p className="text-[9px] text-gray-500 font-bold">total</p>
        </div>
      </div>
    </motion.div>
  );
};

const MemoriesAlbum = ({ onBack, onNavigateToChat, onNavigateToStories }: MemoriesAlbumProps) => {
  const { profile, handleCheckout } = useAuth();
  const {
    memories,
    allMemories,
    loading,
    filter,
    setFilter,
    toggleSpecial,
    totalCount,
    lockedCount,
    isPremium,
  } = useMemories();

  const [section, setSection] = useState<"memories" | "achievements">("memories");
  const childName = profile?.child_name || "amigo";

  const handleShare = useCallback(async (memory: Memory) => {
    const shareText = `${memory.title}\n\n${memory.content || ""}\n\n💛 Criado com KIDZZ — kidzzapp.lovable.app`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: `Memória de ${childName}`, text: shareText });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Memória copiada! 💛");
    }
  }, [childName]);

  // Special memories at top
  const specialMemories = memories.filter(m => m.is_special);
  const regularMemories = memories.filter(m => !m.is_special);

  return (
    <motion.div
      className="flex-1 flex flex-col relative min-h-0"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header — dynamic island */}
      <header
        className="flex items-center gap-2 px-3 pb-2 relative z-10"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
      >
        <motion.button
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-gray-700"
          style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.55)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.9)",
          }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div
          className="flex-1 min-w-0 px-3.5 py-1.5 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.55)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,0.9)",
          }}
        >
          <h1 className="text-[15px] font-black text-gray-800 leading-tight truncate">
            Memórias de {childName} 💛
          </h1>
          <p className="text-[10.5px] text-gray-600 font-semibold leading-tight truncate">
            {totalCount} memórias criadas
          </p>
        </div>
      </header>

      {/* Section toggle: Memórias / Conquistas (subaba) */}
      <div className="px-4 pb-2 relative z-10">
        <div className="flex gap-2 p-1 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/40 max-w-sm">
          {([
            { id: "memories", label: "💛 Conteúdos" },
            { id: "achievements", label: "🏆 Conquistas" },
          ] as const).map((opt) => {
            const isActive = section === opt.id;
            return (
              <motion.button
                key={opt.id}
                onClick={() => setSection(opt.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                  isActive
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500"
                }`}
                whileTap={{ scale: 0.97 }}
              >
                {opt.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {section === "achievements" ? (
        <div
          className="flex-1 overflow-y-auto overscroll-contain -mt-2"
          style={{
            WebkitOverflowScrolling: "touch",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)",
          }}
        >
          <AchievementsScreen onBack={() => setSection("memories")} />
        </div>
      ) : (
      <>


      {/* Filters */}
      <div className="px-4 pb-2">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = filter === opt.id;
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.id}
                onClick={() => setFilter(opt.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "glass-card-light text-gray-500"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={12} />
                {opt.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain px-4"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <motion.p
              className="text-gray-400 text-sm font-bold"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Carregando memórias...
            </motion.p>
          </div>
        ) : totalCount === 0 ? (
          <motion.div
            className="flex flex-col items-center text-center px-2 py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* KIDZZ HERO — empty state */}
            <div className="mb-3">
              <KidzzChameleon state="cosmic" mood="curious" size="lg" interactive showParticles />
            </div>

            <h3 className="text-base font-black text-gray-800 leading-snug">
              Aqui vão ficar as memórias mais preciosas de {childName} 💛
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-1.5 max-w-[280px] leading-relaxed">
              Cada pergunta respondida, cada história criada, cada missão em família — tudo guardado para sempre aqui.
            </p>

            {/* Preview cards */}
            <div className="flex gap-2 mt-5 w-full max-w-[300px]">
              {[
                { emoji: "💬", label: "Pergunta", example: '"Por que sonhamos?"' },
                { emoji: "📖", label: "História", example: `"A aventura de ${childName}"` },
                { emoji: "🎯", label: "Missão", example: '"Caça às Emoções"' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  className="flex-1 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30 p-2.5 text-center"
                  style={{ opacity: 0.55, filter: "blur(0.3px)" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.55, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <span className="text-xl">{item.emoji}</span>
                  <p className="text-[9px] font-bold text-gray-600 mt-1">{item.label}</p>
                  <p className="text-[8px] text-gray-400 font-semibold mt-0.5 leading-tight">{item.example}</p>
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2 mt-5 w-full max-w-[280px]">
              <motion.button
                onClick={onNavigateToChat}
                className="w-full py-3 rounded-2xl bg-primary/90 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle size={16} />
                Fazer primeira pergunta →
              </motion.button>
              <motion.button
                onClick={onNavigateToStories}
                className="w-full py-2.5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 text-gray-700 font-bold text-xs flex items-center justify-center gap-2"
                whileTap={{ scale: 0.95 }}
              >
                <BookOpen size={14} />
                Criar primeira história →
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Monthly retrospective */}
            {isPremium && (
              <MonthlyRetroCard memories={allMemories} childName={childName} />
            )}

            {/* Special memories section */}
            {specialMemories.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  ⭐ Cápsula do Tempo
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {specialMemories.map((memory, i) => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                      index={i}
                      onToggleSpecial={() => toggleSpecial(memory.id, memory.is_special)}
                      onShare={() => handleShare(memory)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular memories */}
            <div>
              {specialMemories.length > 0 && (
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Todas as memórias
                </p>
              )}
              <div className="grid grid-cols-2 gap-2.5">
                {regularMemories.map((memory, i) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    index={i}
                    onToggleSpecial={() => toggleSpecial(memory.id, memory.is_special)}
                    onShare={() => handleShare(memory)}
                  />
                ))}

                {/* Locked cards for free users */}
                {lockedCount > 0 && [...Array(Math.min(lockedCount, 4))].map((_, i) => (
                  <MemoryCard
                    key={`locked-${i}`}
                    memory={{ id: `l${i}`, type: "question", title: "", content: null, is_special: false, image_url: null, metadata: {}, created_at: "", user_id: "" }}
                    index={regularMemories.length + i}
                    onToggleSpecial={() => {}}
                    onShare={() => {}}
                    locked
                  />
                ))}
              </div>
            </div>

            {/* Paywall for locked memories */}
            {lockedCount > 0 && (
              <motion.div
                className="mt-4 glass-card rounded-2xl p-5 text-center border border-kid-purple/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Lock size={28} className="text-kid-purple mx-auto mb-2" />
                <p className="text-sm font-black text-gray-800">
                  +{lockedCount} memórias guardadas com carinho 💛
                </p>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  Desbloqueie suas memórias com Premium ✨
                </p>
                <motion.button
                  onClick={() => handleCheckout("premium")}
                  className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-kid-purple to-kid-pink text-white font-extrabold text-sm shadow-lg active:scale-[0.97] transition-transform"
                  whileTap={{ scale: 0.95 }}
                >
                  🔓 Desbloquear todas as memórias
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
      </>
      )}
    </motion.div>
  );
};

export default MemoriesAlbum;

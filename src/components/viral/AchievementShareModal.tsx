import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Share2, Loader2 } from "lucide-react";
import ShareableAchievementCard from "./ShareableAchievementCard";
import { captureAndShare, getChildName, getStreak } from "@/lib/viralShare";
import { toast } from "sonner";

interface Props {
  achievementTitle: string;
  achievementEmoji: string;
  customMessage?: string;
  onClose: () => void;
}

const AchievementShareModal = ({
  achievementTitle,
  achievementEmoji,
  customMessage,
  onClose,
}: Props) => {
  const childName = getChildName();
  const streak = getStreak();
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!cardRef.current || sharing) return;
    setSharing(true);
    try {
      const ok = await captureAndShare(cardRef.current, {
        title: `${childName} desbloqueou: ${achievementTitle}!`,
        text: `${childName} acabou de conquistar "${achievementTitle}" no KIDZZ! ${achievementEmoji} Curiosidade que vira memória 💛`,
        filename: `kidzz-conquista-${achievementTitle.toLowerCase().replace(/\s+/g, "-")}.png`,
      });
      if (ok) toast.success("Conquista compartilhada! ✨");
    } catch {
      toast.error("Não foi possível compartilhar agora");
    } finally {
      setSharing(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero card preview (scaled) */}
        <div
          className="relative bg-gradient-to-br from-indigo-950 via-purple-900 to-amber-900 p-6 text-center text-white"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
          <p className="text-[10px] font-black tracking-[2px] text-amber-300/90 mb-3">
            ✨ NOVA CONQUISTA
          </p>
          <motion.div
            className="text-7xl mb-3"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
            style={{ filter: "drop-shadow(0 0 20px rgba(255,200,80,0.5))" }}
          >
            {achievementEmoji}
          </motion.div>
          <h2 className="text-xl font-black mb-1">{achievementTitle}</h2>
          <p className="text-sm font-bold text-white/85">
            {customMessage || `${childName} está arrasando! 🌟`}
          </p>
          {streak > 0 && (
            <span className="inline-block mt-3 text-xs font-black px-3 py-1 rounded-full bg-orange-500/25 text-orange-200 border border-orange-400/40">
              🔥 {streak} dias seguidos
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2">
          <motion.button
            onClick={handleShare}
            disabled={sharing}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-sm shadow-lg disabled:opacity-60"
            whileTap={{ scale: 0.97 }}
          >
            {sharing ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Gerando imagem...
              </>
            ) : (
              <>
                <Share2 size={18} /> 📤 Compartilhar conquista
              </>
            )}
          </motion.button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-bold text-gray-500"
          >
            Fechar
          </button>
        </div>
      </motion.div>

      {/* Off-screen capture target */}
      <div
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          pointerEvents: "none",
        }}
        aria-hidden
      >
        <ShareableAchievementCard
          ref={cardRef}
          childName={childName}
          achievementTitle={achievementTitle}
          achievementEmoji={achievementEmoji}
          streakDays={streak}
          customMessage={customMessage}
        />
      </div>
    </motion.div>
  );
};

export default AchievementShareModal;

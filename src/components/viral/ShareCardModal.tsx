/* ── ShareCardModal ──
   Universal share modal that supports 3 templates × 2 formats.
   - templates: "memory" | "story" | "achievement"
   - formats:   "square" (1:1) | "story" (9:16)

   The off-screen target is rendered with the chosen format and captured.
*/

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Share2, Loader2, Square, Smartphone } from "lucide-react";
import { captureAndShare, getChildName } from "@/lib/viralShare";
import { toast } from "sonner";
import ShareableMemoryCard from "./ShareableMemoryCard";
import ShareableStoryCard from "./ShareableStoryCard";
import ShareableAchievementCard from "./ShareableAchievementCard";

export type ShareTemplate = "memory" | "story" | "achievement";
export type ShareFormat = "square" | "story";

interface BaseProps {
  template: ShareTemplate;
  onClose: () => void;
}

interface MemoryProps extends BaseProps {
  template: "memory";
  question: string;
  answer: string;
}

interface StoryProps extends BaseProps {
  template: "story";
  title: string;
  emoji?: string;
}

interface AchievementProps extends BaseProps {
  template: "achievement";
  achievementTitle: string;
  achievementEmoji: string;
  customMessage?: string;
  streakDays?: number;
}

type Props = MemoryProps | StoryProps | AchievementProps;

const TEMPLATE_LABEL: Record<ShareTemplate, string> = {
  memory: "memória",
  story: "história",
  achievement: "conquista",
};

const ShareCardModal = (props: Props) => {
  const childName = getChildName();
  const cardRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<ShareFormat>("story");
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!cardRef.current || sharing) return;
    setSharing(true);
    try {
      let title = "";
      let text = "";
      let filename = "";

      if (props.template === "memory") {
        title = `${childName} perguntou algo incrível! ✨`;
        text = `${childName} perguntou: "${props.question}" — uma memória que vale guardar 💛`;
        filename = `kidzz-memoria-${Date.now()}.png`;
      } else if (props.template === "story") {
        title = `Nova história para ${childName} 📖`;
        text = `Acabei de criar "${props.title}" — uma história mágica para ${childName} no KIDZZ ✨`;
        filename = `kidzz-historia-${Date.now()}.png`;
      } else {
        title = `${childName} desbloqueou: ${props.achievementTitle}!`;
        text = `${childName} acabou de conquistar "${props.achievementTitle}" no KIDZZ! ${props.achievementEmoji}`;
        filename = `kidzz-conquista-${Date.now()}.png`;
      }

      const ok = await captureAndShare(cardRef.current, { title, text, filename });
      if (ok) toast.success("Compartilhado! ✨");
    } catch {
      toast.error("Não foi possível gerar a imagem agora");
    } finally {
      setSharing(false);
    }
  };

  const renderCard = (forCapture: boolean) => {
    const props2 = props as any;
    if (props.template === "memory") {
      return (
        <ShareableMemoryCard
          ref={forCapture ? cardRef : undefined}
          childName={childName}
          question={props2.question}
          answer={props2.answer}
          format={format}
        />
      );
    }
    if (props.template === "story") {
      return (
        <ShareableStoryCard
          ref={forCapture ? cardRef : undefined}
          childName={childName}
          title={props2.title}
          emoji={props2.emoji}
        />
      );
    }
    return (
      <ShareableAchievementCard
        ref={forCapture ? cardRef : undefined}
        childName={childName}
        achievementTitle={props2.achievementTitle}
        achievementEmoji={props2.achievementEmoji}
        streakDays={props2.streakDays}
        customMessage={props2.customMessage}
      />
    );
  };

  // memory card supports both formats; story/achievement: single format
  const supportsFormatToggle = props.template === "memory";

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={props.onClose}
    >
      <motion.div
        className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="text-sm font-black text-gray-800">
            Compartilhar {TEMPLATE_LABEL[props.template]}
          </h3>
          <button
            onClick={props.onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
            aria-label="Fechar"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Format toggle (only for memory which has both layouts) */}
        {supportsFormatToggle && (
          <div className="px-5 pb-3">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setFormat("story")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  format === "story" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"
                }`}
              >
                <Smartphone size={14} /> Stories 9:16
              </button>
              <button
                onClick={() => setFormat("square")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  format === "square" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"
                }`}
              >
                <Square size={14} /> Quadrado 1:1
              </button>
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="px-5 pb-3 flex items-center justify-center bg-gray-50">
          <div
            className="my-3 rounded-2xl overflow-hidden shadow-lg"
            style={{
              width: format === "story" && supportsFormatToggle ? 180 : 240,
              height: format === "story" && supportsFormatToggle ? 320 : 240,
            }}
          >
            <div
              style={{
                transform:
                  format === "story" && supportsFormatToggle
                    ? "scale(0.333)"
                    : "scale(0.444)",
                transformOrigin: "top left",
              }}
            >
              {renderCard(false)}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="px-5 pb-5 pt-1 space-y-2">
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
                <Share2 size={18} /> Compartilhar
              </>
            )}
          </motion.button>
          <button
            onClick={props.onClose}
            className="w-full py-2 text-xs font-bold text-gray-500"
          >
            Agora não
          </button>
        </div>
      </motion.div>

      {/* Off-screen capture target */}
      <div
        style={{ position: "fixed", left: "-9999px", top: 0, pointerEvents: "none" }}
        aria-hidden
      >
        {renderCard(true)}
      </div>
    </motion.div>
  );
};

export default ShareCardModal;

import { motion } from "framer-motion";
import { RotateCcw, Volume2, Share2, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import ChameleonMascot from "../ChameleonMascot";
import ShareableStoryCard from "../viral/ShareableStoryCard";
import { captureAndShare, getChildName } from "@/lib/viralShare";
import { toast } from "sonner";

interface StoryDisplayProps {
  story: string;
  images: string[];
  onReset: () => void;
  onSpeak?: (text: string) => Promise<void>;
}

const StoryDisplay = ({ story, images, onReset, onSpeak }: StoryDisplayProps) => {
  const scenes = story.split(/\[CENA \d+\]/).filter((s) => s.trim());
  const [playingScene, setPlayingScene] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const childName = getChildName();

  // Extract title from first sentence (max ~60 chars)
  const storyTitle = (() => {
    const firstScene = scenes[0]?.trim() || "";
    const firstSentence = firstScene.split(/[.!?\n]/)[0]?.trim() || "Aventura Mágica";
    return firstSentence.length > 60
      ? firstSentence.slice(0, 57) + "..."
      : firstSentence || "Aventura Mágica";
  })();

  const handleShare = async () => {
    if (!shareCardRef.current || sharing) return;
    setSharing(true);
    try {
      const ok = await captureAndShare(shareCardRef.current, {
        title: `Uma história mágica para ${childName}`,
        text: `Acabamos de criar "${storyTitle}" para ${childName} no KIDZZ! 📖✨ Histórias personalizadas que viram memória 💛`,
        filename: `kidzz-historia-${childName.toLowerCase()}.png`,
      });
      if (ok) toast.success("História compartilhada! ✨");
    } catch {
      toast.error("Não foi possível compartilhar agora");
    } finally {
      setSharing(false);
    }
  };

  const handleSpeak = async (scene: string, index: number) => {
    if (!onSpeak || playingScene !== null) return;
    setPlayingScene(index);
    try {
      await onSpeak(scene);
    } finally {
      setPlayingScene(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="text-center">
        <ChameleonMascot size="md" isTalking />
        <h2 className="text-xl font-extrabold text-white drop-shadow-lg mt-2">
          Uma Aventura Mágica! ✨
        </h2>
      </div>

      <div className="space-y-4">
        {scenes.map((scene, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="bg-black/30 backdrop-blur-md rounded-3xl p-4 border border-white/10"
          >
            {images[i] && (
              <img
                src={images[i]}
                alt={`Cena ${i + 1}`}
                className="w-full rounded-2xl mb-3 shadow-lg"
              />
            )}
            {scene
              .split("\n")
              .filter((p) => p.trim())
              .map((paragraph, pi) => (
                <p
                  key={pi}
                  className="text-white/90 text-sm leading-relaxed mb-2"
                >
                  {paragraph}
                </p>
              ))}
            {onSpeak && (
              <motion.button
                onClick={() => handleSpeak(scene, i)}
                disabled={playingScene !== null}
                className={`mt-3 w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 ${
                  playingScene === i
                    ? "bg-kid-yellow/80 text-foreground"
                    : "bg-gradient-to-r from-kid-purple to-kid-purple/80 text-white hover:from-kid-purple/90 hover:to-kid-purple/70"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Volume2 size={20} />
                {playingScene === i ? "Reproduzindo..." : `🔊 Ouvir Cena ${i + 1}`}
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <motion.button
          onClick={handleShare}
          disabled={sharing}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-kid-purple to-kid-pink text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
          whileTap={{ scale: 0.97 }}
        >
          {sharing ? (
            <><Loader2 size={18} className="animate-spin" /> Gerando imagem...</>
          ) : (
            <><Share2 size={18} /> 📤 Compartilhar esta história</>
          )}
        </motion.button>
        <motion.button
          onClick={onReset}
          className="w-full py-3 px-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95"
          whileTap={{ scale: 0.97 }}
        >
          <RotateCcw size={16} />
          Nova História
        </motion.button>
      </div>

      {/* Off-screen capture target */}
      <div
        style={{ position: "fixed", left: "-9999px", top: 0, pointerEvents: "none" }}
        aria-hidden
      >
        <ShareableStoryCard
          ref={shareCardRef}
          childName={childName}
          title={storyTitle}
          emoji="📖"
        />
      </div>
    </motion.div>
  );
};

export default StoryDisplay;

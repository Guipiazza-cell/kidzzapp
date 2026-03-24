import { motion } from "framer-motion";
import { RotateCcw, Volume2 } from "lucide-react";
import ChameleonMascot from "../ChameleonMascot";

interface StoryDisplayProps {
  story: string;
  images: string[];
  onReset: () => void;
  onSpeak?: (text: string) => void;
}

const StoryDisplay = ({ story, images, onReset, onSpeak }: StoryDisplayProps) => {
  const scenes = story.split(/\[CENA \d+\]/).filter((s) => s.trim());

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
              <button
                onClick={() => onSpeak(scene)}
                className="mt-2 flex items-center gap-1 text-xs text-kid-yellow/80 hover:text-kid-yellow"
              >
                <Volume2 size={14} />
                Ouvir cena
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <motion.button
          onClick={onReset}
          className="py-3 px-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-sm flex items-center gap-2 active:scale-95"
          whileTap={{ scale: 0.97 }}
        >
          <RotateCcw size={16} />
          Nova História
        </motion.button>
      </div>
    </motion.div>
  );
};

export default StoryDisplay;

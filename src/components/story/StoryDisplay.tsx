import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Volume2, Share2, Loader2, BookOpen, Download } from "lucide-react";
import { useRef, useState } from "react";
import ChameleonMascot from "../ChameleonMascot";
import ShareableStoryCard from "../viral/ShareableStoryCard";
import { captureAndShare, getChildName } from "@/lib/viralShare";
import { toast } from "sonner";
import { useTypewriter } from "@/hooks/useTypewriter";
import ReadingMode from "./ReadingMode";
import { exportStoryPDF } from "@/lib/exportStoryPDF";
import { haptic } from "@/lib/haptics";

interface StoryDisplayProps {
  story: string;
  images: string[];
  onReset: () => void;
  onSpeak?: (text: string) => Promise<void>;
  isPremium?: boolean;
}

const StoryDisplay = ({ story, images, onReset, onSpeak, isPremium = false }: StoryDisplayProps) => {
  const scenes = story.split(/\[CENA \d+\]/).filter((s) => s.trim());
  const [playingScene, setPlayingScene] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);
  const [reading, setReading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const childName = getChildName();

  // Typewriter only on the FIRST scene as a delight effect after generation.
  const firstScene = scenes[0] || "";
  const { shown: typedFirst, done: typedDone, skip: skipType } = useTypewriter(firstScene, 14);

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
    haptic("medium");
    setPlayingScene(index);
    try {
      await onSpeak(scene);
    } finally {
      setPlayingScene(null);
    }
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    haptic("medium");
    try {
      await exportStoryPDF({ title: storyTitle, childName, scenes, images });
      toast.success("PDF baixado! 📚");
      haptic("success");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar o PDF");
    } finally {
      setExporting(false);
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

      {/* CTA Modo Leitura imersivo */}
      <motion.button
        onClick={() => { haptic("medium"); setReading(true); }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2"
      >
        <BookOpen size={18} />
        📖 Modo leitura imersivo
      </motion.button>

      <div className="space-y-4">
        {scenes.map((scene, i) => {
          // First scene reveals with a typewriter effect for delight.
          const isFirst = i === 0;
          const sceneText = isFirst ? typedFirst : scene;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-black/30 backdrop-blur-md rounded-3xl p-4 border border-white/10"
              onClick={isFirst && !typedDone ? skipType : undefined}
            >
              {images[i] && (
                <img
                  src={images[i]}
                  alt={`Cena ${i + 1}`}
                  className="w-full rounded-2xl mb-3 shadow-lg"
                />
              )}
              {sceneText
                .split("\n")
                .filter((p) => p.trim())
                .map((paragraph, pi) => (
                  <p
                    key={pi}
                    className="text-white/90 text-sm leading-relaxed mb-2"
                  >
                    {paragraph}
                    {isFirst && !typedDone && pi === sceneText.split("\n").filter((x) => x.trim()).length - 1 && (
                      <span className="inline-block w-[2px] h-[1em] bg-white/80 ml-0.5 align-middle animate-pulse" />
                    )}
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
          );
        })}
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <motion.button
          onClick={() => {
            haptic("light");
            import("@/components/viral/KidzzShareTrigger").then(({ triggerKidzzShare }) =>
              triggerKidzzShare({
                title: storyTitle,
                subtitle: `acabou de criar "${storyTitle}" no Kidzz! 📖`,
                emoji: "📖",
                category: "story",
                shareSlug: "story-created",
              })
            );
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-kid-purple to-kid-pink text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95"
          whileTap={{ scale: 0.97 }}
        >
          <Share2 size={18} /> 📤 Compartilhar esta história
        </motion.button>
        <motion.button
          onClick={handleExport}
          disabled={exporting}
          className="w-full py-3.5 px-6 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
          whileTap={{ scale: 0.97 }}
        >
          {exporting ? (
            <><Loader2 size={18} className="animate-spin" /> Montando livrinho...</>
          ) : (
            <><Download size={18} /> 📚 Exportar como PDF</>
          )}
        </motion.button>
        <motion.button
          onClick={() => { haptic("light"); onReset(); }}
          className="w-full py-3 px-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95"
          whileTap={{ scale: 0.97 }}
        >
          <RotateCcw size={16} />
          Nova História
        </motion.button>
      </div>

      {/* Continuidade emocional — paywall após momento positivo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="mt-4 rounded-3xl p-5 text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(95,140,110,0.22), rgba(168,140,200,0.18))",
          border: "1px solid rgba(255,255,255,0.25)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 30px -12px rgba(95,140,110,0.4)",
        }}
      >
        <p className="text-base font-black text-white drop-shadow-md leading-tight">
          {isPremium
            ? "🌙 O universo de " + childName + " continua amanhã"
            : "Amanhã a aventura continua ✨"}
        </p>
        <p className="text-xs text-white/85 font-medium mt-1.5 leading-relaxed">
          {isPremium
            ? "Volte para escrever o próximo capítulo dessa história."
            : "Transforme isso em ritual — capítulos contínuos esperam vocês 🌿"}
        </p>
        {!isPremium && (
          <motion.button
            onClick={() => {
              haptic("medium");
              window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context: "story_continuation" } }));
            }}
            whileTap={{ scale: 0.96 }}
            className="mt-3 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white font-extrabold text-xs shadow-lg"
            style={{ background: "linear-gradient(135deg, #5A8F77, #8B6FB8)" }}
          >
            📖 Continuar essa história
          </motion.button>
        )}
      </motion.div>

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

      {/* Modo Leitura imersivo */}
      <AnimatePresence>
        {reading && (
          <ReadingMode
            title={storyTitle}
            childName={childName}
            story={story}
            images={images}
            onClose={() => setReading(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StoryDisplay;

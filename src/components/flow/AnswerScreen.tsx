import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, ArrowLeft, Heart, Sparkles, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ChameleonMascot from "../ChameleonMascot";
import { useTTS } from "@/hooks/useTTS";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  question: string;
  answer: string;
  onNewQuestion: () => void;
  onOpenStoryFactory: () => void;
}

const AnswerScreen = ({ question, answer, onNewQuestion, onOpenStoryFactory }: Props) => {
  const { speak, stop } = useTTS();
  const { profile, tier, handleCheckout } = useAuth();
  const [playing, setPlaying] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const isPremium = profile?.is_premium ?? false;
  const isSuperPremium = tier === "super_premium";

  useEffect(() => {
    if (!isPremium) {
      const t = setTimeout(() => setShowCTA(true), 3000);
      return () => clearTimeout(t);
    }
  }, [isPremium]);

  const handleSpeak = useCallback(async () => {
    if (playing) {
      stop();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    try {
      await speak(answer);
    } catch {
      toast.error("Erro na narração 🔊");
    } finally {
      setPlaying(false);
    }
  }, [playing, speak, stop, answer]);

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-2">
        <motion.button
          onClick={onNewQuestion}
          className="p-2 rounded-xl glass-card text-primary-foreground/60"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="flex-1 flex items-center gap-2">
          <ChameleonMascot size="sm" mood="happy" interactive={false} />
          <span className="text-lg font-black text-primary-foreground">Kidzz</span>
        </div>
        <motion.div
          className="flex items-center gap-1 glass-card px-3 py-1.5 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <Heart size={12} className="text-kid-pink" />
          <span className="text-[10px] text-primary-foreground/50 font-bold">+1 conexão</span>
        </motion.div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Question */}
        <motion.div
          className="mt-4 glass-card px-4 py-3 rounded-2xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-primary-foreground/30 text-xs font-bold">Pergunta:</p>
          <p className="text-primary-foreground text-sm font-bold mt-1">{question}</p>
        </motion.div>

        {/* Answer */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🦎</span>
            <span className="text-primary-foreground/40 text-xs font-bold uppercase tracking-wider">Resposta</span>
          </div>
          <div className="glass-card p-5 rounded-2xl border-2 border-kid-green/20">
            <div className="prose prose-sm max-w-none text-primary-foreground [&>p]:my-2 [&>ul]:my-2 [&>ol]:my-2 [&>h1]:text-primary-foreground [&>h2]:text-primary-foreground [&>h3]:text-primary-foreground [&>p]:text-primary-foreground/90 [&>li]:text-primary-foreground/90">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          </div>
        </motion.div>

        {/* Audio button - toggle play/stop */}
        <motion.button
          onClick={handleSpeak}
          className={`w-full mt-4 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base shadow-lg transition-all active:scale-[0.97] relative overflow-hidden ${
            playing
              ? "bg-kid-yellow/80 text-foreground"
              : "bg-gradient-to-r from-kid-green to-kid-green/80 text-white"
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.95 }}
        >
          {playing && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-kid-yellow/0 via-kid-yellow/30 to-kid-yellow/0"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {playing ? (
              <>
                <VolumeX size={22} />
                Parar narração
              </>
            ) : (
              <>
                <Volume2 size={22} />
                🔊 Ouvir resposta
              </>
            )}
          </span>
        </motion.button>

        {/* Story factory button for super premium */}
        {isSuperPremium && (
          <motion.button
            onClick={onOpenStoryFactory}
            className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-2xl glass-card text-primary-foreground font-bold text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileTap={{ scale: 0.95 }}
          >
            <BookOpen size={18} />
            Transformar em história
          </motion.button>
        )}

        {/* New question */}
        <motion.button
          onClick={onNewQuestion}
          className="w-full mt-3 py-4 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-yellow text-primary-foreground font-extrabold text-base shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
        >
          <Sparkles size={18} />
          Nova pergunta
        </motion.button>

        {/* CTA after value delivery */}
        {showCTA && !isPremium && (
          <motion.div
            className="mt-6 glass-card p-5 rounded-2xl text-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-primary-foreground font-bold text-sm leading-relaxed">
              Imagina ter isso disponível sempre que precisar... ✨
            </p>
            <motion.button
              onClick={() => handleCheckout("premium")}
              className="mt-3 w-full py-3.5 rounded-xl bg-gradient-to-r from-kid-purple to-kid-blue text-primary-foreground font-extrabold text-sm shadow-lg active:scale-[0.97] transition-transform"
              whileTap={{ scale: 0.95 }}
            >
              Desbloquear acesso completo
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AnswerScreen;

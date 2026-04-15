import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Zap } from "lucide-react";
import AvatarCustomization from "./AvatarCustomization";
import StoryForm from "./StoryForm";
import StoryDisplay from "./StoryDisplay";
import GeneratingOverlay from "./GeneratingOverlay";
import MagicalBackground from "../MagicalBackground";
import { useTTS } from "@/hooks/useTTS";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ChildAvatar } from "@/types/story";
import pixelImg from "@/assets/pixel-chameleon.png";

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-story`;

type Step = "intro" | "avatar" | "form" | "display";

const StoryFactory = ({ onBack }: {onBack: () => void;}) => {
  const { profile, canGenerateStory, storiesRemaining, incrementStories } = useAuth();
  const { speak } = useTTS();
  const childName = profile?.child_name || "Explorador";

  const [step, setStep] = useState<Step>("intro");
  const [avatar, setAvatar] = useState<ChildAvatar | null>(null);
  const [story, setStory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleAvatarComplete = useCallback((a: ChildAvatar) => {
    setAvatar(a);
    setStep("form");
  }, []);

  const handleGenerate = useCallback(async (age: number, interests: string) => {
    if (!avatar) return;
    if (!canGenerateStory()) {
      toast.error("Você atingiu o limite de 3 histórias por dia! Volte amanhã 💛");
      return;
    }
    setIsGenerating(true);
    setProgress(3);

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const target = 92 * (1 - Math.exp(-elapsed / 25));
      setProgress((p) => Math.max(p, target));
    }, 300);

    try {
      const resp = await fetch(GENERATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          childName,
          childAvatar: avatar,
          age,
          interests,
          ageRange: profile?.age_range || "3-7"
        })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erro" }));
        throw new Error(err.error || "Erro ao gerar história");
      }

      const data = await resp.json();
      setProgress(95);
      setStory(data.story);
      setImages(data.images || []);
      await incrementStories();
      setStep("display");
      toast.success(`História criada! ✨ (${storiesRemaining() - 1} restante${storiesRemaining() - 1 !== 1 ? 's' : ''} hoje)`);
    } catch (e: any) {
      console.error("Story generation error:", e);
      toast.error(e.message || "Erro ao gerar história");
    } finally {
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => setIsGenerating(false), 500);
    }
  }, [avatar, childName, profile?.age_range, canGenerateStory, incrementStories, storiesRemaining]);

  const handleReset = useCallback(() => {
    setStep("intro");
    setAvatar(null);
    setStory("");
    setImages([]);
  }, []);

  const handleSpeak = useCallback(async (text: string) => {
    try {
      await speak(text);
    } catch {
      toast.error("Erro na narração");
    }
  }, [speak]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">

      {/* Header */}
      <header className="relative z-10 flex items-center gap-3 px-4 pb-2" style={{ paddingTop: "calc(max(env(safe-area-inset-top, 12px), 16px) + 8px)" }}>
        <motion.button
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl glass-card text-gray-600"
          whileTap={{ scale: 0.9 }}>
          <ArrowLeft size={22} />
        </motion.button>
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-kid-orange" />
          <h1 className="text-lg font-extrabold text-gray-800 drop-shadow-sm">Fábrica de Histórias</h1>
          <span className="text-[10px] font-extrabold bg-gradient-to-r from-kid-orange to-kid-pink text-white px-2 py-0.5 rounded-full">
            SUPER PREMIUM
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 relative z-10 overflow-y-auto px-4 pb-6">
        {step === "intro" &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          
            <motion.img
              src={pixelImg}
              alt="Pixel"
              className="w-24 h-24 object-contain drop-shadow-xl"
              animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <h2 className="text-2xl font-extrabold text-gray-800 drop-shadow-sm">Uma história especial para {childName} 📖</h2>
            <p className="text-gray-500 text-sm max-w-[280px]">
              Crie histórias personalizadas com ilustrações exclusivas!
            </p>
            <span className="text-xs font-bold glass-card text-gray-600 px-3 py-1 rounded-full">
              {storiesRemaining()} de 3 histórias restantes hoje
            </span>

            <div className="glass-card rounded-3xl p-4 w-full max-w-xs space-y-2">
              {[
                { emoji: "🎨", text: "Crie o avatar do seu filho" },
                { emoji: "📝", text: "Escolha temas e interesses" },
                { emoji: "✨", text: "Vamos criar a história + ilustrações" },
                { emoji: "🔊", text: "Narração por voz inclusa" }
              ].map((item, i) =>
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 p-2">
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-sm text-gray-600 font-bold">{item.text}</span>
                </motion.div>
            )}
            </div>

            <motion.button
            onClick={() => setStep("avatar")}
            className="w-full max-w-xs py-5 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-pink text-white font-extrabold text-lg shadow-2xl flex items-center justify-center gap-2 active:scale-95"
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}>
              <Zap size={22} />
              Começar! 🚀
            </motion.button>
          </motion.div>
        }

        {step === "avatar" && <AvatarCustomization childName={childName} onComplete={handleAvatarComplete} />}
        {step === "form" && <StoryForm childName={childName} onGenerate={handleGenerate} isLoading={isGenerating} />}
        {step === "display" && <StoryDisplay story={story} images={images} onReset={handleReset} onSpeak={handleSpeak} />}
      </div>

      <GeneratingOverlay open={isGenerating} progress={progress} />
    </div>
  );
};

export default StoryFactory;

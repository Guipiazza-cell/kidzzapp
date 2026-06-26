import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Zap, Library } from "lucide-react";
import AvatarCustomization from "./AvatarCustomization";
import StoryForm from "./StoryForm";
import StoryDisplay from "./StoryDisplay";
import GeneratingOverlay from "./GeneratingOverlay";
import StoryGallery from "./StoryGallery";
import { useTTS } from "@/hooks/useTTS";
import { useAuth } from "@/contexts/AuthContext";
import { useMemories } from "@/hooks/useMemories";
import { toast } from "sonner";
import { ChildAvatar } from "@/types/story";
import LenteViva from "@/components/kidzz/LenteViva";
import { completeMissionStep, addXp, bumpSessionActions } from "@/lib/dailyMission";
import { showXpGained } from "@/components/flow/XpToast";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-story`;

type Step = "intro" | "avatar" | "form" | "display";

const StoryFactory = ({ onBack }: {onBack: () => void;}) => {
  const { user, session, profile, tier, canGenerateStory, storiesRemaining, incrementStories } = useAuth();
  const { speak } = useTTS();
  const { addMemory } = useMemories();
  const childName = profile?.child_name || "amigo";

  const [step, setStep] = useState<Step>("intro");
  const [avatar, setAvatar] = useState<ChildAvatar | null>(null);
  const [story, setStory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const handleAvatarComplete = useCallback((a: ChildAvatar) => {
    setAvatar(a);
    setStep("form");
  }, []);

  const handleGenerate = useCallback(async (age: number, interests: string) => {
    if (!avatar) return;
    if (!canGenerateStory()) {
      if (tier === "premium") {
        toast.info("O Kidzz ficou sonolento por aqui 😴 Volte amanhã para mais histórias 💛");
      } else if (tier === "kidzz") {
        toast.info("O Kidzz ficou sonolento por aqui 😴 Volte amanhã para mais histórias 💛");
      } else {
        toast.info("Sua história de hoje já foi criada! Desbloqueie o Kidzz e crie histórias à vontade ✨");
        window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context: "story_limit" } }));
      }
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
      if (!session?.access_token) {
        toast.error("Faça login para criar histórias.");
        setIsGenerating(false);
        clearInterval(timer);
        return;
      }
      const resp = await fetch(GENERATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          childName,
          childAvatar: avatar,
          age,
          interests,
          ageRange: profile?.age_range || "3-7",
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

      // Auto-save story to memories (galeria)
      try {
        const firstScene = (data.story || "").split(/\[CENA \d+\]/).filter((s: string) => s.trim())[0] || "";
        const firstSentence = firstScene.split(/[.!?\n]/)[0]?.trim() || "Aventura Mágica";
        const title = firstSentence.length > 60 ? firstSentence.slice(0, 57) + "..." : firstSentence;
        await addMemory({
          type: "story",
          title,
          content: data.story,
          is_special: false,
          image_url: data.images?.[0] || null,
          metadata: { age, interests, scenes: data.images?.length ?? 0 },
        });
      } catch (e) {
        console.warn("Could not save story to memories", e);
      }

      setStep("display");
      // Daily mission + XP
      const { newlyMarked } = completeMissionStep("story");
      if (newlyMarked) {
        const { gained } = addXp("story");
        showXpGained(gained, "história");
      }
      bumpSessionActions();
      sfx("complete");
      haptic("success");
      toast.success(`História criada! ✨ (${storiesRemaining() - 1} restante${storiesRemaining() - 1 !== 1 ? 's' : ''} hoje)`);
    } catch (e: any) {
      console.error("Story generation error:", e);
      sfx("error");
      haptic("error");
      toast.error(e.message || "Erro ao gerar história");
    } finally {
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => setIsGenerating(false), 500);
    }
  }, [avatar, childName, profile?.age_range, canGenerateStory, incrementStories, storiesRemaining, addMemory]);

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
    <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">

      {/* Header — dynamic island */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center gap-2 px-3 pb-2" style={{ paddingTop: "calc(max(env(safe-area-inset-top, 12px), 16px) + 8px)" }}>
        <motion.button
          onClick={onBack}
          className="glass-island min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-gray-700"
          whileTap={{ scale: 0.9 }}>
          <ArrowLeft size={20} />
        </motion.button>
        <div className="glass-island flex-1 min-w-0 flex items-center gap-2 px-3.5 py-2 rounded-full font-ui">
          <BookOpen size={16} className="text-kid-orange shrink-0" />
          <h1 className="font-display text-[17px] font-semibold truncate">Fábrica de Histórias</h1>
          <span className="ml-auto text-[9.5px] font-extrabold bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-0.5 rounded-full shrink-0">
            EXCLUSIVO
          </span>
        </div>
        <motion.button
          onClick={() => setGalleryOpen(true)}
          className="glass-island min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-amber-600"
          whileTap={{ scale: 0.9 }}
          aria-label="Galeria de histórias"
        >
          <Library size={18} />
        </motion.button>
      </header>

      {/* Content */}
      <div
        className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden overscroll-contain px-4"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 80px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)",
        }}
      >
        {step === "intro" &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          
            <LenteViva accent="#E8821A" motif="book" label="Fábrica de Histórias" />

            <h2 className="font-display text-[30px] leading-[1.1] font-semibold text-[#2A2520] tracking-tight">
              Uma história, só dele.
            </h2>
            <p className="text-[#2A2520]/70 text-[14px] font-medium max-w-[300px] leading-snug">
              Criada com o nome, o rosto e o mundo do seu filho.
            </p>
            <span className="text-[11px] font-bold text-[#2A2520]/80 px-3 py-1 rounded-full border border-[#E8821A]/25"
              style={{ background: "rgba(232,130,26,0.10)" }}>
              {storiesRemaining()} {storiesRemaining() === 1 ? "história gratuita" : "histórias gratuitas"} hoje
            </span>

            <div className="w-full max-w-xs rounded-3xl p-4 space-y-2"
              style={{ background: "#FFFCF8", boxShadow: "0 4px 20px rgba(42,37,32,0.06)" }}>
              {[
                "Monte o avatar do seu filho",
                "Escolha temas e interesses",
                "Geramos história + ilustrações",
                "Narração com voz suave",
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.08 }}
                  className="flex items-center gap-3 p-2"
                >
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(232,130,26,0.12)", color: "#E8821A" }}
                    aria-hidden
                  >
                    <span className="text-[15px] font-black">{i + 1}</span>
                  </span>
                  <span className="text-[14px] text-[#2A2520] font-semibold">{text}</span>
                </motion.div>
              ))}
            </div>

            <motion.button
              onClick={() => setStep("avatar")}
              className="w-full max-w-xs py-4 rounded-full text-white font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95"
              style={{
                background: "#E8821A",
                boxShadow: "0 10px 24px -8px rgba(232,130,26,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
                fontFamily: "'Mulish', system-ui, sans-serif",
              }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}>
              Criar a história
            </motion.button>
          </motion.div>
        }

        {step === "avatar" && <AvatarCustomization childName={childName} onComplete={handleAvatarComplete} />}
        {step === "form" && (
          <StoryForm
            childName={childName}
            onGenerate={handleGenerate}
            isLoading={isGenerating}
            storiesRemaining={storiesRemaining()}
            isPremium={tier !== "free"}
            onUpgrade={() => window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context: "story_limit" } }))}
          />
        )}
        {step === "display" && <StoryDisplay story={story} images={images} onReset={handleReset} onSpeak={handleSpeak} isPremium={tier !== "free"} />}
      </div>

      <GeneratingOverlay open={isGenerating} progress={progress} />

      <AnimatePresence>
        {galleryOpen && <StoryGallery onClose={() => setGalleryOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default StoryFactory;

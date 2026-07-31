import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, ArrowLeft, Heart, Sparkles, BookOpen, Bookmark, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import confetti from "canvas-confetti";
import { useTTS } from "@/hooks/useTTS";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMemories } from "@/hooks/useMemories";
import { useAchievementSync } from "@/hooks/useAchievementSync";
import ShareCardModal from "@/components/viral/ShareCardModal";
import { CAMALEAO } from "@/lib/camaleaoOficial";
import { FONT, SERIF, R, glassLight, glassLightSoft, pillGlassLight } from "@/lib/premiumUi";

const BG = "/exemplos/assets/perguntas-v2/bg-floresta.png";

interface Props {
  question: string;
  answer: string;
  onNewQuestion: () => void;
  onOpenStoryFactory: () => void;
}

const AnswerScreen = ({ question, answer, onNewQuestion, onOpenStoryFactory }: Props) => {
  const { speak, stop } = useTTS();
  const { profile, tier, handleCheckout, user } = useAuth();
  const { addMemory } = useMemories();
  const { trackEvent } = useAchievementSync();
  const [playing, setPlaying] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [memorySaved, setMemorySaved] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const isPremium = profile?.is_premium ?? false;
  const isSuperPremium = tier === "premium";
  const trackedRef = useRef(false);
  const logIdRef = useRef<string | null>(null);
  const loggedRef = useRef(false);

  // Reward loop: 2.5s celebration + confetti + XP toast on mount
  useEffect(() => {
    // fire confetti once per answer
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        startVelocity: 32,
        origin: { y: 0.4 },
        colors: ["#FFD700", "#FFA500", "#FF6B9D", "#A855F7", "#7BB6FF"],
        scalar: 1,
      });
    } catch { /* noop */ }

    // GeneratingScreen already incremented questions - only check badges here
    if (!trackedRef.current) {
      trackedRef.current = true;
      trackEvent("question-checkonly");
      toast.success("+1 ponto de sabedoria", { duration: 2500 });
    }

    // Persist Q&A to parent log (one row per answer rendered).
    if (!loggedRef.current && user && question && answer) {
      loggedRef.current = true;
      supabase
        .from("kidzz_questions_log")
        .insert({
          user_id: user.id,
          question,
          answer,
          age_range: profile?.age_range ?? null,
          was_narrated: false,
        })
        .select("id")
        .single()
        .then(({ data, error }) => {
          if (error) console.warn("[Kidzz] log insert failed:", error.message);
          else logIdRef.current = data?.id ?? null;
        });
    }

    if (!isPremium) {
      const tCTA = setTimeout(() => setShowCTA(true), 3000);
      return () => clearTimeout(tCTA);
    }
    return;
  }, [isPremium, trackEvent, user, question, answer, profile?.age_range]);

  const handleSpeak = useCallback(async () => {
    if (playing) {
      stop();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    try {
      await speak(answer);
      // Mark answer as narrated in parent log (best-effort).
      if (logIdRef.current && user) {
        supabase
          .from("kidzz_questions_log")
          .update({ was_narrated: true })
          .eq("id", logIdRef.current)
          .then(({ error }) => {
            if (error) console.warn("[Kidzz] narration flag failed:", error.message);
          });
      }
    } catch {
      toast.error("Erro na narração");
    } finally {
      setPlaying(false);
    }
  }, [playing, speak, stop, answer, user]);

  const handleSaveMemory = useCallback(async () => {
    if (memorySaved) return;
    const saved = await addMemory({
      type: "question",
      title: question,
      content: answer,
      is_special: false,
      image_url: null,
      metadata: { saved_from: "answer_screen" },
    });
    if (saved) {
      setMemorySaved(true);
      toast.success("Salvo em Memórias", { duration: 2000 });
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 }, colors: ["#FF6B9D", "#FFD700"] });
      } catch { /* noop */ }
    } else {
      toast.error("Faça login para salvar memórias");
    }
  }, [memorySaved, addMemory, question, answer]);

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden relative min-h-0"
      style={{ fontFamily: FONT }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Fundo floresta (mesmo padrão da home Perguntas) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <img
          src={BG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 28%", filter: "saturate(1.06) brightness(1.05)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,236,180,.42) 0%, transparent 55%)," +
              "linear-gradient(180deg, rgba(255,252,245,.55) 0%, rgba(248,244,234,.72) 38%, rgba(240,248,232,.88) 100%)",
          }}
        />
        {/* liquid dust */}
        <div
          style={{
            position: "absolute",
            top: "18%",
            left: "12%",
            width: 6,
            height: 6,
            borderRadius: 99,
            background: "#FFF3CC",
            boxShadow: "0 0 10px 2px rgba(255,225,150,.65)",
            animation: "ans-dust 9s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "48%",
            right: "16%",
            width: 5,
            height: 5,
            borderRadius: 99,
            background: "#EAFBD0",
            boxShadow: "0 0 9px 2px rgba(200,240,150,.55)",
            animation: "ans-dust 11s linear 2s infinite",
          }}
        />
      </div>
      <style>{`
        @keyframes ans-dust {
          0% { transform: translateY(0) translateX(0); opacity: .35 }
          50% { opacity: .9 }
          100% { transform: translateY(-40px) translateX(12px); opacity: .2 }
        }
        @keyframes ans-shine {
          0% { transform: translateX(-120%) skewX(-16deg) }
          60%,100% { transform: translateX(220%) skewX(-16deg) }
        }
      `}</style>

      {/* Header glass */}
      <header
        className="relative z-20 flex items-center gap-2 px-4"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 8px), 12px)",
          paddingBottom: 10,
        }}
      >
        <motion.button
          type="button"
          onClick={onNewQuestion}
          aria-label="Voltar"
          className="active:scale-95 flex items-center justify-center"
          style={{
            width: 44,
            height: 44,
            borderRadius: R.btn,
            color: "#1F2E18",
            ...pillGlassLight,
          }}
          whileTap={{ scale: 0.92 }}
        >
          <ArrowLeft size={19} strokeWidth={2.2} />
        </motion.button>
        <div
          className="flex-1 min-w-0 flex items-center justify-center gap-2 px-3"
          style={{
            minHeight: 44,
            borderRadius: R.btn,
            ...pillGlassLight,
          }}
        >
          <span
            style={{
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 15,
              color: "#1F2E18",
            }}
          >
            Resposta
          </span>
        </div>
        <motion.div
          className="flex items-center gap-1.5 px-3"
          style={{
            minHeight: 44,
            borderRadius: R.btn,
            ...pillGlassLight,
          }}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, type: "spring" }}
        >
          <Heart size={13} color="#E07090" fill="#E07090" />
          <span style={{ fontSize: 11, fontWeight: 800, color: "#5A4A38" }}>+1</span>
        </motion.div>
      </header>

      {/* Content */}
      <div
        className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 128px)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Gui cutout sutil */}
        <div className="flex justify-center pt-1 pb-2" aria-hidden>
          <motion.img
            src={CAMALEAO.cutout}
            alt=""
            draggable={false}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: [0, -6, 0], opacity: 1 }}
            transition={{
              opacity: { duration: 0.35 },
              y: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{
              width: 88,
              height: 112,
              objectFit: "contain",
              filter: "drop-shadow(0 12px 20px rgba(40,50,30,.22))",
            }}
          />
        </div>

        {/* Pergunta — glass */}
        <motion.div
          className="relative overflow-hidden"
          style={{ ...glassLight, borderRadius: R.card, padding: "14px 16px" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "45%",
              height: "100%",
              background:
                "linear-gradient(105deg, transparent, rgba(255,255,255,.4) 50%, transparent)",
              animation: "ans-shine 7s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "1.1px",
              textTransform: "uppercase",
              color: "rgba(60,80,45,.55)",
            }}
          >
            Pergunta
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 16,
              lineHeight: 1.35,
              color: "#1F2E18",
            }}
          >
            {question}
          </p>
        </motion.div>

        {/* Resposta — glass liquid */}
        <motion.div
          className="mt-3 relative overflow-hidden"
          style={{ ...glassLight, borderRadius: R.card, padding: "16px 16px 18px" }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "50%",
              height: "100%",
              background:
                "linear-gradient(105deg, transparent, rgba(255,255,255,.38) 50%, transparent)",
              animation: "ans-shine 8s ease-in-out 1s infinite",
              pointerEvents: "none",
            }}
          />
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "1.1px",
              textTransform: "uppercase",
              color: "rgba(60,80,45,.55)",
            }}
          >
            Resposta
          </p>
          <div
            className="prose prose-sm max-w-none relative z-[1] [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_h1]:text-[#1F2E18] [&_h2]:text-[#1F2E18] [&_h3]:text-[#1F2E18] [&_p]:text-[#2A3A22] [&_li]:text-[#2A3A22] [&_strong]:text-[#1F2E18]"
            style={{ fontSize: 14.5, lineHeight: 1.55, fontWeight: 600 }}
          >
            <ReactMarkdown>{answer}</ReactMarkdown>
          </div>
        </motion.div>

        {/* Ouvir */}
        <motion.button
          type="button"
          onClick={handleSpeak}
          className="relative w-full mt-3 overflow-hidden active:scale-[0.98]"
          style={{
            minHeight: 52,
            borderRadius: R.btn,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontWeight: 900,
            fontSize: 15,
            color: playing ? "#3A2A10" : "#fff",
            background: playing
              ? "linear-gradient(135deg, rgba(255,230,140,.92), rgba(242,190,70,.88))"
              : "linear-gradient(135deg, #5CB57A 0%, #3E9A52 55%, #2E7A42 100%)",
            border: playing
              ? "0.5px solid rgba(255,220,120,.7)"
              : "0.5px solid rgba(255,255,255,.45)",
            boxShadow: playing
              ? "0 10px 24px rgba(200,150,40,.28)"
              : "0 12px 28px rgba(46,122,66,.32), inset 0 1px 0 rgba(255,255,255,.35)",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          whileTap={{ scale: 0.97 }}
        >
          {playing && (
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(120deg, transparent 30%, rgba(255,255,255,.4) 50%, transparent 70%)",
              }}
              animate={{ x: ["-110%", "120%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {playing ? (
              <>
                <VolumeX size={20} /> Parar narração
              </>
            ) : (
              <>
                <Volume2 size={20} /> Ouvir resposta
              </>
            )}
          </span>
        </motion.button>

        {/* Salvar + compartilhar */}
        <motion.div
          className="mt-2.5 grid grid-cols-2 gap-2.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
        >
          <motion.button
            type="button"
            onClick={handleSaveMemory}
            disabled={memorySaved}
            className="active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              minHeight: 48,
              borderRadius: R.btn,
              fontWeight: 800,
              fontSize: 13,
              ...(memorySaved
                ? {
                    ...glassLightSoft,
                    color: "#2E7A42",
                    border: "0.5px solid rgba(62,154,82,.45)",
                  }
                : {
                    color: "#fff",
                    background: "linear-gradient(135deg, #E882A0, #9A6CF0)",
                    border: "0.5px solid rgba(255,255,255,.4)",
                    boxShadow: "0 8px 20px rgba(120,60,160,.28)",
                  }),
            }}
            whileTap={memorySaved ? undefined : { scale: 0.97 }}
          >
            <Bookmark size={15} fill={memorySaved ? "currentColor" : "none"} />
            {memorySaved ? "Salvo" : "Salvar memória"}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setShowShare(true)}
            className="active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              minHeight: 48,
              borderRadius: R.btn,
              fontWeight: 800,
              fontSize: 13,
              color: "#2A3A22",
              ...pillGlassLight,
            }}
            whileTap={{ scale: 0.97 }}
          >
            <Share2 size={15} /> Compartilhar
          </motion.button>
        </motion.div>

        {isSuperPremium && (
          <motion.button
            type="button"
            onClick={onOpenStoryFactory}
            className="w-full mt-2.5 flex items-center justify-center gap-2 active:scale-[0.98]"
            style={{
              minHeight: 48,
              borderRadius: R.btn,
              fontWeight: 800,
              fontSize: 13.5,
              color: "#2A3A22",
              ...glassLightSoft,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.97 }}
          >
            <BookOpen size={16} />
            Transformar em história
          </motion.button>
        )}

        <motion.button
          type="button"
          onClick={onNewQuestion}
          className="w-full mt-2.5 flex items-center justify-center gap-2 active:scale-[0.98]"
          style={{
            minHeight: 52,
            borderRadius: R.btn,
            fontWeight: 900,
            fontSize: 15,
            color: "#fff",
            background: "linear-gradient(135deg, #F0A020 0%, #E8821A 50%, #E07090 130%)",
            border: "0.5px solid rgba(255,220,140,.5)",
            boxShadow: "0 12px 28px rgba(212,120,26,.32), inset 0 1px 0 rgba(255,255,255,.35)",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          whileTap={{ scale: 0.97 }}
        >
          <Sparkles size={17} />
          Nova pergunta
        </motion.button>

        <motion.p
          className="text-center mt-4 mb-2"
          style={{
            margin: "16px 0 8px",
            fontSize: 11.5,
            fontWeight: 800,
            color: "rgba(50,70,40,.5)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Isso pode marcar a vida do seu filho
        </motion.p>

        {showCTA && !isPremium && (
          <motion.div
            className="mt-2 text-center relative overflow-hidden"
            style={{ ...glassLight, borderRadius: R.card, padding: "18px 16px" }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 16,
                lineHeight: 1.35,
                color: "#1F2E18",
              }}
            >
              Quer ter respostas assim sempre que seu filho perguntar?
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(50,70,40,.55)",
              }}
            >
              Nunca mais trave na frente do seu filho
            </p>
            <motion.button
              type="button"
              onClick={() => handleCheckout("premium")}
              className="mt-3.5 w-full active:scale-[0.98]"
              style={{
                minHeight: 48,
                borderRadius: R.btn,
                fontWeight: 900,
                fontSize: 14,
                color: "#fff",
                background: "linear-gradient(135deg, #9A6CF0, #E07090)",
                border: "0.5px solid rgba(255,255,255,.4)",
                boxShadow: "0 10px 24px rgba(120,60,160,.3)",
              }}
              whileTap={{ scale: 0.97 }}
            >
              Desbloquear acesso completo
            </motion.button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showShare && (
          <ShareCardModal
            template="memory"
            question={question}
            answer={answer}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnswerScreen;

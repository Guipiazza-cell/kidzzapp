import { useState, useCallback, useEffect, useRef, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, ArrowLeft, Heart, Sparkles, Bookmark, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import confetti from "canvas-confetti";
import { useTTS } from "@/hooks/useTTS";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMemories } from "@/hooks/useMemories";
import { useAchievementSync } from "@/hooks/useAchievementSync";
import ShareCardModal from "@/components/viral/ShareCardModal";
import { FONT, SERIF, R } from "@/lib/premiumUi";

const BG = "/exemplos/assets/perguntas-v2/bg-floresta.png";

/** Mesmo liquid glass do dock (BottomNav): cards leves e translúcidos */
const dockGlass: CSSProperties = {
  background:
    "linear-gradient(165deg, rgba(255,255,255,.42) 0%, rgba(255,255,255,.22) 48%, rgba(255,255,255,.16) 100%)",
  border: "0.5px solid rgba(255,255,255,.55)",
  boxShadow:
    "0 12px 36px rgba(20,16,30,.16), 0 2px 8px rgba(20,16,30,.06), inset 0 1px 0 rgba(255,255,255,.72), inset 0 -1px 0 rgba(255,255,255,.12)",
  backdropFilter: "blur(32px) saturate(190%)",
  WebkitBackdropFilter: "blur(32px) saturate(190%)",
};

const dockPill: CSSProperties = {
  ...dockGlass,
  borderRadius: R.btn,
};

const dockCard: CSSProperties = {
  ...dockGlass,
  borderRadius: 26,
};

interface Props {
  question: string;
  answer: string;
  onNewQuestion: () => void;
  onOpenStoryFactory: () => void;
}

const AnswerScreen = ({ question, answer, onNewQuestion, onOpenStoryFactory }: Props) => {
  const { speak, stop } = useTTS();
  const { profile, handleCheckout, user } = useAuth();
  const { addMemory } = useMemories();
  const { trackEvent } = useAchievementSync();
  const [playing, setPlaying] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [memorySaved, setMemorySaved] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const isPremium = profile?.is_premium ?? false;
  
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
      {/* Fundo floresta + véu suave (conteúdo “flutua” no vidro do dock) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <img
          src={BG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 32%", filter: "saturate(1.08) brightness(1.02)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 55% at 50% 8%, rgba(255,240,200,.38) 0%, transparent 58%)," +
              "linear-gradient(180deg, rgba(255,252,248,.35) 0%, rgba(245,250,240,.55) 45%, rgba(235,245,230,.78) 100%)",
          }}
        />
      </div>
      <style>{`
        @keyframes ans-ring {
          0% { transform: scale(.86); opacity: .55 }
          50% { transform: scale(1.08); opacity: .15 }
          100% { transform: scale(.86); opacity: .55 }
        }
        @keyframes ans-sheen {
          0% { transform: translateX(-130%) skewX(-14deg) }
          55%,100% { transform: translateX(210%) skewX(-14deg) }
        }
      `}</style>

      {/* Header dock-style */}
      <header
        className="relative z-20 flex items-center gap-2 px-4"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 8px), 12px)",
          paddingBottom: 8,
        }}
      >
        <motion.button
          type="button"
          onClick={onNewQuestion}
          aria-label="Voltar"
          className="active:scale-95 flex items-center justify-center"
          style={{ width: 44, height: 44, color: "#1F2E18", ...dockPill }}
          whileTap={{ scale: 0.92 }}
        >
          <ArrowLeft size={19} strokeWidth={2.2} />
        </motion.button>
        <div
          className="flex-1 min-w-0 flex items-center justify-center gap-2 px-3"
          style={{ minHeight: 44, ...dockPill }}
        >
          <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15, color: "#1F2E18" }}>
            Resposta
          </span>
        </div>
        <motion.div
          className="flex items-center gap-1.5 px-3"
          style={{ minHeight: 44, ...dockPill }}
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 280 }}
        >
          <Heart size={13} color="#E07090" fill="#E07090" />
          <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(45,40,55,.72)" }}>+1</span>
        </motion.div>
      </header>

      <div
        className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 128px)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Hero inovador: orbe liquid “pronto” (sem mascote) */}
        <motion.div
          className="flex flex-col items-center pt-3 pb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: -10,
                borderRadius: "50%",
                border: "1.5px solid rgba(92,181,122,.35)",
                animation: "ans-ring 2.6s ease-in-out infinite",
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: -2,
                background:
                  "radial-gradient(circle at 35% 30%, rgba(255,255,255,.55), rgba(140,210,160,.25) 45%, rgba(92,181,122,.12) 100%)",
                ...dockGlass,
                borderRadius: "50%",
              }}
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 14, delay: 0.15 }}
              style={{
                position: "relative",
                width: 52,
                height: 52,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(145deg, #7EC98A 0%, #4EA35E 55%, #2E7A42 100%)",
                boxShadow:
                  "0 10px 22px rgba(46,122,66,.35), inset 0 1px 0 rgba(255,255,255,.45)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#fff"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </div>
          <p
            style={{
              margin: "12px 0 0",
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 20,
              color: "#1F2E18",
              letterSpacing: "-0.3px",
              textShadow: "0 1px 12px rgba(255,255,255,.5)",
            }}
          >
            Pronto pra vocês
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12.5,
              fontWeight: 700,
              color: "rgba(45,55,40,.58)",
            }}
          >
            Uma resposta pensada pra idade certa
          </p>
        </motion.div>

        {/* Pergunta: dock glass + barra lateral */}
        <motion.div
          className="relative overflow-hidden"
          style={{ ...dockCard, padding: "14px 16px 14px 18px" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              top: 12,
              bottom: 12,
              width: 3.5,
              borderRadius: 99,
              background: "linear-gradient(180deg, #A8E8B8, #5CB57A 50%, #3E9A52)",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(105deg, transparent 20%, rgba(255,255,255,.28) 48%, transparent 70%)",
              animation: "ans-sheen 8s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "1.15px",
              textTransform: "uppercase",
              color: "rgba(45,55,40,.5)",
            }}
          >
            Pergunta
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 16.5,
              lineHeight: 1.38,
              color: "#1A2818",
            }}
          >
            {question}
          </p>
        </motion.div>

        {/* Resposta: dock glass */}
        <motion.div
          className="mt-3 relative overflow-hidden"
          style={{ ...dockCard, padding: "16px 16px 18px" }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(105deg, transparent 15%, rgba(255,255,255,.26) 50%, transparent 75%)",
              animation: "ans-sheen 9s ease-in-out 1.2s infinite",
              pointerEvents: "none",
            }}
          />
          <div className="relative z-[1] flex items-center gap-2 mb-2.5">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                background: "linear-gradient(135deg,#7EC98A,#3E9A52)",
                boxShadow: "0 0 0 3px rgba(92,181,122,.22)",
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "1.15px",
                textTransform: "uppercase",
                color: "rgba(45,55,40,.5)",
              }}
            >
              Resposta
            </p>
          </div>
          <div
            className="prose prose-sm max-w-none relative z-[1] [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_h1]:text-[#1A2818] [&_h2]:text-[#1A2818] [&_h3]:text-[#1A2818] [&_p]:text-[#243222] [&_li]:text-[#243222] [&_strong]:text-[#1A2818]"
            style={{ fontSize: 14.5, lineHeight: 1.58, fontWeight: 600 }}
          >
            <ReactMarkdown>{answer}</ReactMarkdown>
          </div>
        </motion.div>

        {/* Ações: dock glass + CTA dourado */}
        <motion.button
          type="button"
          onClick={handleSpeak}
          className="relative w-full mt-3 overflow-hidden active:scale-[0.98]"
          style={{
            minHeight: 52,
            ...dockPill,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontWeight: 900,
            fontSize: 15,
            color: playing ? "#2A3A22" : "#1A2818",
            background: playing
              ? "linear-gradient(165deg, rgba(255,240,180,.55) 0%, rgba(255,220,120,.35) 100%)"
              : dockGlass.background,
            border: playing
              ? "0.5px solid rgba(255,210,100,.55)"
              : dockGlass.border,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          whileTap={{ scale: 0.97 }}
        >
          {playing && (
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(120deg, transparent 30%, rgba(255,255,255,.45) 50%, transparent 70%)",
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

        <motion.div
          className="mt-2.5 grid grid-cols-2 gap-2.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            type="button"
            onClick={handleSaveMemory}
            disabled={memorySaved}
            className="active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              minHeight: 48,
              fontWeight: 800,
              fontSize: 13,
              color: memorySaved ? "#2E7A42" : "#1A2818",
              ...dockPill,
              ...(memorySaved
                ? {
                    background:
                      "linear-gradient(165deg, rgba(160,220,170,.4) 0%, rgba(120,190,140,.22) 100%)",
                    border: "0.5px solid rgba(92,181,122,.45)",
                  }
                : {}),
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
              fontWeight: 800,
              fontSize: 13,
              color: "#1A2818",
              ...dockPill,
            }}
            whileTap={{ scale: 0.97 }}
          >
            <Share2 size={15} /> Compartilhar
          </motion.button>
        </motion.div>




        <motion.button
          type="button"
          onClick={onNewQuestion}
          className="w-full mt-2.5 flex items-center justify-center gap-2 active:scale-[0.98]"
          style={{
            minHeight: 52,
            borderRadius: R.btn,
            fontWeight: 900,
            fontSize: 15,
            color: "#2A1608",
            background: "linear-gradient(180deg, #FBE09A 0%, #E8A838 48%, #C87818 100%)",
            border: "0.5px solid rgba(255,235,190,.65)",
            boxShadow:
              "0 8px 24px rgba(180,100,20,.35), 0 1px 0 rgba(255,250,230,.85) inset, 0 -3px 8px rgba(100,50,0,.16) inset",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          whileTap={{ scale: 0.97 }}
        >
          <Sparkles size={17} />
          Nova pergunta
        </motion.button>

        <motion.p
          style={{
            margin: "18px 0 8px",
            textAlign: "center",
            fontSize: 11.5,
            fontWeight: 800,
            color: "rgba(45,55,40,.48)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          Isso pode marcar a vida do seu filho
        </motion.p>

        {showCTA && !isPremium && (
          <motion.div
            className="mt-1 text-center relative overflow-hidden"
            style={{ ...dockCard, padding: "18px 16px" }}
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
                color: "#1A2818",
              }}
            >
              Quer ter respostas assim sempre que seu filho perguntar?
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(45,55,40,.52)",
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
                boxShadow: "0 10px 24px rgba(120,60,160,.28)",
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

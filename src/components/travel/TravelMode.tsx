import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Car, Play, Pause, SkipForward, X, Volume2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMemories } from "@/hooks/useMemories";
import { useAchievementSync } from "@/hooks/useAchievementSync";
import KidzzChameleon, { type KidzzState } from "@/components/kidzz/KidzzChameleon";
import CosmicRoad from "./CosmicRoad";
import confetti from "canvas-confetti";

/* ─── Question Bank ─── */
const TRAVEL_QUESTIONS: Record<string, { text: string; emoji: string }[]> = {
  Tudo: [
    { text: "Se você pudesse ter qualquer superpoder, qual seria?", emoji: "🦸" },
    { text: "O que existe no fundo do oceano?", emoji: "🌊" },
    { text: "Se os animais pudessem falar, o que diriam?", emoji: "🐾" },
    { text: "Como seria viver em outro planeta?", emoji: "🪐" },
    { text: "Por que o céu muda de cor?", emoji: "🌅" },
    { text: "Se você inventasse algo, o que seria?", emoji: "💡" },
    { text: "O que faz uma pessoa ser corajosa?", emoji: "🦁" },
    { text: "Como seria o mundo sem cores?", emoji: "🎨" },
    { text: "Por que sentimos saudade?", emoji: "❤️" },
    { text: "Se pudesse viajar no tempo, iria pro passado ou futuro?", emoji: "⏳" },
    { text: "Você pisaria na Lua se pudesse?", emoji: "🌙" },
  ],
  Natureza: [
    { text: "Por que as árvores perdem folhas?", emoji: "🍂" },
    { text: "Como os animais sabem que vai chover?", emoji: "🌧️" },
    { text: "Por que o mar é salgado?", emoji: "🌊" },
    { text: "Como as borboletas ganham suas cores?", emoji: "🦋" },
    { text: "Para onde vão os pássaros no inverno?", emoji: "🐦" },
  ],
  Universo: [
    { text: "O que acontece dentro de um buraco negro?", emoji: "🕳️" },
    { text: "Por que as estrelas brilham?", emoji: "⭐" },
    { text: "Se os planetas pudessem falar, o que diriam?", emoji: "🪐" },
    { text: "O que existia antes do Big Bang?", emoji: "💥" },
    { text: "Como seria morar na Lua?", emoji: "🌙" },
  ],
  Emoções: [
    { text: "O que te faz mais feliz no mundo?", emoji: "😊" },
    { text: "Por que a gente chora quando está feliz?", emoji: "🥹" },
    { text: "O que é ser corajoso de verdade?", emoji: "💪" },
    { text: "Por que algumas músicas dão arrepio?", emoji: "🎵" },
    { text: "O que significa amar alguém?", emoji: "❤️" },
  ],
  Filosofia: [
    { text: "O que é mais importante: ser inteligente ou ser gentil?", emoji: "🤔" },
    { text: "Se pudesse mudar uma regra do mundo, qual seria?", emoji: "📜" },
    { text: "O que torna alguém especial?", emoji: "✨" },
    { text: "Por que as pessoas pensam diferente?", emoji: "💭" },
    { text: "O que é mais rápido: a luz ou o pensamento?", emoji: "⚡" },
  ],
};

const THEMES = Object.keys(TRAVEL_QUESTIONS);
const QUESTION_COUNTS = [3, 5, 10];

type TravelPhase = "setup" | "playing" | "finished";

interface Props {
  onBack: () => void;
}

const TravelMode = ({ onBack }: Props) => {
  const { profile } = useAuth();
  const { addMemory } = useMemories();
  const { trackEvent } = useAchievementSync();
  const childName = profile?.child_name || "amigo";

  const [phase, setPhase] = useState<TravelPhase>("setup");
  const [questionCount, setQuestionCount] = useState(5);
  const [theme, setTheme] = useState("Tudo");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<{ text: string; emoji: string }[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [timerProgress, setTimerProgress] = useState(100);
  const [previewIndex, setPreviewIndex] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakingRef = useRef(false);
  const lockedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Lock TTS voice once for consistency across all phases (setup preview, playing, finished)
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const pickVoice = () => {
      if (lockedVoiceRef.current) return;
      const voices = window.speechSynthesis.getVoices();
      const ptBR = voices.find(v => v.lang === "pt-BR" && /female|mulher|luciana|joana|fernanda|maria|ana/i.test(v.name))
        || voices.find(v => v.lang === "pt-BR")
        || voices.find(v => v.lang.startsWith("pt"));
      if (ptBR) lockedVoiceRef.current = ptBR;
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Preview de pergunta no setup — rotaciona a cada 4s
  useEffect(() => {
    if (phase !== "setup") return;
    const id = setInterval(() => {
      setPreviewIndex((p) => (p + 1) % (TRAVEL_QUESTIONS[theme]?.length || 1));
    }, 4000);
    return () => clearInterval(id);
  }, [phase, theme]);

  // Pick random questions for the session
  const startAdventure = useCallback(() => {
    const pool = TRAVEL_QUESTIONS[theme] || TRAVEL_QUESTIONS.Tudo;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, Math.min(questionCount, shuffled.length)));
    setCurrentIndex(0);
    setPhase("playing");
  }, [theme, questionCount]);

  // TTS speak — voz/pitch/rate IDÊNTICOS em todas as fases
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) { resolve(); return; }
      window.speechSynthesis.cancel();
      speakingRef.current = true;

      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "pt-BR";
      utt.pitch = 1.05;
      utt.rate = 0.92;
      utt.volume = 0.95;
      if (lockedVoiceRef.current) utt.voice = lockedVoiceRef.current;

      utt.onend = () => { speakingRef.current = false; resolve(); };
      utt.onerror = () => { speakingRef.current = false; resolve(); };
      window.speechSynthesis.speak(utt);
    });
  }, []);

  // Cleanup TTS ao desmontar (ex: voltar à home)
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Falar a pergunta do preview (sincroniza com o texto exibido no chip)
  const speakPreview = useCallback(() => {
    const q = TRAVEL_QUESTIONS[theme]?.[previewIndex];
    if (!q) return;
    speak(`${childName}... ${q.text}`);
  }, [theme, previewIndex, childName, speak]);

  // Play current question
  useEffect(() => {
    if (phase !== "playing" || isPaused || !questions[currentIndex]) return;

    setTimerProgress(100);

    const intro = `${childName}... tenho uma pergunta especial pra você.`;
    const questionText = questions[currentIndex].text;

    let cancelled = false;

    const run = async () => {
      await speak(intro);
      if (cancelled) return;
      await new Promise(r => setTimeout(r, 400));
      if (cancelled) return;
      await speak(questionText);
      if (cancelled) return;

      const startTime = Date.now();
      const duration = 60000;
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setTimerProgress(remaining);
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCurrentIndex(prev => prev + 1);
        }
      }, 200);
    };

    run();

    return () => {
      cancelled = true;
      window.speechSynthesis.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, currentIndex, isPaused, questions, childName, speak]);

  // Check if finished
  useEffect(() => {
    if (phase === "playing" && currentIndex >= questions.length && questions.length > 0) {
      setPhase("finished");
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#C5A8FF", "#7BB6FF", "#FFE48A", "#fff"],
      });

      for (let i = 0; i < questions.length; i++) {
        setTimeout(() => trackEvent("travel"), i * 80);
      }

      addMemory({
        type: "question",
        title: `Sessão Viagem 🚗 — ${questions.length} perguntas`,
        content: questions.map(q => q.text).join(" | "),
        is_special: false,
        image_url: null,
        metadata: { travel_mode: true, theme, count: questions.length },
      });

      speak(`Que aventura incrível, ${childName}! Vocês fizeram ${questions.length} perguntas juntos hoje!`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, questions, phase]);

  const skipQuestion = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    window.speechSynthesis.cancel();
    setCurrentIndex(prev => prev + 1);
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
    } else {
      setIsPaused(true);
      window.speechSynthesis.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const previewQuestion = TRAVEL_QUESTIONS[theme]?.[previewIndex % (TRAVEL_QUESTIONS[theme]?.length || 1)];

  /* ─── Setup Screen ─── */
  if (phase === "setup") {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <CosmicRoad>
          <header
            className="relative flex items-center gap-3 px-5 pb-3"
            style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
          >
            <motion.button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur text-white border border-white/20"
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft size={20} />
            </motion.button>
            <h1 className="text-lg font-black text-white flex items-center gap-2 drop-shadow-lg">
              <Car size={20} className="text-amber-300" /> Modo Viagem
            </h1>
          </header>

          <div className="relative flex-1 min-h-0 flex flex-col items-center px-6 gap-4 overflow-y-auto overscroll-contain pb-10 pt-2">
            {/* Preview de pergunta — alto-falante (PRIMEIRO: coração da experiência) */}
            <motion.button
              onClick={speakPreview}
              className="w-full max-w-xs rounded-2xl px-4 py-3 backdrop-blur-md border border-amber-300/30 flex items-start gap-3 text-left active:scale-[0.98] transition-transform"
              style={{
                background: "linear-gradient(135deg, hsl(280 50% 25% / 0.55), hsl(250 50% 18% / 0.55))",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Tocar prévia da pergunta"
            >
              <motion.div
                className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center flex-shrink-0"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Volume2 size={16} className="text-amber-200" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-amber-200 text-[10px] font-black uppercase tracking-wider mb-0.5">
                  KIDZZ pergunta… <span className="font-bold normal-case tracking-normal text-amber-200/70">(toque para ouvir)</span>
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={previewIndex}
                    className="text-white text-sm font-bold leading-snug"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4 }}
                  >
                    "{childName}, {previewQuestion?.text}"
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.button>

            {/* KIDZZ Explorer — logo abaixo do box de perguntas */}
            <KidzzChameleon
              state="cosmic"
              mood="guide"
              size="md"
              showParticles
              interactive
            />

            {/* Theme selector — coerência com o assunto da pergunta */}
            <div className="w-full max-w-xs">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2 text-center">
                Assunto
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {THEMES.map(t => (
                  <motion.button
                    key={t}
                    onClick={() => { setTheme(t); setPreviewIndex(0); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all backdrop-blur ${
                      theme === t
                        ? "bg-white/20 text-white border border-white/40"
                        : "bg-white/5 text-white/50 border border-transparent"
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Question count selector */}
            <div className="w-full max-w-xs">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2 text-center">
                Quantas perguntas?
              </p>
              <div className="flex gap-2 justify-center">
                {QUESTION_COUNTS.map(n => (
                  <motion.button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`min-w-[60px] px-5 py-2.5 rounded-xl font-black text-sm transition-all ${
                      questionCount === n
                        ? "bg-amber-400 text-amber-950 shadow-lg shadow-amber-400/40"
                        : "bg-white/10 text-white/70 backdrop-blur"
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {n}
                  </motion.button>
                ))}
              </div>
            </div>

            <p className="text-white/85 text-center text-sm font-bold leading-relaxed max-w-xs">
              <span className="text-amber-300">{questionCount} perguntas</span> de{" "}
              <span className="text-amber-300">{theme}</span> pra{" "}
              <span className="text-amber-300">{childName}</span> 🛸
            </p>

            {/* Start button */}
            <motion.button
              onClick={startAdventure}
              className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 text-amber-950 font-black text-base shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 min-h-[52px]"
              whileTap={{ scale: 0.97 }}
            >
              <Volume2 size={20} /> Iniciar Aventura Sonora
            </motion.button>

            <p className="text-white/50 text-[10px] font-semibold text-center max-w-xs">
              Coloque o celular para baixo. KIDZZ guia a aventura 🦎✨
            </p>
          </div>
        </CosmicRoad>
      </motion.div>
    );
  }

  /* ─── Playing Screen ─── */
  if (phase === "playing") {
    const q = questions[currentIndex];
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <CosmicRoad>
          {/* Top controls */}
          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 z-10"
            style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
          >
            <motion.button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur text-white/80 border border-white/20"
              whileTap={{ scale: 0.9 }}
            >
              <X size={18} />
            </motion.button>
            <span className="text-white/70 text-xs font-black bg-white/10 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            {/* KIDZZ Explorer */}
            <KidzzChameleon
              state="cosmic"
              mood="talking"
              size="lg"
              showParticles
            />

            {/* Question */}
            <AnimatePresence mode="wait">
              {q && (
                <motion.div
                  key={currentIndex}
                  className="px-4 text-center mt-6 max-w-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <motion.span
                    className="text-5xl mb-3 block"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {q.emoji}
                  </motion.span>
                  <p className="text-white text-lg font-bold leading-relaxed drop-shadow-lg">
                    {q.text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timer bar */}
            <div className="w-full max-w-xs mt-8 px-4">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                  style={{ width: `${timerProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <p className="text-white/50 text-[10px] font-semibold text-center mt-2">
                Vez de {childName} responder 🎤
              </p>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-6">
            <motion.button
              onClick={togglePause}
              className="w-14 h-14 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white border border-white/25"
              whileTap={{ scale: 0.9 }}
            >
              {isPaused ? <Play size={22} /> : <Pause size={22} />}
            </motion.button>
            <motion.button
              onClick={skipQuestion}
              className="w-14 h-14 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white border border-white/25"
              whileTap={{ scale: 0.9 }}
            >
              <SkipForward size={22} />
            </motion.button>
          </div>
        </CosmicRoad>
      </motion.div>
    );
  }

  /* ─── Finished Screen ─── */
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <CosmicRoad>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <KidzzChameleon
            state="cosmic"
            mood="happy"
            size="lg"
            showParticles
          />

          <h2 className="text-white text-2xl font-black text-center mt-4 mb-2 drop-shadow-lg">
            Que aventura incrível! 🌟
          </h2>
          <p className="text-white/80 text-sm font-bold text-center max-w-xs mb-1">
            {childName}, vocês fizeram {questions.length} perguntas juntos hoje!
          </p>
          <p className="text-amber-300 text-xs font-bold mb-6">
            Sessão salva nas Memórias 💛
          </p>

          <motion.button
            onClick={onBack}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 font-black text-sm shadow-lg min-h-[48px]"
            whileTap={{ scale: 0.97 }}
          >
            Voltar para casa 🏠
          </motion.button>
        </div>
      </CosmicRoad>
    </motion.div>
  );
};

export default TravelMode;

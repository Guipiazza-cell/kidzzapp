import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Car, Play, Pause, SkipForward, X, Volume2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMemories } from "@/hooks/useMemories";
import pixelImg from "@/assets/pixel-chameleon.png";
import aneImg from "@/assets/ane-chameleon.png";
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
  const childName = profile?.child_name || "Explorador";

  const [phase, setPhase] = useState<TravelPhase>("setup");
  const [questionCount, setQuestionCount] = useState(5);
  const [theme, setTheme] = useState("Tudo");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<{ text: string; emoji: string }[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [timerProgress, setTimerProgress] = useState(100);
  const [activeMascot, setActiveMascot] = useState<"ane" | "pixel">("pixel");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakingRef = useRef(false);

  // Pick random questions for the session
  const startAdventure = useCallback(() => {
    const pool = TRAVEL_QUESTIONS[theme] || TRAVEL_QUESTIONS.Tudo;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, Math.min(questionCount, shuffled.length)));
    setCurrentIndex(0);
    setPhase("playing");
  }, [theme, questionCount]);

  // TTS speak
  const speak = useCallback((text: string, mascot: "ane" | "pixel"): Promise<void> => {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) { resolve(); return; }
      window.speechSynthesis.cancel();
      speakingRef.current = true;

      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "pt-BR";
      utt.pitch = mascot === "ane" ? 1.1 : 0.95;
      utt.rate = mascot === "ane" ? 0.9 : 0.95;
      utt.volume = 0.9;

      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(v => v.lang === "pt-BR") || voices.find(v => v.lang.startsWith("pt"));
      if (ptVoice) utt.voice = ptVoice;

      utt.onend = () => { speakingRef.current = false; resolve(); };
      utt.onerror = () => { speakingRef.current = false; resolve(); };
      window.speechSynthesis.speak(utt);
    });
  }, []);

  // Play current question
  useEffect(() => {
    if (phase !== "playing" || isPaused || !questions[currentIndex]) return;

    const mascot = currentIndex % 2 === 0 ? "pixel" : "ane";
    setActiveMascot(mascot);
    setTimerProgress(100);

    const intro = `${childName}... tenho uma pergunta especial pra você.`;
    const questionText = questions[currentIndex].text;

    let cancelled = false;

    const run = async () => {
      await speak(intro, mascot);
      if (cancelled) return;
      await new Promise(r => setTimeout(r, 400));
      if (cancelled) return;
      await speak(questionText, mascot);
      if (cancelled) return;

      // Start 60s timer
      const startTime = Date.now();
      const duration = 60000;
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setTimerProgress(remaining);
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Move to next
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
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#D4A847", "#F0C85A", "#fff"] });

      // Save as memory
      addMemory({
        type: "question",
        title: `Sessão Viagem 🚗 — ${questions.length} perguntas`,
        content: questions.map(q => q.text).join(" | "),
        is_special: false,
        image_url: null,
        metadata: { travel_mode: true, theme, count: questions.length },
      });

      // Speak closing
      speak(`Que aventura incrível, ${childName}! Vocês fizeram ${questions.length} perguntas juntos hoje!`, "pixel");
    }
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

  /* ─── Setup Screen ─── */
  if (phase === "setup") {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[hsl(210,30%,15%)] via-[hsl(200,25%,20%)] to-[hsl(210,30%,12%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <header
          className="flex items-center gap-3 px-5 pb-3"
          style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
        >
          <motion.button onClick={onBack} className="p-2 rounded-xl bg-white/10 text-white" whileTap={{ scale: 0.9 }}>
            <ArrowLeft size={20} />
          </motion.button>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <Car size={20} /> Modo Viagem
          </h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {/* Mascot */}
          <motion.img
            src={pixelImg}
            alt="Pixel"
            className="w-28 h-28 object-contain"
            style={{ filter: "brightness(1.15) drop-shadow(0 0 16px rgba(100,160,255,0.6))" }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <p className="text-white/90 text-center text-sm font-bold leading-relaxed max-w-xs">
            Pixel vai fazer <span className="text-yellow-300">{questionCount} perguntas</span> para{" "}
            <span className="text-yellow-300">{childName}</span> enquanto vocês viajam! 🗺️
          </p>

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
                  className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all ${
                    questionCount === n
                      ? "bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-400/30"
                      : "bg-white/10 text-white/70"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {n}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Theme selector */}
          <div className="w-full max-w-xs">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2 text-center">
              Tema
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {THEMES.map(t => (
                <motion.button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    theme === t
                      ? "bg-white/20 text-white border border-white/30"
                      : "bg-white/5 text-white/50 border border-transparent"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {t}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <motion.button
            onClick={startAdventure}
            className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-black text-base shadow-lg shadow-orange-400/30 flex items-center justify-center gap-2"
            whileTap={{ scale: 0.97 }}
          >
            <Volume2 size={20} /> Iniciar Aventura Sonora
          </motion.button>

          <p className="text-white/40 text-[10px] font-semibold text-center max-w-xs">
            Coloque o celular para baixo. Vamos conversar! 🦎
          </p>
        </div>
      </motion.div>
    );
  }

  /* ─── Playing Screen (dark/minimal) ─── */
  if (phase === "playing") {
    const q = questions[currentIndex];
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[hsl(210,30%,8%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Top controls */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-5"
          style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
        >
          <motion.button onClick={onBack} className="p-2 rounded-xl bg-white/10 text-white/60" whileTap={{ scale: 0.9 }}>
            <X size={18} />
          </motion.button>
          <span className="text-white/40 text-xs font-bold">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Mascot */}
        <motion.img
          src={activeMascot === "pixel" ? pixelImg : aneImg}
          alt={activeMascot}
          className="w-32 h-32 object-contain mb-6"
          style={{
            filter: activeMascot === "pixel"
              ? "brightness(1.15) drop-shadow(0 0 20px rgba(100,160,255,0.5))"
              : "brightness(1.1) drop-shadow(0 0 20px rgba(255,120,180,0.5))",
          }}
          animate={{ scale: [1, 1.05, 1], y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Question */}
        <AnimatePresence mode="wait">
          {q && (
            <motion.div
              key={currentIndex}
              className="px-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <span className="text-4xl mb-3 block">{q.emoji}</span>
              <p className="text-white/90 text-lg font-bold leading-relaxed">{q.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer bar */}
        <div className="w-full max-w-xs mt-8 px-8">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
              style={{ width: `${timerProgress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <p className="text-white/30 text-[10px] font-semibold text-center mt-2">
            Vez de {childName} responder 🎤
          </p>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-10 flex items-center gap-6">
          <motion.button
            onClick={togglePause}
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white/70"
            whileTap={{ scale: 0.9 }}
          >
            {isPaused ? <Play size={22} /> : <Pause size={22} />}
          </motion.button>
          <motion.button
            onClick={skipQuestion}
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white/70"
            whileTap={{ scale: 0.9 }}
          >
            <SkipForward size={22} />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  /* ─── Finished Screen ─── */
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[hsl(210,30%,12%)] to-[hsl(210,30%,8%)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.img
        src={pixelImg}
        alt="Pixel"
        className="w-28 h-28 object-contain mb-4"
        style={{ filter: "brightness(1.15) drop-shadow(0 0 20px rgba(100,160,255,0.6))" }}
        animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      <h2 className="text-white text-xl font-black text-center mb-2">
        Que aventura incrível! 🌟
      </h2>
      <p className="text-white/70 text-sm font-bold text-center max-w-xs mb-1">
        {childName}, vocês fizeram {questions.length} perguntas juntos hoje!
      </p>
      <p className="text-yellow-300 text-xs font-bold mb-6">
        Sessão salva nas Memórias 💛
      </p>

      <motion.button
        onClick={onBack}
        className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-black text-sm shadow-lg"
        whileTap={{ scale: 0.97 }}
      >
        Voltar para casa 🏠
      </motion.button>
    </motion.div>
  );
};

export default TravelMode;

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { MusicEngine } from "./MusicEngine";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";
import { addMusicXp, bumpCounter, type MusicAchievement } from "@/lib/musicXp";
import { useMemories } from "@/hooks/useMemories";

interface Props {
  onBack: () => void;
  childName: string;
  onAchievement?: (a: MusicAchievement) => void;
}

type MoveType = "clap" | "spin" | "jump" | "hug";
const MOVES: { id: MoveType; emoji: string; label: string; color: string }[] = [
  { id: "clap", emoji: "👏", label: "Bata palmas!", color: "from-pink-400 to-rose-500" },
  { id: "spin", emoji: "🌀", label: "Gire!", color: "from-purple-400 to-indigo-500" },
  { id: "jump", emoji: "🤸", label: "Pule!", color: "from-amber-400 to-orange-500" },
  { id: "hug", emoji: "🤗", label: "Abrace o ar!", color: "from-emerald-400 to-teal-500" },
];

const TOTAL_ROUNDS = 6;

const DanceWithAne = ({ onBack, childName, onAchievement }: Props) => {
  const [phase, setPhase] = useState<"intro" | "countdown" | "play" | "feedback" | "done">("intro");
  const [round, setRound] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [currentMove, setCurrentMove] = useState<MoveType>("clap");
  const [feedback, setFeedback] = useState<"perfect" | "good" | "miss" | null>(null);
  const [score, setScore] = useState(0);
  const [moveStartTime, setMoveStartTime] = useState(0);
  const engineRef = useRef<MusicEngine | null>(null);
  const beatTimerRef = useRef<number | null>(null);
  const moveTimeoutRef = useRef<number | null>(null);
  const { addMemory } = useMemories();

  useEffect(() => {
    engineRef.current = new MusicEngine();
    return () => {
      engineRef.current?.dispose();
      if (beatTimerRef.current) clearInterval(beatTimerRef.current);
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
    };
  }, []);

  const startGame = async () => {
    if (!engineRef.current) return;
    // Destrava AudioContext dentro do gesto
    await engineRef.current.unlock();
    setPhase("countdown");
    setCountdown(3);
    setRound(0);
    setScore(0);
    let c = 3;
    const tick = () => {
      engineRef.current?.playNote(c === 1 ? "G5" : "C5", 0.3, "sine");
      c -= 1;
      if (c <= 0) {
        clearInterval(handle);
        startBeat();
        nextMove(0);
      } else {
        setCountdown(c);
      }
    };
    const handle = window.setInterval(tick, 800);
  };

  const startBeat = () => {
    if (beatTimerRef.current) clearInterval(beatTimerRef.current);
    beatTimerRef.current = window.setInterval(() => {
      engineRef.current?.playDrum(0.7);
    }, 500);
  };

  const nextMove = (r: number) => {
    if (r >= TOTAL_ROUNDS) {
      finish();
      return;
    }
    const move = MOVES[Math.floor(Math.random() * MOVES.length)];
    setCurrentMove(move.id);
    setRound(r);
    setPhase("play");
    setFeedback(null);
    setMoveStartTime(Date.now());
    // 2.5s window — if no tap, count as miss
    if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
    moveTimeoutRef.current = window.setTimeout(() => {
      handleTap(true);
    }, 2500);
  };

  const handleTap = (timeout = false) => {
    if (phase !== "play") return;
    if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
    const elapsed = Date.now() - moveStartTime;
    let result: "perfect" | "good" | "miss";
    if (timeout) result = "miss";
    else if (elapsed < 1200) result = "perfect";
    else if (elapsed < 2200) result = "good";
    else result = "miss";

    if (result === "perfect") {
      engineRef.current?.playSparkle();
      setScore((s) => s + 3);
    } else if (result === "good") {
      engineRef.current?.playNote("E5", 0.3, "triangle");
      setScore((s) => s + 1);
    }

    setFeedback(result);
    setPhase("feedback");
    setTimeout(() => nextMove(round + 1), 900);
  };

  const finish = () => {
    if (beatTimerRef.current) clearInterval(beatTimerRef.current);
    setPhase("done");
    addMusicXp("dance");
    const ach = bumpCounter("dance");
    if (ach) onAchievement?.(ach);
    addMemory({
      type: "achievement",
      title: `Dançou com Ane`,
      content: `${childName} acertou ${score} pontos dançando!`,
      is_special: false,
      image_url: null,
      metadata: { kind: "dance", score },
    });
  };

  const move = MOVES.find((m) => m.id === currentMove)!;

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ background: "radial-gradient(ellipse at 50% 30%, hsl(340 50% 30%), hsl(280 50% 12%) 75%)" }}
    >
      {/* Disco lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 73) % 100}%`,
              top: `${(i * 41) % 100}%`,
              width: 60, height: 60,
              background: `radial-gradient(circle, hsl(${i * 30} 80% 60% / 0.4), transparent 70%)`,
              filter: "blur(20px)",
            }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 pb-3 border-b border-white/10"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 12px)" }}>
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-white/10 backdrop-blur flex items-center justify-center" aria-label="Voltar">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-white text-lg font-extrabold leading-tight">Dance com Ane 💃</h1>
          <p className="text-white/60 text-xs font-semibold">
            {phase === "play" ? `Rodada ${round + 1}/${TOTAL_ROUNDS}` : `Mexa o corpo, ${childName}!`}
          </p>
        </div>
        {phase === "play" && (
          <div className="bg-amber-400/20 backdrop-blur rounded-full px-3 py-1 border border-amber-300/40">
            <span className="text-amber-200 text-xs font-extrabold">⭐ {score}</span>
          </div>
        )}
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <KidzzChameleon state="music" mood={phase === "play" || phase === "feedback" ? "talking" : phase === "done" ? "happy" : "idle"} size="xl" interactive showParticles />

        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="intro" className="text-center mt-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h2 className="text-white text-2xl font-extrabold mb-2">Pronto pra dançar?</h2>
              <p className="text-white/70 text-sm font-semibold mb-6 max-w-xs">
                Quando aparecer um movimento, toque no botão!
              </p>
              <motion.button
                onClick={startGame}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full text-white font-extrabold shadow-2xl"
                style={{ background: "linear-gradient(135deg, hsl(340 80% 55%), hsl(280 70% 50%))" }}
              >
                ✨ Começar
              </motion.button>
            </motion.div>
          )}

          {phase === "countdown" && (
            <motion.div key="cd" className="mt-6"
              initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <motion.div
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-white text-8xl font-black"
                style={{ textShadow: "0 0 40px hsl(340 80% 60%)" }}
              >
                {countdown}
              </motion.div>
            </motion.div>
          )}

          {phase === "play" && (
            <motion.div key={`move-${round}`} className="mt-6 flex flex-col items-center"
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <motion.div
                className="text-7xl mb-3"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >{move.emoji}</motion.div>
              <p className="text-white text-2xl font-extrabold mb-5">{move.label}</p>
              <motion.button
                onClick={() => handleTap()}
                whileTap={{ scale: 0.92 }}
                className={`px-12 py-5 rounded-full text-white text-xl font-extrabold bg-gradient-to-r ${move.color} shadow-2xl`}
                style={{ boxShadow: "0 0 40px hsl(340 80% 50% / 0.5)" }}
              >
                Toque agora!
              </motion.button>
            </motion.div>
          )}

          {phase === "feedback" && (
            <motion.div key={`fb-${round}`} className="mt-6 text-center"
              initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <motion.div className="text-6xl mb-2" animate={{ rotate: [0, -10, 10, 0] }}>
                {feedback === "perfect" ? "✨" : feedback === "good" ? "👍" : "💫"}
              </motion.div>
              <p className="text-white text-3xl font-extrabold"
                style={{ color: feedback === "perfect" ? "hsl(50 100% 70%)" : feedback === "good" ? "hsl(140 80% 70%)" : "hsl(340 80% 70%)" }}>
                {feedback === "perfect" ? "Perfeito!" : feedback === "good" ? "Bom!" : "Quase!"}
              </p>
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div key="done" className="mt-6 text-center"
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <Sparkles className="mx-auto text-amber-300 mb-3" size={40} />
              <h2 className="text-white text-3xl font-extrabold mb-1">Dançou tudo! 🎉</h2>
              <p className="text-amber-200 text-lg font-extrabold mb-1">⭐ {score} pontos</p>
              <p className="text-white/70 text-sm font-bold mb-5">+10 sabedoria musical</p>
              <div className="flex gap-3 justify-center">
                <motion.button
                  onClick={startGame}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-full text-white font-extrabold border border-white/30 bg-white/10 backdrop-blur"
                >Dançar de novo</motion.button>
                <motion.button
                  onClick={onBack}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-full text-white font-extrabold"
                  style={{ background: "linear-gradient(135deg, hsl(340 80% 55%), hsl(280 70% 50%))" }}
                >Voltar</motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DanceWithAne;

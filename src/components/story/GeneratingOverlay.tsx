import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";


interface GeneratingOverlayProps {
  open: boolean;
  progress: number;
}

const MESSAGES = [
  { text: "Abrindo o livro mágico...", emoji: "📖", color: "from-purple-500 to-indigo-500" },
  { text: "Imaginando a história...", emoji: "🌈", color: "from-indigo-500 to-blue-500" },
  { text: "Pintando os cenários...", emoji: "🎨", color: "from-blue-500 to-cyan-500" },
  { text: "Dando vida aos personagens...", emoji: "✨", color: "from-cyan-500 to-emerald-500" },
  { text: "Adicionando cores mágicas...", emoji: "🪄", color: "from-emerald-500 to-yellow-500" },
  { text: "Criando as ilustrações...", emoji: "🖼️", color: "from-yellow-500 to-orange-500" },
  { text: "Quase pronto...", emoji: "🦎", color: "from-orange-500 to-red-500" },
  { text: "Finalizando detalhes mágicos...", emoji: "💫", color: "from-red-500 to-pink-500" },
];

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 3,
  duration: 2 + Math.random() * 3,
  size: 4 + Math.random() * 8,
  emoji: ["✨", "⭐", "🌟", "💫", "🎨", "📖"][Math.floor(Math.random() * 6)],
}));

const GeneratingOverlay = ({ open, progress }: GeneratingOverlayProps) => {
  const [funFact, setFunFact] = useState(0);
  const msgIndex = Math.min(
    Math.floor(progress / (100 / MESSAGES.length)),
    MESSAGES.length - 1
  );

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setFunFact((f) => (f + 1) % MESSAGES.length), 4000);
    return () => clearInterval(t);
  }, [open]);

  const currentMsg = MESSAGES[msgIndex];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] overflow-hidden"
        >
          {/* Floating particles */}
          {PARTICLES.map((p) => (
            <motion.span
              key={p.id}
              className="absolute text-lg pointer-events-none select-none"
              style={{ left: `${p.x}%`, fontSize: p.size }}
              initial={{ y: "100vh", opacity: 0 }}
              animate={{
                y: "-10vh",
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {p.emoji}
            </motion.span>
          ))}

          <motion.div
            initial={{ scale: 0.7, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="text-center space-y-6 px-6 max-w-sm"
          >
            {/* Pulsing glow ring */}
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${currentMsg.color} opacity-20 blur-xl`}
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className={`absolute inset-1 rounded-full border-2 border-dashed border-white/20`}
              />
              <motion.div
                className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-300 via-orange-400 to-pink-500 flex items-center justify-center shadow-2xl"
                animate={{ rotate: [-4, 4, -4], y: [0, -6, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <BookOpen size={44} className="text-white drop-shadow-lg" strokeWidth={2.2} />
                <motion.div
                  className="absolute -top-2 -right-2 text-yellow-200"
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 20, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles size={20} fill="currentColor" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-1 -left-2 text-white/90"
                  animate={{ scale: [1, 1.25, 1], rotate: [0, -15, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: 0.6 }}
                >
                  <Sparkles size={14} fill="currentColor" />
                </motion.div>
              </motion.div>

            </div>

            {/* Title with gradient */}
            <motion.h2
              className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-kid-yellow to-white"
              animate={{ backgroundPosition: ["0%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200%" }}
            >
              Criando sua história mágica...
            </motion.h2>

            {/* Animated message */}
            <AnimatePresence mode="wait">
              <motion.div
                key={msgIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2"
              >
                <motion.span
                  className="text-2xl"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {currentMsg.emoji}
                </motion.span>
                <span className="text-white/70 text-sm font-semibold">
                  {currentMsg.text}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Progress bar */}
            <div className="w-72 mx-auto">
              <div className="bg-white/10 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-white/10">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${currentMsg.color} relative`}
                  animate={{ width: `${Math.max(progress, 3)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/30 rounded-full"
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-white/30 text-[10px] font-bold tracking-wider uppercase">
                  {msgIndex < 3 ? "Escrevendo" : msgIndex < 6 ? "Ilustrando" : "Finalizando"}
                </span>
                <span className="text-white/50 text-xs font-bold">{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Fun fact */}
            <motion.p
              className="text-white/30 text-[11px] italic max-w-[250px] mx-auto"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              💡 Cada história é única e feita especialmente para você!
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GeneratingOverlay;

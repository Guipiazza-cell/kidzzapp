import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ForestAudioEngine } from "./ForestAudioEngine";
import AneMelodia from "./AneMelodia";

interface Props {
  onComplete: () => void;
  childName: string;
}

const ForestOnboarding = ({ onComplete, childName }: Props) => {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
  const engineRef = useRef<ForestAudioEngine | null>(null);

  useEffect(() => {
    engineRef.current = new ForestAudioEngine();
    // Phase 0: silent forest (1s)
    const t1 = setTimeout(() => {
      setPhase(1);
      engineRef.current?.playNote("G5", 1.4, "sine");
    }, 900);
    // Phase 2: more leaves light (2.4s)
    const t2 = setTimeout(() => {
      setPhase(2);
      engineRef.current?.playNote("E5", 1.0, "triangle");
    }, 2400);
    // Phase 3: full melody (3.8s)
    const t3 = setTimeout(() => {
      setPhase(3);
      engineRef.current?.playMelody(
        [{ note: "C5", dur: 0.35 }, { note: "E5", dur: 0.35 }, { note: "G5", dur: 0.35 }, { note: "C5", dur: 0.5 }],
        "triangle"
      );
    }, 3800);
    // Phase 4: CTA
    const t4 = setTimeout(() => setPhase(4), 5400);

    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
      engineRef.current?.dispose();
    };
  }, []);

  // 16 leaf positions (deterministic for choreography)
  const leaves = Array.from({ length: 16 }).map((_, i) => ({
    x: (i * 137) % 100,
    y: 12 + ((i * 47) % 75),
    delay: i * 0.12,
    size: 14 + ((i * 7) % 14),
  }));

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        background: phase === 0
          ? "radial-gradient(ellipse at center, hsl(220 30% 8%), hsl(220 35% 4%))"
          : "radial-gradient(ellipse at 50% 40%, hsl(145 30% 18%), hsl(220 35% 6%))",
        transition: "background 1.5s ease-out",
      }}
    >
      {/* Forest silhouette */}
      <div className="absolute bottom-0 inset-x-0 h-1/2 pointer-events-none">
        {[20, 45, 70].map((x, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0"
            style={{ left: `${x}%`, width: "30%", height: "100%" }}
            animate={{ opacity: phase >= 2 ? 0.9 : 0.4 }}
            transition={{ duration: 1.5 }}
          >
            <svg viewBox="0 0 100 200" className="w-full h-full">
              <ellipse cx="50" cy="60" rx="40" ry="60" fill="hsl(145 35% 12%)" />
              <ellipse cx="35" cy="90" rx="30" ry="45" fill="hsl(145 40% 15%)" />
              <ellipse cx="65" cy="90" rx="32" ry="48" fill="hsl(145 38% 14%)" />
              <rect x="46" y="120" width="8" height="80" fill="hsl(25 30% 15%)" />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Leaves that light up progressively */}
      {leaves.map((leaf, i) => {
        const isLit = phase >= 1 && i < (phase === 1 ? 1 : phase === 2 ? 5 : phase >= 3 ? 16 : 0);
        return (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{ left: `${leaf.x}%`, top: `${leaf.y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: isLit ? 1 : 0,
              scale: isLit ? 1 : 0,
            }}
            transition={{ duration: 0.7, delay: isLit ? leaf.delay * 0.3 : 0, ease: "easeOut" }}
          >
            <div
              className="rounded-full"
              style={{
                width: leaf.size,
                height: leaf.size,
                background: `radial-gradient(circle, hsl(${50 + (i % 3) * 20} 90% 70% / 0.95), hsl(45 90% 55% / 0.4) 60%, transparent 75%)`,
                filter: "blur(1.5px)",
                boxShadow: `0 0 ${leaf.size * 1.4}px hsl(45 95% 60% / 0.7)`,
              }}
            />
          </motion.div>
        );
      })}

      {/* Floating music notes */}
      <AnimatePresence>
        {phase >= 1 && Array.from({ length: phase === 1 ? 2 : phase === 2 ? 5 : 12 }).map((_, i) => (
          <motion.div
            key={`note-${phase}-${i}`}
            className="absolute text-yellow-200 font-bold pointer-events-none"
            style={{
              left: `${15 + (i * 13) % 70}%`,
              bottom: "20%",
              fontSize: 18 + (i % 3) * 6,
              textShadow: "0 0 12px hsl(45 95% 60%)",
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], y: -200 - i * 10 }}
            transition={{ duration: 3.5, delay: i * 0.18, ease: "easeOut" }}
          >
            {["♪", "♫", "♩", "♬"][i % 4]}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Mascot — appears at phase 2 */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            className="relative z-20 flex flex-col items-center gap-6 px-6 text-center"
            initial={{ opacity: 0, scale: 0.6, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 14 }}
          >
            <AneMelodia mood={phase >= 3 ? "sing" : "idle"} size="xl" />

            <AnimatePresence mode="wait">
              {phase === 2 && (
                <motion.p
                  key="p2"
                  className="text-white/90 text-base font-bold drop-shadow-lg max-w-xs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  A floresta acordou...
                </motion.p>
              )}
              {phase === 3 && (
                <motion.p
                  key="p3"
                  className="text-white text-xl font-extrabold drop-shadow-lg max-w-xs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  Ela está cantando para você, {childName}.
                </motion.p>
              )}
              {phase === 4 && (
                <motion.div
                  key="cta"
                  className="flex flex-col items-center gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-white text-2xl font-extrabold drop-shadow-lg">
                    Bem-vindo à Floresta dos Sons
                  </p>
                  <motion.button
                    onClick={onComplete}
                    className="px-8 py-4 rounded-full text-base font-extrabold text-white shadow-2xl"
                    style={{
                      background: "linear-gradient(135deg, hsl(340 85% 60%), hsl(280 75% 55%))",
                      boxShadow: "0 0 30px hsl(340 85% 60% / 0.6)",
                    }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ boxShadow: ["0 0 20px hsl(340 85% 60% / 0.5)", "0 0 40px hsl(340 85% 60% / 0.8)", "0 0 20px hsl(340 85% 60% / 0.5)"] }}
                    transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
                  >
                    🍃 Entrar na Floresta dos Sons
                  </motion.button>
                  <button
                    onClick={onComplete}
                    className="text-white/60 text-xs font-semibold underline-offset-4 hover:underline"
                  >
                    Pular intro
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip button always visible */}
      {phase < 4 && (
        <button
          onClick={onComplete}
          className="absolute top-6 right-6 z-30 text-white/50 text-xs font-bold px-4 py-2 rounded-full bg-white/5 backdrop-blur hover:bg-white/10 transition"
          style={{ paddingTop: "max(env(safe-area-inset-top, 8px), 8px)" }}
        >
          Pular ›
        </button>
      )}
    </motion.div>
  );
};

export default ForestOnboarding;

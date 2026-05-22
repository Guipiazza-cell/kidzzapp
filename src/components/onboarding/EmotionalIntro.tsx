import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";

interface Props {
  onDone: () => void;
}

/**
 * EmotionalIntro — cinematic 3-scene welcome shown ONCE before NameOnboarding.
 * Speaks directly to the parent's heart before asking anything.
 *
 *  Scene 0  ~ "Eu sei como é..."   (acolhimento)
 *  Scene 1  ~ "Aqui é diferente."  (promessa)
 *  Scene 2  ~ "Vamos começar?"     (CTA)
 */
const SCENES = [
  {
    title: "Eu sei como é.",
    body: "A pressa. Os porquês. O cansaço no fim do dia.",
    bg: "linear-gradient(180deg,hsl(225 45% 12%) 0%,hsl(250 40% 18%) 100%)",
    glow: "hsl(250 80% 65% / 0.45)",
    emoji: "🌙",
  },
  {
    title: "Aqui é diferente.",
    body: "Um lugar pra respirar, sentir e voltar a se conectar.",
    bg: "linear-gradient(180deg,hsl(195 55% 14%) 0%,hsl(165 45% 20%) 100%)",
    glow: "hsl(165 80% 60% / 0.5)",
    emoji: "🌿",
  },
  {
    title: "Vamos começar?",
    body: "Uma jornada curta. Para vocês dois.",
    bg: "linear-gradient(180deg,hsl(35 70% 18%) 0%,hsl(15 75% 25%) 50%,hsl(320 55% 30%) 100%)",
    glow: "hsl(35 95% 65% / 0.55)",
    emoji: "✨",
  },
] as const;

const EmotionalIntro = ({ onDone }: Props) => {
  const [scene, setScene] = useState(0);
  const current = SCENES[scene];
  const isLast = scene === SCENES.length - 1;

  useEffect(() => {
    haptic("light");
    sfx("click");
  }, [scene]);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 20 + Math.random() * 70,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 5,
        duration: 6 + Math.random() * 6,
      })),
    []
  );

  const next = () => {
    haptic("medium");
    sfx("click");
    if (isLast) {
      sfx("unlock");
      haptic("success");
      onDone();
    } else {
      setScene((s) => s + 1);
    }
  };

  const skip = () => {
    haptic("light");
    onDone();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Living background */}
      <AnimatePresence mode="sync">
        <motion.div
          key={scene}
          className="absolute inset-0"
          style={{ background: current.bg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Living glow */}
      <motion.div
        key={`glow-${scene}`}
        className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
        style={{
          width: 520,
          height: 520,
          marginLeft: -260,
          marginTop: -260,
          background: `radial-gradient(circle, ${current.glow} 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Drifting particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              boxShadow: "0 0 8px rgba(255,255,255,0.8)",
            }}
            animate={{
              y: [-8, -60, -8],
              opacity: [0, 0.9, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Skip */}
      <button
        onClick={skip}
        className="absolute top-[max(env(safe-area-inset-top),16px)] right-4 text-white/70 hover:text-white text-sm font-medium z-20 px-3 py-2"
      >
        Pular
      </button>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-7 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <motion.div
              className="text-[64px] mb-6 leading-none"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {current.emoji}
            </motion.div>

            <h1
              className="font-black text-white tracking-tight"
              style={{
                fontSize: "clamp(28px, 7.5vw, 36px)",
                lineHeight: 1.1,
                textShadow: "0 2px 24px rgba(0,0,0,0.4)",
              }}
            >
              {current.title}
            </h1>

            <p
              className="mt-4 text-white/85 font-medium max-w-[320px]"
              style={{
                fontSize: "clamp(16px, 4.4vw, 18px)",
                lineHeight: 1.45,
                textShadow: "0 1px 12px rgba(0,0,0,0.5)",
              }}
            >
              {current.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom: dots + CTA */}
      <div className="relative z-10 pb-[max(env(safe-area-inset-bottom),28px)] px-7 flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          {SCENES.map((_, i) => (
            <motion.span
              key={i}
              className="rounded-full bg-white"
              animate={{
                width: i === scene ? 24 : 6,
                opacity: i === scene ? 1 : 0.4,
              }}
              transition={{ duration: 0.4 }}
              style={{ height: 6 }}
            />
          ))}
        </div>

        <motion.button
          onClick={next}
          whileTap={{ scale: 0.96 }}
          className="relative overflow-hidden rounded-full text-white font-extrabold shadow-2xl min-h-[56px] px-10"
          style={{
            background: isLast
              ? "linear-gradient(135deg, hsl(35 95% 58%), hsl(28 95% 62%) 60%, hsl(320 70% 60%))"
              : "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: isLast
              ? "0 0 30px hsl(35 95% 60% / 0.55), 0 12px 32px rgba(0,0,0,0.3)"
              : "0 8px 24px rgba(0,0,0,0.25)",
            fontSize: 17,
          }}
        >
          {isLast && (
            <motion.span
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
              }}
              initial={{ x: "-110%" }}
              animate={{ x: "120%" }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <span className="relative z-10">
            {isLast ? "Vamos começar ✨" : "Continuar"}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EmotionalIntro;

import { forwardRef, memo } from "react";
import { motion } from "framer-motion";
import chameleonImg from "@/assets/chameleon-main.webp";

type MascotMood = "idle" | "curious" | "happy" | "thinking" | "talking";

interface ChameleonMascotProps {
  isTalking?: boolean;
  mood?: MascotMood;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  interactive?: boolean;
}

const sizeMap = {
  sm: "w-14 h-14",
  md: "w-28 h-28",
  lg: "w-44 h-44",
  xl: "w-56 h-56",
};

const glowSizeMap = {
  sm: "w-20 h-20",
  md: "w-36 h-36",
  lg: "w-52 h-52",
  xl: "w-64 h-64",
};

const ChameleonMascot = forwardRef<HTMLDivElement, ChameleonMascotProps>(
  ({ isTalking = false, mood = "idle", size = "lg", className = "", interactive = true }, ref) => {
    const effectiveMood = isTalking ? "talking" : mood;

    const bodyAnimation = {
      idle: { y: [0, -6, 0], rotate: [0, 1, -1, 0] },
      curious: { y: [0, -10, 0], rotate: [0, -8, 0] },
      happy: { y: [0, -14, 0], rotate: [0, -3, 3, 0], scale: [1, 1.05, 1] },
      thinking: { y: [0, -4, 0], rotate: [0, 3, 0] },
      talking: { y: [0, -12, 0], rotate: [0, -5, 5, -3, 0] },
    };

    const bodyTransition = {
      idle: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
      curious: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
      happy: { duration: 1.2, repeat: Infinity, ease: "easeInOut" as const },
      thinking: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const },
      talking: { duration: 0.5, repeat: Infinity, ease: "easeInOut" as const },
    };

    return (
      <motion.div
        ref={ref}
        className={`relative ${sizeMap[size]} ${className}`}
        animate={bodyAnimation[effectiveMood]}
        transition={bodyTransition[effectiveMood]}
      >
        {/* Ambient glow behind mascot */}
        <motion.div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${glowSizeMap[size]} rounded-full pointer-events-none`}
          style={{
            background: effectiveMood === "talking"
              ? "radial-gradient(circle, hsl(145 60% 45% / 0.25), transparent 70%)"
              : effectiveMood === "happy"
              ? "radial-gradient(circle, hsl(45 95% 55% / 0.2), transparent 70%)"
              : "radial-gradient(circle, hsl(145 60% 45% / 0.12), transparent 70%)",
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.img
          src={chameleonImg}
          alt="Kidzz - camaleão mascote"
          className="w-full h-full object-contain drop-shadow-2xl relative z-10"
          loading="eager"
          decoding="async"
          width={224}
          height={224}
          whileHover={interactive ? { scale: 1.12, rotate: [0, -5, 5, 0] } : undefined}
          whileTap={interactive ? { scale: 0.92 } : undefined}
          transition={{ type: "spring", stiffness: 300 }}
        />

        {/* Sparkle particles for talking/happy */}
        {(effectiveMood === "talking" || effectiveMood === "happy") && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 4 + Math.random() * 4,
                  height: 4 + Math.random() * 4,
                  background: ["hsl(var(--kid-yellow))", "hsl(var(--kid-pink))", "hsl(var(--kid-blue))", "hsl(var(--kid-green))", "hsl(var(--kid-orange))"][i],
                  top: `${10 + i * 18}%`,
                  left: `${-5 + i * 25}%`,
                }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                  y: [-5, -20 - i * 5],
                }}
                transition={{
                  duration: 1.2 + i * 0.2,
                  repeat: Infinity,
                  delay: i * 0.25,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}

        {/* Thinking dots */}
        {effectiveMood === "thinking" && (
          <div className="absolute -top-3 right-0 flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-white/80"
                animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        )}
      </motion.div>
    );
  }
);

ChameleonMascot.displayName = "ChameleonMascot";

export default memo(ChameleonMascot);

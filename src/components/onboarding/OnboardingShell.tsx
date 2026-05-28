import { motion } from "framer-motion";
import { useMemo, type ReactNode } from "react";

/**
 * OnboardingShell
 *  - Soft gradient + drifting golden particles
 *  - Cinematic enter/exit transitions
 *  - Used by Name / Age / Interests / Welcome screens
 */
interface Props {
  children: ReactNode;
  /** Tints the background slightly per step for a subtle "journey" feel. */
  tone?: "warm" | "sky" | "violet" | "magic";
}

const TONES: Record<NonNullable<Props["tone"]>, string> = {
  warm: "linear-gradient(180deg,hsl(38 60% 92%) 0%,hsl(90 25% 92%) 55%,hsl(35 60% 90%) 100%)",
  sky: "linear-gradient(180deg,hsl(200 60% 93%) 0%,hsl(90 25% 93%) 55%,hsl(35 55% 92%) 100%)",
  violet:
    "linear-gradient(180deg,hsl(280 55% 93%) 0%,hsl(90 25% 93%) 55%,hsl(35 55% 92%) 100%)",
  magic:
    "linear-gradient(180deg,hsl(45 95% 92%) 0%,hsl(28 90% 88%) 50%,hsl(280 55% 90%) 100%)",
};

const OnboardingShell = ({ children, tone = "warm" }: Props) => {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        size: 4 + Math.random() * 6,
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 7 + Math.random() * 5,
        startY: 30 + Math.random() * 60,
      })),
    []
  );

  return (
    <motion.div
      className="min-h-[100dvh] flex flex-col relative overflow-hidden max-w-[100vw]"
      style={{ background: TONES[tone], height: "auto", overflowX: "hidden" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Drifting golden particles */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.startY}%`,
              width: p.size,
              height: p.size,
              background:
                "radial-gradient(circle, hsl(45 95% 70% / 0.95), hsl(35 95% 60% / 0.4) 60%, transparent 75%)",
              boxShadow: "0 0 14px hsl(45 95% 65% / 0.6)",
            }}
            animate={{
              y: [-10, -90, -10],
              x: [0, 14, -14, 0],
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

      {/* Soft top vignette */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.55), transparent)",
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col">{children}</div>
    </motion.div>
  );
};

export default OnboardingShell;

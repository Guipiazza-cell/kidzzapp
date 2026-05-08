import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";
import OnboardingShell from "./OnboardingShell";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";

interface Props {
  childName: string;
  onEnter: () => void;
}

/**
 * OnboardingWelcome — final emotional screen of the onboarding flow.
 * "Entering the KIDZZ universe": bursts of confetti-particles,
 * mascot celebrating, soft chime, and a glowing CTA.
 */
const OnboardingWelcome = ({ childName, onEnter }: Props) => {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    sfx("complete");
    haptic("success");
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => {
      setPhase(2);
      sfx("reward");
    }, 1700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const burst = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => {
        const angle = (i / 22) * Math.PI * 2;
        const radius = 140 + Math.random() * 100;
        return {
          id: i,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          color: ["#FFD66B", "#FF9E3D", "#A78BFA", "#7DD3FC", "#86EFAC"][i % 5],
          delay: Math.random() * 0.25,
        };
      }),
    []
  );

  return (
    <OnboardingShell tone="magic">
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        {/* Confetti burst */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {phase >= 1 &&
            burst.map((b) => (
              <motion.span
                key={b.id}
                className="absolute rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: b.color,
                  boxShadow: `0 0 12px ${b.color}`,
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                animate={{
                  x: b.x,
                  y: b.y,
                  opacity: [0, 1, 0],
                  scale: [0.4, 1.1, 0.6],
                }}
                transition={{
                  duration: 1.8,
                  delay: b.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            ))}
        </div>

        {/* Pulsing glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 380,
            height: 380,
            background:
              "radial-gradient(circle, hsl(45 95% 70% / 0.5) 0%, hsl(35 95% 60% / 0.2) 45%, transparent 75%)",
            filter: "blur(8px)",
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Mascot celebrating */}
        <motion.div
          initial={{ scale: 0, rotate: -10, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 12 }}
          className="relative z-10"
        >
          <KidzzChameleon
            state="cosmic"
            mood="happy"
            size="xl"
            interactive
            showParticles
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="relative z-10 text-center mt-4 text-[28px] leading-tight font-black text-gray-900"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Tudo pronto, {childName}! ✨
        </motion.h1>
        <motion.p
          className="relative z-10 text-center text-base font-bold text-gray-700 mt-1.5 max-w-[280px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Bem-vindo ao universo KIDZZ 🌍
        </motion.p>

        {/* CTA */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.button
              key="cta"
              onClick={() => {
                sfx("unlock");
                haptic("medium");
                onEnter();
              }}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              whileTap={{ scale: 0.96 }}
              className="relative z-10 mt-10 px-10 py-5 rounded-full text-white font-extrabold text-lg shadow-2xl overflow-hidden min-h-[56px] min-w-[260px]"
              style={{
                background:
                  "linear-gradient(135deg, hsl(35 95% 58%), hsl(28 95% 62%) 60%, hsl(280 75% 65%))",
                boxShadow:
                  "0 0 30px hsl(35 95% 60% / 0.55), 0 12px 32px rgba(0,0,0,0.18)",
              }}
            >
              <motion.span
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
                }}
                initial={{ x: "-110%" }}
                animate={{ x: "120%" }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="relative z-10">Entrar no universo 🚀</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </OnboardingShell>
  );
};

export default OnboardingWelcome;

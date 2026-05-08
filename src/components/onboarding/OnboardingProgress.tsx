import { motion } from "framer-motion";

interface Props {
  step: 1 | 2 | 3;
  total?: number;
}

/**
 * Premium onboarding progress — single sleek bar with shimmer and glow.
 * Replaces the old dot indicator for a more cinematic, app-store feel.
 */
const OnboardingProgress = ({ step, total = 3 }: Props) => {
  const pct = (step / total) * 100;
  return (
    <div className="w-full max-w-sm mx-auto pt-2 select-none">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-700/80">
          KIDZZ • Início
        </span>
        <span className="text-[10px] font-black text-gray-700/80">
          {step}/{total}
        </span>
      </div>
      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.45)",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
          backdropFilter: "blur(6px)",
        }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 140, damping: 22 }}
          style={{
            background:
              "linear-gradient(90deg, hsl(35 95% 58%) 0%, hsl(45 95% 62%) 60%, hsl(28 95% 60%) 100%)",
            boxShadow: "0 0 14px hsl(35 95% 58% / 0.55)",
          }}
        />
        {/* Shimmer overlay */}
        <motion.div
          className="absolute inset-y-0 w-1/3 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
            mixBlendMode: "overlay",
          }}
          initial={{ x: "-120%" }}
          animate={{ x: "320%" }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default OnboardingProgress;

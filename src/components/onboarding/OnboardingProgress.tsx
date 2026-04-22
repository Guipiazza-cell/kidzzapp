import { motion } from "framer-motion";

interface Props {
  step: 1 | 2 | 3;
  total?: number;
}

const OnboardingProgress = ({ step, total = 3 }: Props) => (
  <div className="flex items-center justify-center gap-2 pt-2">
    {Array.from({ length: total }).map((_, i) => {
      const idx = i + 1;
      const isActive = idx <= step;
      const isCurrent = idx === step;
      return (
        <motion.span
          key={i}
          className="rounded-full"
          initial={false}
          animate={{
            width: isCurrent ? 28 : 10,
            height: 10,
            background: isActive
              ? "hsl(35 90% 55%)"
              : "hsl(0 0% 100% / 0.5)",
            boxShadow: isCurrent ? "0 0 12px hsl(35 90% 55% / 0.6)" : "none",
          }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
        />
      );
    })}
  </div>
);

export default OnboardingProgress;

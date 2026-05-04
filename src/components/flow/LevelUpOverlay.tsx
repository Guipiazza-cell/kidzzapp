import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { getLevelTitle, getTier } from "@/lib/levelSystem";

interface Detail {
  from: number;
  to: number;
}

const tierGlow: Record<ReturnType<typeof getTier>, string> = {
  spark: "0 0 40px hsl(45 95% 60% / 0.55)",
  glow: "0 0 60px hsl(280 80% 65% / 0.7)",
  aura: "0 0 80px hsl(200 90% 60% / 0.85)",
  energy: "0 0 100px hsl(140 90% 55% / 0.95)",
};

export default function LevelUpOverlay() {
  const [detail, setDetail] = useState<Detail | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<Detail>;
      if (!ev.detail) return;
      setDetail(ev.detail);
      confetti({
        particleCount: 90,
        spread: 100,
        origin: { y: 0.45 },
        colors: ["#FBBF24", "#A78BFA", "#34D399", "#F472B6", "#fff"],
        scalar: 1.1,
      });
      const t = setTimeout(() => setDetail(null), 2800);
      return () => clearTimeout(t);
    };
    window.addEventListener("kidzz:level-up", handler as EventListener);
    return () => window.removeEventListener("kidzz:level-up", handler as EventListener);
  }, []);

  if (!detail) return null;
  const tier = getTier(detail.to);
  const title = getLevelTitle(detail.to);

  return (
    <AnimatePresence>
      <motion.div
        key="lvl-up"
        className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          className="relative px-8 py-7 rounded-3xl bg-gradient-to-br from-amber-300 via-pink-300 to-purple-400 text-center"
          style={{ boxShadow: tierGlow[tier] }}
          initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
        >
          <motion.div
            className="text-6xl mb-2"
            animate={{ scale: [1, 1.25, 1], rotate: [0, 12, -12, 0] }}
            transition={{ duration: 1.4, repeat: 1 }}
          >
            🌟
          </motion.div>
          <p className="text-[11px] font-black tracking-[0.18em] text-white/90 uppercase">
            Você evoluiu!
          </p>
          <p className="text-3xl font-black text-white drop-shadow mt-1">
            Nível {detail.to}
          </p>
          <p className="text-sm font-extrabold text-white/95 mt-1">{title}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getLevelInfo, type LevelInfo } from "@/lib/levelSystem";

/**
 * KIDZZ Aura — visual evolution badge that floats behind the hero.
 * Tier upgrades by level (1-100):
 *   1-9 spark   → faint amber glow
 *   10-29 glow  → pink/purple radial
 *   30-59 aura  → larger blue/indigo + slow rotation
 *   60-100 energy → vibrant green/cyan + particles
 */
const tierStyles: Record<LevelInfo["tier"], { bg: string; size: number; opacity: number }> = {
  spark: { bg: "radial-gradient(circle, hsl(45 95% 65% / 0.55), transparent 70%)", size: 180, opacity: 0.6 },
  glow:  { bg: "radial-gradient(circle, hsl(290 80% 65% / 0.65), hsl(330 80% 60% / 0.3) 60%, transparent 80%)", size: 220, opacity: 0.75 },
  aura:  { bg: "radial-gradient(circle, hsl(200 90% 60% / 0.7), hsl(240 80% 55% / 0.35) 55%, transparent 80%)", size: 260, opacity: 0.85 },
  energy:{ bg: "radial-gradient(circle, hsl(140 90% 55% / 0.8), hsl(180 90% 55% / 0.4) 55%, transparent 80%)", size: 300, opacity: 0.95 },
};

export default function KidzzAura() {
  const [info, setInfo] = useState<LevelInfo>(() => getLevelInfo());
  useEffect(() => {
    const refresh = () => setInfo(getLevelInfo());
    window.addEventListener("kidzz:xp-gained", refresh);
    window.addEventListener("kidzz:level-up", refresh);
    return () => {
      window.removeEventListener("kidzz:xp-gained", refresh);
      window.removeEventListener("kidzz:level-up", refresh);
    };
  }, []);

  if (info.level < 3) return null; // só após sair do tier inicial
  const s = tierStyles[info.tier];

  return (
    <div className="relative w-full max-w-sm h-0 pointer-events-none" aria-hidden>
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: 8,
          width: s.size,
          height: s.size,
          background: s.bg,
          borderRadius: "50%",
          filter: "blur(6px)",
          opacity: s.opacity,
          zIndex: 0,
        }}
        animate={
          info.tier === "energy"
            ? { scale: [1, 1.1, 1], rotate: [0, 360] }
            : info.tier === "aura"
            ? { scale: [1, 1.06, 1], rotate: [0, 180, 360] }
            : { scale: [1, 1.04, 1] }
        }
        transition={{
          duration: info.tier === "energy" ? 6 : info.tier === "aura" ? 10 : 3.2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {info.tier === "energy" && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 top-12 w-1.5 h-1.5 rounded-full bg-emerald-300"
              style={{ boxShadow: "0 0 8px hsl(140 90% 60%)" }}
              animate={{
                x: [0, Math.cos((i / 6) * Math.PI * 2) * 90],
                y: [0, Math.sin((i / 6) * Math.PI * 2) * 90],
                opacity: [0, 1, 0],
              }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </>
      )}
    </div>
  );
}

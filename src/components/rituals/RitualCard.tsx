import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";
import { useMemo } from "react";
import { getCurrentRitual } from "./rituals";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";

interface Props {
  onOpen: () => void;
}

/**
 * Card premium de Ritual da Família — aparece no Home conforme a hora.
 * Glossy, com glow respirando e ícone que pulsa suave.
 */
const RitualCard = ({ onOpen }: Props) => {
  const ritual = useMemo(() => getCurrentRitual(), []);
  const isNight = ritual.id === "night";

  return (
    <motion.button
      onClick={() => { haptic("light"); sfx("click"); onOpen(); }}
      className="w-full max-w-sm relative rounded-[28px] overflow-hidden text-left p-0"
      style={{
        background: ritual.gradient,
        boxShadow: `0 18px 40px -22px ${ritual.glow}, 0 2px 0 hsl(0 0% 100% / 0.7) inset`,
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
      whileTap={{ scale: 0.98 }}
      aria-label={ritual.label}
    >
      {/* gloss overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, hsl(0 0% 100% / 0.35) 0%, transparent 35%, transparent 65%, hsl(0 0% 100% / 0.15) 100%)",
        }}
      />
      {/* breathing glow */}
      <motion.div
        aria-hidden
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${ritual.glow}, transparent 70%)`, filter: "blur(8px)" }}
        animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.08, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative flex items-center gap-4 px-5 py-4">
        <motion.div
          className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
          style={{
            background: "hsl(0 0% 100% / 0.6)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 6px 16px -8px hsl(0 0% 0% / 0.2), 0 1px 0 hsl(0 0% 100% / 0.9) inset",
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {ritual.emoji}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div
            className="text-[10px] font-bold uppercase tracking-[0.14em] mb-0.5"
            style={{ color: isNight ? "hsl(0 0% 100% / 0.75)" : "hsl(var(--premium-ink-soft))" }}
          >
            {ritual.eyebrow}
          </div>
          <div
            className="text-[17px] font-black leading-tight"
            style={{ color: isNight ? "hsl(0 0% 100%)" : "hsl(var(--premium-ink))" }}
          >
            {ritual.label}
          </div>
          <div
            className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold"
            style={{ color: isNight ? "hsl(0 0% 100% / 0.7)" : "hsl(var(--premium-ink-soft))" }}
          >
            <Clock size={10} />
            {Math.round(ritual.totalSeconds / 60)} min · {ritual.steps.length} passos
          </div>
        </div>

        <motion.div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "hsl(0 0% 100% / 0.85)",
            boxShadow: `0 4px 12px -4px ${ritual.glow}`,
          }}
          whileHover={{ scale: 1.06 }}
        >
          <Play size={14} className="ml-0.5" style={{ color: "hsl(var(--premium-ink))" }} fill="currentColor" />
        </motion.div>
      </div>
    </motion.button>
  );
};

export default RitualCard;

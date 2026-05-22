import { motion } from "framer-motion";
import { Moon } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";

interface Props {
  onOpen: () => void;
}

/**
 * SleepCard — entry point for the global "Boa noite" ritual.
 * Premium dark glass with living moon glow + gentle breathing.
 */
const SleepCard = ({ onOpen }: Props) => {
  return (
    <motion.button
      onClick={() => {
        haptic("medium");
        sfx("click");
        onOpen();
      }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full overflow-hidden rounded-3xl p-5 text-left"
      style={{
        background:
          "linear-gradient(135deg, hsl(230 55% 14%) 0%, hsl(250 50% 18%) 50%, hsl(265 55% 16%) 100%)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.08) inset, 0 10px 36px rgba(0,0,0,0.35)",
        minHeight: 96,
      }}
    >
      {/* Aurora */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 80% at 20% 30%, hsl(220 90% 70% / 0.35), transparent 60%), radial-gradient(110% 70% at 90% 80%, hsl(280 80% 70% / 0.28), transparent 65%)",
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Twinkling stars */}
      {[...Array(8)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            left: `${15 + ((i * 37) % 75)}%`,
            top: `${20 + ((i * 53) % 60)}%`,
            width: 2,
            height: 2,
            boxShadow: "0 0 6px rgba(255,255,255,0.9)",
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: 2.5 + (i % 3),
            delay: i * 0.3,
            repeat: Infinity,
          }}
        />
      ))}

      <div className="relative z-10 flex items-center gap-4">
        <motion.div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background:
              "radial-gradient(circle, hsl(220 95% 88% / 0.95) 0%, hsl(220 95% 70% / 0.4) 70%)",
            boxShadow: "0 0 28px hsl(220 95% 75% / 0.55)",
          }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Moon className="text-indigo-900" size={26} strokeWidth={2} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-extrabold text-[18px] leading-tight">
              Modo dormir
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white/80 uppercase tracking-wider">
              4 min
            </span>
          </div>
          <p className="text-white/75 text-[14px] font-medium mt-1 leading-snug">
            Uma despedida calma do dia. Pra fechar os olhinhos juntos.
          </p>
        </div>
      </div>
    </motion.button>
  );
};

export default SleepCard;

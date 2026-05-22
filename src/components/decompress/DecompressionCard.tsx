import { motion } from "framer-motion";
import { Wind } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";

interface Props {
  onOpen: () => void;
}

/**
 * Card discreto premium para o Modo Decompressão.
 * Visual escuro/calmo (contrasta com restante claro do Home).
 */
const DecompressionCard = ({ onOpen }: Props) => (
  <motion.button
    onClick={() => { haptic("light"); sfx("click"); onOpen(); }}
    className="w-full max-w-sm relative rounded-[24px] overflow-hidden text-left p-0"
    style={{
      background:
        "linear-gradient(135deg, hsl(230 35% 18%) 0%, hsl(260 30% 22%) 100%)",
      boxShadow:
        "0 14px 30px -16px hsl(260 60% 30% / 0.6), 0 1px 0 hsl(0 0% 100% / 0.08) inset",
    }}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.12 }}
    whileTap={{ scale: 0.98 }}
    aria-label="Modo decompressão"
  >
    {/* Living aurora */}
    <motion.div
      aria-hidden
      className="absolute -top-12 -left-12 w-40 h-40 rounded-full pointer-events-none"
      style={{
        background: "radial-gradient(circle, hsl(280 70% 55% / 0.55), transparent 70%)",
        filter: "blur(8px)",
      }}
      animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.1, 1] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      aria-hidden
      className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
      style={{
        background: "radial-gradient(circle, hsl(220 70% 55% / 0.5), transparent 70%)",
        filter: "blur(8px)",
      }}
      animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.08, 1] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    />

    <div className="relative flex items-center gap-4 px-5 py-4">
      <div
        className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{
          background: "hsl(0 0% 100% / 0.12)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 12px -6px hsl(260 70% 40%), 0 1px 0 hsl(0 0% 100% / 0.15) inset",
        }}
      >
        <Wind size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55 mb-0.5">
          Só para você · 60s
        </div>
        <div className="text-[16px] font-black text-white leading-tight">
          Decompressão antes do encontro
        </div>
        <div className="text-[11px] font-medium text-white/60 mt-0.5">
          Respire fundo antes de virar pai/mãe de novo.
        </div>
      </div>
    </div>
  </motion.button>
);

export default DecompressionCard;

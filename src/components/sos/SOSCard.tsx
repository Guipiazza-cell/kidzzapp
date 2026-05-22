import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";

/**
 * Card SOS na HOME — espelha o card "Perguntar" (acima),
 * porém com CTA vermelho. Sem ícone de coração.
 */
interface Props {
  onOpen: () => void;
}

const SOSCard = ({ onOpen }: Props) => {
  const handleOpen = () => {
    haptic("medium");
    sfx("click");
    onOpen();
  };

  return (
    <motion.section
      className="w-full max-w-sm mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.42, type: "spring", stiffness: 200, damping: 24 }}
    >
      <div
        className="w-full p-4 rounded-[28px] relative overflow-hidden"
        style={{
          background: "hsl(0 0% 100% / 0.74)",
          backdropFilter: "blur(12px) saturate(1.05)",
          WebkitBackdropFilter: "blur(12px) saturate(1.05)",
          border: "1px solid hsl(0 0% 100% / 0.7)",
          boxShadow:
            "0 10px 32px -16px hsl(100 15% 18% / 0.14), 0 0 40px hsl(0 60% 70% / 0.06)",
        }}
      >
        {/* halo emocional sutil */}
        <div
          aria-hidden
          className="absolute -left-8 -bottom-10 w-36 h-36 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--sos-glow) / 0.22), transparent 70%)",
            filter: "blur(14px)",
          }}
        />

        {/* Copy */}
        <div className="relative">
          <p
            className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
            style={{ color: "hsl(var(--sos-to))" }}
          >
            SOS Kidzz
          </p>
          <h3
            className="text-[17px] font-black leading-[1.15] tracking-tight"
            style={{ color: "hsl(var(--premium-ink))" }}
          >
            Precisa de ajuda agora?
          </h3>
          <p
            className="text-[12px] font-medium leading-snug mt-1"
            style={{ color: "hsl(var(--premium-ink-soft))" }}
          >
            Acolhimento em 1 toque. Você não está sozinho(a).
          </p>
        </div>

        {/* CTA SOS — espelha "Perguntar", em vermelho */}
        <motion.button
          type="button"
          onClick={handleOpen}
          className="btn-sos-premium relative mt-3 w-full py-3 rounded-2xl text-[14px] font-black tracking-tight flex items-center justify-center gap-1.5 overflow-hidden"
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -1 }}
          aria-label="Abrir SOS Kidzz — apoio para momentos difíceis"
        >
          <span className="shine-overlay" aria-hidden />
          <span className="relative">SOS Kidzz</span>
          <Sparkles size={14} className="relative" />
        </motion.button>
      </div>
    </motion.section>
  );
};

export default SOSCard;

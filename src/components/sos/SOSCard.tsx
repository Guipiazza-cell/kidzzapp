import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";

/**
 * Card SOS na HOME — ponto emocional principal.
 * Botão redondo metálico vermelho (estilo Apple Wellness).
 * Visual respira lentamente para sugerir "presença viva".
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
        className="w-full px-5 py-5 rounded-[28px] relative overflow-hidden flex items-center gap-4"
        style={{
          background: "hsl(0 0% 100% / 0.74)",
          backdropFilter: "blur(12px) saturate(1.05)",
          WebkitBackdropFilter: "blur(12px) saturate(1.05)",
          border: "1px solid hsl(0 0% 100% / 0.7)",
          boxShadow:
            "0 10px 32px -16px hsl(100 15% 18% / 0.14), 0 0 50px hsl(0 80% 70% / 0.08)",
        }}
      >
        {/* halo emocional vermelho atrás do botão */}
        <div
          aria-hidden
          className="absolute -left-6 top-1/2 -translate-y-1/2 w-44 h-44 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, hsl(0 90% 70% / 0.22), transparent 70%)",
            filter: "blur(18px)",
          }}
        />

        {/* BOTÃO METÁLICO VERMELHO — ponto emocional */}
        <motion.button
          type="button"
          onClick={handleOpen}
          whileTap={{ scale: 0.94 }}
          aria-label="Abrir SOS Kidzz — apoio emocional em 1 toque"
          className="sos-btn-metallic sos-breath relative flex-shrink-0 rounded-full flex items-center justify-center"
          style={{ width: 82, height: 82 }}
        >
          <Heart
            size={30}
            strokeWidth={2.4}
            className="text-white relative z-10 drop-shadow-[0_2px_3px_rgba(120,10,10,0.45)]"
            fill="currentColor"
          />
        </motion.button>

        {/* Copy */}
        <div className="relative min-w-0 flex-1">
          <p
            className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
            style={{ color: "hsl(0 72% 48%)" }}
          >
            SOS Kidzz
          </p>
          <h3
            className="text-[16px] font-black leading-[1.15] tracking-tight"
            style={{ color: "hsl(var(--premium-ink))" }}
          >
            Precisa de ajuda agora?
          </h3>
          <p
            className="text-[12px] font-medium leading-snug mt-1"
            style={{ color: "hsl(var(--premium-ink-soft))" }}
          >
            Acolhimento em 1 toque.
          </p>
        </div>
      </div>
    </motion.section>
  );
};

export default SOSCard;

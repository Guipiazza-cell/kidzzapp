import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";

/**
 * Card SOS na HOME — acolhimento de emergência emocional.
 * Sem mascote: orb gloss premium respirando, copy emocional à esquerda.
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
      <button
        type="button"
        onClick={handleOpen}
        className="w-full text-left flex items-center gap-4 p-4 rounded-[28px] relative overflow-hidden active:scale-[0.99] transition-transform"
        style={{
          background: "hsl(0 0% 100% / 0.74)",
          backdropFilter: "blur(12px) saturate(1.05)",
          WebkitBackdropFilter: "blur(12px) saturate(1.05)",
          border: "1px solid hsl(0 0% 100% / 0.7)",
          boxShadow:
            "0 10px 32px -16px hsl(100 15% 18% / 0.14), 0 0 40px hsl(0 60% 70% / 0.06)",
          minHeight: 108,
        }}
        aria-label="Abrir SOS Kidzz — apoio para momentos difíceis"
      >
        {/* halo emocional sutil rosa→coral */}
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
        <div className="flex-1 min-w-0 relative">
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

        {/* Orb SOS premium com gloss */}
        <motion.div
          className="relative flex-shrink-0 flex items-center justify-center"
          style={{ width: 72, height: 72 }}
        >
          {/* glow externo pulsante */}
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background: "hsl(var(--sos-glow) / 0.42)",
              filter: "blur(14px)",
            }}
            animate={{ scale: [1, 1.22, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* anel sutil */}
          <span
            aria-hidden
            className="absolute rounded-full"
            style={{
              inset: 4,
              border: "1px solid hsl(0 100% 92% / 0.7)",
            }}
          />
          {/* botão principal */}
          <motion.span
            className="relative rounded-full flex items-center justify-center text-white font-black tracking-[0.14em]"
            style={{
              width: 58,
              height: 58,
              fontSize: 12,
              background:
                "radial-gradient(circle at 32% 28%, hsl(0 100% 86%) 0%, hsl(var(--sos-from)) 38%, hsl(var(--sos-to)) 100%)",
              boxShadow:
                "0 0 28px hsl(var(--sos-glow) / 0.55), 0 8px 18px hsl(0 60% 25% / 0.32), inset 0 2px 6px hsl(0 100% 95% / 0.7), inset 0 -8px 16px hsl(0 70% 30% / 0.32)",
            }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* gloss highlight superior */}
            <span
              aria-hidden
              className="absolute rounded-full pointer-events-none"
              style={{
                top: 6,
                left: 10,
                width: 28,
                height: 16,
                background:
                  "linear-gradient(180deg, hsl(0 0% 100% / 0.85), hsl(0 0% 100% / 0))",
                filter: "blur(1.5px)",
              }}
            />
            {/* reflexo inferior sutil */}
            <span
              aria-hidden
              className="absolute rounded-full pointer-events-none"
              style={{
                bottom: 6,
                left: 14,
                width: 30,
                height: 6,
                background:
                  "linear-gradient(180deg, hsl(0 0% 100% / 0), hsl(0 0% 100% / 0.25))",
                filter: "blur(2px)",
              }}
            />
            <span className="relative flex items-center gap-0.5">
              <Heart size={10} className="fill-white" strokeWidth={2.5} />
              <span>SOS</span>
            </span>
          </motion.span>
        </motion.div>
      </button>
    </motion.section>
  );
};

export default SOSCard;

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";

/**
 * Card SOS na HOME — acolhimento de emergência emocional.
 * Visual: vidro fosco branco + botão circular respirando em gradiente coral→vermelho.
 * NÃO é "ajuda médica" — é "você não está sozinho(a)".
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
        className="w-full text-left flex items-center gap-3 p-4 rounded-[28px] relative overflow-hidden active:scale-[0.99] transition-transform"
        style={{
          background: "hsl(0 0% 100% / 0.72)",
          backdropFilter: "blur(12px) saturate(1.05)",
          WebkitBackdropFilter: "blur(12px) saturate(1.05)",
          border: "1px solid hsl(0 0% 100% / 0.7)",
          boxShadow:
            "0 10px 32px -16px hsl(100 15% 18% / 0.12), 0 0 40px hsl(85 30% 60% / 0.08)",
          minHeight: 110,
        }}
        aria-label="Abrir SOS Kidzz — apoio para momentos difíceis"
      >
        {/* halo emocional sutil rosa→coral */}
        <div
          aria-hidden
          className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--sos-glow) / 0.18), transparent 70%)",
            filter: "blur(12px)",
          }}
        />

        {/* Lado esquerdo: ícone emocional / camaleão simplificado */}
        <div className="relative flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full"
          style={{
            background: "linear-gradient(135deg, hsl(0 60% 96%), hsl(15 60% 92%))",
            border: "1px solid hsl(0 50% 88%)",
          }}
        >
          <span className="text-[26px]" aria-hidden>🦎</span>
          <span
            aria-hidden
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg, hsl(var(--sos-from)), hsl(var(--sos-to)))",
              boxShadow: "0 0 10px hsl(var(--sos-glow) / 0.6)",
            }}
          >
            <Heart size={10} className="text-white fill-white" strokeWidth={2.5} />
          </span>
        </div>

        {/* Centro: copy emocional */}
        <div className="flex-1 min-w-0 relative">
          <p
            className="text-[10px] font-black uppercase tracking-[0.18em] mb-0.5"
            style={{ color: "hsl(var(--sos-to))" }}
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
            className="text-[12px] font-medium leading-snug mt-0.5"
            style={{ color: "hsl(var(--premium-ink-soft))" }}
          >
            Você não precisa passar por isso sozinho.
          </p>
        </div>

        {/* Botão SOS circular respirando */}
        <motion.div
          className="relative flex-shrink-0 flex items-center justify-center"
          style={{ width: 56, height: 56 }}
        >
          {/* Glow pulsante externo */}
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background: "hsl(var(--sos-glow) / 0.35)",
              filter: "blur(10px)",
            }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className="relative w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-[12px] tracking-wider"
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--sos-from)) 0%, hsl(var(--sos-to)) 100%)",
              boxShadow:
                "0 0 24px hsl(var(--sos-glow) / 0.45), 0 6px 14px hsl(0 50% 30% / 0.25), inset 0 1px 0 hsl(0 100% 90% / 0.6)",
            }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            SOS
          </motion.span>
        </motion.div>
      </button>
    </motion.section>
  );
};

export default SOSCard;

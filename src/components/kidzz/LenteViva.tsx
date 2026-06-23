import { memo } from "react";
import { motion } from "framer-motion";

export type LenteVivaMotif = "book" | "puzzle" | "wave" | "film";

interface Props {
  accent: string;             // hex accent, e.g. "#E8821A"
  motif: LenteVivaMotif;
  size?: number;              // px, default 120
  label?: string;             // a11y label
}

/**
 * Lente Viva — disco de "vidro vivo" usado no topo das 4 abas
 * (Histórias / Brincar / Música / Cinema). Substitui o mascote camaleão
 * por uma assinatura visual consistente e premium.
 *
 * Material: cream + véu radial do acento, blur 8px, specular topo-esquerda.
 */
const Motif = ({ name, color, size }: { name: LenteVivaMotif; color: string; size: number }) => {
  const s = Math.round(size * 0.46); // motif fits ~46% of disc
  const stroke = 1.5;
  switch (name) {
    case "book":
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
          <path d="M6 10c6-2 12-2 18 2 6-4 12-4 18-2v28c-6-2-12-2-18 2-6-4-12-4-18-2V10z"
            stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
          <path d="M24 12v28" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
        </svg>
      );
    case "puzzle":
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
          <path d="M10 14h8a3 3 0 1 1 6 0h8v8a3 3 0 1 1 0 6v8h-8a3 3 0 1 0-6 0h-8v-8a3 3 0 1 0 0-6v-8z"
            stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
        </svg>
      );
    case "wave":
      return (
        <svg width={s} height={s + 4} viewBox="0 0 48 24" fill="none">
          {[6, 12, 18, 24, 30, 36, 42].map((x, i) => {
            const h = [8, 14, 20, 22, 18, 12, 6][i];
            return (
              <line key={x} x1={x} y1={12 - h / 2} x2={x} y2={12 + h / 2}
                stroke={color} strokeWidth={stroke + 0.5} strokeLinecap="round" />
            );
          })}
        </svg>
      );
    case "film":
      return (
        <svg width={s} height={s * 0.7} viewBox="0 0 48 34" fill="none">
          <rect x="4" y="4" width="40" height="26" rx="3"
            stroke={color} strokeWidth={stroke} />
          {[10, 18, 26, 34].map((x) => (
            <g key={x}>
              <rect x={x - 1.5} y="1" width="3" height="3" rx="0.5" stroke={color} strokeWidth={stroke} />
              <rect x={x - 1.5} y="30" width="3" height="3" rx="0.5" stroke={color} strokeWidth={stroke} />
            </g>
          ))}
        </svg>
      );
  }
};

const LenteVivaBase = ({ accent, motif, size = 120, label }: Props) => {
  return (
    <motion.div
      role="img"
      aria-label={label || "Kidzz"}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        // base cream + radial accent veil
        background: `
          radial-gradient(circle at 35% 30%, ${accent}33 0%, ${accent}10 38%, transparent 70%),
          radial-gradient(circle at 70% 80%, ${accent}1F 0%, transparent 60%),
          linear-gradient(160deg, #FFFCF8 0%, #FBF7EF 100%)
        `,
        backdropFilter: "blur(8px) saturate(140%)",
        WebkitBackdropFilter: "blur(8px) saturate(140%)",
        border: `1px solid ${accent}33`,
        boxShadow: `
          0 12px 32px -10px ${accent}55,
          0 4px 14px rgba(42,37,32,0.10),
          inset 0 1px 0 rgba(255,255,255,0.85)
        `,
      }}
    >
      {/* Specular highlight (topo-esquerda) */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 2, left: 8,
          width: "55%", height: "40%",
          borderRadius: "50%",
          background: "linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(2px)",
          pointerEvents: "none",
        }}
      />
      {/* Motif */}
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Motif name={motif} color={accent} size={size} />
      </div>
      {/* Inner ring */}
      <span
        aria-hidden
        style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.5)`,
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
};

export default memo(LenteVivaBase);

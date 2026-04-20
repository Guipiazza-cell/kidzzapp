import { motion } from "framer-motion";

/* ── Pixel Musical (mascote do Bom Dia) ──
   Reutiliza identidade do Pixel: camaleão escuro com glow azul.
   Estados: idle / sing / happy.
*/

interface Props {
  mood?: "idle" | "sing" | "happy";
  size?: "sm" | "md" | "lg" | "xl";
  onTap?: () => void;
}

const SIZE_MAP = { sm: 64, md: 96, lg: 128, xl: 168 };

const PixelMusical = ({ mood = "idle", size = "lg", onTap }: Props) => {
  const px = SIZE_MAP[size];
  const breathe = mood === "idle"
    ? { scale: [1, 1.04, 1] }
    : mood === "sing"
    ? { scale: [1, 1.08, 1], rotate: [-2, 2, -2] }
    : { scale: [1, 1.15, 1], y: [0, -6, 0] };

  return (
    <motion.button
      type="button"
      onClick={onTap}
      whileTap={{ scale: 0.95 }}
      className="relative inline-flex items-center justify-center"
      style={{ width: px, height: px }}
      animate={breathe}
      transition={{ duration: mood === "idle" ? 3 : 1.2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Aura azul */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, hsl(210 95% 60% / 0.45), transparent 65%)", filter: "blur(8px)" }}
        animate={{ opacity: mood === "idle" ? [0.4, 0.7, 0.4] : [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <svg viewBox="0 0 200 200" width={px} height={px}>
        <defs>
          <radialGradient id="pixelBody" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="hsl(220 40% 28%)" />
            <stop offset="100%" stopColor="hsl(220 50% 14%)" />
          </radialGradient>
          <radialGradient id="pixelEye" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="hsl(210 80% 90%)" />
          </radialGradient>
        </defs>

        {/* Tail */}
        <motion.path
          d="M 40 130 Q 15 120, 25 95 Q 40 80, 55 100"
          fill="url(#pixelBody)"
          animate={mood === "sing" ? { rotate: [0, 8, -8, 0] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{ originX: "55px", originY: "100px" }}
        />

        {/* Body */}
        <ellipse cx="100" cy="120" rx="55" ry="48" fill="url(#pixelBody)" />

        {/* Head */}
        <ellipse cx="125" cy="80" rx="42" ry="38" fill="url(#pixelBody)" />

        {/* Crest */}
        <path d="M 145 50 Q 150 35, 160 45 Q 155 55, 145 55 Z" fill="hsl(210 70% 35%)" />

        {/* Eye */}
        <circle cx="135" cy="75" r="11" fill="url(#pixelEye)" />
        <motion.circle
          cx="138" cy="76" r="5" fill="hsl(220 80% 15%)"
          animate={mood === "sing" ? { cy: [76, 73, 76] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
        <circle cx="139" cy="74" r="1.5" fill="white" />

        {/* Mouth — sings (open O) when singing */}
        {mood === "sing" ? (
          <motion.ellipse cx="148" cy="92" rx="6" ry="8" fill="hsl(340 70% 35%)"
            animate={{ ry: [8, 5, 8] }} transition={{ duration: 0.4, repeat: Infinity }} />
        ) : (
          <path d="M 142 92 Q 150 95, 156 91" stroke="hsl(220 60% 20%)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}

        {/* Cheek glow */}
        <circle cx="118" cy="92" r="6" fill="hsl(340 80% 70% / 0.5)" />

        {/* Legs */}
        <ellipse cx="80" cy="160" rx="10" ry="14" fill="url(#pixelBody)" />
        <ellipse cx="120" cy="160" rx="10" ry="14" fill="url(#pixelBody)" />
      </svg>

      {/* Music notes orbiting when singing */}
      {mood === "sing" && (
        <>
          {["♪", "♫", "♩"].map((n, i) => (
            <motion.div
              key={i}
              className="absolute text-amber-300 font-bold pointer-events-none"
              style={{ fontSize: px * 0.18, left: "50%", top: "50%" }}
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{
                x: Math.cos((i / 3) * Math.PI * 2) * px * 0.5,
                y: Math.sin((i / 3) * Math.PI * 2) * px * 0.5 - 20,
                opacity: [0, 1, 0],
                rotate: [0, 360],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            >
              {n}
            </motion.div>
          ))}
        </>
      )}
    </motion.button>
  );
};

export default PixelMusical;

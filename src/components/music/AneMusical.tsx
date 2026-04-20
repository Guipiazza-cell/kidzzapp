import { motion } from "framer-motion";

/* ── Ane Musical ──
   Camaleoa rosa pastel com coroa de folhas, coração luminoso pulsando.
   Estados: idle / dance / sing / happy.
*/

interface Props {
  mood?: "idle" | "dance" | "sing" | "happy";
  size?: "sm" | "md" | "lg" | "xl";
  onTap?: () => void;
}

const SIZE_MAP = { sm: 64, md: 96, lg: 128, xl: 168 };

const AneMusical = ({ mood = "idle", size = "lg", onTap }: Props) => {
  const px = SIZE_MAP[size];
  const motionProps =
    mood === "dance"
      ? { animate: { y: [0, -10, 0], rotate: [-6, 6, -6] }, transition: { duration: 0.6, repeat: Infinity } }
      : mood === "sing"
      ? { animate: { scale: [1, 1.06, 1] }, transition: { duration: 0.8, repeat: Infinity } }
      : mood === "happy"
      ? { animate: { scale: [1, 1.18, 1], y: [0, -12, 0] }, transition: { duration: 0.7, repeat: Infinity } }
      : { animate: { scale: [1, 1.04, 1] }, transition: { duration: 3, repeat: Infinity } };

  return (
    <motion.button
      type="button"
      onClick={onTap}
      whileTap={{ scale: 0.95 }}
      className="relative inline-flex items-center justify-center"
      style={{ width: px, height: px }}
      {...motionProps}
    >
      {/* Pink aura */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, hsl(340 95% 70% / 0.4), transparent 65%)", filter: "blur(10px)" }}
        animate={{ opacity: [0.4, 0.85, 0.4] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      />

      <svg viewBox="0 0 200 200" width={px} height={px}>
        <defs>
          <radialGradient id="aneBody" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="hsl(340 80% 78%)" />
            <stop offset="100%" stopColor="hsl(340 65% 60%)" />
          </radialGradient>
          <radialGradient id="aneEye" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="hsl(340 50% 95%)" />
          </radialGradient>
        </defs>

        {/* Tail */}
        <path d="M 40 130 Q 15 120, 25 95 Q 40 80, 55 100" fill="url(#aneBody)" />

        {/* Body */}
        <ellipse cx="100" cy="120" rx="55" ry="48" fill="url(#aneBody)" />

        {/* Heart glow on chest */}
        <motion.g
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "100px", originY: "125px" }}
        >
          <path d="M 100 132 L 92 122 Q 88 116, 94 114 Q 100 114, 100 120 Q 100 114, 106 114 Q 112 116, 108 122 Z"
            fill="hsl(0 90% 65%)" stroke="white" strokeWidth="1.5" />
        </motion.g>

        {/* Head */}
        <ellipse cx="125" cy="80" rx="42" ry="38" fill="url(#aneBody)" />

        {/* Leaf crown — 3 leaves */}
        <g>
          <path d="M 125 38 Q 122 28, 130 30 Q 132 38, 128 42 Z" fill="hsl(140 60% 50%)" />
          <path d="M 110 42 Q 105 33, 113 33 Q 117 40, 113 45 Z" fill="hsl(140 55% 55%)" />
          <path d="M 140 42 Q 145 33, 137 33 Q 133 40, 137 45 Z" fill="hsl(140 55% 55%)" />
        </g>

        {/* Eye */}
        <circle cx="135" cy="78" r="11" fill="url(#aneEye)" />
        <motion.circle
          cx="138" cy="79" r="5" fill="hsl(330 70% 25%)"
          animate={mood === "happy" ? { cy: [79, 76, 79] } : {}}
          transition={{ duration: 0.4, repeat: Infinity }}
        />
        <circle cx="139" cy="77" r="1.5" fill="white" />
        <path d="M 124 70 Q 130 67, 145 68" stroke="hsl(340 60% 50%)" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Mouth */}
        {mood === "sing" ? (
          <motion.ellipse cx="148" cy="92" rx="6" ry="8" fill="hsl(340 80% 35%)"
            animate={{ ry: [8, 5, 8] }} transition={{ duration: 0.4, repeat: Infinity }} />
        ) : (
          <path d="M 142 92 Q 150 96, 156 91" stroke="hsl(340 70% 30%)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}

        {/* Cheek pink */}
        <circle cx="118" cy="92" r="6" fill="hsl(340 90% 80% / 0.7)" />

        {/* Legs */}
        <ellipse cx="80" cy="160" rx="10" ry="14" fill="url(#aneBody)" />
        <ellipse cx="120" cy="160" rx="10" ry="14" fill="url(#aneBody)" />
      </svg>

      {/* Orbiting notes when singing/dancing */}
      {(mood === "sing" || mood === "dance" || mood === "happy") && (
        <>
          {["♪", "♫", "♩"].map((n, i) => (
            <motion.div
              key={i}
              className="absolute text-pink-300 font-bold pointer-events-none"
              style={{ fontSize: px * 0.16, left: "50%", top: "50%" }}
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{
                x: Math.cos((i / 3) * Math.PI * 2 + Date.now() / 1000) * px * 0.45,
                y: Math.sin((i / 3) * Math.PI * 2) * px * 0.45 - 18,
                opacity: [0, 1, 0],
                rotate: [0, 360],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
            >
              {n}
            </motion.div>
          ))}
        </>
      )}
    </motion.button>
  );
};

export default AneMusical;

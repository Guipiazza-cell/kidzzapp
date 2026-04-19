import { forwardRef } from "react";
import { motion } from "framer-motion";

export type AneMood = "idle" | "sing" | "dance" | "happy";

interface Props {
  mood?: AneMood;
  size?: "sm" | "md" | "lg" | "xl";
  onTap?: () => void;
  className?: string;
}

const sizes = {
  sm: 80,
  md: 130,
  lg: 180,
  xl: 240,
};

const AneMelodia = forwardRef<HTMLDivElement, Props>(({ mood = "idle", size = "lg", onTap, className = "" }, ref) => {
  const dim = sizes[size];

  const bodyAnim = {
    idle: { y: [0, -4, 0], rotate: [0, 1.5, -1.5, 0] },
    sing: { y: [0, -10, 0], rotate: [0, -3, 3, 0], scale: [1, 1.04, 1] },
    dance: { y: [0, -8, 0], rotate: [0, -8, 8, -4, 0], scale: [1, 1.06, 1] },
    happy: { y: [0, -14, 0], scale: [1, 1.1, 1] },
  };

  const dur = mood === "dance" ? 0.9 : mood === "sing" ? 1.4 : mood === "happy" ? 0.8 : 3.2;

  // Pastel pink palette — Ane (consistent with mascot identity)
  const colors = {
    bodyFrom: "hsl(340 85% 78%)",
    bodyTo: "hsl(330 75% 65%)",
    bellyFrom: "hsl(35 95% 92%)",
    bellyTo: "hsl(25 85% 86%)",
    leaf: "hsl(145 55% 55%)",
    leafLight: "hsl(135 65% 70%)",
    eye: "hsl(220 25% 18%)",
    heart: "hsl(0 85% 65%)",
  };

  return (
    <motion.div
      ref={ref}
      className={`relative inline-block cursor-pointer select-none ${className}`}
      style={{ width: dim, height: dim }}
      animate={bodyAnim[mood]}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
      whileTap={{ scale: 0.92 }}
      onClick={onTap}
    >
      {/* Ambient halo */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, hsl(340 85% 75% / 0.3), transparent 65%)`,
          filter: "blur(8px)",
        }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg viewBox="0 0 200 200" width={dim} height={dim} className="relative z-10 drop-shadow-xl">
        <defs>
          <radialGradient id="ane-body" cx="0.5" cy="0.4" r="0.7">
            <stop offset="0%" stopColor={colors.bodyFrom} />
            <stop offset="100%" stopColor={colors.bodyTo} />
          </radialGradient>
          <radialGradient id="ane-belly" cx="0.5" cy="0.5" r="0.6">
            <stop offset="0%" stopColor={colors.bellyFrom} />
            <stop offset="100%" stopColor={colors.bellyTo} />
          </radialGradient>
          <linearGradient id="ane-leaf" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.leafLight} />
            <stop offset="100%" stopColor={colors.leaf} />
          </linearGradient>
        </defs>

        {/* Tail */}
        <motion.path
          d="M 60 130 Q 30 140 35 110 Q 40 90 55 100"
          fill="url(#ane-body)"
          animate={{ d: mood === "dance" ? ["M 60 130 Q 30 140 35 110 Q 40 90 55 100", "M 60 130 Q 25 120 40 100 Q 55 95 58 105", "M 60 130 Q 30 140 35 110 Q 40 90 55 100"] : undefined }}
          transition={{ duration: 0.7, repeat: Infinity }}
        />

        {/* Body */}
        <ellipse cx="105" cy="115" rx="55" ry="48" fill="url(#ane-body)" />
        {/* Belly */}
        <ellipse cx="108" cy="128" rx="32" ry="26" fill="url(#ane-belly)" opacity="0.85" />

        {/* Heart center (pulsing) */}
        <motion.g
          animate={{ scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: mood === "sing" ? 0.8 : 1.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "108px 130px" }}
        >
          <path d="M 108 138 C 102 132 96 126 100 121 C 103 117 108 119 108 122 C 108 119 113 117 116 121 C 120 126 114 132 108 138 Z" fill={colors.heart} opacity="0.85" />
        </motion.g>

        {/* Head */}
        <ellipse cx="120" cy="80" rx="42" ry="38" fill="url(#ane-body)" />

        {/* Leaf crown — three leaves */}
        <g>
          <motion.path
            d="M 100 50 Q 95 35 110 32 Q 115 42 105 52 Z"
            fill="url(#ane-leaf)"
            animate={{ rotate: [0, -3, 3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "105px 45px" }}
          />
          <motion.path
            d="M 120 42 Q 122 25 138 30 Q 138 45 125 52 Z"
            fill="url(#ane-leaf)"
            animate={{ rotate: [0, 4, -2, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "128px 42px" }}
          />
          <motion.path
            d="M 140 50 Q 152 40 155 55 Q 150 65 138 60 Z"
            fill="url(#ane-leaf)"
            animate={{ rotate: [0, -4, 3, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "146px 55px" }}
          />
        </g>

        {/* Eyes — large, warm */}
        <ellipse cx="108" cy="78" rx="7" ry="9" fill="white" />
        <ellipse cx="135" cy="78" rx="7" ry="9" fill="white" />
        <motion.g
          animate={mood === "sing" || mood === "happy" ? { scaleY: [1, 0.2, 1] } : undefined}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
          style={{ transformOrigin: "120px 80px" }}
        >
          <circle cx="109" cy="80" r="3.5" fill={colors.eye} />
          <circle cx="136" cy="80" r="3.5" fill={colors.eye} />
          <circle cx="110" cy="78.5" r="1.2" fill="white" />
          <circle cx="137" cy="78.5" r="1.2" fill="white" />
        </motion.g>

        {/* Cheek blush */}
        <ellipse cx="98" cy="92" rx="5" ry="3" fill="hsl(0 80% 75%)" opacity="0.5" />
        <ellipse cx="146" cy="92" rx="5" ry="3" fill="hsl(0 80% 75%)" opacity="0.5" />

        {/* Mouth */}
        {mood === "sing" || mood === "happy" ? (
          <motion.ellipse
            cx="122" cy="98" rx="6" ry="5"
            fill={colors.eye}
            animate={{ ry: [5, 8, 5], rx: [6, 8, 6] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        ) : (
          <path d="M 115 98 Q 122 103 130 98" stroke={colors.eye} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        )}
      </svg>

      {/* Orbiting notes */}
      {(mood === "sing" || mood === "dance" || mood === "happy") && (
        <>
          {["♪", "♫", "♩"].map((n, i) => (
            <motion.div
              key={i}
              className="absolute text-pink-500 font-bold pointer-events-none"
              style={{
                fontSize: dim * 0.13,
                top: `${20 + i * 12}%`,
                left: `${85 - i * 8}%`,
                textShadow: "0 2px 6px rgba(255,255,255,0.8)",
              }}
              animate={{
                y: [0, -dim * 0.4, -dim * 0.6],
                opacity: [0, 1, 0],
                rotate: [0, 15, -10],
              }}
              transition={{ duration: 1.6 + i * 0.2, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
            >
              {n}
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
  );
});

AneMelodia.displayName = "AneMelodia";
export default AneMelodia;

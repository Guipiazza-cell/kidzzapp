import { motion } from "framer-motion";

export type CharExpression = "calm" | "happy" | "curious" | "sleepy";
export type CharEnergy = "low" | "medium" | "high" | "ultra";

interface CharacterState {
  color: { from: string; to: string };
  expression: CharExpression;
  outfit: string;
  energy: CharEnergy;
}

interface Props {
  state: CharacterState;
}

const ENERGY_CONFIG = {
  low:    { breathDur: 5, breathScale: 1.02, glowOpacity: 0.15, pupilSpeed: 6 },
  medium: { breathDur: 3, breathScale: 1.04, glowOpacity: 0.3,  pupilSpeed: 4 },
  high:   { breathDur: 1.8, breathScale: 1.07, glowOpacity: 0.5, pupilSpeed: 2.5 },
  ultra:  { breathDur: 1, breathScale: 1.1, glowOpacity: 0.75, pupilSpeed: 1.5 },
};

const EXPRESSION_CONFIG = {
  calm:    { eyeScaleY: 1, pupilY: 0, mouthPath: "M 35,72 Q 50,78 65,72", blinkRate: 4 },
  happy:   { eyeScaleY: 0.7, pupilY: -1, mouthPath: "M 32,68 Q 50,82 68,68", blinkRate: 3 },
  curious: { eyeScaleY: 1.15, pupilY: -2, mouthPath: "M 43,73 Q 50,77 57,73", blinkRate: 5 },
  sleepy:  { eyeScaleY: 0.35, pupilY: 2, mouthPath: "M 40,74 Q 50,76 60,74", blinkRate: 8 },
};

const DynamicCharacter = ({ state }: Props) => {
  const { color, expression, outfit, energy } = state;
  const eConf = ENERGY_CONFIG[energy];
  const xConf = EXPRESSION_CONFIG[expression];

  return (
    <motion.div className="relative w-56 h-56">
      {/* SVG Character */}
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        animate={{ scale: [1, eConf.breathScale, 1] }}
        transition={{ duration: eConf.breathDur, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <radialGradient id="bodyGrad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={color.from} />
            <stop offset="100%" stopColor={color.to} />
          </radialGradient>
          <radialGradient id="bellyGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color.from} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color.to} stopOpacity="0.1" />
          </radialGradient>
          <filter id="charShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={color.from} floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Tail */}
        <motion.path
          d="M 75,65 Q 88,55 92,40 Q 95,32 90,28"
          fill="none"
          stroke="url(#bodyGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          animate={{ d: [
            "M 75,65 Q 88,55 92,40 Q 95,32 90,28",
            "M 75,65 Q 90,58 94,44 Q 96,35 88,32",
            "M 75,65 Q 88,55 92,40 Q 95,32 90,28",
          ]}}
          transition={{ duration: eConf.breathDur * 1.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Body */}
        <ellipse cx="50" cy="58" rx="28" ry="24" fill="url(#bodyGrad)" filter="url(#charShadow)" />

        {/* Belly */}
        <ellipse cx="50" cy="62" rx="18" ry="14" fill="url(#bellyGrad)" />

        {/* Legs */}
        <ellipse cx="36" cy="78" rx="8" ry="5" fill={color.to} opacity="0.8" />
        <ellipse cx="64" cy="78" rx="8" ry="5" fill={color.to} opacity="0.8" />

        {/* Head crest / ridge */}
        <motion.path
          d="M 38,38 Q 42,28 50,26 Q 58,28 62,38"
          fill={color.from}
          opacity="0.7"
          animate={{ d: [
            "M 38,38 Q 42,28 50,26 Q 58,28 62,38",
            "M 38,38 Q 42,25 50,23 Q 58,25 62,38",
            "M 38,38 Q 42,28 50,26 Q 58,28 62,38",
          ]}}
          transition={{ duration: eConf.breathDur * 2, repeat: Infinity }}
        />

        {/* Eyes — left */}
        <g transform="translate(40, 48)">
          <motion.ellipse
            cx="0" cy="0" rx="6" ry="7"
            fill="white"
            animate={{ scaleY: [xConf.eyeScaleY, xConf.eyeScaleY, 0.1, xConf.eyeScaleY] }}
            transition={{ duration: xConf.blinkRate, repeat: Infinity, times: [0, 0.92, 0.96, 1] }}
          />
          <motion.circle
            cx="0" r="3"
            fill="#1a1a2e"
            animate={{ cy: [xConf.pupilY, xConf.pupilY + 1, xConf.pupilY] }}
            transition={{ duration: eConf.pupilSpeed, repeat: Infinity }}
          />
          <circle cx="-1" cy={xConf.pupilY - 1.5} r="1" fill="white" opacity="0.8" />
        </g>

        {/* Eyes — right */}
        <g transform="translate(60, 48)">
          <motion.ellipse
            cx="0" cy="0" rx="6" ry="7"
            fill="white"
            animate={{ scaleY: [xConf.eyeScaleY, xConf.eyeScaleY, 0.1, xConf.eyeScaleY] }}
            transition={{ duration: xConf.blinkRate, repeat: Infinity, times: [0, 0.92, 0.96, 1] }}
          />
          <motion.circle
            cx="0" r="3"
            fill="#1a1a2e"
            animate={{ cy: [xConf.pupilY, xConf.pupilY + 1, xConf.pupilY] }}
            transition={{ duration: eConf.pupilSpeed, repeat: Infinity }}
          />
          <circle cx="-1" cy={xConf.pupilY - 1.5} r="1" fill="white" opacity="0.8" />
        </g>

        {/* Mouth */}
        <motion.path
          d={xConf.mouthPath}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth="2"
          strokeLinecap="round"
          animate={expression === "happy" ? { d: [
            "M 32,68 Q 50,82 68,68",
            "M 32,68 Q 50,85 68,68",
            "M 32,68 Q 50,82 68,68",
          ]} : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {expression === "happy" && (
          <path d="M 32,68 Q 50,82 68,68 Z" fill="#FF6B8A" opacity="0.4" />
        )}

        {/* Cheek blush */}
        {(expression === "happy" || expression === "calm") && (
          <>
            <circle cx="30" cy="56" r="4" fill="#FF9999" opacity="0.25" />
            <circle cx="70" cy="56" r="4" fill="#FF9999" opacity="0.25" />
          </>
        )}

        {/* Outfit overlays */}
        {outfit === "labcoat" && (
          <g opacity="0.9">
            <rect x="35" y="60" width="30" height="18" rx="4" fill="white" opacity="0.3" stroke="white" strokeWidth="0.5" strokeOpacity="0.5" />
            <circle cx="42" cy="66" r="1.5" fill={color.from} />
            <rect x="55" y="63" width="6" height="4" rx="1" fill="white" opacity="0.4" />
          </g>
        )}
        {outfit === "crown" && (
          <motion.g
            animate={{ y: [0, -1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <polygon points="40,32 43,24 46,30 50,20 54,30 57,24 60,32" fill="#FFD700" stroke="#DAA520" strokeWidth="0.5" />
            <circle cx="50" cy="24" r="1.5" fill="#FF4444" />
            <circle cx="43" cy="27" r="1" fill="#4488FF" />
            <circle cx="57" cy="27" r="1" fill="#44FF88" />
          </motion.g>
        )}
        {outfit === "space" && (
          <g>
            <ellipse cx="50" cy="48" rx="20" ry="18" fill="none" stroke="rgba(100,200,255,0.4)" strokeWidth="1" strokeDasharray="3,2" />
            <circle cx="50" cy="30" r="3" fill="rgba(100,200,255,0.2)" stroke="rgba(100,200,255,0.5)" strokeWidth="0.5" />
          </g>
        )}
      </motion.svg>
    </motion.div>
  );
};

export default DynamicCharacter;

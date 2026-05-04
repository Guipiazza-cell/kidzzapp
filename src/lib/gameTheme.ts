// 🎨 Unified neon palette + glow tokens for all Kidzz games.
// Goal: 10/10 consistent visual identity across Memory, Pula, WordSearch,
// Hangman, Reaction, Emotions, Create, DailyChallenge.
//
// Usage:
//   import { neon, glow, gameGradient } from "@/lib/gameTheme";
//   style={{ background: gameGradient.primary, boxShadow: glow.primary }}

export const neon = {
  cyan:    "hsl(190 95% 60%)",   // primary action
  violet:  "hsl(265 90% 65%)",   // primary action 2
  magenta: "hsl(320 90% 65%)",   // accent / wrong
  lime:    "hsl(140 80% 55%)",   // success / correct
  gold:    "hsl(45 95% 60%)",    // reward / star
  sky:     "hsl(215 90% 60%)",   // info
  rose:    "hsl(0 85% 65%)",     // error
} as const;

export const gameGradient = {
  primary:   `linear-gradient(135deg, ${neon.cyan}, ${neon.violet})`,
  success:   `linear-gradient(135deg, ${neon.lime}, hsl(160 75% 40%))`,
  warning:   `linear-gradient(135deg, ${neon.gold}, hsl(28 95% 55%))`,
  error:     `linear-gradient(135deg, ${neon.rose}, ${neon.magenta})`,
  reward:    `linear-gradient(135deg, ${neon.gold}, ${neon.magenta})`,
  arena:     "linear-gradient(180deg, #0c1a3d 0%, #1e3a8a 25%, #5b21b6 55%, #831843 85%, #4a1d3f 100%)",
  card:      "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(240,249,255,0.85))",
  cardDark:  "linear-gradient(135deg, hsl(265 50% 18% / 0.85), hsl(240 50% 12% / 0.85))",
} as const;

export const glow = {
  primary: "0 6px 20px hsl(190 95% 60% / 0.5), 0 0 30px hsl(265 90% 65% / 0.35)",
  success: "0 6px 20px hsl(140 80% 55% / 0.55), inset 0 1px 0 rgba(255,255,255,0.4)",
  error:   "0 6px 20px hsl(0 85% 65% / 0.45)",
  reward:  "0 6px 22px hsl(45 95% 60% / 0.6), 0 0 24px hsl(320 90% 65% / 0.35)",
  soft:    "0 4px 14px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
  arenaShell: "0 20px 60px rgba(76,29,149,0.4), inset 0 0 60px rgba(0,0,0,0.3)",
} as const;

// Responsive cell size: fluid between min and max based on viewport width.
// Use as: style={{ width: cellSize(28, 44), height: cellSize(28, 44) }}
export const cellSize = (min: number, max: number, vw = 9) =>
  `clamp(${min}px, ${vw}vw, ${max}px)`;

// Reusable border-radius scale for game elements (consistent feel)
export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

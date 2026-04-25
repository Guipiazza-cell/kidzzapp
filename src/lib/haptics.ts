/**
 * Haptic feedback utility for mobile.
 * Uses the Vibration API (Android + most mobile browsers). iOS Safari
 * ignores navigator.vibrate, but the same calls are no-ops there — safe
 * to call unconditionally from any component.
 *
 * Usage:
 *   import { haptic } from "@/lib/haptics";
 *   onClick={() => { haptic("light"); doStuff(); }}
 */

export type HapticPattern =
  | "light"      // tap on a primary button
  | "medium"     // selection / confirmation
  | "heavy"      // strong feedback (e.g. unlocking achievement)
  | "success"    // mission complete, level up
  | "warning"    // gentle warning
  | "error";     // wrong answer, blocked action

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [12, 40, 12],
  warning: [20, 60, 20],
  error: [100, 50, 100],
};

let enabled = true;

export function setHapticsEnabled(value: boolean) {
  enabled = value;
}

export function haptic(pattern: HapticPattern = "light") {
  if (!enabled) return;
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    /* noop */
  }
}

/** React hook variant for ergonomic use inside components. */
export function useHaptics() {
  return { haptic, setHapticsEnabled };
}

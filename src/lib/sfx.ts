/**
 * KIDZZ — micro-sound feedback system.
 *
 * Generates light, premium UI sounds via WebAudio (no assets, no bundle bloat).
 * Respects a global mute toggle persisted in localStorage.
 *
 * Usage:
 *   import { sfx, setSfxMuted, isSfxMuted } from "@/lib/sfx";
 *   sfx("click");           // primary tap
 *   sfx("unlock");          // unlocking premium content
 *   sfx("reward");          // mission complete / +xp
 *   sfx("streak");          // streak milestone
 *   sfx("complete");        // long-running task done
 *   sfx("error");           // soft warning
 */

export type SfxName = "click" | "unlock" | "reward" | "streak" | "complete" | "error";

const STORAGE_KEY = "kidzz_sfx_muted";

let ctx: AudioContext | null = null;
let muted: boolean = (() => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
})();

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const Ctor = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

interface ToneOptions {
  freq: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  release?: number;
  freqEnd?: number;
  delay?: number;
}

function playTone(opts: ToneOptions) {
  const ac = ensureCtx();
  if (!ac) return;
  const start = ac.currentTime + (opts.delay ?? 0);
  const end = start + opts.duration;

  const osc = ac.createOscillator();
  const gainNode = ac.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, start);
  if (opts.freqEnd != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.freqEnd), end);
  }
  const peak = opts.gain ?? 0.08;
  const attack = opts.attack ?? 0.005;
  const release = opts.release ?? 0.08;
  gainNode.gain.setValueAtTime(0, start);
  gainNode.gain.linearRampToValueAtTime(peak, start + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, end + release);

  osc.connect(gainNode).connect(ac.destination);
  osc.start(start);
  osc.stop(end + release + 0.02);
}

export function sfx(name: SfxName) {
  if (muted) return;
  switch (name) {
    case "click":
      playTone({ freq: 880, freqEnd: 660, duration: 0.06, type: "triangle", gain: 0.05 });
      break;
    case "unlock":
      playTone({ freq: 523, duration: 0.12, type: "sine", gain: 0.07 });
      playTone({ freq: 784, duration: 0.18, type: "sine", gain: 0.07, delay: 0.08 });
      playTone({ freq: 1046, duration: 0.22, type: "triangle", gain: 0.08, delay: 0.18 });
      break;
    case "reward":
      playTone({ freq: 660, duration: 0.10, type: "triangle", gain: 0.07 });
      playTone({ freq: 880, duration: 0.12, type: "triangle", gain: 0.07, delay: 0.07 });
      playTone({ freq: 1175, duration: 0.18, type: "sine", gain: 0.08, delay: 0.14 });
      break;
    case "streak":
      playTone({ freq: 523, duration: 0.10, type: "sine", gain: 0.07 });
      playTone({ freq: 659, duration: 0.10, type: "sine", gain: 0.07, delay: 0.08 });
      playTone({ freq: 784, duration: 0.10, type: "sine", gain: 0.07, delay: 0.16 });
      playTone({ freq: 1046, duration: 0.22, type: "triangle", gain: 0.09, delay: 0.24 });
      break;
    case "complete":
      playTone({ freq: 587, duration: 0.16, type: "sine", gain: 0.07 });
      playTone({ freq: 880, duration: 0.28, type: "sine", gain: 0.08, delay: 0.12 });
      break;
    case "error":
      playTone({ freq: 320, freqEnd: 220, duration: 0.18, type: "triangle", gain: 0.06 });
      break;
  }
}

export function isSfxMuted(): boolean {
  return muted;
}

export function setSfxMuted(value: boolean) {
  muted = value;
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    }
  } catch {
    /* noop */
  }
}

export function toggleSfxMuted(): boolean {
  setSfxMuted(!muted);
  return muted;
}

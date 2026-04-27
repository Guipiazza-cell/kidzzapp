/* ── KIDZZ Music Engine — Web Audio sintetizado ──
   Notas, drums, melodias procedurais, karaokê com sílabas timed.
*/

type OscType = OscillatorType;

const NOTE_FREQ: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
};

export interface SongStep {
  note: string;
  dur: number;     // seconds
  syllable?: string; // for karaoke
}

export interface Song {
  id: string;
  title: string;
  emoji: string;
  bpm: number;
  steps: SongStep[];
}

export class MusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeLoops = new Map<string, () => void>();
  private playbackTimers: number[] = [];
  private onStepCallback?: (index: number, step: SongStep) => void;
  private onEndCallback?: () => void;
  private playingFlag = false;

  private ensureCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn("MusicEngine: AudioContext indisponível", e);
        throw e;
      }
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);
    }
    // iOS Safari precisa de resume() dentro do gesto. Chamamos sem await — o navegador
    // libera no próximo tick se vier de evento de toque.
    if (this.ctx.state === "suspended") {
      try { this.ctx.resume().catch(() => {}); } catch { /* noop */ }
    }
    return this.ctx;
  }

  /** Garante contexto pronto. Deve ser chamado dentro de um onClick para destravar mobile. */
  async unlock(): Promise<boolean> {
    try {
      const ctx = this.ensureCtx();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      return ctx.state === "running";
    } catch {
      return false;
    }
  }

  setVolume(v: number) {
    if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, v));
  }

  /* Single warm note with envelope */
  playNote(note: string, duration = 0.6, type: OscType = "triangle", gainAmt = 0.28) {
    const ctx = this.ensureCtx();
    const freq = NOTE_FREQ[note] ?? 440;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gainAmt, now + 0.025);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2600;

    osc.connect(lp);
    lp.connect(g);
    g.connect(this.masterGain!);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  /* Soft kick drum */
  playDrum(intensity = 1) {
    const ctx = this.ensureCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140 * intensity, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.55, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc.connect(g);
    g.connect(this.masterGain!);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  /* Sparkle (pluck arpeggio) */
  playSparkle() {
    const notes = ["C5", "E5", "G5", "C6"];
    notes.forEach((n, i) => {
      setTimeout(() => this.playNote(n.replace("C6", "B5"), 0.35, "sine", 0.18), i * 70);
    });
  }

  /* Play a Song with optional sync callbacks (for karaoke) */
  playSong(song: Song, onStep?: (index: number, step: SongStep) => void, onEnd?: () => void) {
    this.stopSong();
    this.onStepCallback = onStep;
    this.onEndCallback = onEnd;
    let cumMs = 0;
    song.steps.forEach((step, i) => {
      const t = window.setTimeout(() => {
        this.playNote(step.note, step.dur * 0.95, "triangle", 0.3);
        // Light percussion every 2nd step to create groove
        if (i % 2 === 0) this.playDrum(0.6);
        this.onStepCallback?.(i, step);
      }, cumMs);
      this.playbackTimers.push(t);
      cumMs += step.dur * 1000;
    });
    const endT = window.setTimeout(() => {
      this.onEndCallback?.();
      this.playbackTimers = [];
    }, cumMs + 200);
    this.playbackTimers.push(endT);
  }

  stopSong() {
    this.playbackTimers.forEach((t) => clearTimeout(t));
    this.playbackTimers = [];
  }

  isPlaying() {
    return this.playbackTimers.length > 0;
  }

  startLoop(id: string, pattern: () => void, intervalMs: number) {
    this.stopLoop(id);
    pattern();
    const handle = window.setInterval(pattern, intervalMs);
    this.activeLoops.set(id, () => clearInterval(handle));
  }

  stopLoop(id: string) {
    const stop = this.activeLoops.get(id);
    if (stop) { stop(); this.activeLoops.delete(id); }
  }

  dispose() {
    this.stopSong();
    this.activeLoops.forEach((s) => s());
    this.activeLoops.clear();
    if (this.ctx && this.ctx.state !== "closed") this.ctx.close();
    this.ctx = null;
  }
}

/* ── 7 músicas rotativas para "Bom Dia com Pixel" ──
   Sílabas curtas em português, melodia simples e cantarolável. */
export const MORNING_SONGS: Song[] = [
  {
    id: "raio-de-sol",
    title: "Raio de Sol",
    emoji: "☀️",
    bpm: 110,
    steps: [
      { note: "C5", dur: 0.45, syllable: "Bom" },
      { note: "E5", dur: 0.45, syllable: "dia" },
      { note: "G5", dur: 0.6, syllable: "sol!" },
      { note: "E5", dur: 0.45, syllable: "Vem" },
      { note: "G5", dur: 0.45, syllable: "bri" },
      { note: "A5", dur: 0.6, syllable: "lhar" },
      { note: "G5", dur: 0.45, syllable: "no" },
      { note: "E5", dur: 0.45, syllable: "meu" },
      { note: "C5", dur: 0.8, syllable: "dia ✨" },
    ],
  },
  {
    id: "passarinho",
    title: "Canção do Passarinho",
    emoji: "🐦",
    bpm: 120,
    steps: [
      { note: "G4", dur: 0.4, syllable: "Pi" },
      { note: "B4", dur: 0.4, syllable: "u" },
      { note: "D5", dur: 0.5, syllable: "pi" },
      { note: "G5", dur: 0.5, syllable: "u!" },
      { note: "D5", dur: 0.4, syllable: "Voa" },
      { note: "B4", dur: 0.4, syllable: "vai" },
      { note: "G4", dur: 0.7, syllable: "lá!" },
    ],
  },
  {
    id: "folha-dança",
    title: "A Folha que Dança",
    emoji: "🍃",
    bpm: 100,
    steps: [
      { note: "E4", dur: 0.5, syllable: "Folha" },
      { note: "G4", dur: 0.5, syllable: "vai" },
      { note: "A4", dur: 0.5, syllable: "vem" },
      { note: "G4", dur: 0.5, syllable: "no" },
      { note: "E4", dur: 0.5, syllable: "ven" },
      { note: "D4", dur: 0.5, syllable: "to" },
      { note: "C4", dur: 0.8, syllable: "leve 🌬️" },
    ],
  },
  {
    id: "pingo-chuva",
    title: "Pingo de Chuva",
    emoji: "💧",
    bpm: 130,
    steps: [
      { note: "C5", dur: 0.3, syllable: "Pin" },
      { note: "E5", dur: 0.3, syllable: "go" },
      { note: "G5", dur: 0.3, syllable: "pin" },
      { note: "E5", dur: 0.3, syllable: "go" },
      { note: "C5", dur: 0.4, syllable: "tic" },
      { note: "G5", dur: 0.4, syllable: "tac" },
      { note: "C5", dur: 0.7, syllable: "água! 💦" },
    ],
  },
  {
    id: "abraco-bom-dia",
    title: "Abraço de Bom Dia",
    emoji: "🤗",
    bpm: 95,
    steps: [
      { note: "F4", dur: 0.5, syllable: "Um" },
      { note: "A4", dur: 0.5, syllable: "a" },
      { note: "C5", dur: 0.6, syllable: "bra" },
      { note: "A4", dur: 0.5, syllable: "ço" },
      { note: "F4", dur: 0.5, syllable: "pra" },
      { note: "G4", dur: 0.5, syllable: "vo" },
      { note: "A4", dur: 0.9, syllable: "cê 💛" },
    ],
  },
  {
    id: "marcha-floresta",
    title: "Marcha da Floresta",
    emoji: "🌳",
    bpm: 115,
    steps: [
      { note: "D4", dur: 0.4, syllable: "Tum" },
      { note: "D4", dur: 0.4, syllable: "tum" },
      { note: "G4", dur: 0.5, syllable: "va" },
      { note: "G4", dur: 0.5, syllable: "mos" },
      { note: "A4", dur: 0.4, syllable: "an" },
      { note: "B4", dur: 0.4, syllable: "dar" },
      { note: "G4", dur: 0.8, syllable: "juntos! 🥁" },
    ],
  },
  {
    id: "lua-cheia",
    title: "A Lua Acordou Cedo",
    emoji: "🌝",
    bpm: 90,
    steps: [
      { note: "E5", dur: 0.6, syllable: "Lua" },
      { note: "D5", dur: 0.5, syllable: "luar" },
      { note: "C5", dur: 0.5, syllable: "vem" },
      { note: "B4", dur: 0.5, syllable: "ver" },
      { note: "C5", dur: 0.6, syllable: "o" },
      { note: "D5", dur: 0.6, syllable: "sol" },
      { note: "E5", dur: 0.9, syllable: "nascer ✨" },
    ],
  },
];

/* Pick today's song deterministically (rotates daily) */
export function getTodaysSong(): Song {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return MORNING_SONGS[day % MORNING_SONGS.length];
}

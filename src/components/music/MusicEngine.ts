/* ── KIDZZ Music Engine - Web Audio sintetizado ──
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
    // iOS Safari precisa de resume() dentro do gesto. Chamamos sem await - o navegador
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
    try {
      const ctx = this.ensureCtx();
      if (!this.masterGain) return;
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
      g.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (e) {
      console.warn("MusicEngine.playNote falhou", e);
    }
  }

  /* Soft kick drum */
  playDrum(intensity = 1) {
    try {
      const ctx = this.ensureCtx();
      if (!this.masterGain) return;
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
      g.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn("MusicEngine.playDrum falhou", e);
    }
  }

  /* Sparkle (pluck arpeggio) */
  playSparkle() {
    const notes = ["C5", "E5", "G5", "C6"];
    notes.forEach((n, i) => {
      setTimeout(() => this.playNote(n.replace("C6", "B5"), 0.35, "sine", 0.18), i * 70);
    });
  }

  /* Play a Song with optional sync callbacks (for karaoke).
     Aguarda unlock() para garantir que iOS Safari libere o AudioContext. */
  async playSong(song: Song, onStep?: (index: number, step: SongStep) => void, onEnd?: () => void) {
    this.stopSong();
    const ok = await this.unlock();
    if (!ok) {
      console.warn("MusicEngine: AudioContext não pôde ser destravado");
      onEnd?.();
      return;
    }
    this.onStepCallback = onStep;
    this.onEndCallback = onEnd;
    this.playingFlag = true;
    let cumMs = 0;
    song.steps.forEach((step, i) => {
      const t = window.setTimeout(() => {
        this.playNote(step.note, step.dur * 0.95, "triangle", 0.28);
        // Marcação suave a cada 4 notas (menos cartoon, mais cantável)
        if (i % 4 === 0) this.playDrum(0.4);
        this.onStepCallback?.(i, step);
      }, cumMs);
      this.playbackTimers.push(t);
      cumMs += step.dur * 1000;
    });
    const endT = window.setTimeout(() => {
      this.playingFlag = false;
      this.playbackTimers = [];
      this.onEndCallback?.();
    }, cumMs + 200);
    this.playbackTimers.push(endT);
  }

  stopSong() {
    this.playbackTimers.forEach((t) => clearTimeout(t));
    this.playbackTimers = [];
    this.playingFlag = false;
  }

  isPlaying() {
    return this.playingFlag;
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

/* ── Músicas matutinas (rotação diária) ──
   Letras em palavras completas, tom calmo de família, ~25–40s cada. */
export const MORNING_SONGS: Song[] = [
  {
    id: "raio-de-sol",
    title: "Raio de Sol",
    emoji: "☀️",
    bpm: 92,
    steps: [
      // O sol abriu a manhã e me chamou pra sorrir
      { note: "C4", dur: 0.42, syllable: "O" },
      { note: "E4", dur: 0.48, syllable: "sol" },
      { note: "G4", dur: 0.55, syllable: "abriu" },
      { note: "A4", dur: 0.4, syllable: "a" },
      { note: "G4", dur: 0.75, syllable: "manhã" },
      { note: "E4", dur: 0.4, syllable: "e" },
      { note: "G4", dur: 0.42, syllable: "me" },
      { note: "A4", dur: 0.55, syllable: "chamou" },
      { note: "G4", dur: 0.38, syllable: "pra" },
      { note: "E4", dur: 0.8, syllable: "sorrir" },
      // Vem, vamos de mãos dadas — o dia é nosso pra viver
      { note: "C4", dur: 0.42, syllable: "Vem," },
      { note: "D4", dur: 0.45, syllable: "vamos" },
      { note: "E4", dur: 0.4, syllable: "de" },
      { note: "G4", dur: 0.5, syllable: "mãos" },
      { note: "A4", dur: 0.7, syllable: "dadas" },
      { note: "G4", dur: 0.4, syllable: "o" },
      { note: "E4", dur: 0.48, syllable: "dia" },
      { note: "D4", dur: 0.42, syllable: "é" },
      { note: "C4", dur: 0.55, syllable: "nosso" },
      { note: "E4", dur: 0.4, syllable: "pra" },
      { note: "G4", dur: 0.85, syllable: "viver" },
      // Refrão: Bom dia, bom dia — pra quem eu amo de verdade
      { note: "G4", dur: 0.45, syllable: "Bom" },
      { note: "A4", dur: 0.55, syllable: "dia," },
      { note: "G4", dur: 0.45, syllable: "bom" },
      { note: "E4", dur: 0.7, syllable: "dia" },
      { note: "C4", dur: 0.4, syllable: "pra" },
      { note: "D4", dur: 0.45, syllable: "quem" },
      { note: "E4", dur: 0.42, syllable: "eu" },
      { note: "G4", dur: 0.55, syllable: "amo" },
      { note: "A4", dur: 0.4, syllable: "de" },
      { note: "G4", dur: 0.9, syllable: "verdade" },
      // Bom dia, bom dia — o sol brilha na cidade
      { note: "G4", dur: 0.45, syllable: "Bom" },
      { note: "A4", dur: 0.55, syllable: "dia," },
      { note: "G4", dur: 0.45, syllable: "bom" },
      { note: "E4", dur: 0.7, syllable: "dia" },
      { note: "C4", dur: 0.4, syllable: "o" },
      { note: "E4", dur: 0.48, syllable: "sol" },
      { note: "G4", dur: 0.55, syllable: "brilha" },
      { note: "A4", dur: 0.42, syllable: "na" },
      { note: "G4", dur: 1.0, syllable: "cidade" },
    ],
  },
  {
    id: "passarinho",
    title: "Canção do Passarinho",
    emoji: "🐦",
    bpm: 100,
    steps: [
      { note: "G4", dur: 0.45, syllable: "Lá" },
      { note: "B4", dur: 0.45, syllable: "fora" },
      { note: "D5", dur: 0.5, syllable: "um" },
      { note: "B4", dur: 0.55, syllable: "pássaro" },
      { note: "G4", dur: 0.7, syllable: "canta" },
      { note: "A4", dur: 0.42, syllable: "pra" },
      { note: "G4", dur: 0.45, syllable: "gente" },
      { note: "E4", dur: 0.42, syllable: "acordar" },
      { note: "D4", dur: 0.85, syllable: "devagar" },
      { note: "G4", dur: 0.45, syllable: "Ele" },
      { note: "B4", dur: 0.5, syllable: "sabe" },
      { note: "D5", dur: 0.45, syllable: "um" },
      { note: "E5", dur: 0.55, syllable: "segredo" },
      { note: "D5", dur: 0.4, syllable: "que" },
      { note: "B4", dur: 0.5, syllable: "só" },
      { note: "G4", dur: 0.45, syllable: "a" },
      { note: "A4", dur: 0.55, syllable: "manhã" },
      { note: "G4", dur: 0.9, syllable: "entende" },
      { note: "E4", dur: 0.45, syllable: "Se" },
      { note: "G4", dur: 0.5, syllable: "ouvir" },
      { note: "A4", dur: 0.45, syllable: "com" },
      { note: "B4", dur: 0.55, syllable: "carinho" },
      { note: "A4", dur: 0.42, syllable: "o" },
      { note: "G4", dur: 0.7, syllable: "canto" },
      { note: "E4", dur: 0.45, syllable: "fica" },
      { note: "D4", dur: 0.5, syllable: "mais" },
      { note: "C4", dur: 1.0, syllable: "leve" },
    ],
  },
  {
    id: "folha-dança",
    title: "A Folha que Dança",
    emoji: "🍃",
    bpm: 96,
    steps: [
      { note: "E4", dur: 0.5, syllable: "Uma" },
      { note: "G4", dur: 0.5, syllable: "folha" },
      { note: "A4", dur: 0.45, syllable: "desce" },
      { note: "G4", dur: 0.45, syllable: "no" },
      { note: "E4", dur: 0.75, syllable: "vento" },
      { note: "D4", dur: 0.45, syllable: "sem" },
      { note: "E4", dur: 0.5, syllable: "pressa" },
      { note: "G4", dur: 0.55, syllable: "nenhuma" },
      { note: "A4", dur: 0.9, syllable: "pra chegar" },
      { note: "G4", dur: 0.45, syllable: "Ela" },
      { note: "E4", dur: 0.5, syllable: "roda" },
      { note: "D4", dur: 0.45, syllable: "no" },
      { note: "C4", dur: 0.7, syllable: "ar" },
      { note: "E4", dur: 0.45, syllable: "como" },
      { note: "G4", dur: 0.5, syllable: "quem" },
      { note: "A4", dur: 0.55, syllable: "aprende" },
      { note: "G4", dur: 0.4, syllable: "a" },
      { note: "E4", dur: 0.95, syllable: "dançar" },
      { note: "C4", dur: 0.45, syllable: "Se" },
      { note: "D4", dur: 0.45, syllable: "a" },
      { note: "E4", dur: 0.5, syllable: "vida" },
      { note: "G4", dur: 0.55, syllable: "fosse" },
      { note: "A4", dur: 0.7, syllable: "assim" },
      { note: "G4", dur: 0.42, syllable: "a" },
      { note: "E4", dur: 0.5, syllable: "gente" },
      { note: "D4", dur: 0.45, syllable: "também" },
      { note: "C4", dur: 1.0, syllable: "ia" },
    ],
  },
  {
    id: "pingo-chuva",
    title: "Pingo de Chuva",
    emoji: "💧",
    bpm: 88,
    steps: [
      { note: "C4", dur: 0.5, syllable: "A" },
      { note: "E4", dur: 0.55, syllable: "chuva" },
      { note: "G4", dur: 0.5, syllable: "bate" },
      { note: "A4", dur: 0.45, syllable: "devagar" },
      { note: "G4", dur: 0.7, syllable: "no" },
      { note: "E4", dur: 0.75, syllable: "telhado" },
      { note: "D4", dur: 0.45, syllable: "e" },
      { note: "C4", dur: 0.5, syllable: "conta" },
      { note: "E4", dur: 0.55, syllable: "histórias" },
      { note: "G4", dur: 0.9, syllable: "baixinho" },
      { note: "A4", dur: 0.45, syllable: "Cada" },
      { note: "G4", dur: 0.5, syllable: "pingo" },
      { note: "E4", dur: 0.45, syllable: "é" },
      { note: "D4", dur: 0.55, syllable: "um" },
      { note: "C4", dur: 0.75, syllable: "segredo" },
      { note: "E4", dur: 0.45, syllable: "que" },
      { note: "G4", dur: 0.5, syllable: "a" },
      { note: "A4", dur: 0.55, syllable: "terra" },
      { note: "G4", dur: 0.9, syllable: "guarda" },
      { note: "E4", dur: 0.45, syllable: "Fecha" },
      { note: "G4", dur: 0.5, syllable: "os" },
      { note: "A4", dur: 0.55, syllable: "olhos" },
      { note: "G4", dur: 0.45, syllable: "e" },
      { note: "E4", dur: 0.7, syllable: "escuta" },
      { note: "D4", dur: 0.45, syllable: "o" },
      { note: "C4", dur: 1.0, syllable: "mundo" },
    ],
  },
  {
    id: "abraco-bom-dia",
    title: "Abraço de Bom Dia",
    emoji: "🤗",
    bpm: 90,
    steps: [
      { note: "F4", dur: 0.48, syllable: "Antes" },
      { note: "A4", dur: 0.45, syllable: "de" },
      { note: "C5", dur: 0.55, syllable: "tudo" },
      { note: "A4", dur: 0.45, syllable: "começar" },
      { note: "G4", dur: 0.7, syllable: "de" },
      { note: "F4", dur: 0.8, syllable: "verdade" },
      { note: "A4", dur: 0.45, syllable: "eu" },
      { note: "C5", dur: 0.5, syllable: "quero" },
      { note: "D5", dur: 0.55, syllable: "um" },
      { note: "C5", dur: 0.9, syllable: "abraço" },
      { note: "A4", dur: 0.45, syllable: "Aquele" },
      { note: "G4", dur: 0.5, syllable: "que" },
      { note: "F4", dur: 0.55, syllable: "segura" },
      { note: "G4", dur: 0.45, syllable: "o" },
      { note: "A4", dur: 0.75, syllable: "coração" },
      { note: "C5", dur: 0.45, syllable: "e" },
      { note: "A4", dur: 0.5, syllable: "diz" },
      { note: "G4", dur: 0.45, syllable: "que" },
      { note: "F4", dur: 0.9, syllable: "está bem" },
      { note: "F4", dur: 0.45, syllable: "Bom" },
      { note: "A4", dur: 0.55, syllable: "dia" },
      { note: "C5", dur: 0.5, syllable: "pra" },
      { note: "A4", dur: 0.7, syllable: "você" },
      { note: "G4", dur: 0.45, syllable: "que" },
      { note: "F4", dur: 0.5, syllable: "me" },
      { note: "G4", dur: 0.55, syllable: "faz" },
      { note: "A4", dur: 1.0, syllable: "feliz" },
    ],
  },
  {
    id: "marcha-floresta",
    title: "Caminho na Floresta",
    emoji: "🌳",
    bpm: 98,
    steps: [
      { note: "D4", dur: 0.45, syllable: "A" },
      { note: "F4", dur: 0.5, syllable: "gente" },
      { note: "G4", dur: 0.55, syllable: "anda" },
      { note: "A4", dur: 0.45, syllable: "devagar" },
      { note: "G4", dur: 0.7, syllable: "pela" },
      { note: "F4", dur: 0.8, syllable: "trilha" },
      { note: "D4", dur: 0.45, syllable: "olhando" },
      { note: "F4", dur: 0.5, syllable: "as" },
      { note: "G4", dur: 0.55, syllable: "folhas" },
      { note: "A4", dur: 0.9, syllable: "verdes" },
      { note: "G4", dur: 0.45, syllable: "Não" },
      { note: "A4", dur: 0.5, syllable: "precisa" },
      { note: "C5", dur: 0.55, syllable: "correr" },
      { note: "A4", dur: 0.45, syllable: "nem" },
      { note: "G4", dur: 0.7, syllable: "ganhar" },
      { note: "F4", dur: 0.45, syllable: "só" },
      { note: "D4", dur: 0.5, syllable: "estar" },
      { note: "F4", dur: 0.55, syllable: "junto" },
      { note: "G4", dur: 0.9, syllable: "já basta" },
      { note: "A4", dur: 0.45, syllable: "Passo" },
      { note: "G4", dur: 0.5, syllable: "a" },
      { note: "F4", dur: 0.55, syllable: "passo" },
      { note: "D4", dur: 0.7, syllable: "a" },
      { note: "F4", dur: 0.5, syllable: "floresta" },
      { note: "G4", dur: 0.55, syllable: "ensina" },
      { note: "A4", dur: 1.0, syllable: "a viver" },
    ],
  },
  {
    id: "lua-cheia",
    title: "Quando o Sol Acorda",
    emoji: "🌅",
    bpm: 88,
    steps: [
      { note: "E4", dur: 0.5, syllable: "A" },
      { note: "G4", dur: 0.55, syllable: "noite" },
      { note: "A4", dur: 0.5, syllable: "foi" },
      { note: "G4", dur: 0.7, syllable: "embora" },
      { note: "E4", dur: 0.45, syllable: "e" },
      { note: "D4", dur: 0.5, syllable: "deixou" },
      { note: "C4", dur: 0.55, syllable: "um" },
      { note: "E4", dur: 0.9, syllable: "caminho" },
      { note: "G4", dur: 0.45, syllable: "O" },
      { note: "A4", dur: 0.55, syllable: "sol" },
      { note: "C5", dur: 0.5, syllable: "subiu" },
      { note: "A4", dur: 0.45, syllable: "sem" },
      { note: "G4", dur: 0.7, syllable: "pressa" },
      { note: "E4", dur: 0.45, syllable: "pra" },
      { note: "G4", dur: 0.5, syllable: "nos" },
      { note: "A4", dur: 0.55, syllable: "encontrar" },
      { note: "G4", dur: 0.9, syllable: "aqui" },
      { note: "E4", dur: 0.45, syllable: "Bom" },
      { note: "G4", dur: 0.55, syllable: "dia" },
      { note: "A4", dur: 0.5, syllable: "pra" },
      { note: "G4", dur: 0.7, syllable: "você" },
      { note: "E4", dur: 0.45, syllable: "que" },
      { note: "D4", dur: 0.5, syllable: "acabou" },
      { note: "C4", dur: 0.55, syllable: "de" },
      { note: "E4", dur: 1.0, syllable: "acordar" },
    ],
  },
];

/* Pick today's song deterministically (rotates daily) */
export function getTodaysSong(): Song {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return MORNING_SONGS[day % MORNING_SONGS.length];
}

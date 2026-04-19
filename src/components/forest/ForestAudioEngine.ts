/* ── Forest Audio Engine — Web Audio API sintetizado ──
   Sem arquivos, sem rede. Notas, tambores, melodias e gravação local.
*/

type OscType = OscillatorType;

const NOTE_FREQ: Record<string, number> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0,
};

export class ForestAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeLoops: Map<string, () => void> = new Map();
  private mediaRecorder: MediaRecorder | null = null;
  private recordingChunks: Blob[] = [];
  private currentStream: MediaStream | null = null;

  private ensureCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.55;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  /* ── Single tone (note pluck) ── */
  playNote(noteName: keyof typeof NOTE_FREQ | string, duration = 0.9, type: OscType = "sine") {
    const ctx = this.ensureCtx();
    const freq = NOTE_FREQ[noteName] ?? 440;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Soft lowpass for warmth
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2400;

    osc.connect(lp);
    lp.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  /* ── Drum hit (kick-ish) ── */
  playDrum(intensity = 1) {
    const ctx = this.ensureCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140 * intensity, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.6, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(now);
    osc.stop(now + 0.4);

    // Noise click for snap
    const bufferSize = ctx.sampleRate * 0.05;
    const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    const ng = ctx.createGain();
    ng.gain.value = 0.18;
    noise.connect(ng);
    ng.connect(this.masterGain!);
    noise.start(now);
  }

  /* ── Melody (sequence of notes) ── */
  playMelody(notes: { note: string; dur: number }[], type: OscType = "triangle") {
    const ctx = this.ensureCtx();
    let t = ctx.currentTime;
    notes.forEach(({ note, dur }) => {
      const freq = NOTE_FREQ[note] ?? 440;
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.28, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + dur + 0.05);
      t += dur * 0.92;
    });
  }

  /* ── Looping ambient pad ── */
  startLoop(id: string, pattern: () => void, intervalMs: number) {
    this.stopLoop(id);
    pattern();
    const handle = setInterval(pattern, intervalMs);
    this.activeLoops.set(id, () => clearInterval(handle));
  }

  stopLoop(id: string) {
    const stop = this.activeLoops.get(id);
    if (stop) {
      stop();
      this.activeLoops.delete(id);
    }
  }

  isLoopPlaying(id: string) {
    return this.activeLoops.has(id);
  }

  stopAll() {
    this.activeLoops.forEach((stop) => stop());
    this.activeLoops.clear();
  }

  setMasterVolume(v: number) {
    if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, v));
  }

  /* ── Recording (Cantar Juntos) ── */
  async startRecording(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.currentStream = stream;
      this.recordingChunks = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => { if (e.data.size > 0) this.recordingChunks.push(e.data); };
      mr.start();
      this.mediaRecorder = mr;
      return true;
    } catch (e) {
      console.error("[ForestAudioEngine] mic denied", e);
      return false;
    }
  }

  async stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) return resolve(null);
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordingChunks, { type: "audio/webm" });
        this.currentStream?.getTracks().forEach((t) => t.stop());
        this.currentStream = null;
        this.mediaRecorder = null;
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }

  isRecording() {
    return this.mediaRecorder?.state === "recording";
  }

  dispose() {
    this.stopAll();
    this.currentStream?.getTracks().forEach((t) => t.stop());
    if (this.ctx && this.ctx.state !== "closed") this.ctx.close();
    this.ctx = null;
  }
}

/* ── Preset patterns ── */
export const FOREST_PRESETS = {
  sunNote: () => ({ note: "G5", type: "sine" as OscType, dur: 1.2 }),
  forestDrumPattern: [1, 0, 0.6, 0, 1, 0, 0.4, 0],
  goldenMelody: [
    { note: "C5", dur: 0.4 }, { note: "E5", dur: 0.4 }, { note: "G5", dur: 0.4 },
    { note: "E5", dur: 0.4 }, { note: "C5", dur: 0.6 }, { note: "G4", dur: 0.8 },
  ],
  moonSong: [
    { note: "A4", dur: 0.6 }, { note: "C5", dur: 0.6 }, { note: "E5", dur: 0.8 },
    { note: "C5", dur: 0.4 }, { note: "B4", dur: 0.4 }, { note: "A4", dur: 1.0 },
  ],
};

class AudioManager {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;
  private ambientInterval: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') { this.ctx.resume(); }
    return this.ctx;
  }

  playTap() {
    try {
      const ctx = this.initCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.08);
    } catch { /* Ignore audio failure if restricted */ }
  }

  playClueChime(step: number = 1) {
    try {
      const ctx = this.initCtx();
      const notes = [
        [523.25, 659.25, 783.99], [587.33, 739.99, 880.00], [659.25, 830.61, 987.77],
        [783.99, 987.77, 1174.66], [1046.50, 1318.51, 1567.98]
      ];
      const triad = notes[Math.min(step, notes.length - 1)];
      triad.forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + i * 0.06 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.8);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.06); osc.stop(ctx.currentTime + i * 0.06 + 0.85);
      });
    } catch { /* Audio error fallback */ }
  }

  playHeartbeat() {
    try {
      const ctx = this.initCtx(); const t = ctx.currentTime;
      const osc1 = ctx.createOscillator(); const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(95, t);
      osc1.frequency.exponentialRampToValueAtTime(45, t + 0.12);
      gain1.gain.setValueAtTime(0.2, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc1.connect(gain1); gain1.connect(ctx.destination);
      osc1.start(t); osc1.stop(t + 0.13);
      const osc2 = ctx.createOscillator(); const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(115, t + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(50, t + 0.28);
      gain2.gain.setValueAtTime(0.15, t + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.start(t + 0.15); osc2.stop(t + 0.29);
    } catch { /* Audio error fallback */ }
  }

  playVictory() {
    try {
      const ctx = this.initCtx();
      const melody = [
        { freq: 523.25, time: 0, dur: 0.18 }, { freq: 659.25, time: 0.16, dur: 0.18 },
        { freq: 783.99, time: 0.32, dur: 0.22 }, { freq: 1046.50, time: 0.52, dur: 0.45 },
        { freq: 880.00, time: 0.75, dur: 0.2 }, { freq: 1046.50, time: 0.95, dur: 0.8 }
      ];
      melody.forEach((n) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.time);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + n.time);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + n.time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.time + n.dur);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + n.time); osc.stop(ctx.currentTime + n.time + n.dur);
      });
    } catch { /* Audio error fallback */ }
  }

  playSketch() {
    try {
      const ctx = this.initCtx();
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) { output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4)); }
      const whiteNoise = ctx.createBufferSource(); whiteNoise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      whiteNoise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      whiteNoise.start();
    } catch { /* Audio error fallback */ }
  }

  startAmbient() {
    if (this.isAmbientPlaying) return;
    try {
      const ctx = this.initCtx();
      this.isAmbientPlaying = true;
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.08, ctx.currentTime);
      this.ambientGain.connect(ctx.destination);
      const playRandomBird = () => {
        if (!this.isAmbientPlaying || !this.ctx) return;
        const now = this.ctx.currentTime;
        const baseFreq = 2200 + Math.random() * 1200;
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.18);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        if (this.ambientGain) gain.connect(this.ambientGain);
        osc.start(now); osc.stop(now + 0.25);
      };
      this.ambientInterval = window.setInterval(() => { if (Math.random() > 0.4) { playRandomBird(); } }, 4500);
    } catch { /* Fallback */ }
  }

  stopAmbient() {
    this.isAmbientPlaying = false;
    if (this.ambientInterval) { clearInterval(this.ambientInterval); this.ambientInterval = null; }
    if (this.ambientGain && this.ctx) {
      try { this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5); } catch { /* Fallback */ }
    }
  }
}

export const soundFx = new AudioManager();

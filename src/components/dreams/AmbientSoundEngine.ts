/* ── Ambient Sound Engine using Web Audio API ── */

export class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private nodes: Map<string, { source: AudioBufferSourceNode; gain: GainNode; filter?: BiquadFilterNode }> = new Map();
  private masterGain: GainNode | null = null;
  private resumePromise: Promise<void> | null = null;

  async ensureContext(): Promise<AudioContext> {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.resumePromise = this.ctx.resume();
      await this.resumePromise;
    }
    return this.ctx;
  }

  private createNoise(ctx: AudioContext, type: "white" | "brown"): AudioBufferSourceNode {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === "white") {
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    } else {
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * w) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  async start(soundId: string, volume: number = 0.5): Promise<boolean> {
    if (this.nodes.has(soundId)) return true;

    try {
      const ctx = await this.ensureContext();
      const gain = ctx.createGain();
      gain.connect(this.masterGain!);

      let source: AudioBufferSourceNode;
      let filter: BiquadFilterNode | undefined;

      switch (soundId) {
        case "rain":
          source = this.createNoise(ctx, "white");
          filter = ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.value = 3000;
          filter.Q.value = 0.5;
          source.connect(filter);
          filter.connect(gain);
          gain.gain.value = volume * 0.3;
          break;
        case "ocean":
          source = this.createNoise(ctx, "brown");
          filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.value = 500;
          source.connect(filter);
          filter.connect(gain);
          gain.gain.value = volume * 0.3;
          break;
        case "forest":
          source = this.createNoise(ctx, "white");
          filter = ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.value = 1500;
          filter.Q.value = 2;
          source.connect(filter);
          filter.connect(gain);
          gain.gain.value = volume * 0.15;
          break;
        case "wind":
          source = this.createNoise(ctx, "brown");
          filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.value = 300;
          source.connect(filter);
          filter.connect(gain);
          gain.gain.value = volume * 0.3;
          break;
        case "white":
          source = this.createNoise(ctx, "white");
          source.connect(gain);
          gain.gain.value = volume * 0.15;
          break;
        case "brown":
          source = this.createNoise(ctx, "brown");
          source.connect(gain);
          gain.gain.value = volume * 0.2;
          break;
        default:
          source = this.createNoise(ctx, "white");
          source.connect(gain);
          gain.gain.value = volume * 0.3;
      }

      source.start();
      this.nodes.set(soundId, { source, gain, filter });
      return true;
    } catch (e) {
      console.error("AmbientSoundEngine: failed to start", soundId, e);
      return false;
    }
  }

  stop(soundId: string) {
    const node = this.nodes.get(soundId);
    if (node) {
      try { node.source.stop(); } catch {}
      node.gain.disconnect();
      node.filter?.disconnect();
      this.nodes.delete(soundId);
    }
  }

  setVolume(soundId: string, volume: number) {
    const node = this.nodes.get(soundId);
    if (!node) return;
    // Recalculate based on sound type
    const multiplier = soundId === "forest" ? 0.15 : soundId === "white" ? 0.15 : soundId === "brown" ? 0.2 : 0.3;
    node.gain.gain.value = volume * multiplier;
  }

  fadeOut(durationMs: number = 5000) {
    if (!this.masterGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + durationMs / 1000);
  }

  stopAll() {
    this.nodes.forEach((node) => {
      try { node.source.stop(); } catch {}
      node.gain.disconnect();
      node.filter?.disconnect();
    });
    this.nodes.clear();
    if (this.masterGain) {
      this.masterGain.gain.value = 1;
    }
  }

  isPlaying(soundId: string) {
    return this.nodes.has(soundId);
  }
}

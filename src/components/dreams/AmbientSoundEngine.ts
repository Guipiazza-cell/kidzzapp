/* ── Ambient Sound Engine using HTML5 Audio with real MP3s ── */

export interface SoundSource {
  id: string;
  url: string;
}

export class AmbientSoundEngine {
  private players: Map<string, { audio: HTMLAudioElement; volume: number }> = new Map();
  private fadeInterval: ReturnType<typeof setInterval> | null = null;

  async start(id: string, url: string, volume: number = 0.5): Promise<boolean> {
    if (this.players.has(id)) return true;

    try {
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = volume;
      audio.preload = "auto";

      await new Promise<void>((resolve, reject) => {
        const onCanPlay = () => { cleanup(); resolve(); };
        const onError = () => { cleanup(); reject(new Error("Failed to load audio")); };
        const cleanup = () => {
          audio.removeEventListener("canplaythrough", onCanPlay);
          audio.removeEventListener("error", onError);
        };
        audio.addEventListener("canplaythrough", onCanPlay, { once: true });
        audio.addEventListener("error", onError, { once: true });
        audio.load();
        // Timeout fallback
        setTimeout(() => { cleanup(); resolve(); }, 5000);
      });

      await audio.play();
      this.players.set(id, { audio, volume });
      return true;
    } catch (e) {
      console.error("AmbientSoundEngine: failed to start", id, e);
      return false;
    }
  }

  stop(id: string) {
    const player = this.players.get(id);
    if (player) {
      player.audio.pause();
      player.audio.src = "";
      this.players.delete(id);
    }
  }

  setVolume(id: string, volume: number) {
    const player = this.players.get(id);
    if (player) {
      player.audio.volume = Math.max(0, Math.min(1, volume));
      player.volume = volume;
    }
  }

  fadeOut(durationMs: number = 8000) {
    const steps = 40;
    const interval = durationMs / steps;
    let step = 0;

    // Store initial volumes
    const initials = new Map<string, number>();
    this.players.forEach((p, id) => initials.set(id, p.audio.volume));

    this.fadeInterval = setInterval(() => {
      step++;
      const factor = 1 - step / steps;
      this.players.forEach((p, id) => {
        const init = initials.get(id) || 0.5;
        p.audio.volume = Math.max(0, init * factor);
      });
      if (step >= steps) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
    }, interval);
  }

  stopAll() {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    this.players.forEach((player) => {
      player.audio.pause();
      player.audio.src = "";
    });
    this.players.clear();
  }

  isPlaying(id: string) {
    return this.players.has(id);
  }
}

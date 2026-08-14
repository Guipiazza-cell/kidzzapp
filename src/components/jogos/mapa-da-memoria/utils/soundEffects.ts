let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) { audioCtx = new AudioContextClass(); }
  }
  if (audioCtx && audioCtx.state === 'suspended') { audioCtx.resume().catch(() => {}); }
  return audioCtx;
}

export function isAudioMuted(): boolean { return !soundEnabled; }

export function toggleAudio(): boolean {
  soundEnabled = !soundEnabled;
  if (soundEnabled) { playChime(); }
  return soundEnabled;
}

export function playChime(freq = 523.25): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.95);
  } catch { /* Ignore audio error */ }
}

export function playPointReveal(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, idx) => { setTimeout(() => { playChime(freq); }, idx * 120); });
}

export function playHeartbeatPulse(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch { /* Ignore audio error */ }
}

export function playMapComplete(): void {
  if (!soundEnabled) return;
  const chordNotes = [392.00, 523.25, 659.25, 783.99, 1046.50];
  chordNotes.forEach((freq, index) => { setTimeout(() => { playChime(freq); }, index * 140); });
}

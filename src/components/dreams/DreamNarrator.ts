/* ── Sleep story narrator with natural pauses ── */

export class DreamNarrator {
  private utterances: SpeechSynthesisUtterance[] = [];
  private currentIndex = 0;
  private isSpeaking = false;
  private onEndCallback?: () => void;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.pickVoice();
    if (typeof window !== "undefined") {
      window.speechSynthesis.onvoiceschanged = () => this.pickVoice();
    }
  }

  private pickVoice() {
    if (typeof window === "undefined") return;
    const voices = window.speechSynthesis.getVoices();
    const ptBR = voices.filter(v => v.lang === "pt-BR");
    const female = ptBR.filter(v => /female|feminino|luciana|francisca|google/i.test(v.name));
    this.voice = female[0] || ptBR[0] || voices.filter(v => v.lang.startsWith("pt"))[0] || null;
  }

  speak(text: string, onEnd?: () => void) {
    this.stop();
    this.onEndCallback = onEnd;

    // Split into sentences for natural pauses
    const sentences = text
      .split(/(?<=[.!?…])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    this.utterances = sentences.map((sentence) => {
      const utt = new SpeechSynthesisUtterance(sentence);
      utt.lang = "pt-BR";
      utt.rate = 0.82;
      utt.pitch = 1.0;
      utt.volume = 1;
      if (this.voice) utt.voice = this.voice;
      return utt;
    });

    this.currentIndex = 0;
    this.isSpeaking = true;
    this.speakNext();
  }

  private speakNext() {
    if (!this.isSpeaking || this.currentIndex >= this.utterances.length) {
      this.isSpeaking = false;
      this.onEndCallback?.();
      return;
    }

    const utt = this.utterances[this.currentIndex];
    utt.onend = () => {
      this.currentIndex++;
      // Natural breathing pause between sentences (400-700ms)
      const pause = 400 + Math.random() * 300;
      setTimeout(() => this.speakNext(), pause);
    };
    utt.onerror = () => {
      this.currentIndex++;
      setTimeout(() => this.speakNext(), 400);
    };

    window.speechSynthesis.speak(utt);
  }

  stop() {
    this.isSpeaking = false;
    window.speechSynthesis.cancel();
    this.utterances = [];
    this.currentIndex = 0;
  }

  get speaking() {
    return this.isSpeaking;
  }
}

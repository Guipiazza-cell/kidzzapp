/* ── Sleep story narrator with natural pauses ── */

export class DreamNarrator {
  private utterances: SpeechSynthesisUtterance[] = [];
  private currentIndex = 0;
  private isSpeaking = false;
  private onEndCallback?: () => void;

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
      // Natural pause between sentences (250-400ms)
      const pause = 250 + Math.random() * 150;
      setTimeout(() => this.speakNext(), pause);
    };
    utt.onerror = () => {
      this.currentIndex++;
      setTimeout(() => this.speakNext(), 300);
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

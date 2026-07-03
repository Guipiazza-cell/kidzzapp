/* ── Sleep story narrator (ElevenLabs voz Amanda + fallback Web Speech) ── */

import { pickFemaleVoice } from "@/lib/ttsVoice";
import { cleanNarrationText, chunkText, fetchElevenChunk } from "@/lib/elevenTTS";

export class DreamNarrator {
  private utterances: SpeechSynthesisUtterance[] = [];
  private currentIndex = 0;
  private isSpeaking = false;
  private onEndCallback?: () => void;
  private voice: SpeechSynthesisVoice | null = null;
  private audio: HTMLAudioElement | null = null;
  // Cada speak()/stop() incrementa; falas em voo de gerações antigas abortam.
  private gen = 0;

  constructor() {
    this.pickVoice();
    if (typeof window !== "undefined") {
      window.speechSynthesis.onvoiceschanged = () => this.pickVoice();
    }
  }

  private pickVoice() {
    if (typeof window === "undefined") return;
    // Voz feminina pt-BR padronizada (fonte única) — usada no fallback.
    this.voice = pickFemaleVoice(window.speechSynthesis.getVoices());
  }

  speak(text: string, onEnd?: () => void) {
    this.stop();
    this.onEndCallback = onEnd;

    const clean = cleanNarrationText(text);
    if (!clean) {
      onEnd?.();
      return;
    }

    this.gen++;
    const myGen = this.gen;
    this.isSpeaking = true;

    // 1) Tenta ElevenLabs (voz Amanda), tocando os trechos em sequência.
    void this.speakEleven(clean, myGen).catch(() => {
      // 2) Fallback Web Speech se a ElevenLabs falhar.
      if (myGen === this.gen) this.speakWebSpeech(clean, myGen);
    });
  }

  private async speakEleven(clean: string, myGen: number): Promise<void> {
    const chunks = chunkText(clean);
    for (const chunk of chunks) {
      if (myGen !== this.gen) return;
      const uri = await fetchElevenChunk(chunk); // lança se indisponível
      if (myGen !== this.gen) return;
      await this.playUri(uri, myGen);
    }
    if (myGen === this.gen) {
      this.isSpeaking = false;
      this.onEndCallback?.();
    }
  }

  private playUri(uri: string, myGen: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (myGen !== this.gen) return resolve();
      const audio = new Audio(uri);
      this.audio = audio;
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("audio_error"));
      // Pausa natural entre trechos já embutida no áudio; toca direto.
      audio.play().catch(() => reject(new Error("play_blocked")));
    });
  }

  private speakWebSpeech(clean: string, myGen: number) {
    const sentences = clean
      .split(/(?<=[.!?…])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    this.utterances = sentences.map((sentence) => {
      const utt = new SpeechSynthesisUtterance(sentence);
      utt.lang = "pt-BR";
      // Voz de embalo: ritmo lento, pitch neutro, volume suave.
      utt.rate = 0.78;
      utt.pitch = 0.98;
      utt.volume = 0.9;
      if (this.voice) utt.voice = this.voice;
      return utt;
    });

    this.currentIndex = 0;
    this.speakNext(myGen);
  }

  private speakNext(myGen: number) {
    if (myGen !== this.gen || this.currentIndex >= this.utterances.length) {
      if (myGen === this.gen) {
        this.isSpeaking = false;
        this.onEndCallback?.();
      }
      return;
    }

    const utt = this.utterances[this.currentIndex];
    utt.onend = () => {
      this.currentIndex++;
      // Natural breathing pause between sentences (400-700ms)
      const pause = 400 + Math.random() * 300;
      setTimeout(() => this.speakNext(myGen), pause);
    };
    utt.onerror = () => {
      this.currentIndex++;
      setTimeout(() => this.speakNext(myGen), 400);
    };

    window.speechSynthesis.speak(utt);
  }

  stop() {
    this.gen++;
    this.isSpeaking = false;
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.utterances = [];
    this.currentIndex = 0;
  }

  get speaking() {
    return this.isSpeaking;
  }
}

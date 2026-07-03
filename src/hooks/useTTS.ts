import { useCallback, useEffect, useRef } from "react";
import { loadVoices, pickFemaleVoice, SOFT_RATE, SOFT_PITCH, SOFT_VOLUME } from "@/lib/ttsVoice";
import { cleanNarrationText, chunkText, fetchElevenChunk } from "@/lib/elevenTTS";

/**
 * useTTS — Narração premium via ElevenLabs (voz Amanda, pt-BR).
 *
 * Fluxo:
 *  1. Tenta ElevenLabs (voz Amanda) via edge `elevenlabs-tts`.
 *  2. Se falhar (sem crédito/quota/offline), cai no fallback Web Speech
 *     (voz feminina do navegador) — narração nunca quebra o fluxo.
 *
 * Interface estável `{ speak, stop }` — todos os consumidores continuam iguais.
 * `speak(text, { rate, pitch })` — rate/pitch só afetam o fallback Web Speech.
 * `stop()` cancela a fala em qualquer ponto.
 */
export const useTTS = () => {
  const cancelledRef = useRef(false);
  // Cada speak()/stop() incrementa. Falas em voo que não pertencem à geração
  // atual são abortadas → nunca dois áudios juntos.
  const genRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* noop */
      }
    }
  }, []);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    genRef.current++;
    stopAudio();
  }, [stopAudio]);

  /** Toca um data URI e resolve no fim (ou se abortado). */
  const playUri = useCallback((uri: string, myGen: number): Promise<void> => {
    return new Promise((resolve) => {
      if (myGen !== genRef.current) return resolve();
      const audio = new Audio(uri);
      audioRef.current = audio;
      const done = () => resolve();
      audio.onended = done;
      audio.onerror = done;
      audio.play().catch(done);
    });
  }, []);

  /** Fallback: narração via Web Speech API nativa (voz feminina pt-BR). */
  const speakWebSpeech = useCallback(
    async (clean: string, options: { rate?: number; pitch?: number } | undefined, myGen: number): Promise<void> => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();

      if (!voiceRef.current) {
        const voices = await loadVoices();
        voiceRef.current = pickFemaleVoice(voices);
      }

      const sentences = clean.split(/(?<=[.!?…])\s+/).filter((s) => s.trim().length > 0);
      const list = sentences.length > 0 ? sentences : [clean];

      for (let i = 0; i < list.length; i++) {
        if (myGen !== genRef.current) break;
        await new Promise<void>((resolve) => {
          const utt = new SpeechSynthesisUtterance(list[i]);
          utt.lang = "pt-BR";
          utt.rate = options?.rate ?? SOFT_RATE;
          utt.pitch = options?.pitch ?? SOFT_PITCH;
          utt.volume = SOFT_VOLUME;
          if (voiceRef.current) utt.voice = voiceRef.current;

          let settled = false;
          const done = () => {
            if (settled) return;
            settled = true;
            resolve();
          };
          utt.onend = done;
          utt.onerror = done;
          try {
            window.speechSynthesis.speak(utt);
          } catch {
            done();
          }
          const safeMs = Math.min(15000, list[i].length * 90);
          setTimeout(done, safeMs);
        });
        if (i < list.length - 1 && myGen === genRef.current) {
          await new Promise((r) => setTimeout(r, 120));
        }
      }
    },
    []
  );

  const speak = useCallback(
    async (text: string, options?: { rate?: number; pitch?: number }): Promise<void> => {
      cancelledRef.current = false;
      genRef.current++;
      const myGen = genRef.current;
      stopAudio();

      const clean = cleanNarrationText(text);
      if (!clean) return;

      // 1) Tenta ElevenLabs (voz Amanda).
      try {
        const chunks = chunkText(clean);
        for (const chunk of chunks) {
          if (myGen !== genRef.current) return;
          const uri = await fetchElevenChunk(chunk); // lança se indisponível
          if (myGen !== genRef.current) return;
          await playUri(uri, myGen);
        }
        return;
      } catch (e) {
        // 2) Fallback silencioso para Web Speech.
        console.warn("[useTTS] ElevenLabs indisponível, usando Web Speech:", e);
        if (myGen !== genRef.current) return;
        await speakWebSpeech(clean, options, myGen);
      }
    },
    [playUri, speakWebSpeech, stopAudio]
  );

  useEffect(() => () => stop(), [stop]);

  return { speak, stop };
};

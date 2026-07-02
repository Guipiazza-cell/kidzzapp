import { useCallback, useRef } from "react";
import { loadVoices, pickFemaleVoice, SOFT_RATE, SOFT_PITCH, SOFT_VOLUME } from "@/lib/ttsVoice";

/**
 * useTTS — Narração via Web Speech API nativa (pt-BR).
 *
 * Por que Web Speech?
 *  - Gratuita, sem chave, sem latência de rede, sem dependência de edge function
 *  - Funciona offline e em todos os navegadores modernos
 *  - Voz feminina pt-BR padronizada via @/lib/ttsVoice (fonte única)
 *
 * `stop()` cancela a fala em qualquer ponto.
 */

const cleanText = (text: string): string =>
  text
    // remove markdown comum
    .replace(/[*_~`#>]/g, "")
    // remove links markdown [texto](url) → texto
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // remove TODOS os emojis e símbolos pictográficos (Unicode "Extended Pictographic")
    // — voz lê texto puro, mais limpo e amigo, sem "rosto sorridente" etc.
    .replace(/\p{Extended_Pictographic}/gu, "")
    // remove variation selectors / zero-width joiners deixados pelos emojis
    .replace(/[\u200D\uFE0F\u20E3]/g, "")
    // colapsa espaços extras gerados pela remoção
    .replace(/\s{2,}/g, " ")
    .trim();

/** Quebra em frases para pausa natural entre orações. */
const splitSentences = (text: string): string[] => {
  const clean = cleanText(text);
  const sentences = clean.split(/(?<=[.!?…])\s+/).filter((s) => s.trim().length > 0);
  return sentences.length > 0 ? sentences : [clean];
};

export const useTTS = () => {
  const cancelledRef = useRef(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* noop */
      }
    }
  }, []);

  const speak = useCallback(async (text: string, options?: { rate?: number; pitch?: number }): Promise<void> => {
    if (!("speechSynthesis" in window)) {
      console.warn("[useTTS] Web Speech API indisponível neste navegador");
      return;
    }

    cancelledRef.current = false;
    window.speechSynthesis.cancel();

    // Carrega/reusa voz (feminina pt-BR, fonte única)
    if (!voiceRef.current) {
      const voices = await loadVoices();
      voiceRef.current = pickFemaleVoice(voices);
    }

    const sentences = splitSentences(text);

    for (let i = 0; i < sentences.length; i++) {
      if (cancelledRef.current) break;
      await new Promise<void>((resolve) => {
        const utt = new SpeechSynthesisUtterance(sentences[i]);
        utt.lang = "pt-BR";
        // Tom suave e amigo: ritmo levemente mais lento que o normal,
        // pitch quase neutro para parecer "tia que conta história".
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

        // Fail-safe: alguns navegadores travam o `onend` em frases longas
        const safeMs = Math.min(15000, sentences[i].length * 90);
        setTimeout(done, safeMs);
      });
      if (i < sentences.length - 1 && !cancelledRef.current) {
        await new Promise((r) => setTimeout(r, 120));
      }
    }
  }, []);

  return { speak, stop };
};

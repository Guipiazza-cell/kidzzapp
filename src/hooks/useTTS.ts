import { useCallback, useRef } from "react";

/**
 * Split text into sentences for natural pauses between them.
 */
const splitSentences = (text: string): string[] => {
  const clean = text.replace(/[*#_~`]/g, "");
  // Split on sentence-ending punctuation followed by space or end
  const sentences = clean.split(/(?<=[.!?…])\s+/).filter(s => s.trim().length > 0);
  return sentences.length > 0 ? sentences : [clean];
};

export const useTTS = () => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const cancelledRef = useRef(false);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    cancelledRef.current = false;

    const sentences = splitSentences(text);

    const getVoice = (): SpeechSynthesisVoice | null => {
      const voices = window.speechSynthesis.getVoices();
      const ptBR = voices.filter(v => v.lang === "pt-BR");
      const ptAny = voices.filter(v => v.lang.startsWith("pt"));
      return ptBR[0] || ptAny[0] || null;
    };

    // Wait for voices to load if needed
    let voice = getVoice();
    if (!voice && window.speechSynthesis.getVoices().length === 0) {
      await new Promise<void>(r => {
        window.speechSynthesis.onvoiceschanged = () => { voice = getVoice(); r(); };
        setTimeout(r, 1000); // fallback timeout
      });
    }

    for (let i = 0; i < sentences.length; i++) {
      if (cancelledRef.current) break;

      await new Promise<void>((resolve) => {
        const utt = new SpeechSynthesisUtterance(sentences[i]);
        utt.lang = "pt-BR";
        utt.rate = 0.88;
        utt.pitch = 1.1;
        if (voice) utt.voice = voice;

        utteranceRef.current = utt;
        utt.onend = () => resolve();
        utt.onerror = () => resolve();

        window.speechSynthesis.speak(utt);
      });

      // Natural pause between sentences (200ms)
      if (i < sentences.length - 1 && !cancelledRef.current) {
        await new Promise(r => setTimeout(r, 200));
      }
    }

    utteranceRef.current = null;
  }, []);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
  }, []);

  return { speak, stop };
};

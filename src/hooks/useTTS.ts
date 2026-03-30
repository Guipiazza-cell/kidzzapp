import { useCallback, useRef } from "react";

export const useTTS = () => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!("speechSynthesis" in window)) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*#_~`]/g, "");

    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "pt-BR";
      utterance.rate = 0.92;
      utterance.pitch = 1.15;

      // Try to find best Portuguese voice
      const pickVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer pt-BR female voices for a friendlier kids experience
        const ptBR = voices.filter(v => v.lang === "pt-BR");
        const ptAny = voices.filter(v => v.lang.startsWith("pt"));
        const chosen = ptBR[0] || ptAny[0];
        if (chosen) utterance.voice = chosen;
      };

      pickVoice();
      // Some browsers load voices async
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          pickVoice();
        };
      }

      utteranceRef.current = utterance;
      utterance.onend = () => {
        utteranceRef.current = null;
        resolve();
      };
      utterance.onerror = () => {
        utteranceRef.current = null;
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
  }, []);

  return { speak, stop };
};

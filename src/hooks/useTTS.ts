import { useCallback, useRef } from "react";

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const splitIntoChunks = (text: string, maxLen: number): string[] => {
  if (text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    let splitAt = remaining.lastIndexOf(". ", maxLen);
    if (splitAt < maxLen * 0.3) splitAt = remaining.lastIndexOf("! ", maxLen);
    if (splitAt < maxLen * 0.3) splitAt = remaining.lastIndexOf("? ", maxLen);
    if (splitAt < maxLen * 0.3) splitAt = remaining.lastIndexOf(", ", maxLen);
    if (splitAt < maxLen * 0.3) splitAt = maxLen;
    chunks.push(remaining.slice(0, splitAt + 1).trim());
    remaining = remaining.slice(splitAt + 1).trim();
  }
  return chunks.filter(c => c.length > 0);
};

export const useTTS = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const cleanText = text.replace(/[*#_~`]/g, "");
      
      // Split into chunks of ~900 chars at sentence boundaries
      const chunks = splitIntoChunks(cleanText, 900);
      
      for (const chunk of chunks) {
        const response = await fetch(TTS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: ANON_KEY,
            Authorization: `Bearer ${ANON_KEY}`,
          },
          body: JSON.stringify({ text: chunk }),
        });

        if (!response.ok) {
          fallbackSpeak(chunk);
          continue;
        }

        const data = await response.json();
        if (data.audioContent) {
          const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          await new Promise<void>((resolve) => {
            audio.onended = () => {
              audioRef.current = null;
              resolve();
            };
            audio.onerror = () => {
              audioRef.current = null;
              resolve();
            };
            audio.play().catch(() => resolve());
          });
        } else {
          fallbackSpeak(chunk);
        }
      }
    } catch {
      fallbackSpeak(text);
    }
  }, []);

  const fallbackSpeak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.9;
    utterance.pitch = 1.3;
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith("pt"));
    if (ptVoice) utterance.voice = ptVoice;
    window.speechSynthesis.speak(utterance);
  };

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
  }, []);

  return { speak, stop };
};

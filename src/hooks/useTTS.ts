import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Strip markdown noise so it's not read aloud.
 */
const cleanText = (text: string): string =>
  text.replace(/[*#_~`]/g, "").trim();

/**
 * Split text into sentences for natural pauses (Web Speech fallback only).
 */
const splitSentences = (text: string): string[] => {
  const clean = cleanText(text);
  const sentences = clean.split(/(?<=[.!?…])\s+/).filter((s) => s.trim().length > 0);
  return sentences.length > 0 ? sentences : [clean];
};

/**
 * useTTS — Premium voice (Azure pt-BR Francisca Neural) with Web Speech fallback.
 *
 * Order of attempts:
 *   1. Azure TTS via edge function `azure-tts` (server-side key, MP3 stream)
 *   2. Web Speech API native (offline, free, less natural)
 *
 * `stop()` cancels both audio playback and speech synthesis.
 */
export const useTTS = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelledRef = useRef(false);

  const stop = useCallback(() => {
    cancelledRef.current = true;
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = "";
      } catch {
        /* noop */
      }
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speakAzure = useCallback(async (text: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("azure-tts", {
        body: { text: cleanText(text) },
      });

      if (error || !data?.audioContent) {
        console.warn("[useTTS] Azure unavailable, falling back:", error?.message);
        return false;
      }

      if (cancelledRef.current) return true;

      const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
      audioRef.current = audio;

      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });

      audioRef.current = null;
      return true;
    } catch (err) {
      console.warn("[useTTS] Azure threw, falling back to Web Speech:", err);
      return false;
    }
  }, []);

  const speakWebSpeech = useCallback(async (text: string): Promise<void> => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const sentences = splitSentences(text);

    const getVoice = (): SpeechSynthesisVoice | null => {
      const voices = window.speechSynthesis.getVoices();
      const ptBR = voices.filter((v) => v.lang === "pt-BR");
      const ptAny = voices.filter((v) => v.lang.startsWith("pt"));
      return ptBR[0] || ptAny[0] || null;
    };

    let voice = getVoice();
    if (!voice && window.speechSynthesis.getVoices().length === 0) {
      await new Promise<void>((r) => {
        window.speechSynthesis.onvoiceschanged = () => {
          voice = getVoice();
          r();
        };
        setTimeout(r, 1000);
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
        utt.onend = () => resolve();
        utt.onerror = () => resolve();
        window.speechSynthesis.speak(utt);
      });
      if (i < sentences.length - 1 && !cancelledRef.current) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }
  }, []);

  const speak = useCallback(
    async (text: string): Promise<void> => {
      cancelledRef.current = false;
      // Cancel anything currently playing first
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {
          /* noop */
        }
        audioRef.current = null;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      const ok = await speakAzure(text);
      if (!ok && !cancelledRef.current) {
        await speakWebSpeech(text);
      }
    },
    [speakAzure, speakWebSpeech]
  );

  return { speak, stop };
};

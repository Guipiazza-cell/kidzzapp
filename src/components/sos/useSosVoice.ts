import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook para narração emocional do SOS via ElevenLabs (voz Alice, calma).
 * - Reutiliza o edge function `elevenlabs-tts` existente (requer JWT).
 * - Cache em memória por texto pra evitar custo em replays curtos.
 * - Fallback silencioso se falhar (UX nunca pode quebrar num momento sensível).
 */
const audioCache = new Map<string, string>(); // text -> data URI

export function useSosVoice() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!text?.trim()) return;
    stop();

    let dataUri = audioCache.get(text);
    if (!dataUri) {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("elevenlabs-tts", {
          body: { text },
        });
        if (error) throw error;
        const audioContent = (data as any)?.audioContent;
        if (!audioContent) throw new Error("no audio content");
        dataUri = `data:audio/mpeg;base64,${audioContent}`;
        audioCache.set(text, dataUri);
      } catch (e) {
        // Falha silenciosa — narração é enhancement, não bloqueia o fluxo.
        console.warn("[sos-voice] falling back to silence:", e);
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    return new Promise((resolve) => {
      const audio = new Audio(dataUri);
      audioRef.current = audio;
      audio.onended = () => { setSpeaking(false); resolve(); };
      audio.onerror = () => { setSpeaking(false); resolve(); };
      setSpeaking(true);
      audio.play().catch(() => { setSpeaking(false); resolve(); });
    });
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return { speak, stop, speaking, loading };
}

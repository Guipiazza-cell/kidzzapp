import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ELEVEN_FEMALE_VOICE_ID } from "@/lib/ttsVoice";

/**
 * Hook para narração emocional do SOS via ElevenLabs (voz Alice, calma).
 * - Reutiliza o edge function `elevenlabs-tts` existente (requer JWT).
 * - Cache em memória por texto pra evitar custo em replays curtos.
 * - Fallback silencioso se falhar (UX nunca pode quebrar num momento sensível).
 */
const audioCache = new Map<string, string>(); // text -> data URI

export function useSosVoice() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Geração: cada speak()/stop() incrementa. Falas em voo (aguardando rede)
  // que não pertencem à geração atual são abortadas → nunca dois áudios juntos.
  const genRef = useRef(0);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setSpeaking(false);
  }, []);

  const stop = useCallback(() => {
    genRef.current++;      // invalida qualquer fala em voo
    stopAudio();
  }, [stopAudio]);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!text?.trim()) return;
    // Nova fala: invalida a anterior (mesmo se ainda estiver carregando) e para o áudio atual.
    genRef.current++;
    const myGen = genRef.current;
    stopAudio();

    let dataUri = audioCache.get(text);
    if (!dataUri) {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("elevenlabs-tts", {
          body: { text, voiceId: ELEVEN_FEMALE_VOICE_ID },
        });
        if (error) throw error;
        const audioContent = (data as any)?.audioContent;
        if (!audioContent) throw new Error("no audio content");
        dataUri = `data:audio/mpeg;base64,${audioContent}`;
        audioCache.set(text, dataUri);
      } catch (e) {
        // Falha silenciosa — narração é enhancement, não bloqueia o fluxo.
        console.warn("[sos-voice] falling back to silence:", e);
        if (myGen === genRef.current) setLoading(false);
        return;
      }
      if (myGen === genRef.current) setLoading(false);
    }

    // Se outra fala começou (ou stop() foi chamado) enquanto carregava, aborta.
    if (myGen !== genRef.current) return;

    return new Promise((resolve) => {
      const audio = new Audio(dataUri);
      audioRef.current = audio;
      audio.onended = () => { setSpeaking(false); resolve(); };
      audio.onerror = () => { setSpeaking(false); resolve(); };
      setSpeaking(true);
      audio.play().catch(() => { setSpeaking(false); resolve(); });
    });
  }, [stopAudio]);

  useEffect(() => () => stop(), [stop]);

  return { speak, stop, speaking, loading };
}

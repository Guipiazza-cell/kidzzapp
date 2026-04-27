/**
 * useAudioPlayer — HTML5 Audio controlado por hook.
 * Padrão único para tocar arquivos .mp3 em /public/audios/.
 *
 * Regras de ouro:
 * - SÓ chame play() dentro de um handler de interação do usuário (onClick/onTouch).
 * - Apenas 1 instância ativa por hook → ao tocar nova fonte, a anterior é parada.
 * - preload="none" para não baixar áudio antes do toque.
 * - Limpe no unmount com cleanup() (ou stop()).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  const ensureAudio = () => {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "none";
      a.crossOrigin = "anonymous";
      a.addEventListener("ended", () => setIsPlaying(false));
      a.addEventListener("pause", () => setIsPlaying(false));
      a.addEventListener("playing", () => setIsPlaying(true));
      a.addEventListener("error", () => {
        setIsPlaying(false);
        toast({
          description: "Não foi possível tocar agora. Tente novamente 🎵",
        });
      });
      audioRef.current = a;
    }
    return audioRef.current;
  };

  const play = useCallback((src: string) => {
    const audio = ensureAudio();
    if (currentSrc !== src) {
      try {
        audio.pause();
        audio.src = src;
        audio.currentTime = 0;
        setCurrentSrc(src);
      } catch {
        /* noop */
      }
    }
    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(() => setIsPlaying(true)).catch(() => {
        setIsPlaying(false);
        toast({
          description: "Não foi possível tocar agora. Tente novamente 🎵",
        });
      });
    }
  }, [currentSrc]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      try {
        a.pause();
        a.currentTime = 0;
      } catch {
        /* noop */
      }
    }
    setIsPlaying(false);
  }, []);

  const cleanup = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      try {
        a.pause();
        a.removeAttribute("src");
        a.load();
      } catch {
        /* noop */
      }
      audioRef.current = null;
    }
    setCurrentSrc(null);
    setIsPlaying(false);
  }, []);

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) {
        try { a.pause(); a.removeAttribute("src"); a.load(); } catch { /* noop */ }
        audioRef.current = null;
      }
    };
  }, []);

  return { play, pause, stop, cleanup, isPlaying, currentSrc };
};

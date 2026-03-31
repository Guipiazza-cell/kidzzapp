import { useState, useCallback, useRef, useEffect } from "react";
import { Mic, Square } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface VoiceInputProps {
  onResult: (text: string) => void;
  disabled?: boolean;
  large?: boolean;
}

const NUM_BARS = 5;

// Extend Window for webkit prefix
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

const VoiceInput = ({ onResult, disabled, large }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [levels, setLevels] = useState<number[]>(new Array(NUM_BARS).fill(0));
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  const stopAudioAnalysis = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    analyserRef.current = null;
    setLevels(new Array(NUM_BARS).fill(0));
  }, []);

  const startAudioAnalysis = useCallback((stream: MediaStream) => {
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        const bars = Array.from({ length: NUM_BARS }, (_, i) => {
          const idx = Math.floor((i / NUM_BARS) * dataArray.length);
          return Math.min(1, dataArray[idx] / 200);
        });
        setLevels(bars);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // audio analysis not critical
    }
  }, []);

  const cleanup = useCallback(() => {
    stopAudioAnalysis();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    streamRef.current = null;
    audioCtxRef.current = null;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
  }, [stopAudioAnalysis]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const getSpeechRecognition = (): any => {
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    return new SpeechRecognition();
  };

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    stopAudioAnalysis();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    streamRef.current = null;
    audioCtxRef.current = null;
    setIsListening(false);
  }, [stopAudioAnalysis]);

  const startListening = useCallback(async () => {
    const recognition = getSpeechRecognition();
    if (!recognition) {
      toast.error("Seu navegador não suporta reconhecimento de voz. Use Chrome ou Safari! 🎤");
      return;
    }

    try {
      // Request mic for audio visualization
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startAudioAnalysis(stream);
    } catch {
      // Visualization not critical, continue without it
    }

    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (transcript && transcript.trim()) {
        onResult(transcript.trim());
      } else {
        toast.error("Não consegui entender. Tente falar mais perto do microfone! 🎤");
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast.error("Permita o acesso ao microfone para falar! 🎤");
      } else if (event.error === "no-speech") {
        toast.error("Não ouvi nada. Tente de novo! 🎤");
      } else if (event.error !== "aborted") {
        toast.error("Erro no reconhecimento de voz. Tente novamente! 🎤");
      }
      cleanup();
      setIsListening(false);
    };

    recognition.onend = () => {
      cleanup();
      setIsListening(false);
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error("Recognition start error:", err);
      toast.error("Erro ao iniciar reconhecimento de voz. Tente novamente! 🎤");
      cleanup();
      setIsListening(false);
    }
  }, [startAudioAnalysis, cleanup, onResult]);

  const handleClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const sizeClasses = large ? "w-36 h-36" : "w-16 h-16";
  const barHeight = large ? 40 : 20;
  const barWidth = large ? 6 : 3;
  const barGap = large ? 4 : 2;

  const isActive = isListening;

  return (
    <motion.div whileTap={{ scale: 0.9 }} className="relative">
      {/* Pulsing rings when listening */}
      {isListening && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-kid-green/30"
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-kid-green/20"
            animate={{ scale: [1, 2], opacity: [0.3, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
          />
        </>
      )}
      {/* Idle pulse */}
      {!isActive && !disabled && large && (
        <motion.div
          className="absolute inset-0 rounded-full bg-kid-orange/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {!isActive && !disabled && !large && (
        <motion.div
          className="absolute inset-0 rounded-full bg-kid-blue/25"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <button
        onClick={handleClick}
        disabled={disabled}
        className={`relative z-10 ${sizeClasses} rounded-full flex items-center justify-center shadow-xl transition-all ${
          isListening
            ? "kid-gradient-green"
            : large
            ? "kid-gradient-orange hover:shadow-[0_0_50px_hsl(var(--kid-orange)/0.5)]"
            : "kid-gradient-blue hover:shadow-2xl"
        } disabled:opacity-50`}
        aria-label={isTranscribing ? "Transcrevendo..." : isListening ? "Parar gravação" : "Falar pergunta"}
      >
        {isTranscribing ? (
          <motion.div
            className="flex items-center gap-1"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-white" />
            <div className="w-2 h-2 rounded-full bg-white" />
            <div className="w-2 h-2 rounded-full bg-white" />
          </motion.div>
        ) : isListening ? (
          large ? (
            <div className="flex items-center justify-center" style={{ gap: barGap }}>
              {levels.map((level, i) => (
                <motion.div
                  key={i}
                  className="rounded-full bg-white"
                  style={{ width: barWidth }}
                  animate={{ height: Math.max(barWidth, level * barHeight) }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                />
              ))}
            </div>
          ) : (
            <Square size={large ? 52 : 28} className="text-primary-foreground" fill="currentColor" />
          )
        ) : (
          <Mic size={large ? 52 : 28} className="text-primary-foreground" />
        )}
      </button>

      {isListening && large && (
        <motion.p
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white text-xs font-bold whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Toque novamente para parar 🛑
        </motion.p>
      )}
    </motion.div>
  );
};

export default VoiceInput;

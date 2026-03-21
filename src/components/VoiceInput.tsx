import { useState, useCallback, useRef, useEffect } from "react";
import { Mic } from "lucide-react";
import { motion } from "framer-motion";

interface VoiceInputProps {
  onResult: (text: string) => void;
  disabled?: boolean;
  large?: boolean;
}

const NUM_BARS = 5;

const VoiceInput = ({ onResult, disabled, large }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [levels, setLevels] = useState<number[]>(new Array(NUM_BARS).fill(0));
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const stopAudioAnalysis = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    analyserRef.current = null;
    streamRef.current = null;
    audioCtxRef.current = null;
    setLevels(new Array(NUM_BARS).fill(0));
  }, []);

  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
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
        // Pick spread-out bins for visual variety
        const bars = Array.from({ length: NUM_BARS }, (_, i) => {
          const idx = Math.floor((i / NUM_BARS) * dataArray.length);
          return Math.min(1, dataArray[idx] / 200);
        });
        setLevels(bars);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // mic permission denied, just ignore
    }
  }, []);

  useEffect(() => {
    return () => stopAudioAnalysis();
  }, [stopAudioAnalysis]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz. Tente usar o Chrome!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      startAudioAnalysis();
    };
    recognition.onend = () => {
      setIsListening(false);
      stopAudioAnalysis();
    };
    recognition.onerror = () => {
      setIsListening(false);
      stopAudioAnalysis();
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      if (text) onResult(text);
    };

    recognition.start();
  }, [onResult, startAudioAnalysis, stopAudioAnalysis]);

  const sizeClasses = large ? "w-36 h-36" : "w-16 h-16";
  const barHeight = large ? 40 : 20;
  const barWidth = large ? 6 : 3;
  const barGap = large ? 4 : 2;

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
      {!isListening && !disabled && large && (
        <motion.div
          className="absolute inset-0 rounded-full bg-kid-orange/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {!isListening && !disabled && !large && (
        <motion.div
          className="absolute inset-0 rounded-full bg-kid-blue/25"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <button
        onClick={startListening}
        disabled={disabled || isListening}
        className={`relative z-10 ${sizeClasses} rounded-full flex items-center justify-center shadow-xl transition-all ${
          isListening
            ? "kid-gradient-green"
            : large
            ? "kid-gradient-orange hover:shadow-[0_0_50px_hsl(var(--kid-orange)/0.5)]"
            : "kid-gradient-blue hover:shadow-2xl"
        } disabled:opacity-50`}
        aria-label={isListening ? "Ouvindo..." : "Falar pergunta"}
      >
        {isListening ? (
          /* Audio intensity bars */
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
          <Mic size={large ? 52 : 28} className="text-primary-foreground" />
        )}
      </button>
    </motion.div>
  );
};

export default VoiceInput;

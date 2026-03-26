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
const TRANSCRIBE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const VoiceInput = ({ onResult, disabled, large }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [levels, setLevels] = useState<number[]>(new Array(NUM_BARS).fill(0));
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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
    recorderRef.current = null;
    chunksRef.current = [];
  }, [stopAudioAnalysis]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch(TRANSCRIBE_URL, {
        method: "POST",
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      if (data.text && data.text.trim()) {
        onResult(data.text.trim());
      } else {
        toast.error("Não consegui entender. Tente falar mais perto do microfone! 🎤");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      toast.error("Erro na transcrição. Tente novamente! 🎤");
    } finally {
      setIsTranscribing(false);
    }
  }, [onResult]);

  const stopListening = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
    stopAudioAnalysis();
    setIsListening(false);
  }, [stopAudioAnalysis]);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Determine best supported mime type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/wav";

      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        cleanup();

        if (audioBlob.size > 0) {
          await transcribeAudio(audioBlob);
        }
      };

      recorder.onerror = () => {
        cleanup();
        setIsListening(false);
        toast.error("Erro no microfone. Tente novamente!");
      };

      recorder.start();
      setIsListening(true);
      startAudioAnalysis(stream);
    } catch (err) {
      console.error("Mic error:", err);
      toast.error("Permita o acesso ao microfone para falar! 🎤");
      setIsListening(false);
    }
  }, [startAudioAnalysis, cleanup, transcribeAudio]);

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

  const isActive = isListening || isTranscribing;

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
      {/* Transcribing indicator */}
      {isTranscribing && (
        <motion.div
          className="absolute inset-0 rounded-full bg-kid-yellow/30"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
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
        disabled={disabled || isTranscribing}
        className={`relative z-10 ${sizeClasses} rounded-full flex items-center justify-center shadow-xl transition-all ${
          isTranscribing
            ? "kid-gradient-yellow"
            : isListening
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

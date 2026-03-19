import { useState, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";

interface VoiceInputProps {
  onResult: (text: string) => void;
  disabled?: boolean;
}

const VoiceInput = ({ onResult, disabled }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);

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

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      if (text) onResult(text);
    };

    recognition.start();
  }, [onResult]);

  return (
    <motion.div
      whileTap={{ scale: 0.9 }}
      className="relative"
    >
      {/* Pulsing rings when listening */}
      {isListening && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-kid-green/30"
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-kid-green/20"
            animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
          />
        </>
      )}
      {/* Persistent pulse when idle */}
      {!isListening && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-full bg-kid-blue/25"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <button
        onClick={startListening}
        disabled={disabled || isListening}
        className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all ${
          isListening
            ? "kid-gradient-green animate-pulse"
            : "kid-gradient-blue hover:shadow-2xl"
        } disabled:opacity-50`}
        aria-label={isListening ? "Ouvindo..." : "Falar pergunta"}
      >
        {isListening ? (
          <MicOff size={28} className="text-primary-foreground" />
        ) : (
          <Mic size={28} className="text-primary-foreground" />
        )}
      </button>
    </motion.div>
  );
};

export default VoiceInput;

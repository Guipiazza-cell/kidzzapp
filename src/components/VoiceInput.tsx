import { useState, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
    <motion.div whileTap={{ scale: 0.9 }}>
      <Button
        variant="kidMic"
        size="iconXl"
        onClick={startListening}
        disabled={disabled || isListening}
        className={isListening ? "animate-pulse" : ""}
        aria-label={isListening ? "Ouvindo..." : "Falar pergunta"}
      >
        {isListening ? <MicOff size={28} /> : <Mic size={28} />}
      </Button>
    </motion.div>
  );
};

export default VoiceInput;

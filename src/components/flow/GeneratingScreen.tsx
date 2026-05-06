import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import pixelImg from "@/assets/pixel-chameleon.webp";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kidzz-chat`;
const TIMEOUT_MS = 30_000;

const LOADING_PHRASES = [
  "Pensando na melhor forma de explicar isso para uma criança...",
  "Adaptando a linguagem para a idade certa...",
  "Criando uma resposta que conecta vocês...",
  "Quase pronto! Isso pode marcar a vida do seu filho...",
];

interface Props {
  question: string;
  ageRange: string;
  onComplete: (answer: string) => void;
  onError: () => void;
  onLimitReached?: () => void;
}

const GeneratingScreen = ({ question, ageRange, onComplete, onError, onLimitReached }: Props) => {
  const { user, incrementQuestions } = useAuth();
  const calledRef = useRef(false);
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setPhraseIdx(i => (i + 1) % LOADING_PHRASES.length), 2500);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      toast.error("Demorou demais. Tente novamente.");
      onError();
    }, TIMEOUT_MS);

    const generate = async () => {
      try {
        await incrementQuestions();

        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: question }],
            ageRange,
            userId: user?.id || null,
          }),
          signal: controller.signal,
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "Erro" }));
          if (resp.status === 403 && err.error === "LIMIT_REACHED") {
            clearTimeout(timeout);
            if (onLimitReached) { onLimitReached(); } else { onError(); }
            return;
          }
          throw new Error(err.error || err.message || `Erro ${resp.status}`);
        }

        if (!resp.body) throw new Error("Sem resposta");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) fullText += content;
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        clearTimeout(timeout);

        if (fullText.trim()) {
          onComplete(fullText);
        } else {
          throw new Error("Resposta vazia");
        }
      } catch (e: any) {
        clearTimeout(timeout);
        if (e.name === "AbortError") return;
        toast.error(e.message || "Ops, algo deu errado!");
        onError();
      }
    };

    generate();

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <motion.img
        src={pixelImg}
        alt="Pixel pensando"
        className="w-24 h-24 object-contain drop-shadow-xl"
        animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rotating emotional phrases */}
      <div className="h-16 flex items-center justify-center mt-6">
        <AnimatePresence mode="wait">
          <motion.h2
            key={phraseIdx}
            className="text-lg font-black text-gray-800 text-center max-w-xs leading-snug"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {LOADING_PHRASES[phraseIdx]}
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* Animated dots */}
      <motion.div className="flex gap-2 mt-6">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-kid-orange"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>

      {/* Question reminder */}
      <motion.div
        className="mt-8 glass-card px-5 py-3 rounded-2xl max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <p className="text-gray-400 text-xs font-bold text-center">Pergunta:</p>
        <p className="text-gray-600 text-sm font-bold text-center mt-1">"{question}"</p>
      </motion.div>
    </motion.div>
  );
};

export default GeneratingScreen;

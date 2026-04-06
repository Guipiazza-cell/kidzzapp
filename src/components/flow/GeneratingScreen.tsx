import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ChameleonMascot from "../ChameleonMascot";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kidzz-chat`;
const TIMEOUT_MS = 30_000;

interface Props {
  question: string;
  ageRange: string;
  onComplete: (answer: string) => void;
  onError: () => void;
}

const GeneratingScreen = ({ question, ageRange, onComplete, onError }: Props) => {
  const { incrementQuestions } = useAuth();
  const calledRef = useRef(false);

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
          }),
          signal: controller.signal,
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "Erro" }));
          throw new Error(err.error || `Erro ${resp.status}`);
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
        if (e.name === "AbortError") return; // already handled
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
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChameleonMascot size="lg" mood="thinking" interactive={false} />
      </motion.div>

      <motion.h2
        className="text-xl font-black text-primary-foreground text-center mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Criando a melhor forma de explicar isso para seu filho...
      </motion.h2>

      <motion.p
        className="text-primary-foreground/40 text-center text-sm mt-2 max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        🤔 Adaptando para a idade certa, com carinho
      </motion.p>

      {/* Animated dots */}
      <motion.div className="flex gap-2 mt-8">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-kid-orange"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>

      {/* Subtle question reminder */}
      <motion.div
        className="mt-8 glass-card px-5 py-3 rounded-2xl max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <p className="text-primary-foreground/30 text-xs font-bold text-center">Pergunta:</p>
        <p className="text-primary-foreground/70 text-sm font-bold text-center mt-1">"{question}"</p>
      </motion.div>
    </motion.div>
  );
};

export default GeneratingScreen;

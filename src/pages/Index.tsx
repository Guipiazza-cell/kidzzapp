import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Shield, Sparkles, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChameleonMascot from "@/components/ChameleonMascot";
import ChatBubble from "@/components/ChatBubble";
import VoiceInput from "@/components/VoiceInput";
import ParentalGate from "@/components/ParentalGate";
import ParentalSettings from "@/components/ParentalSettings";
import { useTTS } from "@/hooks/useTTS";
import forestBg from "@/assets/forest-bg.jpg";
import { toast } from "sonner";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kidzz-chat`;
const MAX_FREE_QUESTIONS = 5;

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [questionsToday, setQuestionsToday] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const { speak } = useTTS();
  const lastAssistantTextRef = useRef("");

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const streamChat = useCallback(async (userMessages: { role: string; content: string }[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Erro desconhecido" }));
      throw new Error(err.error || `Erro ${resp.status}`);
    }

    if (!resp.body) throw new Error("Sem resposta");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantText = "";

    const updateAssistant = (text: string) => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && !last.isUser) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, text } : m);
        }
        return [...prev, { id: Date.now() + 1, text, isUser: false }];
      });
    };

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
          if (content) {
            assistantText += content;
            updateAssistant(assistantText);
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    lastAssistantTextRef.current = assistantText;
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;
    if (questionsToday >= MAX_FREE_QUESTIONS) return;

    const userMsg: Message = { id: Date.now(), text: text.trim(), isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setQuestionsToday(q => q + 1);

    const allMessages = [...messages, userMsg].map(m => ({
      role: m.isUser ? "user" as const : "assistant" as const,
      content: m.text,
    }));

    try {
      await streamChat(allMessages);
      // Read the response aloud after streaming completes
      if (lastAssistantTextRef.current) {
        speak(lastAssistantTextRef.current);
      }
    } catch (e: any) {
      toast.error(e.message || "Ops, algo deu errado!");
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Ops, não consegui responder agora! Tente de novo em um pouquinho 🦎💛",
        isUser: false,
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, questionsToday, messages, streamChat, speak]);

  const handleVoiceResult = useCallback((text: string) => {
    setInput(text);
    sendMessage(text);
  }, [sendMessage]);

  const isFreeLimitReached = questionsToday >= MAX_FREE_QUESTIONS;

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      {/* Forest background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${forestBg})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background/70" />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-2 h-2 rounded-full bg-kid-yellow/40"
          style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <motion.div
          className="flex items-center gap-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight drop-shadow-md">
            Kidzz
          </h1>
          <span className="text-[10px] font-bold bg-kid-yellow text-foreground px-2 py-0.5 rounded-full shadow-sm">
            FREE
          </span>
        </motion.div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground font-bold bg-card/70 backdrop-blur-sm px-2 py-1 rounded-full">
            {MAX_FREE_QUESTIONS - questionsToday} 💬
          </span>
          <button
            onClick={() => setShowParentalGate(true)}
            className="p-2 rounded-2xl bg-card/70 backdrop-blur-sm text-muted-foreground hover:text-primary transition-all shadow-sm"
            aria-label="Controle parental"
          >
            <Shield size={18} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10 min-h-0">
        {messages.length === 0 ? (
          <motion.div
            className="flex-1 flex flex-col items-center justify-center px-6 gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ChameleonMascot size="xl" />
            <h2 className="text-2xl font-extrabold text-foreground text-center mt-2 drop-shadow-md">
              Oi! Eu sou o Kidzz! 🦎
            </h2>
            <p className="text-muted-foreground text-center text-sm max-w-[280px] bg-card/60 backdrop-blur-sm rounded-2xl px-4 py-2">
              Aprender nunca foi tão divertido! ✨
              <br />Me pergunte qualquer coisa!
            </p>

            {/* Quick suggestions */}
            <div className="flex flex-wrap justify-center gap-2 mt-3 max-w-xs">
              {["Por que o céu é azul? 🌤️", "Como os peixes respiram? 🐟", "Por que a Lua brilha? 🌙"].map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="bg-card/80 backdrop-blur-sm border border-border px-3 py-2 rounded-2xl text-xs font-bold text-foreground hover:bg-primary/10 hover:border-primary/30 transition-all active:scale-95 shadow-md"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm">
              <ChameleonMascot isTalking={isTyping} size="sm" />
              <span className="text-sm font-extrabold text-foreground">Kidzz</span>
              {isTyping && (
                <motion.span
                  className="text-xs text-muted-foreground font-bold"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  pensando...
                </motion.span>
              )}
            </div>

            {/* Chat messages */}
            <div ref={chatRef} className="flex-1 overflow-y-auto px-4 pb-2">
              <AnimatePresence>
                {messages.map(msg => (
                  <ChatBubble key={msg.id} message={msg.text} isUser={msg.isUser} />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Input area */}
      <div className="relative z-10 p-4 pb-6">
        {isFreeLimitReached ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3 bg-card/80 backdrop-blur-sm rounded-3xl p-5"
          >
            <p className="text-sm text-muted-foreground font-bold">
              Você usou todas as perguntas de hoje! 🌟
            </p>
            <Button variant="kidPremium" size="xl" className="w-full">
              <Sparkles size={22} />
              Seja Premium — Ilimitado!
            </Button>
            <p className="text-xs text-muted-foreground">
              A partir de R$ 14,90/mês · 7 dias grátis
            </p>
          </motion.div>
        ) : (
          <div className="flex items-end gap-3">
            <VoiceInput onResult={handleVoiceResult} disabled={isTyping} />
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                placeholder="Pergunte qualquer coisa 😊"
                className="w-full py-4 px-5 rounded-3xl bg-card/90 backdrop-blur-sm border-2 border-border text-foreground text-base placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-lg transition-all"
              />
            </div>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="kidAsk"
                size="iconXl"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                aria-label="Perguntar"
                className="w-16 h-16"
              >
                <Send size={26} />
              </Button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showParentalGate && (
          <ParentalGate
            onSuccess={() => { setShowParentalGate(false); setShowSettings(true); }}
            onCancel={() => setShowParentalGate(false)}
          />
        )}
        {showSettings && <ParentalSettings onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Index;

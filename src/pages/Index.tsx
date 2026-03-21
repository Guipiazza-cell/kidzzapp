import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Shield, Sparkles, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChameleonMascot from "@/components/ChameleonMascot";
import ChatBubble from "@/components/ChatBubble";
import VoiceInput from "@/components/VoiceInput";
import ParentalGate from "@/components/ParentalGate";
import ParentalSettings from "@/components/ParentalSettings";
import { useTTS } from "@/hooks/useTTS";
import jungleBg from "@/assets/jungle-bg.jpg";
import { toast } from "sonner";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kidzz-chat`;
const MAX_FREE_QUESTIONS = 3;

const AGE_OPTIONS = [
  {
    range: "0-3",
    emoji: "👶",
    label: "0 a 3 anos",
    desc: "Sons, cores e palavrinhas simples",
    color: "from-pink-400 to-rose-500",
  },
  {
    range: "3-7",
    emoji: "🧒",
    label: "3 a 7 anos",
    desc: "Historinhas e exemplos do dia a dia",
    color: "from-emerald-400 to-teal-500",
  },
  {
    range: "7-10",
    emoji: "🧑‍🎓",
    label: "7 a 10 anos",
    desc: "Curiosidades e desafios científicos",
    color: "from-blue-400 to-indigo-500",
  },
];

const Index = () => {
  const [ageRange, setAgeRange] = useState<string | null>(null);
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
      body: JSON.stringify({ messages: userMessages, ageRange }),
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
  }, [ageRange]);

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
      if (lastAssistantTextRef.current) {
        speak(lastAssistantTextRef.current);
      }
    } catch (e: any) {
      toast.error(e.message || "Ops, algo deu errado!");
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Ops, não consegui responder agora! Tente de novo 🦎💛",
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

  // ====== AGE SELECTION SCREEN ======
  if (!ageRange) {
    return (
      <div className="min-h-screen flex flex-col overflow-hidden relative">
        <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${jungleBg})` }} />
        <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

        {/* Fireflies */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="fixed rounded-full bg-kid-yellow/50"
            style={{ width: 4, height: 4, left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [0, -20, 10, 0], opacity: [0.2, 0.8, 0.3, 0.2] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200 }}>
            <ChameleonMascot size="xl" />
          </motion.div>

          <motion.h1
            className="text-4xl font-extrabold text-white text-center mt-3 drop-shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Olá! Eu sou o Kidzz! 🦎
          </motion.h1>

          <motion.p
            className="text-white/80 text-center text-base mt-2 max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Qual a idade do explorador? Assim eu sei como conversar! 🌿
          </motion.p>

          <motion.div
            className="w-full max-w-sm mt-6 space-y-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {AGE_OPTIONS.map((opt, i) => (
              <motion.button
                key={opt.range}
                onClick={() => setAgeRange(opt.range)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${opt.color} text-white shadow-xl hover:shadow-2xl transition-all active:scale-95`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.15 }}
              >
                <span className="text-4xl">{opt.emoji}</span>
                <div className="text-left">
                  <p className="font-extrabold text-lg">{opt.label}</p>
                  <p className="text-sm text-white/80">{opt.desc}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>

          <motion.button
            onClick={() => setShowParentalGate(true)}
            className="mt-6 flex items-center gap-2 text-white/60 text-xs hover:text-white/90 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <Shield size={14} />
            Controle Parental
          </motion.button>
        </div>

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
  }

  // ====== MAIN CHAT SCREEN ======
  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${jungleBg})` }} />
      <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* Fireflies */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed rounded-full bg-kid-yellow/50"
          style={{ width: 4, height: 4, left: `${10 + i * 14}%`, top: `${15 + (i % 3) * 22}%` }}
          animate={{ y: [0, -25, 10, 0], opacity: [0.2, 0.7, 0.3, 0.2] }}
          transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <motion.div className="flex items-center gap-2" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">Kidzz</h1>
          <span className="text-[10px] font-bold bg-kid-yellow text-foreground px-2 py-0.5 rounded-full shadow-sm">
            {AGE_OPTIONS.find(a => a.range === ageRange)?.emoji} {ageRange}
          </span>
        </motion.div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white font-bold bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {MAX_FREE_QUESTIONS - questionsToday} 💬
          </span>
          <button
            onClick={() => setAgeRange(null)}
            className="text-[10px] text-white/60 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full hover:text-white"
          >
            trocar idade
          </button>
          <button
            onClick={() => setShowParentalGate(true)}
            className="p-2 rounded-2xl bg-black/30 backdrop-blur-sm text-white/80 hover:text-white transition-all shadow-sm"
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
            className="flex-1 flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ChameleonMascot size="lg" />
            <h2 className="text-xl font-extrabold text-white text-center mt-2 drop-shadow-lg">
              Pronto pra explorar? 🌿
            </h2>
            <p className="text-white/70 text-center text-sm max-w-[260px] mt-1">
              Toque no botão ou fale sua pergunta!
            </p>

            {/* MASSIVE PULSING MIC BUTTON */}
            <motion.div className="mt-6 relative flex items-center justify-center">
              {/* Multiple pulsing rings */}
              <motion.div
                className="absolute w-44 h-44 rounded-full bg-kid-orange/20"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute w-44 h-44 rounded-full bg-kid-orange/15"
                animate={{ scale: [1, 1.7, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
              <motion.div
                className="absolute w-44 h-44 rounded-full bg-kid-orange/10"
                animate={{ scale: [1, 2, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />

              <VoiceInput onResult={handleVoiceResult} disabled={isTyping} large />
            </motion.div>

            <p className="text-white/50 text-xs mt-4 font-bold animate-pulse">
              🎤 Toque para falar sua pergunta!
            </p>

            {/* Quick suggestions */}
            <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-xs">
              {(ageRange === "0-3"
                ? ["Que som faz o gato? 🐱", "De que cor é o sol? ☀️", "O que é chuva? 🌧️"]
                : ageRange === "3-7"
                ? ["Por que o céu é azul? 🌤️", "Como os peixes respiram? 🐟", "Por que a Lua brilha? 🌙"]
                : ["Como funciona um vulcão? 🌋", "Por que existem fusos horários? 🕐", "Como surgiu a internet? 💻"]
              ).map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="bg-black/30 backdrop-blur-md border border-white/20 px-3 py-2 rounded-2xl text-xs font-bold text-white hover:bg-white/20 transition-all active:scale-95 shadow-md"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-md">
              <ChameleonMascot isTalking={isTyping} size="sm" />
              <span className="text-sm font-extrabold text-white">Kidzz</span>
              {isTyping && (
                <motion.span
                  className="text-xs text-white/70 font-bold"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  pensando...
                </motion.span>
              )}
            </div>
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
            className="text-center space-y-3 bg-black/40 backdrop-blur-md rounded-3xl p-5"
          >
            <p className="text-sm text-white/80 font-bold">Você usou suas {MAX_FREE_QUESTIONS} perguntas de hoje! 🌟</p>
            <Button variant="kidPremium" size="xl" className="w-full">
              <Sparkles size={22} />
              Seja Premium — Ilimitado!
            </Button>
            <p className="text-xs text-white/60">A partir de R$ 14,90/mês · 7 dias grátis</p>
          </motion.div>
        ) : (
          <div className="flex items-end gap-3">
            <VoiceInput onResult={handleVoiceResult} disabled={isTyping} />
            <div className="flex-1 relative">
              <input
                id="kidzz-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                placeholder="Pergunte qualquer coisa 😊"
                className="w-full py-4 px-5 rounded-3xl bg-black/40 backdrop-blur-md border-2 border-white/20 text-white text-base placeholder:text-white/50 focus:outline-none focus:border-kid-orange focus:ring-2 focus:ring-kid-orange/30 shadow-lg transition-all"
              />
            </div>
            <motion.div whileTap={{ scale: 0.85 }}>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                aria-label="Perguntar"
                className="relative w-14 h-14 rounded-full kid-gradient-orange shadow-2xl flex items-center justify-center disabled:opacity-40 transition-all"
              >
                <Send size={24} className="text-white" />
              </button>
            </motion.div>
          </div>
        )}
      </div>

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

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Shield, RotateCcw } from "lucide-react";
import ChameleonMascot from "./ChameleonMascot";
import ChatBubble from "./ChatBubble";
import VoiceInput from "./VoiceInput";
import ConversionScreen from "./ConversionScreen";
import ParentalGate from "./ParentalGate";
import ParentalSettings from "./ParentalSettings";
import { useTTS } from "@/hooks/useTTS";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import jungleBg from "@/assets/jungle-bg.jpg";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kidzz-chat`;
const CHECKOUT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`;
const MAX_FREE_QUESTIONS = 3;

const SUGGESTIONS: Record<string, string[]> = {
  "0-3": ["Que som faz o gato? 🐱", "De que cor é o sol? ☀️", "O que é chuva? 🌧️"],
  "3-7": ["Por que o céu é azul? 🌤️", "Como os peixes respiram? 🐟", "Por que a Lua brilha? 🌙"],
  "7-10": ["Como funciona um vulcão? 🌋", "Por que existem fusos horários? 🕐", "Como surgiu a internet? 💻"],
};

const FOLLOW_UPS: Record<string, string[]> = {
  "0-3": ["Que mais você quer saber? 🌈", "Quer ouvir de novo? 🔄"],
  "3-7": ["Quer saber por que isso acontece? 🤔", "Quer saber mais? ✨", "Tem outra pergunta? 🦎"],
  "7-10": ["Quer se aprofundar nisso? 🔬", "Quer um desafio sobre isso? 🧠", "Pergunta mais! 🚀"],
};

const AGE_OPTIONS = [
  { range: "0-3", emoji: "👶", label: "0 a 3 anos" },
  { range: "3-7", emoji: "🧒", label: "3 a 7 anos" },
  { range: "7-10", emoji: "🧑‍🎓", label: "7 a 10 anos" },
];

const ChatScreen = () => {
  const { profile, user, session, updateProfile, incrementQuestions } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const { speak, stop: stopTTS } = useTTS();
  const lastAssistantTextRef = useRef("");

  const childName = profile?.child_name || "Explorador";
  const ageRange = profile?.age_range || "3-7";
  const isPremium = profile?.is_premium ?? false;
  const questionsUsed = profile?.questions_used ?? 0;
  const isFreeLimitReached = !isPremium && questionsUsed >= MAX_FREE_QUESTIONS;

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleCheckout = useCallback(async () => {
    if (!session?.access_token) {
      toast.error("O pagamento volta a funcionar quando o login for reativado. Por enquanto, aprove o app para revisar tudo 😊");
      return;
    }

    setCheckoutLoading(true);
    try {
      const resp = await fetch(CHECKOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      });
      const data = await resp.json();
      if (data.url) window.open(data.url, "_blank");
      else toast.error("Erro ao criar checkout");
    } catch {
      toast.error("Erro ao iniciar pagamento");
    } finally {
      setCheckoutLoading(false);
    }
  }, [session]);

  const speakText = useCallback(async (text: string) => {
    if (!isPremium) return; // Voice is premium only
    setIsSpeaking(true);
    try {
      await speak(text);
    } finally {
      setIsSpeaking(false);
    }
  }, [speak, isPremium]);

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
    if (!text.trim() || isTyping || isFreeLimitReached) return;

    const userMsg: Message = { id: Date.now(), text: text.trim(), isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    if (!isPremium) {
      await incrementQuestions();
    }

    const allMessages = [...messages, userMsg].map(m => ({
      role: m.isUser ? "user" as const : "assistant" as const,
      content: m.text,
    }));

    try {
      await streamChat(allMessages);
      if (lastAssistantTextRef.current && isPremium) {
        speakText(lastAssistantTextRef.current);
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
  }, [isTyping, isFreeLimitReached, isPremium, messages, streamChat, speakText, incrementQuestions]);

  const handleVoiceResult = useCallback((text: string) => {
    setInput(text);
    sendMessage(text);
  }, [sendMessage]);

  const handleReplay = useCallback(() => {
    if (lastAssistantTextRef.current) {
      speakText(lastAssistantTextRef.current);
    }
  }, [speakText]);

  const followUps = FOLLOW_UPS[ageRange] || FOLLOW_UPS["3-7"];
  const randomFollowUp = followUps[Math.floor(Math.random() * followUps.length)];

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${jungleBg})` }} />
      <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

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
          <h1 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-lg">Kidzz</h1>
          <span className="text-[10px] font-bold bg-kid-yellow text-foreground px-2 py-0.5 rounded-full shadow-sm">
            {AGE_OPTIONS.find(a => a.range === ageRange)?.emoji} {ageRange}
          </span>
          {isPremium && (
            <span className="text-[10px] font-bold bg-kid-purple text-white px-2 py-0.5 rounded-full">⭐ Premium</span>
          )}
        </motion.div>
        <div className="flex items-center gap-2">
          {!isPremium && (
            <span className="text-sm text-white font-extrabold bg-kid-orange/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
              {MAX_FREE_QUESTIONS - questionsUsed} 💬
            </span>
          )}
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
        {isFreeLimitReached ? (
          <div className="flex-1 overflow-y-auto">
            <ConversionScreen
              childName={childName}
              onSubscribe={handleCheckout}
              loading={checkoutLoading}
            />
          </div>
        ) : messages.length === 0 ? (
          <motion.div
            className="flex-1 flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ChameleonMascot size="lg" />
            <h2 className="text-xl font-extrabold text-white text-center mt-2 drop-shadow-lg">
              Pergunta pra mim qualquer coisa 😄
            </h2>
            <p className="text-white/70 text-center text-sm max-w-[260px] mt-1">
              Eu adoro responder! Pode falar ou digitar 🌿
            </p>

            <motion.div className="mt-6 relative flex items-center justify-center">
              <motion.div
                className="absolute w-44 h-44 rounded-full bg-kid-orange/20"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <VoiceInput onResult={handleVoiceResult} disabled={isTyping} large />
            </motion.div>

            <p className="text-white/50 text-xs mt-4 font-bold animate-pulse">
              🎤 Toque para falar sua pergunta!
            </p>

            <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-xs">
              {(SUGGESTIONS[ageRange] || SUGGESTIONS["3-7"]).map(q => (
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
              <ChameleonMascot isTalking={isTyping || isSpeaking} size="sm" />
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
              {isSpeaking && !isTyping && (
                <motion.span
                  className="text-xs text-kid-yellow font-bold"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  🔊 Kidzz está falando...
                </motion.span>
              )}
              {isPremium && !isTyping && !isSpeaking && lastAssistantTextRef.current && (
                <button
                  onClick={handleReplay}
                  className="ml-auto flex items-center gap-1 text-xs text-white/60 hover:text-white bg-white/10 px-2 py-1 rounded-full"
                >
                  <RotateCcw size={12} />
                  Ouvir
                </button>
              )}
            </div>
            <div ref={chatRef} className="flex-1 overflow-y-auto px-4 pb-2">
              <AnimatePresence>
                {messages.map(msg => (
                  <ChatBubble key={msg.id} message={msg.text} isUser={msg.isUser} />
                ))}
              </AnimatePresence>

              {/* Follow-up suggestion after AI response */}
              {!isTyping && messages.length > 0 && !messages[messages.length - 1].isUser && !isFreeLimitReached && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center mt-2 mb-2"
                >
                  <button
                    onClick={() => sendMessage(randomFollowUp)}
                    className="bg-kid-green/20 border border-kid-green/30 px-4 py-2 rounded-2xl text-xs font-bold text-white/90 hover:bg-kid-green/30 transition-all active:scale-95"
                  >
                    {randomFollowUp}
                  </button>
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Input area */}
      {!isFreeLimitReached && (
        <div className="relative z-10 p-4 pb-6">
          <div className="space-y-2">
            {!isPremium && (
              <div className="flex justify-center">
                <div className="bg-kid-orange/90 backdrop-blur-md rounded-full px-5 py-2 flex items-center gap-2 shadow-lg">
                  <span className="text-white text-2xl font-extrabold">{MAX_FREE_QUESTIONS - questionsUsed}</span>
                  <span className="text-white/90 text-sm font-bold">de {MAX_FREE_QUESTIONS} perguntas</span>
                </div>
              </div>
            )}
            <div className="flex items-end gap-3">
              <VoiceInput onResult={handleVoiceResult} disabled={isTyping} />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                  placeholder="Pergunta qualquer coisa 😊"
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
          </div>
        </div>
      )}

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

export default ChatScreen;

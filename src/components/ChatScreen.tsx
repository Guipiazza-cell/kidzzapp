import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Shield, BookOpen, Heart } from "lucide-react";
import ChameleonMascot from "./ChameleonMascot";
import ChatBubble from "./ChatBubble";
import VoiceInput from "./VoiceInput";
import ConversionScreen from "./ConversionScreen";
import ParentalGate from "./ParentalGate";
import ParentalSettings from "./ParentalSettings";
import SubscribeBanner from "./SubscribeBanner";
import MagicalBackground from "./MagicalBackground";
import { useTTS } from "@/hooks/useTTS";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kidzz-chat`;

const SUGGESTIONS: Record<string, string[]> = {
  "0-3": ["Que som faz o gato? 🐱", "De que cor é o sol? ☀️", "O que é chuva? 🌧️"],
  "3-7": ["Por que o céu é azul? 🌤️", "Como os peixes respiram? 🐟", "Por que a Lua brilha? 🌙"],
  "7-10": ["Como funciona um vulcão? 🌋", "Por que existem fusos horários? 🕐", "Como surgiu a internet? 💻"],
};

const ChatScreen = ({
  onOpenStoryFactory,
  initialQuestion,
  onInitialQuestionConsumed,
}: {
  onOpenStoryFactory?: () => void;
  initialQuestion?: string | null;
  onInitialQuestionConsumed?: () => void;
}) => {
  const {
    profile, user, session, tier, updateProfile, incrementQuestions,
    handleCheckout, canAskQuestion, questionsRemaining,
  } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);
  const [lastTopic, setLastTopic] = useState<{ question: string; when: string } | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const { speak, stop: stopTTS } = useTTS();
  const lastAssistantTextRef = useRef("");
  // Track the most recent log row so we can flag it as narrated when the
  // parent presses "speak". One log row per Q&A pair.
  const lastLogIdRef = useRef<string | null>(null);
  const lastUserQuestionRef = useRef<string>("");

  const childName = profile?.child_name || "amigo";
  const ageRange = profile?.age_range || "3-7";
  const isPremium = profile?.is_premium ?? false;
  const isSuperPremium = tier === "premium";
  const isFreeLimitReached = !canAskQuestion();

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Memória contextual premium: busca última pergunta de dia anterior
  useEffect(() => {
    if (!isPremium || !user || messages.length > 0) return;
    let cancelled = false;
    (async () => {
      const sinceIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("kidzz_questions_log")
        .select("question, created_at")
        .eq("user_id", user.id)
        .gte("created_at", sinceIso)
        .lt("created_at", todayStart.toISOString())
        .order("created_at", { ascending: false })
        .limit(1);
      if (cancelled || !data?.[0]) return;
      const row = data[0];
      const created = new Date(row.created_at);
      const diffDays = Math.floor((todayStart.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      const when = diffDays <= 1 ? "Ontem" : `${diffDays} dias atrás`;
      setLastTopic({ question: row.question, when });
    })();
    return () => { cancelled = true; };
  }, [isPremium, user, messages.length]);

  const initialQuestionSentRef = useRef(false);
  useEffect(() => {
    if (initialQuestion && !initialQuestionSentRef.current && !isTyping) {
      initialQuestionSentRef.current = true;
      sendMessage(initialQuestion);
      onInitialQuestionConsumed?.();
    }
  }, [initialQuestion]);

  const onCheckout = useCallback(async (plan: "premium" | "super_premium") => {
    setCheckoutLoading(true);
    try { await handleCheckout(plan); } finally { setCheckoutLoading(false); }
  }, [handleCheckout]);

  const speakText = useCallback(async (text: string) => {
    setIsSpeaking(true);
    try {
      await speak(text);
      // Mark this Q&A as narrated in the parent log (best-effort, non-blocking).
      if (lastLogIdRef.current && user) {
        supabase
          .from("kidzz_questions_log")
          .update({ was_narrated: true })
          .eq("id", lastLogIdRef.current)
          .then(({ error }) => {
            if (error) console.warn("[Kidzz] log narration flag failed:", error.message);
          });
      }
    } catch {
      toast.error("Erro na narração. Tente novamente! 🔊");
    } finally {
      setIsSpeaking(false);
    }
  }, [speak, user]);

  const streamChat = useCallback(async (userMessages: { role: string; content: string }[]) => {
    if (!session?.access_token) {
      throw new Error("Você precisa estar logado para conversar com o KIDZZ.");
    }
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
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
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && !last.isUser) return prev.map((m, i) => (i === prev.length - 1 ? { ...m, text } : m));
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
  }, [ageRange, session?.access_token]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping || !canAskQuestion()) return;
    const trimmed = text.trim();
    const userMsg: Message = { id: Date.now(), text: trimmed, isUser: true };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    lastUserQuestionRef.current = trimmed;
    lastLogIdRef.current = null;
    await incrementQuestions();
    const allMessages = [...messages, userMsg].map((m) => ({
      role: m.isUser ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));
    try {
      await streamChat(allMessages);
      setConnectionCount((c) => c + 1);

      // Persist Q&A in the parent log (RLS protected, only the parent sees it).
      const answer = lastAssistantTextRef.current?.trim();
      if (user && answer) {
        const { data, error } = await supabase
          .from("kidzz_questions_log")
          .insert({
            user_id: user.id,
            question: trimmed,
            answer,
            age_range: ageRange,
            was_narrated: false,
          })
          .select("id")
          .single();
        if (error) console.warn("[Kidzz] log insert failed:", error.message);
        else lastLogIdRef.current = data?.id ?? null;
      }
    } catch (e: any) {
      toast.error(e.message || "Ops, algo deu errado!");
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: "Ops, não consegui responder agora! Tente de novo 🦎💛", isUser: false },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, canAskQuestion, messages, streamChat, incrementQuestions, user, ageRange]);

  const handleVoiceResult = useCallback((text: string) => {
    setInput(text);
    sendMessage(text);
  }, [sendMessage]);

  const mascotMood = isTyping ? "thinking" : isSpeaking ? "talking" : messages.length === 0 ? "curious" : "happy";

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[hsl(220,25%,8%)] via-[hsl(220,20%,12%)] to-[hsl(220,25%,8%)] relative">
      <MagicalBackground />
      {/* Header - clean, minimal */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        <motion.div className="flex items-center gap-2" initial={{ y: -15, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <ChameleonMascot size="sm" mood={mascotMood} interactive={false} />
          <div>
            <h1 className="text-lg font-black text-primary-foreground tracking-tight">Kidzz</h1>
            {connectionCount > 0 && (
              <motion.div
                className="flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Heart size={10} className="text-kid-pink" />
                <span className="text-[10px] text-primary-foreground/40 font-bold">
                  +{connectionCount} conexão{connectionCount > 1 ? "ões" : ""}
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
        <div className="flex items-center gap-2">
          <motion.span
            className="text-xs text-primary-foreground font-extrabold glass-card px-3 py-1.5 rounded-full"
            whileTap={{ scale: 0.9 }}
          >
            {questionsRemaining()} 💬
          </motion.span>
          {isSuperPremium && onOpenStoryFactory && (
            <motion.button
              onClick={onOpenStoryFactory}
              className="p-2 rounded-xl glass-card text-primary-foreground"
              aria-label="Fábrica de Histórias"
              whileTap={{ scale: 0.9 }}
            >
              <BookOpen size={18} />
            </motion.button>
          )}
          <motion.button
            onClick={() => setShowParentalGate(true)}
            className="p-2 rounded-xl glass-card text-primary-foreground/50"
            aria-label="Controle parental"
            whileTap={{ scale: 0.9 }}
          >
            <Shield size={18} />
          </motion.button>
        </div>
      </header>

      <SubscribeBanner onOpenParentalGate={() => setShowParentalGate(true)} questionsRemaining={questionsRemaining()} isPremium={isPremium} />

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10 min-h-0">
        {isFreeLimitReached ? (
          <div className="flex-1 overflow-y-auto">
            <ConversionScreen childName={childName} onSubscribe={onCheckout} loading={checkoutLoading} />
          </div>
        ) : messages.length === 0 ? (
          /* Empty state - clean and focused */
          <motion.div
            className="flex-1 flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ChameleonMascot size="lg" mood="curious" />
            <motion.h2
              className="text-lg font-black text-primary-foreground text-center mt-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Pergunta qualquer coisa!
            </motion.h2>
            <motion.p
              className="text-primary-foreground/40 text-center text-sm max-w-[240px] mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Pode falar ou digitar — eu adoro responder
            </motion.p>

            {/* Big mic button */}
            <motion.div
              className="mt-8 relative flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            >
              <VoiceInput onResult={handleVoiceResult} disabled={isTyping} large />
            </motion.div>

            <motion.p
              className="text-primary-foreground/30 text-xs mt-6 font-bold"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              🎤 Toque para falar
            </motion.p>

            {/* Suggestion chips */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 mt-4 max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {(SUGGESTIONS[ageRange] || SUGGESTIONS["3-7"]).map((q, i) => (
                <motion.button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="glass-card px-3 py-2 rounded-xl text-xs font-bold text-primary-foreground/70 active:scale-95 transition-transform"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {q}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          /* Chat messages */
          <>
            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                className="flex items-center gap-2 px-4 py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.span
                  className="text-xs text-primary-foreground/50 font-bold flex items-center gap-1"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🤔 Criando a melhor forma de explicar...
                </motion.span>
              </motion.div>
            )}
            <div ref={chatRef} className="flex-1 overflow-y-auto px-4 pb-2">
              <AnimatePresence>
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg.text} isUser={msg.isUser} onSpeak={!msg.isUser ? speakText : undefined} />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Input area - clean */}
      {!isFreeLimitReached && (
        <motion.div
          className="relative z-10 p-4 pb-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-end gap-3">
            <VoiceInput onResult={handleVoiceResult} disabled={isTyping} />
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Pergunta qualquer coisa 😊"
                className="w-full py-3.5 px-5 rounded-2xl glass-card text-primary-foreground text-sm placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-kid-orange/30 transition-all"
              />
            </div>
            <motion.button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              aria-label="Perguntar"
              className="w-12 h-12 rounded-xl kid-gradient-orange shadow-lg flex items-center justify-center disabled:opacity-30 transition-all"
              whileTap={{ scale: 0.9 }}
            >
              <Send size={20} className="text-primary-foreground" />
            </motion.button>
          </div>
        </motion.div>
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

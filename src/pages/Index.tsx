import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Shield } from "lucide-react";
import ChameleonMascot from "@/components/ChameleonMascot";
import ChatBubble from "@/components/ChatBubble";
import ParentalGate from "@/components/ParentalGate";
import ParentalSettings from "@/components/ParentalSettings";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const kidResponses = [
  "Que pergunta legal! 🌟 Sabia que os camaleões mudam de cor para se comunicar? Assim como nós falamos, eles usam cores!",
  "Uau, ótima pergunta! 🦎 O céu é azul porque a luz do sol se espalha na atmosfera e o azul é a cor que mais aparece!",
  "Adorei essa curiosidade! 🌈 Os dinossauros viveram há milhões de anos e alguns eram do tamanho de um ônibus!",
  "Que legal que você quer saber isso! ⭐ A Lua brilha porque reflete a luz do Sol, como um espelho gigante no céu!",
  "Essa é uma pergunta incrível! 🌊 O mar é salgado porque os rios carregam minerais das rochas para o oceano há milhões de anos!",
  "Boa pergunta, amiguinho! 🦋 As borboletas começam como lagartas e depois se transformam dentro de um casulo. É mágico!",
];

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [questionsToday, setQuestionsToday] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const maxFreeQuestions = 5;

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    if (questionsToday >= maxFreeQuestions) return;

    const userMsg: Message = { id: Date.now(), text: text.trim(), isUser: true };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setQuestionsToday((q) => q + 1);

    setTimeout(() => {
      const response = kidResponses[Math.floor(Math.random() * kidResponses.length)];
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: response, isUser: false }]);
      setIsTyping(false);
    }, 1500);
  };

  const isFreeLimitReached = questionsToday >= maxFreeQuestions;

  return (
    <div className="min-h-screen bg-background font-kids flex flex-col overflow-hidden relative">
      {/* Decorative background circles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary/5" />
        <div className="absolute top-1/3 -right-16 w-48 h-48 rounded-full bg-secondary/20" />
        <div className="absolute bottom-20 -left-10 w-32 h-32 rounded-full bg-accent/10" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <motion.h1
            className="text-3xl font-900 text-foreground tracking-tight"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Kidzz
          </motion.h1>
          <motion.span
            className="text-xs font-bold bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            FREE
          </motion.span>
        </div>
        <button
          onClick={() => setShowParentalGate(true)}
          className="p-2.5 rounded-2xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
          aria-label="Controle parental"
        >
          <Shield size={20} />
        </button>
      </header>

      {/* Chameleon + Welcome or Chat */}
      <div className="flex-1 flex flex-col relative z-10 min-h-0">
        {messages.length === 0 ? (
          <motion.div
            className="flex-1 flex flex-col items-center justify-center px-6 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ChameleonMascot className="w-44 h-44" />
            <h2 className="text-2xl font-800 text-foreground text-center">
              Olá! Eu sou o Kiko! 🦎
            </h2>
            <p className="text-muted-foreground text-center text-base max-w-xs">
              Me pergunte qualquer coisa! Eu adoro responder curiosidades!
            </p>
            <p className="text-xs text-muted-foreground/60">
              {maxFreeQuestions - questionsToday} perguntas gratuitas restantes hoje
            </p>
          </motion.div>
        ) : (
          <>
            {/* Mini chameleon header */}
            <div className="flex items-center gap-2 px-5 py-2">
              <ChameleonMascot isTalking={isTyping} className="w-10 h-10" />
              <span className="text-sm font-bold text-foreground">Kiko</span>
              {isTyping && (
                <motion.span
                  className="text-xs text-muted-foreground"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  digitando...
                </motion.span>
              )}
            </div>

            {/* Chat area */}
            <div ref={chatRef} className="flex-1 overflow-y-auto px-4 pb-2">
              <AnimatePresence>
                {messages.map((msg) => (
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
            className="text-center"
          >
            <p className="font-kids text-sm text-muted-foreground mb-3">
              Você usou todas as perguntas gratuitas de hoje! ⭐
            </p>
            <button className="w-full py-4 rounded-3xl bg-kid-orange text-primary-foreground font-kids font-800 text-lg shadow-xl hover:shadow-2xl transition-all active:scale-95">
              ⭐ Seja Premium — Perguntas ilimitadas!
            </button>
          </motion.div>
        ) : (
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Faça uma pergunta ao Kiko..."
                className="w-full py-4 px-5 pr-12 rounded-3xl bg-card border-2 border-border text-foreground font-kids text-base placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-muted-foreground hover:text-primary transition-colors"
                aria-label="Falar pergunta"
              >
                <Mic size={20} />
              </button>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="p-4 rounded-3xl bg-primary text-primary-foreground shadow-lg hover:shadow-xl disabled:opacity-40 disabled:shadow-sm transition-all"
              aria-label="Enviar pergunta"
            >
              <Send size={22} />
            </motion.button>
          </div>
        )}
      </div>

      {/* Parental Gate */}
      <AnimatePresence>
        {showParentalGate && (
          <ParentalGate
            onSuccess={() => {
              setShowParentalGate(false);
              setShowSettings(true);
            }}
            onCancel={() => setShowParentalGate(false)}
          />
        )}
        {showSettings && <ParentalSettings onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Index;

import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  onSpeak?: (text: string) => void;
}

const ChatBubble = ({ message, isUser, onSpeak }: ChatBubbleProps) => {
  const [playing, setPlaying] = useState(false);

  const handleSpeak = async () => {
    if (!onSpeak || playing) return;
    setPlaying(true);
    try {
      await onSpeak(message);
    } finally {
      setPlaying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      {!isUser && (
        <motion.span
          className="text-2xl mr-2 mt-1"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          🦎
        </motion.span>
      )}
      <div className="flex flex-col gap-2 max-w-[80%]">
        <div
          className={`px-4 py-3 text-base leading-relaxed shadow-md ${
            isUser
              ? "bg-secondary text-secondary-foreground rounded-3xl rounded-br-lg"
              : "bg-card/95 text-card-foreground rounded-3xl rounded-bl-lg border-2 border-kid-green/30"
          }`}
        >
          {isUser ? (
            message
          ) : (
            <div className="prose prose-sm max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
              <ReactMarkdown>{message}</ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && onSpeak && (
          <motion.button
            onClick={handleSpeak}
            disabled={playing}
            className={`flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 relative overflow-hidden ${
              playing
                ? "bg-kid-yellow/80 text-foreground"
                : "bg-gradient-to-r from-kid-green to-kid-green/80 text-white hover:from-kid-green/90 hover:to-kid-green/70"
            }`}
            whileTap={{ scale: 0.93 }}
          >
            {/* Sound wave animation when playing */}
            {playing && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-kid-yellow/0 via-kid-yellow/30 to-kid-yellow/0"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {playing ? (
                <div className="flex items-center gap-0.5">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-foreground rounded-full"
                      animate={{ height: [4, 14, 4] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              ) : (
                <Volume2 size={20} />
              )}
              {playing ? "Reproduzindo..." : "🔊 Ouvir resposta"}
            </span>
          </motion.button>
        )}
      </div>
      {isUser && (
        <span className="text-2xl ml-2 mt-1">👧</span>
      )}
    </motion.div>
  );
};

export default ChatBubble;

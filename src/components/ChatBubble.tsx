import { motion } from "framer-motion";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
}

const ChatBubble = ({ message, isUser }: ChatBubbleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      {!isUser && (
        <span className="text-2xl mr-2 mt-1">🦎</span>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 text-base leading-relaxed shadow-md ${
          isUser
            ? "bg-secondary text-secondary-foreground rounded-3xl rounded-br-lg"
            : "bg-card/95 text-card-foreground rounded-3xl rounded-bl-lg border-2 border-kid-green/30"
        }`}
      >
        {message}
      </div>
      {isUser && (
        <span className="text-2xl ml-2 mt-1">👧</span>
      )}
    </motion.div>
  );
};

export default ChatBubble;

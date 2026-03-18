import { motion } from "framer-motion";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
}

const ChatBubble = ({ message, isUser }: ChatBubbleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`max-w-[80%] px-5 py-3 rounded-3xl font-kids text-base leading-relaxed shadow-md ${
          isUser
            ? "bg-accent text-accent-foreground rounded-br-lg"
            : "bg-card text-card-foreground rounded-bl-lg border-2 border-primary/20"
        }`}
      >
        {message}
      </div>
    </motion.div>
  );
};

export default ChatBubble;

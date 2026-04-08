import { motion } from "framer-motion";

const MagicalBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {/* Fireflies */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={`firefly-${i}`}
        className="absolute w-1.5 h-1.5 rounded-full bg-kid-yellow/40"
        style={{
          left: `${10 + i * 11}%`,
          top: `${15 + (i % 4) * 20}%`,
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.15, 0.6, 0.15],
          scale: [0.8, 1.3, 0.8],
        }}
        transition={{
          duration: 3 + i * 0.5,
          repeat: Infinity,
          delay: i * 0.7,
        }}
      />
    ))}
    {/* Ambient glow orbs */}
    <motion.div
      className="absolute -top-4 -right-6 w-32 h-32 rounded-full bg-kid-green/5 blur-2xl"
      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 6, repeat: Infinity }}
    />
    <motion.div
      className="absolute -bottom-10 -left-8 w-40 h-40 rounded-full bg-kid-purple/5 blur-3xl"
      animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 8, repeat: Infinity }}
    />
    <motion.div
      className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-kid-orange/5 blur-2xl"
      animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
      transition={{ duration: 7, repeat: Infinity, delay: 2 }}
    />
  </div>
);

export default MagicalBackground;

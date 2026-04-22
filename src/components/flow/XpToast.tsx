import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

let listeners: Array<(amount: number, label?: string) => void> = [];

export function showXpGained(amount: number, label?: string) {
  listeners.forEach((l) => l(amount, label));
}

export default function XpToast() {
  const [toasts, setToasts] = useState<Array<{ id: number; amount: number; label?: string }>>([]);

  useEffect(() => {
    const handler = (amount: number, label?: string) => {
      const id = Date.now() + Math.random();
      setToasts((p) => [...p, { id, amount, label }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 1800);
    };
    listeners.push(handler);
    return () => { listeners = listeners.filter((l) => l !== handler); };
  }, []);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] flex flex-col items-center gap-1 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -10, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full px-4 py-1.5 shadow-lg flex items-center gap-1.5"
          >
            <Sparkles size={13} className="text-white" />
            <span className="text-[12px] font-black tracking-wide">
              +{t.amount} {t.label || "pontos"}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

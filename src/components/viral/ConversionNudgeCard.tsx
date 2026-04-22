import { motion, AnimatePresence } from "framer-motion";
import { Crown, X } from "lucide-react";

interface Props {
  open: boolean;
  childName: string;
  onUpgrade: () => void;
  onClose: () => void;
}

/**
 * Discreet, parent-facing nudge that surfaces after 2-3 child actions.
 * NOT a paywall — it's an emotional bridge that opens the paywall on tap.
 */
export default function ConversionNudgeCard({ open, childName, onUpgrade, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-32px)] max-w-sm pointer-events-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
        >
          <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 shadow-2xl border border-white/30">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/20 text-white"
              aria-label="Fechar"
            >
              <X size={12} />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
                <Crown size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black text-white leading-tight">
                  {childName} está evoluindo com o Kidzz 💛
                </p>
                <p className="text-[11px] text-white/85 font-medium mt-0.5">
                  Desbloqueie tudo por completo
                </p>
                <motion.button
                  onClick={onUpgrade}
                  className="mt-2 bg-white text-purple-600 font-extrabold text-[12px] px-4 py-1.5 rounded-full shadow-md"
                  whileTap={{ scale: 0.95 }}
                >
                  Ver plano
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

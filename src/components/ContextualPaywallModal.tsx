import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getPaywallCopy, type PaywallContext } from "@/lib/contextualPaywall";

interface Props {
  open: boolean;
  context: PaywallContext;
  meta?: Record<string, string | number>;
  onClose: () => void;
  onLogin?: () => void;
}

const ContextualPaywallModal = ({ open, context, meta, onClose, onLogin }: Props) => {
  const { user, profile, handleCheckout } = useAuth();
  const copy = getPaywallCopy(context, profile?.child_name || "", meta);

  const handleCTA = async () => {
    if (!user && onLogin) {
      onLogin();
      return;
    }
    await handleCheckout("premium_annual");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-4 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden"
            initial={{ y: 60, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 active:scale-90"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>

            {/* Hero */}
            <div className="px-6 pt-7 pb-5 bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="text-5xl mb-2"
              >
                {copy.emoji}
              </motion.div>
              <h2 className="text-lg font-black text-gray-800 leading-snug">{copy.headline}</h2>
              <p className="text-sm text-gray-600 font-medium mt-2 leading-relaxed">
                {copy.subheadline}
              </p>
            </div>

            {/* Plan */}
            <div className="px-6 py-5 space-y-3">
              <div
                className="rounded-2xl p-4 border-2"
                style={{
                  borderColor: "#D4A847",
                  background: "linear-gradient(135deg, rgba(212,168,71,0.08), rgba(240,200,90,0.04))",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                    style={{ background: "linear-gradient(135deg, #D4A847, #F0C85A)" }}>
                    MAIS ESCOLHIDO 💛
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    -33%
                  </span>
                </div>
                <p className="font-extrabold text-gray-900 text-base mt-1">KIDZZ Premium Anual</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-gray-900">R$ 19,90</span>
                  <span className="text-xs font-bold text-gray-400">/mês</span>
                  <span className="text-xs line-through text-gray-400">R$ 24,90</span>
                </div>
                <p className="text-[11px] text-amber-700 font-bold mt-0.5">
                  💰 Economize R$ 60 por ano · Cobrado R$ 238,80/ano
                </p>
                <p className="text-[11px] text-gray-600 font-bold mt-2">✓ {copy.highlight}</p>
              </div>

              <motion.button
                onClick={handleCTA}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-kid-purple to-kid-pink text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                {copy.cta}
              </motion.button>

              <p className="text-center text-[10px] text-gray-400 font-bold">
                🛡️ Garantia de 7 dias · Cancele quando quiser
              </p>
              <button onClick={onClose} className="w-full text-[11px] text-gray-400 font-bold underline-offset-2 hover:underline">
                Agora não
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextualPaywallModal;

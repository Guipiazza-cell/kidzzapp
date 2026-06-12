import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Crown, Music, Globe2, BarChart3 } from "lucide-react";
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
            initial={{ y: 120, scale: 0.85, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 80, scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.9 }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-sm text-white active:scale-90"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>

            {/* Hero — convite dourado */}
            <div
              className="px-6 pt-8 pb-6 text-center relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #F4C430 0%, #E8821A 100%)" }}
            >
              {/* Sparkles decorativos */}
              <motion.div
                className="absolute top-4 left-6 text-white/40"
                animate={{ scale: [1, 1.3, 1], rotate: [0, 15, 0] }}
                transition={{ duration: 2.4, repeat: Infinity }}
              >
                <Sparkles size={14} />
              </motion.div>
              <motion.div
                className="absolute top-8 right-10 text-white/50"
                animate={{ scale: [1, 1.4, 1], rotate: [0, -20, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, delay: 0.4 }}
              >
                <Sparkles size={10} />
              </motion.div>

              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, delay: 0.15 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-sm mb-3 shadow-lg"
              >
                <Crown size={32} className="text-white drop-shadow" fill="white" />
              </motion.div>
              <h2 className="text-xl font-black text-white leading-snug drop-shadow-sm">
                Kidzz quer continuar com você! ✨
              </h2>
              <p className="text-sm text-white/95 font-semibold mt-2 leading-relaxed">
                {copy.subheadline}
              </p>
            </div>

            {/* Corpo */}
            <div className="px-6 py-5 space-y-4">
              {/* Benefícios */}
              <div className="space-y-2.5">
                {[
                  { icon: <Music size={16} className="text-pink-600" />, bg: "bg-pink-100", text: "Músicas e histórias ilimitadas" },
                  { icon: <Globe2 size={16} className="text-sky-600" />, bg: "bg-sky-100", text: "Modo Viagem para qualquer lugar" },
                  { icon: <BarChart3 size={16} className="text-emerald-600" />, bg: "bg-emerald-100", text: "Relatório semanal para os pais" },
                ].map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.25 + i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-9 h-9 rounded-xl ${b.bg} flex items-center justify-center shrink-0`}>
                      {b.icon}
                    </div>
                    <span className="text-sm font-bold text-gray-800">{b.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Card do plano */}
              <div
                className="rounded-2xl p-4 border-2"
                style={{
                  borderColor: "#D4A847",
                  background: "linear-gradient(135deg, rgba(244,196,48,0.10), rgba(232,130,26,0.05))",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                    style={{ background: "linear-gradient(135deg, #D4A847, #F0C85A)" }}
                  >
                    MAIS ESCOLHIDO 💛
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    -33%
                  </span>
                </div>
                <p className="font-extrabold text-gray-900 text-base mt-1">KIDZZ Premium Anual</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-gray-900">R$ 20,83</span>
                  <span className="text-xs font-bold text-gray-400">/mês</span>
                  <span className="text-xs line-through text-gray-400">R$ 24,90</span>
                </div>
                <p className="text-[11px] text-amber-700 font-bold mt-0.5">
                  💰 Economize R$ 48,90 por ano · Cobrado R$ 249,90/ano
                </p>
              </div>

              {/* CTA */}
              <motion.button
                onClick={handleCTA}
                whileTap={{ scale: 0.96 }}
                animate={{ scale: [1, 1.025, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="w-full py-5 rounded-2xl text-white font-black text-base shadow-2xl flex items-center justify-center gap-2 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #6B3FA0 0%, #E8821A 100%)" }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20 pointer-events-none"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />

                <Crown size={20} className="relative" fill="white" />
                <span className="relative">Quero continuar a aventura! 🚀</span>
              </motion.button>

              {/* Footer */}
              <div className="space-y-1.5 pt-1">
                <p className="text-center text-[11px] text-gray-600 font-bold">
                  ✅ Garantia 7 dias · Cancele quando quiser
                </p>
                <p className="text-center text-[11px] text-rose-600 font-extrabold">
                  ❤️ Mais de 1.000 famílias já adoram
                </p>
                <button
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new CustomEvent("kidzz:open-plans"));
                  }}
                  className="w-full py-2 rounded-xl text-amber-700 text-xs font-extrabold active:scale-95 transition-transform"
                >
                  Ver todos os planos →
                </button>
                <button
                  onClick={onClose}
                  className="w-full text-[11px] text-gray-400 font-semibold hover:text-gray-600 py-1"
                >
                  Agora não
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextualPaywallModal;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles, MessageCircle, Heart, Lock, Check, Crown, Zap, BookOpen } from "lucide-react";
import ChameleonMascot from "./ChameleonMascot";
import { useAuth } from "@/contexts/AuthContext";

interface PaywallProps {
  onLogin: () => void;
}

const Paywall = ({ onLogin }: PaywallProps) => {
  const { user, handleCheckout, profile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<"premium" | "super_premium">("premium");
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (!user) {
      onLogin();
      return;
    }
    setLoading(true);
    try {
      await handleCheckout(selectedPlan);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="p-5 space-y-5 max-w-sm mx-auto w-full">
        {/* Emotional header */}
        <div className="text-center pt-2">
          <ChameleonMascot size="md" className="mx-auto" mood="happy" />

          <motion.h2
            className="text-2xl font-black text-primary-foreground mt-4 leading-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Nunca mais trave na frente do seu filho
          </motion.h2>

          <motion.p
            className="text-primary-foreground/60 text-sm mt-2 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Respostas prontas, adaptadas para cada idade, em segundos
          </motion.p>
        </div>

        {/* Benefits */}
        <motion.div
          className="space-y-2.5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { icon: Sparkles, text: "Respostas instantâneas e certeiras", color: "text-kid-yellow" },
            { icon: MessageCircle, text: "Linguagem certa para cada idade", color: "text-kid-green" },
            { icon: Heart, text: "Fábrica de Momentos — missões pai + filho", color: "text-kid-pink" },
            { icon: Shield, text: "Segurança para responder qualquer pergunta", color: "text-kid-blue" },
          ].map((b, i) => (
            <motion.div
              key={b.text}
              className="flex items-center gap-3 glass-card p-3 rounded-xl"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
            >
              <b.icon size={18} className={b.color} />
              <span className="text-sm font-bold text-primary-foreground/80">{b.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-primary-foreground/40 text-xs font-bold">
            +5.000 pais já usam todos os dias ⭐⭐⭐⭐⭐
          </p>
        </motion.div>

        {/* Plans */}
        <div className="space-y-3">
          <motion.button
            onClick={() => setSelectedPlan("premium")}
            className={`w-full text-left rounded-2xl p-4 transition-all glass-card ${
              selectedPlan === "premium" ? "ring-2 ring-kid-purple/60" : ""
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-kid-yellow" />
                <span className="font-extrabold text-primary-foreground text-sm">Plano KIDZZ</span>
                <span className="text-[8px] font-black bg-kid-purple text-primary-foreground px-1.5 py-0.5 rounded-full">POPULAR</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === "premium" ? "bg-kid-purple border-kid-purple" : "border-primary-foreground/20"
              }`}>
                {selectedPlan === "premium" && <Check size={12} className="text-primary-foreground" />}
              </div>
            </div>
            <p className="text-xl font-black text-primary-foreground">
              R$ 14,90<span className="text-xs font-bold text-primary-foreground/40">/mês</span>
            </p>
            <p className="text-xs text-primary-foreground/50 font-bold mt-1">10 perguntas/dia • Narração por voz</p>
          </motion.button>

          <motion.button
            onClick={() => setSelectedPlan("super_premium")}
            className={`w-full text-left rounded-2xl p-4 transition-all glass-card ${
              selectedPlan === "super_premium" ? "ring-2 ring-kid-yellow/60" : ""
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-kid-yellow" />
                <span className="font-extrabold text-primary-foreground text-sm">KIDZZ Premium</span>
                <span className="text-[8px] font-black bg-kid-orange text-primary-foreground px-1.5 py-0.5 rounded-full">COMPLETO</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === "super_premium" ? "bg-kid-yellow border-kid-yellow" : "border-primary-foreground/20"
              }`}>
                {selectedPlan === "super_premium" && <Check size={12} className="text-foreground" />}
              </div>
            </div>
            <p className="text-xl font-black text-primary-foreground">
              R$ 24,90<span className="text-xs font-bold text-primary-foreground/40">/mês</span>
            </p>
            <p className="text-xs text-primary-foreground/50 font-bold mt-1">Tudo do KIDZZ + Histórias + Avatar</p>
          </motion.button>
        </div>

        {/* CTA */}
        <motion.button
          onClick={handleUnlock}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-yellow text-primary-foreground font-extrabold text-lg shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform relative overflow-hidden"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <motion.div
            className="absolute inset-0 bg-primary-foreground/10 rounded-2xl"
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          {!user ? (
            <>
              <Lock size={18} className="relative z-10" />
              <span className="relative z-10">Criar conta e desbloquear</span>
            </>
          ) : (
            <>
              <Sparkles size={18} className="relative z-10" />
              <span className="relative z-10">{loading ? "Abrindo..." : "Desbloquear agora"}</span>
            </>
          )}
        </motion.button>

        {/* Urgency */}
        <motion.p
          className="text-center text-primary-foreground/30 text-[10px] font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          🔓 Acesso liberado hoje • Cancele quando quiser
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Paywall;

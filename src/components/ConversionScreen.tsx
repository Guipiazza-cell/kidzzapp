import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, MessageCircle, Crown, BookOpen, Zap, Check, Heart } from "lucide-react";
import ChameleonMascot from "./ChameleonMascot";

interface ConversionScreenProps {
  childName: string;
  onSubscribe: (plan: "premium" | "super_premium") => void;
  loading?: boolean;
}

const ConversionScreen = ({ childName, onSubscribe, loading }: ConversionScreenProps) => {
  const [selectedPlan, setSelectedPlan] = useState<"premium" | "super_premium">("premium");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-5 space-y-6 max-w-sm mx-auto"
    >
      {/* Emotional header */}
      <div className="text-center pt-4">
        <ChameleonMascot size="md" className="mx-auto" mood="happy" />
        <motion.div
          className="mt-3 flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Heart size={16} className="text-kid-pink" />
          <span className="text-xs font-bold text-primary-foreground/50">+1 conexão com {childName}</span>
        </motion.div>

        <motion.h2
          className="text-xl font-black text-primary-foreground mt-3 leading-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Quer respostas ilimitadas para o {childName}?
        </motion.h2>

        <motion.p
          className="text-primary-foreground/50 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Desbloqueie a experiência completa
        </motion.p>
      </div>

      {/* Plans */}
      <div className="space-y-3">
        {/* Premium */}
        <motion.button
          onClick={() => setSelectedPlan("premium")}
          className={`w-full text-left rounded-2xl p-5 transition-all glass-card ${
            selectedPlan === "premium" ? "ring-2 ring-kid-purple/60" : ""
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown size={18} className="text-kid-yellow" />
              <span className="font-extrabold text-primary-foreground">Plano KIDZZ</span>
              <span className="text-[9px] font-black bg-kid-purple text-primary-foreground px-2 py-0.5 rounded-full">POPULAR</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedPlan === "premium" ? "bg-kid-purple border-kid-purple" : "border-primary-foreground/20"
            }`}>
              {selectedPlan === "premium" && <Check size={12} className="text-primary-foreground" />}
            </div>
          </div>
          <p className="text-2xl font-black text-primary-foreground">
            R$ 14,90<span className="text-xs font-bold text-primary-foreground/40">/mês</span>
          </p>
          <div className="mt-2 space-y-1">
            {["10 perguntas por dia", "Narração por voz", "3 personagens"].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <MessageCircle size={10} className="text-kid-yellow" />
                <span className="text-xs text-primary-foreground/60 font-bold">{f}</span>
              </div>
            ))}
          </div>
        </motion.button>

        {/* Super Premium */}
        <motion.button
          onClick={() => setSelectedPlan("super_premium")}
          className={`w-full text-left rounded-2xl p-5 transition-all relative overflow-hidden glass-card ${
            selectedPlan === "super_premium" ? "ring-2 ring-kid-yellow/60" : ""
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-kid-yellow" />
              <span className="font-extrabold text-primary-foreground">KIDZZ Premium</span>
              <span className="text-[9px] font-black bg-kid-orange text-primary-foreground px-2 py-0.5 rounded-full">COMPLETO</span>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedPlan === "super_premium" ? "bg-kid-yellow border-kid-yellow" : "border-primary-foreground/20"
            }`}>
              {selectedPlan === "super_premium" && <Check size={12} className="text-foreground" />}
            </div>
          </div>
          <p className="text-2xl font-black text-primary-foreground">
            R$ 24,90<span className="text-xs font-bold text-primary-foreground/40">/mês</span>
          </p>
          <div className="mt-2 space-y-1">
            {[
              "Tudo do Plano KIDZZ +",
              "🏭 3 histórias por dia",
              "Avatar personalizado",
              "Todos os personagens",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Sparkles size={10} className="text-kid-yellow" />
                <span className="text-xs text-primary-foreground/60 font-bold">{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-primary-foreground/5 rounded-xl p-2.5 flex items-center gap-2">
            <BookOpen size={14} className="text-kid-yellow flex-shrink-0" />
            <p className="text-[10px] text-primary-foreground/70 font-bold">
              Histórias personalizadas com o nome do seu filho!
            </p>
          </div>
        </motion.button>
      </div>

      {/* CTA */}
      <motion.button
        onClick={() => onSubscribe(selectedPlan)}
        disabled={loading}
        className={`w-full py-4 rounded-2xl text-primary-foreground font-extrabold text-base shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform ${
          selectedPlan === "super_premium"
            ? "bg-gradient-to-r from-kid-yellow via-kid-orange to-kid-red"
            : "kid-gradient-premium"
        }`}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Sparkles size={18} />
        {loading ? "Abrindo..." : "Desbloquear experiência completa"}
      </motion.button>

      <p className="text-primary-foreground/30 text-[10px] text-center">
        Cancele quando quiser • Cobrança mensal • Sem compromisso
      </p>
    </motion.div>
  );
};

export default ConversionScreen;

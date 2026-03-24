import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, MessageCircle, Volume2, Crown, BookOpen, Zap, Check } from "lucide-react";
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 space-y-5"
    >
      <div className="text-center">
        <ChameleonMascot size="md" className="mx-auto" />
        <motion.h2
          className="text-2xl font-extrabold text-white mt-3 drop-shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {childName} adorou conversar com o Kidzz 💛
        </motion.h2>
        <motion.p
          className="text-white/70 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Desbloqueie tudo e continue aprendendo sem limites
        </motion.p>
      </div>

      {/* Plan selection */}
      <div className="space-y-3">
        {/* Premium Plan */}
        <motion.button
          onClick={() => setSelectedPlan("premium")}
          className={`w-full text-left rounded-3xl p-5 border-2 transition-all ${
            selectedPlan === "premium"
              ? "border-kid-purple bg-white/15 backdrop-blur-xl shadow-lg shadow-kid-purple/20"
              : "border-white/20 bg-white/5 backdrop-blur-md"
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crown className="text-kid-yellow" size={20} />
              <span className="font-extrabold text-white text-lg">Plano KIDZZ</span>
              <span className="text-[10px] font-extrabold bg-kid-purple text-white px-2 py-0.5 rounded-full">POPULAR</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedPlan === "premium" ? "bg-kid-purple border-kid-purple" : "border-white/40"
            }`}>
              {selectedPlan === "premium" && <Check size={14} className="text-white" />}
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">R$ 14,90<span className="text-sm font-bold opacity-70">/mês</span></p>
          <div className="mt-3 space-y-1.5">
            {["Perguntas ilimitadas", "Narração por voz amigável", "3 personagens desbloqueados"].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <MessageCircle size={12} className="text-kid-yellow" />
                <span className="text-xs text-white/80 font-bold">{f}</span>
              </div>
            ))}
          </div>
        </motion.button>

        {/* Super Premium Plan */}
        <motion.button
          onClick={() => setSelectedPlan("super_premium")}
          className={`w-full text-left rounded-3xl p-5 border-2 transition-all relative overflow-hidden ${
            selectedPlan === "super_premium"
              ? "border-kid-yellow bg-gradient-to-br from-kid-yellow/20 to-kid-orange/20 backdrop-blur-xl shadow-lg shadow-kid-yellow/20"
              : "border-white/20 bg-white/5 backdrop-blur-md"
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="text-kid-yellow" size={20} />
              <span className="font-extrabold text-white text-lg">KIDZZ Premium</span>
              <span className="text-[10px] font-extrabold bg-kid-orange text-white px-2 py-0.5 rounded-full">COMPLETO</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedPlan === "super_premium" ? "bg-kid-yellow border-kid-yellow" : "border-white/40"
            }`}>
              {selectedPlan === "super_premium" && <Check size={14} className="text-white" />}
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">R$ 24,90<span className="text-sm font-bold opacity-70">/mês</span></p>
          <div className="mt-3 space-y-1.5">
            {[
              "Tudo do Premium +",
              "🏭 Fábrica de Histórias com IA",
              "Avatar personalizado",
              "Todos os personagens exclusivos",
              "Narração por voz Premium",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Sparkles size={12} className="text-kid-yellow" />
                <span className="text-xs text-white/80 font-bold">{f}</span>
              </div>
            ))}
          </div>

          {/* Story Factory highlight */}
          <div className="mt-3 bg-white/10 rounded-2xl p-3 flex items-center gap-2">
            <BookOpen size={18} className="text-kid-yellow flex-shrink-0" />
            <p className="text-[11px] text-white/90 font-bold">
              Crie histórias personalizadas com o nome e avatar do seu filho!
            </p>
          </div>
        </motion.button>
      </div>

      {/* CTA */}
      <motion.button
        onClick={() => onSubscribe(selectedPlan)}
        disabled={loading}
        className={`w-full py-5 rounded-2xl text-white font-extrabold text-lg shadow-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all ${
          selectedPlan === "super_premium"
            ? "bg-gradient-to-r from-kid-yellow via-kid-orange to-kid-red"
            : "kid-gradient-premium"
        }`}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <Sparkles size={22} />
        {loading ? "Abrindo..." : "Quero liberar tudo agora 🚀"}
      </motion.button>

      <p className="text-white/50 text-xs text-center">
        Cancele quando quiser. Cobrança mensal.
      </p>
    </motion.div>
  );
};

export default ConversionScreen;

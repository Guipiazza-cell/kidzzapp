import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Lock, Check, Crown, Zap, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";

interface PaywallProps {
  onLogin: () => void;
  onBack?: () => void;
}

type PlanKey = "kidzz" | "kidzz_annual" | "premium" | "premium_annual";

interface PlanCard {
  key: PlanKey;
  tier: "kidzz" | "premium";
  title: string;
  badge: string;
  period: "Mensal" | "Anual";
  monthlyDisplay: number;
  totalLabel: string;
  savings?: string;
  benefits: string[];
}

const PLANS: PlanCard[] = [
  {
    key: "kidzz",
    tier: "kidzz",
    title: "KIDZZ",
    badge: "Mensal",
    period: "Mensal",
    monthlyDisplay: 19.9,
    totalLabel: "R$ 19,90/mês · cobrado mensalmente",
    benefits: [
      "30 perguntas/dia",
      "3 histórias/dia",
      "Narração por voz",
      "Todos os jogos KIDZZ Play",
    ],
  },
  {
    key: "kidzz_annual",
    tier: "kidzz",
    title: "KIDZZ Anual",
    badge: "Economize 17%",
    period: "Anual",
    monthlyDisplay: 16.58,
    totalLabel: "R$ 199,00/ano · equivale a R$ 16,58/mês",
    savings: "Economize R$ 39,80",
    benefits: [
      "Tudo do plano KIDZZ",
      "2 meses de bônus 🎁",
      "Preço travado por 1 ano",
    ],
  },
  {
    key: "premium",
    tier: "premium",
    title: "Premium",
    badge: "Mensal",
    period: "Mensal",
    monthlyDisplay: 24.9,
    totalLabel: "R$ 24,90/mês · cobrado mensalmente",
    benefits: [
      "60 perguntas/dia",
      "5 histórias/dia",
      "Floresta Musical 🎵",
      "Mundo dos Sonhos completo",
      "Momentos especiais e rotina",
    ],
  },
  {
    key: "premium_annual",
    tier: "premium",
    title: "Premium Anual",
    badge: "Mais escolhido 💛",
    period: "Anual",
    monthlyDisplay: 20.75,
    totalLabel: "R$ 249,00/ano · equivale a R$ 20,75/mês",
    savings: "Economize R$ 49,80",
    benefits: [
      "Tudo do Premium",
      "2 meses de bônus 🎁",
      "Preço travado por 1 ano",
      "Suporte prioritário",
    ],
  },
];

const Paywall = ({ onLogin, onBack }: PaywallProps) => {
  const handleBack = () => {
    haptic("light");
    sfx("click");
    if (onBack) onBack();
    else window.history.back();
  };
  const { user, handleCheckout, profile } = useAuth();
  const childName = profile?.child_name || "seu filho";

  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("premium_annual");
  const [loading, setLoading] = useState(false);

  const selectPlan = (key: PlanKey) => {
    if (key === selectedPlan) return;
    setSelectedPlan(key);
    haptic("light");
    sfx("click");
  };

  const handleUnlock = async () => {
    if (!user) {
      haptic("medium");
      onLogin();
      return;
    }
    haptic("medium");
    sfx("unlock");
    setLoading(true);
    try {
      await handleCheckout(selectedPlan as never);
    } finally {
      setLoading(false);
    }
  };

  const selected = PLANS.find((p) => p.key === selectedPlan)!;

  return (
    <motion.div
      className="flex-1 min-h-0 flex flex-col overflow-y-auto pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 pt-3 pb-2 bg-white/85 backdrop-blur-md border-b border-gray-100">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:scale-90 transition-transform"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
          Escolha seu plano
        </span>
        <div className="w-10" />
      </div>

      <div className="p-5 space-y-4 max-w-sm mx-auto w-full">
        <div className="text-center pt-1">
          <h2 className="text-xl font-black text-gray-800 leading-tight">
            Desbloqueie tudo para {childName} ✨
          </h2>
          <p className="text-xs text-gray-500 font-bold mt-1.5">
            🎁 7 dias de garantia · Cancele quando quiser
          </p>
        </div>

        {/* 4 plan cards */}
        <div className="space-y-3">
          {PLANS.map((plan, idx) => {
            const isPremium = plan.tier === "premium";
            const isSelected = selectedPlan === plan.key;
            const ringColor = isPremium
              ? "ring-2 ring-amber-400"
              : "ring-2 ring-kid-purple/60";
            const bg = isSelected
              ? isPremium
                ? "bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg"
                : "bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg"
              : "glass-card";
            const radioColor = isSelected
              ? isPremium
                ? "bg-amber-500 border-amber-500"
                : "bg-kid-purple border-kid-purple"
              : "border-gray-300";

            return (
              <motion.button
                key={plan.key}
                onClick={() => setSelectedPlan(plan.key)}
                className={`w-full text-left rounded-2xl p-4 transition-all relative overflow-hidden ${bg} ${
                  isSelected ? ringColor : ""
                }`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + idx * 0.04 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`absolute top-0 right-0 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl ${
                    isPremium
                      ? "bg-gradient-to-l from-amber-400 to-yellow-400"
                      : "bg-kid-purple"
                  }`}
                >
                  {plan.badge.toUpperCase()}
                </div>

                <div className="flex items-center justify-between mb-2 mt-3">
                  <div className="flex items-center gap-2">
                    {isPremium ? (
                      <Zap size={18} className="text-amber-500" />
                    ) : (
                      <Crown size={18} className="text-kid-purple" />
                    )}
                    <span className="font-extrabold text-gray-800 text-sm">
                      {plan.title}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${radioColor}`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black text-gray-800">
                    R$ {plan.monthlyDisplay.toFixed(2).replace(".", ",")}
                  </p>
                  <span className="text-xs font-bold text-gray-400">/mês</span>
                </div>
                <p
                  className={`text-[11px] font-bold mt-0.5 ${
                    isPremium ? "text-amber-700" : "text-kid-purple"
                  }`}
                >
                  {plan.totalLabel}
                </p>
                {plan.savings && (
                  <p className="text-[11px] font-extrabold text-emerald-600 mt-0.5">
                    💰 {plan.savings}
                  </p>
                )}

                <ul className="mt-3 space-y-1.5">
                  {plan.benefits.map((b) => (
                    <li
                      key={b}
                      className="text-[11px] font-semibold text-gray-700 flex items-start gap-1.5"
                    >
                      <Check
                        size={12}
                        className={`mt-0.5 flex-shrink-0 ${
                          isPremium ? "text-amber-500" : "text-kid-purple"
                        }`}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.button>
            );
          })}
        </div>

        {/* Social proof */}
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-xs text-gray-600 font-bold leading-relaxed">
            ⭐⭐⭐⭐⭐ <em>"Minha filha de 6 anos me perguntou de volta: pai, e você?"</em>
          </p>
          <p className="text-[10px] text-gray-400 font-bold mt-1">— Ricardo M.</p>
        </div>

        <p className="text-center text-gray-500 text-[10px] font-bold">
          🛡️ Garantia de 7 dias. Se não amar, devolvemos 100%.
        </p>
        <p className="text-center text-gray-400 text-[10px] font-bold pb-2">
          🔓 Acesso liberado hoje • Cancele quando quiser
        </p>
      </div>

      {/* Sticky CTA — always visible above the bottom nav */}
      <div className="sticky bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-3">
        <div className="max-w-sm mx-auto">
          <motion.button
            onClick={handleUnlock}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-kid-purple to-kid-pink text-white font-extrabold text-base shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
            whileTap={{ scale: 0.97 }}
          >
            {!user ? (
              <>
                <Lock size={18} />
                <span>Criar conta e assinar</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>
                  {loading
                    ? "Abrindo checkout..."
                    : `✨ Assinar ${selected.title}`}
                </span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Paywall;

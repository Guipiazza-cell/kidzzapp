import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock, Check, Crown, Zap, ArrowLeft, Loader2, Shield, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";

interface PaywallProps {
  onLogin: () => void;
  onBack?: () => void;
}

type PlanKey = "kidzz" | "kidzz_annual" | "premium" | "premium_annual";
type Billing = "monthly" | "annual";

interface PlanCard {
  key: PlanKey;
  tier: "kidzz" | "premium";
  billing: Billing;
  title: string;
  monthlyDisplay: number;
  totalLabel: string;
  savings?: string;
  benefits: string[];
}

const PLANS: PlanCard[] = [
  {
    key: "kidzz",
    tier: "kidzz",
    billing: "monthly",
    title: "KIDZZ",
    monthlyDisplay: 19.9,
    totalLabel: "Cobrado R$ 19,90/mês",
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
    billing: "annual",
    title: "KIDZZ",
    monthlyDisplay: 16.66,
    totalLabel: "R$ 199,90/ano · 2 meses grátis 🎁",
    savings: "Economize R$ 38,90",
    benefits: [
      "30 perguntas/dia",
      "3 histórias/dia",
      "Narração por voz",
      "Preço travado por 1 ano",
    ],
  },
  {
    key: "premium",
    tier: "premium",
    billing: "monthly",
    title: "Premium",
    monthlyDisplay: 24.9,
    totalLabel: "Cobrado R$ 24,90/mês",
    benefits: [
      "60 perguntas/dia",
      "5 histórias/dia",
      "Floresta Musical 🎵",
      "Mundo dos Sonhos completo 🌙",
      "Momentos especiais e rotina",
    ],
  },
  {
    key: "premium_annual",
    tier: "premium",
    billing: "annual",
    title: "Premium",
    monthlyDisplay: 20.83,
    totalLabel: "R$ 249,90/ano · 2 meses grátis 🎁",
    savings: "Economize R$ 48,90",
    benefits: [
      "60 perguntas/dia",
      "5 histórias/dia",
      "Floresta Musical 🎵",
      "Mundo dos Sonhos completo 🌙",
      "Momentos especiais e rotina",
      "Suporte prioritário ⚡",
    ],
  },
];

const Paywall = ({ onLogin, onBack }: PaywallProps) => {
  const { user, handleCheckout, profile } = useAuth();
  const childName = profile?.child_name || "seu filho";

  const [billing, setBilling] = useState<Billing>("annual");
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("premium_annual");
  const [loading, setLoading] = useState(false);

  const visiblePlans = PLANS.filter((p) => p.billing === billing);

  const handleBack = () => {
    haptic("light");
    sfx("click");
    if (onBack) onBack();
    else window.history.back();
  };

  const switchBilling = (b: Billing) => {
    if (b === billing) return;
    setBilling(b);
    // keep premium tier when switching, prefer recommended
    setSelectedPlan(b === "annual" ? "premium_annual" : "premium");
    haptic("light");
    sfx("click");
  };

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
      // give checkout redirect a moment; if still here, release
      setTimeout(() => setLoading(false), 4000);
    }
  };

  const selected = PLANS.find((p) => p.key === selectedPlan)!;

  return (
    <motion.div
      className="flex-1 min-h-0 flex flex-col overflow-y-auto overscroll-contain"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        WebkitOverflowScrolling: "touch",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)",
      }}
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
          Assinatura KIDZZ
        </span>
        <div className="w-10" />
      </div>

      <div className="p-5 space-y-5 max-w-sm mx-auto w-full">
        {/* Emotional header */}
        <motion.div
          className="text-center pt-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-pink-100 px-3 py-1 rounded-full mb-2">
            <Heart size={11} className="text-pink-600" fill="currentColor" />
            <span className="text-[10px] font-black text-pink-700 uppercase tracking-wider">
              Para a família de {childName}
            </span>
          </div>
          <h2 className="text-2xl font-black text-gray-800 leading-tight">
            Mais momentos juntos ✨
          </h2>
          <p className="text-sm text-gray-600 font-bold mt-2 leading-snug">
            Histórias, perguntas e descobertas sem limites — para acompanhar cada curiosidade.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <div className="relative bg-gray-100 rounded-2xl p-1 flex">
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-white shadow-md"
            animate={{ x: billing === "monthly" ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
          {(["monthly", "annual"] as Billing[]).map((b) => (
            <button
              key={b}
              onClick={() => switchBilling(b)}
              className="relative flex-1 py-2.5 text-xs font-extrabold z-10"
            >
              <span className={billing === b ? "text-gray-800" : "text-gray-500"}>
                {b === "monthly" ? "Mensal" : "Anual"}
              </span>
              {b === "annual" && (
                <span className="ml-1.5 text-[9px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                  -17%
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={billing}
            className="space-y-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {visiblePlans.map((plan, idx) => {
              const isPremium = plan.tier === "premium";
              const isSelected = selectedPlan === plan.key;
              const isRecommended = plan.key === "premium_annual" || (billing === "monthly" && plan.key === "premium");

              return (
                <motion.button
                  key={plan.key}
                  onClick={() => selectPlan(plan.key)}
                  className={`w-full text-left rounded-3xl p-5 relative overflow-hidden transition-all duration-300 ease-premium ${
                    isSelected
                      ? isPremium
                        ? "bg-gradient-to-br from-amber-50 via-white to-pink-50 ring-2 ring-amber-400 shadow-premium-lg"
                        : "bg-gradient-to-br from-purple-50 via-white to-pink-50 ring-2 ring-kid-purple/60 shadow-premium"
                      : "bg-white/80 backdrop-blur-sm ring-1 ring-gray-200"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + idx * 0.06, type: "spring", stiffness: 220, damping: 22 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Recommended ribbon */}
                  {isRecommended && (
                    <div className="absolute top-0 right-0 overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-400 to-pink-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-2xl shadow-lg flex items-center gap-1">
                        <Sparkles size={9} />
                        RECOMENDADO
                      </div>
                    </div>
                  )}

                  {/* Glow on selected */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none rounded-3xl"
                      style={{
                        background: isPremium
                          ? "radial-gradient(circle at 30% 20%, rgba(245,158,11,0.15), transparent 60%)"
                          : "radial-gradient(circle at 30% 20%, rgba(168,85,247,0.15), transparent 60%)",
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}

                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isPremium
                            ? "bg-gradient-to-br from-amber-400 to-pink-500"
                            : "bg-gradient-to-br from-kid-purple to-pink-500"
                        }`}>
                          {isPremium ? (
                            <Zap size={17} className="text-white" fill="white" />
                          ) : (
                            <Crown size={17} className="text-white" fill="white" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-base leading-none">
                            {plan.title}
                          </p>
                          <p className="text-[10px] font-bold text-gray-500 mt-0.5">
                            {plan.billing === "annual" ? "Plano anual" : "Plano mensal"}
                          </p>
                        </div>
                      </div>
                      <motion.div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? isPremium
                              ? "bg-amber-500 border-amber-500"
                              : "bg-kid-purple border-kid-purple"
                            : "border-gray-300 bg-white"
                        }`}
                        animate={isSelected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} className="text-white" />}
                      </motion.div>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-black text-gray-900">
                        R$ {plan.monthlyDisplay.toFixed(2).replace(".", ",")}
                      </p>
                      <span className="text-xs font-bold text-gray-400">/mês</span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 mt-0.5">
                      {plan.totalLabel}
                    </p>
                    {plan.savings && (
                      <div className="inline-flex items-center gap-1 mt-1.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <span className="text-[10px] font-extrabold text-emerald-700">
                          💰 {plan.savings}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                      {plan.benefits.map((b) => (
                        <div
                          key={b}
                          className="text-xs font-semibold text-gray-700 flex items-start gap-2"
                        >
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isPremium ? "bg-amber-100" : "bg-purple-100"
                          }`}>
                            <Check
                              size={10}
                              strokeWidth={3}
                              className={isPremium ? "text-amber-600" : "text-kid-purple"}
                            />
                          </div>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Trust signals */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Shield size={14} className="text-emerald-600" />, text: "Garantia 7 dias" },
            { icon: <Heart size={14} className="text-pink-600" />, text: "Cancele quando quiser" },
            { icon: <Lock size={14} className="text-gray-600" />, text: "Pagamento seguro" },
          ].map((t, i) => (
            <motion.div
              key={i}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-2.5 text-center ring-1 ring-gray-100"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
            >
              <div className="flex justify-center mb-1">{t.icon}</div>
              <p className="text-[9px] font-extrabold text-gray-600 leading-tight">{t.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Social proof */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm ring-1 ring-amber-100 rounded-2xl p-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-amber-400 text-sm">⭐⭐⭐⭐⭐</div>
          <p className="text-xs text-gray-700 font-bold leading-relaxed mt-1.5 italic">
            "Minha filha de 6 anos me perguntou de volta: pai, e você?"
          </p>
          <p className="text-[10px] text-gray-400 font-bold mt-2">— Ricardo, pai do João</p>
        </motion.div>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-3">
        <div className="max-w-sm mx-auto">
          <motion.button
            onClick={handleUnlock}
            disabled={loading}
            className="relative w-full py-4 rounded-2xl bg-gradient-to-r from-kid-purple via-pink-500 to-kid-pink text-white font-extrabold text-base shadow-premium-lg flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98] transition-all duration-200 ease-premium overflow-hidden animate-premium-glow"
            whileTap={{ scale: 0.97 }}
          >
            {!loading && <span className="shine-overlay" aria-hidden />}
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin relative z-10" />
                <span className="relative z-10">Abrindo checkout seguro…</span>
              </>
            ) : !user ? (
              <>
                <Lock size={18} className="relative z-10" />
                <span className="relative z-10">Criar conta e assinar</span>
              </>
            ) : (
              <>
                <Sparkles size={18} className="relative z-10" />
                <span className="relative z-10">
                  Assinar {selected.title} — R$ {selected.monthlyDisplay.toFixed(2).replace(".", ",")}/mês
                </span>
              </>
            )}
          </motion.button>
          <p className="text-center text-[10px] text-gray-400 font-bold mt-2">
            🔒 Pagamento seguro via Stripe · Você não será cobrado hoje sem confirmar
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Paywall;

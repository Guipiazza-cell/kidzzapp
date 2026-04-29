import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles, MessageCircle, Heart, Lock, Check, Crown, Zap, BookOpen, Star, Music2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import pixelImg from "@/assets/pixel-chameleon.png";
import aneImg from "@/assets/ane-chameleon.png";
import musicKidzz from "@/assets/kidzz/music.png";

interface PaywallProps {
  onLogin: () => void;
  onBack?: () => void;
}

type BillingPeriod = "annual" | "monthly";
type PlanKey = "premium" | "premium_annual" | "super_premium";

const Paywall = ({ onLogin, onBack }: PaywallProps) => {
  const handleBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };
  const { user, handleCheckout, profile } = useAuth();
  const childName = profile?.child_name || "seu filho";
  const questionsUsed = profile?.questions_used ?? 0;

  const [showPlans, setShowPlans] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annual");
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("premium_annual");
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (!user) {
      onLogin();
      return;
    }
    setLoading(true);
    try {
      const planForCheckout = selectedPlan === "premium_annual" ? "premium_annual" : selectedPlan;
      await handleCheckout(planForCheckout as any);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period: BillingPeriod) => {
    setBillingPeriod(period);
    if (period === "annual") {
      setSelectedPlan("premium_annual");
    } else {
      setSelectedPlan("premium");
    }
  };

  // Emotional pre-paywall screen
  if (!showPlans) {
    return (
      <motion.div
        className="flex-1 flex flex-col overflow-y-auto relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Soft forest overlay bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-amber-50/30 to-orange-50/50 pointer-events-none" />

        <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
          {/* Mascots */}
          <div className="flex items-end gap-4 mb-4">
            <motion.img
              src={aneImg}
              alt="Ane"
              className="w-16 h-16 object-contain drop-shadow-xl"
              animate={{ y: [0, -5, 0], rotate: [0, -3, 3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.img
              src={pixelImg}
              alt="Pixel"
              className="w-20 h-20 object-contain drop-shadow-xl"
              animate={{ y: [0, -7, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
          </div>

          {/* Headline */}
          <motion.h1
            className="text-2xl font-black text-gray-800 text-center leading-tight"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Você acabou de criar {questionsUsed > 0 ? questionsUsed : "várias"} memórias com {childName} 💛
          </motion.h1>

          <motion.p
            className="text-gray-500 text-center text-sm mt-3 max-w-xs leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Imagine ter todas elas guardadas para sempre...
          </motion.p>

          {/* Floating memory cards */}
          <motion.div
            className="flex gap-3 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {["💬 Conversas", "📖 Histórias", "🌟 Momentos"].map((card, i) => (
              <motion.div
                key={card}
                className="glass-card rounded-xl px-4 py-3 text-center"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
              >
                <span className="text-xs font-bold text-gray-600">{card}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.button
            onClick={() => setShowPlans(true)}
            className="w-full max-w-xs mt-8 py-4 rounded-2xl bg-gradient-to-r from-kid-purple to-kid-pink text-white font-extrabold text-base shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Sparkles size={18} />
            Ver meus planos →
          </motion.button>

          <motion.button
            onClick={() => window.history.back()}
            className="mt-4 text-gray-400 text-xs font-bold underline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            Continuar com limite gratuito
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Plans screen
  return (
    <motion.div
      className="flex-1 flex flex-col overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="p-5 space-y-4 max-w-sm mx-auto w-full">
        {/* Header */}
        <div className="text-center pt-1">
          <motion.h2
            className="text-xl font-black text-gray-800 leading-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Escolha o melhor plano para {childName} ✨
          </motion.h2>
        </div>

        {/* Billing toggle */}
        <motion.div
          className="flex items-center justify-center gap-1 bg-gray-100 rounded-full p-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => handlePeriodChange("monthly")}
            className={`flex-1 py-2 rounded-full text-xs font-extrabold transition-all ${
              billingPeriod === "monthly"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => handlePeriodChange("annual")}
            className={`flex-1 py-2 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1 ${
              billingPeriod === "annual"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500"
            }`}
          >
            Anual
            <span className="text-[8px] font-black text-kid-green bg-kid-green/10 px-1.5 py-0.5 rounded-full">
              -33%
            </span>
          </button>
        </motion.div>

        {/* Plans */}
        <div className="space-y-3">
          {/* Annual / Monthly KIDZZ */}
          <AnimatePresence mode="wait">
            {billingPeriod === "annual" ? (
              <motion.button
                key="annual"
                onClick={() => setSelectedPlan("premium_annual")}
                className={`w-full text-left rounded-2xl p-4 transition-all relative overflow-hidden ${
                  selectedPlan === "premium_annual"
                    ? "ring-2 ring-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg"
                    : "glass-card"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-yellow-400 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl">
                  MELHOR VALOR · Economize 33%
                </div>
                <div className="flex items-center justify-between mb-1 mt-2">
                  <div className="flex items-center gap-2">
                    <Crown size={18} className="text-amber-500" />
                    <span className="font-extrabold text-gray-800 text-sm">KIDZZ Anual</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === "premium_annual" ? "bg-amber-500 border-amber-500" : "border-gray-300"
                  }`}>
                    {selectedPlan === "premium_annual" && <Check size={12} className="text-white" />}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-black text-gray-800">R$ 119,90</p>
                  <span className="text-xs font-bold text-gray-400">/ano</span>
                </div>
                <p className="text-xs text-amber-700 font-bold mt-0.5">
                  = R$ 9,99/mês · <span className="line-through text-gray-400">R$ 14,90/mês</span>
                </p>
                <p className="text-[10px] text-gray-500 font-bold mt-1">10 perguntas/dia • Narração por voz • 3 personagens</p>
              </motion.button>
            ) : (
              <motion.button
                key="monthly-premium"
                onClick={() => setSelectedPlan("premium")}
                className={`w-full text-left rounded-2xl p-4 transition-all glass-card ${
                  selectedPlan === "premium" ? "ring-2 ring-kid-purple/60" : ""
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Crown size={16} className="text-kid-yellow" />
                    <span className="font-extrabold text-gray-800 text-sm">Plano KIDZZ</span>
                    <span className="text-[8px] font-black bg-kid-purple text-white px-1.5 py-0.5 rounded-full">POPULAR</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === "premium" ? "bg-kid-purple border-kid-purple" : "border-gray-300"
                  }`}>
                    {selectedPlan === "premium" && <Check size={12} className="text-white" />}
                  </div>
                </div>
                <p className="text-xl font-black text-gray-800">
                  R$ 14,90<span className="text-xs font-bold text-gray-400">/mês</span>
                </p>
                <p className="text-[10px] text-gray-500 font-bold mt-1">10 perguntas/dia • Narração por voz</p>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Super Premium */}
          <motion.button
            onClick={() => setSelectedPlan("super_premium")}
            className={`w-full text-left rounded-2xl p-4 transition-all glass-card ${
              selectedPlan === "super_premium" ? "ring-2 ring-kid-orange/60" : ""
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-kid-orange" />
                <span className="font-extrabold text-gray-800 text-sm">KIDZZ Premium</span>
                <span className="text-[8px] font-black bg-kid-orange text-white px-1.5 py-0.5 rounded-full">COMPLETO</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === "super_premium" ? "bg-kid-orange border-kid-orange" : "border-gray-300"
              }`}>
                {selectedPlan === "super_premium" && <Check size={12} className="text-white" />}
              </div>
            </div>
            <p className="text-xl font-black text-gray-800">
              R$ 24,90<span className="text-xs font-bold text-gray-400">/mês</span>
            </p>
            <p className="text-[10px] text-gray-500 font-bold mt-1">Tudo do KIDZZ + Histórias + Avatar</p>
          </motion.button>

          {/* Teaser — Floresta Musical em breve */}
          <motion.div
            className="w-full rounded-2xl p-4 relative overflow-hidden border border-emerald-300/40"
            style={{
              background:
                "linear-gradient(135deg, hsl(155 50% 22%) 0%, hsl(170 45% 18%) 50%, hsl(180 40% 14%) 100%)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            {/* Floresta sutil — folhas decorativas */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
              {["🌿", "🍃", "🌱"].map((leaf, i) => (
                <motion.span
                  key={i}
                  className="absolute text-xl"
                  style={{
                    top: `${20 + i * 25}%`,
                    left: `${10 + i * 30}%`,
                  }}
                  animate={{ y: [0, -4, 0], rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                >
                  {leaf}
                </motion.span>
              ))}
            </div>

            <div className="relative flex items-center gap-3">
              {/* Music Soul KIDZZ */}
              <motion.div
                className="relative flex-shrink-0"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{ background: "radial-gradient(circle, hsl(35 90% 60% / 0.5), transparent 70%)" }}
                />
                <img
                  src={musicKidzz}
                  alt="Music Soul KIDZZ"
                  className="relative w-16 h-16 object-contain"
                  style={{ filter: "drop-shadow(0 4px 12px hsl(35 90% 50% / 0.4))" }}
                />
                {/* Notas musicais flutuando */}
                <motion.span
                  className="absolute -top-1 -right-1 text-xs"
                  animate={{ y: [-2, -10, -2], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  🎵
                </motion.span>
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Music2 size={12} className="text-amber-300" />
                  <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest">
                    Em breve
                  </span>
                </div>
                <p className="text-white text-sm font-black leading-tight">
                  🌿 Floresta Musical
                </p>
                <p className="text-emerald-100/80 text-[11px] font-semibold leading-snug mt-0.5">
                  Karaokê, dança e histórias cantadas com {childName}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Free */}
          <motion.div
            className="w-full text-center py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={() => window.history.back()}
              className="text-xs text-gray-400 font-bold underline"
            >
              Continuar grátis (3 perguntas)
            </button>
          </motion.div>
        </div>

        {/* Social proof */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xs text-gray-600 font-bold leading-relaxed">
              ⭐⭐⭐⭐⭐ <em>"Minha filha de 6 anos me perguntou de volta: pai, e você?"</em>
            </p>
            <p className="text-[10px] text-gray-400 font-bold mt-1">— Ricardo M.</p>
          </div>
          <p className="text-center text-gray-400 text-[10px] font-bold">
            Mais de 3.200 famílias já na aventura KIDZZ 🌟
          </p>
        </motion.div>

        {/* CTA */}
        <motion.button
          onClick={handleUnlock}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-kid-purple to-kid-pink text-white font-extrabold text-base shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform relative overflow-hidden"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="absolute inset-0 bg-white/10 rounded-2xl"
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
              <span className="relative z-10">
                {loading
                  ? "Abrindo..."
                  : selectedPlan === "premium_annual"
                    ? "✨ Começar Nossa Aventura Anual"
                    : "Desbloquear agora"}
              </span>
            </>
          )}
        </motion.button>

        {/* Guarantee */}
        <motion.p
          className="text-center text-gray-500 text-[10px] font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          🛡️ Garantia de 7 dias. Se não amar, devolvemos 100%.
        </motion.p>

        <motion.p
          className="text-center text-gray-400 text-[10px] font-bold pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          🔓 Acesso liberado hoje • Cancele quando quiser
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Paywall;

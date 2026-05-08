import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles, MessageCircle, Heart, Lock, Check, Crown, Zap, BookOpen, Star, Music2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import pixelImg from "@/assets/pixel-chameleon.webp";
import aneImg from "@/assets/ane-chameleon.webp";
import musicKidzz from "@/assets/kidzz/music.webp";

interface PaywallProps {
  onLogin: () => void;
  onBack?: () => void;
}

type BillingPeriod = "annual" | "monthly";
type TierKey = "free" | "kidzz" | "premium";
type PlanKey = "kidzz" | "kidzz_annual" | "premium" | "premium_annual";

const PLAN_PRICES = {
  kidzz: { monthly: 19.9, annual: 199, monthlyEquivalent: 16.58 },
  premium: { monthly: 24.9, annual: 249, monthlyEquivalent: 20.75 },
};

const TIER_BENEFITS: Record<TierKey, { title: string; benefits: string[]; tagline: string }> = {
  free: {
    title: "Grátis",
    tagline: "Para experimentar",
    benefits: [
      "3 perguntas (total)",
      "1 história demo",
      "Sem narração por voz",
      "Sem Mundo dos Sonhos",
    ],
  },
  kidzz: {
    title: "KIDZZ",
    tagline: "O essencial mágico",
    benefits: [
      "30 perguntas/dia",
      "3 histórias/dia",
      "Narração por voz",
      "Todos os jogos KIDZZ Play",
      "Conquistas e progressão",
    ],
  },
  premium: {
    title: "Premium",
    tagline: "A experiência completa",
    benefits: [
      "60 perguntas/dia",
      "5 histórias/dia",
      "Floresta Musical 🎵",
      "Mundo dos Sonhos completo",
      "Momentos especiais e rotina",
      "Novos conteúdos antecipados",
    ],
  },
};

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
  const [selectedTier, setSelectedTier] = useState<Exclude<TierKey, "free">>("premium");
  const [loading, setLoading] = useState(false);

  const selectedPlan: PlanKey =
    billingPeriod === "annual"
      ? (selectedTier === "premium" ? "premium_annual" : "kidzz_annual")
      : selectedTier;

  const handleUnlock = async () => {
    if (!user) {
      onLogin();
      return;
    }
    setLoading(true);
    try {
      await handleCheckout(selectedPlan as any);
    } finally {
      setLoading(false);
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

        {/* Top bar with back button */}
        <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-1">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-sm shadow-sm active:scale-90 transition-transform"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Planos KIDZZ</span>
          <div className="w-10" />
        </div>

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
            onClick={handleBack}
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
      {/* Top bar with back button */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 pt-3 pb-2 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:scale-90 transition-transform"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Escolha seu plano</span>
        <div className="w-10" />
      </div>

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
          <motion.p
            className="text-xs text-gray-500 font-bold mt-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            🎁 7 dias de garantia · Cancele quando quiser
          </motion.p>
        </div>

        {/* Billing toggle */}
        <motion.div
          className="flex items-center justify-center gap-1 bg-gray-100 rounded-full p-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`flex-1 py-2 rounded-full text-xs font-extrabold transition-all ${
              billingPeriod === "monthly"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingPeriod("annual")}
            className={`flex-1 py-2 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1 ${
              billingPeriod === "annual"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500"
            }`}
          >
            Anual
            <span className="text-[8px] font-black text-kid-green bg-kid-green/10 px-1.5 py-0.5 rounded-full">
              -17%
            </span>
          </button>
        </motion.div>

        {/* 3-Tier Plans */}
        <div className="space-y-3">
          {/* FREE card (informational) */}
          <motion.div
            className="w-full text-left rounded-2xl p-4 bg-gray-50 border border-gray-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-base">🌱</span>
                <span className="font-extrabold text-gray-700 text-sm">{TIER_BENEFITS.free.title}</span>
                <span className="text-[9px] font-bold text-gray-400">{TIER_BENEFITS.free.tagline}</span>
              </div>
              <span className="text-xs font-black text-gray-500">R$ 0</span>
            </div>
            <ul className="mt-2 space-y-1">
              {TIER_BENEFITS.free.benefits.map((b) => (
                <li key={b} className="text-[11px] font-bold text-gray-500 flex items-start gap-1.5">
                  <span className="mt-0.5">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* KIDZZ + Premium selectable cards */}
          {(["kidzz", "premium"] as const).map((tierKey, idx) => {
            const isPremium = tierKey === "premium";
            const isSelected = selectedTier === tierKey;
            const price = PLAN_PRICES[tierKey];
            const showAnnual = billingPeriod === "annual";
            const displayPrice = showAnnual ? price.monthlyEquivalent : price.monthly;
            const totalAnnual = price.annual;
            const accentBorder = isPremium
              ? (isSelected ? "ring-2 ring-amber-400" : "")
              : (isSelected ? "ring-2 ring-kid-purple/60" : "");
            const accentBg = isSelected && isPremium
              ? "bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg"
              : "glass-card";
            const radioColor = isPremium
              ? (isSelected ? "bg-amber-500 border-amber-500" : "border-gray-300")
              : (isSelected ? "bg-kid-purple border-kid-purple" : "border-gray-300");

            return (
              <motion.button
                key={tierKey}
                onClick={() => setSelectedTier(tierKey)}
                className={`w-full text-left rounded-2xl p-4 transition-all relative overflow-hidden ${accentBg} ${accentBorder}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {isPremium ? (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-yellow-400 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl">
                    MAIS COMPLETO
                  </div>
                ) : (
                  <div className="absolute top-0 right-0 bg-kid-purple text-white text-[8px] font-black px-3 py-1 rounded-bl-xl">
                    POPULAR
                  </div>
                )}

                <div className="flex items-center justify-between mb-2 mt-2">
                  <div className="flex items-center gap-2">
                    {isPremium ? (
                      <Zap size={18} className="text-amber-500" />
                    ) : (
                      <Crown size={18} className="text-kid-purple" />
                    )}
                    <span className="font-extrabold text-gray-800 text-sm">
                      {TIER_BENEFITS[tierKey].title}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400">
                      {TIER_BENEFITS[tierKey].tagline}
                    </span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${radioColor}`}>
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={billingPeriod}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-black text-gray-800">
                        R$ {displayPrice.toFixed(2).replace(".", ",")}
                      </p>
                      <span className="text-xs font-bold text-gray-400">/mês</span>
                    </div>
                    {showAnnual ? (
                      <p className={`text-[11px] font-bold mt-0.5 ${isPremium ? "text-amber-700" : "text-kid-purple"}`}>
                        R$ {totalAnnual.toFixed(2).replace(".", ",")}/ano ·{" "}
                        <span className="line-through text-gray-400">
                          R$ {price.monthly.toFixed(2).replace(".", ",")}/mês
                        </span>
                      </p>
                    ) : (
                      <p className="text-[11px] font-bold mt-0.5 text-gray-400">
                        Cobrado mensalmente
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>

                <ul className="mt-3 space-y-1.5">
                  {TIER_BENEFITS[tierKey].benefits.map((b) => (
                    <li key={b} className="text-[11px] font-semibold text-gray-700 flex items-start gap-1.5">
                      <Check size={12} className={`mt-0.5 flex-shrink-0 ${isPremium ? "text-amber-500" : "text-kid-purple"}`} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.button>
            );
          })}

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
              onClick={handleBack}
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
                  : `✨ Assinar ${selectedTier === "premium" ? "Premium" : "KIDZZ"} ${billingPeriod === "annual" ? "Anual" : "Mensal"}`}
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

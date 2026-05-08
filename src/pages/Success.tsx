import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Check, Crown, Loader2 } from "lucide-react";
import MagicalBackground from "@/components/MagicalBackground";
import pixelImg from "@/assets/pixel-chameleon.webp";
import aneImg from "@/assets/ane-chameleon.webp";

type PlanInfo = {
  label: string;
  emoji: string;
  questionsPerDay: number;
  storiesPerDay: number;
  perks: string[];
};

const PLAN_INFO: Record<string, PlanInfo> = {
  premium: {
    label: "KIDZZ Premium",
    emoji: "👑",
    questionsPerDay: 10,
    storiesPerDay: 3,
    perks: [
      "💬 10 perguntas mágicas por dia",
      "📖 3 histórias personalizadas por dia",
      "🎤 Narração por voz ativada",
      "🌙 Mundo dos Sonhos liberado",
      "🦎 Todos os personagens desbloqueados",
    ],
  },
  super_premium: {
    label: "KIDZZ Premium Completo",
    emoji: "✨",
    questionsPerDay: 10,
    storiesPerDay: 10,
    perks: [
      "💬 10 perguntas mágicas por dia",
      "📖 10 histórias personalizadas por dia",
      "🎤 Narração por voz ativada",
      "🌙 Mundo dos Sonhos liberado",
      "🧪 Avatar customizável (Kidzz Lab)",
      "🚀 Modo Viagem & tudo desbloqueado",
    ],
  },
};

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSubscription, profile, tier } = useAuth();
  const [confirming, setConfirming] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  // Poll for subscription confirmation (webhook can take a few seconds)
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 8;

    const tick = async () => {
      attempts += 1;
      try {
        await refreshSubscription();
      } catch {
        /* noop */
      }
      if (cancelled) return;
      // We re-check via the next render's `tier`/`profile`; stop polling after maxAttempts
      if (attempts >= maxAttempts) {
        if (!cancelled) setConfirming(false);
        return;
      }
      setTimeout(tick, 1500);
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [refreshSubscription]);

  // Detect activation
  useEffect(() => {
    if (profile?.is_premium && !confirmed) {
      setConfirmed(true);
      setConfirming(false);
      // Premium activation feedback
      import("@/lib/sfx").then(({ sfx }) => sfx("reward"));
      import("@/lib/haptics").then(({ haptic }) => haptic("success"));
    }
  }, [profile?.is_premium, confirmed]);

  const childName = profile?.child_name || "seu filho";
  const planKey = tier === "premium" ? "super_premium" : "premium";
  const plan = PLAN_INFO[planKey];

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)]">
      <MagicalBackground />

      {/* Confetti */}
      {confirmed &&
        [...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            className="fixed rounded-full"
            style={{
              width: 7,
              height: 7,
              left: `${5 + i * 7}%`,
              top: `${8 + (i % 4) * 18}%`,
              background:
                i % 3 === 0 ? "#F0C85A" : i % 3 === 1 ? "#EC4899" : "#A855F7",
            }}
            animate={{
              y: [0, -40, 10, 0],
              opacity: [0.3, 1, 0.4, 0.3],
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 2 + i * 0.25, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pt-[max(env(safe-area-inset-top),16px)] pb-8">
        <AnimatePresence mode="wait">
          {confirming && !confirmed ? (
            // CONFIRMING STATE
            <motion.div
              key="confirming"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-end gap-4 mb-5">
                <motion.img
                  src={aneImg}
                  alt="Ane"
                  className="w-16 h-16 object-contain drop-shadow-xl"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.img
                  src={pixelImg}
                  alt="Pixel"
                  className="w-20 h-20 object-contain drop-shadow-xl"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                />
              </div>

              <Loader2 className="w-7 h-7 text-amber-500 animate-spin mb-3" />

              <h2 className="text-xl font-black text-gray-800">
                Ativando sua assinatura...
              </h2>
              <p className="text-gray-600 text-sm font-bold mt-2 max-w-xs">
                Estamos preparando tudo para a aventura de {childName} 💛
              </p>
            </motion.div>
          ) : !confirmed ? (
            // TIMEOUT FALLBACK — give user a manual recheck CTA
            <motion.div
              key="timeout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center max-w-sm"
            >
              <div className="text-5xl mb-3">⏳</div>
              <h2 className="text-xl font-black text-gray-800">
                Quase lá!
              </h2>
              <p className="text-gray-600 text-sm font-bold mt-2">
                O pagamento foi recebido — só estamos ativando sua conta. Isso pode levar alguns segundos.
              </p>
              <motion.button
                onClick={async () => {
                  setConfirming(true);
                  try { await refreshSubscription(); } catch { /* noop */ }
                  setTimeout(() => setConfirming(false), 1500);
                }}
                whileTap={{ scale: 0.96 }}
                className="mt-5 px-5 py-3 rounded-2xl bg-gradient-to-r from-kid-purple via-pink-500 to-kid-pink text-white font-extrabold text-sm shadow-lg min-h-[44px]"
              >
                Verificar novamente 🔄
              </motion.button>
              <button
                onClick={() => navigate("/")}
                className="mt-3 text-xs text-gray-500 font-bold underline"
              >
                Voltar ao início
              </button>
            </motion.div>
          ) : (
            // CONFIRMED STATE
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="flex flex-col items-center w-full max-w-sm"
            >
              {/* Mascots celebrating */}
              <div className="flex items-end gap-4">
                <motion.img
                  src={aneImg}
                  alt="Ane"
                  className="w-16 h-16 object-contain drop-shadow-xl"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: [0, -8, 8, 0] }}
                  transition={{ type: "spring", stiffness: 200 }}
                />
                <motion.img
                  src={pixelImg}
                  alt="Pixel"
                  className="w-20 h-20 object-contain drop-shadow-xl"
                  initial={{ scale: 0, rotate: 20 }}
                  animate={{ scale: 1, rotate: [0, 8, -8, 0] }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                />
              </div>

              {/* Activated badge */}
              <motion.div
                initial={{ scale: 0, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, delay: 0.2 }}
                className="mt-4 inline-flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg"
              >
                <Check size={14} strokeWidth={3} />
                ASSINATURA ATIVADA
              </motion.div>

              {/* Title */}
              <motion.h1
                className="mt-3 text-3xl font-black text-gray-800 leading-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {plan.emoji} Bem-vindo ao {plan.label}!
              </motion.h1>
              <motion.p
                className="mt-2 text-gray-600 text-sm font-bold max-w-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                A aventura de {childName} acaba de ficar ilimitada 🌟
              </motion.p>

              {/* Daily quota highlight */}
              <motion.div
                className="mt-5 w-full grid grid-cols-2 gap-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div
                  className="rounded-2xl p-4 border-2 text-center"
                  style={{
                    borderColor: "#D4A847",
                    background: "linear-gradient(135deg, rgba(212,168,71,0.12), rgba(245,158,11,0.06))",
                  }}
                >
                  <div className="text-3xl font-black text-amber-600 leading-none">
                    {plan.questionsPerDay}
                  </div>
                  <div className="text-[11px] font-extrabold text-amber-800 mt-1 uppercase tracking-wide">
                    perguntas/dia
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 mt-0.5">💬 mágicas</div>
                </div>
                <div
                  className="rounded-2xl p-4 border-2 text-center"
                  style={{
                    borderColor: "#EC4899",
                    background: "linear-gradient(135deg, rgba(236,72,153,0.10), rgba(168,85,247,0.06))",
                  }}
                >
                  <div className="text-3xl font-black text-pink-600 leading-none">
                    {plan.storiesPerDay}
                  </div>
                  <div className="text-[11px] font-extrabold text-pink-800 mt-1 uppercase tracking-wide">
                    histórias/dia
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 mt-0.5">📖 personalizadas</div>
                </div>
              </motion.div>

              {/* Perks list */}
              <motion.div
                className="mt-4 w-full space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {plan.perks.map((perk, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 glass-card rounded-xl px-3 py-2.5"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.75 + i * 0.08 }}
                  >
                    <div className="w-5 h-5 flex-shrink-0 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check size={12} strokeWidth={3} className="text-white" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 text-left">{perk}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.button
                onClick={() => navigate("/")}
                className="mt-6 w-full py-5 rounded-2xl bg-gradient-to-r from-kid-purple via-pink-500 to-kid-pink text-white font-black text-lg shadow-2xl active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/15"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <Sparkles size={20} className="relative" />
                <span className="relative">Começar a aventura! 🚀</span>
              </motion.button>

              <motion.p
                className="mt-3 text-[10px] text-gray-500 font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                🛡️ Garantia 7 dias · Cancele quando quiser
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Success;

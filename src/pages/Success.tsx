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
  kidzz: {
    label: "Kidzz",
    emoji: "⭐",
    questionsPerDay: 0,
    storiesPerDay: 0,
    perks: [
      "💬 Perguntas à vontade",
      "📖 Histórias à vontade com voz",
      "🎵 Floresta Musical",
      "🎮 Todos os jogos Kidzz Play",
      "💛 Memórias",
    ],
  },
  premium: {
    label: "Kidzz Premium",
    emoji: "✨",
    questionsPerDay: 0,
    storiesPerDay: 0,
    perks: [
      "✨ Tudo do Kidzz",
      "🌙 Mundo dos Sonhos",
      "📅 Rotina e Momentos",
      "🧘 KALM completo",
      "🆘 SOS Emocional",
      "🎬 Cinema",
      "👨‍👩‍👧 Relatório para os pais",
    ],
  },
  super_premium: {
    label: "Kidzz Premium",
    emoji: "✨",
    questionsPerDay: 0,
    storiesPerDay: 0,
    perks: [
      "✨ Tudo do Kidzz",
      "🌙 Mundo dos Sonhos",
      "📅 Rotina e Momentos",
      "🧘 KALM completo",
      "🆘 SOS Emocional",
      "🎬 Cinema",
      "👨‍👩‍👧 Relatório para os pais",
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
  // Mostra os perks reais do plano contratado (kidzz ≠ premium).
  const planKey = tier === "premium" ? "premium" : "kidzz";
  const plan = PLAN_INFO[planKey] ?? PLAN_INFO.kidzz;

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)]">
      <MagicalBackground />

      {/* Cinematic radial glow on confirmed */}
      <AnimatePresence>
        {confirmed && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{
              background:
                "radial-gradient(circle at 50% 30%, rgba(245,158,11,0.30), rgba(236,72,153,0.18) 40%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Premium floating particles */}
      {confirmed &&
        [...Array(22)].map((_, i) => {
          const colors = ["#F0C85A", "#EC4899", "#A855F7", "#FBBF24"];
          const size = 4 + (i % 4) * 2;
          return (
            <motion.div
              key={i}
              className="fixed rounded-full pointer-events-none z-[1]"
              style={{
                width: size,
                height: size,
                left: `${(i * 4.5) % 100}%`,
                top: `${10 + ((i * 13) % 70)}%`,
                background: colors[i % 4],
                boxShadow: `0 0 ${size * 2}px ${colors[i % 4]}`,
              }}
              initial={{ opacity: 0, y: 20, scale: 0 }}
              animate={{
                y: [20, -30 - (i % 5) * 8, -60],
                opacity: [0, 0.9, 0],
                scale: [0, 1, 0.6],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3.5 + (i % 4) * 0.4,
                repeat: Infinity,
                delay: (i % 6) * 0.2,
                ease: "easeOut",
              }}
            />
          );
        })}

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pt-[max(env(safe-area-inset-top),16px)] pb-8">
        <AnimatePresence mode="wait">
          {confirming && !confirmed ? (
            // CONFIRMING STATE — graceful, warm
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

              <motion.div
                className="relative w-12 h-12 mb-3"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 rounded-full border-[3px] border-amber-200" />
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-amber-500 border-r-pink-500" />
              </motion.div>

              <h2 className="text-xl font-black text-gray-800">
                Preparando sua aventura…
              </h2>
              <p className="text-gray-600 text-sm font-bold mt-2 max-w-xs">
                Estamos abrindo todos os mundos para {childName} 💛
              </p>
            </motion.div>
          ) : !confirmed ? (
            // TIMEOUT FALLBACK — calm, reassuring
            <motion.div
              key="timeout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center max-w-sm"
            >
              <motion.div
                className="text-5xl mb-3"
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⏳
              </motion.div>
              <h2 className="text-xl font-black text-gray-800">
                Quase lá!
              </h2>
              <p className="text-gray-600 text-sm font-bold mt-2 leading-relaxed">
                O pagamento foi recebido com sucesso 💛 Estamos só ativando sua conta — pode levar alguns segundos.
              </p>
              <motion.button
                onClick={async () => {
                  setConfirming(true);
                  try { await refreshSubscription(); } catch { /* noop */ }
                  setTimeout(() => setConfirming(false), 1500);
                }}
                whileTap={{ scale: 0.96 }}
                className="mt-5 px-5 py-3 rounded-2xl bg-gradient-to-r from-kid-purple via-pink-500 to-kid-pink text-white font-extrabold text-sm shadow-lg min-h-[44px] flex items-center gap-2"
              >
                <Loader2 size={14} /> Verificar novamente
              </motion.button>
              <button
                onClick={() => navigate("/")}
                className="mt-3 text-xs text-gray-500 font-bold underline"
              >
                Voltar ao início
              </button>
            </motion.div>
          ) : (
            // CONFIRMED — cinematic celebration
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="flex flex-col items-center w-full max-w-sm"
            >
              {/* Mascots with celebration burst */}
              <div className="relative">
                {/* Burst rays */}
                <motion.div
                  className="absolute inset-0 -m-8 pointer-events-none"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 origin-top"
                      style={{
                        height: 36,
                        background: "linear-gradient(to bottom, rgba(245,158,11,0.7), transparent)",
                        rotate: `${i * 45}deg`,
                        translateX: "-50%",
                      }}
                      animate={{ scaleY: [0.4, 1, 0.7], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.08 }}
                    />
                  ))}
                </motion.div>

                <div className="relative flex items-end gap-4">
                  <motion.img
                    src={aneImg}
                    alt="Ane"
                    className="w-16 h-16 object-contain drop-shadow-2xl"
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: [0, -10, 10, 0], y: [0, -4, 0] }}
                    transition={{
                      scale: { type: "spring", stiffness: 200 },
                      rotate: { duration: 0.6, delay: 0.3 },
                      y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    }}
                  />
                  <motion.img
                    src={pixelImg}
                    alt="Pixel"
                    className="w-24 h-24 object-contain drop-shadow-2xl"
                    initial={{ scale: 0, rotate: 20 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0], y: [0, -6, 0] }}
                    transition={{
                      scale: { type: "spring", stiffness: 200, delay: 0.1 },
                      rotate: { duration: 0.6, delay: 0.4 },
                      y: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 },
                    }}
                  />
                </div>
              </div>

              {/* Activated badge */}
              <motion.div
                initial={{ scale: 0, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, delay: 0.45 }}
                className="mt-5 inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg"
              >
                <Check size={14} strokeWidth={3} />
                ASSINATURA ATIVADA
              </motion.div>

              {/* Title */}
              <motion.h1
                className="mt-3 text-2xl font-black text-gray-800 leading-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                Bem-vindo ao {plan.label} {plan.emoji}
              </motion.h1>
              <motion.p
                className="mt-2 text-gray-600 text-sm font-bold max-w-xs leading-snug"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
              >
                A aventura de {childName} acaba de ficar ilimitada 🌟
              </motion.p>

              {/* "À vontade" highlight */}
              <motion.div
                className="mt-5 w-full grid grid-cols-2 gap-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
              >
                <div
                  className="rounded-2xl p-4 border-2 text-center backdrop-blur-sm"
                  style={{
                    borderColor: "#D4A847",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.7), rgba(245,158,11,0.08))",
                  }}
                >
                  <div className="text-2xl">💬</div>
                  <div className="text-[12px] font-extrabold text-amber-800 mt-1 uppercase tracking-wide">
                    Perguntas
                  </div>
                  <div className="text-[11px] font-bold text-amber-700 mt-0.5">À vontade</div>
                </div>
                <div
                  className="rounded-2xl p-4 border-2 text-center backdrop-blur-sm"
                  style={{
                    borderColor: "#EC4899",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.7), rgba(236,72,153,0.08))",
                  }}
                >
                  <div className="text-2xl">📖</div>
                  <div className="text-[12px] font-extrabold text-pink-800 mt-1 uppercase tracking-wide">
                    Histórias
                  </div>
                  <div className="text-[11px] font-bold text-pink-700 mt-0.5">À vontade</div>
                </div>
              </motion.div>


              {/* Unlocks list — staggered with checkmark burst */}
              <motion.div
                className="mt-4 w-full space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95 }}
              >
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">
                  Desbloqueado agora
                </p>
                {plan.perks.map((perk, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2.5 bg-white/85 backdrop-blur-sm rounded-xl px-3 py-2.5 ring-1 ring-emerald-100 shadow-sm"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 1 + i * 0.12,
                      type: "spring",
                      stiffness: 220,
                      damping: 22,
                    }}
                  >
                    <motion.div
                      className="w-6 h-6 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: [0, 1.25, 1], rotate: 0 }}
                      transition={{ delay: 1.05 + i * 0.12, duration: 0.4 }}
                    >
                      <Check size={13} strokeWidth={3.5} className="text-white" />
                    </motion.div>
                    <span className="text-sm font-bold text-gray-700 text-left">{perk}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.button
                onClick={() => {
                  import("@/lib/haptics").then(({ haptic }) => haptic("medium"));
                  navigate("/");
                }}
                className="mt-6 w-full py-5 rounded-2xl bg-gradient-to-r from-kid-purple via-pink-500 to-kid-pink text-white font-black text-lg shadow-premium-lg active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden animate-premium-glow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + plan.perks.length * 0.12 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="shine-overlay" aria-hidden />
                <Sparkles size={20} className="relative z-10" />
                <span className="relative z-10">Começar a aventura! 🚀</span>
              </motion.button>

              <motion.p
                className="mt-3 text-[10px] text-gray-500 font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
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

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import KidzzChameleon from "./kidzz/KidzzChameleon";
import OnboardingProgress from "./onboarding/OnboardingProgress";
import OnboardingShell from "./onboarding/OnboardingShell";
import { useAuth } from "@/contexts/AuthContext";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";

const NameOnboarding = () => {
  const { updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Pré-aquece os mascotes que vêm a seguir
  useEffect(() => {
    const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void) => void);
    const run = () => {
      import("./AgeSelection");
      import("./InterestsOnboarding");
      ["explorer", "music", "moon"].forEach((s) => {
        const img = new Image();
        img.src = `/src/assets/kidzz/${s}.webp`;
      });
    };
    if (ric) ric(run); else setTimeout(run, 400);
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Digite seu nome 😊");
      sfx("error");
      haptic("warning");
      return;
    }
    if (saving) return;
    setError("");
    setSaving(true);
    sfx("click");
    haptic("medium");
    try {
      await updateProfile({ child_name: trimmed });
      setSaving(false);
    } catch (e) {
      console.error("NameOnboarding: updateProfile error", e);
      setSaving(false);
      await updateProfile({ child_name: trimmed });
      sfx("error");
    }
  }, [name, saving, updateProfile]);

  const filled = !!name.trim();

  return (
    <OnboardingShell tone="warm">
      {/* Progresso topo */}
      <div className="pt-[max(env(safe-area-inset-top,16px),20px)] px-6">
        <OnboardingProgress step={1} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
        >
          <KidzzChameleon state="cosmic" mood={filled ? "happy" : "curious"} size="xl" interactive showParticles />
        </motion.div>

        <motion.h1
          className="text-[26px] leading-tight font-black text-gray-900 text-center mt-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          Como você se chama? ✨
        </motion.h1>

        <motion.div
          className="w-full max-w-sm mt-7 space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Seu nome"
              className="w-full py-5 px-6 rounded-2xl text-gray-900 text-xl font-bold text-center placeholder:text-gray-400 focus:outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: filled ? "1.5px solid hsl(35 95% 58% / 0.55)" : "1.5px solid rgba(255,255,255,0.7)",
                boxShadow: filled
                  ? "0 0 24px hsl(35 95% 58% / 0.28), inset 0 0 12px hsl(35 95% 58% / 0.06)"
                  : "0 6px 18px rgba(0,0,0,0.06)",
              }}
              autoFocus
              maxLength={20}
            />
          </div>

          {error && (
            <motion.p
              className="text-kid-orange text-center text-sm font-bold"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            onClick={handleSubmit}
            disabled={saving}
            className="relative w-full py-5 rounded-2xl text-white font-extrabold text-lg overflow-hidden min-h-[56px] disabled:opacity-50 active:scale-[0.98]"
            style={{
              background: filled
                ? "linear-gradient(135deg, hsl(35 95% 58%), hsl(28 95% 62%) 60%, hsl(45 95% 62%))"
                : "linear-gradient(135deg, hsl(35 35% 70%), hsl(35 25% 75%))",
              boxShadow: filled
                ? "0 0 28px hsl(35 95% 58% / 0.55), 0 10px 24px rgba(0,0,0,0.15)"
                : "0 6px 16px rgba(0,0,0,0.08)",
              transition: "box-shadow 300ms ease, background 300ms ease",
            }}
            whileTap={{ scale: 0.97 }}
          >
            {filled && (
              <motion.span
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
                }}
                initial={{ x: "-110%" }}
                animate={{ x: "120%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <span className="relative z-10">
              {saving ? "Entrando…" : filled ? "Continuar →" : "Continuar"}
            </span>
          </motion.button>
        </motion.div>

        <motion.p
          className="text-gray-500 text-[10px] mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          🔒 Seguro • Sem anúncios • Feito para crianças
        </motion.p>
      </div>
    </OnboardingShell>
  );
};

export default NameOnboarding;

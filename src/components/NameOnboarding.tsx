import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import OnboardingProgress from "./onboarding/OnboardingProgress";
import { useAuth } from "@/contexts/AuthContext";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";
import nameHero from "@/assets/kidzz/name-onboarding-hero-v2.webp";
import { ONBOARDING_HERO_FRAME, ONBOARDING_GLASS_PANEL } from "./onboarding/heroFrame";

const NameOnboarding = () => {
  const { updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    if (ric) ric(run);
    else setTimeout(run, 400);
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
    } catch (e) {
      console.error("NameOnboarding: updateProfile error", e);
    } finally {
      setSaving(false);
    }
  }, [name, saving, updateProfile]);

  const filled = !!name.trim();

  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-w-[100vw] overflow-hidden bg-[#0B1A12]">
      {/* Mesma arte, asset já em 1080×2340 nítido - preenche sem blur/quadro */}
      <img
        src={nameHero}
        alt="Kidzz - Qual o seu nome?"
        className="absolute inset-0 block h-full w-full select-none pointer-events-none"
        style={ONBOARDING_HERO_FRAME}
        draggable={false}
      />

      <div className="absolute inset-x-0 top-0 z-10 pt-[max(env(safe-area-inset-top,6px),8px)] px-5">
        <OnboardingProgress step={1} showLabel={false} showCounter={false} />
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-0 z-20 px-4"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 10px), 14px)" }}
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="mx-auto w-full max-w-sm space-y-2 rounded-[26px] px-3 py-3"
          style={ONBOARDING_GLASS_PANEL}
        >
          <h1 className="sr-only">Qual o seu nome?</h1>

          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Seu nome"
            className="w-full rounded-2xl py-3.5 px-5 text-center text-lg font-bold text-gray-900 placeholder:text-gray-500/80 focus:outline-none"
            style={{
              background: "rgba(255,255,255,0.8)",
              border: filled
                ? "1.5px solid rgba(232,160,32,0.7)"
                : "1.5px solid rgba(255,255,255,0.7)",
              boxShadow: filled
                ? "0 0 0 3px rgba(232,160,32,0.16)"
                : "0 4px 12px rgba(0,0,0,0.06)",
            }}
            autoFocus
            maxLength={20}
            autoComplete="given-name"
            enterKeyHint="done"
          />

          {error && (
            <motion.p
              className="text-center text-sm font-bold"
              style={{ color: "#FFE0A0" }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="relative min-h-[48px] w-full overflow-hidden rounded-2xl py-3.5 text-base font-extrabold disabled:opacity-50 active:scale-[0.98]"
            style={{
              color: "#fff",
              background: filled
                ? "linear-gradient(135deg, rgba(232,160,32,0.95) 0%, rgba(212,120,26,0.95) 55%, rgba(62,154,82,0.9) 130%)"
                : "rgba(90, 78, 58, 0.45)",
              border: filled
                ? "1px solid rgba(255,220,140,0.45)"
                : "1px solid rgba(255,255,255,0.28)",
              boxShadow: filled
                ? "0 8px 20px rgba(212,120,26,0.32)"
                : "0 4px 12px rgba(0,0,0,0.1)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            {filled && (
              <motion.span
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
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

          <p
            className="text-center text-[10px] font-semibold"
            style={{
              color: "rgba(255,248,230,0.82)",
              textShadow: "0 1px 3px rgba(0,0,0,0.35)",
            }}
          >
            🔒 Seguro • Sem anúncios • Feito para crianças
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NameOnboarding;

import { useState } from "react";
import { motion } from "framer-motion";
import KidzzChameleon from "./kidzz/KidzzChameleon";
import OnboardingProgress from "./onboarding/OnboardingProgress";
import OnboardingShell from "./onboarding/OnboardingShell";
import { useAuth } from "@/contexts/AuthContext";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";

const INTEREST_OPTIONS = [
  { id: "animais", label: "Animais", emoji: "🐾" },
  { id: "espaco", label: "Espaço", emoji: "🚀" },
  { id: "arte", label: "Arte", emoji: "🎨" },
  { id: "natureza", label: "Natureza", emoji: "🌿" },
  { id: "aventura", label: "Aventura", emoji: "⚔️" },
  { id: "musica", label: "Música", emoji: "🎵" },
  { id: "ciencia", label: "Ciência", emoji: "🔬" },
  { id: "oceano", label: "Oceano", emoji: "🌊" },
];

const JUST_COMPLETED_ONBOARDING_KEY = "kidzz_just_completed_onboarding";

const InterestsOnboarding = () => {
  const { profile, updateProfile } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const childName = profile?.child_name || "amigo";

  const toggle = (id: string) => {
    sfx("click");
    haptic("light");
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0 || saving) return;
    setSaving(true);
    sfx("reward");
    haptic("success");
    try {
      try { sessionStorage.setItem(JUST_COMPLETED_ONBOARDING_KEY, "1"); } catch { /* noop */ }
      await updateProfile({ child_interests: selected } as any);
    } catch (e) {
      console.error("InterestsOnboarding error", e);
      setSaving(false);
      sfx("error");
    }
  };

  const ready = selected.length > 0;

  return (
    <OnboardingShell tone="violet">
      <div className="pt-[max(env(safe-area-inset-top,16px),20px)] px-6">
        <OnboardingProgress step={3} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-2 pb-6">
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 12 }}
        >
          <KidzzChameleon state="music" mood={ready ? "happy" : "curious"} size="lg" interactive showParticles />
        </motion.div>

        <motion.h1
          className="text-[26px] font-black text-gray-900 text-center mt-3 leading-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          O que te encanta, {childName}? 🌟
        </motion.h1>

        <div className="w-full max-w-sm mt-5 grid grid-cols-2 gap-3 relative z-20">
          {INTEREST_OPTIONS.map((opt, i) => {
            const isSelected = selected.includes(opt.id);
            return (
              <motion.button
                key={opt.id}
                type="button"
                onClick={() => toggle(opt.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.04 }}
                whileTap={{ scale: 0.94 }}
                className="flex items-center gap-3 p-4 rounded-2xl min-h-[64px]"
                style={{
                  background: isSelected ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: isSelected ? "1.5px solid hsl(35 95% 58%)" : "1.5px solid rgba(255,255,255,0.6)",
                  boxShadow: isSelected
                    ? "0 0 18px hsl(35 95% 58% / 0.4), 0 6px 14px rgba(0,0,0,0.08)"
                    : "0 4px 12px rgba(0,0,0,0.05)",
                  transform: isSelected ? "scale(1.03)" : "scale(1)",
                  transition: "all 240ms cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-sm font-extrabold text-gray-900">{opt.label}</span>
                {isSelected && <span className="ml-auto text-kid-orange font-bold">✓</span>}
              </motion.button>
            );
          })}
        </div>

        <motion.button
          onClick={handleSubmit}
          disabled={!ready || saving}
          className="relative w-full max-w-sm mt-7 py-5 rounded-2xl text-white font-extrabold text-lg overflow-hidden min-h-[56px] disabled:opacity-50 active:scale-[0.98]"
          style={{
            background: ready
              ? "linear-gradient(135deg, hsl(35 95% 58%), hsl(28 95% 62%) 60%, hsl(280 70% 65%))"
              : "linear-gradient(135deg, hsl(35 35% 70%), hsl(35 25% 75%))",
            boxShadow: ready
              ? "0 0 30px hsl(35 95% 58% / 0.55), 0 10px 24px rgba(0,0,0,0.15)"
              : "0 6px 14px rgba(0,0,0,0.08)",
            transition: "box-shadow 300ms ease, background 300ms ease",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          whileTap={{ scale: 0.97 }}
        >
          {ready && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background:
                  "linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)",
              }}
            />
          )}
          <span className="relative z-10">
            {saving ? "Preparando seu mundo…" : ready ? "Continuar →" : "Escolha 1 ou mais"}
          </span>
        </motion.button>
      </div>
    </OnboardingShell>
  );
};

export default InterestsOnboarding;

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import OnboardingProgress from "./onboarding/OnboardingProgress";
import {
  ONBOARDING_GLASS_PANEL,
  ONBOARDING_HERO_CLASS,
  ONBOARDING_HERO_CSS,
} from "./onboarding/heroFrame";
import { useAuth } from "@/contexts/AuthContext";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";
import ageHero from "@/assets/kidzz/age-onboarding-hero.webp";

const AGE_OPTIONS = [
  { range: "0-3", label: "2 - 5 anos" },
  { range: "3-7", label: "6 - 8 anos" },
  { range: "7-10", label: "9 - 12 anos" },
];

const AgeSelection = () => {
  const { updateProfile } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelectAge = useCallback(
    async (range: string) => {
      setSelected(range);
      sfx("click");
      haptic("medium");
      await updateProfile({ age_range: range });
      setTimeout(() => {
        sfx("reward");
        haptic("success");
      }, 450);
    },
    [updateProfile],
  );

  return (
    <div className="kidzz-onb-shell fixed inset-0 w-full h-[100dvh] max-w-[100vw] overflow-hidden">
      <style>{ONBOARDING_HERO_CSS}</style>
      <div className="kidzz-onb-stage">
        <img
          src={ageHero}
          alt="Kidzz - Qual a sua idade?"
          className={ONBOARDING_HERO_CLASS}
          draggable={false}
        />

        <div className="absolute inset-x-0 top-0 z-10 pt-[max(env(safe-area-inset-top,6px),8px)] px-5">
          <OnboardingProgress step={2} showLabel={false} showCounter={false} />
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
            <h1 className="sr-only">Qual a sua idade?</h1>

            {AGE_OPTIONS.map((opt, i) => {
              const isSelected = selected === opt.range;
              return (
                <motion.button
                  key={opt.range}
                  type="button"
                  onClick={() => handleSelectAge(opt.range)}
                  className="relative w-full overflow-hidden rounded-2xl py-4 px-5 text-center font-extrabold text-lg min-h-[52px] active:scale-[0.98]"
                  style={{
                    color: isSelected ? "#1a1a1a" : "#1f1f1f",
                    background: isSelected
                      ? "rgba(255,255,255,0.88)"
                      : "rgba(255,255,255,0.72)",
                    border: isSelected
                      ? "1.5px solid rgba(232,160,32,0.7)"
                      : "1.5px solid rgba(255,255,255,0.65)",
                    boxShadow: isSelected
                      ? "0 0 0 3px rgba(232,160,32,0.16), 0 8px 18px rgba(0,0,0,0.1)"
                      : "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.06 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {opt.label}
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                        style={{
                          background: "linear-gradient(135deg, #E8A020, #3E9A52)",
                          boxShadow: "0 0 12px rgba(232,160,32,0.45)",
                        }}
                      >
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </motion.span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AgeSelection;

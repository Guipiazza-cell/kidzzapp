import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import OnboardingProgress from "./onboarding/OnboardingProgress";
import { ONBOARDING_HERO_FRAME, ONBOARDING_GLASS_PANEL } from "./onboarding/heroFrame";
import { useAuth } from "@/contexts/AuthContext";
import { sfx } from "@/lib/sfx";
import { haptic } from "@/lib/haptics";
import interestsHero from "@/assets/kidzz/interests-onboarding-hero.webp";

import cardAnimais from "@/assets/kidzz/interest-cards/animais.webp";
import cardEspaco from "@/assets/kidzz/interest-cards/espaco.webp";
import cardArte from "@/assets/kidzz/interest-cards/arte.webp";
import cardNatureza from "@/assets/kidzz/interest-cards/natureza.webp";
import cardAventura from "@/assets/kidzz/interest-cards/aventura.webp";
import cardMusica from "@/assets/kidzz/interest-cards/musica.webp";
import cardCiencia from "@/assets/kidzz/interest-cards/ciencia.webp";
import cardOceano from "@/assets/kidzz/interest-cards/oceano.webp";

const INTEREST_OPTIONS = [
  { id: "animais", label: "Animais", bg: cardAnimais },
  { id: "espaco", label: "Espaço", bg: cardEspaco },
  { id: "arte", label: "Arte", bg: cardArte },
  { id: "natureza", label: "Natureza", bg: cardNatureza },
  { id: "aventura", label: "Aventura", bg: cardAventura },
  { id: "musica", label: "Música", bg: cardMusica },
  { id: "ciencia", label: "Ciência", bg: cardCiencia },
  { id: "oceano", label: "Oceano", bg: cardOceano },
] as const;

const JUST_COMPLETED_ONBOARDING_KEY = "kidzz_just_completed_onboarding";

const InterestsOnboarding = () => {
  const { updateProfile } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = useCallback((id: string) => {
    sfx("click");
    haptic("light");
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (selected.length === 0 || saving) return;
    setSaving(true);
    sfx("reward");
    haptic("success");
    try {
      try {
        sessionStorage.setItem(JUST_COMPLETED_ONBOARDING_KEY, "1");
      } catch {
        /* noop */
      }
      await updateProfile({ child_interests: selected } as any);
    } catch (e) {
      console.error("InterestsOnboarding error", e);
    } finally {
      setSaving(false);
    }
  }, [saving, selected, updateProfile]);

  const ready = selected.length > 0;

  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-w-[100vw] overflow-hidden bg-[#0B1A12]">
      <img
        src={interestsHero}
        alt="Kidzz — O que você gosta?"
        className="absolute inset-0 block h-full w-full select-none pointer-events-none"
        style={ONBOARDING_HERO_FRAME}
        draggable={false}
      />

      <div className="absolute inset-x-0 top-0 z-10 pt-[max(env(safe-area-inset-top,6px),8px)] px-5">
        <OnboardingProgress step={3} showLabel={false} showCounter={false} />
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-0 z-20 px-4"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 10px), 14px)" }}
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="mx-auto w-full max-w-sm rounded-[22px] px-2.5 py-2.5"
          style={ONBOARDING_GLASS_PANEL}
        >
          <h1 className="sr-only">O que você gosta?</h1>

          <div className="grid grid-cols-2 gap-1.5">
            {INTEREST_OPTIONS.map((opt, i) => {
              const isSelected = selected.includes(opt.id);
              return (
                <motion.button
                  key={opt.id}
                  type="button"
                  onClick={() => toggle(opt.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="relative overflow-hidden rounded-xl min-h-[44px] text-center"
                  style={{
                    border: isSelected
                      ? "1.5px solid rgba(255,210,120,0.95)"
                      : "1px solid rgba(255,255,255,0.35)",
                    boxShadow: isSelected
                      ? "0 0 0 2px rgba(232,160,32,0.22), 0 6px 14px rgba(0,0,0,0.18)"
                      : "0 3px 10px rgba(0,0,0,0.12)",
                  }}
                >
                  <img
                    src={opt.bg}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 h-full w-full object-cover"
                    draggable={false}
                  />
                  {/* Legibilidade do label */}
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background: isSelected
                        ? "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.42) 100%)"
                        : "linear-gradient(180deg, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.5) 100%)",
                    }}
                  />
                  <span
                    className="relative z-10 block px-1.5 py-2.5 text-[13px] font-black tracking-wide"
                    style={{
                      color: "#fff",
                      textShadow: "0 1px 6px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.4)",
                    }}
                  >
                    {opt.label}
                  </span>
                  {isSelected && (
                    <span
                      className="absolute top-1 right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black"
                      style={{
                        background: "linear-gradient(135deg, #E8A020, #3E9A52)",
                        color: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={!ready || saving}
            className="relative mt-2 w-full overflow-hidden rounded-xl py-3 text-[15px] font-extrabold min-h-[44px] disabled:opacity-50 active:scale-[0.98]"
            style={{
              color: "#fff",
              background: ready
                ? "linear-gradient(135deg, rgba(232,160,32,0.95) 0%, rgba(212,120,26,0.95) 55%, rgba(123,44,191,0.9) 130%)"
                : "rgba(90, 78, 58, 0.45)",
              border: ready
                ? "1px solid rgba(255,220,140,0.45)"
                : "1px solid rgba(255,255,255,0.28)",
              boxShadow: ready
                ? "0 8px 20px rgba(212,120,26,0.32)"
                : "0 4px 12px rgba(0,0,0,0.1)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            {ready && (
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
              {saving ? "Preparando…" : ready ? "Continuar →" : "Escolha 1 ou mais"}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default InterestsOnboarding;

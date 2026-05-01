/* ── KidzzStatesIntro ────────────────────────────────────────────
   Tela de onboarding (primeira vez) que apresenta os 4 estados do Kidzz.
   Persiste em localStorage (kidzz_states_intro_seen).
*/

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KidzzCharacter, { KIDZZ_MOOD_META, type KidzzCharacterMood } from "./KidzzCharacter";

const ORDER: KidzzCharacterMood[] = ["curious", "excited", "calm", "adventurous"];

interface Props {
  onDone: () => void;
}

const KidzzStatesIntro = ({ onDone }: Props) => {
  const [step, setStep] = useState(0);
  const isLast = step === ORDER.length - 1;
  const mood = ORDER[step];
  const meta = KIDZZ_MOOD_META[mood];

  const next = () => {
    if (isLast) {
      try { localStorage.setItem("kidzz_states_intro_seen", "1"); } catch {}
      onDone();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+24px)] pb-[calc(env(safe-area-inset-bottom)+24px)]"
      style={{
        background: `linear-gradient(180deg, ${meta.color}33 0%, #1a1530 60%, #0d0a1f 100%)`,
        transition: "background 600ms ease",
      }}
    >
      {/* Header */}
      <div className="text-center max-w-sm">
        <motion.p
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-[11px] font-black tracking-[0.2em] uppercase text-white/70"
        >
          Conheça o Kidzz
        </motion.p>
        <motion.h1
          key={`title-${step}`}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl sm:text-3xl font-black text-white mt-2 leading-tight"
        >
          O Kidzz tem 4 formas! <br /> Descubra todas! ✨
        </motion.h1>
      </div>

      {/* Personagem */}
      <div className="flex flex-col items-center gap-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={mood}
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          >
            <KidzzCharacter mood={mood} size="hero" interactive={false} />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`info-${mood}`}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="text-center max-w-xs"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black text-white shadow-lg"
              style={{ background: meta.color }}
            >
              <span>{meta.emoji}</span>
              <span>Kidzz {meta.label}</span>
            </div>
            <p className="text-white text-base font-bold mt-3">{meta.description}</p>
            <p className="text-white/70 text-xs font-semibold mt-1">{meta.usedIn}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="w-full max-w-sm space-y-4">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {ORDER.map((m, i) => (
            <motion.button
              key={m}
              onClick={() => setStep(i)}
              className="h-2 rounded-full"
              animate={{
                width: i === step ? 28 : 8,
                backgroundColor: i === step ? KIDZZ_MOOD_META[m].color : "rgba(255,255,255,0.3)",
              }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              aria-label={`Ir para ${KIDZZ_MOOD_META[m].label}`}
            />
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={next}
          className="w-full py-4 rounded-2xl text-white font-black text-base shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
            minHeight: 52,
          }}
        >
          {isLast ? "Vamos brincar! 🚀" : "Próxima forma →"}
        </motion.button>

        {!isLast && (
          <button
            onClick={() => {
              try { localStorage.setItem("kidzz_states_intro_seen", "1"); } catch {}
              onDone();
            }}
            className="w-full text-center text-xs text-white/60 font-semibold py-1"
          >
            Pular apresentação
          </button>
        )}
      </div>
    </div>
  );
};

export default KidzzStatesIntro;

export const hasSeenKidzzStatesIntro = (): boolean => {
  try { return localStorage.getItem("kidzz_states_intro_seen") === "1"; } catch { return false; }
};

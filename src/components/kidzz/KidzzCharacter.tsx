/* ── KidzzCharacter ──────────────────────────────────────────────
   Wrapper semântico que padroniza os 4 estados narrativos do Kidzz.
   Reaproveita KidzzChameleon (já contém os assets e animações).

   Mapeamento:
     curious     🔵 cosmic  → Perguntas, Pergunta do Dia, Modo Viagem
     excited     🟡 music   → Música, Karaokê, Dança, celebrações
     calm        🟣 moon    → Sonhos, Rotina (noite), Histórias para dormir
     adventurous 🟢 play    → Brincar, Atividades, Jogos
*/

import { forwardRef } from "react";
import KidzzChameleon, { type KidzzState, type KidzzMood } from "./KidzzChameleon";

export type KidzzCharacterMood = "curious" | "excited" | "calm" | "adventurous";

interface Props {
  mood: KidzzCharacterMood;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  interactive?: boolean;
  showParticles?: boolean;
  onTap?: () => void;
  /** override do mood interno do KidzzChameleon (idle/talking/thinking…) */
  internalMood?: KidzzMood;
}

const moodToState: Record<KidzzCharacterMood, KidzzState> = {
  curious: "cosmic",
  excited: "music",
  calm: "moon",
  adventurous: "play",
};

const moodToInternal: Record<KidzzCharacterMood, KidzzMood> = {
  curious: "curious",
  excited: "happy",
  calm: "calm",
  adventurous: "happy",
};

export const KIDZZ_MOOD_META: Record<
  KidzzCharacterMood,
  { label: string; emoji: string; color: string; description: string; usedIn: string }
> = {
  curious: {
    label: "Curioso",
    emoji: "🔵",
    color: "#5B7CFA",
    description: "Olhos brilhando, pronto para descobrir o mundo.",
    usedIn: "Perguntas · Modo Viagem",
  },
  excited: {
    label: "Animado",
    emoji: "🟡",
    color: "#F4C430",
    description: "Cantando, dançando, vibrando alto.",
    usedIn: "Música · Karaokê · Celebrações",
  },
  calm: {
    label: "Calmo",
    emoji: "🟣",
    color: "#9B7BD4",
    description: "Respirando devagar, prontinho pra dormir.",
    usedIn: "Sonhos · Rotina da Noite",
  },
  adventurous: {
    label: "Aventureiro",
    emoji: "🟢",
    color: "#5BC47B",
    description: "Braços abertos, energia pura de brincar.",
    usedIn: "Brincar · Jogos · Atividades",
  },
};

const KidzzCharacter = forwardRef<HTMLDivElement, Props>(
  ({ mood, size = "lg", className, interactive = true, showParticles = true, onTap, internalMood }, ref) => {
    return (
      <KidzzChameleon
        ref={ref}
        state={moodToState[mood]}
        mood={internalMood ?? moodToInternal[mood]}
        size={size}
        className={className}
        interactive={interactive}
        showParticles={showParticles}
        onTap={onTap}
      />
    );
  }
);

KidzzCharacter.displayName = "KidzzCharacter";

export default KidzzCharacter;

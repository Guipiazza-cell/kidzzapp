import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { CharExpression, CharEnergy } from "@/components/lab/DynamicCharacter";

export interface CharacterProfile {
  color_from: string;
  color_to: string;
  expression: CharExpression;
  outfit: string;
  energy_mode: CharEnergy;
  evolution_points: number;
  level: number;
  dominant_trait: string;
  emotional_state: string;
  stories_count: number;
  questions_count: number;
  games_count: number;
  moments_count: number;
  unlocked_outfits: string[];
  unlocked_colors: string[];
  last_feedback: string | null;
}

const DEFAULT_CHAR: CharacterProfile = {
  color_from: "#A855F7",
  color_to: "#7C3AED",
  expression: "calm",
  outfit: "none",
  energy_mode: "medium",
  evolution_points: 0,
  level: 1,
  dominant_trait: "calm",
  emotional_state: "calm",
  stories_count: 0,
  questions_count: 0,
  games_count: 0,
  moments_count: 0,
  unlocked_outfits: ["none", "labcoat"],
  unlocked_colors: ["purple"],
  last_feedback: null,
};

const GUEST_KEY = "kidzz_char_profile";

const TRAIT_THRESHOLDS = [
  { trait: "calm", field: "stories_count" as const },
  { trait: "intelligence", field: "questions_count" as const },
  { trait: "energy", field: "games_count" as const },
  { trait: "bonding", field: "moments_count" as const },
];

const EVOLUTION_UNLOCKS: { points: number; type: "outfit" | "color"; id: string }[] = [
  { points: 5, type: "color", id: "sapphire" },
  { points: 10, type: "color", id: "emerald" },
  { points: 20, type: "outfit", id: "crown" },
  { points: 35, type: "color", id: "ruby" },
  { points: 50, type: "outfit", id: "space" },
  { points: 75, type: "color", id: "gold" },
  { points: 100, type: "color", id: "cosmic" },
];

const FEEDBACK_MESSAGES: Record<string, string[]> = {
  calm: [
    "Estou mais calmo hoje 🌙",
    "Gosto quando ouvimos histórias juntos",
    "Me sinto tranquilo ao seu lado",
  ],
  intelligence: [
    "Aprendemos algo novo! 🧠",
    "Suas perguntas me fazem pensar",
    "Estou ficando mais esperto!",
  ],
  energy: [
    "Adoro quando jogamos juntos! 🎮",
    "Estou cheio de energia!",
    "Vamos jogar de novo?",
  ],
  bonding: [
    "Gosto quando estamos juntos ❤️",
    "Me sinto especial com você",
    "Somos uma equipe incrível!",
  ],
};

function computeDominantTrait(char: CharacterProfile): string {
  const counts = TRAIT_THRESHOLDS.map((t) => ({
    trait: t.trait,
    count: char[t.field],
  }));
  counts.sort((a, b) => b.count - a.count);
  return counts[0].count > 0 ? counts[0].trait : "calm";
}

function computeLevel(points: number): number {
  if (points >= 100) return 5;
  if (points >= 50) return 4;
  if (points >= 20) return 3;
  if (points >= 10) return 2;
  return 1;
}

function computeEmotionalState(char: CharacterProfile): CharExpression {
  const trait = char.dominant_trait;
  if (trait === "calm") return "calm";
  if (trait === "intelligence") return "curious";
  if (trait === "energy") return "happy";
  if (trait === "bonding") return "happy";
  return "calm";
}

function computeEnergyFromUsage(char: CharacterProfile): CharEnergy {
  const total = char.stories_count + char.questions_count + char.games_count + char.moments_count;
  if (total >= 50) return "ultra";
  if (total >= 25) return "high";
  if (total >= 10) return "medium";
  return "low";
}

function computeColorShift(char: CharacterProfile): { from: string; to: string } {
  // Subtle shifts based on dominant trait — only if user hasn't customized
  const trait = char.dominant_trait;
  const shifts: Record<string, { from: string; to: string }> = {
    calm: { from: "#818CF8", to: "#6366F1" },     // softer indigo
    intelligence: { from: "#A855F7", to: "#7C3AED" }, // purple
    energy: { from: "#F59E0B", to: "#D97706" },   // amber
    bonding: { from: "#F472B6", to: "#EC4899" },   // pink/warm
  };
  return shifts[trait] || { from: char.color_from, to: char.color_to };
}

function getUnlocks(points: number): { outfits: string[]; colors: string[] } {
  const outfits = ["none", "labcoat"];
  const colors = ["purple"];
  for (const u of EVOLUTION_UNLOCKS) {
    if (points >= u.points) {
      if (u.type === "outfit" && !outfits.includes(u.id)) outfits.push(u.id);
      if (u.type === "color" && !colors.includes(u.id)) colors.push(u.id);
    }
  }
  return { outfits, colors };
}

function getFeedback(trait: string): string {
  const msgs = FEEDBACK_MESSAGES[trait] || FEEDBACK_MESSAGES.calm;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

export function useCharacterEvolution() {
  const { user } = useAuth();
  const [character, setCharacter] = useState<CharacterProfile>(DEFAULT_CHAR);
  const [loaded, setLoaded] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Load
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (user) {
        const { data } = await supabase
          .from("character_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (mounted) {
          if (data) {
            setCharacter({
              color_from: data.color_from,
              color_to: data.color_to,
              expression: data.expression as CharExpression,
              outfit: data.outfit,
              energy_mode: data.energy_mode as CharEnergy,
              evolution_points: data.evolution_points,
              level: data.level,
              dominant_trait: data.dominant_trait,
              emotional_state: data.emotional_state,
              stories_count: data.stories_count,
              questions_count: data.questions_count,
              games_count: data.games_count,
              moments_count: data.moments_count,
              unlocked_outfits: data.unlocked_outfits as string[],
              unlocked_colors: data.unlocked_colors as string[],
              last_feedback: data.last_feedback,
            });
          } else {
            // Create initial record
            await supabase.from("character_profiles").insert({ user_id: user.id });
          }
          setLoaded(true);
        }
      } else {
        // Guest
        try {
          const stored = localStorage.getItem(GUEST_KEY);
          if (stored) setCharacter(JSON.parse(stored));
        } catch { /* ignore */ }
        if (mounted) setLoaded(true);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  // Debounced save
  const persistCharacter = useCallback((updated: CharacterProfile) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      if (user) {
        supabase
          .from("character_profiles")
          .update({
            color_from: updated.color_from,
            color_to: updated.color_to,
            expression: updated.expression,
            outfit: updated.outfit,
            energy_mode: updated.energy_mode,
            evolution_points: updated.evolution_points,
            level: updated.level,
            dominant_trait: updated.dominant_trait,
            emotional_state: updated.emotional_state,
            stories_count: updated.stories_count,
            questions_count: updated.questions_count,
            games_count: updated.games_count,
            moments_count: updated.moments_count,
            unlocked_outfits: updated.unlocked_outfits,
            unlocked_colors: updated.unlocked_colors,
            last_feedback: updated.last_feedback,
          } as any)
          .eq("user_id", user.id)
          .then(() => {});
      } else {
        localStorage.setItem(GUEST_KEY, JSON.stringify(updated));
      }
    }, 500);
  }, [user]);

  const evolve = useCallback((action: "story" | "question" | "game" | "moment") => {
    setCharacter((prev) => {
      const fieldMap = {
        story: "stories_count",
        question: "questions_count",
        game: "games_count",
        moment: "moments_count",
      } as const;

      const field = fieldMap[action];
      const updated = { ...prev, [field]: prev[field] + 1, evolution_points: prev.evolution_points + 1 };

      // Recompute derived state
      updated.dominant_trait = computeDominantTrait(updated);
      updated.level = computeLevel(updated.evolution_points);
      updated.emotional_state = computeEmotionalState(updated);

      // Auto-evolve energy based on total usage
      updated.energy_mode = computeEnergyFromUsage(updated);

      // Auto color shift based on trait
      const autoColors = computeColorShift(updated);
      updated.color_from = autoColors.from;
      updated.color_to = autoColors.to;

      // Unlock progression
      const unlocks = getUnlocks(updated.evolution_points);
      updated.unlocked_outfits = unlocks.outfits;
      updated.unlocked_colors = unlocks.colors;

      // Expression follows emotional state
      updated.expression = computeEmotionalState(updated);

      // Feedback
      const fb = getFeedback(updated.dominant_trait);
      updated.last_feedback = fb;

      persistCharacter(updated);
      return updated;
    });
  }, [persistCharacter]);

  const showFeedback = useCallback(() => {
    if (character.last_feedback) {
      setFeedback(character.last_feedback);
      setTimeout(() => setFeedback(null), 4000);
    }
  }, [character.last_feedback]);

  // Customize (from Lab)
  const customize = useCallback((updates: Partial<CharacterProfile>) => {
    setCharacter((prev) => {
      const updated = { ...prev, ...updates };
      persistCharacter(updated);
      return updated;
    });
  }, [persistCharacter]);

  return { character, loaded, evolve, customize, feedback, showFeedback };
}

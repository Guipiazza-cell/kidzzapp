/* ── useAchievementSync ──
   Central engine for all achievement-related events.
   Every game/mission/karaoke/travel completion routes through here so the
   profile counters stay in sync and the right toast is fired when a badge
   threshold is crossed.

   Why a hook (not a global): we need access to AuthContext + sonner toast,
   both of which require React tree.
*/

import { useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export type AchievementEvent =
  | "question"          // a question was answered (increments)
  | "question-checkonly"// already-incremented elsewhere, just check badges
  | "story"             // a story was generated
  | "mission"           // a connection mission was completed
  | "game"              // a mini-game ended
  | "karaoke"           // sang a karaoke verse
  | "travel"            // travel mode question
  | "music"             // music creation
  | "dream";            // dream story listened

const UNLOCK_KEY = "kidzz_unlocked_badges";

// Mirror of badges in AchievementsScreen (kept in sync manually for toast labels)
const QUESTION_BADGES = [
  { id: "first-question", title: "Primeira Pergunta", emoji: "💬", th: 1 },
  { id: "curious-starter", title: "Conversador Iniciante", emoji: "🗣️", th: 3 },
  { id: "explorer", title: "Explorador Curioso", emoji: "🔍", th: 10 },
  { id: "genius", title: "Mente Brilhante", emoji: "🧠", th: 20 },
  { id: "master", title: "Perguntador Oficial", emoji: "⭐", th: 50 },
];
const STORY_BADGES = [
  { id: "first-story", title: "Contador de Histórias", emoji: "📖", th: 1 },
  { id: "storyteller", title: "Autor Criativo", emoji: "✍️", th: 5 },
];
const STREAK_BADGES = [
  { id: "streak-3", title: "Fogo na Curiosidade", emoji: "🔥", th: 3 },
  { id: "streak-7", title: "Semana de Sabedoria", emoji: "🌟", th: 7 },
  { id: "streak-14", title: "Família Curiosa", emoji: "💛", th: 14 },
  { id: "streak-30", title: "Mês de Descobertas", emoji: "🏆", th: 30 },
];
const POINTS_BADGES = [
  { id: "points-50", title: "Coletor de Pontos", emoji: "💎", th: 50 },
];

const loadUnlocked = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(UNLOCK_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const saveUnlocked = (set: Set<string>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(UNLOCK_KEY, JSON.stringify([...set]));
};

const fireBadgeToast = (title: string, emoji: string) => {
  toast.success(`${emoji} Conquista desbloqueada!`, {
    description: title,
    duration: 4000,
  });
  // small badge confetti burst
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      startVelocity: 28,
      origin: { y: 0.3 },
      colors: ["#FFD700", "#FFA500", "#FF6B9D", "#A855F7"],
      scalar: 0.9,
    });
  } catch { /* noop */ }
};

const checkBadges = (
  unlocked: Set<string>,
  questionsUsed: number,
  storiesUsed: number,
  streakDays: number,
  points: number
) => {
  let changed = false;
  const checkList = (
    list: { id: string; title: string; emoji: string; th: number }[],
    value: number
  ) => {
    for (const b of list) {
      if (value >= b.th && !unlocked.has(b.id)) {
        unlocked.add(b.id);
        changed = true;
        // stagger toasts so multiple unlocks don't pile up instantly
        setTimeout(() => fireBadgeToast(b.title, b.emoji), 200 * unlocked.size);
      }
    }
  };
  checkList(QUESTION_BADGES, questionsUsed);
  checkList(STORY_BADGES, storiesUsed);
  checkList(STREAK_BADGES, streakDays);
  checkList(POINTS_BADGES, points);
  if (changed) saveUnlocked(unlocked);
};

export function useAchievementSync() {
  const { profile, user, updateProfile, incrementQuestions, incrementStories } = useAuth();
  const inFlight = useRef(false);

  const trackEvent = useCallback(
    async (event: AchievementEvent) => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        // Map events to profile counters
        if (event === "question" || event === "travel" || event === "karaoke" || event === "music") {
          // these all count as "engagement events" — drive points + streak
          await incrementQuestions();
        } else if (event === "question-checkonly") {
          // GeneratingScreen already incremented; just re-check badges below
        } else if (event === "story" || event === "dream") {
          await incrementStories();
        } else if (event === "mission" || event === "game") {
          // award +2 points without consuming a question quota
          if (profile) {
            const newPoints = (profile.points ?? 0) + 2;
            await updateProfile({ points: newPoints });
          }
        }

        // Sync character_profiles counters when authenticated (fire-and-forget)
        if (user) {
          const colMap: Record<AchievementEvent, string | null> = {
            question: "questions_count",
            travel: "questions_count",
            karaoke: "questions_count",
            music: "questions_count",
            story: "stories_count",
            dream: "stories_count",
            mission: "moments_count",
            game: "games_count",
          };
          const col = colMap[event];
          if (col) {
            // Use RPC-like upsert pattern
            supabase
              .from("character_profiles")
              .select(col)
              .eq("user_id", user.id)
              .maybeSingle()
              .then(({ data }) => {
                const current = ((data as any)?.[col] ?? 0) as number;
                supabase
                  .from("character_profiles")
                  .upsert(
                    { user_id: user.id, [col]: current + 1 } as any,
                    { onConflict: "user_id" }
                  )
                  .then(() => {});
              });
          }
        }

        // Re-check thresholds AFTER profile mutation. Use a microtask delay so
        // the AuthContext setProfile has flushed.
        setTimeout(() => {
          const p = profile;
          if (!p) return;
          const unlocked = loadUnlocked();
          // recompute with optimistic +1 since setProfile may not have flushed yet
          const q = (p.questions_used ?? 0);
          const s = (p.stories_used ?? 0);
          const st = (p.streak_days ?? 0);
          const pt = (p.points ?? 0) + 2;
          checkBadges(unlocked, q, s, st, pt);
        }, 100);
      } finally {
        inFlight.current = false;
      }
    },
    [profile, user, incrementQuestions, incrementStories, updateProfile]
  );

  return { trackEvent };
}

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import KidzzShareModal from "./KidzzShareModal";
import type { AchievementCategory } from "./KidzzShareCard";

export interface ShareTriggerDetail {
  title: string;
  subtitle?: string;
  emoji: string;
  category: AchievementCategory;
  streakDays?: number;
  shareSlug?: string;
}

/**
 * Mount once globally. Listens for `kidzz:share` CustomEvents and renders
 * the universal share modal. Use:
 *   triggerKidzzShare({ title, emoji, category, ... })
 */
export function triggerKidzzShare(detail: ShareTriggerDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ShareTriggerDetail>("kidzz:share", { detail }));
}

const KidzzShareTrigger = () => {
  const [data, setData] = useState<ShareTriggerDetail | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent<ShareTriggerDetail>).detail;
      if (d) setData(d);
    };
    window.addEventListener("kidzz:share", handler);
    return () => window.removeEventListener("kidzz:share", handler);
  }, []);

  return (
    <AnimatePresence>
      {data && <KidzzShareModal {...data} onClose={() => setData(null)} />}
    </AnimatePresence>
  );
};

export default KidzzShareTrigger;

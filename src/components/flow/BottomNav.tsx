import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircleHeart, BookOpen, Music2, Target, Film, Disc3,
  Moon, Gamepad2, Heart, Crown, Shield,
} from "lucide-react";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenParents?: () => void;
  onOpenPlans?: () => void;
  isPremium?: boolean;
}

/**
 * KIDZZ Dock — 9 abas em 2 fileiras (4 em cima · 5 embaixo).
 * Glass branco premium sobre paleta Cinema v2.0.
 */

type Tab = {
  id: string;
  label: string;
  icon: typeof MessageCircleHeart;
  tint: string;
};

const ROW_TOP: Tab[] = [
  { id: "chat",    label: "Perguntas", icon: MessageCircleHeart, tint: "hsl(145 26% 28%)" },
  { id: "explore", label: "Histórias", icon: BookOpen,           tint: "hsl(38 57% 50%)"  },
  { id: "music",   label: "Música",    icon: Music2,             tint: "hsl(105 33% 50%)" },
  { id: "routine", label: "Rotina",    icon: Target,             tint: "hsl(145 35% 40%)" },
];

const ROW_BOTTOM: Tab[] = [
  { id: "cinema",   label: "Cinema",    icon: Film,      tint: "hsl(0 65% 57%)"   },
  { id: "moments",  label: "Momentos",  icon: Disc3,     tint: "hsl(38 57% 55%)"  },
  { id: "dreams",   label: "Sonhos",    icon: Moon,      tint: "hsl(255 45% 55%)" },
  { id: "play",     label: "Brincar",   icon: Gamepad2,  tint: "hsl(105 45% 45%)" },
  { id: "memories", label: "Memórias",  icon: Heart,     tint: "hsl(335 60% 55%)" },
];

const BottomNav = ({ activeTab, onTabChange, onOpenParents, onOpenPlans, isPremium = false }: Props) => {
  const handle = (id: string) => {
    if (activeTab === id) return;
    haptic("light");
    sfx("click");
    onTabChange(id);
  };

  const renderTab = (tab: Tab) => {
    const isActive = activeTab === tab.id;
    const Icon = tab.icon;
    return (
      <motion.button
        key={tab.id}
        onClick={() => handle(tab.id)}
        whileTap={{ scale: 0.88 }}
        animate={isActive ? { scale: [0.8, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center gap-0.5 px-1 py-1 min-w-[44px] min-h-[44px] rounded-xl flex-1"
        aria-label={tab.label}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon
          size={18}
          strokeWidth={isActive ? 2.4 : 1.9}
          style={{ color: isActive ? tab.tint : "hsl(0 0% 48% / 0.75)" }}
        />
        <span
          className="text-[9.5px] font-extrabold leading-tight tracking-tight whitespace-nowrap"
          style={{ color: isActive ? "hsl(0 0% 18%)" : "hsl(0 0% 48% / 0.8)" }}
        >
          {tab.label}
        </span>
        <AnimatePresence>
          {isActive && (
            <motion.span
              layoutId="kidzz-tab-underline-v2"
              className="absolute -bottom-0.5 h-[3px] rounded-full"
              style={{ background: tab.tint, width: 16, boxShadow: `0 0 8px ${tab.tint}` }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 26 }}
            />
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[70]"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 6px), 6px)",
        background: "hsl(48 36% 98% / 0.88)",
        backdropFilter: "blur(14px) saturate(1.1)",
        WebkitBackdropFilter: "blur(14px) saturate(1.1)",
        borderTop: "1px solid hsl(0 0% 100% / 0.75)",
        boxShadow: "0 -10px 32px -18px hsl(145 26% 28% / 0.22)",
        pointerEvents: "auto",
        touchAction: "manipulation",
      }}
    >
      {/* Ações secundárias */}
      {(onOpenParents || (onOpenPlans && !isPremium)) && (
        <div className="flex items-center justify-center gap-2 px-3 pt-1.5">
          {onOpenParents && (
            <button
              type="button"
              onClick={() => { haptic("light"); sfx("click"); onOpenParents(); }}
              className="min-h-[28px] rounded-full px-3 text-[10px] font-black flex items-center gap-1 active:scale-95"
              style={{
                background: "hsl(0 0% 100% / 0.85)",
                border: "1px solid hsl(0 0% 100% / 0.7)",
                color: "hsl(0 0% 18%)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Shield size={11} style={{ color: "hsl(145 26% 28%)" }} />
              Pais
            </button>
          )}
          {onOpenPlans && !isPremium && (
            <button
              type="button"
              onClick={() => { haptic("medium"); sfx("click"); onOpenPlans(); }}
              className="min-h-[28px] rounded-full px-3 text-[10px] font-black text-white shadow-md flex items-center gap-1 active:scale-95 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(38 57% 63%), hsl(38 57% 50%))" }}
            >
              <span className="shine-overlay" aria-hidden />
              <Crown size={11} className="relative z-10" />
              <span className="relative z-10">Assinar</span>
            </button>
          )}
        </div>
      )}

      {/* Fileira de cima (4) */}
      <div className="flex items-stretch justify-around px-2 pt-1.5">
        {ROW_TOP.map(renderTab)}
      </div>

      {/* Fileira de baixo (5) */}
      <div className="flex items-stretch justify-around px-1 pt-1 pb-1">
        {ROW_BOTTOM.map(renderTab)}
      </div>
    </nav>
  );
};

export default BottomNav;

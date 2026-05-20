import { motion, AnimatePresence } from "framer-motion";
import { MessageCircleHeart, Target, BookOpen, Music2, Moon, Gamepad2, Crown, Shield, Disc3, Film, Leaf } from "lucide-react";
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
 * KIDZZ Premium Dock — 2 linhas (VisionOS / Apple style).
 *  Linha 1 (EXPERIÊNCIAS, destaque): Brincar · Sonhos · Wellness
 *  Linha 2 (NAVEGAÇÃO, discreta):     Perguntas · Histórias · Música · Rotina · Sessão · Momentos
 */

type Tab = {
  id: string;
  label: string;
  icon: typeof MessageCircleHeart;
  tint: string;       // hsl ring/glow color
};

const EXPERIENCES: Tab[] = [
  { id: "play",     label: "Brincar",  icon: Gamepad2, tint: "hsl(28 85% 60%)" },
  { id: "dreams",   label: "Sonhos",   icon: Moon,     tint: "hsl(265 60% 68%)" },
  { id: "wellness", label: "Wellness", icon: Leaf,     tint: "hsl(150 45% 50%)" },
];

const NAVIGATION: Tab[] = [
  { id: "chat",     label: "Perguntas", icon: MessageCircleHeart, tint: "hsl(200 70% 55%)" },
  { id: "explore",  label: "Histórias", icon: BookOpen,           tint: "hsl(25 85% 58%)" },
  { id: "music",    label: "Música",    icon: Music2,             tint: "hsl(85 50% 55%)" },
  { id: "routine",  label: "Rotina",    icon: Target,             tint: "hsl(145 45% 48%)" },
  { id: "cinema",   label: "Sessão",    icon: Film,               tint: "hsl(330 60% 65%)" },
  { id: "moments",  label: "Momentos",  icon: Disc3,              tint: "hsl(45 70% 60%)" },
];

const BottomNav = ({ activeTab, onTabChange, onOpenParents, onOpenPlans, isPremium = false }: Props) => {
  const handle = (id: string) => {
    if (activeTab === id) return;
    haptic("light");
    sfx("click");
    onTabChange(id);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 6px), 6px)",
        background: "hsl(0 0% 100% / 0.78)",
        backdropFilter: "blur(28px) saturate(1.1)",
        WebkitBackdropFilter: "blur(28px) saturate(1.1)",
        borderTop: "1px solid hsl(0 0% 100% / 0.7)",
        boxShadow: "0 -8px 28px -16px hsl(100 15% 18% / 0.18)",
      }}
    >
      {/* Optional secondary actions (Pais / Assinatura) — discreto, acima do dock */}
      {(onOpenParents || (onOpenPlans && !isPremium)) && (
        <div className="flex items-center justify-center gap-2 px-3 pt-1.5">
          {onOpenParents && (
            <button
              type="button"
              onClick={() => { haptic("light"); sfx("click"); onOpenParents(); }}
              className="min-h-[30px] rounded-full px-3 text-[10px] font-black flex items-center gap-1 active:scale-95"
              style={{
                background: "hsl(0 0% 100% / 0.75)",
                border: "1px solid hsl(0 0% 100% / 0.7)",
                color: "hsl(var(--premium-ink))",
                backdropFilter: "blur(10px)",
              }}
            >
              <Shield size={11} className="text-[hsl(var(--wellness-deep))]" />
              Pais
            </button>
          )}
          {onOpenPlans && !isPremium && (
            <button
              type="button"
              onClick={() => { haptic("medium"); sfx("click"); onOpenPlans(); }}
              className="min-h-[30px] rounded-full kid-gradient-premium px-3 text-[10px] font-black text-white shadow-md flex items-center gap-1 active:scale-95 relative overflow-hidden"
            >
              <span className="shine-overlay" aria-hidden />
              <Crown size={11} className="relative z-10" />
              <span className="relative z-10">Assinar</span>
            </button>
          )}
        </div>
      )}

      {/* LINHA 1 — EXPERIÊNCIAS (destaque, cards maiores) */}
      <div className="flex items-stretch justify-center gap-2 px-3 pt-2">
        {EXPERIENCES.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => handle(tab.id)}
              whileTap={{ scale: 0.95 }}
              className="flex-1 max-w-[120px] relative flex items-center justify-center gap-1.5 py-2 rounded-2xl overflow-hidden"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, hsl(0 0% 100% / 0.95), ${tab.tint.replace(")", " / 0.18)")})`
                  : "hsl(0 0% 100% / 0.55)",
                border: `1px solid ${isActive ? tab.tint.replace(")", " / 0.35)") : "hsl(0 0% 100% / 0.65)"}`,
                boxShadow: isActive
                  ? `0 6px 18px -8px ${tab.tint.replace(")", " / 0.45)")}`
                  : "0 2px 8px -4px hsl(100 15% 18% / 0.08)",
              }}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.span
                  aria-hidden
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${tab.tint.replace(")", " / 0.35)")}, transparent 70%)`, filter: "blur(8px)" }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <Icon size={16} style={{ color: tab.tint }} strokeWidth={2.2} />
              <span
                className="text-[11px] font-black tracking-tight"
                style={{ color: isActive ? "hsl(var(--premium-ink))" : "hsl(var(--premium-ink-soft))" }}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* LINHA 2 — NAVEGAÇÃO (discreta) */}
      <div className="flex items-center justify-around px-1 pt-1.5">
        {NAVIGATION.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => handle(tab.id)}
              whileTap={{ scale: 0.88 }}
              className="relative flex flex-col items-center gap-0.5 px-1 py-1 min-w-[44px] rounded-xl"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                size={17}
                strokeWidth={isActive ? 2.4 : 1.9}
                style={{ color: isActive ? tab.tint : "hsl(var(--premium-ink-soft) / 0.7)" }}
              />
              <span
                className="text-[9px] font-extrabold leading-tight tracking-tight"
                style={{ color: isActive ? "hsl(var(--premium-ink))" : "hsl(var(--premium-ink-soft) / 0.7)" }}
              >
                {tab.label}
              </span>
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    layoutId="kidzz-tab-underline-v2"
                    className="absolute -bottom-0.5 h-[3px] rounded-full"
                    style={{ background: tab.tint, width: 16, boxShadow: `0 0 6px ${tab.tint}` }}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ type: "spring", stiffness: 340, damping: 26 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

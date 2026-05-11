import { motion, AnimatePresence } from "framer-motion";
import { MessageCircleHeart, Target, BookOpen, Music2, Moon, Heart, Gamepad2, Crown, Shield, Disc3 } from "lucide-react";
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
 * KIDZZ Tab Bar — 6 abas finais
 * Explorar 💬 | Brincar 🎮 (destaque) | Histórias 📖 | Música 🌿 | Sonhos 🌙 | Memórias 📸
 *
 * Regras:
 *  - 6 abas sem rolagem horizontal (ícones reduzidos para caber)
 *  - aba ativa com underline colorido + KIDZZ correspondente como ícone
 *  - "Brincar" é o CORE → ícone maior, anel destacado
 */
const TABS: {
  id: string;
  label: string;
  icon: typeof MessageCircleHeart;
  color: string;
  underline: string;
  highlight?: boolean;
}[] = [
  {
    id: "chat",
    label: "Perguntas",
    icon: MessageCircleHeart,
    color: "text-kid-blue",
    underline: "hsl(var(--kid-blue))",
  },
  {
    id: "explore",
    label: "Histórias",
    icon: BookOpen,
    color: "text-kid-orange",
    underline: "hsl(var(--kid-orange))",
  },
  {
    id: "music",
    label: "Música",
    icon: Music2,
    color: "text-kid-yellow",
    underline: "hsl(var(--kid-yellow))",
  },
  {
    id: "routine",
    label: "Rotina",
    icon: Target,
    color: "text-kid-green",
    underline: "hsl(var(--kid-green))",
  },
  {
    id: "play",
    label: "Brincar",
    icon: Gamepad2,
    color: "text-kid-green",
    underline: "hsl(140 70% 45%)",
    highlight: true,
  },
  {
    id: "dreams",
    label: "Sonhos",
    icon: Moon,
    color: "text-kid-purple",
    underline: "hsl(var(--kid-purple))",
  },
  {
    id: "moments",
    label: "Momentos",
    icon: Disc3,
    color: "text-kid-yellow",
    underline: "hsl(45 100% 65%)",
  },
];

const BottomNav = ({ activeTab, onTabChange, onOpenParents, onOpenPlans, isPremium = false }: Props) => (
  <nav
    className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/30"
    style={{
      paddingBottom: "max(env(safe-area-inset-bottom, 8px), 8px)",
      background: "hsl(0 0% 100% / 0.82)",
      backdropFilter: "blur(22px)",
      WebkitBackdropFilter: "blur(22px)",
    }}
  >
    {(onOpenParents || onOpenPlans) && (
      <div className="flex items-center justify-center gap-2 px-3 pt-2">
        {onOpenParents && (
          <button
            type="button"
            onClick={() => { haptic("light"); sfx("click"); onOpenParents(); }}
            className="min-h-[36px] rounded-full glass-card px-3 text-[11px] font-black text-foreground flex items-center gap-1.5 active:scale-95 tap-press"
          >
            <Shield size={14} className="text-primary" />
            Pais
          </button>
        )}
        {onOpenPlans && !isPremium && (
          <button
            type="button"
            onClick={() => { haptic("medium"); sfx("click"); onOpenPlans(); }}
            className="min-h-[36px] rounded-full kid-gradient-premium px-3 text-[11px] font-black text-primary-foreground shadow-premium flex items-center gap-1.5 active:scale-95 tap-press relative overflow-hidden"
          >
            <span className="shine-overlay" aria-hidden />
            <Crown size={14} className="relative z-10" />
            <span className="relative z-10">Assinatura</span>
          </button>
        )}
      </div>
    )}
    <div className="flex items-center justify-around px-0.5 pt-1.5">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        const isHighlight = !!tab.highlight;
        return (
          <motion.button
            key={tab.id}
            onClick={() => { if (activeTab === tab.id) return; haptic("light"); sfx("click"); onTabChange(tab.id); }}
            className={`relative flex flex-col items-center gap-0.5 px-1 py-1 rounded-2xl transition-colors min-w-[48px] ${
              isHighlight ? "min-w-[58px]" : ""
            }`}
            whileTap={{ scale: 0.88 }}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
          >
            {/* Halo destacado para Brincar */}
            {isHighlight && (
              <motion.span
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, hsl(145 70% 55% / 0.35), transparent 70%)",
                }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* Ripple ao ativar */}
            {isActive && (
              <motion.span
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ background: `${tab.underline.replace(")", " / 0.18)")}` }}
                initial={{ scale: 0.6, opacity: 0.8 }}
                animate={{ scale: 1.1, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            )}

            <div
              className={`flex items-center justify-center ${
                isHighlight ? "w-8 h-8" : "w-6 h-6"
              }`}
            >
              <Icon
                size={isHighlight ? 22 : 18}
                className={isActive ? tab.color : "text-gray-400"}
                strokeWidth={isHighlight ? 2.4 : 2}
                fill={isActive && tab.id === "memories" ? "currentColor" : "none"}
              />
            </div>

            <span
              className={`text-[9px] font-extrabold leading-tight tracking-tight ${
                isActive ? "text-gray-800" : "text-gray-400"
              }`}
            >
              {tab.label}
            </span>

            {/* Underline colorido na ativa */}
            <AnimatePresence>
              {isActive && (
                <motion.span
                  layoutId="kidzz-tab-underline"
                  className="absolute -bottom-0.5 h-1 rounded-full"
                  style={{
                    background: tab.underline,
                    width: isHighlight ? 22 : 18,
                    boxShadow: `0 0 8px ${tab.underline}`,
                  }}
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

export default BottomNav;

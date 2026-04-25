import { motion, AnimatePresence } from "framer-motion";
import { MessageCircleHeart, Gamepad2, BookOpen, Music2, Moon, Heart } from "lucide-react";
import cosmicImg from "@/assets/kidzz/cosmic.png";
import explorerImg from "@/assets/kidzz/explorer.png";
import musicImg from "@/assets/kidzz/music.png";
import moonImg from "@/assets/kidzz/moon.png";
import { haptic } from "@/lib/haptics";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
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
  kidzzImg?: string;
  kidzzTint?: string;
  highlight?: boolean;
}[] = [
  {
    id: "chat",
    label: "Explorar",
    icon: MessageCircleHeart,
    color: "text-kid-blue",
    underline: "hsl(var(--kid-blue))",
    kidzzImg: cosmicImg,
  },
  {
    id: "play",
    label: "Brincar",
    icon: Gamepad2,
    color: "text-kid-green",
    underline: "hsl(var(--kid-green))",
    kidzzImg: explorerImg,
    kidzzTint: "hue-rotate(50deg) saturate(1.4) brightness(1.05)",
    highlight: true,
  },
  {
    id: "explore",
    label: "Histórias",
    icon: BookOpen,
    color: "text-kid-orange",
    underline: "hsl(var(--kid-orange))",
    kidzzImg: explorerImg,
  },
  {
    id: "music",
    label: "Música",
    icon: Music2,
    color: "text-kid-yellow",
    underline: "hsl(var(--kid-yellow))",
    kidzzImg: musicImg,
  },
  {
    id: "dreams",
    label: "Sonhos",
    icon: Moon,
    color: "text-kid-purple",
    underline: "hsl(var(--kid-purple))",
    kidzzImg: moonImg,
  },
  {
    id: "memories",
    label: "Memórias",
    icon: Heart,
    color: "text-kid-pink",
    underline: "hsl(var(--kid-pink))",
    // sem KIDZZ alternativo — ícone Heart se mantém ao ativar
  },
];

const BottomNav = ({ activeTab, onTabChange }: Props) => (
  <nav
    className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/30"
    style={{
      paddingBottom: "max(env(safe-area-inset-bottom, 8px), 8px)",
      background: "hsl(0 0% 100% / 0.82)",
      backdropFilter: "blur(22px)",
      WebkitBackdropFilter: "blur(22px)",
    }}
  >
    <div className="flex items-center justify-around px-0.5 pt-1.5">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        const isHighlight = !!tab.highlight;
        return (
          <motion.button
            key={tab.id}
            onClick={() => { haptic("light"); onTabChange(tab.id); }}
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
              <AnimatePresence mode="popLayout">
                {isActive && tab.kidzzImg ? (
                  <motion.img
                    key={`kidzz-${tab.id}`}
                    src={tab.kidzzImg}
                    alt=""
                    aria-hidden="true"
                    className={`object-contain drop-shadow ${
                      isHighlight ? "w-8 h-8" : "w-6 h-6"
                    }`}
                    style={tab.kidzzTint ? { filter: tab.kidzzTint } : undefined}
                    initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: 0,
                      y: [0, -2, 0],
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{
                      opacity: { duration: 0.25 },
                      scale: { type: "spring", stiffness: 280, damping: 18 },
                      y: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
                    }}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <motion.div
                    key={`icon-${tab.id}`}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon
                      size={isHighlight ? 22 : 18}
                      className={isActive ? tab.color : "text-gray-400"}
                      strokeWidth={isHighlight ? 2.4 : 2}
                      fill={isActive && tab.id === "memories" ? "currentColor" : "none"}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
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

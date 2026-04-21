import { motion, AnimatePresence } from "framer-motion";
import { MessageCircleHeart, BookOpen, Music2, Moon, Image as ImageIcon } from "lucide-react";
import cosmicImg from "@/assets/kidzz/cosmic.png";
import explorerImg from "@/assets/kidzz/explorer.png";
import musicImg from "@/assets/kidzz/music.png";
import moonImg from "@/assets/kidzz/moon.png";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS: {
  id: string;
  label: string;
  icon: typeof MessageCircleHeart;
  color: string;
  kidzzImg?: string;
}[] = [
  { id: "chat",      label: "Perguntas", icon: MessageCircleHeart, color: "text-kid-pink",  kidzzImg: cosmicImg },
  { id: "explore",   label: "Histórias", icon: BookOpen,           color: "text-kid-blue",  kidzzImg: explorerImg },
  { id: "music",     label: "Música",    icon: Music2,             color: "text-kid-green", kidzzImg: musicImg },
  { id: "dreams",    label: "Sonhos",    icon: Moon,               color: "text-indigo-400",kidzzImg: moonImg },
  { id: "memories",  label: "Memórias",  icon: ImageIcon,          color: "text-kid-orange" },
];

const BottomNav = ({ activeTab, onTabChange }: Props) => (
  <nav
    className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20"
    style={{
      paddingBottom: "max(env(safe-area-inset-bottom, 8px), 8px)",
      background: "hsl(0 0% 100% / 0.78)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    }}
  >
    <div className="flex items-center justify-around px-2 pt-2">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[60px] ${
              isActive ? "bg-primary/10" : ""
            }`}
            whileTap={{ scale: 0.85 }}
          >
            {/* Pulse ripple when active */}
            {isActive && (
              <motion.span
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ background: "hsl(var(--primary) / 0.15)" }}
                initial={{ scale: 0.6, opacity: 0.8 }}
                animate={{ scale: 1.1, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            )}

            {/* Icon morphs into mini KIDZZ when active */}
            <div className="w-7 h-7 flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                {isActive && tab.kidzzImg ? (
                  <motion.img
                    key={`kidzz-${tab.id}`}
                    src={tab.kidzzImg}
                    alt={tab.label}
                    className="w-7 h-7 object-contain drop-shadow"
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
                      size={22}
                      className={isActive ? tab.color : "text-gray-400"}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span
              className={`text-[10px] font-bold leading-tight ${
                isActive ? "text-gray-800" : "text-gray-400"
              }`}
            >
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  </nav>
);

export default BottomNav;

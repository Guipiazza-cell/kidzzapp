import { motion } from "framer-motion";
import { MessageCircleHeart, BookOpen, Heart, Moon, Trees } from "lucide-react";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: "chat", label: "Perguntas", icon: MessageCircleHeart, color: "text-kid-pink" },
  { id: "explore", label: "Histórias", icon: BookOpen, color: "text-kid-blue" },
  { id: "forest", label: "Floresta", icon: Trees, color: "text-kid-green" },
  { id: "memories", label: "Memórias", icon: Heart, color: "text-kid-orange" },
  { id: "dreams", label: "Sonhos", icon: Moon, color: "text-indigo-400" },
];

const BottomNav = ({ activeTab, onTabChange }: Props) => (
  <nav
    className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20"
    style={{
      paddingBottom: "max(env(safe-area-inset-bottom, 8px), 8px)",
      background: "hsl(0 0% 100% / 0.75)",
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
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[60px] ${
              isActive ? "bg-primary/10" : ""
            }`}
            whileTap={{ scale: 0.9 }}
          >
            <Icon
              size={22}
              className={isActive ? tab.color : "text-gray-400"}
            />
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

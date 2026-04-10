import { motion } from "framer-motion";
import { MessageCircleHeart, Compass, Trophy, Backpack } from "lucide-react";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: "chat", label: "Conversar", icon: MessageCircleHeart, color: "text-kid-pink" },
  { id: "explore", label: "Explorar", icon: Compass, color: "text-kid-blue" },
  { id: "achievements", label: "Conquistas", icon: Trophy, color: "text-kid-yellow" },
  { id: "moments", label: "Momentos", icon: Backpack, color: "text-kid-orange" },
];

const BottomNav = ({ activeTab, onTabChange }: Props) => (
  <nav
    className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-primary-foreground/10"
    style={{ paddingBottom: "max(env(safe-area-inset-bottom, 8px), 8px)" }}
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
              isActive ? "bg-primary-foreground/10" : ""
            }`}
            whileTap={{ scale: 0.9 }}
          >
            <Icon
              size={22}
              className={isActive ? tab.color : "text-primary-foreground/40"}
            />
            <span
              className={`text-[10px] font-bold leading-tight ${
                isActive ? "text-primary-foreground/90" : "text-primary-foreground/40"
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

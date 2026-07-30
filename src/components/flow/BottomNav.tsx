import { memo, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  MessageCircle, Leaf, Moon, BookOpen, Puzzle, CalendarDays,
  Star, Clapperboard, Music2, Image as ImageIcon, Sparkles,
  ChevronLeft, ChevronRight, Compass,
} from "lucide-react";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import { APP_TABS_ALL, type AppTab } from "@/lib/appTabs";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenParents?: () => void;
  onOpenPlans?: () => void;
  isPremium?: boolean;
}

type Tab = {
  id: AppTab;
  label: string;
  icon: typeof MessageCircle;
  c: string;
  cl: string;
  featured?: boolean;
};

const TAB_ICONS: Partial<Record<AppTab, typeof MessageCircle>> = {
  chat: MessageCircle,
  discover: Compass,
  wellness: Leaf,
  dreams: Moon,
  explore: BookOpen,
  play: Puzzle,
  bora: Sparkles,
  routine: CalendarDays,
  moments: Star,
  cinema: Clapperboard,
  music: Music2,
  memories: ImageIcon,
};

const TABS: Tab[] = APP_TABS_ALL.filter((t) => t.inDock).map((tab) => ({
  id: tab.id,
  label: tab.label,
  icon: TAB_ICONS[tab.id] ?? Sparkles,
  c: tab.color,
  cl: tab.light,
  featured: tab.featured,
}));

/**
 * BottomNav — liquid glass ÚNICO em todas as abas.
 * Não muda de cor ao trocar tela (claro/escuro): sempre o mesmo vidro translúcido.
 */
const BottomNav = ({ activeTab, onTabChange, onOpenParents, onOpenPlans, isPremium = false }: Props) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [showFade, setShowFade] = useState(true);

  const handle = useCallback((id: string) => {
    if (activeTab === id) return;
    haptic("light");
    sfx("click");
    onTabChange(id);
  }, [activeTab, onTabChange]);

  useEffect(() => {
    const el = itemRefs.current[activeTab];
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeTab]);

  const onScroll = useCallback(() => {
    const s = scrollerRef.current;
    if (!s) return;
    setShowFade(s.scrollLeft + s.clientWidth < s.scrollWidth - 4);
  }, []);
  useEffect(() => { onScroll(); }, [onScroll]);

  const dockBy = useCallback((dx: number) => {
    scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  }, []);

  // Liquid glass translúcido — igual em tela branca, creme ou preta.
  const dockStyle: CSSProperties = {
    background:
      "linear-gradient(165deg, rgba(255,255,255,.42) 0%, rgba(255,255,255,.22) 48%, rgba(255,255,255,.16) 100%)",
    border: "0.5px solid rgba(255,255,255,.55)",
    boxShadow:
      "0 12px 36px rgba(20,16,30,.18), 0 2px 8px rgba(20,16,30,.08), inset 0 1px 0 rgba(255,255,255,.72), inset 0 -1px 0 rgba(255,255,255,.12)",
    backdropFilter: "blur(32px) saturate(190%)",
    WebkitBackdropFilter: "blur(32px) saturate(190%)",
  };
  const idleIcon = "rgba(45,40,55,.62)";
  const idleLabel = "rgba(45,40,55,.58)";
  const arrowBg = "rgba(255,255,255,.45)";
  const arrowBorder = "rgba(255,255,255,.7)";
  const arrowIcon = "rgba(55,48,62,.78)";

  const arrowBtn: CSSProperties = {
    position: "absolute", top: "50%", width: 26, height: 26, borderRadius: 999, cursor: "pointer",
    transform: "translateY(-50%)", background: arrowBg, border: `1px solid ${arrowBorder}`,
    backdropFilter: "blur(12px) saturate(160%)", WebkitBackdropFilter: "blur(12px) saturate(160%)",
    boxShadow: "0 4px 12px rgba(20,16,30,.16), inset 0 1px 1px rgba(255,255,255,.65)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
  };

  return (
    <nav
      data-kidzz-dock
      className="fixed left-0 right-0 z-[90]"
      style={{
        fontFamily: "'Nunito', system-ui, sans-serif",
        bottom: 0,
        paddingLeft: 14,
        paddingRight: 14,
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
        paddingTop: 4,
        pointerEvents: "auto",
        background: "transparent",
      }}
    >
      {/* Pais/Assinar flutuante REMOVIDO (relatório design): cobria conteúdo.
          Pais fica no header de cada aba; Assinar via paywall / header / planos. */}

      {/* Dock liquid glass — mesmo em todas as telas */}
      <div
        style={{
          position: "relative",
          padding: "8px 4px",
          borderRadius: 26,
          ...dockStyle,
        }}
      >
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="kidzz-dock-scroller"
          data-dock-scroller
          style={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            overflowY: "visible",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            padding: "0 26px",
            width: "100%",
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                ref={(el) => (itemRefs.current[tab.id] = el)}
                type="button"
                onClick={() => handle(tab.id)}
                aria-label={tab.label}
                data-dock-tab={tab.id}
                data-testid={`dock-tab-${tab.id}`}
                aria-current={isActive ? "page" : undefined}
                className="active:scale-90"
                style={{
                  flex: "none",
                  width: 60,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 0",
                  transition: "transform .2s",
                  fontFamily: "'Nunito', system-ui, sans-serif",
                }}
              >
                <span
                  style={{
                    width: 40,
                    height: 30,
                    borderRadius: 11,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all .3s",
                    background: isActive
                      ? `radial-gradient(130% 130% at 30% 22%, ${tab.cl} 0%, ${tab.cl} 22%, ${tab.c} 100%)`
                      : "transparent",
                    border: isActive ? "1px solid rgba(255,255,255,.55)" : "1px solid transparent",
                    boxShadow: isActive
                      ? `0 5px 14px -2px ${tab.c}b3, 0 0 16px ${tab.c}66, inset 0 1px 0 rgba(255,255,255,.6)`
                      : "none",
                  }}
                >
                  <Icon
                    size={19}
                    strokeWidth={1.9}
                    style={{ color: isActive ? "#fff" : idleIcon }}
                  />
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    color: isActive ? tab.c : idleLabel,
                    whiteSpace: "nowrap",
                    transition: "color .3s",
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Setas prev/next */}
        <button type="button" aria-label="Anterior" onClick={() => dockBy(-200)} className="active:scale-90" style={{ ...arrowBtn, left: 5 }}>
          <ChevronLeft size={12} strokeWidth={2.6} style={{ color: arrowIcon }} />
        </button>
        <button
          type="button"
          aria-label="Próximo"
          onClick={() => dockBy(200)}
          className="active:scale-90"
          style={{ ...arrowBtn, right: 5, opacity: showFade ? 1 : 0.4 }}
        >
          <ChevronRight size={12} strokeWidth={2.6} style={{ color: arrowIcon }} />
        </button>
      </div>

      <style>{`
        .kidzz-dock-scroller::-webkit-scrollbar { display: none; }
      `}</style>
    </nav>
  );
};

export default memo(BottomNav);

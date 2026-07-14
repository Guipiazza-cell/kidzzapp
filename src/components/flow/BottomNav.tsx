import { memo, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  MessageCircle, Leaf, Moon, BookOpen, Puzzle, CalendarDays,
  Star, Clapperboard, Music2, Image as ImageIcon, Sparkles,
  Crown, Shield, ChevronLeft, ChevronRight, Compass,
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

// Telas de fundo ESCURO — o dock usa vidro escuro; nas demais, vidro claro.
// Assim a nav "combina" com cada tela em vez de destoar.
const DARK_SCREENS = new Set<string>(["dreams", "moments", "memories"]);

/**
 * BottomNav — dock de vidro premium que HARMONIZA com cada tela.
 *
 * - Fundo do dock adapta claro/escuro conforme a tela ativa (DARK_SCREENS).
 * - Ícone ativo em cápsula glossy tingida na cor da aba (tab.c/tab.cl) + glow.
 * - Setas prev/next, rolagem horizontal. Fiel aos mockups (design-src/*.dc.html).
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

  const immersiveTab = activeTab === "dreams" || activeTab === "cinema";
  const dark = DARK_SCREENS.has(activeTab);

  // Tema do dock por claridade da tela ativa.
  const dockStyle: CSSProperties = dark
    ? {
        background: "linear-gradient(160deg, rgba(255,255,255,.16), rgba(255,255,255,.06))",
        border: "1px solid rgba(255,255,255,.3)",
        boxShadow: "0 18px 44px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.4), inset 0 -8px 18px rgba(0,0,0,.15)",
      }
    : {
        background: "linear-gradient(160deg, rgba(255,255,255,.82), rgba(255,255,255,.5))",
        border: "1px solid rgba(255,255,255,.95)",
        boxShadow: "0 18px 40px -8px rgba(60,50,30,.30), 0 4px 12px rgba(60,50,30,.14), inset 0 1.5px 1px rgba(255,255,255,1), inset 0 -8px 18px rgba(120,110,90,.06)",
      };
  const idleIcon = dark ? "rgba(240,235,225,.66)" : "rgba(70,60,45,.6)";
  const idleLabel = dark ? "rgba(240,235,225,.6)" : "rgba(70,60,45,.62)";
  const arrowBg = dark ? "rgba(255,255,255,.16)" : "rgba(255,255,255,.7)";
  const arrowBorder = dark ? "rgba(255,255,255,.3)" : "rgba(255,255,255,1)";
  const arrowIcon = dark ? "#FBEFE6" : "#6E5E48";

  const arrowBtn: CSSProperties = {
    position: "absolute", top: "50%", width: 26, height: 26, borderRadius: 999, cursor: "pointer",
    transform: "translateY(-50%)", background: arrowBg, border: `1px solid ${arrowBorder}`,
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 4px 10px rgba(0,0,0,.28), inset 0 1px 1px rgba(255,255,255,.5)",
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
      {/* Pais / Assinar — chips de vidro (adaptam claro/escuro) */}
      {!immersiveTab && (onOpenParents || (onOpenPlans && !isPremium)) && (
        <div className="w-full flex items-center justify-end gap-1.5 mb-2 pr-1">
          {onOpenParents && (
            <button
              type="button"
              onClick={() => { haptic("light"); sfx("click"); onOpenParents(); }}
              aria-label="Pais"
              className="h-8 rounded-full px-3 text-[11.5px] font-bold flex items-center gap-1 active:scale-95"
              style={{
                color: dark ? "#F4EFE2" : "#3A2E1E",
                background: dark ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.78)",
                border: `1px solid ${dark ? "rgba(255,255,255,.3)" : "rgba(255,255,255,1)"}`,
                backdropFilter: "blur(16px) saturate(150%)",
                WebkitBackdropFilter: "blur(16px) saturate(150%)",
                boxShadow: "0 6px 16px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.6)",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              <Shield size={12} style={{ color: "#3FA89B" }} />
              Pais
            </button>
          )}
          {onOpenPlans && !isPremium && (
            <button
              type="button"
              onClick={() => { haptic("medium"); sfx("click"); onOpenPlans(); }}
              aria-label="Assinar"
              className="h-8 rounded-full px-3 text-[11.5px] font-bold text-white flex items-center gap-1 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #F79A3E, #E4722A)",
                boxShadow: "0 10px 24px -4px rgba(210,110,40,.5), inset 0 1px 0 rgba(255,255,255,.4)",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              <Crown size={12} />
              Assinar
            </button>
          )}
        </div>
      )}

      {/* Dock de vidro (premium, harmoniza com a tela) */}
      <div
        style={{
          position: "relative",
          padding: "8px 4px",
          borderRadius: 26,
          backdropFilter: "blur(24px) saturate(170%)",
          WebkitBackdropFilter: "blur(24px) saturate(170%)",
          transition: "background .4s ease, box-shadow .4s ease, border-color .4s ease",
          ...dockStyle,
        }}
      >
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="kidzz-dock-scroller"
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
                    color: isActive ? (dark ? tab.cl : tab.c) : idleLabel,
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

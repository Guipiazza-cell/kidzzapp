import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  MessageCircle, Leaf, Moon, BookOpen, Puzzle, CalendarDays,
  Star, Clapperboard, Music2, Image as ImageIcon, Sparkles,
  Crown, Shield, ChevronRight, Compass,
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

const PILL_W = 50;
const ITEM_MIN_W = 58;

const BottomNav = ({ activeTab, onTabChange, onOpenParents, onOpenPlans, isPremium = false }: Props) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState<{ left: number; color: string; light: string } | null>(null);
  const [showFade, setShowFade] = useState(true);

  const handle = useCallback((id: string) => {
    if (activeTab === id) return;
    haptic("light");
    sfx("click");
    onTabChange(id);
  }, [activeTab, onTabChange]);

  const updatePill = useCallback(() => {
    const tab = TABS.find((t) => t.id === activeTab);
    const el = itemRefs.current[activeTab];
    const scroller = scrollerRef.current;
    if (!tab || !el || !scroller) return;
    const left = el.offsetLeft + (el.offsetWidth - PILL_W) / 2;
    setPill({ left, color: tab.c, light: tab.cl });
  }, [activeTab]);

  useLayoutEffect(() => {
    updatePill();
  }, [updatePill]);

  useEffect(() => {
    const onResize = () => updatePill();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updatePill]);

  // Scroll active into view + fade indicator
  useEffect(() => {
    const el = itemRefs.current[activeTab];
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeTab]);

  const onScroll = useCallback(() => {
    const s = scrollerRef.current;
    if (!s) return;
    const atEnd = s.scrollLeft + s.clientWidth >= s.scrollWidth - 4;
    setShowFade(!atEnd);
  }, []);

  useEffect(() => {
    onScroll();
  }, [onScroll]);

  const activeColor = pill?.color ?? "#E8821A";

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
      {/* Pais / Assinar — island button, minimal & premium */}
      {(onOpenParents || (onOpenPlans && !isPremium)) && (
        <div className="w-full flex items-center justify-end gap-1.5 mb-2 pr-1">
          {onOpenParents && (
            <button
              type="button"
              onClick={() => { haptic("light"); sfx("click"); onOpenParents(); }}
              aria-label="Pais"
              className="h-8 rounded-full px-3 text-[11.5px] font-bold flex items-center gap-1 active:scale-95"
              style={{
                background: "rgba(255,252,248,0.78)",
                backdropFilter: "blur(18px) saturate(140%)",
                WebkitBackdropFilter: "blur(18px) saturate(140%)",
                border: "1px solid rgba(42,37,32,0.10)",
                color: "#2A2520",
                fontFamily: "'Nunito', system-ui, sans-serif",
                boxShadow: "0 6px 16px -4px rgba(42,37,32,0.18)",
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
                background: "linear-gradient(135deg, #E8821A, #D26A0A)",
                boxShadow: "0 8px 18px -4px rgba(232,130,26,.55), inset 0 1px 0 rgba(255,255,255,.30)",
                fontFamily: "'Nunito', system-ui, sans-serif",
              }}
            >
              <Crown size={12} />
              Assinar
            </button>
          )}
        </div>
      )}



      {/* Outer bezel (silver metallic frame) */}
      <div
        style={{
          borderRadius: 36,
          padding: 2,
          background:
            "linear-gradient(160deg, rgba(255,255,255,1) 0%, rgba(232,236,240,.92) 12%, rgba(190,197,206,.82) 30%, rgba(150,158,168,.75) 46%, rgba(206,212,219,.78) 64%, rgba(124,132,142,.82) 84%, rgba(238,241,244,.95) 100%)",
          boxShadow:
            "0 22px 50px -10px rgba(60,40,15,.45), 0 8px 18px rgba(60,40,15,.24), 0 1px 0 rgba(255,255,255,.6), inset 0 1px 1px rgba(255,255,255,.9)",
        }}
      >
        {/* Inner glass scroller wrapper */}
        <div
          style={{
            position: "relative",
            borderRadius: 32,
            overflow: "hidden",
            background:
              "linear-gradient(150deg, rgba(255,255,255,.40) 0%, rgba(255,255,255,.12) 48%, rgba(255,255,255,.28) 100%)",
            backdropFilter: "blur(30px) saturate(200%) brightness(1.08)",
            WebkitBackdropFilter: "blur(30px) saturate(200%) brightness(1.08)",
            boxShadow:
              "inset 0 1.5px 1px rgba(255,255,255,.95), inset 0 -10px 22px rgba(255,255,255,.20), inset 2px 0 10px rgba(255,255,255,.28), inset -2px 0 10px rgba(255,255,255,.28), inset 0 0 0 1px rgba(255,255,255,.18)",
          }}
        >
          {/* Top specular highlight */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: "44%",
              background:
                "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.18) 55%, rgba(255,255,255,0) 100%)",
              pointerEvents: "none",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
            }}
          />
          {/* Bottom refraction tinted with active color */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              height: 14,
              background: `linear-gradient(0deg, ${activeColor}33 0%, transparent 100%)`,
              pointerEvents: "none",
              transition: "background .35s ease",
            }}
          />

          {/* Scroller */}
          <div
            ref={scrollerRef}
            onScroll={onScroll}
            className="kidzz-dock-scroller"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "stretch",
              gap: 2,
              // Padding vertical simétrico (11/11) p/ centralizar os ícones na
              // barra. Antes 16/6 (assimétrico) jogava o conteúdo pra baixo e
              // deixava os ícones descentralizados verticalmente.
              padding: "11px 32px 11px 6px",
              overflowX: "auto",
              overflowY: "visible",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* Sliding pill behind active icon */}
            {pill && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 11,
                  left: pill.left,
                  width: PILL_W,
                  height: 38,
                  borderRadius: 16,
                  background: `linear-gradient(155deg, ${pill.light}, ${pill.color})`,
                  boxShadow: `0 8px 20px -3px ${pill.color}99, inset 0 1.5px 2px rgba(255,255,255,.65), inset 0 -4px 9px rgba(0,0,0,.12), 0 0 0 1px rgba(255,255,255,.35)`,
                  transition: "left .45s cubic-bezier(.34,1.4,.5,1), background .35s ease, box-shadow .35s ease",
                  pointerEvents: "none",
                }}
              />
            )}

            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              const featured = !!tab.featured;
              return (
                <button
                  key={tab.id}
                  ref={(el) => (itemRefs.current[tab.id] = el)}
                  type="button"
                  onClick={() => handle(tab.id)}
                  className="relative flex flex-col items-center justify-center gap-0.5 py-0.5 px-1 rounded-2xl select-none active:scale-95"
                  style={{
                    minWidth: featured ? ITEM_MIN_W + 8 : ITEM_MIN_W,
                    flex: "0 0 auto",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                    touchAction: "manipulation",
                    fontFamily: "'Nunito', system-ui, sans-serif",
                    transition: "transform .2s ease",
                  }}
                  aria-label={tab.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    style={{
                      position: "relative",
                      zIndex: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: featured ? 42 : 38,
                      height: featured ? 42 : 38,
                      marginTop: featured ? -4 : 0,
                      borderRadius: featured ? 999 : 0,
                      background: featured
                        ? `linear-gradient(155deg, ${tab.cl}, ${tab.c})`
                        : "transparent",
                      boxShadow: featured
                        ? `0 10px 22px -4px ${tab.c}99, inset 0 1.5px 2px rgba(255,255,255,.7), inset 0 -4px 9px rgba(0,0,0,.14), 0 0 0 3px #ffffff`
                        : "none",
                      transform: isActive
                        ? `translateY(${featured ? -2 : -1}px) scale(${featured ? 1.08 : 1.05})`
                        : `translateY(0) scale(${featured ? 1.02 : 1})`,
                      transition: "transform .35s cubic-bezier(.34,1.4,.5,1)",
                    }}
                  >
                    <Icon
                      size={featured ? 24 : 20}
                      strokeWidth={featured ? 2.2 : 1.9}
                      style={{
                        color: featured ? "#ffffff" : isActive ? "#ffffff" : "#7d6e5b",
                        opacity: featured ? 1 : isActive ? 1 : 0.72,
                        filter:
                          featured || isActive
                            ? "drop-shadow(0 1px 1px rgba(0,0,0,.25))"
                            : "none",
                        transition: "color .25s ease, opacity .25s ease",
                      }}
                    />
                  </span>
                  <span
                    style={{
                      position: "relative",
                      zIndex: 1,
                      fontSize: 9.5,
                      lineHeight: 1.1,
                      letterSpacing: "-0.01em",
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? "#ffffff" : "#5a4d3d",
                      textShadow: isActive ? "0 1px 1px rgba(0,0,0,.18)" : "none",
                      whiteSpace: "nowrap",
                      fontFamily: "'Nunito', system-ui, sans-serif",
                      transition: "color .25s ease",
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right scroll-fade indicator */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: 38,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: 6,
              background:
                "linear-gradient(270deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.30) 55%, rgba(255,255,255,0) 100%)",
              opacity: showFade ? 1 : 0,
              transition: "opacity .35s ease",
            }}
          >
            <ChevronRight
              size={16}
              strokeWidth={2}
              className="kidzz-dock-chev"
              style={{ color: "#8a8f97" }}
            />
          </div>
        </div>
      </div>

      <style>{`
        .kidzz-dock-scroller::-webkit-scrollbar { display: none; }
        @keyframes kidzz-chev-pulse {
          0%, 100% { opacity: .55; transform: translateX(0); }
          50% { opacity: 1; transform: translateX(2px); }
        }
        .kidzz-dock-chev { animation: kidzz-chev-pulse 2.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .kidzz-dock-chev { animation: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default memo(BottomNav);

/**
 * RoutineScreen — redesign premium
 * Craft: Bora (camadas, glass, sheen, cascade, sticky)
 * Layout: print public/telas/Rotina/
 * Dados reais: getToday / completeTask / streak / mission / paywall / memória
 * Assets: rotina-v2 full-frame (sem recorte)
 */
import { useState, useEffect, useMemo, useCallback, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smile, Droplet, BedDouble, Coffee, Heart, Music2, MessageCircleHeart,
  Apple, BookOpen, Palette, Zap, Users, Package, Blocks, Footprints,
  Wind, Star, Shirt, HandMetal, Sparkles, Sun, Cloud, Moon, Crown,
  Check, Flame, Trophy,
} from "lucide-react";
import {
  getToday, completeTask, getStreak, getKidzzMessage, getCurrentPeriod,
  type RoutineTask, type RoutinePeriod, type TodayView,
} from "@/lib/routine";
import { getMissionProgress } from "@/lib/dailyMission";
import { showXpGained } from "@/components/flow/XpToast";
import { haptic } from "@/lib/haptics";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/hooks/useEntitlement";
import { useMemories } from "@/hooks/useMemories";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  FONT, SERIF, R, PAD, GAP,
  glassLight as glass,
  pillGlassLight as pillGlass,
  coloredGlass,
  sectionWrap,
} from "@/lib/premiumUi";

import { CAMALEAO, CAMALEAO_SCENE_MASK } from "@/lib/camaleaoOficial";

const AS = "/exemplos/assets/rotina-v2";
const AV = "v3";
const asset = (n: string) => `${AS}/${n}?${AV}`;

const INK = "#3A2418";
const INK2 = "#8A6450";
const ACCENT = "#3E8A4A";
const ORANGE = "#E8824E";
const GOLD = "#E0A62B";

const ENCOURAGEMENTS = [
  "Incrível! Você arrasou! 🌟",
  "Que criança incrível! ⭐",
  "Kidzz ficou super feliz! 💛",
  "Missão cumprida! 🎯",
  "Você é demais! 🚀",
  "Continua assim, campeão(ã)! 🏆",
];

const ICONS: Record<string, typeof Smile> = {
  Smile, Droplet, BedDouble, Coffee, Heart, Music2, MessageCircleHeart,
  Apple, BookOpen, Palette, Zap, Users, Package, Blocks, Footprints,
  Wind, Star, Shirt, HandMetal, Sparkles, Sun, Cloud, Moon,
};

const PERIOD_META: Record<
  RoutinePeriod,
  {
    label: string;
    sub: string;
    cover: string;
    Icon: typeof Sun;
    btn: string;
    btnDone: string;
    tint: [number, number, number];
    g: [string, string, string];
  }
> = {
  morning: {
    label: "Manhã",
    sub: "Comece o dia com energia e intenção.",
    cover: asset("cover-morning.png"),
    Icon: Sun,
    btn: "#E8A22B",
    btnDone: "#3E9A5E",
    tint: [240, 180, 90],
    g: ["#FFE9A8", "#F2B23B", "#C77E12"],
  },
  afternoon: {
    label: "Tarde",
    sub: "Momentos para aprender, brincar e compartilhar.",
    cover: asset("cover-afternoon.png"),
    Icon: Sun,
    btn: "#4EA35E",
    btnDone: "#2F7A4E",
    tint: [100, 180, 120],
    g: ["#C0EDC8", "#5CB57A", "#2F7A4E"],
  },
  night: {
    label: "Noite",
    sub: "Desacelere para dormir em paz e sonhar com o amanhã.",
    cover: asset("cover-night.png"),
    Icon: Moon,
    btn: "#7B6BC4",
    btnDone: "#5A4A9E",
    tint: [120, 110, 200],
    g: ["#D0C8F8", "#8B7BE0", "#5A4A9E"],
  },
};

const PERIODS: RoutinePeriod[] = ["morning", "afternoon", "night"];

const KEYFRAMES = `
@keyframes rot2-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes rot2-cascade{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes rot2-heroIn{from{opacity:0;transform:translateY(-8px) scale(1.03)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes rot2-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes rot2-drift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(22px,12px) scale(1.08)}}
@keyframes rot2-shine{0%{transform:translateX(-130%) skewX(-16deg)}60%,100%{transform:translateX(240%) skewX(-16deg)}}
@keyframes rot2-twinkle{0%,100%{opacity:.18;transform:scale(.7)}50%{opacity:.9;transform:scale(1.15)}}
@keyframes rot2-pop{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.18)}100%{transform:scale(1);opacity:1}}
.rot2-screen::-webkit-scrollbar{display:none}
[data-tab="rotina"] button{-webkit-tap-highlight-color:transparent;touch-action:manipulation}
@media (prefers-reduced-motion:reduce){
  [data-tab="rotina"] *{animation:none!important;transition-duration:.01ms!important}
}
`;

function playDing() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.18);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.5);
    setTimeout(() => {
      try {
        ctx.close();
      } catch {
        /* noop */
      }
    }, 700);
  } catch {
    /* noop */
  }
}

const Shine = () => (
  <div
    aria-hidden
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "55%",
      height: "100%",
      pointerEvents: "none",
      background: "linear-gradient(105deg,transparent 0%,rgba(255,255,255,.28) 50%,transparent 100%)",
      animation: "rot2-shine 6.5s ease-in-out infinite",
      borderRadius: "inherit",
    }}
  />
);

const Gloss = ({
  colors,
  children,
  size = 36,
}: {
  colors: [string, string, string];
  children: ReactNode;
  size?: number;
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 12,
      flex: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `radial-gradient(130% 130% at 30% 22%, #fff 0%, ${colors[0]} 16%, ${colors[1]} 55%, ${colors[2]} 100%)`,
      boxShadow:
        "0 6px 14px rgba(120,70,40,.22), inset 0 2px 3px rgba(255,255,255,.72), inset 0 -5px 10px rgba(0,0,0,.16)",
    }}
  >
    {children}
  </div>
);

const TaskRow = ({
  task,
  done,
  period,
  onComplete,
}: {
  task: RoutineTask;
  done: boolean;
  period: RoutinePeriod;
  onComplete: () => void;
}) => {
  const Icon = ICONS[task.icon] ?? Sparkles;
  const meta = PERIOD_META[period];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 16,
        background: done
          ? "linear-gradient(155deg, rgba(210,240,214,.55), rgba(255,255,255,.4))"
          : "linear-gradient(155deg, rgba(255,255,255,.72), rgba(255,248,240,.45))",
        border: done
          ? "0.5px solid rgba(90,180,110,.35)"
          : "0.5px solid rgba(255,255,255,.9)",
        boxShadow: "0 4px 12px rgba(120,70,40,.08), inset 0 1px 0 rgba(255,255,255,.9)",
        minHeight: 56,
      }}
    >
      <Gloss colors={meta.g} size={34}>
        <Icon size={16} color="#fff" strokeWidth={2} />
      </Gloss>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 800,
            color: INK,
            lineHeight: 1.2,
            textDecoration: done ? "none" : "none",
            opacity: done ? 0.85 : 1,
          }}
        >
          {task.title}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: INK2,
            marginTop: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {task.short}
        </div>
      </div>
      {done ? (
        <div
          style={{
            flex: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "7px 11px",
            borderRadius: 999,
            background: "linear-gradient(180deg, #7BC88A 0%, #3E9A5E 100%)",
            color: "#fff",
            fontSize: 11.5,
            fontWeight: 900,
            boxShadow: "0 4px 10px rgba(60,140,80,.3)",
            animation: "rot2-pop .3s both",
          }}
        >
          <Check size={13} strokeWidth={2.6} />
          Concluído
        </div>
      ) : (
        <button
          type="button"
          onClick={onComplete}
          className="active:scale-95"
          aria-label={`Concluir: ${task.title}`}
          style={{
            flex: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 14px",
            minHeight: 36,
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            /* Sólido por período — sem degradê bugado dourado→verde (relatório r2) */
            background: meta.btn,
            color: "#fff",
            fontFamily: FONT,
            fontSize: 12,
            fontWeight: 900,
            boxShadow: `0 6px 14px ${meta.btn}55, inset 0 1px 0 rgba(255,255,255,.35)`,
            transition: "transform .15s ease, filter .2s ease",
          }}
        >
          Já fiz
        </button>
      )}
    </div>
  );
};

const PeriodBlock = ({
  period,
  tasks,
  done,
  isNow,
  onComplete,
  delay,
}: {
  period: RoutinePeriod;
  tasks: RoutineTask[];
  done: Set<string>;
  isNow: boolean;
  onComplete: (id: string) => void;
  delay: number;
}) => {
  const meta = PERIOD_META[period];
  const doneN = tasks.filter((t) => done.has(t.id)).length;
  if (!tasks.length) return null;
  const Icon = meta.Icon;

  return (
    <div
      style={{
        ...sectionWrap,
        marginBottom: GAP + 6,
        animation: `rot2-cascade .55s cubic-bezier(.22,1,.36,1) ${delay}s both`,
      }}
    >
      <div
        style={{
          ...glass,
          borderRadius: R.card,
          overflow: "hidden",
          padding: 0,
          position: "relative",
        }}
      >
        {/* Cover */}
        <div
          style={{
            position: "relative",
            height: 148,
            overflow: "hidden",
          }}
        >
          <img
            src={meta.cover}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 40%",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                period === "night"
                  ? "linear-gradient(180deg, rgba(20,16,40,.15) 0%, rgba(20,16,40,.55) 100%)"
                  : "linear-gradient(180deg, rgba(40,30,20,.08) 0%, rgba(40,30,20,.45) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 14,
              bottom: 12,
              right: 14,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    display: "grid",
                    placeItems: "center",
                    background: "rgba(255,255,255,.88)",
                    boxShadow: "0 4px 10px rgba(0,0,0,.15)",
                  }}
                >
                  <Icon size={15} color={meta.btn} strokeWidth={2.2} />
                </div>
                {isNow && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: "0.4px",
                      color: "#fff",
                      padding: "3px 9px",
                      borderRadius: 999,
                      background: `linear-gradient(180deg, ${ORANGE}, #C7602E)`,
                      boxShadow: "0 3px 8px rgba(200,100,50,.4)",
                    }}
                  >
                    AGORA
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: 22,
                  color: "#fff",
                  textShadow: "0 2px 12px rgba(0,0,0,.35)",
                  lineHeight: 1.1,
                }}
              >
                {meta.label}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "rgba(255,255,255,.88)",
                  marginTop: 3,
                  maxWidth: 240,
                  lineHeight: 1.35,
                  textShadow: "0 1px 6px rgba(0,0,0,.3)",
                }}
              >
                {meta.sub}
              </div>
            </div>
            <div
              style={{
                ...pillGlass,
                padding: "6px 11px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 900,
                color: INK,
                flex: "none",
              }}
            >
              {doneN}/{tasks.length}
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              done={done.has(t.id)}
              period={period}
              onComplete={() => onComplete(t.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const RoutineScreen = () => {
  const { profile } = useAuth();
  const { addMemory } = useMemories();
  const { canUse } = useEntitlement();
  const childName = profile?.child_name || "amigo";
  const pontos = profile?.points ?? 0;
  const isPremium = canUse("rotina");

  const [view, setView] = useState<TodayView>(() => getToday());
  const [streak, setStreak] = useState(() => getStreak());
  const [mission, setMission] = useState(() => getMissionProgress());
  const [celebrate, setCelebrate] = useState(false);

  const memorySaved = useRef(false);
  const encouragementIdx = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const heroArtRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const refresh = () => {
      setView(getToday());
      setStreak(getStreak());
      setMission(getMissionProgress());
    };
    const iv = setInterval(refresh, 60_000);
    const onVis = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    refresh();
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    const sc = scrollRef.current;
    const hero = heroArtRef.current;
    if (!sc || !hero) return;
    const onScroll = () => {
      const y = sc.scrollTop;
      hero.style.transform = `translateY(${y * 0.22}px) scale(${1 + y * 0.00025})`;
      hero.style.opacity = String(Math.max(0.35, 1 - y / 280));
    };
    sc.addEventListener("scroll", onScroll, { passive: true });
    return () => sc.removeEventListener("scroll", onScroll);
  }, []);

  const currentPeriod = getCurrentPeriod();
  const message = useMemo(() => getKidzzMessage(view, childName), [view, childName]);
  const h = new Date().getHours();
  const saudacao = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  const missionDone = mission.percent >= 100;

  const handleComplete = useCallback(
    (id: string) => {
      haptic("success");
      const result = completeTask(id);
      if (!result.newlyDone) return;
      setView(getToday());
      setStreak(getStreak());
      setMission(getMissionProgress());
      showXpGained(result.xpGained, "XP");
      if (result.bonusGained > 0) {
        setTimeout(() => showXpGained(result.bonusGained, "BÔNUS"), 350);
      }
      const phrase = ENCOURAGEMENTS[encouragementIdx.current % ENCOURAGEMENTS.length];
      encouragementIdx.current += 1;
      toast.success(phrase, { duration: 1500, position: "bottom-center" });
      playDing();
      const colors = ["#F59E0B", "#EC4899", "#A855F7", "#10B981", "#3B82F6", "#FFD86E"];
      confetti({
        particleCount: 60,
        spread: 75,
        startVelocity: 38,
        origin: { y: 0.6 },
        scalar: 0.9,
        ticks: 140,
        colors,
      });
      setTimeout(() => {
        confetti({
          particleCount: 35,
          spread: 90,
          startVelocity: 30,
          origin: { y: 0.55 },
          scalar: 0.8,
          ticks: 110,
          colors,
        });
      }, 250);
      if (result.allDone) {
        setCelebrate(true);
        setTimeout(() => {
          confetti({ particleCount: 120, spread: 110, origin: { y: 0.5 }, ticks: 180, colors });
        }, 200);
        if (!memorySaved.current) {
          memorySaved.current = true;
          try {
            addMemory({
              type: "achievement" as never,
              title: "Dia completo na Rotina",
              content: `${childName} completou todas as ${result.total} tarefas de hoje 💛`,
              is_special: true,
              image_url: null,
              metadata: {
                source: "routine",
                date: new Date().toISOString().split("T")[0],
                xp: result.xpGained + result.bonusGained,
              },
            });
          } catch {
            /* noop */
          }
        }
        setTimeout(() => setCelebrate(false), 4200);
      }
    },
    [addMemory, childName],
  );

  return (
    <div
      data-tab="rotina"
      className="rot2-screen"
      style={{
        height: "100%",
        position: "relative",
        fontFamily: FONT,
        background: "#F6E2D6",
        color: INK,
        overflow: "hidden",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* Camadas fundo — print cream + hero */}
      <div
        aria-hidden
        ref={heroArtRef}
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${CAMALEAO.armsSoft})`,
          backgroundSize: "cover",
          backgroundPosition: "72% 18%",
          filter: "brightness(.96) saturate(1.08)",
          transform: "scale(1.06)",
          willChange: "transform, opacity",
          animation: "rot2-heroIn .7s cubic-bezier(.22,1,.36,1) both",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(251,239,231,.42) 0%, rgba(246,226,214,.55) 22%, rgba(246,226,214,.88) 48%, rgba(239,212,196,.96) 72%, #EFD4C4 100%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(48% 30% at 80% 12%, rgba(255,190,120,.28), transparent 70%), radial-gradient(40% 26% at 12% 50%, rgba(255,160,140,.14), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -60,
          right: -50,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,190,120,.32), transparent 65%)",
          filter: "blur(28px)",
          animation: "rot2-drift 14s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      {[
        { t: 88, l: "16%", d: "0s" },
        { t: 150, l: "62%", d: "1s" },
        { t: 240, l: "38%", d: "2s" },
      ].map((p, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            top: p.t,
            left: p.l,
            width: 4,
            height: 4,
            borderRadius: 99,
            background: "#FFE9A8",
            boxShadow: "0 0 10px 3px rgba(255,200,100,.7)",
            animation: `rot2-twinkle ${3 + i * 0.4}s ease-in-out ${p.d} infinite`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      ))}

      <div
        ref={scrollRef}
        style={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
          overscrollBehavior: "contain",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)",
          scrollbarWidth: "none",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Sticky chips */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)",
            paddingLeft: PAD,
            paddingRight: PAD,
            paddingBottom: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
            background:
              "linear-gradient(180deg, rgba(251,239,231,.9) 0%, rgba(251,239,231,.4) 70%, transparent 100%)",
            backdropFilter: "blur(18px) saturate(160%)",
            WebkitBackdropFilter: "blur(18px) saturate(160%)",
          }}
        >
          {streak.current > 0 && (
            <div
              style={{
                ...pillGlass,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 12px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 900,
                color: INK,
              }}
              aria-label={`Sequência de ${streak.current} dias`}
            >
              <Flame size={14} color={ORANGE} fill={ORANGE} />
              {streak.current}
            </div>
          )}
          <div
            style={{
              ...pillGlass,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 12px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 900,
              color: INK,
            }}
          >
            <Trophy size={13} color={GOLD} />
            {pontos}
          </div>
        </div>

        {/* Hero copy + art peek */}
        <div
          style={{
            padding: `4px ${PAD}px 0`,
            display: "grid",
            gridTemplateColumns: "1fr minmax(120px, 42%)",
            gap: 8,
            alignItems: "start",
            minHeight: 200,
            animation: "rot2-cascade .55s cubic-bezier(.22,1,.36,1) .04s both",
          }}
        >
          <div style={{ paddingTop: 8, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 800,
                color: INK2,
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {saudacao}, família!
              <span aria-hidden style={{ color: ACCENT }}>
                ♥
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 28,
                lineHeight: 1.12,
                color: INK,
                letterSpacing: "-0.4px",
              }}
            >
              Rotina que cria{" "}
              <span style={{ color: ACCENT }}>momentos</span> que ficam.
            </h1>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 12.5,
                fontWeight: 700,
                lineHeight: 1.45,
                color: INK2,
                maxWidth: 220,
              }}
            >
              {message || "Pequenas ações diárias constroem lembranças para a vida toda."}
            </p>
            {streak.missedYesterday && streak.current === 0 && (
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 11.5,
                  fontWeight: 700,
                  fontStyle: "italic",
                  color: "#B0765A",
                }}
              >
                Tudo bem… hoje é um novo começo 💛
              </p>
            )}
          </div>
          <div
            style={{
              position: "relative",
              height: 210,
              marginRight: -PAD,
              marginTop: -8,
              animation: "rot2-floaty 7s ease-in-out infinite",
            }}
          >
            <img
              src={CAMALEAO.armsSoft}
              alt="Gui, o camaleão, com o calendário da rotina"
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: "118%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "right bottom",
                ...CAMALEAO_SCENE_MASK,
                filter: "drop-shadow(0 12px 28px rgba(80,50,30,.28))",
                pointerEvents: "none",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = CAMALEAO.arms;
              }}
            />
          </div>
        </div>

        {/* Premium gate */}
        {!isPremium && (
          <div
            style={{
              ...sectionWrap,
              marginTop: 4,
              animation: "rot2-cascade .55s cubic-bezier(.22,1,.36,1) .1s both",
            }}
          >
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("kidzz:open-plans"))}
              className="active:scale-[0.98]"
              style={{
                ...glass,
                position: "relative",
                overflow: "hidden",
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                borderRadius: 20,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Shine />
              <Gloss colors={["#FFE9A8", "#F2B23B", "#C77E12"]} size={38}>
                <Crown size={17} color="#fff" strokeWidth={2} />
              </Gloss>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 600,
                    fontSize: 14,
                    color: INK,
                    lineHeight: 1.2,
                  }}
                >
                  Desbloqueie tudo com o plano premium
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: INK2, marginTop: 2 }}>
                  Mais rotinas, lembretes e relatórios para os pais.
                </div>
              </div>
              <span style={{ color: ORANGE, fontSize: 18, fontWeight: 700 }}>›</span>
            </button>
          </div>
        )}

        {/* Missão do dia */}
        <div
          style={{
            ...sectionWrap,
            marginTop: 4,
            animation: "rot2-cascade .55s cubic-bezier(.22,1,.36,1) .14s both",
          }}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: R.panel,
              padding: "14px 16px",
              background:
                "linear-gradient(150deg, rgba(60,72,50,.94), rgba(38,50,32,.96))",
              border: "0.5px solid rgba(255,255,255,.14)",
              boxShadow:
                "0 14px 30px rgba(30,40,20,.32), inset 0 1.5px 0 rgba(255,255,255,.14)",
            }}
          >
            <Shine />
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Sparkles size={12} color="#F2C24C" />
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 900,
                  letterSpacing: "1.3px",
                  color: "#E8C88A",
                }}
              >
                MISSÃO DO DIA
              </span>
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: 15.5,
                color: "#F5EEDF",
                lineHeight: 1.35,
                marginBottom: 12,
              }}
            >
              {missionDone
                ? "“Missão de hoje concluída — que dia lindo!”"
                : "“Ouça uma música, faça uma pergunta e viva uma história.”"}
            </div>
            <div
              style={{
                height: 7,
                borderRadius: 99,
                background: "rgba(255,255,255,.14)",
                overflow: "hidden",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: `${mission.percent}%`,
                  height: "100%",
                  borderRadius: 99,
                  background: "linear-gradient(90deg,#E8C88A,#F2C24C)",
                  transition: "width 1s cubic-bezier(.22,1,.36,1)",
                  minWidth: mission.percent > 0 ? 8 : 0,
                }}
              />
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: missionDone ? "#A8E0B0" : "rgba(245,238,223,.85)",
                textAlign: "center",
              }}
            >
              {missionDone ? "Missão concluída!" : `${mission.done} de ${mission.total} conquistas`}
            </div>
          </div>
        </div>

        {/* Rotina de Hoje */}
        <div
          style={{
            ...sectionWrap,
            marginBottom: 8,
            animation: "rot2-cascade .55s cubic-bezier(.22,1,.36,1) .18s both",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 4,
              padding: "0 2px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: 18,
                  color: INK,
                  letterSpacing: "-0.3px",
                }}
              >
                Rotina de Hoje
              </h2>
              <Sun size={16} color={GOLD} fill={GOLD} />
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "5px 11px",
                borderRadius: 999,
                background: "rgba(240,180,80,.16)",
                border: "0.5px solid rgba(240,180,80,.3)",
                fontSize: 11,
                fontWeight: 900,
                color: "#C7841A",
              }}
            >
              <Trophy size={11} />
              {view.doneCount}/{view.total}
            </div>
          </div>
        </div>

        {PERIODS.map((key, i) => (
          <PeriodBlock
            key={key}
            period={key}
            tasks={view[key]}
            done={view.done}
            isNow={currentPeriod === key}
            onComplete={handleComplete}
            delay={0.2 + i * 0.06}
          />
        ))}

        {view.allDone && (
          <div
            style={{
              ...sectionWrap,
              animation: "rot2-rise .45s both",
            }}
          >
            <div
              style={{
                ...coloredGlass(240, 200, 120, 0.55, 0.22),
                borderRadius: R.panel,
                padding: "16px 18px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: 15.5,
                  color: INK,
                }}
              >
                Já fez bastante hoje 😊 Descanse, {childName}!
              </p>
            </div>
          </div>
        )}

        <div
          style={{
            padding: "8px 20px 20px",
            textAlign: "center",
            fontSize: 11,
            fontWeight: 800,
            color: "#B79A88",
          }}
        >
          Menos tela. Mais memórias. · KIDZZ
        </div>
      </div>

      {/* Celebração dia completo */}
      <AnimatePresence>
        {celebrate && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg,rgba(58,36,24,0),rgba(58,36,24,.14),rgba(58,36,24,0))",
              }}
            />
            <motion.div
              className="relative rounded-3xl px-6 py-5 text-center"
              style={{
                ...glass,
                borderRadius: 28,
                border: "1.5px solid rgba(232,178,90,.7)",
                boxShadow: "0 24px 60px rgba(150,90,60,.32)",
              }}
              initial={{ scale: 0.6, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 1.2, repeat: 1 }}
                className="inline-flex"
              >
                <Sparkles size={40} color={GOLD} fill={GOLD} />
              </motion.div>
              <h2
                style={{
                  margin: "8px 0 0",
                  fontFamily: SERIF,
                  fontWeight: 600,
                  fontSize: 20,
                  color: INK,
                }}
              >
                Você foi incrível hoje!
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 700, color: INK2 }}>
                Salvamos esse dia nas suas Memórias 💛
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoutineScreen;

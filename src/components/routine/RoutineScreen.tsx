/**
 * RoutineScreen — KIDZZ "Nossa Rotina" (redesign v-Rotina).
 *
 * Porta fiel do mockup public/exemplos/Rotina.dc.html (estilos inline 1:1,
 * paleta quente / "espelho gentil do dia") ligado aos DADOS REAIS do app:
 *  - Pequenas vitórias   → tarefas reais do dia (getToday/completeTask), por período
 *  - Termômetro do dia   → % de conclusão por categoria (dado real)
 *  - Missão do dia       → progresso da missão diária (getMissionProgress)
 *  - Streak / contagem   → getStreak / view.doneCount
 *  - Premium gate        → useEntitlement.canUse("rotina")
 *  - Memória ao completar tudo, confete, XP, som e toasts: preservados 1:1.
 *
 * "Como estamos hoje?" (humor da família) é uma interação local efêmera —
 * paridade com o design (o próprio mockup usa estado local, sem persistência).
 *
 * A barra de navegação inferior é a BottomNav global (o dock do design NÃO é
 * reproduzido). Animações usam keyframes locais prefixados "rot-".
 */

import { useState, useEffect, useMemo, useCallback, useRef, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smile, Droplet, BedDouble, Coffee, Heart, Music2, MessageCircleHeart,
  Apple, BookOpen, Palette, Zap, Users, Package, Blocks, Footprints,
  Wind, Star, Shirt, HandMetal, Sparkles, Sun, Cloud, Moon,
} from "lucide-react";
import {
  getToday, completeTask, getStreak, getKidzzMessage, getCurrentPeriod,
  type RoutineTask, type RoutinePeriod, type RoutineCategory, type TodayView,
} from "@/lib/routine";
import { getMissionProgress } from "@/lib/dailyMission";
import { showXpGained } from "@/components/flow/XpToast";
import { haptic } from "@/lib/haptics";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/hooks/useEntitlement";
import { useMemories } from "@/hooks/useMemories";
import confetti from "canvas-confetti";
import { toast } from "sonner";

const ENCOURAGEMENTS = [
  "Incrível! Você arrasou! 🌟",
  "Que criança incrível! ⭐",
  "Kidzz ficou super feliz! 💛",
  "Missão cumprida! 🎯",
  "Você é demais! 🚀",
  "Continua assim, campeão(ã)! 🏆",
];

// Lightweight "ding" using WebAudio (no asset needed).
function playDing() {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
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
    o.connect(g); g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.5);
    setTimeout(() => { try { ctx.close(); } catch { /* noop */ } }, 700);
  } catch { /* noop */ }
}

// Lucide icon registry — resolves task.icon (string) → component.
const ICONS: Record<string, typeof Smile> = {
  Smile, Droplet, BedDouble, Coffee, Heart, Music2, MessageCircleHeart,
  Apple, BookOpen, Palette, Zap, Users, Package, Blocks, Footprints,
  Wind, Star, Shirt, HandMetal, Sparkles, Sun, Cloud, Moon,
};

// ── Paletas do design (Rotina.dc.html) ──
const CAT_META: Record<RoutineCategory, { label: string; color: string; bar: [string, string]; gloss: [string, string, string] }> = {
  rotina:      { label: "Rotina",      color: "#5A9CE8", bar: ["#A8D0F0", "#5A9CE8"], gloss: ["#B4D8FF", "#5A9CE8", "#2D64B0"] },
  aprendizado: { label: "Aprendizado", color: "#E0A62B", bar: ["#FFD98A", "#E0A62B"], gloss: ["#FFE9A8", "#F2B23B", "#C77E12"] },
  emocao:      { label: "Emoção",      color: "#E0679B", bar: ["#F0B8C8", "#E0679B"], gloss: ["#F0B8C8", "#E0679B", "#B0446E"] },
  energia:     { label: "Energia",     color: "#E8824E", bar: ["#FFB98A", "#E8824E"], gloss: ["#FFD9A8", "#F0A24C", "#C77E1E"] },
  vida:        { label: "Vida",        color: "#4EA35E", bar: ["#8FE0A0", "#4EA35E"], gloss: ["#C0EDC8", "#5CB57A", "#2F7A4E"] },
};

const PERIODS: { key: RoutinePeriod; label: string }[] = [
  { key: "morning", label: "Manhã" },
  { key: "afternoon", label: "Tarde" },
  { key: "night", label: "Noite" },
];

// Humores (paridade 1:1 com o design — estado local efêmero).
const MOODS: { key: string; label: string; mouth: string; fill: string }[] = [
  { key: "feliz",    label: "Feliz",    mouth: "M14.5 24c1.5 1.5 4 2.2 5.5 2.2s4-.7 5.5-2.2", fill: "#F2C94C" },
  { key: "neutro",   label: "Neutro",   mouth: "M14 25h12", fill: "#F2C94C" },
  { key: "triste",   label: "Triste",   mouth: "M14.5 26.5c1.5-1.8 4-2.4 5.5-2.4s4 .6 5.5 2.4", fill: "#E8C86A" },
  { key: "irritado", label: "Irritado", mouth: "M14.5 26c1.5-1.8 4-2.4 5.5-2.4s4 .6 5.5 2.4", fill: "#F0975A" },
  { key: "ansioso",  label: "Ansioso",  mouth: "M14 25c1.2 1 2 1 3 0s2-1 3 0 2 1 3 0", fill: "#E8B25A" },
  { key: "cansado",  label: "Cansado",  mouth: "M14 25h12", fill: "#D9C08A" },
];

// ── Helpers de estilo (portados do design) ──
const gloss = (g: [string, string, string], size = 40, radius = 13): CSSProperties => ({
  flex: "none", width: size, height: size, borderRadius: radius,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${g[0]} 18%, ${g[1]} 58%, ${g[2]} 100%)`,
  boxShadow: "0 5px 12px rgba(150,90,60,.25), inset 0 1.5px 2px rgba(255,255,255,.7), inset 0 -4px 8px rgba(0,0,0,.16)",
});
const glassCard: CSSProperties = {
  background: "linear-gradient(155deg,rgba(255,255,255,.9),rgba(246,226,214,.6))",
  backdropFilter: "blur(18px) saturate(160%)", WebkitBackdropFilter: "blur(18px) saturate(160%)",
  border: "1px solid rgba(255,255,255,1)",
  boxShadow: "0 14px 30px rgba(150,90,60,.14),inset 0 1.5px 0 rgba(255,255,255,1)",
};
// Vidro mais suave do card "Termômetro" (valores exatos do design).
const glassCardSoft: CSSProperties = {
  background: "linear-gradient(155deg,rgba(255,255,255,.88),rgba(246,226,214,.55))",
  backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)",
  border: "1px solid rgba(255,255,255,1)",
  boxShadow: "0 12px 26px rgba(150,90,60,.12),inset 0 1.5px 0 rgba(255,255,255,1)",
};
const eyebrow: CSSProperties = { fontSize: 11, fontWeight: 900, letterSpacing: "1.4px", color: "#B0765A" };
const sectionTitle: CSSProperties = { margin: "2px 0 0", fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 18, color: "#3A2418" };
const chipGlass: CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 999,
  background: "rgba(255,255,255,.62)", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)",
  border: "1px solid rgba(255,255,255,1)", boxShadow: "0 6px 16px rgba(150,90,60,.18),inset 0 1px 0 rgba(255,255,255,1)",
  fontWeight: 800, fontSize: 13, color: "#5A3A2A",
};

// SVG paths de chrome (do design)
const P = {
  shield: "M12 3l7 2.5V11c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V5.5Z",
  trophy: "M8 4h8v3a4 4 0 0 1-8 0V4Zm-4 1h4v2a4 4 0 0 1-4-2Zm16 0h-4v2a4 4 0 0 0 4-2Zm-8 6.5V17m-3.5 3h7M9.5 17h5",
  sparkle: "M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8L12 4Z",
  flame: "M12 3c.8 2.5 2.6 3.6 2.6 6.2A2.6 2.6 0 0 1 9.4 9c0-.9.3-1.6.7-2.3C8 7.5 6.8 9.4 6.8 11.6a5.2 5.2 0 0 0 10.4 0C17.2 7.7 14.6 5.7 12 3Z",
  check: "m5 12 5 5L20 6",
};

// ─────────────────────────────────────────────────────────────────────────────
// Task card (estilo "vitória" do design) — dado real
// ─────────────────────────────────────────────────────────────────────────────
const TaskCard = ({ task, done, onComplete }: { task: RoutineTask; done: boolean; onComplete: () => void }) => {
  const Icon = ICONS[task.icon] ?? Sparkles;
  const meta = CAT_META[task.category];
  const cardStyle: CSSProperties = {
    position: "relative", display: "flex", alignItems: "center", gap: 12, borderRadius: 18,
    padding: "11px 13px", cursor: "pointer", transition: "transform .2s", fontFamily: "'Nunito',sans-serif",
    width: "100%", textAlign: "left", WebkitTapHighlightColor: "transparent",
    background: done
      ? "linear-gradient(155deg,rgba(210,240,214,.7),rgba(190,225,195,.5))"
      : "linear-gradient(155deg,rgba(255,255,255,.85),rgba(246,226,214,.5))",
    backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
    border: done ? "1px solid rgba(90,180,110,.4)" : "1px solid rgba(255,255,255,1)",
    boxShadow: "0 8px 18px rgba(150,90,60,.1), inset 0 1.5px 0 rgba(255,255,255,1)",
  };
  const checkStyle: CSSProperties = {
    flex: "none", width: 26, height: 26, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all .25s",
    background: done ? "radial-gradient(130% 130% at 30% 22%,#8FE0A0,#4EA35E 55%,#2E7A42)" : "rgba(150,90,60,.1)",
    border: done ? "1px solid rgba(255,255,255,.5)" : "2px solid rgba(150,90,60,.2)",
  };
  return (
    <button type="button" onClick={onComplete} style={cardStyle} aria-label={done ? `${task.title} (concluído)` : `Concluir: ${task.title}`}>
      <div style={gloss(meta.gloss)}>
        <Icon size={18} color="#fff" strokeWidth={1.9} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13.5, fontWeight: 800, color: "#3A2418", lineHeight: 1.2 }}>{task.title}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#8A6450", lineHeight: 1.3, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.short}</div>
      </div>
      <div style={checkStyle}>
        {done && (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: "rot-pop .3s both" }}>
            <path d={P.check} stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────
const RoutineScreen = () => {
  const { profile } = useAuth();
  const { addMemory } = useMemories();
  const { canUse } = useEntitlement();
  const childName = profile?.child_name || "amigo";
  const isPremium = canUse("rotina");

  const [view, setView] = useState<TodayView>(() => getToday());
  const [streak, setStreak] = useState(() => getStreak());
  const [mission, setMission] = useState(() => getMissionProgress());
  const [celebrate, setCelebrate] = useState(false);
  const [quem, setQuem] = useState<"crianca" | "pai">("crianca");
  const [mood, setMood] = useState<string | null>(null);

  const memorySaved = useRef(false);
  const encouragementIdx = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const heroWrapRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);

  // Refresh on mount + every minute (period rollover) + on visibility change
  useEffect(() => {
    const refresh = () => {
      setView(getToday());
      setStreak(getStreak());
      setMission(getMissionProgress());
    };
    const iv = setInterval(refresh, 60_000);
    const onVis = () => { if (!document.hidden) refresh(); };
    document.addEventListener("visibilitychange", onVis);
    refresh();
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  // Parallax do hero (portado do design)
  const onScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const sc = scrollRef.current, hero = heroWrapRef.current;
      if (!sc || !hero) return;
      const y = sc.scrollTop;
      hero.style.transform = `translateY(${y * 0.42}px) scale(${1 + y * 0.0004})`;
      hero.style.opacity = String(Math.max(0, 1 - y / 250));
    });
  }, []);
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const currentPeriod = getCurrentPeriod();
  const message = useMemo(() => getKidzzMessage(view, childName), [view, childName]);

  const allTasks = useMemo(() => [...view.morning, ...view.afternoon, ...view.night], [view]);

  const termometro = useMemo(() => {
    return (Object.keys(CAT_META) as RoutineCategory[])
      .map((cat) => {
        const inCat = allTasks.filter((t) => t.category === cat);
        const total = inCat.length;
        const done = inCat.filter((t) => view.done.has(t.id)).length;
        const pct = total ? Math.round((done / total) * 100) : 0;
        return { cat, total, done, pct, ...CAT_META[cat] };
      })
      .filter((t) => t.total > 0);
  }, [allTasks, view.done]);

  const handleComplete = useCallback((id: string) => {
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
    confetti({ particleCount: 60, spread: 75, startVelocity: 38, origin: { y: 0.6 }, scalar: 0.9, ticks: 140, colors });
    setTimeout(() => {
      confetti({ particleCount: 35, spread: 90, startVelocity: 30, origin: { y: 0.55 }, scalar: 0.8, ticks: 110, colors });
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
            type: "achievement" as any,
            title: "Dia completo na Rotina",
            content: `${childName} completou todas as ${result.total} tarefas de hoje 💛`,
            is_special: true,
            image_url: null,
            metadata: { source: "routine", date: new Date().toISOString().split("T")[0], xp: result.xpGained + result.bonusGained },
          });
        } catch { /* noop */ }
      }
      setTimeout(() => setCelebrate(false), 4200);
    }
  }, [addMemory, childName]);

  const missionDone = mission.percent >= 100;

  return (
    <div className="rot-screen" style={{ height: "100%", position: "relative", fontFamily: "'Nunito',system-ui,sans-serif", background: "linear-gradient(180deg,#FBEFE7 0%,#F6E2D6 42%,#EFD4C4 75%,#E7C6B2 100%)" }}>
      {/* keyframes locais (prefixo rot-) */}
      <style>{`
        @keyframes rot-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes rot-twinkle{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.15)}}
        @keyframes rot-drift1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,24px) scale(1.16)}}
        @keyframes rot-drift2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-34px,-18px) scale(1.1)}}
        @keyframes rot-shine{0%{transform:translateX(-130%) skewX(-18deg)}60%,100%{transform:translateX(240%) skewX(-18deg)}}
        @keyframes rot-cascade{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rot-heroIn{from{opacity:0;transform:translateY(-14px) scale(1.04)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes rot-pop{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
        @keyframes rot-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rot-sheen{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}
        @media (prefers-reduced-motion: reduce){
          .rot-screen *,.rot-screen *::before,.rot-screen *::after{animation-duration:.001ms !important;animation-iteration-count:1 !important;animation-delay:0ms !important;transition-duration:.001ms !important}
        }
      `}</style>

      {/* orbes/blobs de luz */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(45% 28% at 78% 16%,rgba(255,180,120,.18),transparent 70%),radial-gradient(42% 28% at 12% 55%,rgba(255,150,150,.14),transparent 70%),radial-gradient(50% 30% at 60% 92%,rgba(230,140,90,.12),transparent 70%)" }} />
      <div style={{ position: "absolute", top: -50, left: -70, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,190,140,.28),transparent 65%)", filter: "blur(30px)", animation: "rot-drift1 15s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 110, right: -90, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(240,160,150,.2),transparent 65%)", filter: "blur(32px)", animation: "rot-drift2 18s ease-in-out 3s infinite", pointerEvents: "none" }} />

      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{ height: "100%", overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)", scrollbarWidth: "none", position: "relative" }}
      >
        {/* ── HERO ── */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 414, backgroundImage: "url('/exemplos/assets/cena-rotina.png')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(46px) saturate(1.45)", opacity: 0.5, transform: "scale(1.22)", pointerEvents: "none" }} />
          <div
            ref={heroWrapRef}
            style={{ position: "relative", width: "100%", height: 414, willChange: "transform", WebkitMaskImage: "radial-gradient(125% 94% at 50% 22%,#000 50%,rgba(0,0,0,.42) 74%,transparent 100%)", maskImage: "radial-gradient(125% 94% at 50% 22%,#000 50%,rgba(0,0,0,.42) 74%,transparent 100%)", animation: "rot-heroIn .7s cubic-bezier(.22,1,.36,1) both" }}
          >
            <img src="/exemplos/assets/cena-rotina.png" alt="Gui, o camaleão, na floresta" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 34%", animation: "rot-floaty 7s ease-in-out infinite", filter: "saturate(1.08) contrast(1.02)" }} />
            <div style={{ position: "absolute", top: 60, left: "20%", width: 5, height: 5, borderRadius: 99, background: "#FFE9A8", boxShadow: "0 0 10px 3px rgba(255,200,120,.8)", animation: "rot-twinkle 3s ease-in-out infinite" }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(180deg,rgba(251,239,231,.16) 0%,rgba(251,239,231,0) 30%,rgba(80,50,40,.05) 62%,rgba(251,239,231,.86) 90%,#FBEFE7 100%)" }} />
          </div>

          {/* chip topo-direita: streak (Pais fica só no dock global) */}
          {streak.current > 0 && (
            <div style={{ position: "absolute", top: 62, right: 16, display: "flex", gap: 8, zIndex: 6 }}>
              <div style={chipGlass} aria-label={`Sequência de ${streak.current} dias`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#E8824E"><path d={P.flame} /></svg>
                {streak.current}
              </div>
            </div>
          )}

          {/* texto do hero */}
          <div style={{ padding: "14px 20px 2px", animation: "rot-cascade .6s cubic-bezier(.22,1,.36,1) .06s both", position: "relative" }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "1.8px", color: "#C77A4A", marginBottom: 8 }}>NOSSA ROTINA</div>
            <h1 style={{ margin: "0 0 6px", fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 28, lineHeight: 1.14, color: "#3A2418", letterSpacing: "-.3px" }}>
              Pequenos rituais, <span style={{ color: "#D9741E" }}>grandes laços</span>.
            </h1>
            <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, lineHeight: 1.45, color: "#8A6450", maxWidth: 290 }}>
              {message}
            </p>
            {streak.missedYesterday && streak.current === 0 && (
              <p style={{ margin: "8px 0 0", fontSize: 11.5, fontWeight: 700, fontStyle: "italic", color: "#B0765A" }}>
                Tudo bem… hoje é um novo começo 💛
              </p>
            )}
          </div>
        </div>

        {/* ── Premium gate (mantém funcionalidade real) ── */}
        {!isPremium && (
          <div style={{ padding: "14px 16px 0", animation: "rot-cascade .6s cubic-bezier(.22,1,.36,1) .1s both" }}>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("kidzz:open-plans"))}
              className="active:scale-[0.98]"
              style={{ ...glassCard, position: "relative", overflow: "hidden", width: "100%", textAlign: "left", cursor: "pointer", borderRadius: 22, padding: "13px 14px", display: "flex", alignItems: "center", gap: 12 }}
            >
              <span aria-hidden style={{ position: "absolute", top: 0, left: 0, width: "38%", height: "100%", pointerEvents: "none", background: "linear-gradient(105deg,transparent,rgba(255,255,255,.55) 50%,transparent)", animation: "rot-sheen 6s ease-in-out 1.2s infinite" }} />
              <div style={gloss(["#FFE9A8", "#F2B23B", "#C77E12"], 40, 12)}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M5 8l4 3 3-5 3 5 4-3-1.5 9h-11L5 8Z" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 14.5, color: "#3A2418", lineHeight: 1.2 }}>Desbloqueie tudo com o Premium</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#8A6450", marginTop: 2 }}>Mais rotina, histórias, sonhos e relatórios para os pais.</div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="#C77A4A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        )}

        {/* ── COMO ESTAMOS HOJE? (humor — interação local) ── */}
        <div style={{ padding: "18px 16px 0", animation: "rot-cascade .6s cubic-bezier(.22,1,.36,1) .12s both" }}>
          <div style={{ ...glassCard, borderRadius: 24, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={eyebrow}>COMO ESTAMOS HOJE?</div>
              <div style={{ display: "flex", padding: 3, borderRadius: 999, background: "rgba(200,130,90,.12)" }}>
                {([["crianca", "Criança"], ["pai", "Pai/Mãe"]] as const).map(([id, label]) => {
                  const on = quem === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setQuem(id)}
                      style={{ padding: "6px 14px", borderRadius: 999, cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontSize: 11.5, fontWeight: 900, transition: "all .25s", border: "none", color: on ? "#fff" : "#B0765A", background: on ? "radial-gradient(130% 130% at 30% 22%,#FFB98A,#E8824E 60%,#C7602E)" : "transparent", boxShadow: on ? "0 4px 10px rgba(200,100,50,.35)" : "none" }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 7 }}>
              {MOODS.map((m) => {
                const on = mood === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    className="active:scale-90"
                    onClick={() => { setMood(m.key); haptic("light"); toast.success("Humor registrado 🧡", { duration: 1400, position: "bottom-center" }); }}
                    style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 2px", borderRadius: 15, cursor: "pointer", transition: "all .2s", background: on ? "rgba(232,130,78,.14)" : "rgba(255,255,255,.5)", border: on ? "1.5px solid #E8824E" : "1px solid rgba(0,0,0,.05)", boxShadow: on ? "0 6px 14px rgba(232,130,78,.25)" : "inset 0 1px 0 rgba(255,255,255,.6)" }}
                  >
                    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="16" fill={m.fill} stroke={on ? "#E8824E" : "rgba(0,0,0,.06)"} strokeWidth="1.5" />
                      <circle cx="14.5" cy="17" r="1.8" fill="#3A2E12" /><circle cx="25.5" cy="17" r="1.8" fill="#3A2E12" />
                      <path d={m.mouth} stroke="#3A2E12" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                    </svg>
                    <span style={{ fontSize: 8.5, fontWeight: 800, color: on ? "#C7602E" : "#A0846E" }}>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── MISSÃO DO DIA (progresso real da missão diária) ── */}
        <div style={{ padding: "14px 16px 0", animation: "rot-cascade .6s cubic-bezier(.22,1,.36,1) .18s both" }}>
          <div style={{ position: "relative", overflow: "hidden", borderRadius: 22, padding: "16px 17px", background: "linear-gradient(150deg,rgba(60,72,50,.94),rgba(38,50,32,.96))", border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 14px 30px rgba(30,40,20,.35),inset 0 1.5px 0 rgba(255,255,255,.15)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "50%", height: "100%", pointerEvents: "none", background: "linear-gradient(105deg,transparent,rgba(255,255,255,.1) 50%,transparent)", animation: "rot-shine 7s ease-in-out infinite" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#F2C24C"><path d={P.sparkle} /></svg>
              <span style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "1.4px", color: "#E8C88A" }}>MISSÃO DO DIA</span>
            </div>
            <div style={{ fontFamily: "'Lora',serif", fontStyle: "italic", fontWeight: 500, fontSize: 17, color: "#F5EEDF", lineHeight: 1.35, marginBottom: 14 }}>
              {missionDone ? "“Missão de hoje concluída — que dia lindo!”" : "“Ouça uma música, faça uma pergunta e viva uma história.”"}
            </div>
            {/* barra de progresso real */}
            <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,.14)", overflow: "hidden", marginBottom: 12, boxShadow: "inset 0 1px 2px rgba(0,0,0,.3), inset 0 -1px 0 rgba(255,255,255,.06)" }}>
              <div style={{ width: `${mission.percent}%`, height: "100%", borderRadius: 99, background: "linear-gradient(180deg,rgba(255,255,255,.4),rgba(255,255,255,0) 55%),linear-gradient(90deg,#E8C88A,#F2C24C)", transition: "width 1s cubic-bezier(.22,1,.36,1)", minWidth: mission.percent > 0 ? 10 : 0, boxShadow: mission.percent > 0 ? "0 0 8px rgba(242,194,76,.5), inset 0 1px 0 rgba(255,255,255,.5)" : "none" }} />
            </div>
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 14, background: missionDone ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 900, color: missionDone ? "#3A6B41" : "#F5EEDF" }}>
              {missionDone && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="m5 12 5 5L20 6" stroke="#3A6B41" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
              {missionDone ? "Missão concluída!" : `${mission.done} de ${mission.total} conquistas`}
            </div>
          </div>
        </div>

        {/* ── PEQUENAS VITÓRIAS (tarefas reais, por período) ── */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "22px 20px 10px" }}>
            <div>
              <div style={eyebrow}>PEQUENAS VITÓRIAS</div>
              <h2 style={sectionTitle}>Cada toque é uma vitória</h2>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 999, background: "rgba(240,180,80,.16)", border: "1px solid rgba(240,180,80,.3)", fontSize: 11, fontWeight: 900, color: "#C7841A" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d={P.trophy} stroke="#C7841A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {view.doneCount}/{view.total}
            </div>
          </div>

          {PERIODS.map(({ key, label }) => {
            const tasks = view[key];
            if (!tasks.length) return null;
            const doneInPeriod = tasks.filter((t) => view.done.has(t.id)).length;
            const isNow = currentPeriod === key;
            return (
              <div key={key} style={{ padding: "0 16px", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 4px 8px" }}>
                  <span style={eyebrow}>{label.toUpperCase()}</span>
                  {isNow && (
                    <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: ".3px", color: "#fff", padding: "2px 8px", borderRadius: 999, background: "radial-gradient(130% 130% at 30% 22%,#FFB98A,#E8824E 60%,#C7602E)", boxShadow: "0 3px 8px rgba(200,100,50,.35)" }}>AGORA</span>
                  )}
                  <span style={{ marginLeft: "auto", fontSize: 11.5, fontWeight: 900, color: "#B0765A" }}>{doneInPeriod}/{tasks.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {tasks.map((t) => (
                    <TaskCard key={t.id} task={t} done={view.done.has(t.id)} onComplete={() => handleComplete(t.id)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── TERMÔMETRO DO DIA (por categoria — dado real) ── */}
        {termometro.length > 0 && (
          <div>
            <div style={{ padding: "22px 20px 12px" }}>
              <div style={eyebrow}>TERMÔMETRO DO DIA</div>
              <h2 style={sectionTitle}>Como está seu equilíbrio</h2>
            </div>
            <div style={{ margin: "0 16px", borderRadius: 22, padding: "16px 17px", ...glassCardSoft }}>
              {termometro.map((t) => (
                <div key={t.cat} style={{ marginBottom: 13 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 99, background: `radial-gradient(130% 130% at 30% 22%,${t.bar[0]},${t.bar[1]})`, boxShadow: "0 2px 4px rgba(0,0,0,.15)" }} />
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: "#3A2418" }}>{t.label}</span>
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 900, color: t.color }}>{t.pct}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: "rgba(150,90,60,.1)", overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(150,90,60,.18)" }}>
                    <div style={{ width: `${t.pct}%`, height: "100%", borderRadius: 99, background: `linear-gradient(180deg,rgba(255,255,255,.42),rgba(255,255,255,0) 55%),linear-gradient(90deg,${t.bar[0]},${t.bar[1]})`, transition: "width 1s cubic-bezier(.22,1,.36,1) .3s", minWidth: t.pct > 0 ? 10 : 0, boxShadow: t.pct > 0 ? `inset 0 1px 0 rgba(255,255,255,.5), 0 1px 3px ${t.color}55` : "none" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Mensagem "descanse" ao completar tudo ── */}
        {view.allDone && (
          <div style={{ margin: "18px 16px 0", borderRadius: 22, padding: "16px 18px", textAlign: "center", background: "linear-gradient(155deg,rgba(255,244,220,.92),rgba(246,226,214,.7))", border: "1px solid rgba(255,255,255,1)", boxShadow: "0 12px 26px rgba(150,90,60,.14),inset 0 1.5px 0 rgba(255,255,255,1)", animation: "rot-rise .5s both" }}>
            <p style={{ margin: 0, fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 15.5, color: "#3A2418" }}>
              Já fez bastante hoje 😊 Descanse, {childName}!
            </p>
          </div>
        )}

        <div style={{ padding: "16px 20px 16px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "#B79A88" }}>Menos tela. Mais memórias. · KIDZZ</div>
      </div>

      {/* ── Overlay de celebração (dia completo) ── */}
      <AnimatePresence>
        {celebrate && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(58,36,24,0),rgba(58,36,24,.12),rgba(58,36,24,0))" }} />
            <motion.div
              className="relative rounded-3xl px-6 py-5 text-center"
              style={{ background: "rgba(255,250,244,.96)", backdropFilter: "blur(18px)", border: "2px solid #E8B25A", boxShadow: "0 24px 60px rgba(150,90,60,.3)" }}
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
                <svg width="42" height="42" viewBox="0 0 24 24" fill="#E8A22B"><path d={P.sparkle} /></svg>
              </motion.div>
              <h2 style={{ margin: "8px 0 0", fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 20, color: "#3A2418" }}>Você foi incrível hoje!</h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 700, color: "#8A6450" }}>Salvamos esse dia nas suas Memórias 💛</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoutineScreen;

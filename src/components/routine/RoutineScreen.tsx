/**
 * RoutineScreen — KIDZZ Daily Habit Loop (Premium)
 *
 * Tela substituta da antiga "Brincar". Estrutura:
 *  - KIDZZ grande no topo, com fala dinâmica
 *  - Barra de progresso animada (X/Y tarefas)
 *  - Streak chip
 *  - 3 seções: Manhã / Tarde / Noite (cores distintas)
 *  - Cards premium com check animado, glow ao completar, micro confetti
 *  - Mensagem final ao completar tudo
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Cloud, Moon, Flame, Check, Sparkles,
  Smile, Droplet, BedDouble, Coffee, Heart, Music2, MessageCircleHeart,
  Apple, BookOpen, Palette, Zap, Users, Package, Blocks, Footprints,
  Wind, Star, Shirt, HandMetal, Crown,
} from "lucide-react";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";
import { loadMascotConfig } from "@/components/lab/KidzzLab";
import {
  getToday, completeTask, getStreak, getKidzzMessage, getCurrentPeriod,
  type RoutineTask, type RoutinePeriod, type TodayView,
} from "@/lib/routine";
import { showXpGained } from "@/components/flow/XpToast";
import { haptic } from "@/lib/haptics";
import { useAuth } from "@/contexts/AuthContext";
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

const HUE_MAP: Record<string, number> = {
  "rosa-encantado": 0,
  "dourado-magico": -30,
  "verde-floresta": 90,
  "azul-oceano": 180,
  "lilas-estrelado": 240,
  "laranja-aventura": -60,
};

// Lucide icon registry — keeps the bank serializable (string names)
const ICONS: Record<string, typeof Smile> = {
  Smile, Droplet, BedDouble, Coffee, Heart, Music2, MessageCircleHeart,
  Apple, BookOpen, Palette, Zap, Users, Package, Blocks, Footprints,
  Wind, Star, Shirt, HandMetal, Sparkles, Sun, Cloud, Moon,
};

const PERIOD_META: Record<RoutinePeriod, {
  label: string;
  icon: typeof Sun;
  gradient: string;            // section header background
  accent: string;              // hsl color for borders/glows
  cardBg: string;              // card normal bg
}> = {
  morning: {
    label: "Manhã",
    icon: Sun,
    gradient: "linear-gradient(135deg, hsl(35 95% 75% / 0.55), hsl(45 95% 80% / 0.4))",
    accent: "hsl(30 90% 55%)",
    cardBg: "linear-gradient(160deg, hsl(40 100% 96% / 0.85), hsl(35 90% 92% / 0.7))",
  },
  afternoon: {
    label: "Tarde",
    icon: Cloud,
    gradient: "linear-gradient(135deg, hsl(200 80% 80% / 0.55), hsl(190 75% 85% / 0.4))",
    accent: "hsl(195 75% 50%)",
    cardBg: "linear-gradient(160deg, hsl(200 90% 96% / 0.85), hsl(195 85% 93% / 0.7))",
  },
  night: {
    label: "Noite",
    icon: Moon,
    gradient: "linear-gradient(135deg, hsl(255 60% 75% / 0.55), hsl(270 55% 80% / 0.4))",
    accent: "hsl(265 70% 55%)",
    cardBg: "linear-gradient(160deg, hsl(260 75% 97% / 0.85), hsl(270 70% 94% / 0.7))",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Task Card
// ─────────────────────────────────────────────────────────────────────────────
const TaskCard = ({
  task,
  done,
  accent,
  cardBg,
  onComplete,
}: {
  task: RoutineTask;
  done: boolean;
  accent: string;
  cardBg: string;
  onComplete: () => void;
}) => {
  const Icon = ICONS[task.icon] ?? Sparkles;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="relative rounded-2xl overflow-hidden border"
      style={{
        background: done ? `linear-gradient(135deg, ${accent.replace(")", " / 0.18)")}, ${accent.replace(")", " / 0.06)")})` : cardBg,
        borderColor: done ? accent : "hsl(0 0% 100% / 0.7)",
        boxShadow: done
          ? `0 0 0 1px ${accent.replace(")", " / 0.4)")}, 0 8px 24px ${accent.replace(")", " / 0.18)")}`
          : "0 4px 14px hsl(0 0% 0% / 0.06)",
      }}
    >
      {/* Glow halo when done */}
      {done && (
        <motion.div
          className="absolute -inset-0.5 rounded-2xl pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 0%, ${accent.replace(")", " / 0.25)")}, transparent 70%)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0.6] }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      )}

      <div className="relative p-3 flex items-center gap-3">
        {/* Icon */}
        <motion.div
          className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: done ? accent : `${accent.replace(")", " / 0.14)")}`,
            color: done ? "white" : accent,
          }}
          animate={done ? { scale: [1, 1.18, 1], rotate: [0, -6, 6, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Icon size={22} strokeWidth={2.4} />
        </motion.div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h4
            className="text-[15px] font-extrabold leading-tight tracking-tight"
            style={{ color: done ? accent : "hsl(220 15% 20%)" }}
          >
            {task.title}
          </h4>
          <p className="text-[12px] text-gray-600 truncate mt-0.5">{task.short}</p>
        </div>

        {/* Action */}
        {done ? (
          <motion.div
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(140 70% 48%), hsl(150 75% 40%))",
              color: "white",
              boxShadow: "0 4px 14px hsl(140 70% 45% / 0.55)",
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [0, 1.35, 1], rotate: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 16 }}
            aria-label="Concluído"
          >
            <Check size={20} strokeWidth={3} />
          </motion.div>
        ) : (
          <motion.button
            type="button"
            onClick={onComplete}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            className="shrink-0 px-3 py-2 rounded-full text-[12px] font-black tracking-tight text-white"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent.replace(")", " / 0.85)")})`,
              boxShadow: `0 4px 14px ${accent.replace(")", " / 0.4)")}`,
              minHeight: 40,
              minWidth: 80,
            }}
            aria-label={`Concluir: ${task.title}`}
          >
            Já fiz
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Period Section
// ─────────────────────────────────────────────────────────────────────────────
const PeriodSection = ({
  period, tasks, doneSet, onComplete, isCurrent,
}: {
  period: RoutinePeriod;
  tasks: RoutineTask[];
  doneSet: Set<string>;
  onComplete: (id: string) => void;
  isCurrent: boolean;
}) => {
  const meta = PERIOD_META[period];
  const Icon = meta.icon;
  const doneInPeriod = tasks.filter(t => doneSet.has(t.id)).length;
  return (
    <motion.section
      layout
      className="relative rounded-3xl overflow-hidden p-3"
      style={{
        background: meta.gradient,
        boxShadow: isCurrent ? `0 0 0 2px ${meta.accent.replace(")", " / 0.45)")}, 0 10px 30px hsl(0 0% 0% / 0.08)` : "0 6px 20px hsl(0 0% 0% / 0.06)",
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-1 py-1 mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: meta.accent, color: "white", boxShadow: `0 3px 10px ${meta.accent.replace(")", " / 0.45)")}` }}
          >
            <Icon size={17} strokeWidth={2.6} />
          </div>
          <h3 className="text-[16px] font-black text-gray-800 tracking-tight">{meta.label}</h3>
          {isCurrent && (
            <motion.span
              className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
              style={{ background: meta.accent }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              AGORA
            </motion.span>
          )}
        </div>
        <span className="text-[12px] font-extrabold text-gray-700">
          {doneInPeriod}/{tasks.length}
        </span>
      </header>

      <div className="flex flex-col gap-2">
        {tasks.map(t => (
          <TaskCard
            key={t.id}
            task={t}
            done={doneSet.has(t.id)}
            accent={meta.accent}
            cardBg={meta.cardBg}
            onComplete={() => onComplete(t.id)}
          />
        ))}
      </div>
    </motion.section>
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
  // Rotina exige Premium.
  const isPremium = canUse("rotina");
  const mascotConfig = useMemo(() => loadMascotConfig(), []);
  const hue = HUE_MAP[mascotConfig.colorId] ?? 0;

  const [view, setView] = useState<TodayView>(() => getToday());
  const [streak, setStreak] = useState(() => getStreak());
  const [celebrate, setCelebrate] = useState(false);
  const [kidzzBounce, setKidzzBounce] = useState(0); // increments to retrigger animation
  const memorySaved = useRef(false);
  const encouragementIdx = useRef(0);

  // Refresh on mount + every minute (period rollover) + on visibility change
  useEffect(() => {
    const refresh = () => {
      setView(getToday());
      setStreak(getStreak());
    };
    const iv = setInterval(refresh, 60_000);
    const onVis = () => { if (!document.hidden) refresh(); };
    document.addEventListener("visibilitychange", onVis);
    // also refresh immediately in case integrations completed tasks elsewhere
    refresh();
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  const currentPeriod = getCurrentPeriod();
  const message = useMemo(() => getKidzzMessage(view, childName), [view, childName]);
  const kidzzMood = view.allDone ? "happy" : view.doneCount > 0 ? "calm" : "guide";
  const kidzzState = currentPeriod === "night" ? "moon" : currentPeriod === "morning" ? "explorer" : "cosmic";

  const handleComplete = useCallback((id: string) => {
    haptic("success");
    const result = completeTask(id);
    if (!result.newlyDone) return;
    setView(getToday());
    setStreak(getStreak());
    showXpGained(result.xpGained, "XP");
    if (result.bonusGained > 0) {
      setTimeout(() => showXpGained(result.bonusGained, "BÔNUS"), 350);
    }
    // Kidzz reaction (jump/bounce)
    setKidzzBounce(n => n + 1);
    // Encouragement toast (rotating)
    const phrase = ENCOURAGEMENTS[encouragementIdx.current % ENCOURAGEMENTS.length];
    encouragementIdx.current += 1;
    toast.success(phrase, { duration: 1500, position: "bottom-center" });
    // Soft celebratory ding
    playDing();
    // Confetti shower (~1.5s)
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
      confetti({ particleCount: 35, spread: 90, startVelocity: 30, origin: { y: 0.55 }, scalar: 0.8, ticks: 110, colors });
    }, 250);
    if (result.allDone) {
      setCelebrate(true);
      // Bigger confetti for full-day completion
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

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overscroll-contain px-3"
         style={{
           paddingTop: "max(env(safe-area-inset-top, 12px), 12px)",
           WebkitOverflowScrolling: "touch",
           paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 220px)",
         }}>
      {/* ─── Hero: KIDZZ + Greeting ─── */}
      <header className="relative flex flex-col items-center text-center pt-2 pb-3">
        <motion.div
          className="relative"
          style={{ filter: `hue-rotate(${hue}deg)` }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            key={`bounce-${kidzzBounce}`}
            animate={kidzzBounce > 0 ? { y: [0, -14, 0, -6, 0], scale: [1, 1.06, 1, 1.02, 1] } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <KidzzChameleon
              size="xl"
              state={kidzzState}
              mood={kidzzMood as any}
              interactive={false}
              showParticles
            />
          </motion.div>
        </motion.div>

        <motion.div
          key={message}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-1 max-w-xs"
        >
          <h1 className="text-[18px] font-black text-gray-800 tracking-tight leading-tight">
            {message}
          </h1>
        </motion.div>

        {/* Progress + Streak */}
        <div className="w-full max-w-md mt-3 px-1 flex items-center gap-2">
          <div className="flex-1 h-3 rounded-full bg-white/60 backdrop-blur overflow-hidden border border-white/70 shadow-inner">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, hsl(45 100% 60%), hsl(30 95% 55%), hsl(340 85% 60%))",
                boxShadow: "0 0 12px hsl(35 95% 60% / 0.7)",
              }}
              initial={false}
              animate={{ width: `${view.percent}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
            />
          </div>
          <span className="text-[12px] font-black text-gray-800 whitespace-nowrap">
            {view.doneCount}/{view.total}
          </span>
          {streak.current > 0 && (
            <motion.div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-white text-[11px] font-black"
              style={{ background: "linear-gradient(135deg, hsl(20 95% 55%), hsl(0 85% 55%))", boxShadow: "0 3px 10px hsl(20 90% 55% / 0.45)" }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Flame size={12} fill="white" />
              {streak.current}
            </motion.div>
          )}
        </div>

        {streak.missedYesterday && streak.current === 0 && (
          <motion.p
            className="text-[11px] text-gray-600 mt-2 italic"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            Tudo bem… hoje é um novo começo 💛
          </motion.p>
        )}

        {!isPremium && (
          <motion.button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("kidzz:open-plans"))}
            className="mt-3 w-full max-w-md rounded-2xl border border-border bg-card/70 px-4 py-3 text-left shadow-sm backdrop-blur active:scale-[0.98]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Crown size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-black text-foreground">Desbloqueie tudo com o plano premium</span>
                <span className="block text-[11px] font-bold text-muted-foreground">Mais rotina, histórias, sonhos e relatórios para os pais.</span>
              </span>
            </div>
          </motion.button>
        )}
      </header>

      {/* ─── Sections ─── */}
      <div className="flex flex-col gap-3 mt-1">
        <PeriodSection period="morning"   tasks={view.morning}   doneSet={view.done} onComplete={handleComplete} isCurrent={currentPeriod === "morning"} />
        <PeriodSection period="afternoon" tasks={view.afternoon} doneSet={view.done} onComplete={handleComplete} isCurrent={currentPeriod === "afternoon"} />
        <PeriodSection period="night"     tasks={view.night}     doneSet={view.done} onComplete={handleComplete} isCurrent={currentPeriod === "night"} />
      </div>

      {/* Soft "enough for today" message when all done */}
      {view.allDone && (
        <motion.div
          className="mt-4 mx-auto max-w-sm rounded-2xl p-4 text-center"
          style={{
            background: "linear-gradient(135deg, hsl(45 100% 92%), hsl(30 95% 88%))",
            border: "1px solid hsl(35 90% 70%)",
            boxShadow: "0 8px 24px hsl(35 90% 60% / 0.25)",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[14px] font-extrabold text-gray-800">
            Já fez bastante hoje 😊 Descanse, {childName}!
          </p>
        </motion.div>
      )}

      {/* ─── Full-day Celebration overlay ─── */}
      <AnimatePresence>
        {celebrate && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/0" />
            <motion.div
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl px-6 py-5 text-center shadow-2xl border-2"
              style={{ borderColor: "hsl(35 90% 60%)" }}
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
                <Sparkles size={42} className="text-amber-500" />
              </motion.div>
              <h2 className="mt-2 text-[20px] font-black text-gray-800">
                Você foi incrível hoje!
              </h2>
              <p className="text-[13px] text-gray-700 mt-1">
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

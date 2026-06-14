import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  X, Flame, MessageCircleHeart, BookOpen, Clock, Share2,
  Lock, Settings, ChevronRight, Sun, CloudSun, Moon, Loader2, Crown, ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/hooks/useEntitlement";
import { getToday as getRoutineToday } from "@/lib/routine";
import { captureAndShare } from "@/lib/viralShare";
import ShareableWeekCard from "@/components/viral/ShareableWeekCard";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenUpgrade: () => void;
}

interface QRow {
  id: string;
  question: string;
  created_at: string;
  age_range: string | null;
}

const THEME_KEYWORDS: Record<string, { label: string; tag: string; weight: number }> = {
  natureza: { label: "Natureza 🌿", tag: "natureza", weight: 1 },
  planta: { label: "Natureza 🌿", tag: "natureza", weight: 1 },
  animal: { label: "Animais 🐾", tag: "animais", weight: 1 },
  bicho: { label: "Animais 🐾", tag: "animais", weight: 1 },
  cachorro: { label: "Animais 🐾", tag: "animais", weight: 1 },
  gato: { label: "Animais 🐾", tag: "animais", weight: 1 },
  peixe: { label: "Animais 🐾", tag: "animais", weight: 1 },
  ceu: { label: "Universo 🌌", tag: "universo", weight: 1 },
  céu: { label: "Universo 🌌", tag: "universo", weight: 1 },
  estrela: { label: "Universo 🌌", tag: "universo", weight: 1 },
  planeta: { label: "Universo 🌌", tag: "universo", weight: 1 },
  lua: { label: "Universo 🌌", tag: "universo", weight: 1 },
  sol: { label: "Universo 🌌", tag: "universo", weight: 1 },
  espaço: { label: "Universo 🌌", tag: "universo", weight: 1 },
  triste: { label: "Emoções ❤️", tag: "emocoes", weight: 1 },
  feliz: { label: "Emoções ❤️", tag: "emocoes", weight: 1 },
  amor: { label: "Emoções ❤️", tag: "emocoes", weight: 1 },
  medo: { label: "Emoções ❤️", tag: "emocoes", weight: 1 },
  saudade: { label: "Emoções ❤️", tag: "emocoes", weight: 1 },
  raiva: { label: "Emoções ❤️", tag: "emocoes", weight: 1 },
  corpo: { label: "Corpo 🧬", tag: "corpo", weight: 1 },
  coração: { label: "Corpo 🧬", tag: "corpo", weight: 1 },
  cérebro: { label: "Mente 🧠", tag: "mente", weight: 1 },
  pensa: { label: "Mente 🧠", tag: "mente", weight: 1 },
  sonho: { label: "Mente 🧠", tag: "mente", weight: 1 },
  cor: { label: "Cores 🎨", tag: "cores", weight: 1 },
  número: { label: "Números 🔢", tag: "numeros", weight: 1 },
  comida: { label: "Comida 🍎", tag: "comida", weight: 1 },
};

function classifyTheme(q: string): string | null {
  const lower = q.toLowerCase();
  for (const k of Object.keys(THEME_KEYWORDS)) {
    if (lower.includes(k)) return THEME_KEYWORDS[k].label;
  }
  return null;
}

function startOfWeek(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay(); // 0 sun
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function fmtDateRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${start.toLocaleDateString("pt-BR", opts)} – ${end.toLocaleDateString("pt-BR", opts)}`;
}

function dayName(d: Date) {
  return d.toLocaleDateString("pt-BR", { weekday: "long" });
}

const ParentDashboard = ({ onClose, onOpenSettings, onOpenUpgrade }: Props) => {
  const { user, profile } = useAuth();
  const ent = useEntitlement();
  const isPremium = ent.plan !== "free";
  const childName = profile?.child_name || "criança";
  const streak = profile?.streak_days ?? 0;
  const shareRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const openPortal = async () => {
    if (portalLoading) return;
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) window.location.href = url;
      else toast.error("Não foi possível abrir a gestão da assinatura.");
    } catch (e) {
      toast.error("Não foi possível abrir a gestão da assinatura.");
    } finally {
      setPortalLoading(false);
    }
  };

  const [loading, setLoading] = useState(true);
  const [weekQs, setWeekQs] = useState<QRow[]>([]);
  const [weekStories, setWeekStories] = useState<number>(0);

  const weekStart = useMemo(() => startOfWeek(), []);
  const weekEnd = useMemo(() => {
    const e = new Date(weekStart); e.setDate(e.getDate() + 6); e.setHours(23, 59, 59, 999); return e;
  }, [weekStart]);
  const weekLabel = useMemo(() => fmtDateRange(weekStart, weekEnd), [weekStart, weekEnd]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) { setLoading(false); return; }
      setLoading(true);
      const [qRes, mRes] = await Promise.all([
        supabase.from("kidzz_questions_log")
          .select("id, question, created_at, age_range")
          .eq("user_id", user.id)
          .gte("created_at", weekStart.toISOString())
          .order("created_at", { ascending: false })
          .limit(200),
        supabase.from("memories" as any)
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("type", "story")
          .gte("created_at", weekStart.toISOString()),
      ]);
      if (cancelled) return;
      if (!qRes.error && qRes.data) setWeekQs(qRes.data as QRow[]);
      setWeekStories((mRes as any).count ?? 0);
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [user, weekStart]);

  // Themes
  const themes = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of weekQs) {
      const t = classifyTheme(r.question);
      if (!t) continue;
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k]) => k);
  }, [weekQs]);

  // Top moments — 3 most interesting (longest = often most curious)
  const topMoments = useMemo(() => {
    return [...weekQs]
      .sort((a, b) => b.question.length - a.question.length)
      .slice(0, 3);
  }, [weekQs]);

  // Routine (from localStorage)
  const today = useMemo(() => getRoutineToday(), []);
  const routinePercent = today.percent;
  const periodBreakdown = useMemo(() => {
    const count = (period: "morning" | "afternoon" | "night") => {
      const tasks = today[period];
      const done = tasks.filter((t) => today.done.has(t.id)).length;
      return { done, total: tasks.length };
    };
    return { morning: count("morning"), afternoon: count("afternoon"), night: count("night") };
  }, [today]);

  // Estimated learning time (free heuristic): 2 min per question + 5 per story
  const minutesLearning = weekQs.length * 2 + weekStories * 5;

  const handleShare = async () => {
    if (!shareRef.current || sharing) return;
    setSharing(true);
    try {
      const ok = await captureAndShare(shareRef.current, {
        title: `Semana de ${childName}`,
        text: `${childName} esta semana: ${weekQs.length} perguntas, ${weekStories} histórias, streak ${streak}d 🔥`,
        filename: `kidzz-semana-${childName.toLowerCase()}.png`,
      });
      if (ok) toast.success("Conquistas compartilhadas! ✨");
    } catch {
      toast.error("Não foi possível compartilhar agora");
    } finally {
      setSharing(false);
    }
  };

  if (!user) {
    return (
      <Wrapper onClose={onClose}>
        <div className="text-center py-8 px-4">
          <div className="text-5xl mb-3">🔐</div>
          <h3 className="text-lg font-extrabold text-foreground">Crie uma conta para ver o painel</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-4">Acompanhe o progresso de {childName} de forma segura.</p>
          <button onClick={onOpenSettings} className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm">
            Fazer login / Criar conta
          </button>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper onClose={onClose}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pr-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md flex-shrink-0">
          <span className="text-2xl">{childName[0]?.toUpperCase() || "👧"}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-black text-foreground leading-tight truncate">
            Semana de {childName} 📊
          </h2>
          <p className="text-[11px] text-muted-foreground font-bold capitalize">{weekLabel}</p>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-muted hover:bg-muted/70 text-muted-foreground"
          aria-label="Configurações"
        >
          <Settings size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* 4 highlight cards */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard icon={<Flame className="w-5 h-5 text-orange-500" />} value={`${streak}d`} label="Streak atual" tone="orange" />
            <StatCard icon={<MessageCircleHeart className="w-5 h-5 text-blue-500" />} value={weekQs.length} label="Perguntas" tone="blue" />
            <StatCard icon={<BookOpen className="w-5 h-5 text-purple-500" />} value={weekStories} label="Histórias" tone="purple" />
            <StatCard icon={<Clock className="w-5 h-5 text-emerald-600" />} value={`${minutesLearning}min`} label="Aprendizado" tone="green" />
          </div>

          {/* Themes */}
          <Section title="Temas explorados" emoji="🧭">
            {themes.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma pergunta esta semana ainda.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {themes.map((t) => (
                  <span key={t} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </Section>

          {/* Top moments */}
          <Section title="Momentos da semana" emoji="✨">
            {topMoments.length === 0 ? (
              <p className="text-xs text-muted-foreground">As perguntas favoritas vão aparecer aqui.</p>
            ) : (
              <ul className="space-y-2">
                {topMoments.map((m) => {
                  const d = new Date(m.created_at);
                  return (
                    <li key={m.id} className="bg-muted/40 rounded-xl p-3">
                      <p className="text-[13px] font-semibold text-foreground leading-snug">"{m.question}"</p>
                      <p className="text-[10px] text-muted-foreground font-bold capitalize mt-1">{dayName(d)}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          {/* Routine */}
          <Section title="Rotina" emoji="🎯">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-semibold">Hoje</span>
              <span className="text-sm font-extrabold text-foreground">{routinePercent}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${routinePercent}%` }}
                transition={{ duration: 0.6 }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <PeriodPill icon={<Sun size={14} className="text-amber-500" />} label="Manhã" stat={periodBreakdown.morning} />
              <PeriodPill icon={<CloudSun size={14} className="text-orange-500" />} label="Tarde" stat={periodBreakdown.afternoon} />
              <PeriodPill icon={<Moon size={14} className="text-indigo-500" />} label="Noite" stat={periodBreakdown.night} />
            </div>
          </Section>

          {/* Premium-only section */}
          {!isPremium && (
            <button
              onClick={onOpenUpgrade}
              className="w-full relative rounded-2xl p-4 text-left overflow-hidden border border-amber-200"
              style={{ background: "linear-gradient(135deg, rgba(212,168,71,0.12), rgba(232,130,26,0.10))" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-foreground">Histórico completo + insights</p>
                  <p className="text-[11px] text-muted-foreground">Veja temas, evolução mensal e horários favoritos</p>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-700" />
              </div>
            </button>
          )}

          {/* Share button */}
          <button
            onClick={handleShare}
            disabled={sharing}
            className="w-full py-3.5 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #F4C430, #E8821A)" }}
          >
            {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            Compartilhar conquistas
          </button>

          <p className="text-center text-[10px] text-muted-foreground font-bold">
            ❤️ Mais de 1.000 famílias acompanham assim
          </p>
        </div>
      )}

      {/* Off-screen share card */}
      <div style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none" }} aria-hidden>
        <ShareableWeekCard
          ref={shareRef}
          childName={childName}
          weekLabel={weekLabel}
          questions={weekQs.length}
          stories={weekStories}
          streak={streak}
          minutes={minutesLearning}
          topThemes={themes}
        />
      </div>
    </Wrapper>
  );
};

const Wrapper = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-foreground/60 backdrop-blur-md flex items-end sm:items-center justify-center z-50 sm:p-4"
  >
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className="bg-card w-full max-w-md sm:rounded-3xl rounded-t-3xl p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto overscroll-contain"
      style={{
        WebkitOverflowScrolling: "touch",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)",
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground"
        aria-label="Fechar"
      >
        <X size={18} />
      </button>
      {children}
    </motion.div>
  </motion.div>
);

const TONE: Record<string, string> = {
  orange: "from-orange-50 to-orange-100/50 border-orange-200",
  blue: "from-blue-50 to-blue-100/50 border-blue-200",
  purple: "from-purple-50 to-purple-100/50 border-purple-200",
  green: "from-emerald-50 to-emerald-100/50 border-emerald-200",
};

const StatCard = ({ icon, value, label, tone }: { icon: React.ReactNode; value: number | string; label: string; tone: string }) => (
  <div className={`bg-gradient-to-br ${TONE[tone]} border rounded-2xl p-3`}>
    <div className="flex items-center justify-between mb-1">
      {icon}
    </div>
    <p className="text-2xl font-black text-foreground leading-none">{value}</p>
    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">{label}</p>
  </div>
);

const Section = ({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) => (
  <div className="bg-muted/30 rounded-2xl p-3.5">
    <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-2">
      {emoji} {title}
    </p>
    {children}
  </div>
);

const PeriodPill = ({ icon, label, stat }: { icon: React.ReactNode; label: string; stat: { done: number; total: number } }) => (
  <div className="bg-card border border-border rounded-xl p-2 text-center">
    <div className="flex items-center justify-center gap-1 mb-1">{icon}<span className="text-[10px] font-bold text-foreground">{label}</span></div>
    <p className="text-[11px] font-extrabold text-foreground">{stat.done}/{stat.total}</p>
  </div>
);

export default ParentDashboard;

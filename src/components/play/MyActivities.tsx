import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Sparkles, RefreshCw } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useMemories } from "@/hooks/useMemories";
import { supabase } from "@/integrations/supabase/client";
import KidzzChameleon from "@/components/kidzz/KidzzChameleon";
import { addXp } from "@/lib/dailyMission";
import { showXpGained } from "@/components/flow/XpToast";
import ActivityDetailModal from "./ActivityDetailModal";
import {
  Activity,
  ActivityCategory,
  getCategoryMeta,
  getWeekKey,
  pickWeeklyFromPool,
  loadWeeklyCache,
  saveWeeklyCache,
  loadCompletedSet,
  saveCompletedSet,
  pickDailyHighlight,
} from "@/lib/weeklyActivities";

interface Props {
  onBack: () => void;
}

/**
 * Atividades semanais — 10 missões por semana.
 * - Sorteio do pool curado é instantâneo (sempre algo na tela).
 * - Em background, tenta enriquecer com IA (`generate-activities`).
 * - 1 atividade destacada por dia.
 * - Concluir → +XP + memória + confetti.
 */
const MyActivities = ({ onBack }: Props) => {
  const { profile } = useAuth();
  const { addMemory } = useMemories();
  const childName = profile?.child_name || "amigo";
  const ageRange = profile?.age_range || "3-7";
  const interests = (profile as any)?.child_interests as string[] | undefined;

  const weekKey = useMemo(() => getWeekKey(), []);
  const profileId = (profile as any)?.id ?? "guest";
  const [activities, setActivities] = useState<Activity[]>(() => {
    const cached = loadWeeklyCache(weekKey);
    return cached?.activities ?? pickWeeklyFromPool(`${weekKey}-${profileId}`);
  });
  const [source, setSource] = useState<"pool" | "ai">(
    () => loadWeeklyCache(weekKey)?.source ?? "pool"
  );
  const [completed, setCompleted] = useState<Set<string>>(() => loadCompletedSet(weekKey));
  const [refreshingAi, setRefreshingAi] = useState(false);
  const [selected, setSelected] = useState<Activity | null>(null);

  // 1x por semana, tenta puxar versão IA personalizada (background, não bloqueia)
  // Atrasa 1.5s para não competir com a renderização inicial.
  useEffect(() => {
    const cached = loadWeeklyCache(weekKey);
    if (cached?.source === "ai") return; // já tem IA dessa semana
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const aiPromise = supabase.functions.invoke("generate-activities", {
          body: { childName, ageRange, interests },
        });
        // Timeout de segurança 12s para não deixar a Promise pendente indefinidamente
        const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error("ai-timeout") }), 12000)
        );
        const { data, error } = (await Promise.race([aiPromise, timeoutPromise])) as any;
        if (cancelled) return;
        if (error) return; // fallback silencioso no pool
        const aiActivities = (data?.activities ?? []) as Activity[];
        if (aiActivities.length === 10) {
          setActivities(aiActivities);
          setSource("ai");
          saveWeeklyCache({ weekKey, activities: aiActivities, source: "ai" });
        }
      } catch {
        /* fallback silencioso no pool */
      }
    }, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [weekKey, childName, ageRange, interests]);

  const dailyHighlight = useMemo(
    () => pickDailyHighlight(activities, completed),
    [activities, completed]
  );

  const handleComplete = useCallback(
    (activity: Activity) => {
      if (completed.has(activity.id)) return;
      const next = new Set(completed);
      next.add(activity.id);
      setCompleted(next);
      saveCompletedSet(weekKey, next);

      // XP + memória + confetti
      const { gained } = addXp("activity", activity.xp);
      showXpGained(gained, activity.title);
      addMemory({
        type: "mission",
        title: `✅ ${activity.title}`,
        content: activity.description,
        is_special: false,
        image_url: null,
        metadata: { source: "weekly_activity", category: activity.category, emoji: activity.emoji },
      });
      const meta = getCategoryMeta(activity.category);
      const colorHsl = meta.color
        .replace("hsl(", "")
        .replace(")", "")
        .split(" ")
        .map((s) => s.replace("%", ""));
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#FFD86E", "#9EE493", "#7BC5FF", "#FF9ECF"],
        scalar: 0.9,
      });
      toast.success(`+${activity.xp} XP! ${activity.emoji}`, {
        description: "Memória salva no álbum 💛",
      });
      // satisfaz tipechecker (variáveis usadas)
      void colorHsl;
    },
    [completed, weekKey, addMemory]
  );

  const tryRefreshAi = useCallback(async () => {
    setRefreshingAi(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-activities", {
        body: { childName, ageRange, interests },
      });
      if (error) throw error;
      const aiActivities = (data?.activities ?? []) as Activity[];
      if (aiActivities.length === 10) {
        setActivities(aiActivities);
        setSource("ai");
        saveWeeklyCache({ weekKey, activities: aiActivities, source: "ai" });
        toast.success("Atividades atualizadas pela IA ✨");
      } else {
        toast.error("IA não respondeu, tente em alguns segundos");
      }
    } catch {
      toast.error("Não foi possível atualizar agora");
    } finally {
      setRefreshingAi(false);
    }
  }, [childName, ageRange, interests, weekKey]);

  const completedCount = completed.size;
  const totalCount = activities.length;
  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-3 pb-2"
        style={{ paddingTop: "max(env(safe-area-inset-top, 12px), 16px)" }}
      >
        <motion.button
          onClick={onBack}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/70 border border-white/40 backdrop-blur"
          whileTap={{ scale: 0.9 }}
          aria-label="Voltar"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </motion.button>
        <div className="text-center flex-1">
          <h1 className="text-base font-extrabold text-gray-800 flex items-center justify-center gap-1.5">
            🎯 Atividades
          </h1>
          <p className="text-[11px] text-gray-500 font-semibold">
            {completedCount}/{totalCount} • {source === "ai" ? "Personalizado ✨" : "Esta semana"}
          </p>
        </div>
        <motion.button
          onClick={tryRefreshAi}
          disabled={refreshingAi}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/70 border border-white/40 backdrop-blur disabled:opacity-50"
          whileTap={{ scale: 0.9 }}
          aria-label="Atualizar com IA"
        >
          <RefreshCw
            size={18}
            className={`text-emerald-600 ${refreshingAi ? "animate-spin" : ""}`}
          />
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* Progresso */}
        <div className="bg-white/60 backdrop-blur rounded-2xl p-3 border border-white/50 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-gray-700">
              Progresso da semana
            </span>
            <span className="text-xs font-black text-emerald-600">
              {Math.round((completedCount / Math.max(totalCount, 1)) * 100)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / Math.max(totalCount, 1)) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          {allDone && (
            <p className="mt-2 text-center text-xs font-extrabold text-emerald-600">
              🎉 Você completou tudo, {childName}!
            </p>
          )}
        </div>

        {/* Atividade do dia (destaque) */}
        {dailyHighlight && (
          <motion.div
            className="relative mb-4 p-4 rounded-3xl border-2 border-amber-300 overflow-hidden cursor-pointer"
            style={{
              background:
                "linear-gradient(135deg, hsl(45 95% 88%) 0%, hsl(45 95% 75%) 100%)",
              boxShadow: "0 8px 24px hsl(45 90% 55% / 0.25)",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(dailyHighlight)}
            role="button"
            aria-label={`Ver detalhes: ${dailyHighlight.title}`}
          >
            <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center gap-1 shadow-md">
              <Sparkles size={10} /> HOJE
            </div>
            <div className="flex items-start gap-3">
              <div className="text-4xl flex-shrink-0">{dailyHighlight.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-wide">
                  {getCategoryMeta(dailyHighlight.category).label}
                </p>
                <h3 className="text-base font-extrabold text-gray-800 leading-tight">
                  {dailyHighlight.title}
                </h3>
                <p className="text-xs text-gray-700 mt-1 leading-snug">
                  {dailyHighlight.description}
                </p>
                <p className="text-[10px] font-bold text-amber-800/80 mt-1.5">
                  Toque para ver como fazer →
                </p>
              </div>
            </div>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setSelected(dailyHighlight);
              }}
              className="mt-3 w-full py-3 rounded-2xl font-extrabold text-white text-sm flex items-center justify-center gap-2 min-h-[44px] shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, hsl(140 70% 50%), hsl(140 75% 40%))",
              }}
              whileTap={{ scale: 0.96 }}
            >
              <Sparkles size={16} /> Ver atividade do dia
            </motion.button>
          </motion.div>
        )}

        {/* Lista geral */}
        <div className="space-y-2">
          {activities.map((a) => {
            const done = completed.has(a.id);
            const meta = getCategoryMeta(a.category);
            return (
              <motion.div
                key={a.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(a)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(a);
                  }
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer hover:shadow-sm ${
                  done
                    ? "bg-emerald-50/80 border-emerald-200 opacity-70"
                    : "bg-white/70 border-white/60"
                }`}
                layout
                whileTap={{ scale: 0.98 }}
                aria-label={`Ver detalhes de ${a.title}`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${meta.color.replace(")", " / 0.18)")}` }}
                >
                  {a.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-extrabold leading-tight ${
                      done ? "text-gray-500 line-through" : "text-gray-800"
                    }`}
                  >
                    {a.title}
                  </p>
                  <p className="text-[10px] font-bold" style={{ color: meta.color }}>
                    {meta.emoji} {meta.label} · +{a.xp} XP
                  </p>
                </div>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (done) return;
                    setSelected(a);
                  }}
                  disabled={done}
                  className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center font-extrabold text-xs transition-all ${
                    done
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-700 active:scale-90"
                  }`}
                  whileTap={done ? undefined : { scale: 0.9 }}
                  aria-label={done ? "Concluído" : "Ver atividade"}
                >
                  {done ? <Check size={18} /> : "Ver"}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-4 text-center text-[10px] text-gray-400 font-semibold">
          As atividades mudam toda segunda-feira ✨
        </p>
        {/* KIDZZ flutuante motivador */}
        <div className="mt-4 flex justify-center">
          <KidzzChameleon
            state="play"
            mood={allDone ? "happy" : "curious"}
            size="md"
            interactive={false}
            showParticles={false}
          />
        </div>
      </div>

      {/* Modal de detalhe — explica como fazer + exemplo prático */}
      <ActivityDetailModal
        activity={selected}
        childName={childName}
        done={selected ? completed.has(selected.id) : false}
        onComplete={handleComplete}
        onClose={() => setSelected(null)}
      />
    </motion.div>
  );
};

export default MyActivities;

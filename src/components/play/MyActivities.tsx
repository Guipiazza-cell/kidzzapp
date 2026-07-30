import { useState, useEffect, useMemo, useCallback, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Sparkles, RefreshCw, Lock } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useMemories } from "@/hooks/useMemories";
import { supabase } from "@/integrations/supabase/client";
import { addXp } from "@/lib/dailyMission";
import { showXpGained } from "@/components/flow/XpToast";
import ActivityDetailModal from "./ActivityDetailModal";
import ContextualPaywallModal from "@/components/ContextualPaywallModal";
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

const IC = "/exemplos/assets/brincar-v2/icons";

/** Ícones 3D premium por categoria */
const CAT_ICON: Record<ActivityCategory, string> = {
  movimento: `${IC}/cat-movimento.png`,
  criatividade: `${IC}/cat-criatividade.png`,
  familia: `${IC}/cat-familia.png`,
  desafio: `${IC}/cat-desafio.png`,
};

/** Mapeia emoji do pool → ícone premium (fallback = categoria) */
const EMOJI_ICON: Record<string, string> = {
  "💃": `${IC}/act-dance.png`,
  "🐻": `${IC}/act-bear.png`,
  "🗺️": `${IC}/act-map.png`,
  "🏕️": `${IC}/act-fort.png`,
  "🦸": `${IC}/act-hero.png`,
  "📖": `${IC}/act-book.png`,
  "🎤": `${IC}/act-music.png`,
  "🎁": `${IC}/act-gift.png`,
  "💧": `${IC}/act-water.png`,
  "🧸": `${IC}/act-gift.png`,
  "🎵": `${IC}/act-music.png`,
  "🎶": `${IC}/act-music.png`,
};

function activityIconSrc(a: Activity): string {
  return EMOJI_ICON[a.emoji] ?? CAT_ICON[a.category];
}

/** Liquid glass igual ao dock */
const liquidCard: CSSProperties = {
  background:
    "linear-gradient(165deg, rgba(255,255,255,.42) 0%, rgba(255,255,255,.22) 48%, rgba(255,255,255,.16) 100%)",
  border: "0.5px solid rgba(255,255,255,.55)",
  boxShadow:
    "0 10px 28px rgba(20,16,30,.12), 0 2px 8px rgba(20,16,30,.06), inset 0 1px 0 rgba(255,255,255,.72)",
  backdropFilter: "blur(28px) saturate(180%)",
  WebkitBackdropFilter: "blur(28px) saturate(180%)",
};

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
  const isPremium = profile?.is_premium ?? false;
  const ageRange = profile?.age_range || "3-7";
  const interests = (profile as any)?.child_interests as string[] | undefined;
  const [showPremiumCTA, setShowPremiumCTA] = useState(false);

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

  // 1ª atividade de cada categoria fica grátis; demais são premium.
  // O destaque do dia fica sempre liberado para manter engajamento diário.
  const freeIds = useMemo(() => {
    const seen = new Set<ActivityCategory>();
    const ids = new Set<string>();
    if (dailyHighlight) ids.add(dailyHighlight.id);
    for (const a of activities) {
      if (!seen.has(a.category)) {
        seen.add(a.category);
        ids.add(a.id);
      }
    }
    return ids;
  }, [activities, dailyHighlight]);

  const isLocked = useCallback(
    (a: Activity) => !isPremium && !freeIds.has(a.id),
    [isPremium, freeIds]
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

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 120px)" }}>
        {/* Progresso */}
        <div className="rounded-2xl p-3 mb-3" style={liquidCard}>
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
            className="relative mb-4 p-4 rounded-3xl overflow-hidden cursor-pointer"
            style={{
              ...liquidCard,
              background:
                "linear-gradient(155deg, rgba(255,248,220,.55) 0%, rgba(255,255,255,.28) 45%, rgba(255,255,255,.18) 100%)",
              border: "0.5px solid rgba(255,220,140,.65)",
              boxShadow:
                "0 12px 32px rgba(180,120,20,.16), inset 0 1px 0 rgba(255,255,255,.75)",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(dailyHighlight)}
            role="button"
            aria-label={`Ver detalhes: ${dailyHighlight.title}`}
          >
            <div
              className="absolute top-2 right-2 px-2 py-1 rounded-full text-white text-[10px] font-black flex items-center gap-1 shadow-md"
              style={{
                background: "linear-gradient(180deg,#F5C14A,#E0A020)",
              }}
            >
              <Sparkles size={10} /> HOJE
            </div>
            <div className="flex items-start gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex-shrink-0 overflow-hidden"
                style={{
                  boxShadow: "0 6px 16px rgba(40,60,30,.14)",
                  border: "0.5px solid rgba(255,255,255,.7)",
                }}
              >
                <img
                  src={activityIconSrc(dailyHighlight)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-amber-800/90 uppercase tracking-wide">
                  {getCategoryMeta(dailyHighlight.category).label}
                </p>
                <h3 className="text-base font-extrabold text-gray-800 leading-tight">
                  {dailyHighlight.title}
                </h3>
                <p className="text-xs text-gray-700/90 mt-1 leading-snug">
                  {dailyHighlight.description}
                </p>
                <p className="text-[10px] font-bold text-amber-900/70 mt-1.5">
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

        {/* Lista geral — liquid glass + ícones premium */}
        <div className="space-y-2.5">
          {activities.map((a) => {
            const done = completed.has(a.id);
            const locked = isLocked(a);
            const meta = getCategoryMeta(a.category);
            const open = () => {
              if (locked) {
                setShowPremiumCTA(true);
                return;
              }
              setSelected(a);
            };
            return (
              <motion.div
                key={a.id}
                role="button"
                tabIndex={0}
                onClick={open}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open();
                  }
                }}
                className="relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer"
                style={{
                  ...liquidCard,
                  opacity: done ? 0.72 : locked ? 0.88 : 1,
                }}
                layout
                whileTap={{ scale: 0.98 }}
                aria-label={locked ? `${a.title} — premium` : `Ver detalhes de ${a.title}`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{
                    border: "0.5px solid rgba(255,255,255,.65)",
                    boxShadow: "0 4px 12px rgba(30,40,25,.1)",
                    filter: locked ? "saturate(0.55) brightness(0.95)" : "none",
                  }}
                >
                  <img
                    src={activityIconSrc(a)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-extrabold leading-tight ${
                      done
                        ? "text-gray-500 line-through"
                        : locked
                        ? "text-gray-600"
                        : "text-gray-800"
                    }`}
                  >
                    {a.title}
                  </p>
                  <p className="text-[10px] font-bold mt-0.5" style={{ color: meta.color }}>
                    {meta.label} · +{a.xp} XP
                    {locked && " · Premium"}
                  </p>
                </div>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (done) return;
                    open();
                  }}
                  disabled={done}
                  className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center font-extrabold text-xs transition-all"
                  style={
                    done
                      ? { background: "#10b981", color: "#fff" }
                      : locked
                      ? {
                          background: "linear-gradient(135deg,#F5C14A,#E8821A)",
                          color: "#fff",
                          boxShadow: "0 4px 12px rgba(200,120,20,.3)",
                        }
                      : {
                          ...liquidCard,
                          color: "#2A3A28",
                          fontWeight: 900,
                        }
                  }
                  whileTap={done ? undefined : { scale: 0.9 }}
                  aria-label={done ? "Concluído" : locked ? "Desbloquear premium" : "Ver atividade"}
                >
                  {done ? <Check size={18} /> : locked ? <Lock size={16} /> : "Ver"}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {!isPremium && (
          <p className="mt-3 text-center text-[11px] text-gray-600 font-semibold">
            ✨ 1 atividade grátis em cada categoria · Premium libera todas
          </p>
        )}
      </div>

      {/* Modal de detalhe — explica como fazer + exemplo prático */}
      <ActivityDetailModal
        activity={selected}
        childName={childName}
        done={selected ? completed.has(selected.id) : false}
        onComplete={handleComplete}
        onClose={() => setSelected(null)}
      />
      <ContextualPaywallModal
        open={showPremiumCTA}
        context="premium_feature"
        onClose={() => setShowPremiumCTA(false)}
      />
    </motion.div>
  );
};

export default MyActivities;

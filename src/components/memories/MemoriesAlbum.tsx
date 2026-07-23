import { useCallback, useMemo, type CSSProperties } from "react";
import { useMemories, type Memory } from "@/hooks/useMemories";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getAllProgress } from "@/lib/storyProgress";
import {
  getWeekKey,
  loadCompletedSet,
  loadWeeklyCache,
  pickWeeklyFromPool,
  type Activity,
} from "@/lib/weeklyActivities";
import { FONT, SERIF, R } from "@/lib/premiumUi";
import { CAMALEAO, CAMALEAO_SCENE_MASK } from "@/lib/camaleaoOficial";

/**
 * MemoriesAlbum — redesign premium v2
 * Ref: public/telas/memorias/
 * Assets: camaleão original soft · mix Gui + família
 *
 * Dados reais de consumo (nunca mock fixo de conteúdo):
 *  - Momentos guardados  → memories do usuário (useMemories)
 *  - Em andamento        → histórias com leitura <100% + missões da semana incompletas
 *                          + progresso rumo à próxima conquista de perguntas
 *  - Conquistas          → desbloqueadas por questions_used / stories_used / missions /
 *                          total de memórias / streak_days
 *  - Pontos              → profile.points
 */

const AS = "/exemplos/assets/memorias-v2";
/** bump ao regenerar assets (cache bust no browser) */
const AV = "v3";
const asset = (name: string) => `${AS}/${name}?${AV}`;

interface MemoriesAlbumProps {
  onBack: () => void;
  onNavigateToChat?: () => void;
  onNavigateToStories?: () => void;
  onNavigateToPlay?: () => void;
  onOpenParent?: () => void;
}

/* ── Paletas ── */
const TINT: Record<string, [number, number, number]> = {
  rosa: [233, 140, 180],
  azul: [120, 180, 240],
  verde: [140, 205, 120],
  roxo: [175, 140, 235],
  ambar: [230, 185, 95],
};
const GLOSSY: Record<string, [string, string, string]> = {
  rosa: ["#FFB9D2", "#F0679B", "#C93A72"],
  azul: ["#A8D4FF", "#4E9BE8", "#2568B8"],
  verde: ["#C0EDA0", "#6FBE4F", "#3F8A32"],
  roxo: ["#D8C2FF", "#9A6CF0", "#6A3EC0"],
  ambar: ["#FFE49A", "#F2B23B", "#C77E12"],
};
const ACCENT = { tint: TINT.rosa, solid: "#F2A9C4" };
const CONQ_COLORS = ["rosa", "azul", "verde", "roxo", "ambar"] as const;

const D = {
  chat: "M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.6 0-3.1-.4-4.4-1.2L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5Z",
  book: "M12 6.8C10.5 5.3 8.3 4.5 6 4.5c-.7 0-1.4.1-2 .2v13c.6-.1 1.3-.2 2-.2 2.3 0 4.5.8 6 2.3 1.5-1.5 3.7-2.3 6-2.3.7 0 1.4.1 2 .2v-13c-.6-.1-1.3-.2-2-.2-2.3 0-4.5.8-6 2.3Zm0 0v13",
  target: "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Zm0-4.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm0-3.3a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z",
  heart: "M12 20.3l-7.1-6.9a4.6 4.6 0 0 1 6.4-6.5l.7.7.7-.7a4.6 4.6 0 0 1 6.4 6.5Z",
  star: "M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.7-5.3 2.7 1-5.8L3.5 9.7l5.9-.9Z",
  grid: "M4.5 4.5h6v6h-6Zm9 0h6v6h-6Zm-9 9h6v6h-6Zm9 0h6v6h-6Z",
  trophy: "M8 4h8v3a4 4 0 0 1-8 0V4Zm-4 1h4v2a4 4 0 0 1-4-2Zm16 0h-4v2a4 4 0 0 0 4-2Zm-8 6.5V17m-3.5 3h7M9.5 17h5",
  photo: "M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5Zm0 8.5 4.2-4.2a1.5 1.5 0 0 1 2.1 0L16 16.5m-2-3 1.7-1.7a1.5 1.5 0 0 1 2.1 0L20 14M9.2 8.7a1.3 1.3 0 1 1-2.6 0 1.3 1.3 0 0 1 2.6 0Z",
  shield: "M12 3 5 6v5c0 4.5 2.8 7.8 7 9 4.2-1.2 7-4.5 7-9V6l-7-3Z",
};

const TYPE_META: Record<
  Memory["type"],
  { k: string; d: string; tag: string; tagColor: [string, string]; cover: string }
> = {
  question: {
    k: "rosa",
    d: D.chat,
    tag: "Pergunta",
    tagColor: ["rgba(244,168,200,.92)", "#4A1F35"],
    cover: asset("cover-question.png"),
  },
  story: {
    k: "azul",
    d: D.book,
    tag: "História",
    tagColor: ["rgba(150,200,245,.92)", "#133A5E"],
    cover: asset("cover-story.png"),
  },
  mission: {
    k: "verde",
    d: D.target,
    tag: "Missão",
    tagColor: ["rgba(170,218,140,.92)", "#23431A"],
    cover: asset("cover-mission.png"),
  },
  achievement: {
    k: "ambar",
    d: D.trophy,
    tag: "Conquista",
    tagColor: ["rgba(242,178,59,.92)", "#4A3210"],
    cover: asset("cover-default.png"),
  },
};

type InProgressItem = {
  id: string;
  kind: "question" | "story" | "mission";
  title: string;
  subtitle: string;
  current: number;
  total: number;
  onClick?: () => void;
};

type FamilyBadge = {
  id: string;
  title: string;
  description: string;
  d: string;
  img: string;
  unlocked: boolean;
  current: number;
  threshold: number;
};

const glass = (r: number, g: number, b: number, aTop = 0.55, aBot = 0.18): CSSProperties => {
  const rgba = (a: number) => `rgba(${r},${g},${b},${a})`;
  return {
    background: `linear-gradient(155deg, rgba(255,255,255,.30) 0%, ${rgba(aTop)} 22%, ${rgba((aTop + aBot) / 2)} 55%, ${rgba(aBot)} 82%, rgba(255,255,255,.06) 100%)`,
    backdropFilter: "blur(36px) saturate(170%)",
    WebkitBackdropFilter: "blur(36px) saturate(170%)",
    border: "0.5px solid rgba(255,255,255,.42)",
    boxShadow: `0 14px 32px rgba(0,0,0,.38), 0 0 26px ${rgba(0.22)}, inset 0 1.5px 0 rgba(255,255,255,.6), inset 0 -10px 20px rgba(0,0,0,.12), inset 0 10px 24px ${rgba(0.18)}`,
  };
};

const gloss = (light: string, mid: string, deep: string, size = 42, radius = 999): CSSProperties => ({
  flex: "none",
  width: size,
  height: size,
  borderRadius: radius,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${light} 16%, ${mid} 55%, ${deep} 100%)`,
  boxShadow:
    "0 6px 14px rgba(0,0,0,.35), inset 0 2px 3px rgba(255,255,255,.7), inset 0 -5px 10px rgba(0,0,0,.28)",
});

const actionCard = (k: string): CSSProperties => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: 24,
  padding: "13px 11px 11px",
  textAlign: "left",
  cursor: "pointer",
  ...glass(...TINT[k], 0.58, 0.2),
  display: "flex",
  flexDirection: "column",
  gap: 7,
  transition: "transform .2s",
  fontFamily: FONT,
});

const arrow = (k: string): CSSProperties => ({
  alignSelf: "flex-end",
  width: 25,
  height: 25,
  borderRadius: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${GLOSSY[k][0]} 20%, ${GLOSSY[k][1]} 60%, ${GLOSSY[k][2]} 100%)`,
  boxShadow: "0 4px 10px rgba(0,0,0,.35), inset 0 1px 2px rgba(255,255,255,.6)",
});

function formatShortDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

const Icon = ({
  d,
  stroke = "#fff",
  size = 20,
  sw = 1.8,
}: {
  d: string;
  stroke?: string;
  size?: number;
  sw?: number;
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const KEYFRAMES = `
@keyframes memv2-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes memv2-twinkle{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.15)}}
@keyframes memv2-sparklefloat{0%,100%{opacity:.15;transform:translateY(0) scale(.7)}50%{opacity:.95;transform:translateY(-14px) scale(1.1)}}
@keyframes memv2-drift1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(28px,18px) scale(1.12)}}
@keyframes memv2-drift2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-30px,-16px) scale(1.1)}}
@keyframes memv2-shine{0%{transform:translateX(-130%) skewX(-18deg)}60%,100%{transform:translateX(240%) skewX(-18deg)}}
@keyframes memv2-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes memv2-raysway{0%,100%{opacity:.55;transform:translateX(0)}50%{opacity:.85;transform:translateX(8px)}}
`;

/** Próximo marco de perguntas a partir do consumo real */
function nextQuestionMilestone(used: number): { current: number; total: number } | null {
  const marks = [1, 3, 10, 20, 50];
  const next = marks.find((m) => used < m);
  if (!next) return null;
  return { current: used, total: next };
}

const MemoriesAlbum = ({
  onBack,
  onNavigateToChat,
  onNavigateToStories,
  onNavigateToPlay,
  onOpenParent,
}: MemoriesAlbumProps) => {
  const { profile, handleCheckout } = useAuth();
  const {
    memories,
    allMemories,
    loading,
    filter,
    setFilter,
    toggleSpecial,
    totalCount,
    lockedCount,
    isPremium,
  } = useMemories();

  const childName = profile?.child_name || "amigo";
  const pontos = profile?.points ?? 0;
  const questionsUsed = profile?.questions_used ?? 0;
  const storiesUsed = profile?.stories_used ?? 0;
  const streakDays = profile?.streak_days ?? 0;
  const h = new Date().getHours();
  const saudacao = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";

  const handleShare = useCallback(
    async (m: Memory) => {
      const shareText = `${m.title}\n\n${m.content || ""}\n\n💛 Criado com KIDZZ — kidzzapp.lovable.app`;
      if (navigator.share) {
        try {
          await navigator.share({ title: `Memória de ${childName}`, text: shareText });
        } catch {
          /* cancelado */
        }
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Memória copiada! 💛");
      }
    },
    [childName]
  );

  const momentos = useMemo(
    () => memories.filter((m) => m.type !== "achievement"),
    [memories]
  );

  const missionCount = useMemo(
    () => allMemories.filter((m) => m.type === "mission").length,
    [allMemories]
  );
  const albumCount = allMemories.length;

  /** Conquistas da família — só desbloqueiam com consumo real */
  const familyBadges: FamilyBadge[] = useMemo(
    () => [
      {
        id: "primeiros-passos",
        title: "Primeiros Passos",
        description: "Fez sua primeira pergunta",
        d: D.heart,
        img: asset("badge-heart.png"),
        unlocked: questionsUsed >= 1,
        current: questionsUsed,
        threshold: 1,
      },
      {
        id: "escritores",
        title: "Escritores",
        description: "Criou 5 histórias",
        d: D.book,
        img: asset("badge-book.png"),
        unlocked: storiesUsed >= 5,
        current: storiesUsed,
        threshold: 5,
      },
      {
        id: "exploradores",
        title: "Exploradores",
        description: "Completou 3 missões",
        d: D.target,
        img: asset("badge-target.png"),
        unlocked: missionCount >= 3,
        current: missionCount,
        threshold: 3,
      },
      {
        id: "album-vivo",
        title: "Álbum Vivo",
        description: "Guardou 10 momentos",
        d: D.photo,
        img: asset("badge-album.png"),
        unlocked: albumCount >= 10,
        current: albumCount,
        threshold: 10,
      },
      {
        id: "familia-incrivel",
        title: "Família Incrível",
        description: "Participou por 7 dias",
        d: D.star,
        img: asset("badge-star.png"),
        unlocked: streakDays >= 7,
        current: streakDays,
        threshold: 7,
      },
    ],
    [questionsUsed, storiesUsed, missionCount, albumCount, streakDays]
  );

  /** Em andamento — só o que a família realmente começou / consumiu */
  const inProgress: InProgressItem[] = useMemo(() => {
    const items: InProgressItem[] = [];

    // 1) Histórias com leitura incompleta (storyProgress + título real da memória/biblioteca salva)
    const progressMap = getAllProgress();
    const storyMemories = allMemories.filter((m) => m.type === "story");
    const incompleteStories = storyMemories
      .map((m) => {
        const p = progressMap[m.id];
        if (!p || p.pct >= 100 || p.total <= 0) return null;
        return {
          id: `story-${m.id}`,
          kind: "story" as const,
          title: m.title,
          subtitle: "Em criação",
          current: Math.min(p.total, p.page + 1),
          total: p.total,
          onClick: () => onNavigateToStories?.(),
        };
      })
      .filter(Boolean) as InProgressItem[];
    incompleteStories
      .sort((a, b) => b.current / b.total - a.current / a.total)
      .slice(0, 2)
      .forEach((s) => items.push(s));

    // 2) Missões da semana incompletas (atividades reais da semana)
    try {
      const weekKey = getWeekKey();
      const completed = loadCompletedSet(weekKey);
      const cached = loadWeeklyCache(weekKey);
      const activities: Activity[] =
        cached?.activities ?? pickWeeklyFromPool(`${weekKey}-mem`);
      const incomplete = activities.filter((a) => !completed.has(a.id));
      const done = activities.length - incomplete.length;
      if (incomplete.length > 0 && activities.length > 0) {
        const highlight = incomplete[0];
        items.push({
          id: `mission-week-${highlight.id}`,
          kind: "mission",
          title: highlight.title,
          subtitle: "Em progresso",
          current: done,
          total: activities.length,
          onClick: () => onNavigateToPlay?.(),
        });
      }
    } catch {
      /* localStorage indisponível */
    }

    // 3) Progresso de perguntas rumo ao próximo marco — usa última pergunta consumida no título
    const qMark = nextQuestionMilestone(questionsUsed);
    if (qMark && qMark.total > 1) {
      const lastQ = allMemories.find((m) => m.type === "question");
      items.push({
        id: "question-milestone",
        kind: "question",
        title: lastQ?.title || `Perguntas com ${childName}`,
        subtitle: "Responda juntos",
        current: qMark.current,
        total: qMark.total,
        onClick: () => onNavigateToChat?.(),
      });
    }

    return items.slice(0, 4);
  }, [allMemories, questionsUsed, childName, onNavigateToStories, onNavigateToPlay, onNavigateToChat]);

  const showMomentos = momentos.length > 0;
  const showInProgress = inProgress.length > 0;
  const showConquistas = familyBadges.some((b) => b.unlocked) || totalCount > 0;

  const acoes = [
    {
      key: "a1",
      title: "Nova Pergunta",
      sub: `Crie perguntas para ${childName}`,
      d: D.chat,
      k: "rosa",
      onClick: () => onNavigateToChat?.(),
    },
    {
      key: "a2",
      title: "Nova História",
      sub: "Escreva uma história juntos",
      d: D.book,
      k: "azul",
      onClick: () => onNavigateToStories?.(),
    },
    {
      key: "a3",
      title: "Nova Missão",
      sub: "Desafios para criar memórias",
      d: D.target,
      k: "verde",
      onClick: () => onNavigateToPlay?.() ?? toast("Abra Brincar para missões ✨"),
    },
  ];

  const chips: { id: typeof filter; label: string; d: string }[] = [
    { id: "all", label: "Todas", d: D.grid },
    { id: "question", label: "Perguntas", d: D.chat },
    { id: "story", label: "Histórias", d: D.book },
    { id: "mission", label: "Missões", d: D.target },
    { id: "achievement", label: "Conquistas", d: D.trophy },
  ];

  const [ar, ag, ab] = ACCENT.tint;
  const chipBase: CSSProperties = {
    flex: "none",
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 15px",
    borderRadius: 999,
    fontFamily: FONT,
    fontWeight: 800,
    fontSize: 13,
    cursor: "pointer",
    transition: "all .25s",
    outline: "none",
    minHeight: 44,
  };
  const verTodasStyle: CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: FONT,
    fontWeight: 900,
    fontSize: 12.5,
    color: ACCENT.solid,
    padding: 0,
  };

  const kindStyle = (kind: InProgressItem["kind"]) => {
    if (kind === "question") return { k: "rosa" as const, d: D.chat, prefix: "Pergunta" };
    if (kind === "story") return { k: "azul" as const, d: D.book, prefix: "História" };
    return { k: "verde" as const, d: D.target, prefix: "Missão" };
  };

  return (
    <div
      style={{
        height: "100%",
        position: "relative",
        fontFamily: FONT,
        background: "linear-gradient(180deg,#26341F 0%,#1E2A19 38%,#161F12 72%,#121A0F 100%)",
      }}
    >
      <style>{KEYFRAMES}</style>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(45% 30% at 80% 30%,rgba(255,214,140,.10),transparent 70%),radial-gradient(40% 26% at 12% 55%,rgba(160,220,255,.06),transparent 70%),radial-gradient(50% 30% at 55% 88%,rgba(233,140,180,.07),transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -60,
          left: -80,
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(255,214,140,.18),transparent 65%)",
          filter: "blur(28px)",
          animation: "memv2-drift1 13s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: -90,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(120,180,240,.13),transparent 65%)",
          filter: "blur(30px)",
          animation: "memv2-drift2 17s ease-in-out 2s infinite",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)",
          scrollbarWidth: "none",
          position: "relative",
        }}
      >
        {/* ── HERO ── */}
        <div style={{ position: "relative", height: 352 }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 316, overflow: "hidden" }}>
            <img
              src={CAMALEAO.heartSoft}
              alt="Gui, o camaleão, escrevendo memórias no diário"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center 30%",
                animation: "memv2-floaty 6s ease-in-out infinite",
                ...CAMALEAO_SCENE_MASK,
                filter: "drop-shadow(0 16px 24px rgba(40,30,20,.26))",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = CAMALEAO.heart;
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "44%",
              height: 316,
              pointerEvents: "none",
              background:
                "linear-gradient(180deg,rgba(255,226,160,.22) 0%,rgba(255,226,160,.06) 45%,transparent 75%)",
              filter: "blur(6px)",
              animation: "memv2-raysway 7s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 316,
              background:
                "linear-gradient(180deg,rgba(18,24,14,.4) 0%,rgba(18,24,14,0) 20%,rgba(38,52,31,0) 42%,rgba(38,52,31,.4) 70%,rgba(38,52,31,.16) 90%,transparent 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 316,
              background:
                "linear-gradient(97deg,rgba(20,28,16,.82) 0%,rgba(20,28,16,.4) 30%,rgba(20,28,16,0) 58%)",
            }}
          />

          <button
            onClick={onBack}
            aria-label="Voltar"
            className="active:scale-90"
            style={{
              position: "absolute",
              top: 62,
              left: 16,
              width: 44,
              height: 44,
              borderRadius: 999,
              cursor: "pointer",
              background: "rgba(255,255,255,.14)",
              backdropFilter: "blur(16px) saturate(150%)",
              border: "0.5px solid rgba(255,255,255,.32)",
              boxShadow: "0 6px 16px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5m6-6-6 6 6 6"
                stroke="#F4EFE2"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div style={{ position: "absolute", top: 62, right: 16, display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => onOpenParent?.()}
              aria-label="Área dos pais"
              className="active:scale-95"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "8px 13px",
                minHeight: 44,
                borderRadius: 999,
                background: "rgba(255,255,255,.14)",
                backdropFilter: "blur(16px) saturate(150%)",
                border: "0.5px solid rgba(255,255,255,.3)",
                boxShadow: "0 6px 16px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.35)",
                fontWeight: 900,
                fontSize: 13,
                color: "#F4EFE2",
                cursor: onOpenParent ? "pointer" : "default",
                fontFamily: FONT,
              }}
            >
              <Icon d={D.shield} stroke="#CFE6FF" size={14} sw={1.9} />
              Pais
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "8px 13px",
                minHeight: 44,
                borderRadius: 999,
                background: "rgba(255,255,255,.14)",
                backdropFilter: "blur(16px) saturate(150%)",
                border: "0.5px solid rgba(255,255,255,.3)",
                boxShadow: "0 6px 16px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.35)",
                fontWeight: 900,
                fontSize: 13,
                color: "#F4EFE2",
              }}
            >
              <Icon d={D.trophy} stroke="#F2C55C" size={14} sw={1.9} />
              {pontos}
            </div>
          </div>

          <div style={{ position: "absolute", left: 20, bottom: 8, width: 252, animation: "memv2-rise .6s both" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,.13)",
                backdropFilter: "blur(12px)",
                border: "0.5px solid rgba(255,255,255,.28)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)",
                fontWeight: 800,
                fontSize: 12,
                color: "rgba(244,239,226,.9)",
                marginBottom: 11,
              }}
            >
              {saudacao}, família!
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#8FE3CD" style={{ verticalAlign: -2 }}>
                <path d={D.heart} />
              </svg>
            </div>
            <h1
              style={{
                margin: "0 0 9px",
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 30,
                lineHeight: 1.14,
                color: "#F4EDDC",
                letterSpacing: "-.2px",
                textShadow: "0 2px 14px rgba(0,0,0,.45)",
              }}
            >
              Aqui guardamos <span style={{ color: "#F2A9C4" }}>memórias</span> que viram histórias.
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 700,
                lineHeight: 1.45,
                color: "rgba(238,233,222,.78)",
                maxWidth: 225,
                textShadow: "0 1px 8px rgba(0,0,0,.4)",
              }}
            >
              Cada momento juntos merece ser lembrado para sempre.
            </p>
          </div>
        </div>

        {/* ── AÇÕES RÁPIDAS ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            padding: "10px 16px 0",
            position: "relative",
            zIndex: 5,
            animation: "memv2-rise .6s .1s both",
          }}
        >
          {acoes.map((a) => (
            <button key={a.key} onClick={a.onClick} className="active:scale-95" style={actionCard(a.k)}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "55%",
                  height: "100%",
                  pointerEvents: "none",
                  background:
                    "linear-gradient(105deg,transparent 0%,rgba(255,255,255,.22) 50%,transparent 100%)",
                  animation: "memv2-shine 5.5s ease-in-out infinite",
                }}
              />
              <div style={gloss(...GLOSSY[a.k], 40, 999)}>
                <Icon d={a.d} />
              </div>
              <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 14, color: "#F6F1E4", lineHeight: 1.15 }}>
                {a.title}
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: "rgba(240,235,225,.68)", lineHeight: 1.35 }}>
                {a.sub}
              </div>
              <div style={arrow(a.k)}>
                <Icon d="M5 12h14m-6-6 6 6-6 6" size={13} sw={2.4} />
              </div>
            </button>
          ))}
        </div>

        {/* ── FILTROS ── */}
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            padding: "18px 16px 4px",
            scrollbarWidth: "none",
          }}
        >
          {chips.map((chip) => {
            const on = chip.id === filter;
            const style: CSSProperties = on
              ? {
                  ...chipBase,
                  ...glass(ar, ag, ab, 0.68, 0.32),
                  color: "#fff",
                  boxShadow: `0 8px 20px rgba(0,0,0,.35), 0 0 22px rgba(${ar},${ag},${ab},.45), inset 0 1.5px 0 rgba(255,255,255,.65)`,
                }
              : {
                  ...chipBase,
                  background: "linear-gradient(155deg, rgba(255,255,255,.20), rgba(255,255,255,.08))",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  color: "rgba(240,235,225,.88)",
                  border: "0.5px solid rgba(255,255,255,.3)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 4px 12px rgba(0,0,0,.25)",
                };
            return (
              <button key={chip.id} onClick={() => setFilter(chip.id)} className="active:scale-95" style={style}>
                <Icon d={chip.d} stroke={on ? "#fff" : "rgba(240,235,225,.8)"} size={15} sw={2} />
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* ── ESTADOS ── */}
        {loading ? (
          <div
            style={{
              padding: "48px 16px",
              textAlign: "center",
              color: "rgba(240,235,225,.7)",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            Carregando memórias…
          </div>
        ) : (
          <>
            {/* ── EM ANDAMENTO (consumo real incompleto) ── */}
            {showInProgress && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    padding: "20px 20px 10px",
                  }}
                >
                  <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: 19, color: "#F4EDDC" }}>
                    Em andamento
                  </h2>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    overflowX: "auto",
                    padding: "2px 16px 10px",
                    scrollbarWidth: "none",
                  }}
                >
                  {inProgress.map((item) => {
                    const ks = kindStyle(item.kind);
                    const pct = item.total > 0 ? Math.min(100, (item.current / item.total) * 100) : 0;
                    const bar =
                      item.kind === "question"
                        ? "linear-gradient(90deg,#F0679B,#C93A72)"
                        : item.kind === "story"
                          ? "linear-gradient(90deg,#4E9BE8,#2568B8)"
                          : "linear-gradient(90deg,#6FBE4F,#3F8A32)";
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => item.onClick?.()}
                        className="active:scale-95"
                        style={{
                          flex: "none",
                          width: 210,
                          borderRadius: 22,
                          padding: "14px 14px 12px",
                          textAlign: "left",
                          cursor: item.onClick ? "pointer" : "default",
                          fontFamily: FONT,
                          ...glass(...TINT[ks.k], 0.55, 0.18),
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          animation: "memv2-rise .45s both",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={gloss(...GLOSSY[ks.k], 36, 14)}>
                            <Icon d={ks.d} size={16} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontFamily: SERIF,
                                fontWeight: 600,
                                fontSize: 13,
                                color: "#F6F1E4",
                                lineHeight: 1.25,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {ks.prefix}: {item.title}
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(240,235,225,.62)" }}>
                              {item.subtitle}
                            </div>
                          </div>
                          <Icon d="M9 6l6 6-6 6" size={14} stroke="rgba(240,235,225,.55)" sw={2.2} />
                        </div>
                        <div
                          style={{
                            height: 6,
                            borderRadius: 999,
                            background: "rgba(0,0,0,.22)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              borderRadius: 999,
                              background: bar,
                              boxShadow: "0 0 8px rgba(255,255,255,.25)",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            alignSelf: "flex-end",
                            fontSize: 11,
                            fontWeight: 900,
                            color: "rgba(240,235,225,.7)",
                          }}
                        >
                          {item.current}/{item.total}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty: sem memórias guardadas ainda */}
            {totalCount === 0 && (
              <div style={{ padding: "40px 28px", textAlign: "center" }}>
                <img
                  src={asset("feat-familia.png")}
                  alt=""
                  style={{
                    width: 140,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: R.card,
                    margin: "0 auto 16px",
                    boxShadow: "0 12px 28px rgba(0,0,0,.35)",
                    border: "0.5px solid rgba(255,255,255,.35)",
                  }}
                />
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 600,
                    fontSize: 19,
                    color: "#F4EDDC",
                    lineHeight: 1.3,
                    margin: "0 0 8px",
                  }}
                >
                  Aqui vão ficar as memórias mais preciosas de {childName} 💛
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "rgba(238,233,222,.7)",
                    lineHeight: 1.5,
                    margin: "0 0 20px",
                  }}
                >
                  Cada pergunta respondida, cada história criada, cada missão em família — tudo guardado para sempre.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 280, margin: "0 auto" }}>
                  <button
                    onClick={() => onNavigateToChat?.()}
                    className="active:scale-95"
                    style={{
                      width: "100%",
                      padding: 14,
                      minHeight: 48,
                      borderRadius: 16,
                      cursor: "pointer",
                      border: "none",
                      ...glass(...TINT.rosa, 0.6, 0.24),
                      color: "#fff",
                      fontFamily: FONT,
                      fontWeight: 900,
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Icon d={D.chat} size={16} /> Fazer primeira pergunta →
                  </button>
                  <button
                    onClick={() => onNavigateToStories?.()}
                    className="active:scale-95"
                    style={{
                      width: "100%",
                      padding: 12,
                      minHeight: 48,
                      borderRadius: 16,
                      cursor: "pointer",
                      background: "linear-gradient(155deg, rgba(255,255,255,.2), rgba(255,255,255,.08))",
                      backdropFilter: "blur(14px)",
                      border: "0.5px solid rgba(255,255,255,.3)",
                      color: "rgba(240,235,225,.9)",
                      fontFamily: FONT,
                      fontWeight: 800,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Icon d={D.book} size={14} stroke="rgba(240,235,225,.9)" /> Criar primeira história →
                  </button>
                </div>
              </div>
            )}

            {/* ── MOMENTOS GUARDADOS (consumo real) ── */}
            {showMomentos && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    padding: "20px 20px 10px",
                  }}
                >
                  <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: 19, color: "#F4EDDC" }}>
                    Momentos guardados 🌱
                  </h2>
                  {filter !== "all" && (
                    <button onClick={() => setFilter("all")} style={verTodasStyle}>
                      Ver todas →
                    </button>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    overflowX: "auto",
                    padding: "2px 16px 10px",
                    scrollbarWidth: "none",
                  }}
                >
                  {momentos.map((m) => {
                    const meta = TYPE_META[m.type];
                    const cover = m.image_url || meta.cover;
                    return (
                      <div
                        key={m.id}
                        style={{
                          flex: "none",
                          width: 158,
                          borderRadius: 22,
                          position: "relative",
                          overflow: "hidden",
                          boxShadow: "0 14px 30px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.3)",
                          border: "0.5px solid rgba(255,255,255,.28)",
                          animation: "memv2-rise .45s both",
                          background: "rgba(255,255,255,.06)",
                        }}
                      >
                        <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
                          <div
                            role="img"
                            aria-label={m.title}
                            style={{
                              position: "absolute",
                              inset: 0,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              backgroundImage: `url("${cover}")`,
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              padding: "4px 11px",
                              borderRadius: 999,
                              background: meta.tagColor[0],
                              backdropFilter: "blur(8px)",
                              border: "0.5px solid rgba(255,255,255,.55)",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,.6), 0 3px 8px rgba(0,0,0,.25)",
                              color: meta.tagColor[1],
                              fontSize: 10,
                              fontWeight: 900,
                              letterSpacing: ".2px",
                            }}
                          >
                            {meta.tag}
                          </div>
                          <button
                            onClick={() => handleShare(m)}
                            aria-label="Compartilhar memória"
                            className="active:scale-90"
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              width: 28,
                              height: 28,
                              borderRadius: 999,
                              cursor: "pointer",
                              background: "rgba(20,26,16,.45)",
                              backdropFilter: "blur(10px)",
                              border: "0.5px solid rgba(255,255,255,.3)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm12-6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm0 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8.7 11l6.6-3.5M8.7 13l6.6 3.5"
                                stroke="#fff"
                                strokeWidth="1.9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                        <div
                          style={{
                            padding: "9px 12px 10px",
                            background: "linear-gradient(160deg,rgba(255,255,255,.10),rgba(255,255,255,.04))",
                            backdropFilter: "blur(14px)",
                            borderTop: "0.5px solid rgba(255,255,255,.18)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <div
                            style={{
                              fontFamily: SERIF,
                              fontWeight: 600,
                              fontSize: 13,
                              color: "#F6F1E4",
                              lineHeight: 1.2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {m.title}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(240,235,225,.62)" }}>
                              {formatShortDate(m.created_at)}
                            </div>
                            <button
                              onClick={() => toggleSpecial(m.id, m.is_special)}
                              aria-label={m.is_special ? "Remover dos especiais" : "Marcar como especial"}
                              className="active:scale-90"
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                color: m.is_special ? "#F2C55C" : "rgba(240,235,225,.55)",
                                fontSize: 11,
                                fontWeight: 900,
                                minHeight: 28,
                                minWidth: 28,
                              }}
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill={m.is_special ? "#F2C55C" : "none"}
                              >
                                <path
                                  d={D.star}
                                  stroke={m.is_special ? "#F2C55C" : "rgba(240,235,225,.6)"}
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── CONQUISTAS DA FAMÍLIA (baseadas em consumo real) ── */}
            {showConquistas && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    padding: "20px 20px 10px",
                  }}
                >
                  <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: 19, color: "#F4EDDC" }}>
                    Conquistas da família 🌱
                  </h2>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    overflowX: "auto",
                    padding: "2px 16px 10px",
                    scrollbarWidth: "none",
                  }}
                >
                  {familyBadges.map((c, i) => {
                    const ck = CONQ_COLORS[i % CONQ_COLORS.length];
                    return (
                      <div
                        key={c.id}
                        style={{
                          ...glass(...TINT[ck], c.unlocked ? 0.5 : 0.22, c.unlocked ? 0.14 : 0.08),
                          flex: "none",
                          width: 122,
                          borderRadius: 22,
                          padding: "14px 10px 12px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 8,
                          textAlign: "center",
                          animation: "memv2-rise .45s both",
                          opacity: c.unlocked ? 1 : 0.55,
                        }}
                      >
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 16,
                            overflow: "hidden",
                            boxShadow:
                              "0 6px 14px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.45)",
                            border: "0.5px solid rgba(255,255,255,.4)",
                            flex: "none",
                          }}
                        >
                          <img
                            src={c.img}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                              filter: c.unlocked ? "none" : "grayscale(0.55) brightness(0.85)",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontFamily: SERIF,
                            fontWeight: 600,
                            fontSize: 12.5,
                            color: "#F6F1E4",
                            lineHeight: 1.2,
                          }}
                        >
                          {c.title}
                        </div>
                        <div style={{ fontSize: 9.5, fontWeight: 800, color: "rgba(240,235,225,.62)", lineHeight: 1.35 }}>
                          {c.unlocked ? c.description : `${c.current}/${c.threshold}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {lockedCount > 0 && (
              <div
                style={{
                  margin: "14px 16px 0",
                  borderRadius: 22,
                  padding: "18px 16px",
                  textAlign: "center",
                  ...glass(...TINT.roxo, 0.5, 0.16),
                }}
              >
                <p style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: 15, color: "#F6F1E4" }}>
                  +{lockedCount} memórias guardadas com carinho 💛
                </p>
                <p style={{ margin: "4px 0 12px", fontSize: 12, fontWeight: 700, color: "rgba(240,235,225,.7)" }}>
                  Desbloqueie todas com Premium ✨
                </p>
                <button
                  onClick={() => handleCheckout("premium")}
                  className="active:scale-95"
                  style={{
                    width: "100%",
                    padding: 13,
                    minHeight: 48,
                    borderRadius: 16,
                    cursor: "pointer",
                    border: "none",
                    background: "linear-gradient(160deg,#9A6CF0,#6A3EC0)",
                    color: "#fff",
                    fontFamily: FONT,
                    fontWeight: 900,
                    fontSize: 14,
                    boxShadow: "0 10px 24px rgba(90,50,150,.4),inset 0 1px 0 rgba(255,255,255,.3)",
                  }}
                >
                  🔓 Desbloquear todas as memórias
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MemoriesAlbum;

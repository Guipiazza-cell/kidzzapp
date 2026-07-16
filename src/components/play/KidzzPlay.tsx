import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  lazy,
  Suspense,
  type CSSProperties,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Trophy, Shield, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAchievementSync } from "@/hooks/useAchievementSync";
import {
  BRINCAR_EXPERIENCES,
  type BrincarExperience,
} from "@/data/brincarExperiences";
import LockedFeature from "@/components/LockedFeature";
import KidzzHeader from "@/components/common/KidzzHeader";
import MyActivities from "./MyActivities";
import confetti from "canvas-confetti";
import { FONT, SERIF, R, PAD, pillGlassLight } from "@/lib/premiumUi";

/** Assets gerados Hermes/Codex — public/telas/brincar */
const BR = "/exemplos/assets/brincar-v2";

const WordSearchGame = lazy(() => import("./games/WordSearchGame"));
const MemoryGame = lazy(() => import("./games/MemoryGame"));
const HangmanGame = lazy(() => import("./games/HangmanGame"));
const DailyChallengeGame = lazy(() => import("./games/DailyChallengeGame"));
const PixelPulaGame = lazy(() => import("./games/PixelPulaGame"));
const ReactionGame = lazy(() => import("./games/ReactionGame"));
const EmotionsGame = lazy(() => import("./games/EmotionsGame"));
const CreateGame = lazy(() => import("./games/CreateGame"));

type GameId =
  | "pixel-pula"
  | "word"
  | "memory"
  | "hangman"
  | "daily"
  | "reaction"
  | "emotions"
  | "create";

type SubScreen = "home" | "missoes" | "criar" | "jogos";

interface FeaturedActivity {
  id: string;
  titulo: string;
  desc: string;
  img: string;
  tempo: string;
  idade: string;
  energia: "leve" | "média" | "ativa";
  premium?: boolean;
  tint: string; // overlay tint color (usado no modal de detalhe)
  scrim: string; // gradiente colorido do card (fiel ao SCRIM do design)
}

const FEATURED: FeaturedActivity[] = [
  {
    id: "cabana",
    titulo: "Cabana Secreta",
    desc: "Monte um esconderijo incrível e conte histórias!",
    img: `${BR}/act-cabana.png`,
    tempo: "5 min",
    idade: "3–6 anos",
    energia: "leve",
    tint: "rgba(232,130,26,0.55)",
    scrim:
      "linear-gradient(180deg, rgba(120,60,10,0) 30%, rgba(95,45,8,.85) 100%)",
  },
  {
    id: "caca",
    titulo: "Caça ao Tesouro",
    desc: "Encontre os objetos escondidos pela casa.",
    img: `${BR}/act-caca.png`,
    tempo: "10 min",
    idade: "4–8 anos",
    energia: "média",
    premium: true,
    tint: "rgba(70,112,58,0.55)",
    scrim:
      "linear-gradient(180deg, rgba(15,50,25,0) 30%, rgba(12,42,22,.85) 100%)",
  },
  {
    id: "arte",
    titulo: "Arte Sem Regras",
    desc: "Liberte a criatividade com tinta e imaginação.",
    img: `${BR}/act-arte.png`,
    tempo: "15 min",
    idade: "3–10 anos",
    energia: "leve",
    tint: "rgba(193,115,166,0.55)",
    scrim:
      "linear-gradient(180deg, rgba(90,40,60,0) 30%, rgba(70,30,48,.85) 100%)",
  },
  {
    id: "aviao",
    titulo: "Aviões de Papel",
    desc: "Quem faz o avião que voa mais longe?",
    img: `${BR}/act-aviao.png`,
    tempo: "7 min",
    idade: "5–9 anos",
    energia: "leve",
    premium: true,
    tint: "rgba(79,143,201,0.55)",
    scrim:
      "linear-gradient(180deg, rgba(20,50,90,0) 30%, rgba(15,40,78,.85) 100%)",
  },
];

const GAMES: {
  id: GameId;
  label: string;
  emoji: string;
  sub: string;
  bgColor: string;
  premium?: boolean;
  isNew?: boolean;
}[] = [
  { id: "memory", label: "Memória", emoji: "🧠", sub: "Grátis para todos", bgColor: "linear-gradient(135deg, hsl(280 65% 65%), hsl(265 70% 55%))" },
  { id: "pixel-pula", label: "Kidzz Pula!", emoji: "🦎", sub: "3 partidas por dia", bgColor: "linear-gradient(135deg, hsl(140 70% 55%), hsl(155 65% 45%))", premium: true, isNew: true },
  { id: "reaction", label: "Reação", emoji: "⚡", sub: "Quão rápido você é?", bgColor: "linear-gradient(135deg, hsl(45 95% 55%), hsl(25 90% 50%))", premium: true, isNew: true },
  { id: "emotions", label: "Emoções", emoji: "💞", sub: "Mundo dos sentimentos", bgColor: "linear-gradient(135deg, hsl(320 70% 60%), hsl(280 65% 55%))", premium: true, isNew: true },
  { id: "create", label: "Eu Crio", emoji: "✨", sub: "Invente uma história", bgColor: "linear-gradient(135deg, hsl(200 75% 60%), hsl(260 70% 55%))", premium: true, isNew: true },
  { id: "word", label: "Caça Palavras", emoji: "🔍", sub: "Encontre as palavras", bgColor: "linear-gradient(135deg, hsl(200 75% 60%), hsl(210 80% 50%))", premium: true },
  { id: "hangman", label: "Forca", emoji: "✏️", sub: "Descubra a palavra", bgColor: "linear-gradient(135deg, hsl(35 90% 60%), hsl(25 90% 55%))", premium: true },
  { id: "daily", label: "Desafio", emoji: "🎯", sub: "Missão especial", bgColor: "linear-gradient(135deg, hsl(340 75% 65%), hsl(0 75% 60%))", premium: true },
];

/* ───────── Design tokens (Brincar.dc.html — light glass) ───────── */
const TINT: Record<string, [number, number, number]> = {
  laranja: [245, 150, 60],
  verde: [90, 190, 110],
  roxo: [155, 120, 240],
  azul: [95, 165, 240],
};
const GLOSSY: Record<string, [string, string, string]> = {
  laranja: ["#FFD0A0", "#F0913C", "#C05E10"],
  verde: ["#B8E8B0", "#5CB56A", "#2F7A3E"],
  roxo: ["#D8C2FF", "#9A6CF0", "#6A3EC0"],
  azul: ["#B4D8FF", "#5A9CE8", "#2D64B0"],
};

const D = {
  target:
    "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Zm0-4.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm0-3.3a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z",
  brush:
    "M14.5 4.5c1.5-1.5 3.8-1.6 5 0 1 1.4.6 3.4-.6 4.6l-7.4 7.4-4-4 7-8Zm-8.2 9.2-1.6 1.6c-1.2 1.2-1 3.3-2.2 4.7 1.9.6 4.6.4 6-1l1.8-1.8",
  gamepad:
    "M6 9h4m-2-2v4m8.5-1.5h.01M15 11h.01M17.3 6H6.7a4 4 0 0 0-4 3.7l-.5 5.6a2.6 2.6 0 0 0 4.6 1.9L8.5 15h7l1.7 2.2a2.6 2.6 0 0 0 4.6-1.9l-.5-5.6a4 4 0 0 0-4-3.7Z",
  plane:
    "M10.5 13.5 3 11l1.5-1.5 5.5.5 5-5.5c.6-.6 1.6-.6 2.2 0 .6.6.6 1.6 0 2.2l-5.5 5 .5 5.5L10.7 19l-2.5-7.5Z",
  shield: "M12 3l7 2.5V11c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V5.5Z",
  trophy:
    "M8 4h8v3a4 4 0 0 1-8 0V4Zm-4 1h4v2a4 4 0 0 1-4-2Zm16 0h-4v2a4 4 0 0 0 4-2Zm-8 6.5V17m-3.5 3h7M9.5 17h5",
  heart:
    "M12 20.3l-7.1-6.9a4.6 4.6 0 0 1 6.4-6.5l.7.7.7-.7a4.6 4.6 0 0 1 6.4 6.5Z",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  arrowBack: "M19 12H5m6-6-6 6 6 6",
  people:
    "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 .5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 19a5.5 5.5 0 0 1 11 0m1-.5a4.5 4.5 0 0 1 5 0",
  leaf: "M5 19C5 10 12 5 20 5c0 8-5 15-14 15Zm0 0c3-5 7-9 12-11",
};

/* Liquid glass premium (nível Bora) com tint colorido */
const glass = (
  r: number,
  g: number,
  b: number,
  aTop = 0.5,
  aBot = 0.16,
): CSSProperties => {
  const rgba = (a: number) => `rgba(${r},${g},${b},${a})`;
  return {
    background: `linear-gradient(165deg, rgba(255,255,255,.92) 0%, ${rgba(aTop)} 32%, ${rgba((aTop + aBot) / 2)} 62%, ${rgba(aBot)} 88%, rgba(255,255,255,.62) 100%)`,
    backdropFilter: "blur(40px) saturate(195%)",
    WebkitBackdropFilter: "blur(40px) saturate(195%)",
    border: "0.5px solid rgba(255,255,255,.98)",
    boxShadow: `0 14px 40px rgba(50,90,40,.16), 0 2px 8px rgba(50,90,40,.06), 0 0 24px ${rgba(0.2)}, inset 0 1.5px 0 rgba(255,255,255,1), inset 0 -10px 20px ${rgba(0.12)}`,
  };
};
const gloss = (
  light: string,
  mid: string,
  deep: string,
  size = 44,
  radius = 15,
): CSSProperties => ({
  flex: "none",
  width: size,
  height: size,
  borderRadius: radius,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${light} 16%, ${mid} 55%, ${deep} 100%)`,
  boxShadow:
    "0 8px 16px rgba(50,90,40,.3), inset 0 2px 3px rgba(255,255,255,.75), inset 0 -5px 10px rgba(0,0,0,.25)",
});
const glossArrow = (light: string, mid: string, deep: string): CSSProperties => ({
  alignSelf: "flex-end",
  width: 25,
  height: 25,
  borderRadius: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${light} 20%, ${mid} 60%, ${deep} 100%)`,
  boxShadow:
    "0 4px 10px rgba(50,90,40,.3), inset 0 1px 2px rgba(255,255,255,.65), inset 0 -3px 6px rgba(0,0,0,.22)",
});
const categoryCardStyle = (k: string): CSSProperties => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: 24,
  padding: "14px 13px 12px",
  textAlign: "left",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  gap: 7,
  transition: "transform .2s",
  fontFamily: "'Nunito',sans-serif",
  ...glass(...TINT[k], 0.5, 0.16),
});

/* Ambientes premium das sub-telas (mesma linguagem do hero da Home) */
const AMBIENT_CRIAR =
  "radial-gradient(58% 40% at 84% 6%,rgba(255,210,120,.16),transparent 70%),radial-gradient(52% 34% at 6% 42%,rgba(120,220,180,.14),transparent 70%),radial-gradient(50% 30% at 55% 96%,rgba(175,150,235,.08),transparent 70%),linear-gradient(180deg,#F0F8EA 0%,#E4F1DD 40%,#D8EAD1 75%,#CCE2C6 100%)";
const AMBIENT_JOGOS =
  "radial-gradient(56% 38% at 85% 6%,rgba(175,150,235,.20),transparent 70%),radial-gradient(50% 34% at 6% 40%,rgba(120,180,235,.14),transparent 70%),linear-gradient(180deg,#F3F1FB 0%,#EAE7F6 42%,#E1DDF0 78%,#D8D3EC 100%)";

/* Cabeçalho premium das sub-telas (tipografia Lora fiel à Home) */
const subEyebrow = (color: string): CSSProperties => ({
  fontFamily: "'Nunito',sans-serif",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color,
});
const subTitle: CSSProperties = {
  fontFamily: "'Lora',serif",
  fontWeight: 600,
  fontSize: 28,
  lineHeight: 1.13,
  letterSpacing: "-0.3px",
  color: "#17301F",
  marginTop: 6,
};
const subLead = (color: string): CSSProperties => ({
  fontFamily: "'Nunito',sans-serif",
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1.45,
  color,
  marginTop: 8,
  maxWidth: 300,
});

/* Icone SVG genérico */
const Icon = ({
  d,
  stroke = "#fff",
  size = 22,
  sw = 1.8,
  fill = "none",
}: {
  d: string;
  stroke?: string;
  size?: number;
  sw?: number;
  fill?: string;
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path
      d={d}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* Keyframes locais (prefixo brin- para evitar colisão com index.css) */
const BRIN_KEYFRAMES = `
@keyframes brin-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes brin-cascade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes brin-heroIn{from{opacity:0;transform:scale(1.05)}to{opacity:1;transform:scale(1)}}
@keyframes brin-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes brin-twinkle{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:.9;transform:scale(1.15)}}
@keyframes brin-raysway{0%,100%{opacity:.5;transform:translateX(0)}50%{opacity:1;transform:translateX(12px)}}
@keyframes brin-drift1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(34px,26px) scale(1.18)}}
@keyframes brin-drift2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-40px,-22px) scale(1.12)}}
@keyframes brin-sparklefloat{0%,100%{opacity:.1;transform:translateY(0) scale(.7)}50%{opacity:.95;transform:translateY(-16px) scale(1.15)}}
@keyframes brin-shine{0%{transform:translateX(-130%) skewX(-18deg)}60%,100%{transform:translateX(240%) skewX(-18deg)}}
@keyframes brin-leafdrift{0%{transform:translate(0,-30px) rotate(0deg);opacity:0}12%{opacity:.7}88%{opacity:.6}100%{transform:translate(-46px,105vh) rotate(300deg);opacity:0}}
@keyframes brin-heartbeat{0%,100%{transform:scale(1)}12%{transform:scale(1.12)}24%{transform:scale(1)}36%{transform:scale(1.08)}48%{transform:scale(1)}}
@keyframes brin-wiggle{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
`;

interface Props {
  onBack: () => void;
  onGameComplete?: () => void;
  onOpenTravel?: () => void;
  onOpenAchievements?: () => void;
  onOpenLab?: () => void;
  onOpenParental?: () => void;
}

const KidzzPlay = ({
  onBack,
  onGameComplete,
  onOpenTravel,
  onOpenAchievements,
  onOpenParental,
}: Props) => {
  const { profile, tier } = useAuth();
  const { trackEvent } = useAchievementSync();
  const isPremium = tier !== "free";
  const childName = profile?.child_name || "amigo";
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  const [sub, setSub] = useState<SubScreen>("home");
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [showPremiumCTA, setShowPremiumCTA] = useState(false);
  const [selectedExp, setSelectedExp] = useState<BrincarExperience | null>(null);
  const [selectedFeatured, setSelectedFeatured] =
    useState<FeaturedActivity | null>(null);

  const creativeExperiences = useMemo(
    () =>
      BRINCAR_EXPERIENCES.filter(
        (e) => e.tipo === "criatividade" || e.categoria === "Criatividade",
      ),
    [],
  );

  /* ── Parallax do hero (portado do design) ── */
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroWrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onHeroScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const sc = scrollRef.current;
      const hero = heroWrapRef.current;
      if (!sc || !hero) return;
      const y = sc.scrollTop;
      hero.style.transform = `translateY(${y * 0.42}px) scale(${1 + y * 0.0004})`;
      hero.style.opacity = String(Math.max(0, 1 - y / 240));
    });
  }, []);

  const handleScore = useCallback(
    (pts: number) => {
      setSessionScore((s) => s + pts);
      onGameComplete?.();
      trackEvent("game");
      if (pts >= 15) {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.65 },
          colors: ["#10B981", "#FFD700", "#fff"],
          scalar: 0.85,
        });
      }
    },
    [onGameComplete, trackEvent],
  );

  const handleGameSelect = (id: GameId) => {
    const def = GAMES.find((g) => g.id === id);
    if (!def) return;
    if (def.premium && !isPremium) {
      if (id === "pixel-pula") {
        try {
          const today = new Date().toISOString().slice(0, 10);
          const raw = localStorage.getItem("kidzz_pula_daily") || "{}";
          const obj = JSON.parse(raw);
          const used = obj.date === today ? Number(obj.count) || 0 : 0;
          if (used >= 3) {
            setShowPremiumCTA(true);
            return;
          }
          localStorage.setItem(
            "kidzz_pula_daily",
            JSON.stringify({ date: today, count: used + 1 }),
          );
        } catch {
          /* noop */
        }
        setActiveGame(id);
        return;
      }
      setShowPremiumCTA(true);
      return;
    }
    setActiveGame(id);
  };

  const openFeatured = (f: FeaturedActivity) => {
    if (f.premium && !isPremium) {
      setShowPremiumCTA(true);
      return;
    }
    setSelectedFeatured(f);
  };

  /* ───────── HEADER PADRÃO (sub-telas criar/jogos) ───────── */
  const PlayHeader = (
    <KidzzHeader
      onBack={() => {
        setSub("home");
        setActiveGame(null);
      }}
      right={
        <>
          <motion.button
            type="button"
            onClick={onOpenAchievements}
            whileTap={{ scale: 0.94 }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/75 backdrop-blur-md border border-white/70 shadow-sm min-h-[40px]"
          >
            <Trophy size={14} className="text-amber-500" strokeWidth={2.4} />
            <span className="text-[13px] font-extrabold text-[#2A2520]">
              {sessionScore}
            </span>
          </motion.button>
        </>
      }
    />
  );

  /* ── Categorias (dados reais → navegação real) ── */
  const categorias: {
    key: string;
    title: string;
    sub: string;
    d: string;
    k: string;
    cover: string;
    novo?: boolean;
    onClick: () => void;
  }[] = [
    { key: "c1", title: "Missões do dia", sub: "Desafios rápidos em família", d: D.target, k: "laranja", cover: `${BR}/cat-missoes.png`, onClick: () => setSub("missoes") },
    { key: "c2", title: "Criar & Imaginar", sub: "Atividades criativas sem limites", d: D.brush, k: "verde", cover: `${BR}/cat-criar.png`, onClick: () => setSub("criar") },
    { key: "c3", title: "Jogos & Desafios", sub: "Diversão saudável para todos", d: D.gamepad, k: "roxo", cover: `${BR}/cat-jogos.png`, onClick: () => setSub("jogos") },
    { key: "c4", title: "Modo Viagem", sub: "Atividades para qualquer lugar", d: D.plane, k: "azul", cover: `${BR}/cat-viagem.png`, novo: true, onClick: () => onOpenTravel?.() },
  ];

  const heroImg = `${BR}/hero-kids.png`;

  /* Anel de progresso do desafio (2/3 — igual ao design) */
  const RING_CIRC = 207.3;
  const ringOffset = mounted ? RING_CIRC * (1 - 2 / 3) : RING_CIRC;

  const verTodasStyle: CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Nunito',sans-serif",
    fontWeight: 900,
    fontSize: 12.5,
    color: "#2E9A63",
    padding: 0,
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
  };

  /* ───────── HOME (porte fiel de Brincar.dc.html) ───────── */
  const renderHome = () => (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex-1 relative overflow-hidden min-h-0"
      style={{
        fontFamily: FONT,
        background: "#1a2a18",
      }}
    >
      {/* Fundo floresta full-bleed (print) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <img
          src={heroImg}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 18%",
            filter: "saturate(1.12) brightness(0.92)", transform: "scale(1.06)",
          }}
        />
        <div
          style={{
            position: "absolute", inset: 0,
            background:
              "radial-gradient(55% 38% at 80% 8%, rgba(255,220,120,.5) 0%, transparent 62%)," +
              "linear-gradient(180deg, rgba(20,40,18,.22) 0%, rgba(240,248,234,.12) 26%, rgba(240,248,234,.72) 55%, #EAF4E2 72%, #E0EED8 100%)",
          }}
        />
        <div style={{ position: "absolute", top: -30, right: -10, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,230,140,.5), transparent 68%)", filter: "blur(6px)", animation: "brin-raysway 8s ease-in-out infinite" }} />
      </div>

      <div
        ref={scrollRef}
        onScroll={onHeroScroll}
        style={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)",
          scrollbarWidth: "none",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* ── HERO (texto esq + arte dir, como print) ── */}
        <div style={{ position: "relative", minHeight: 360, paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)" }}>
          <div
            ref={heroWrapRef}
            style={{
              position: "absolute", top: 40, right: -12, width: "56%", height: 300,
              pointerEvents: "none", animation: "brin-heroIn .7s cubic-bezier(.22,1,.36,1) both",
            }}
          >
            <img
              src={heroImg}
              alt="Crianças brincando na floresta"
              style={{
                width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%",
                borderRadius: "0 0 0 48%",
                maskImage: "radial-gradient(70% 70% at 58% 40%, #000 38%, transparent 78%)",
                WebkitMaskImage: "radial-gradient(70% 70% at 58% 40%, #000 38%, transparent 78%)",
                filter: "saturate(1.1)",
                animation: "brin-floaty 6.5s ease-in-out infinite",
              }}
            />
          </div>

          <div style={{ position: "relative", zIndex: 6, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `8px ${PAD}px 0` }}>
            <button
              type="button"
              onClick={onBack}
              className="active:scale-90"
              style={{ width: 44, height: 44, borderRadius: R.btn, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", ...pillGlassLight }}
              aria-label="Voltar"
            >
              <Icon d={D.arrowBack} stroke="#1E3A28" size={19} sw={2.2} />
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={onOpenParental}
                className="active:scale-95"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", minHeight: 44, borderRadius: R.btn, cursor: "pointer", fontWeight: 800, fontSize: 13, color: "#1E3A28", ...pillGlassLight }}
              >
                <Icon d={D.shield} stroke="#1E9A6E" size={15} sw={2} />
                Pais
              </button>
              <button
                type="button"
                onClick={onOpenAchievements}
                className="active:scale-95"
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 14px", minHeight: 44, borderRadius: R.btn, cursor: "pointer", fontWeight: 900, fontSize: 13, color: "#1E3A28", ...pillGlassLight }}
              >
                <Icon d={D.trophy} stroke="#E0A62B" size={14} sw={1.9} />
                {sessionScore}
              </button>
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 5, padding: "16px 20px 8px", maxWidth: "62%", animation: "brin-cascade .55s cubic-bezier(.22,1,.36,1) both" }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: "rgba(255,252,240,.95)", textShadow: "0 1px 8px rgba(0,0,0,.35)", marginBottom: 8 }}>
              {greeting}, família!{" "}
              <span style={{ display: "inline-flex", verticalAlign: "middle", animation: "brin-heartbeat 2.4s ease-in-out infinite" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#7dffb0"><path d={D.heart} /></svg>
              </span>
            </div>
            <h1 style={{ margin: "0 0 10px", fontFamily: SERIF, fontWeight: 600, fontSize: 30, lineHeight: 1.12, color: "#FFFDF6", letterSpacing: "-.4px", textShadow: "0 2px 18px rgba(0,0,0,.4)" }}>
              Brincar faz parte da <span style={{ color: "#8BE08A" }}>magia</span> de crescer.
            </h1>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.45, color: "rgba(255,248,230,.9)", textShadow: "0 1px 8px rgba(0,0,0,.3)", maxWidth: 250 }}>
              Escolha uma atividade e transforme qualquer momento em diversão, aprendizado e conexão.
            </p>
          </div>
        </div>

        {/* ── CATEGORIAS (2x2) com ícones gerados ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "8px 16px 0", position: "relative", zIndex: 5, animation: "brin-rise .6s .1s both" }}>
          {categorias.map((c) => (
            <button key={c.key} type="button" onClick={c.onClick} className="active:scale-[0.96]" style={{ ...categoryCardStyle(c.k), borderRadius: 26, minHeight: 148, padding: "14px 13px 12px" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "55%", height: "100%", pointerEvents: "none", background: "linear-gradient(105deg,transparent 0%,rgba(255,255,255,.35) 50%,transparent 100%)", animation: "brin-shine 5.5s ease-in-out infinite" }} />
              {c.novo && (
                <div style={{ position: "absolute", top: 10, right: 10, zIndex: 2, padding: "3px 9px", borderRadius: 999, background: "radial-gradient(130% 130% at 30% 22%,#FFF3C4 0%,#F2C55C 45%,#C98F1E 100%)", color: "#4A3300", fontSize: 9, fontWeight: 900, letterSpacing: ".4px", boxShadow: "0 3px 8px rgba(150,95,10,.4),inset 0 1px 0 rgba(255,255,255,.7)" }}>NOVO</div>
              )}
              <img
                src={c.cover}
                alt=""
                style={{
                  width: 56, height: 56, borderRadius: 18, objectFit: "cover", marginBottom: 4,
                  boxShadow: "0 8px 18px rgba(50,90,40,.22), 0 1px 0 rgba(255,255,255,.5) inset",
                  border: "0.5px solid rgba(255,255,255,.8)",
                }}
              />
              <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15.5, color: "#17301F", lineHeight: 1.15 }}>{c.title}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#557A5E", lineHeight: 1.35 }}>{c.sub}</div>
              <div style={glossArrow(...GLOSSY[c.k])}>
                <Icon d={D.arrow} size={13} sw={2.4} />
              </div>
            </button>
          ))}
        </div>

        {/* ── PARA BRINCAR AGORA ── */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "20px 20px 10px" }}>
            <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: 20, color: "#17301F" }}>Para brincar agora ✨</h2>
            <button type="button" onClick={() => setSub("missoes")} style={verTodasStyle}>Ver todas →</button>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 16px 12px", scrollbarWidth: "none" }}>
            {FEATURED.map((f) => {
              const locked = !!f.premium && !isPremium;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => openFeatured(f)}
                  className="active:scale-[.97]"
                  style={{ flex: "none", width: 172, height: 228, borderRadius: 24, position: "relative", overflow: "hidden", cursor: "pointer", padding: 0, textAlign: "left", boxShadow: "0 16px 36px rgba(50,90,40,.26), 0 1px 0 rgba(255,255,255,.55) inset", border: "0.5px solid rgba(255,255,255,.75)", animation: "brin-rise .45s both", transition: "transform .2s" }}
                >
                  <img src={f.img} alt={f.titulo} loading="lazy" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: f.scrim }} />
                  <div style={{ position: "absolute", top: 9, left: 9, padding: "4px 11px", borderRadius: 999, background: "rgba(255,253,246,.9)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.9)", boxShadow: "0 3px 8px rgba(0,0,0,.2)", color: "#33421F", fontSize: 10.5, fontWeight: 900 }}>{f.tempo}</div>
                  {locked && (
                    <div style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 999, background: "rgba(255,255,255,.28)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Lock size={13} className="text-white" />
                    </div>
                  )}
                  <div style={{ position: "absolute", left: 12, right: 12, bottom: 10, display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 15, color: "#FFFDF4", lineHeight: 1.2, textShadow: "0 1px 6px rgba(0,0,0,.35)" }}>{f.titulo}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,253,244,.85)", lineHeight: 1.35, textShadow: "0 1px 5px rgba(0,0,0,.3)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.desc}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,253,244,.8)" }}>{f.idade}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 900, color: "rgba(255,253,244,.85)" }}>
                        <Icon d={D.heart} stroke="rgba(255,253,244,.85)" size={11} sw={1.9} />
                        {f.energia}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── DESAFIOS EM FAMÍLIA ── */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "14px 20px 10px" }}>
            <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: 20, color: "#17301F" }}>Desafios em família ✨</h2>
            <button type="button" onClick={() => setSub("missoes")} style={verTodasStyle}>Ver todos →</button>
          </div>
          <div style={{ padding: "0 16px" }}>
            <div style={{ position: "relative", overflow: "hidden", borderRadius: 28, padding: "16px 16px 14px", background: "linear-gradient(155deg,rgba(255,255,255,.38) 0%,rgba(139,105,240,.8) 24%,rgba(120,88,220,.7) 60%,rgba(98,70,190,.78) 100%)", backdropFilter: "blur(36px) saturate(190%)", WebkitBackdropFilter: "blur(36px) saturate(190%)", border: "0.5px solid rgba(255,255,255,.7)", boxShadow: "0 18px 40px rgba(90,60,180,.38),0 0 28px rgba(139,105,240,.28),inset 0 1.5px 0 rgba(255,255,255,.75),inset 0 -10px 22px rgba(40,20,100,.25)", animation: "brin-rise .5s .15s both" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "55%", height: "100%", pointerEvents: "none", background: "linear-gradient(105deg,transparent 0%,rgba(255,255,255,.22) 50%,transparent 100%)", animation: "brin-shine 6s ease-in-out infinite" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: 9, background: "rgba(255,255,255,.24)", border: "1px solid rgba(255,255,255,.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon d={D.people} size={14} sw={1.8} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".5px", color: "rgba(255,255,255,.9)" }}>DESAFIO DA SEMANA</div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 20, color: "#fff", lineHeight: 1.15, marginBottom: 5 }}>Diversão em Equipe</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(255,255,255,.85)", lineHeight: 1.45, marginBottom: 11 }}>Escolham 3 atividades, completem juntos e ganhem uma conquista especial!</div>
                  <button type="button" onClick={() => setSub("missoes")} className="active:scale-95" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 999, cursor: "pointer", background: "rgba(255,255,255,.2)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.55)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.5),0 4px 12px rgba(40,20,100,.3)", color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: 12.5, fontWeight: 900, transition: "transform .2s" }}>
                    Ver detalhes
                    <Icon d={D.arrow} size={13} sw={2.4} />
                  </button>
                </div>
                <div style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ position: "relative", width: 78, height: 78 }}>
                    <svg width="78" height="78" viewBox="0 0 78 78">
                      <circle cx="39" cy="39" r="33" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="7" />
                      <circle cx="39" cy="39" r="33" fill="none" stroke="#FFD34D" strokeWidth="7" strokeLinecap="round" strokeDasharray={RING_CIRC} strokeDashoffset={ringOffset} transform="rotate(-90 39 39)" style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(.22,1,.36,1) .4s", filter: "drop-shadow(0 0 6px rgba(255,211,77,.7))" }} />
                    </svg>
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 17, color: "#fff" }}>
                      2<span style={{ opacity: 0.6, fontSize: 13 }}>/3</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 900, color: "#FFD34D" }}>
                    <span style={{ animation: "brin-heartbeat 2.4s ease-in-out infinite", display: "inline-flex" }}>
                      <Icon d={D.trophy} stroke="#FFD34D" size={13} sw={2} />
                    </span>
                    +50 pts
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── IDEIAS RÁPIDAS + Modo Viagem ── */}
        <div style={{ display: "flex", gap: 10, padding: "16px 16px 8px", alignItems: "stretch" }}>
          <button type="button" onClick={() => setSub("criar")} className="active:scale-[.97]" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "13px 16px", borderRadius: 999, cursor: "pointer", background: "linear-gradient(155deg,rgba(255,255,255,.9),rgba(255,255,255,.55))", backdropFilter: "blur(18px) saturate(150%)", WebkitBackdropFilter: "blur(18px) saturate(150%)", border: "1px solid rgba(255,255,255,1)", boxShadow: "0 10px 24px rgba(60,100,50,.16),inset 0 1.5px 0 rgba(255,255,255,1)", fontFamily: "'Nunito',sans-serif", transition: "transform .2s", textAlign: "left" }}>
            <span style={{ fontSize: 12.5, fontWeight: 900, color: "#17301F" }}>Ideias rápidas <span style={{ fontWeight: 700, color: "#557A5E" }}>para qualquer lugar</span></span>
            <Icon d={D.arrow} stroke="#2E9A63" size={15} sw={2.4} />
          </button>
          <button type="button" onClick={() => onOpenTravel?.()} className="active:scale-[.97]" style={{ flex: "none", display: "flex", alignItems: "center", gap: 7, padding: "13px 17px", borderRadius: 999, cursor: "pointer", background: "radial-gradient(130% 130% at 30% 22%,#FFE9A8 0%,#F2A62B 55%,#C77E12 100%)", border: "1px solid rgba(255,255,255,.8)", boxShadow: "0 10px 24px rgba(180,110,10,.35),inset 0 1.5px 1px rgba(255,255,255,.75),inset 0 -5px 10px rgba(140,80,0,.35)", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 900, color: "#4A3300", transition: "transform .2s" }}>
            <Icon d={D.plane} stroke="#4A3300" size={15} sw={1.8} />
            Modo Viagem
          </button>
        </div>
      </div>
    </motion.div>
  );

  /* ───────── SUB: Criar & Imaginar ───────── */
  const renderCriar = () => (
    <motion.div
      key="criar"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
      style={{
        WebkitOverflowScrolling: "touch",
        paddingTop: 12,
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)",
        background: AMBIENT_CRIAR,
        backgroundAttachment: "local",
      }}
    >
      <div className="px-5" style={{ animation: "brin-cascade .5s cubic-bezier(.22,1,.36,1) both" }}>
        <p style={subEyebrow("#2E9A63")}>Brincar · Criar e Imaginar</p>
        <h1 style={subTitle}>
          Atividades criativas
          <br />
          <span style={{ color: "#2E9A63" }}>sem limites</span>
        </h1>
        <p style={subLead("#557A5E")}>
          Inventem juntos, façam arte, transformem objetos comuns em magia.
        </p>
      </div>
      <div className="px-4 mt-5 grid grid-cols-2 gap-3">
        {creativeExperiences.map((e) => {
          const locked = e.premium && !isPremium;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => {
                if (locked) {
                  setShowPremiumCTA(true);
                  return;
                }
                setSelectedExp(e);
              }}
              className="relative rounded-3xl overflow-hidden text-left min-h-[170px] active:scale-[.97]"
              style={{
                background: e.gradient,
                border: "1px solid rgba(255,255,255,.55)",
                boxShadow:
                  "0 14px 30px rgba(50,90,40,.24), 0 2px 6px rgba(0,0,0,.12), inset 0 1.5px 0 rgba(255,255,255,.6), inset 0 -12px 22px rgba(0,0,0,.18)",
                transition: "transform .2s",
                animation: "brin-rise .45s both",
              }}
            >
              {/* specular highlight (topo glossy) */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg,rgba(255,255,255,.30) 0%,rgba(255,255,255,0) 42%)",
                }}
              />
              {/* brilho de varredura */}
              <div
                className="absolute top-0 left-0 h-full pointer-events-none"
                style={{
                  width: "55%",
                  background:
                    "linear-gradient(105deg,transparent 0%,rgba(255,255,255,.30) 50%,transparent 100%)",
                  animation: "brin-shine 6.5s ease-in-out infinite",
                }}
              />
              <div
                className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-60 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(255,255,255,0.55), transparent 70%)",
                }}
              />
              <div className="relative z-10 p-3 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/90 bg-white/20 rounded-full px-2 py-0.5 border border-white/25">
                    {e.categoria}
                  </span>
                  {locked && (
                    <span className="bg-white/30 backdrop-blur rounded-full p-1">
                      <Lock size={11} className="text-white" />
                    </span>
                  )}
                </div>
                <div
                  className="text-4xl mt-3"
                  style={{
                    filter: locked
                      ? "blur(2px)"
                      : "drop-shadow(0 3px 5px rgba(0,0,0,.22))",
                  }}
                >
                  {e.emoji}
                </div>
                <h4 className="mt-2 text-[14px] font-black text-white leading-tight drop-shadow-sm">
                  {e.titulo}
                </h4>
                <p className="text-[11px] text-white/90 font-semibold leading-snug mt-0.5 line-clamp-2">
                  {e.descricao}
                </p>
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-white/95">
                    ⏱ {e.tempo}
                  </span>
                  <span className="text-[10px] font-extrabold text-white/95">
                    {e.energia === "baixa"
                      ? "💛 leve"
                      : e.energia === "media"
                      ? "💚 média"
                      : "🧡 ativa"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  /* ───────── SUB: Jogos ───────── */
  const renderJogos = () => (
    <motion.div
      key="jogos"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
      style={{
        WebkitOverflowScrolling: "touch",
        paddingTop: 12,
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)",
        background: activeGame ? undefined : AMBIENT_JOGOS,
        backgroundAttachment: "local",
      }}
    >
      <AnimatePresence mode="wait">
        {!activeGame ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="px-5" style={{ animation: "brin-cascade .5s cubic-bezier(.22,1,.36,1) both" }}>
              <p style={subEyebrow("#6A3EC0")}>Brincar · Jogos e Desafios</p>
              <h1 style={subTitle}>
                Diversão saudável
                <br />
                <span style={{ color: "#6A3EC0" }}>para todos</span>
              </h1>
              <p style={subLead("#5E5680")}>
                Memória, palavras, desafios — escolha o jogo do dia.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 px-4 mt-5">
              {GAMES.map((game) => {
                const locked = game.premium && !isPremium;
                return (
                  <motion.button
                    key={game.id}
                    onClick={() => handleGameSelect(game.id)}
                    className="relative rounded-3xl p-4 flex flex-col items-center gap-1.5 min-h-[130px]"
                    style={{
                      background: locked
                        ? "linear-gradient(155deg,rgba(255,255,255,.85) 0%,rgba(255,255,255,.5) 100%)"
                        : game.bgColor,
                      border: "1px solid rgba(255,255,255,.6)",
                      boxShadow: locked
                        ? "0 8px 18px rgba(60,70,120,.12), inset 0 1.5px 0 rgba(255,255,255,.9)"
                        : "0 12px 26px rgba(40,40,90,.24), 0 2px 6px rgba(0,0,0,.14), inset 0 1.5px 0 rgba(255,255,255,.6), inset 0 -12px 22px rgba(0,0,0,.20)",
                      transition: "transform .2s",
                    }}
                    whileTap={locked ? undefined : { scale: 0.96 }}
                  >
                    {/* camada de brilho recortada (não corta o selo NOVO) */}
                    <span
                      aria-hidden
                      className="absolute inset-0 pointer-events-none overflow-hidden"
                      style={{ borderRadius: 24 }}
                    >
                      <span
                        className="absolute inset-0"
                        style={{
                          background: locked
                            ? "none"
                            : "linear-gradient(180deg,rgba(255,255,255,.34) 0%,rgba(255,255,255,0) 42%)",
                        }}
                      />
                      {!locked && (
                        <span
                          className="absolute top-0 h-full"
                          style={{
                            left: "-20%",
                            width: "60%",
                            background:
                              "linear-gradient(105deg,transparent 0%,rgba(255,255,255,.28) 50%,transparent 100%)",
                            animation: "brin-shine 6.5s ease-in-out infinite",
                          }}
                        />
                      )}
                    </span>
                    <span
                      className="text-4xl relative"
                      style={{
                        filter: locked
                          ? "blur(2px)"
                          : "drop-shadow(0 3px 5px rgba(0,0,0,.22))",
                      }}
                    >
                      {game.emoji}
                    </span>
                    <span
                      className={`relative text-[13px] font-extrabold ${
                        locked ? "text-gray-500" : "text-white"
                      }`}
                      style={
                        locked
                          ? undefined
                          : { textShadow: "0 1px 4px rgba(0,0,0,.22)" }
                      }
                    >
                      {game.label}
                    </span>
                    <span
                      className={`relative text-[10px] font-semibold leading-tight text-center ${
                        locked ? "text-gray-400" : "text-white/90"
                      }`}
                      style={
                        locked
                          ? undefined
                          : { textShadow: "0 1px 3px rgba(0,0,0,.20)" }
                      }
                    >
                      {game.sub}
                    </span>
                    {locked && (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl"
                        style={{
                          background:
                            "linear-gradient(160deg,rgba(255,255,255,.34),rgba(255,255,255,.18))",
                          backdropFilter: "blur(3px)",
                          WebkitBackdropFilter: "blur(3px)",
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                              "radial-gradient(130% 130% at 30% 22%,#FFFFFF 0%,#EDE6FF 30%,#B9A6F0 100%)",
                            boxShadow:
                              "0 6px 14px rgba(90,70,160,.35), inset 0 1.5px 2px rgba(255,255,255,.8), inset 0 -4px 8px rgba(60,40,120,.25)",
                          }}
                        >
                          <Lock size={15} className="text-[#5B3EA6]" strokeWidth={2.4} />
                        </div>
                        <span className="text-[8px] text-[#4A3A78] font-black tracking-wide mt-1.5">
                          KIDZZ
                        </span>
                      </div>
                    )}
                    {game.isNew && !locked && (
                      <div
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          padding: "3px 9px",
                          borderRadius: 999,
                          background:
                            "radial-gradient(130% 130% at 30% 22%,#FFF3C4 0%,#F2C55C 45%,#C98F1E 100%)",
                          color: "#4A3300",
                          fontSize: 9,
                          fontWeight: 900,
                          letterSpacing: ".4px",
                          boxShadow:
                            "0 3px 8px rgba(150,95,10,.4),inset 0 1px 0 rgba(255,255,255,.7)",
                          animation: "brin-wiggle 2.6s ease-in-out infinite",
                        }}
                      >
                        NOVO
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex-1"
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-16 text-sm font-bold text-gray-600">
                  Carregando jogo… ✨
                </div>
              }
            >
              {activeGame === "pixel-pula" && (
                <PixelPulaGame
                  onScore={handleScore}
                  onReaction={() => {}}
                  onOpenAchievements={() => {
                    setActiveGame(null);
                    onOpenAchievements?.();
                  }}
                  onHome={() => setActiveGame(null)}
                />
              )}
              {activeGame === "word" && (
                <WordSearchGame
                  onScore={handleScore}
                  onReaction={() => {}}
                  onOpenAchievements={() => {
                    setActiveGame(null);
                    onOpenAchievements?.();
                  }}
                  onHome={() => setActiveGame(null)}
                />
              )}
              {activeGame === "memory" && (
                <MemoryGame
                  onScore={handleScore}
                  onReaction={() => {}}
                  onOpenAchievements={() => {
                    setActiveGame(null);
                    onOpenAchievements?.();
                  }}
                  onHome={() => setActiveGame(null)}
                />
              )}
              {activeGame === "hangman" && (
                <HangmanGame
                  onScore={handleScore}
                  onReaction={() => {}}
                  onOpenAchievements={() => {
                    setActiveGame(null);
                    onOpenAchievements?.();
                  }}
                  onHome={() => setActiveGame(null)}
                />
              )}
              {activeGame === "reaction" && (
                <ReactionGame
                  onScore={handleScore}
                  onReaction={() => {}}
                  onOpenAchievements={() => {
                    setActiveGame(null);
                    onOpenAchievements?.();
                  }}
                  onHome={() => setActiveGame(null)}
                />
              )}
              {activeGame === "emotions" && (
                <EmotionsGame
                  onScore={handleScore}
                  onReaction={() => {}}
                  onOpenAchievements={() => {
                    setActiveGame(null);
                    onOpenAchievements?.();
                  }}
                  onHome={() => setActiveGame(null)}
                />
              )}
              {activeGame === "create" && (
                <CreateGame
                  onScore={handleScore}
                  onReaction={() => {}}
                  onOpenAchievements={() => {
                    setActiveGame(null);
                    onOpenAchievements?.();
                  }}
                  onHome={() => setActiveGame(null)}
                />
              )}
              {activeGame === "daily" && (
                <DailyChallengeGame
                  onScore={handleScore}
                  onReaction={() => {}}
                  isPremium={isPremium}
                  onOpenAchievements={() => {
                    setActiveGame(null);
                    onOpenAchievements?.();
                  }}
                  onHome={() => setActiveGame(null)}
                />
              )}
            </Suspense>
            <motion.button
              onClick={() => setActiveGame(null)}
              className="absolute z-30 px-4 py-3 rounded-2xl font-extrabold text-white text-sm border border-white/40 bg-emerald-700/90 backdrop-blur-md shadow-xl flex items-center gap-2 min-h-[44px]"
              style={{ bottom: 90, left: 20 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={16} /> Sair do jogo
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <motion.div
      className="flex-1 flex flex-col overflow-hidden relative min-h-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <style>{BRIN_KEYFRAMES}</style>
      {sub !== "missoes" && sub !== "home" && PlayHeader}

      <div className="relative flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {sub === "home" && renderHome()}
          {sub === "missoes" && (
            <motion.div
              key="missoes"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <MyActivities onBack={() => setSub("home")} />
            </motion.div>
          )}
          {sub === "criar" && renderCriar()}
          {sub === "jogos" && renderJogos()}
        </AnimatePresence>
      </div>

      {/* Premium CTA */}
      <AnimatePresence>
        {showPremiumCTA && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPremiumCTA(false)}
          >
            <motion.div
              className="w-full max-w-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <LockedFeature
                type="games"
                requiredTier="kidzz"
                onUpgrade={() => {
                  setShowPremiumCTA(false);
                  window.dispatchEvent(
                    new CustomEvent("kidzz:open-paywall", {
                      detail: { context: "games_locked" },
                    }),
                  );
                }}
              />
              <button
                className="block mx-auto mt-3 text-xs text-white/80 font-bold underline"
                onClick={() => setShowPremiumCTA(false)}
              >
                Agora não
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured activity detail */}
      <AnimatePresence>
        {selectedFeatured && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFeatured(null)}
          >
            <motion.div
              className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden bg-white shadow-2xl"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-48">
                <img
                  src={selectedFeatured.img}
                  alt={selectedFeatured.titulo}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(180deg, ${selectedFeatured.tint} 0%, rgba(0,0,0,0.5) 100%)`,
                  }}
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur text-[11px] font-extrabold text-[#2A2520]">
                  ⏱ {selectedFeatured.tempo}
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-display text-[22px] font-extrabold text-white drop-shadow-lg">
                    {selectedFeatured.titulo}
                  </h3>
                  <p className="text-[12px] font-medium text-white/95 leading-snug mt-1">
                    {selectedFeatured.desc}
                  </p>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[11px] font-bold text-[#2A2520]/70">
                  <span className="px-2.5 py-1 rounded-full bg-[#F5EFE3] border border-[#E5D9C0]">
                    🎯 {selectedFeatured.idade}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#F5EFE3] border border-[#E5D9C0] flex items-center gap-1">
                    <Heart size={11} className="text-rose-400" />
                    {selectedFeatured.energia}
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-2xl font-black text-sm"
                  style={{
                    color: "#4A3300",
                    background:
                      "radial-gradient(130% 160% at 30% 18%,#FFE9A8 0%,#F2A62B 55%,#C77E12 100%)",
                    border: "1px solid rgba(255,255,255,.8)",
                    boxShadow:
                      "0 10px 24px rgba(180,110,10,.35), inset 0 1.5px 1px rgba(255,255,255,.75), inset 0 -5px 10px rgba(140,80,0,.35)",
                  }}
                  onClick={() => {
                    handleScore(5);
                    setSelectedFeatured(null);
                  }}
                >
                  ✨ Vamos brincar agora
                </motion.button>
                <button
                  className="text-xs font-bold text-gray-500 mx-auto"
                  onClick={() => setSelectedFeatured(null)}
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generic experience detail (sub-screen Criar) */}
      <AnimatePresence>
        {selectedExp && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedExp(null)}
          >
            <motion.div
              className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden border border-white/30 shadow-2xl"
              style={{ background: selectedExp.gradient }}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center text-4xl border border-white/30">
                    {selectedExp.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/90">
                      {selectedExp.categoria}
                    </p>
                    <h3 className="text-xl font-black text-white leading-tight drop-shadow-sm">
                      {selectedExp.titulo}
                    </h3>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white/95 leading-snug mt-3">
                  {selectedExp.descricao}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-[11px] font-extrabold text-white bg-white/20 border border-white/30 rounded-full px-2.5 py-1">
                    ⏱ {selectedExp.tempo}
                  </span>
                  <span className="text-[11px] font-extrabold text-white bg-white/20 border border-white/30 rounded-full px-2.5 py-1">
                    🎯 {selectedExp.idadeMin}–{selectedExp.idadeMax} anos
                  </span>
                </div>
              </div>
              <div className="bg-white/95 backdrop-blur p-4 flex flex-col gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-2xl font-black text-white text-sm shadow-md min-h-[48px]"
                  style={{ background: selectedExp.gradient }}
                  onClick={() => {
                    handleScore(5);
                    setSelectedExp(null);
                  }}
                >
                  ✨ Vamos viver agora
                </motion.button>
                <button
                  className="text-xs font-bold text-gray-500 mx-auto"
                  onClick={() => setSelectedExp(null)}
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default KidzzPlay;

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useAuth } from "@/contexts/AuthContext";
import MorningKaraoke from "./MorningKaraoke";
import DanceWithAne from "./DanceWithAne";
import SungStories from "./SungStories";
import CreateMusic from "./CreateMusic";
import { getMusicXp, type MusicAchievement } from "@/lib/musicXp";
import { completeMissionStep, addXp, bumpSessionActions } from "@/lib/dailyMission";
import { showXpGained } from "@/components/flow/XpToast";
import GuidedActivityPlayer, { type GuidedActivity } from "./GuidedActivityPlayer";
import { FONT, SERIF, R, PAD, glassLightSoft, pillGlassLight } from "@/lib/premiumUi";

/**
 * MusicForest — Tela "Música" (premium v2 — nível Bora).
 * Ref: public/telas/MUSICA/* · Assets: musica-v2 (Hermes/Codex)
 * Floresta + liquid glass + família (sem lagarto).
 */

interface Props {
  onBack: () => void;
  onNavigateToDreams: () => void;
  onXpEarned?: () => void;
  onOpenParental?: () => void;
  onOpenTravel?: () => void;
}

type Pillar = "morning" | "dance" | "stories" | "create";
type CategoryId = "featured" | "emotion" | "adventure" | "calm" | "travel";

interface Category {
  id: CategoryId;
  label: string;
  subtitle: string;
  gradient: string; // usado no hero da sub-tela
  dk: keyof typeof TINT; // chave de cor do design
  /** Capa 3D gerada (Hermes/Codex) */
  cover: string;
  novo?: boolean;
  tags: string[];
}

const MU = "/exemplos/assets/musica-v2";

/* ── Paletas do design (renderVals) ── */
const TINT: Record<string, [number, number, number]> = {
  ouro: [240, 180, 70], verde: [140, 200, 110], lavanda: [180, 160, 235],
  indigo: [140, 150, 230], teal: [95, 195, 195],
};
const ARROWS: Record<string, [string, string, string]> = {
  ouro: ["#FFE49A", "#F2B23B", "#C77E12"], verde: ["#C0EDA0", "#6FBE4F", "#3F8A32"],
  lavanda: ["#D8C2FF", "#9A6CF0", "#6A3EC0"], indigo: ["#C2CBFF", "#6E7FE8", "#4152B8"],
  teal: ["#B2F0E0", "#3FBFA5", "#1E8A74"],
};
const MODOS_G: Record<string, [string, string, string]> = {
  ouro: ["#FFE49A", "#F2B23B", "#C77E12"], rosa: ["#FFB9D2", "#F0679B", "#C93A72"],
  azul: ["#B4D8FF", "#5A9CE8", "#2D64B0"], verde: ["#C0EDA0", "#6FBE4F", "#3F8A32"],
};
// Cores do rodapé dos cards de atividade (design FOOT), cicladas por índice.
const FOOT: [string, string][] = [
  ["#7E5AA8", "#553A78"], ["#4E8A3E", "#33602A"],
  ["#C05A50", "#8A3830"], ["#3A5088", "#243460"],
];

/* ── SVG paths do design ── */
const D = {
  mic: "M12 15a3.5 3.5 0 0 0 3.5-3.5v-5a3.5 3.5 0 1 0-7 0v5A3.5 3.5 0 0 0 12 15Zm6-4a6 6 0 0 1-12 0m6 6v3.5m-3 0h6",
  dance: "M12 5.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM9 9l3-1.5L15.5 9l2 3.5M9 9 6.5 12M9 9l1 4.5L8 20m6.5-6.5L16 20m-5.5-6.5h4",
  book: "M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5v-12ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 0 1.5-1.5v-12ZM11 4v15m2-15v15",
  lab: "M9 3h6m-5 0v5.5L5.5 17a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 8.5V3m-6.5 11h9",
  moon: "M20 13.5A8 8 0 0 1 10.5 4 8 8 0 1 0 20 13.5Z",
  note: "M9 17.5V6.8a1 1 0 0 1 .8-1l7.4-1.4a1 1 0 0 1 1.2 1v10.1M9 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm9.4-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  back: "M19 12H5m6-6-6 6 6 6",
  lock: "M7 10V8a5 5 0 0 1 10 0v2m-11 0h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z",
  play: "M7 4.8v14.4c0 .8.9 1.3 1.6.9l11-7.2c.6-.4.6-1.4 0-1.8l-11-7.2c-.7-.4-1.6.1-1.6.9Z",
  heart: "M12 20.3l-7.1-6.9a4.6 4.6 0 0 1 6.4-6.5l.7.7.7-.7a4.6 4.6 0 0 1 6.4 6.5Z",
  shield: "M12 3l7 2.5V11c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V5.5Z",
  cap: "M8 4h8v3a4 4 0 0 1-8 0V4Zm-4 1h4v2a4 4 0 0 1-4-2Zm16 0h-4v2a4 4 0 0 0 4-2Zm-8 6.5V17m-3.5 3h7M9.5 17h5",
};

/* ── Helpers de estilo (liquid glass premium, creme) ── */
const glass = (r: number, g: number, b: number, aTop = 0.5, aBot = 0.16): CSSProperties => {
  const rgba = (a: number) => `rgba(${r},${g},${b},${a})`;
  return {
    background: `linear-gradient(165deg, rgba(255,255,255,.92) 0%, ${rgba(aTop)} 32%, ${rgba((aTop + aBot) / 2)} 62%, ${rgba(aBot)} 88%, rgba(255,255,255,.62) 100%)`,
    backdropFilter: "blur(36px) saturate(190%)",
    WebkitBackdropFilter: "blur(36px) saturate(190%)",
    border: "0.5px solid rgba(255,255,255,.98)",
    boxShadow: `0 12px 36px rgba(110,85,30,.14), 0 2px 8px rgba(110,85,30,.06), 0 0 22px ${rgba(0.16)}, inset 0 1.5px 0 rgba(255,255,255,1), inset 0 -8px 18px ${rgba(0.1)}`,
  };
};
const gloss = (light: string, mid: string, deep: string, size = 40, radius = 14): CSSProperties => ({
  flex: "none", width: size, height: size, borderRadius: radius,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${light} 16%, ${mid} 55%, ${deep} 100%)`,
  boxShadow: "0 8px 16px rgba(110,85,30,.28), inset 0 2px 3px rgba(255,255,255,.75), inset 0 -5px 10px rgba(0,0,0,.22)",
});
const glossArrow = (light: string, mid: string, deep: string): CSSProperties => ({
  alignSelf: "flex-end", width: 24, height: 24, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
  background: `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${light} 20%, ${mid} 60%, ${deep} 100%)`,
  boxShadow: "0 4px 10px rgba(110,85,30,.28), inset 0 1px 2px rgba(255,255,255,.65), inset 0 -3px 6px rgba(0,0,0,.2)",
});

const goldBadge: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999,
  background: "radial-gradient(130% 130% at 30% 22%,#FFF3C4 0%,#F2C55C 45%,#C98F1E 100%)",
  color: "#4A3300", fontSize: 9, fontWeight: 900, letterSpacing: ".4px",
  boxShadow: "0 3px 8px rgba(150,95,10,.4), inset 0 1px 0 rgba(255,255,255,.7)",
};
const greenBadge: CSSProperties = {
  ...goldBadge,
  background: "radial-gradient(130% 130% at 30% 22%,#D8FFE9 0%,#4FD9A4 50%,#1E9A6E 100%)",
  color: "#0E3A28", boxShadow: "0 3px 8px rgba(20,110,70,.35), inset 0 1px 0 rgba(255,255,255,.7)",
};

/* ── Dados: categorias (5) ── */
const CATEGORIES: Category[] = [
  { id: "featured", label: "Em destaque", subtitle: "As preferidas da família", gradient: "linear-gradient(135deg, hsl(38 95% 62%) 0%, hsl(28 92% 55%) 100%)", dk: "ouro", cover: `${MU}/cat-sun.png`, tags: ["featured"] },
  { id: "emotion", label: "Para emocionar", subtitle: "Músicas que tocam o coração", gradient: "linear-gradient(135deg, hsl(150 55% 55%) 0%, hsl(160 50% 40%) 100%)", dk: "verde", cover: `${MU}/cat-heart.png`, tags: ["emotion", "bond"] },
  { id: "adventure", label: "Aventura & Imaginação", subtitle: "Para sonhar e explorar", gradient: "linear-gradient(135deg, hsl(275 65% 62%) 0%, hsl(290 55% 48%) 100%)", dk: "lavanda", cover: `${MU}/cat-rocket.png`, tags: ["adventure", "movement"] },
  { id: "calm", label: "Para acalmar", subtitle: "Músicas para relaxar juntos", gradient: "linear-gradient(135deg, hsl(220 60% 62%) 0%, hsl(255 55% 55%) 100%)", dk: "indigo", cover: `${MU}/cat-moon.png`, tags: ["calm", "sleep"] },
  { id: "travel", label: "Modo Viagem", subtitle: "Trilhas sonoras para qualquer lugar", gradient: "linear-gradient(135deg, hsl(190 65% 55%) 0%, hsl(200 60% 42%) 100%)", dk: "teal", cover: `${MU}/cat-travel.png`, novo: true, tags: ["travel"] },
];

/* Sons ambiente — descrição humana (nunca expor id interno de slot) */
const AMBIENT_SOUNDS: { id: string; label: string; desc: string; url?: string; free: boolean }[] = [
  { id: "forest", label: "Floresta calma", desc: "Sons da natureza", url: "/audio/forest-calm.mp3", free: true },
  { id: "rain", label: "Chuva no telhado", desc: "Para relaxar juntos", url: "/audio/rain-soft.mp3", free: true },
  { id: "ocean", label: "Ondas do mar", desc: "Para acalmar", url: "/audio/ocean-waves.mp3", free: false },
  { id: "piano", label: "Piano do soninho", desc: "Para dormir", free: false },
];

/** Selo PREMIUM padrão (dourado + cadeado) — referência do relatório de design */
const premiumSeal: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "4px 10px",
  borderRadius: 999,
  background: "radial-gradient(130% 130% at 30% 22%, #FFF3C4 0%, #F2C55C 45%, #C98F1E 100%)",
  color: "#4A3300",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".5px",
  boxShadow: "0 3px 8px rgba(150,95,10,.4), inset 0 1px 0 rgba(255,255,255,.7)",
};

/* ── Dados: atividades guiadas reais ── */
const ACTIVITIES: GuidedActivity[] = [
  { id: "cancoes-animais", title: "Canções dos Animais", subtitle: "Aprenda e cante com os bichinhos!", minutes: 8, ageRange: "2–6 anos", tags: ["featured", "adventure"], kind: "sing", instruction: "Imita a voz de cada bichinho quando ele aparecer!", slotImg: "imgAtiv_cancoes_animais", slotAudio: "exec_cancoes_animais", accent: "38 95% 62%" },
  { id: "palmas-ritmos", title: "Palmas e Ritmos", subtitle: "Siga o ritmo e divirta-se batendo palmas!", minutes: 6, ageRange: "3–6 anos", tags: ["featured", "movement"], kind: "clap", instruction: "Bata palma junto no tempo da música. Prontos?", slotImg: "imgAtiv_palmas", slotAudio: "exec_palmas", accent: "275 65% 62%" },
  { id: "instrumentos-mundo", title: "Instrumentos do Mundo", subtitle: "Descubra sons incríveis de vários lugares!", minutes: 10, ageRange: "4–8 anos", tags: ["adventure"], kind: "listen", instruction: "Feche os olhos e adivinha que instrumento é este!", slotImg: "imgAtiv_instrumentos", slotAudio: "exec_instrumentos", accent: "190 65% 55%" },
  { id: "cancoes-ninar", title: "Canções de Ninar", subtitle: "Melodias para acalmar e embalar o sono.", minutes: 12, ageRange: "0–4 anos", tags: ["calm", "sleep"], kind: "listen", instruction: "Diminua as luzes, respire fundo, e deixe a música embalar.", slotImg: "imgAtiv_ninar", slotAudio: "exec_ninar", accent: "220 60% 62%", parentMark: true },
  { id: "danca-congela", title: "Dança Congela", subtitle: "Dance e pare quando a música congelar!", minutes: 5, ageRange: "3–8 anos", tags: ["featured", "movement", "adventure"], kind: "dance", instruction: "Dance! Quando a música PARAR — congela como estátua!", slotImg: "imgAtiv_congela", slotAudio: "exec_congela", accent: "38 95% 62%" },
  { id: "orquestra-cozinha", title: "Orquestra da Cozinha", subtitle: "Fazer banda com panela e colher!", minutes: 7, ageRange: "3–7 anos", tags: ["adventure", "movement"], kind: "play", instruction: "Pegue uma panela e uma colher. Vamos formar uma banda!", slotImg: "imgAtiv_cozinha", slotAudio: "exec_cozinha", accent: "275 65% 62%" },
  { id: "batuque-corpo", title: "Batuque do Corpo", subtitle: "Peito, perna, palma — o corpo vira instrumento!", minutes: 5, ageRange: "4–8 anos", tags: ["movement", "featured"], kind: "clap", instruction: "Peito, perna, palma. Vai seguindo o padrão comigo!", slotImg: "imgAtiv_batuque", slotAudio: "exec_batuque", accent: "150 55% 55%" },
  { id: "musica-nome", title: "A Música do Seu Nome", subtitle: "Invente uma cançãozinha com o nome de quem você ama.", minutes: 6, ageRange: "3–8 anos", tags: ["emotion", "bond"], kind: "sing", instruction: "Diga um nome. A gente inventa uma canção com ele!", slotImg: "imgAtiv_nome", slotAudio: "exec_nome", accent: "150 55% 55%" },
  { id: "danca-bichos", title: "Dança dos Bichos", subtitle: "Mexa como cada animal — pula, rasteja, voa!", minutes: 6, ageRange: "2–6 anos", tags: ["movement", "adventure"], kind: "dance", instruction: "Salta como sapo, voa como pássaro, rasteja como cobrinha!", slotImg: "imgAtiv_bichos", slotAudio: "exec_bichos", accent: "275 65% 62%" },
];

const greetingWord = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const activityAsset = (i: number) => `/exemplos/assets/mu-a${(i % 4) + 1}.png`;

/* ── Icone SVG genérico ── */
const Icon = ({ d, stroke = "#fff", size = 20, sw = 1.8 }: { d: string; stroke?: string; size?: number; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Keyframes locais (prefixo mus-) ── */
const MusicKeyframes = () => (
  <style>{`
    @keyframes mus-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes mus-toastin{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes mus-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes mus-twinkle{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:.9;transform:scale(1.15)}}
    @keyframes mus-raysway{0%,100%{opacity:.5;transform:translateX(0)}50%{opacity:1;transform:translateX(12px)}}
    @keyframes mus-drift1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(34px,26px) scale(1.18)}}
    @keyframes mus-drift2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-40px,-22px) scale(1.12)}}
    @keyframes mus-sparklefloat{0%,100%{opacity:.1;transform:translateY(0) scale(.7)}50%{opacity:.95;transform:translateY(-16px) scale(1.15)}}
    @keyframes mus-shine{0%{transform:translateX(-130%) skewX(-18deg)}60%,100%{transform:translateX(240%) skewX(-18deg)}}
    @keyframes mus-notefloat{0%{transform:translateY(0) rotate(-6deg);opacity:0}15%{opacity:.85}85%{opacity:.5}100%{transform:translateY(-90px) rotate(10deg);opacity:0}}
    @keyframes mus-heroin{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}
    @keyframes mus-cascade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  `}</style>
);

/* ── Fundo floresta premium (print MUSICA) ── */
const ForestBackdrop = ({ heroSrc }: { heroSrc: string }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
    <img
      src={heroSrc}
      alt=""
      style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", objectPosition: "center 20%",
        filter: "saturate(1.15) brightness(0.92)", transform: "scale(1.08)",
      }}
    />
    {/* raios + vinheta creme inferior (como o mockup) */}
    <div
      style={{
        position: "absolute", inset: 0,
        background:
          "radial-gradient(60% 40% at 78% 8%, rgba(255,220,120,.55) 0%, transparent 62%)," +
          "linear-gradient(180deg, rgba(20,40,20,.18) 0%, rgba(246,241,223,.15) 28%, rgba(246,241,223,.78) 58%, #F4EEDF 78%, #F0E9D0 100%)",
      }}
    />
    <div
      style={{
        position: "absolute", top: -40, right: -20, width: 220, height: 220, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,230,140,.55), transparent 68%)",
        filter: "blur(8px)", animation: "mus-raysway 8s ease-in-out infinite",
      }}
    />
    <div style={{ position: "absolute", top: "48%", left: "10%", animation: "mus-notefloat 10s ease-in-out infinite" }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d={D.note} stroke="#E8B84A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
    <div style={{ position: "absolute", top: "62%", left: "78%", animation: "mus-notefloat 12s ease-in-out 3s infinite" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d={D.note} stroke="#A98CD8" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  </div>
);

const CREAM_BG = "linear-gradient(180deg,#F6F1DF 0%,#F0E9D0 40%,#E8DFBF 75%,#DFD3AC 100%)";

/** Glass colorido tipo mockup (categoria) */
const catGlass = (r: number, g: number, b: number): CSSProperties => ({
  background: `linear-gradient(165deg, rgba(255,255,255,.88) 0%, rgba(${r},${g},${b},.42) 48%, rgba(${r},${g},${b},.28) 100%)`,
  border: "0.5px solid rgba(255,255,255,.95)",
  borderRadius: 26,
  boxShadow:
    `0 14px 36px rgba(40,30,15,.14), 0 0 28px rgba(${r},${g},${b},.22), 0 1.5px 0 rgba(255,255,255,1) inset, 0 -8px 18px rgba(${r},${g},${b},.12) inset`,
  backdropFilter: "blur(40px) saturate(200%)",
  WebkitBackdropFilter: "blur(40px) saturate(200%)",
});

const modeTint: Record<string, CSSProperties> = {
  ouro: {
    background: "linear-gradient(165deg, rgba(255,255,255,.92) 0%, rgba(255,236,190,.72) 55%, rgba(255,220,150,.55) 100%)",
    border: "0.5px solid rgba(255,255,255,.98)",
  },
  rosa: {
    background: "linear-gradient(165deg, rgba(255,255,255,.92) 0%, rgba(255,220,232,.72) 55%, rgba(255,200,220,.5) 100%)",
    border: "0.5px solid rgba(255,255,255,.98)",
  },
  azul: {
    background: "linear-gradient(165deg, rgba(255,255,255,.92) 0%, rgba(210,230,255,.72) 55%, rgba(190,220,255,.5) 100%)",
    border: "0.5px solid rgba(255,255,255,.98)",
  },
  verde: {
    background: "linear-gradient(165deg, rgba(255,255,255,.92) 0%, rgba(210,245,220,.72) 55%, rgba(190,240,210,.5) 100%)",
    border: "0.5px solid rgba(255,255,255,.98)",
  },
};

const MusicForest = ({ onBack, onNavigateToDreams, onXpEarned, onOpenParental, onOpenTravel }: Props) => {
  const { profile, tier } = useAuth();
  const childName = profile?.child_name || "amigo";
  const isPremium = tier === "premium";
  // Troféu global da família (mesmo valor das outras abas) — não o XP só de música
  const pontosFamilia = profile?.points ?? 0;

  const [activePillar, setActivePillar] = useState<Pillar | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const [activeActivity, setActiveActivity] = useState<GuidedActivity | null>(null);
  const [xp, setXp] = useState(getMusicXp());
  const [toast, setToast] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("kidzz_music_favs") || "[]"); } catch { return []; }
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const heroWrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  const onScroll = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const sc = scrollRef.current, hero = heroWrapRef.current;
      if (!sc || !hero) return;
      const y = sc.scrollTop;
      hero.style.transform = `translateY(${y * 0.42}px) scale(${1 + y * 0.0004})`;
      hero.style.opacity = String(Math.max(0, 1 - y / 240));
    });
  };

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("kidzz_music_favs", JSON.stringify(next));
      return next;
    });
  };

  const openPaywall = (context: string) => {
    window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context } }));
  };

  const tryOpenPillar = (p: Pillar, premium: boolean) => {
    if (premium && !isPremium) { openPaywall(`music_${p}`); return; }
    setActivePillar(p);
  };

  const tryOpenActivity = (a: GuidedActivity) => setActiveActivity(a);

  const openCategory = (id: CategoryId) => {
    if (id === "travel") {
      if (!isPremium) { openPaywall("travel"); return; }
      onOpenTravel?.();
      return;
    }
    setActiveCategory(id);
  };

  useEffect(() => {
    if (activePillar === null && activeActivity === null) {
      setXp(getMusicXp());
    } else if (activePillar || activeActivity) {
      const { newlyMarked } = completeMissionStep("music");
      if (newlyMarked) {
        const { gained } = addXp("music");
        showXpGained(gained, "música");
        bumpSessionActions();
      }
    }
  }, [activePillar, activeActivity]);

  const handleAchievement = (a: MusicAchievement) => {
    showToast(`${a.emoji} ${a.name}`);
  };

  // Pillar screens
  if (activePillar === "morning") return <MorningKaraoke onBack={() => { setActivePillar(null); onXpEarned?.(); }} childName={childName} onAchievement={handleAchievement} />;
  if (activePillar === "dance") return <DanceWithAne onBack={() => { setActivePillar(null); onXpEarned?.(); }} childName={childName} onAchievement={handleAchievement} />;
  if (activePillar === "stories") return <SungStories onBack={() => { setActivePillar(null); onXpEarned?.(); }} childName={childName} onAchievement={handleAchievement} />;
  if (activePillar === "create") return <CreateMusic onBack={() => { setActivePillar(null); onXpEarned?.(); }} childName={childName} onAchievement={handleAchievement} />;

  // Guided activity fullscreen
  if (activeActivity) {
    return (
      <GuidedActivityPlayer
        activity={activeActivity}
        childName={childName}
        onClose={() => { setActiveActivity(null); onXpEarned?.(); }}
      />
    );
  }

  // Category sub-screen
  if (activeCategory) {
    const cat = CATEGORIES.find((c) => c.id === activeCategory)!;
    const list = ACTIVITIES.filter((a) => cat.tags.some((t) => a.tags.includes(t)));
    return (
      <CategoryScreen
        category={cat}
        activities={list}
        onBack={() => setActiveCategory(null)}
        onOpen={tryOpenActivity}
        favorites={favorites}
        onToggleFav={toggleFav}
        onOpenDreams={onNavigateToDreams}
      />
    );
  }

  /* ── Modos (pilares reais) ── */
  const modos = [
    { pillar: "morning" as Pillar, title: "Karaokê do Dia", sub: "Grátis — cante com o Kidzz", d: D.mic, k: "ouro", t: [240, 180, 70] as [number, number, number], badge: "NOVO", requiresPremium: false, cover: `${MU}/modo-mic.png` },
    { pillar: "dance" as Pillar, title: "Dance com Kidzz", sub: "Mini-game de palmas e movimento", d: D.dance, k: "rosa", t: [240, 130, 170] as [number, number, number], badge: "PREMIUM", requiresPremium: true, cover: `${MU}/modo-dance.png` },
    { pillar: "stories" as Pillar, title: "Histórias Cantadas", sub: "4 livros mágicos narrados em canção", d: D.book, k: "azul", t: [130, 175, 240] as [number, number, number], badge: "PREMIUM", requiresPremium: true, cover: `${MU}/modo-book.png` },
    { pillar: "create" as Pillar, title: "Crie Sua Música", sub: "Laboratório sonoro — monte a sua", d: D.lab, k: "verde", t: [140, 200, 110] as [number, number, number], badge: "PREMIUM", requiresPremium: true, cover: `${MU}/modo-create.png` },
  ];

  const destaques = ACTIVITIES.filter((a) => a.tags.includes("featured") || a.tags.includes("movement"));
  const heroImg = `${MU}/hero-family.png`;

  const playAmbient = (s: (typeof AMBIENT_SOUNDS)[number]) => {
    if (!s.free && !isPremium) {
      openPaywall("music_ambient");
      return;
    }
    if (!s.url) {
      showToast("Esse som chega em breve 🎵");
      return;
    }
    try {
      const a = new Audio(s.url);
      a.loop = true;
      a.volume = 0.45;
      void a.play();
      showToast(`Tocando: ${s.label}`);
    } catch {
      showToast("Não foi possível tocar o som.");
    }
  };

  return (
    <div style={{ height: "100%", position: "relative", fontFamily: FONT, background: "#1a2a18", color: "#2A2008" }}>
      <MusicKeyframes />
      <ForestBackdrop heroSrc={heroImg} />

      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          height: "100%", overflowY: "auto", overflowX: "hidden", overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)",
          scrollbarWidth: "none", position: "relative", zIndex: 2,
        }}
      >
        {/* ── HERO (layout print: texto esq + arte dir) ── */}
        <div style={{ position: "relative", minHeight: 420, paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
          {/* arte flutuante à direita */}
          <div
            ref={heroWrapRef}
            style={{
              position: "absolute", top: 48, right: -8, width: "58%", height: 320,
              pointerEvents: "none", animation: "mus-heroin .75s cubic-bezier(.22,1,.36,1) both",
            }}
          >
            <img
              src={heroImg}
              alt="Família tocando música"
              style={{
                width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%",
                borderRadius: "0 0 0 48%",
                maskImage: "radial-gradient(70% 70% at 60% 40%, #000 35%, transparent 78%)",
                WebkitMaskImage: "radial-gradient(70% 70% at 60% 40%, #000 35%, transparent 78%)",
                filter: "saturate(1.12) contrast(1.04)",
                animation: "mus-floaty 7s ease-in-out infinite",
                boxShadow: "0 20px 50px rgba(0,0,0,.25)",
              }}
            />
          </div>

          {/* chrome */}
          <div style={{ position: "relative", zIndex: 6, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `8px ${PAD}px 0` }}>
            <button
              onClick={onBack}
              className="active:scale-90"
              style={{ width: 44, height: 44, borderRadius: R.btn, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", ...pillGlassLight }}
              aria-label="Voltar"
            >
              <Icon d={D.back} stroke="#3A2E14" size={19} sw={2.2} />
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={onOpenParental}
                className="active:scale-95"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", minHeight: 44, borderRadius: R.btn, cursor: "pointer", fontWeight: 800, fontSize: 13, color: "#3A2E14", ...pillGlassLight }}
                aria-label="Painel dos pais"
              >
                <Icon d={D.shield} stroke="#2E8B72" size={15} sw={2} /> Pais
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", minHeight: 44, borderRadius: R.btn, fontWeight: 900, fontSize: 13, color: "#3A2E14", ...pillGlassLight }} aria-label={`${pontosFamilia} pontos da família`}>
                <Icon d={D.cap} stroke="#E0A62B" size={14} sw={1.9} /> {pontosFamilia}
              </div>
            </div>
          </div>

          {/* copy */}
          <div style={{ position: "relative", zIndex: 5, padding: "18px 20px 8px", maxWidth: "62%", animation: "mus-cascade .55s cubic-bezier(.22,1,.36,1) both" }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: "rgba(255,252,240,.92)", textShadow: "0 1px 8px rgba(0,0,0,.35)", marginBottom: 8 }}>
              {greetingWord()}, família! <span style={{ color: "#7dffb0" }}>♥</span>
            </div>
            <h1 style={{ margin: "0 0 10px", fontFamily: SERIF, fontWeight: 600, fontSize: 30, lineHeight: 1.12, color: "#FFFDF6", letterSpacing: "-.4px", textShadow: "0 2px 18px rgba(0,0,0,.4)" }}>
              Música que <span style={{ color: "#FFD36A" }}>conecta</span>, momentos que ficam.
            </h1>
            <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, lineHeight: 1.45, color: "rgba(255,248,230,.88)", textShadow: "0 1px 8px rgba(0,0,0,.3)", maxWidth: 240 }}>
              Atividades com música para soltar a voz, dançar e criar memórias inesquecíveis juntos.
            </p>
            <button
              onClick={() => openCategory("featured")}
              className="active:scale-[0.97]"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 22px", minHeight: 48,
                borderRadius: R.btn, border: "0.5px solid rgba(255,235,150,.65)", cursor: "pointer",
                fontWeight: 900, fontSize: 14.5, color: "#4A3300",
                background: "radial-gradient(130% 130% at 30% 22%, #FFE9A8, #F5C24E 55%, #E0A52E)",
                boxShadow: "0 12px 28px rgba(180,120,20,.4), 0 1px 0 rgba(255,255,255,.7) inset",
              }}
            >
              Explorar música →
            </button>
          </div>
        </div>

        {/* ── CATEGORIAS ── */}
        <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "8px 16px 6px", scrollbarWidth: "none", position: "relative", zIndex: 5 }}>
          {CATEGORIES.map((cat) => {
            const [tr, tg, tb] = TINT[cat.dk];
            return (
              <button
                key={cat.id}
                onClick={() => openCategory(cat.id)}
                className="active:scale-[0.96]"
                style={{
                  position: "relative", overflow: "hidden", flex: "none", width: 148,
                  padding: "14px 12px 12px", textAlign: "left", cursor: "pointer",
                  display: "flex", flexDirection: "column", gap: 8, ...catGlass(tr, tg, tb),
                }}
              >
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(115deg, transparent 0%, rgba(255,255,255,.35) 48%, transparent 72%)", mixBlendMode: "soft-light" }} />
                {cat.novo && (
                  <div style={{ position: "absolute", top: 10, right: 10, padding: "4px 10px", borderRadius: 999, zIndex: 2, ...goldBadge }}>NOVO</div>
                )}
                <img
                  src={cat.cover}
                  alt=""
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.src = `${MU}/cat-sun.png`;
                  }}
                  style={{
                    width: 72, height: 72, borderRadius: 22, objectFit: "cover",
                    boxShadow: "0 10px 22px rgba(40,30,15,.22), 0 1px 0 rgba(255,255,255,.5) inset",
                    border: "0.5px solid rgba(255,255,255,.75)",
                  }}
                />
                <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15, color: "#2A2008", lineHeight: 1.15 }}>{cat.label}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#6B5A38", lineHeight: 1.3, minHeight: 28 }}>{cat.subtitle}</div>
                <div style={{ alignSelf: "flex-end", ...glossArrow(...ARROWS[cat.dk]) }}>
                  <Icon d={D.arrow} size={12} sw={2.4} />
                </div>
              </button>
            );
          })}
        </div>

        {/* ── MAIS MANEIRAS ── */}
        <div style={{ padding: "18px 16px 0" }}>
          <h2 style={{ margin: "0 4px 12px", fontFamily: SERIF, fontWeight: 600, fontSize: 20, color: "#2A2008" }}>
            Mais maneiras de brincar com música
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {modos.map((m) => {
              const locked = m.requiresPremium && !isPremium;
              return (
                <button
                  key={m.pillar}
                  onClick={() => tryOpenPillar(m.pillar, m.requiresPremium)}
                  className="active:scale-[0.97]"
                  style={{
                    position: "relative", overflow: "hidden", borderRadius: 26, padding: "14px 12px 14px",
                    textAlign: "left", cursor: "pointer", minHeight: 128,
                    boxShadow: "0 14px 36px rgba(40,30,15,.12), 0 1px 0 rgba(255,255,255,1) inset",
                    backdropFilter: "blur(36px) saturate(190%)",
                    WebkitBackdropFilter: "blur(36px) saturate(190%)",
                    ...modeTint[m.k],
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                    <img
                      src={m.cover}
                      alt=""
                      style={{
                        width: 64, height: 64, borderRadius: 20, objectFit: "cover",
                        boxShadow: "0 10px 20px rgba(40,30,15,.18)",
                        border: "0.5px solid rgba(255,255,255,.9)",
                      }}
                    />
                    <div style={m.badge === "NOVO" ? greenBadge : premiumSeal}>
                      {locked && <Icon d={D.lock} stroke="#4A3300" size={9} sw={2.2} />}
                      {m.badge}
                    </div>
                  </div>
                  <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15.5, color: "#2A2008", lineHeight: 1.15, marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#6B5A38", lineHeight: 1.35 }}>{m.sub}</div>
                  <div style={{ position: "absolute", right: 12, bottom: 12, ...glossArrow(...MODOS_G[m.k]) }}>
                    <Icon d={D.arrow} size={12} sw={2.4} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── SONS PARA OUVIR ── */}
        <div style={{ padding: "20px 16px 0" }}>
          <h2 style={{ margin: "0 4px 4px", fontFamily: SERIF, fontWeight: 600, fontSize: 20, color: "#2A2008" }}>
            Sons para ouvir
          </h2>
          <p style={{ margin: "0 4px 12px", fontSize: 12.5, fontWeight: 700, color: "#7A6840" }}>
            Deixe tocando ao fundo enquanto brincam
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {AMBIENT_SOUNDS.map((s) => {
              const locked = !s.free && !isPremium;
              return (
                <button
                  key={s.id}
                  onClick={() => playAmbient(s)}
                  className="active:scale-[0.99]"
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 14px",
                    textAlign: "left", cursor: "pointer",
                    ...glassLightSoft,
                    borderRadius: 22,
                    background: "linear-gradient(165deg, rgba(255,255,255,.94), rgba(250,246,236,.88))",
                  }}
                >
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: 16, flex: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "radial-gradient(130% 130% at 30% 22%, #FFF8E8, #E8D8B0 55%, #C8B080)",
                      boxShadow: "0 4px 12px rgba(40,30,15,.12), 0 1px 0 rgba(255,255,255,1) inset",
                    }}
                  >
                    <Icon d={D.note} stroke="#6A5430" size={18} sw={1.9} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15.5, color: "#2A2008" }}>{s.label}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#8A7850" }}>{s.desc}</div>
                  </div>
                  {locked && (
                    <span style={premiumSeal}>
                      <Icon d={D.lock} stroke="#4A3300" size={9} sw={2.2} />
                      PREMIUM
                    </span>
                  )}
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 999, flex: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "radial-gradient(130% 130% at 30% 22%, #FFE9A8, #F2C55C 55%, #C98F1E)",
                      border: "1px solid rgba(255,255,255,.7)",
                      boxShadow: "0 6px 14px rgba(150,100,20,.35), inset 0 1px 0 rgba(255,255,255,.6)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#3A2E14" style={{ marginLeft: 1 }}><path d={D.play} /></svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── ATIVIDADES ── */}
        <div style={{ paddingTop: 8 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "16px 20px 10px" }}>
            <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: 20, color: "#2A2008" }}>Atividades em destaque</h2>
            <button onClick={() => openCategory("featured")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: FONT, fontWeight: 900, fontSize: 12.5, color: "#C7841A", padding: 0 }}>
              Ver todas →
            </button>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 16px 12px", scrollbarWidth: "none" }}>
            {destaques.map((a, i) => (
              <ActivityCard
                key={a.id}
                activity={a}
                index={i}
                favorite={favorites.includes(a.id)}
                onFav={() => toggleFav(a.id)}
                onOpen={() => tryOpenActivity(a)}
              />
            ))}
          </div>
        </div>

        <div style={{ padding: "8px 20px 16px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "#8A7850" }}>
          Curadoria KIDZZ · Música para crescer junto
        </div>
      </div>

      {/* ── TOAST (conquistas dos pilares) ── */}
      {toast && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)", display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 40 }}>
          <div style={{ padding: "10px 18px", borderRadius: 999, background: "rgba(42,32,8,.93)", color: "#F6F1DF", fontFamily: "'Nunito',sans-serif", fontSize: 12.5, fontWeight: 800, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", boxShadow: "0 10px 24px rgba(42,32,8,.4)", animation: "mus-toastin .3s both" }}>{toast}</div>
        </div>
      )}
    </div>
  );
};

/* ============ CARD DE ATIVIDADE ============ */

const ActivityCard = ({
  activity, index, favorite, onFav, onOpen, full = false,
}: { activity: GuidedActivity; index: number; favorite: boolean; onFav: () => void; onOpen: () => void; full?: boolean }) => {
  // Fundo de card unificado (sem arco-íris por item) — padrão do relatório
  const foot: [string, string] = ["#3A3220", "#2A2418"];
  return (
    <div style={{ flex: "none", width: full ? "100%" : 168, borderRadius: 22, position: "relative", overflow: "hidden", boxShadow: "0 14px 30px rgba(110,85,30,.26),inset 0 1px 0 rgba(255,255,255,.4)", border: "1px solid rgba(255,255,255,.55)", animation: "mus-rise .45s both" }}>
      <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
        <button onClick={onOpen} aria-label={activity.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", padding: 0, border: "none", cursor: "pointer", backgroundImage: `url("${activityAsset(index)}")`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "absolute", top: 8, left: 8, padding: "4px 11px", borderRadius: 999, background: "rgba(255,253,246,.88)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.9)", boxShadow: "0 3px 8px rgba(0,0,0,.18)", color: "#3A2E14", fontSize: 10, fontWeight: 900, pointerEvents: "none" }}>{activity.minutes} min</div>
        {/* UM play dourado (sem duplicar círculo translúcido no centro) */}
        <button
          onClick={onOpen}
          className="active:scale-90"
          style={{
            position: "absolute",
            right: 10,
            bottom: 10,
            width: 42,
            height: 42,
            borderRadius: 999,
            cursor: "pointer",
            background: "radial-gradient(130% 130% at 30% 22%, #FFE9A8, #F2C55C 55%, #C98F1E)",
            border: "1px solid rgba(255,255,255,.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 16px rgba(120,80,10,.4), inset 0 1.5px 1px rgba(255,255,255,.65)",
            zIndex: 2,
          }}
          aria-label={`Abrir ${activity.title}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#3A2E14" style={{ marginLeft: 2 }}><path d={D.play} /></svg>
        </button>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 30, background: `linear-gradient(180deg, rgba(0,0,0,0), ${foot[0]})`, pointerEvents: "none" }} />
      </div>
      <div style={{ padding: "8px 12px 10px", display: "flex", flexDirection: "column", gap: 3, background: `linear-gradient(180deg,${foot[0]},${foot[1]})` }}>
        <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 14, color: "#FFF8EA", lineHeight: 1.2 }}>{activity.title}</div>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,248,234,.82)", lineHeight: 1.4, minHeight: 28 }}>{activity.subtitle}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,248,234,.75)" }}>{activity.ageRange}</div>
          <button onClick={onFav} className="active:scale-90" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", transition: "transform .2s" }} aria-label="Favoritar">
            <span style={{ transform: favorite ? "scale(1.15)" : "scale(1)", transition: "transform .3s cubic-bezier(.34,1.8,.64,1)", display: "flex" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill={favorite ? "#FF6D9E" : "rgba(255,255,255,0)"}><path d={D.heart} stroke="#FFF8EA" strokeWidth="1.7" strokeLinejoin="round" /></svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============ SUB-TELA POR CATEGORIA ============ */

const CategoryScreen = ({
  category, activities, onBack, onOpen, favorites, onToggleFav, onOpenDreams,
}: {
  category: Category; activities: GuidedActivity[]; onBack: () => void;
  onOpen: (a: GuidedActivity) => void; favorites: string[]; onToggleFav: (id: string) => void;
  onOpenDreams: () => void;
}) => {
  const [tr, tg, tb] = TINT[category.dk];
  return (
    <div style={{ height: "100%", position: "relative", fontFamily: FONT, background: CREAM_BG }}>
      <MusicKeyframes />
      <ForestBackdrop heroSrc={category.cover} />

      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 30, display: "flex", alignItems: "center", gap: 8, padding: "0 12px 8px", paddingTop: "max(env(safe-area-inset-top, 14px), 14px)" }}>
        <button onClick={onBack} className="active:scale-90" style={{ flex: "none", width: 44, height: 44, borderRadius: R.btn, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .2s", ...pillGlassLight }} aria-label="Voltar">
          <Icon d={D.back} stroke="#3A2E14" size={19} sw={2.2} />
        </button>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 9, padding: "8px 14px", borderRadius: R.btn, ...pillGlassLight }}>
          <img src={category.cover} alt="" style={{ width: 28, height: 28, borderRadius: 10, objectFit: "cover" }} />
          <p style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: 15, color: "#2A2008", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{category.label}</p>
        </div>
      </div>

      <div
        style={{ height: "100%", overflowY: "auto", overflowX: "hidden", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", padding: "0 16px", paddingTop: "calc(env(safe-area-inset-top, 0px) + 70px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)", scrollbarWidth: "none", position: "relative" }}
      >
        {/* Hero da categoria (mesmo degradê) */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 26, overflow: "hidden", border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 14px 32px rgba(110,85,30,.18)", background: category.gradient, animation: "mus-rise .5s both" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(255,255,255,.22) 0%,transparent 45%,rgba(0,0,0,.18) 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 20 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "2px", color: "rgba(255,255,255,.85)" }}>{category.subtitle}</p>
            <h1 style={{ margin: "2px 0 0", fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 26, lineHeight: 1.12, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,.28)" }}>{category.label}</h1>
          </div>
          <div style={{ position: "absolute", top: 12, right: 14 }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d={D.note} stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>

        {category.id === "calm" && (
          <button onClick={onOpenDreams} className="active:scale-95" style={{ width: "100%", marginTop: 14, borderRadius: 20, padding: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", ...glass(tr, tg, tb, 0.5, 0.18) }}>
            <div style={gloss(...ARROWS.indigo, 42, 14)}><Icon d={D.moon} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 15, color: "#2A2008" }}>Ir para Sonhos</div>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: "#7A6840" }}>Ninar, respirar no ritmo, dormir gostoso</div>
            </div>
            <div style={glossArrow(...ARROWS.indigo)}><Icon d={D.arrow} size={12} sw={2.4} /></div>
          </button>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
          {activities.map((a, i) => (
            <ActivityCard
              key={a.id}
              activity={a}
              index={i}
              full
              favorite={favorites.includes(a.id)}
              onFav={() => onToggleFav(a.id)}
              onOpen={() => onOpen(a)}
            />
          ))}
        </div>

        {activities.length === 0 && (
          <div style={{ marginTop: 16, borderRadius: 22, padding: 24, textAlign: "center", ...glass(tr, tg, tb, 0.5, 0.16) }}>
            <p style={{ margin: 0, fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 15, color: "#2A2008" }}>Novas atividades chegando por aqui em breve. 🎶</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicForest;

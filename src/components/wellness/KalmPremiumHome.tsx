/**
 * KALM Premium Home
 * ─────────────────────────────────────────────────────────
 * Craft = Bora (mesma arquitetura: camadas, sticky glass header,
 *   hero mascarado, coloredGlass, gloss, sheen, cascade).
 * Layout = print public/telas/kalm/ (ordem e densidade).
 * Assets = kalm-v2 Hermes full-frame.
 * Tagline SEM 💛.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Leaf,
  Moon,
  Heart,
  Timer,
  Play,
  Pause,
  Plus,
  Share2,
  Shield,
  Trophy,
  Wind,
  Sparkles,
  MapPin,
  Flower2,
  Waves,
  Coffee,
  Sun,
  Clock,
} from "lucide-react";
import { haptic } from "@/lib/haptics";
import { useAuth } from "@/contexts/AuthContext";
import { AmbientSoundEngine } from "@/components/dreams/AmbientSoundEngine";
import {
  FONT,
  SERIF,
  R,
  PAD,
  GAP,
  glassLight as glass,
  glassLightSoft as glassSoft,
  pillGlassLight as pillGlass,
  coloredGlass,
  goldBtn,
  sectionWrap,
} from "@/lib/premiumUi";
import KidzzLogo from "@/components/common/KidzzLogo";

import { CAMALEAO, CAMALEAO_SCENE_MASK } from "@/lib/camaleaoOficial";

const AS = "/exemplos/assets/kalm-v2";
const AV = "v9";
const img = (n: string) => `${AS}/${n}?${AV}`;
/** Hero oficial: família + camaleão original (não o CGI verde genérico) */
const HERO_FAMILY = `${AS}/hero-family-oficial.png?${AV}`;

export type KalmView =
  | "home" | "sos" | "breath" | "sounds" | "mindful" | "pause"
  | "routine" | "realworld" | "journey" | "sleep" | "family" | "meditation";

interface Props {
  go: (v: KalmView) => void;
  onBack: () => void;
  onOpenParent?: () => void;
  initialExperienceId?: string | null;
  onConsumedInitial?: () => void;
}

/* ── tokens de cor do print (floresta clara) ── */
const INK = "#1B301F";
const INK2 = "rgba(27,48,31,.72)";
const EM = "#3E9A5E";
const EM_SOFT = "#6FBE7A";

const STREAK_KEY = "kidzz_wellness_streak";
const MOOD_KEY = "kidzz_wellness_mood";
const GRAT_KEY = "kidzz_gratitude_v1";
const WINS_KEY = "kidzz_wins_total_v1";
const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
const FOREST = "https://cdn.pixabay.com/audio/2022/03/10/audio_270f49c32b.mp3";

const KEYFRAMES = `
@keyframes kalm2-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes kalm2-cascade{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes kalm2-heroIn{from{opacity:0;transform:translateY(-8px) scale(1.03)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes kalm2-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes kalm2-drift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(24px,14px) scale(1.1)}}
@keyframes kalm2-shine{0%{transform:translateX(-130%) skewX(-16deg)}60%,100%{transform:translateX(240%) skewX(-16deg)}}
@keyframes kalm2-twinkle{0%,100%{opacity:.18;transform:scale(.7)}50%{opacity:.9;transform:scale(1.15)}}
@keyframes kalm2-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes kalm2-eq{0%,100%{height:28%}50%{height:100%}}
.kalm2-screen::-webkit-scrollbar,.kalm2-hscroll::-webkit-scrollbar{display:none}
[data-tab="kalm"] button{-webkit-tap-highlight-color:transparent;touch-action:manipulation}
@media (prefers-reduced-motion:reduce){
  [data-tab="kalm"] *,[data-tab="kalm"] *::before,[data-tab="kalm"] *::after{animation:none!important;transition-duration:.01ms!important}
}
`;

const SectionLabel = ({ children, right, kicker }: { children: ReactNode; right?: ReactNode; kicker?: string }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 12,
      padding: "0 2px",
    }}
  >
    <div>
      {kicker && (
        <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "1.3px", color: EM, marginBottom: 3, textTransform: "uppercase" }}>
          {kicker}
        </div>
      )}
      <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: 18, color: INK, letterSpacing: "-0.3px" }}>
        {children}
      </h2>
    </div>
    {right}
  </div>
);

const Gloss = ({
  colors,
  children,
  size = 40,
  radius = 14,
}: {
  colors: [string, string, string];
  children: ReactNode;
  size?: number;
  radius?: number;
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: radius,
      flex: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${colors[0]} 16%, ${colors[1]} 55%, ${colors[2]} 100%)`,
      boxShadow:
        "0 7px 15px rgba(40,80,40,.28), inset 0 2px 3px rgba(255,255,255,.72), inset 0 -5px 10px rgba(0,0,0,.18)",
    }}
  >
    {children}
  </div>
);

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
      background: "linear-gradient(105deg, transparent 0%, rgba(255,255,255,.28) 50%, transparent 100%)",
      animation: "kalm2-shine 6.5s ease-in-out infinite",
      borderRadius: "inherit",
    }}
  />
);

function readJson<T>(key: string, fb: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fb;
  } catch {
    return fb;
  }
}

const MOODS = [
  { v: 4, e: "😊", l: "Feliz" },
  { v: 3, e: "😌", l: "Calmo" },
  { v: 2, e: "😐", l: "Neutro" },
  { v: 1, e: "😢", l: "Triste" },
  { v: 5, e: "🤩", l: "Muito feliz" },
];

const ACTIONS: {
  t: string;
  sub: string;
  view: KalmView;
  Icon: typeof Leaf;
  tint: [number, number, number];
  g: [string, string, string];
}[] = [
  { t: "Relaxar agora", sub: "Respiração", view: "breath", Icon: Leaf, tint: [100, 185, 125], g: ["#C0EDA0", "#6FBE4F", "#3F8A32"] },
  { t: "Dormir melhor", sub: "Noite calma", view: "sleep", Icon: Moon, tint: [150, 150, 210], g: ["#D2CCF0", "#8A7AD8", "#5E4EA8"] },
  { t: "SOS emocional", sub: "Acolhimento", view: "sos", Icon: Heart, tint: [225, 140, 150], g: ["#F0C8C8", "#D87A7A", "#A84E4E"] },
  { t: "Ritual rápido", sub: "2 minutos", view: "mindful", Icon: Timer, tint: [225, 185, 100], g: ["#FFE9B8", "#E0B85C", "#B08A2E"] },
];

const RITUALS: { t: string; s: string; view: KalmView; Icon: typeof Leaf; tint: [number, number, number]; g: [string, string, string] }[] = [
  { t: "Meditação", s: "5 min", view: "meditation", Icon: Flower2, tint: [140, 190, 150], g: ["#C8F0D0", "#6FBE7A", "#2F7A4E"] },
  { t: "Respiração", s: "3 min", view: "breath", Icon: Wind, tint: [120, 180, 200], g: ["#C0E8F0", "#5AA8C0", "#2E6A80"] },
  { t: "Família", s: "Juntos", view: "family", Icon: Heart, tint: [230, 160, 150], g: ["#FFD0C8", "#E08878", "#A84E4E"] },
  { t: "Sons", s: "Loop", view: "sounds", Icon: Waves, tint: [100, 160, 180], g: ["#B8E0F0", "#4A9AB8", "#2A6080"] },
  { t: "Mindful", s: "2 min", view: "mindful", Icon: Sparkles, tint: [220, 190, 120], g: ["#FFE9B8", "#E0B85C", "#B08A2E"] },
  { t: "Pausa", s: "1 min", view: "pause", Icon: Coffee, tint: [200, 170, 130], g: ["#F0E0C0", "#C0A070", "#8A6A40"] },
  { t: "Rotina", s: "Hoje", view: "routine", Icon: Sun, tint: [160, 200, 120], g: ["#D8F0B0", "#8AC050", "#4A8020"] },
];

const REAL = [
  { t: "Spa Jardim das Cerejeiras", c: "São Paulo · Jardins", img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=70" },
  { t: "Lounge Sensorial Casa Luz", c: "Rio · Leblon", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=70" },
  { t: "Retiro Anavilhanas", c: "Amazonas", img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=700&q=70" },
  { t: "Pôr do sol na praia", c: "Praia do Forte, BA", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=70" },
  { t: "Passeio de Balão", c: "Boituva, SP", img: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&w=700&q=70" },
];

const BADGES = [
  { e: "🍀", n: 1 },
  { e: "⭐", n: 3 },
  { e: "💗", n: 5 },
  { e: "🌈", n: 7 },
  { e: "🦋", n: 10 },
];

const KalmPremiumHome = ({ go, onBack, onOpenParent, initialExperienceId, onConsumedInitial }: Props) => {
  const { profile } = useAuth();
  const pontos = profile?.points ?? 0;
  const h = new Date().getHours();
  const greet = h < 12 ? "Bom dia, família!" : h < 18 ? "Boa tarde, família!" : "Boa noite, família!";

  const [streak, setStreak] = useState(() =>
    readJson<{ count: number; last: string | null }>(STREAK_KEY, { count: 0, last: null })
  );
  const [mood, setMood] = useState(() => readJson<Record<string, number>>(MOOD_KEY, {})[dayKey()] ?? 0);
  const [grat, setGrat] = useState(() => readJson<{ id: string }[]>(GRAT_KEY, []).length);
  const [wins] = useState(() => readJson<number>(WINS_KEY, 0));
  const [sec, setSec] = useState<30 | 60 | 90>(60);
  const [toast, setToast] = useState("");
  const [soundOn, setSoundOn] = useState(false);
  const toastT = useRef<number | null>(null);
  const eng = useRef<AmbientSoundEngine | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroArtRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((m: string) => {
    if (toastT.current) clearTimeout(toastT.current);
    setToast(m);
    toastT.current = window.setTimeout(() => setToast(""), 1700);
  }, []);

  useEffect(() => {
    eng.current = new AmbientSoundEngine();
    return () => {
      eng.current?.stopAll?.();
      if (toastT.current) clearTimeout(toastT.current);
    };
  }, []);

  useEffect(() => {
    if (initialExperienceId) onConsumedInitial?.();
  }, [initialExperienceId, onConsumedInitial]);

  // Parallax hero — idêntico Bora
  useEffect(() => {
    const sc = scrollRef.current;
    const hero = heroArtRef.current;
    if (!sc || !hero) return;
    const onScroll = () => {
      const y = sc.scrollTop;
      hero.style.transform = `translateY(${y * 0.22}px) scale(${1 + y * 0.00025})`;
      hero.style.opacity = String(Math.max(0.4, 1 - y / 320));
    };
    sc.addEventListener("scroll", onScroll, { passive: true });
    return () => sc.removeEventListener("scroll", onScroll);
  }, []);

  const setTodayMood = (v: number) => {
    haptic("light");
    const today = dayKey();
    try {
      const s = readJson<Record<string, number>>(MOOD_KEY, {});
      s[today] = v;
      localStorage.setItem(MOOD_KEY, JSON.stringify(s));
    } catch { /* */ }
    setMood(v);
    if (streak.last !== today) {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const next = { count: streak.last === dayKey(y) ? streak.count + 1 : 1, last: today };
      try {
        localStorage.setItem(STREAK_KEY, JSON.stringify(next));
      } catch { /* */ }
      setStreak(next);
    }
    showToast("Humor registrado ✨");
  };

  const addGrat = () => {
    haptic("light");
    const text = window.prompt("O que foi bom hoje?");
    if (!text?.trim()) return;
    const items = readJson<{ id: string; text: string; ts: number }[]>(GRAT_KEY, []);
    items.unshift({ id: crypto.randomUUID(), text: text.trim(), ts: Date.now() });
    try {
      localStorage.setItem(GRAT_KEY, JSON.stringify(items.slice(0, 200)));
    } catch { /* */ }
    setGrat(items.length);
    showToast("Estrelinha no jarro ⭐");
  };

  const toggleSound = () => {
    haptic("light");
    const e = eng.current as any;
    if (soundOn) {
      e?.stopAll?.();
      setSoundOn(false);
      showToast("Som pausado");
    } else {
      e?.stopAll?.();
      e?.start?.("forest", FOREST, 0.45);
      setSoundOn(true);
      showToast("Som da floresta · modo calmo");
    }
  };

  const thermo = useMemo(() => {
    const m = mood > 0 ? (mood / 5) * 100 : 42;
    const st = Math.min(100, (streak.count / 7) * 100);
    const g = Math.min(100, (grat / 10) * 100);
    const w = Math.min(100, (wins / 10) * 100);
    const rows: [string, number, string][] = [
      ["Conexão", Math.round(m * 0.4 + st * 0.6), "#5CB57A"],
      ["Gratidão", Math.round(g), "#E0B85C"],
      ["Rotina", Math.round(st), "#E8821A"],
      ["Bem-estar", Math.round((m + st) / 2), "#6C9BDB"],
      ["Momentos", Math.round((g + w) / 2), "#E07A9A"],
    ];
    const avg = Math.round(rows.reduce((s, r) => s + r[1], 0) / rows.length);
    return { rows, avg };
  }, [mood, streak.count, grat, wins]);

  const share = async () => {
    const txt = `Esta semana: ${wins} vitórias e ${grat} momentos no jarro — KALM by Kidzz`;
    try {
      if (navigator.share) await navigator.share({ title: "KALM", text: txt });
      else await navigator.clipboard.writeText(txt);
      haptic("light");
      showToast("Resumo copiado");
    } catch { /* */ }
  };

  return (
    <div
      data-tab="kalm"
      style={{
        height: "100%",
        position: "relative",
        fontFamily: FONT,
        background: "#C8DCC0",
        color: INK,
        overflow: "hidden",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* ═══ CAMADAS DE FUNDO (craft Bora, paleta floresta) ═══ */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${HERO_FAMILY})`,
          backgroundSize: "cover",
          backgroundPosition: "50% 18%",
          filter: "brightness(.88) saturate(1.12) blur(1px)",
          transform: "scale(1.08)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(232,244,224,.42) 0%, rgba(220,236,210,.62) 22%, rgba(210,228,198,.82) 48%, rgba(200,220,188,.94) 72%, #C5DAB8 100%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(50% 32% at 78% 10%, rgba(255,220,110,.26), transparent 70%), radial-gradient(40% 28% at 12% 42%, rgba(120,190,130,.14), transparent 70%), radial-gradient(48% 30% at 50% 95%, rgba(90,150,100,.12), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -80,
          right: -50,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,210,120,.3), transparent 65%)",
          filter: "blur(30px)",
          animation: "kalm2-drift 14s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "48%",
          left: -90,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(120,200,130,.2), transparent 65%)",
          filter: "blur(28px)",
          animation: "kalm2-drift 18s ease-in-out 2s infinite reverse",
          pointerEvents: "none",
        }}
      />
      {[
        { t: 100, l: "16%", d: "0s" },
        { t: 170, l: "72%", d: "1.2s" },
        { t: 250, l: "40%", d: "2s" },
        { t: 340, l: "84%", d: ".6s" },
        { t: 420, l: "22%", d: "1.6s" },
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
            background: "#E8F8C0",
            boxShadow: "0 0 10px 3px rgba(160,220,100,.7)",
            animation: `kalm2-twinkle ${3 + i * 0.4}s ease-in-out ${p.d} infinite`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      ))}

      <div
        ref={scrollRef}
        className="kalm2-screen"
        style={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
          overscrollBehavior: "contain",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 132px)",
          scrollbarWidth: "none",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* ═══ HEADER sticky liquid glass (clone Bora) ═══ */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
            paddingLeft: PAD,
            paddingRight: PAD,
            paddingBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background:
              "linear-gradient(180deg, rgba(220,236,210,.82) 0%, rgba(220,236,210,.42) 65%, transparent 100%)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              haptic("light");
              onBack();
            }}
            aria-label="Voltar"
            className="active:scale-90"
            style={{
              width: 44,
              height: 44,
              flex: "none",
              borderRadius: R.btn,
              ...pillGlass,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={19} color={INK} strokeWidth={2.1} />
          </button>

          {/* Logo oficial KIDZZ (padrão do site) */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 44,
              padding: "0 8px",
            }}
          >
            <KidzzLogo height={28} light />
          </div>

          <button
            type="button"
            onClick={() => onOpenParent?.()}
            aria-label="Pais"
            className="active:scale-90"
            style={{
              height: 44,
              flex: "none",
              borderRadius: R.btn,
              ...pillGlass,
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "0 12px",
              cursor: onOpenParent ? "pointer" : "default",
              fontWeight: 800,
              fontSize: 12.5,
              color: INK,
              fontFamily: FONT,
            }}
          >
            <Shield size={15} color={EM} strokeWidth={2.1} />
            Pais
          </button>

          <div
            style={{
              height: 44,
              flex: "none",
              borderRadius: R.btn,
              ...pillGlass,
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "0 12px",
              fontWeight: 800,
              fontSize: 12.5,
              color: INK,
            }}
          >
            <Trophy size={14} color="#C9A227" strokeWidth={2.1} />
            {pontos}
          </div>
        </div>

        {/* ═══ HERO: tipografia limpa + arte família ═══ */}
        <div style={{ position: "relative", padding: `6px ${PAD}px 18px`, minHeight: 252 }}>
          <div
            ref={heroArtRef}
            style={{
              position: "absolute",
              right: -2,
              top: 0,
              width: "52%",
              height: 228,
              willChange: "transform",
              animation: "kalm2-heroIn .75s cubic-bezier(.22,1,.36,1) both",
              pointerEvents: "none",
              borderRadius: "28px 18px 42% 24%",
              overflow: "hidden",
              boxShadow: "0 16px 34px rgba(40,70,40,.14)",
            }}
          >
            <img
              src={HERO_FAMILY}
              alt="Família e Gui, o camaleão original, na floresta"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "55% 22%",
                maskImage:
                  "linear-gradient(100deg, transparent 0%, #000 14%, #000 86%, transparent 100%), linear-gradient(180deg, #000 72%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(100deg, transparent 0%, #000 14%, #000 86%, transparent 100%), linear-gradient(180deg, #000 72%, transparent 100%)",
                WebkitMaskComposite: "source-in",
                maskComposite: "intersect",
                filter: "saturate(1.08) contrast(1.02)",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = CAMALEAO.heartSoft;
              }}
            />
            {/* Reforço: Gui original soft por cima (borda esmaecida) */}
            <img
              src={CAMALEAO.heartSoft}
              alt=""
              aria-hidden
              style={{
                position: "absolute",
                right: -6,
                bottom: -8,
                width: "78%",
                height: "92%",
                objectFit: "contain",
                objectPosition: "right bottom",
                pointerEvents: "none",
                filter: "drop-shadow(0 12px 18px rgba(30,50,20,.28))",
                ...CAMALEAO_SCENE_MASK,
              }}
            />
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 3,
              maxWidth: "50%",
              paddingTop: 10,
              paddingRight: 8,
              animation: "kalm2-cascade .6s cubic-bezier(.22,1,.36,1) .05s both",
            }}
          >
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                color: INK2,
                marginBottom: 8,
                lineHeight: 1.35,
                letterSpacing: "0.01em",
              }}
            >
              Desligue a tela, ligue a infância.
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: EM,
                marginBottom: 8,
                letterSpacing: "0.02em",
              }}
            >
              {greet}
            </div>
            <h1
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 25,
                lineHeight: 1.14,
                color: INK,
                letterSpacing: "-0.35px",
                textShadow: "0 1px 10px rgba(255,255,255,.45)",
              }}
            >
              Pequenos gestos,
              <br />
              grandes <span style={{ color: EM }}>conexões</span>.
            </h1>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 12.5,
                fontWeight: 600,
                lineHeight: 1.42,
                color: INK2,
                maxWidth: 188,
              }}
            >
              Cada escolha de hoje transforma o amanhã.
            </p>
          </div>
        </div>

        {/* ═══ 4 AÇÕES — grid 2×2 glass premium (como categorias Bora, ordem do print) ═══ */}
        <div style={sectionWrap}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              animation: "kalm2-cascade .55s cubic-bezier(.22,1,.36,1) .08s both",
            }}
          >
            {ACTIONS.map((a, idx) => {
              const Icon = a.Icon;
              return (
                <button
                  key={a.t}
                  type="button"
                  onClick={() => {
                    haptic("light");
                    go(a.view);
                  }}
                  className="active:scale-[0.97]"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    textAlign: "left",
                    padding: "14px 13px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    minHeight: 104,
                    fontFamily: FONT,
                    transition: "transform .28s cubic-bezier(.34,1.4,.64,1)",
                    animation: `kalm2-cascade .5s cubic-bezier(.22,1,.36,1) ${0.04 * idx}s both`,
                    ...coloredGlass(a.tint[0], a.tint[1], a.tint[2], 0.42, 0.14),
                  }}
                >
                  <Shine />
                  <Gloss colors={a.g}>
                    <Icon size={18} color="#fff" strokeWidth={2} />
                  </Gloss>
                  <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15, color: INK, lineHeight: 1.15 }}>
                    {a.t}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: INK2 }}>{a.sub}</div>
                  <div
                    style={{
                      alignSelf: "flex-end",
                      marginTop: "auto",
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...pillGlass,
                    }}
                  >
                    <ArrowRight size={13} color={INK} strokeWidth={2.4} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ RESPIRAR (card featured estilo Bora “atividade de hoje”) ═══ */}
        <div style={sectionWrap}>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              width: "100%",
              borderRadius: R.card,
              ...glass,
              animation: "kalm2-cascade .55s cubic-bezier(.22,1,.36,1) .12s both",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(90% 100% at 88% 45%, rgba(120,200,130,.14), transparent 55%)",
                pointerEvents: "none",
              }}
            />
            <Shine />
            <div style={{ display: "flex", minHeight: 158, position: "relative", zIndex: 2 }}>
              <div style={{ flex: 1, minWidth: 0, padding: "14px 10px 12px 14px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, letterSpacing: "1px", color: EM }}>
                    <Wind size={11} color={EM} /> RESPIRAR COM O CAMALEÃO
                  </span>
                </div>
                <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 17, color: INK, lineHeight: 1.2, marginTop: 6 }}>
                  Um respiro pequeno
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 600, lineHeight: 1.35, color: INK2, maxWidth: 170 }}>
                  Do tamanho da sua vontade. Escolha o tempo e respire com o Gui.
                </p>
                <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {([30, 60, 90] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSec(s);
                        haptic("light");
                        go("breath");
                      }}
                      className="active:scale-95"
                      style={{
                        ...pillGlass,
                        height: 34,
                        borderRadius: R.btn,
                        padding: "0 12px",
                        fontSize: 12,
                        fontWeight: 900,
                        color: INK,
                        border: sec === s ? `1.5px solid ${EM}` : pillGlass.border,
                        background:
                          sec === s
                            ? "linear-gradient(160deg, rgba(200,240,180,.95), rgba(150,210,140,.55))"
                            : pillGlass.background,
                        cursor: "pointer",
                        fontFamily: FONT,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Clock size={11} color={EM} /> {s}s
                    </button>
                  ))}
                </div>
              </div>
              <div
                style={{
                  position: "relative",
                  width: "42%",
                  flex: "none",
                  minHeight: 158,
                  borderRadius: `0 ${R.card - 2}px ${R.card - 2}px 0`,
                  overflow: "hidden",
                  margin: 4,
                  marginLeft: 0,
                }}
              >
                <img
                  src={CAMALEAO.heartSoft}
                  alt="Gui meditando"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "center 20%",
                    borderRadius: R.panel,
                    animation: "kalm2-breathe 5s ease-in-out infinite",
                    ...CAMALEAO_SCENE_MASK,
                    filter: "drop-shadow(0 10px 18px rgba(40,60,30,.22))",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = CAMALEAO.heart;
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(90deg, rgba(220,236,210,.55) 0%, transparent 28%)",
                    borderRadius: R.panel,
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══ HUMOR ═══ */}
        <div style={sectionWrap}>
          <div
            style={{
              ...glass,
              borderRadius: R.card,
              padding: "14px 14px 12px",
              animation: "kalm2-cascade .55s cubic-bezier(.22,1,.36,1) .14s both",
            }}
          >
            <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "1.2px", color: EM, marginBottom: 12 }}>
              COMO VOCÊ ESTÁ HOJE?
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
              {MOODS.map((m) => {
                const on = mood === m.v;
                return (
                  <button
                    key={m.l}
                    type="button"
                    onClick={() => setTodayMood(m.v)}
                    className="active:scale-90"
                    style={{
                      flex: 1,
                      minHeight: 64,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      borderRadius: 16,
                      cursor: "pointer",
                      transition: "transform .2s, box-shadow .2s",
                      background: on
                        ? "linear-gradient(160deg, rgba(200,240,180,.7), rgba(150,210,140,.35))"
                        : "rgba(255,255,255,.4)",
                      border: on ? `1.5px solid ${EM}` : "0.5px solid rgba(255,255,255,.65)",
                      boxShadow: on
                        ? "0 6px 14px rgba(62,154,94,.22), inset 0 1px 0 rgba(255,255,255,.75)"
                        : "inset 0 1px 0 rgba(255,255,255,.55)",
                      padding: "8px 2px",
                    }}
                  >
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{m.e}</span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: INK2, textAlign: "center" }}>{m.l}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ SUSSURRO + JARRO ═══ */}
        <div style={sectionWrap}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              animation: "kalm2-cascade .55s cubic-bezier(.22,1,.36,1) .16s both",
            }}
          >
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                padding: 13,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                ...coloredGlass(110, 180, 130, 0.4, 0.14),
              }}
            >
              <Shine />
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "1px", color: EM }}>SUSSURRO DO KIDZZ</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
                <img
                  src={CAMALEAO.headphonesSoft}
                  alt="Gui"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    objectFit: "contain",
                    flex: "none",
                    background: "rgba(255,255,255,.35)",
                    boxShadow: "0 4px 12px rgba(40,70,40,.14)",
                    ...CAMALEAO_SCENE_MASK,
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = CAMALEAO.headphones;
                  }}
                />
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: INK, lineHeight: 1.35 }}>
                  {mood > 0 && mood <= 2
                    ? "Hoje parece pesado. Que tal 1 minuto de pausa?"
                    : "Hoje vocês parecem precisar desacelerar. Que tal um som da floresta?"}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleSound}
                aria-label={soundOn ? "Pausar" : "Tocar"}
                className="active:scale-95"
                style={{
                  alignSelf: "flex-end",
                  width: 40,
                  height: 40,
                  borderRadius: R.btn,
                  border: "none",
                  cursor: "pointer",
                  background: `radial-gradient(130% 130% at 30% 22%, #C0EDA0 0%, ${EM_SOFT} 45%, ${EM} 100%)`,
                  boxShadow: "0 6px 14px rgba(46,122,74,.32), inset 0 1px 2px rgba(255,255,255,.55)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                {soundOn ? <Pause size={15} fill="#fff" /> : <Play size={15} fill="#fff" />}
              </button>
            </div>

            <div
              style={{
                position: "relative",
                overflow: "hidden",
                padding: 13,
                ...coloredGlass(230, 190, 100, 0.38, 0.12),
              }}
            >
              <Shine />
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "1px", color: "#9A7020", marginBottom: 4 }}>
                JARRO DA GRATIDÃO
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: INK2, lineHeight: 1.3, marginBottom: 8 }}>
                O que foi bom hoje?
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <img
                  src={img("jar-gratitude.png")}
                  alt=""
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "contain",
                    flex: "none",
                    filter: "drop-shadow(0 4px 12px rgba(180,130,30,.25))",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#C9A227", marginBottom: 8 }}>
                    {grat} {grat === 1 ? "estrela" : "estrelas"}
                  </div>
                  <button
                    type="button"
                    onClick={addGrat}
                    className="active:scale-95"
                    style={{ ...goldBtn, width: "100%", minHeight: 36, padding: "8px 10px", fontSize: 12 }}
                  >
                    <Plus size={13} strokeWidth={2.4} /> Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TERMÔMETRO · COLEÇÃO · RESUMO ═══ */}
        <div style={sectionWrap}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.15fr 1fr 1fr",
              gap: 10,
              animation: "kalm2-cascade .55s cubic-bezier(.22,1,.36,1) .18s both",
            }}
          >
            <div style={{ ...glass, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "1px", color: EM, marginBottom: 8 }}>
                TERMÔMETRO
              </div>
              {thermo.rows.map(([lab, pct, col]) => (
                <div key={lab} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 800, color: INK2 }}>
                    <span>{lab}</span>
                    <span>{pct}%</span>
                  </div>
                  <div
                    style={{
                      height: 5,
                      borderRadius: 99,
                      background: "rgba(30,50,30,.08)",
                      overflow: "hidden",
                      marginTop: 3,
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,.05)",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        borderRadius: 99,
                        background: `linear-gradient(90deg, ${col}bb, ${col})`,
                        boxShadow: `0 0 6px ${col}55`,
                      }}
                    />
                  </div>
                </div>
              ))}
              <div style={{ textAlign: "center", marginTop: 6 }}>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, color: EM, lineHeight: 1 }}>{thermo.avg}%</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: INK2 }}>
                  {thermo.avg >= 70 ? "Muito bom!" : "No caminho"}
                </div>
              </div>
            </div>

            <div style={{ ...glassSoft, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "1px", color: EM, marginBottom: 4 }}>COLEÇÃO</div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: INK2, marginBottom: 8, lineHeight: 1.25 }}>
                Conquistas suaves
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                {BADGES.map((b) => {
                  const on = streak.count >= b.n || grat >= b.n || wins >= b.n;
                  return (
                    <div
                      key={b.e}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 16,
                        opacity: on ? 1 : 0.38,
                        ...coloredGlass(140, 190, 130, on ? 0.42 : 0.1, on ? 0.14 : 0.05, { radius: 12 }),
                      }}
                    >
                      {b.e}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ ...glass, padding: 12, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "1px", color: EM, marginBottom: 4 }}>RESUMO</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: INK, lineHeight: 1.35, flex: 1 }}>
                {wins} vitórias · {grat} no jarro
                {streak.count > 0 ? ` · ${streak.count}d` : ""}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, gap: 6 }}>
                <img src={CAMALEAO.heartSoft} alt="" style={{ width: 40, height: 40, objectFit: "contain", ...CAMALEAO_SCENE_MASK }} />
                <button
                  type="button"
                  onClick={share}
                  className="active:scale-95"
                  style={{
                    ...pillGlass,
                    minHeight: 34,
                    borderRadius: R.btn,
                    padding: "6px 10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontWeight: 900,
                    fontSize: 11,
                    color: EM,
                    cursor: "pointer",
                    fontFamily: FONT,
                  }}
                >
                  <Share2 size={12} /> Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RITUAIS (horizontal, gloss — craft Bora cats) ═══ */}
        <div style={{ marginBottom: GAP + 2 }}>
          <div style={{ padding: `0 ${PAD}px` }}>
            <SectionLabel kicker="Pequenos rituais +">Cada toque conta como um dia de calma.</SectionLabel>
          </div>
          <div
            className="kalm2-hscroll"
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              padding: `2px ${PAD}px 4px`,
              scrollbarWidth: "none",
            }}
          >
            {RITUALS.map((r, idx) => {
              const Icon = r.Icon;
              return (
                <button
                  key={r.t}
                  type="button"
                  onClick={() => {
                    haptic("light");
                    go(r.view);
                  }}
                  className="active:scale-95"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    flex: "none",
                    width: 108,
                    minHeight: 120,
                    padding: "12px 10px 10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 7,
                    cursor: "pointer",
                    textAlign: "center",
                    fontFamily: FONT,
                    animation: `kalm2-cascade .45s cubic-bezier(.22,1,.36,1) ${0.03 * idx}s both`,
                    ...coloredGlass(r.tint[0], r.tint[1], r.tint[2], 0.4, 0.14),
                  }}
                >
                  <Shine />
                  <Gloss colors={r.g} size={42}>
                    <Icon size={18} color="#fff" strokeWidth={1.9} />
                  </Gloss>
                  <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 12.5, color: INK, lineHeight: 1.15 }}>
                    {r.t}
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: INK2 }}>{r.s}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ MUNDO REAL ═══ */}
        <div style={{ marginBottom: GAP }}>
          <div style={{ padding: `0 ${PAD}px` }}>
            <SectionLabel
              kicker="Mundo real"
              right={
                <button
                  type="button"
                  onClick={() => go("realworld")}
                  style={{
                    background: "none",
                    border: "none",
                    fontWeight: 900,
                    fontSize: 12.5,
                    color: EM,
                    cursor: "pointer",
                    fontFamily: FONT,
                    padding: "8px 0",
                    minHeight: 44,
                  }}
                >
                  Ver todas →
                </button>
              }
            >
              Experiências em família
            </SectionLabel>
          </div>
          <div
            className="kalm2-hscroll"
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              padding: `2px ${PAD}px 8px`,
              scrollbarWidth: "none",
            }}
          >
            {REAL.map((r) => (
              <button
                key={r.t}
                type="button"
                onClick={() => {
                  haptic("light");
                  go("realworld");
                }}
                className="active:scale-[0.98]"
                style={{
                  flex: "none",
                  width: 168,
                  borderRadius: R.card,
                  overflow: "hidden",
                  border: "0.5px solid rgba(255,255,255,.88)",
                  boxShadow: "0 12px 28px rgba(40,60,40,.16), 0 1px 0 rgba(255,255,255,.7) inset",
                  padding: 0,
                  cursor: "pointer",
                  background: "#1a2a18",
                  textAlign: "left",
                }}
              >
                <div style={{ height: 108, position: "relative" }}>
                  <img src={r.img} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, transparent 28%, rgba(12,20,12,.9))",
                    }}
                  />
                  <div style={{ position: "absolute", left: 10, right: 10, bottom: 10 }}>
                    <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 13, color: "#FFF8EE", lineHeight: 1.15 }}>
                      {r.t}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        marginTop: 3,
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: "rgba(255,255,255,.75)",
                      }}
                    >
                      <MapPin size={10} /> {r.c}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: `6px ${PAD}px 20px`,
            textAlign: "center",
            fontSize: 11.5,
            fontWeight: 800,
            color: "rgba(60,90,60,.5)",
          }}
        >
          KALM by KIDZZ · Seu espaço de calma em família
        </div>
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 118px)",
            display: "flex",
            justifyContent: "center",
            zIndex: 60,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              ...pillGlass,
              padding: "10px 18px",
              borderRadius: R.btn,
              background: "rgba(27,48,31,.92)",
              color: "#F4F8F0",
              fontSize: 12.5,
              fontWeight: 800,
              border: "0.5px solid rgba(255,255,255,.12)",
              boxShadow: "0 12px 28px rgba(27,48,31,.4)",
            }}
          >
            {toast}
          </div>
        </div>
      )}
    </div>
  );
};

export default KalmPremiumHome;

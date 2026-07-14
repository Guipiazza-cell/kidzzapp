import { useEffect, useMemo, useRef, useState, useCallback, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Wind, Heart, Sparkles, Play, Pause, Timer, X,
  Sun, Coffee, Flower2, Music2, BookOpen, Trees, Waves,
  MapPin, Star, ChevronRight, LifeBuoy, HandHeart, Smile,
  Sunrise, Moon as MoonIcon, Lock, Zap, Clapperboard,
} from "lucide-react";
import { haptic } from "@/lib/haptics";
import { AmbientSoundEngine } from "@/components/dreams/AmbientSoundEngine";
import { useAuth } from "@/contexts/AuthContext";
import wellnessMascot from "@/assets/kidzz/wellness.webp";
import WellnessCinema from "./WellnessCinema";
import WellnessGrowth from "./WellnessGrowth";
import KalmSections from "@/components/kalm/KalmSections";
import KidzzHeader from "@/components/common/KidzzHeader";
import { pickFemaleVoice, SOFT_RATE, SOFT_PITCH, SOFT_VOLUME } from "@/lib/ttsVoice";

/* ── KIDZZ Wellness — "Spa Emocional da Apple" v2
   Paleta sálvia + esmeralda + creme + dourado fosco.
   Hero cinematográfico, camaleão respirando, frases rotativas,
   4 ações rápidas (Relaxar / Ritual / SOS / Dormir), biblioteca
   de sons expandida e área Dormir premium.
*/

interface Props { onBack: () => void; initialExperienceId?: string | null; onConsumedInitial?: () => void; }

type View =
  | "home"
  | "sos"
  | "breath"
  | "meditation"
  | "sounds"
  | "mindful"
  | "pause"
  | "routine"
  | "realworld"
  | "journey"
  | "sleep"
  | "family";


/* ────────────── Design tokens (sage + emerald spa) ────────────── */
const ink = "#27302A";        // primary text (warm dark green-grey)
const inkSoft = "#5A6660";    // secondary text
const ivory = "#F7F4EC";      // base bg (warm cream)
const sand = "#EFE9DC";       // warm neutral
const sage = "#9CB39A";       // sage accent
const emerald = "#5A8F77";    // emerald premium
const serenity = "#BCCCD8";   // serenity blue
const pearl = "#E8E4DC";      // pearl
const clay = "#C9A48A";       // warm clay accent
const gold = "#C9A84C";       // matte gold (premium)
const lilac = "#CFC4E0";      // discreet lilac

const surface = "rgba(255,255,255,0.68)";
const stroke = "rgba(39,48,42,0.08)";

/* ────────────── Shared atoms ────────────── */
const Surface = ({ children, className = "", onClick, style }: any) => (
  <div
    onClick={onClick}
    className={`rounded-[28px] ${className}`}
    style={{
      background: surface,
      border: `1px solid ${stroke}`,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 30px -18px rgba(43,47,54,0.18)",
      ...style,
    }}
  >
    {children}
  </div>
);

const Eyebrow = ({ children }: any) => (
  <div
    className="text-[11px] font-semibold tracking-[0.18em] uppercase"
    style={{ color: inkSoft }}
  >
    {children}
  </div>
);

const SectionTitle = ({ kicker, title, sub }: any) => (
  <div className="px-5 pt-8 pb-3">
    {kicker && <Eyebrow>{kicker}</Eyebrow>}
    <h2 className="mt-1 text-[22px] leading-tight font-semibold" style={{ color: ink, letterSpacing: "-0.01em" }}>
      {title}
    </h2>
    {sub && <p className="mt-1 text-[14px]" style={{ color: inkSoft }}>{sub}</p>}
  </div>
);

const tapSpring = { type: "spring" as const, stiffness: 380, damping: 28, mass: 0.6 };

/* ────────────── Data ────────────── */
const DAILY = [
  { id: "meditation", view: "meditation" as View, label: "Meditação guiada", time: "5 min", icon: Flower2, tint: sage },
  { id: "breath",     view: "breath"     as View, label: "Respiração 4·4·6", time: "3 min", icon: Wind,    tint: serenity },
  { id: "family",     view: "family"     as View, label: "Wellness família", time: "Juntos", icon: HandHeart, tint: emerald },
  { id: "sounds",     view: "sounds"     as View, label: "Sons da natureza", time: "Loop",  icon: Waves,   tint: serenity },
  { id: "mindful",    view: "mindful"    as View, label: "Mini mindfulness", time: "2 min", icon: Sparkles,tint: clay },
  { id: "pause",      view: "pause"      as View, label: "Pausa do dia",     time: "1 min", icon: Coffee,  tint: clay },
  { id: "routine",    view: "routine"    as View, label: "Rotina calma",     time: "Hoje",  icon: Sun,     tint: sage },
];


const REAL_WORLD = [
  {
    id: "spa-jardim",
    title: "Spa Jardim das Cerejeiras",
    city: "São Paulo · Jardins",
    tag: "Massagem em família",
    img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=70",
  },
  {
    id: "lounge-luz",
    title: "Lounge Sensorial Casa Luz",
    city: "Rio de Janeiro · Leblon",
    tag: "Experiência kids friendly",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=70",
  },
  {
    id: "cafe-silencio",
    title: "Café Silêncio",
    city: "Curitiba · Batel",
    tag: "Café tranquilo, sem telas",
    img: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=70",
  },
  {
    id: "retiro-anavilhanas",
    title: "Retiro Anavilhanas",
    city: "Amazonas · Novo Airão",
    tag: "Floresta + bem-estar família",
    img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=70",
  },
];

/* ────────────── Streak + Mood (localStorage) ────────────── */
const STREAK_KEY = "kidzz_wellness_streak";
const MOOD_KEY = "kidzz_wellness_mood";
const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);

const useWellnessStreak = () => {
  const [streak, setStreak] = useState<{ count: number; last: string | null }>(() => {
    try {
      const raw = localStorage.getItem(STREAK_KEY);
      return raw ? JSON.parse(raw) : { count: 0, last: null };
    } catch { return { count: 0, last: null }; }
  });
  const completeToday = useCallback(() => {
    const today = dayKey();
    setStreak((s) => {
      if (s.last === today) return s;
      const y = new Date(); y.setDate(y.getDate() - 1);
      const isConsec = s.last === dayKey(y);
      const next = { count: isConsec ? s.count + 1 : 1, last: today };
      try { localStorage.setItem(STREAK_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  return { streak, completeToday };
};

const useMoodWeek = () => {
  const [week, setWeek] = useState<{ d: string; v: number; date: string }[]>(() => {
    const days = ["D", "S", "T", "Q", "Q", "S", "S"];
    try {
      const raw = localStorage.getItem(MOOD_KEY);
      const stored = raw ? JSON.parse(raw) : {};
      const out: { d: string; v: number; date: string }[] = [];
      for (let i = 6; i >= 0; i--) {
        const dt = new Date(); dt.setDate(dt.getDate() - i);
        const k = dayKey(dt);
        out.push({ d: days[dt.getDay()], v: stored[k] ?? 0, date: k });
      }
      return out;
    } catch {
      return days.map((d) => ({ d, v: 0, date: "" }));
    }
  });
  const setToday = useCallback((v: number) => {
    const today = dayKey();
    try {
      const raw = localStorage.getItem(MOOD_KEY);
      const stored = raw ? JSON.parse(raw) : {};
      stored[today] = v;
      localStorage.setItem(MOOD_KEY, JSON.stringify(stored));
    } catch {}
    setWeek((w) => w.map((x) => x.date === today ? { ...x, v } : x));
  }, []);
  const todayValue = week[week.length - 1]?.v ?? 0;
  return { week, setToday, todayValue };
};


/* ────────────── Breathing engine (reused inside Breath + SOS) ────────────── */
const useBreath = (active: boolean) => {
  const seq = useMemo(
    () => [
      { p: "Inspire", ms: 4000, scale: 1.45 },
      { p: "Segure", ms: 4000, scale: 1.45 },
      { p: "Expire", ms: 6000, scale: 1.0 },
    ],
    []
  );
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) { setI(0); return; }
    const t = setTimeout(() => setI((i + 1) % seq.length), seq[i].ms);
    return () => clearTimeout(t);
  }, [active, i, seq]);
  return { phase: seq[i], step: i };
};

/* ────────────── Atmosphere (daylight + floating particles) ────────────── */
const Atmosphere = () => (
  <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden>
    <div
      className="absolute inset-0"
      style={{
        background:
          `radial-gradient(120% 80% at 50% -10%, ${sand} 0%, ${ivory} 55%, ${ivory} 100%)`,
      }}
    />
    {/* Sage glow top-left */}
    <div
      className="absolute -top-32 -left-24 w-[70vw] h-[70vw] rounded-full opacity-60"
      style={{ background: `radial-gradient(circle, ${sage}55, transparent 65%)`, filter: "blur(60px)" }}
    />
    {/* Emerald glow bottom-right */}
    <div
      className="absolute -bottom-40 -right-32 w-[80vw] h-[80vw] rounded-full opacity-50"
      style={{ background: `radial-gradient(circle, ${emerald}55, transparent 60%)`, filter: "blur(70px)" }}
    />
    {/* Lilac veil center */}
    <div
      className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[90vw] h-[40vh] rounded-full opacity-30"
      style={{ background: `radial-gradient(ellipse, ${lilac}66, transparent 70%)`, filter: "blur(80px)" }}
    />
    {/* Soft floating particles — pure CSS for perf */}
    {[...Array(6)].map((_, i) => (
      <span
        key={i}
        className="absolute rounded-full"
        style={{
          width: 3 + (i % 3),
          height: 3 + (i % 3),
          background: i % 2 ? `${gold}88` : `${sage}99`,
          boxShadow: `0 0 8px ${i % 2 ? gold : sage}66`,
          top: `${15 + (i * 13) % 70}%`,
          left: `${8 + (i * 17) % 84}%`,
          animation: `firefly-float-${i % 2 === 0 ? "a" : "b"} ${10 + i * 1.4}s ease-in-out ${i * 0.7}s infinite`,
          opacity: 0.4,
        }}
      />
    ))}
  </div>
);

/* ────────────── Top bar ────────────── */
const TopBar = ({ title, onBack, right }: any) => (
  <div className="px-3 pt-3 pb-2 flex items-center gap-2">
    <button
      onClick={() => { haptic("light"); onBack(); }}
      className="glass-island w-11 h-11 rounded-full flex items-center justify-center"
      aria-label="Voltar"
    >
      <ArrowLeft size={18} style={{ color: ink }} />
    </button>
    <div
      className="glass-island flex-1 min-w-0 text-center text-[14px] font-bold px-3.5 py-2 rounded-full truncate font-ui"
      style={{ color: ink }}
    >
      {title}
    </div>
    <div className="w-11 h-11 flex items-center justify-center">{right}</div>
  </div>
);

/* ────────────── Hero — camaleão respirando + frases rotativas ────────────── */
const HERO_PHRASES = [
  "Hoje é um bom dia para respirar.",
  "Seu momento de calma começa agora.",
  "Vamos desacelerar juntos?",
  "Um respiro, um abraço, um instante.",
];

const HeroBlock = ({ go }: { go: (v: View) => void }) => {
  const [phrase, setPhrase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhrase((p) => (p + 1) % HERO_PHRASES.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative px-5 pt-2 pb-5">
      {/* Backdrop oval glow behind chameleon */}
      <div className="relative flex flex-col items-center">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[260px] h-[180px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(ellipse, ${emerald}33, transparent 65%)`, filter: "blur(30px)" }}
          animate={{ opacity: [0.55, 0.85, 0.55], scale: [1, 1.06, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="relative -mb-2 pointer-events-auto w-40 h-40 flex items-center justify-center"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src={wellnessMascot}
            alt="KIDZZ Wellness"
            className="w-full h-full object-contain drop-shadow-2xl select-none pointer-events-none"
            draggable={false}
            decoding="async"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.p
            key={phrase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2 text-center text-[19px] font-medium leading-snug max-w-[280px]"
            style={{ color: ink, letterSpacing: "-0.01em" }}
          >
            {HERO_PHRASES[phrase]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* 4 ações rápidas — chips premium */}
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {[
          { v: "breath" as View, label: "Relaxar agora", icon: Wind, tint: sage },
          { v: "mindful" as View, label: "Ritual rápido", icon: Sparkles, tint: clay },
          { v: "sos" as View, label: "SOS emocional", icon: LifeBuoy, tint: emerald },
          { v: "sleep" as View, label: "Dormir melhor", icon: MoonIcon, tint: lilac },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <motion.button
              key={c.v}
              whileTap={{ scale: 0.96 }}
              transition={tapSpring}
              onClick={() => { haptic("light"); go(c.v); }}
              className="min-h-[58px] rounded-2xl flex items-center gap-2.5 px-3.5 text-left"
              style={{
                background: surface,
                border: `1px solid ${stroke}`,
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                boxShadow: "0 8px 24px -16px rgba(39,48,42,0.18)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${c.tint}33` }}
              >
                <Icon size={17} style={{ color: ink }} strokeWidth={1.8} />
              </div>
              <span className="text-[13px] font-semibold leading-tight" style={{ color: ink }}>
                {c.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

/* ────────────── HOME ────────────── */
/* ═════════ KALM redesign — helpers de estilo do design (KALM.dc.html) ═════════ */
type KTint = [number, number, number];
type KGloss = [string, string, string];

const KALM_KEYFRAMES = `
@keyframes kalm-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes kalm-toastin{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes kalm-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.055)}}
@keyframes kalm-floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes kalm-drift1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,24px) scale(1.16)}}
@keyframes kalm-drift2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-36px,-20px) scale(1.1)}}
@keyframes kalm-sparklefloat{0%,100%{opacity:.1;transform:translateY(0) scale(.7)}50%{opacity:.9;transform:translateY(-14px) scale(1.12)}}
@keyframes kalm-shine{0%{transform:translateX(-130%) skewX(-18deg)}60%,100%{transform:translateX(240%) skewX(-18deg)}}
@keyframes kalm-cascade{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
@keyframes kalm-heroIn{from{opacity:0;transform:translateY(-14px) scale(1.04)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes kalm-eq{0%,100%{height:28%}50%{height:100%}}
@media (prefers-reduced-motion: reduce){.kalm-root *{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
`;

/* SVG paths (idênticos ao design) */
const KD = {
  wind: "M3 8h10a2.5 2.5 0 1 0-2.5-2.5M3 12h14a2.5 2.5 0 1 1-2.5 2.5M3 16h8a2 2 0 1 1-2 2",
  sparkle: "M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8L12 4Zm7-1 .7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z",
  sos: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5m0 3h.01",
  moon: "M20 13.5A8 8 0 0 1 10.5 4 8 8 0 1 0 20 13.5Z",
  bubbles: "M8 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-3a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm1.5 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  leaf: "M5 19C5 10 12 5 20 5c0 8-5 15-14 15Zm0 0c3-5 7-9 12-11",
  heart: "M12 20.3l-7.1-6.9a4.6 4.6 0 0 1 6.4-6.5l.7.7.7-.7a4.6 4.6 0 0 1 6.4 6.5Z",
  rain: "M7 16a5 5 0 0 1 .3-9.9 6 6 0 0 1 11.6 1.4A4 4 0 0 1 18 16M8 19l-1 2m5-2-1 2m5-2-1 2",
  waves: "M3 13c2 0 2-2 4.5-2s2.5 2 4.5 2 2-2 4.5-2 2.5 2 4.5 2M3 17.5c2 0 2-2 4.5-2s2.5 2 4.5 2 2-2 4.5-2 2.5 2 4.5 2",
  fire: "M12 3c1 3-1 4-1 6a3 3 0 0 0 6 0c0-1 .5-2 .5-2 1 2 1.5 3.5 1.5 5a6 6 0 1 1-12 0c0-3 2-5 3-7 .8-1.5 2-3 2-5Z",
  shield: "M12 3l7 2.5V11c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V5.5Z",
};

const kalmGlass = (r: number, g: number, b: number, aT = 0.4, aB = 0.14): CSSProperties => ({
  background: `linear-gradient(155deg, rgba(255,255,255,.9) 0%, rgba(${r},${g},${b},${aT}) 30%, rgba(${r},${g},${b},${aB}) 85%, rgba(255,255,255,.6) 100%)`,
  backdropFilter: "blur(18px) saturate(160%)", WebkitBackdropFilter: "blur(18px) saturate(160%)",
  border: "1px solid rgba(255,255,255,1)",
  boxShadow: `0 12px 26px rgba(50,90,50,.14), inset 0 1.5px 0 rgba(255,255,255,1), inset 0 -8px 16px rgba(${r},${g},${b},.1)`,
});
const kalmGloss = (l: string, m: string, d: string, size = 42, radius = 14): CSSProperties => ({
  flex: "none", width: size, height: size, borderRadius: radius, display: "flex", alignItems: "center", justifyContent: "center",
  background: `radial-gradient(130% 130% at 30% 22%, #FFFFFF 0%, ${l} 16%, ${m} 55%, ${d} 100%)`,
  boxShadow: "0 7px 15px rgba(50,90,50,.3), inset 0 2px 3px rgba(255,255,255,.7), inset 0 -5px 10px rgba(0,0,0,.2)",
});
const KalmIcon = ({ d, stroke = "#fff", size = 21, sw = 1.8 }: { d: string; stroke?: string; size?: number; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Ações rápidas → views reais */
const KALM_ACTIONS: { key: string; title: string; sub: string; d: string; t: KTint; g: KGloss; view: View }[] = [
  { key: "a1", title: "Relaxar agora", sub: "Respiração guiada",  d: KD.wind,    t: [95, 180, 120],  g: ["#B8E8C0", "#5CB57A", "#2F7A4E"], view: "breath" },
  { key: "a2", title: "Ritual rápido", sub: "2 minutos de calma",  d: KD.sparkle, t: [200, 180, 120], g: ["#FFE9B8", "#E0B85C", "#B08A2E"], view: "mindful" },
  { key: "a3", title: "SOS emocional", sub: "Acolhimento agora",   d: KD.sos,     t: [210, 150, 150], g: ["#F0C8C8", "#D87A7A", "#A84E4E"], view: "sos" },
  { key: "a4", title: "Dormir melhor", sub: "Prepare a noite",     d: KD.moon,    t: [160, 160, 220], g: ["#D2CCF0", "#8A7AD8", "#5E4EA8"], view: "sleep" },
];

/* Quick Relief → views reais */
const KALM_PAUSAS: { key: string; title: string; sub: string; min: string; d: string; t: KTint; g: KGloss; view: View }[] = [
  { key: "p1", title: "Pausa de 1 minuto",   sub: "Um respiro guiado, simples e curto.",     min: "1 min", d: KD.bubbles, t: [95, 180, 120],  g: ["#B8E8C0", "#5CB57A", "#2F7A4E"], view: "pause" },
  { key: "p2", title: "Respirar com o vento", sub: "Inspira 4 · solta 6. Cinco ciclos lentos.", min: "3 min", d: KD.leaf,   t: [120, 200, 150], g: ["#C0EDC8", "#6FBE7A", "#3F8A4E"], view: "breath" },
  { key: "p3", title: "Aterrissar no corpo",  sub: "Cinco sentidos, um de cada vez.",         min: "4 min", d: KD.heart,   t: [200, 180, 120], g: ["#FFE9B8", "#E0B85C", "#B08A2E"], view: "mindful" },
];

/* Humor: faces do design → valor 1..5 (useMoodWeek) */
const KALM_MOOD: { value: number; mouth: string; fill: string }[] = [
  { value: 1, mouth: "M14 26c1.5-2 4-2 6-2s4.5 0 6 2", fill: "#F2C94C" },
  { value: 2, mouth: "M14 25h12", fill: "#F2C94C" },
  { value: 3, mouth: "M14.5 24c1.5 1.5 4 2.2 5.5 2.2s4-.7 5.5-2.2", fill: "#F2C94C" },
  { value: 4, mouth: "M14 23.5c1.5 2.5 4.2 3.5 6 3.5s4.5-1 6-3.5", fill: "#F0B93E" },
  { value: 5, mouth: "M13.5 23c1.8 3.2 4.7 4.4 6.5 4.4s4.7-1.2 6.5-4.4", fill: "#F0A62E" },
];

/* Soundscapes → engine de som real (mesmos endpoints do SOUND_LIST) */
type KalmSoundscape = { key: string; title: string; sub: string; grad: [string, string]; d: string; url: string; premium?: boolean };
const KALM_SOUNDSCAPES: KalmSoundscape[] = [
  { key: "forest", title: "Floresta ao amanhecer", sub: "Pássaros e folhas", grad: ["#4C8A5A", "#274E32"], d: KD.leaf,  url: "https://cdn.pixabay.com/audio/2022/03/10/audio_270f49c32b.mp3" },
  { key: "rain",   title: "Chuva leve",            sub: "Telhado e vidro",   grad: ["#5A7FA8", "#2E4A66"], d: KD.rain,  url: "https://cdn.pixabay.com/audio/2022/03/10/audio_1648d7e3cd.mp3" },
  { key: "ocean",  title: "Ondas do mar",          sub: "Maré calma",        grad: ["#3E8FA0", "#1C5464"], d: KD.waves, url: "https://cdn.pixabay.com/audio/2021/09/06/audio_e1b0956a16.mp3" },
  { key: "white",  title: "Noite estrelada",       sub: "Grilos e brisa",    grad: ["#5E5AA8", "#2E2A64"], d: KD.moon,  url: "https://cdn.pixabay.com/audio/2021/08/09/audio_dc39bfefcb.mp3" },
  { key: "fire",   title: "Lareira",               sub: "Crepitar quente",   grad: ["#C0894C", "#84532A"], d: KD.fire,  url: "/audio/rain-soft.mp3", premium: true },
];

const Home = ({ go, onBack, initialExperienceId, onConsumedInitial }: { go: (v: View) => void; onBack: () => void; initialExperienceId?: string | null; onConsumedInitial?: () => void }) => {
  const h = new Date().getHours();
  const saudacaoCaps = h < 12 ? "BOM DIA" : h < 18 ? "BOA TARDE" : "BOA NOITE";
  const { streak } = useWellnessStreak();
  const { setToday, todayValue } = useMoodWeek();

  // Parallax cinematográfico do hero (fiel ao onScrollFrame do design):
  // ao rolar, o hero recua, escala levemente e desaparece. Auto-detecta o
  // container de scroll; degrada sem quebrar se não encontrar.
  const heroWrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = heroWrapRef.current;
    if (!el) return;
    let scroller: HTMLElement | Window = window;
    let p = el.parentElement;
    while (p) {
      const oy = getComputedStyle(p).overflowY;
      if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight + 4) { scroller = p; break; }
      p = p.parentElement;
    }
    let raf = 0;
    const apply = () => {
      raf = 0;
      const y = scroller === window ? window.scrollY : (scroller as HTMLElement).scrollTop;
      el.style.transform = `translateY(${y * 0.4}px) scale(${1 + y * 0.0004})`;
      el.style.opacity = String(Math.max(0, 1 - y / 250));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    (scroller as any).addEventListener("scroll", onScroll, { passive: true });
    return () => {
      (scroller as any).removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Soundscapes inline (engine real) + toast local (feedback do design)
  const engineRef = useRef<AmbientSoundEngine | null>(null);
  const [soundOn, setSoundOn] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const toastT = useRef<number | null>(null);
  const showToast = useCallback((msg: string) => {
    if (toastT.current) window.clearTimeout(toastT.current);
    setToast(msg);
    toastT.current = window.setTimeout(() => setToast(""), 1900);
  }, []);
  useEffect(() => {
    engineRef.current = new AmbientSoundEngine();
    return () => {
      engineRef.current?.stopAll?.();
      if (toastT.current) window.clearTimeout(toastT.current);
    };
  }, []);

  const toggleSound = (sc: KalmSoundscape) => {
    if (sc.premium) {
      haptic("medium");
      window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context: "wellness_sound" } }));
      return;
    }
    haptic("light");
    const engine = engineRef.current as any;
    if (soundOn === sc.key) {
      engine?.stop?.(sc.key);
      setSoundOn(null);
      showToast("Som pausado");
    } else {
      engine?.stopAll?.();
      engine?.start?.(sc.key, sc.url, 0.5);
      setSoundOn(sc.key);
      showToast(`Tocando “${sc.title}” · modo calmo`);
    }
  };

  const whisper = todayValue <= 2 && todayValue > 0
    ? "Hoje parece pesado. Que tal 1 minuto de pausa?"
    : "Hoje vocês parecem precisar desacelerar. Que tal um som da floresta?";

  return (
    <div className="kalm-root" style={{ position: "relative", overflow: "hidden", fontFamily: "'Nunito',system-ui,sans-serif", background: "linear-gradient(180deg,#EEF4E9 0%,#E4EEDD 42%,#D8E6CF 75%,#CBDCC0 100%)" }}>
      <style>{KALM_KEYFRAMES}</style>

      {/* Atmosfera verde do design */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(45% 30% at 50% 20%,rgba(120,190,130,.16),transparent 70%),radial-gradient(42% 28% at 12% 60%,rgba(150,210,150,.14),transparent 70%),radial-gradient(50% 30% at 80% 88%,rgba(90,160,110,.12),transparent 70%)" }} />
      <div style={{ position: "absolute", top: -50, left: -70, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(140,205,140,.26),transparent 65%)", filter: "blur(30px)", animation: "kalm-drift1 15s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 110, right: -90, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(110,180,120,.22),transparent 65%)", filter: "blur(32px)", animation: "kalm-drift2 18s ease-in-out 3s infinite", pointerEvents: "none" }} />

      <div style={{ position: "relative" }}>
        {/* ── HERO cinematográfico (cena-kalm) ── */}
        <div style={{ position: "relative" }} data-screen-label="Hero KALM">
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 414, backgroundImage: "url('/exemplos/assets/cena-kalm.png')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(46px) saturate(1.45)", opacity: 0.5, transform: "scale(1.22)", pointerEvents: "none" }} />
          <div ref={heroWrapRef} style={{ position: "relative", width: "100%", height: 414, willChange: "transform, opacity", WebkitMaskImage: "radial-gradient(125% 94% at 50% 22%,#000 50%,rgba(0,0,0,.42) 74%,transparent 100%)", maskImage: "radial-gradient(125% 94% at 50% 22%,#000 50%,rgba(0,0,0,.42) 74%,transparent 100%)", animation: "kalm-heroIn .7s cubic-bezier(.22,1,.36,1) both" }}>
            <img src="/exemplos/assets/cena-kalm.png" alt="Gui, o camaleão, na floresta" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 34%", animation: "kalm-floaty 7s ease-in-out infinite", filter: "saturate(1.08) contrast(1.02)" }} />
            <div style={{ position: "absolute", top: 44, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,240,180,.35),transparent 66%)", animation: "kalm-breathe 5s ease-in-out infinite" }} />
            </div>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(180deg,rgba(238,244,233,.14) 0%,rgba(238,244,233,0) 30%,rgba(40,60,40,.05) 62%,rgba(238,244,233,.86) 90%,#EEF4E9 100%)" }} />
          </div>
          <div style={{ position: "absolute", top: 56, left: "52%", width: 5, height: 5, borderRadius: 99, background: "#D6F0B8", boxShadow: "0 0 9px 3px rgba(150,210,120,.7)", animation: "kalm-sparklefloat 4.4s ease-in-out 1s infinite" }} />

          <button onClick={() => { haptic("light"); onBack(); }} className="active:scale-90" aria-label="Voltar" style={{ position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 16px)", left: 16, width: 42, height: 42, borderRadius: 999, cursor: "pointer", background: "rgba(255,255,255,.62)", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)", border: "1px solid rgba(255,255,255,1)", boxShadow: "0 6px 16px rgba(50,90,50,.16),inset 0 1px 0 rgba(255,255,255,1)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .2s", zIndex: 6 }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M19 12H5m6-6-6 6 6 6" stroke="#1F3A25" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>

          {streak.count > 0 && (
            <div style={{ position: "absolute", top: "calc(env(safe-area-inset-top, 0px) + 16px)", right: 16, display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 999, background: "rgba(255,255,255,.62)", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)", border: "1px solid rgba(255,255,255,1)", boxShadow: "0 6px 16px rgba(50,90,50,.16),inset 0 1px 0 rgba(255,255,255,1)", fontWeight: 800, fontSize: 13, color: "#1F3A25", zIndex: 6 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d={KD.shield} stroke="#3E9A5E" strokeWidth="2" strokeLinejoin="round" /></svg>
              {streak.count} {streak.count === 1 ? "dia" : "dias"}
            </div>
          )}

          <div style={{ padding: "2px 20px", textAlign: "center", animation: "kalm-cascade .6s cubic-bezier(.22,1,.36,1) .06s both", position: "relative" }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "1.8px", color: "#5E8A5E", marginBottom: 8 }}>{saudacaoCaps}, FAMÍLIA</div>
            <h1 style={{ margin: "0 auto", fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 24, lineHeight: 1.2, color: "#1B301F", letterSpacing: "-.2px", maxWidth: 280 }}>Hoje é um bom dia para <span style={{ color: "#3E9A5E" }}>respirar</span>.</h1>
          </div>
        </div>

        {/* ── Ações rápidas ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, padding: "18px 16px 0", animation: "kalm-cascade .6s cubic-bezier(.22,1,.36,1) .14s both" }} data-screen-label="Ações rápidas">
          {KALM_ACTIONS.map((a) => (
            <button key={a.key} onClick={() => { haptic("light"); go(a.view); }} className="active:scale-95" style={{ position: "relative", overflow: "hidden", borderRadius: 22, padding: "13px 13px 12px", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, transition: "transform .3s cubic-bezier(.34,1.4,.64,1)", fontFamily: "'Nunito',sans-serif", ...kalmGlass(a.t[0], a.t[1], a.t[2], 0.4, 0.14) }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "55%", height: "100%", pointerEvents: "none", background: "linear-gradient(105deg,transparent 0%,rgba(255,255,255,.3) 50%,transparent 100%)", animation: "kalm-shine 6s ease-in-out infinite" }} />
              <div style={kalmGloss(a.g[0], a.g[1], a.g[2])}><KalmIcon d={a.d} /></div>
              <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 15, color: "#1B301F", lineHeight: 1.15 }}>{a.title}</div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: "#5E7A5E" }}>{a.sub}</div>
            </button>
          ))}
        </div>

        {/* ── Humor (useMoodWeek) ── */}
        <div style={{ padding: "20px 16px 0", animation: "kalm-cascade .6s cubic-bezier(.22,1,.36,1) .2s both" }} data-screen-label="Humor">
          <div style={{ borderRadius: 24, padding: "15px 15px 16px", background: "linear-gradient(155deg,rgba(255,255,255,.85),rgba(232,240,225,.6))", backdropFilter: "blur(18px) saturate(150%)", WebkitBackdropFilter: "blur(18px) saturate(150%)", border: "1px solid rgba(255,255,255,1)", boxShadow: "0 12px 26px rgba(50,90,50,.12),inset 0 1.5px 0 rgba(255,255,255,1)" }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "1.4px", color: "#5E7A5E", marginBottom: 13 }}>{todayValue > 0 ? "HOJE VOCÊ ESTÁ" : "COMO VOCÊ ESTÁ HOJE?"}</div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              {KALM_MOOD.map((m) => {
                const on = todayValue === m.value;
                return (
                  <button key={m.value} onClick={() => { haptic("light"); setToday(m.value); showToast("Humor registrado"); }} className="active:scale-90" aria-label={`Humor ${m.value}`} style={{ flex: 1, aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 15, cursor: "pointer", transition: "transform .2s, box-shadow .2s", background: on ? "rgba(62,154,94,.14)" : "rgba(255,255,255,.55)", border: on ? "1.5px solid #3E9A5E" : "1px solid rgba(0,0,0,.06)", boxShadow: on ? "0 6px 14px rgba(62,154,94,.28)" : "inset 0 1px 0 rgba(255,255,255,.7)" }}>
                    <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="16" fill={m.fill} stroke={on ? "#3E9A5E" : "rgba(0,0,0,.06)"} strokeWidth="1.5" />
                      <circle cx="14.5" cy="17" r="1.8" fill="#3A2E12" />
                      <circle cx="25.5" cy="17" r="1.8" fill="#3A2E12" />
                      <path d={m.mouth} stroke="#3A2E12" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Sussurro do KIDZZ (texto dinâmico real) ── */}
        <div style={{ padding: "14px 16px 0", animation: "kalm-cascade .6s cubic-bezier(.22,1,.36,1) .26s both" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", borderRadius: 22, padding: "14px 15px", background: "linear-gradient(155deg,rgba(206,232,196,.72),rgba(180,215,175,.5))", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)", border: "1px solid rgba(255,255,255,.9)", boxShadow: "0 10px 22px rgba(50,90,50,.12),inset 0 1.5px 0 rgba(255,255,255,.9)" }}>
            <div style={{ flex: "none", width: 40, height: 40, borderRadius: 13, background: "radial-gradient(130% 130% at 30% 22%,#D8F0C8,#6FBE6A 55%,#3E8A4E)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(40,110,50,.35),inset 0 1px 1px rgba(255,255,255,.5)" }}>
              <KalmIcon d={KD.leaf} size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "1.2px", color: "#3E7A4A", marginBottom: 4 }}>SUSSURRO DO KIDZZ</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.5, color: "#274A30" }}>{whisper}</div>
            </div>
          </div>
        </div>

        {/* ── Quick Relief → views reais (pause/breath/mindful) ── */}
        <div data-screen-label="Alívio em minutos" style={{ animation: "kalm-cascade .5s both" }}>
          <div style={{ padding: "20px 20px 10px" }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "1.4px", color: "#3E7A4A", marginBottom: 3 }}>QUICK RELIEF</div>
            <h2 style={{ margin: 0, fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 19, color: "#1B301F" }}>Alívio em minutos</h2>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#5E7A5E", marginTop: 2 }}>Pequenas pausas que restauram já.</div>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 16px 14px", scrollbarWidth: "none" }}>
            {KALM_PAUSAS.map((p) => (
              <button key={p.key} onClick={() => { haptic("light"); go(p.view); }} className="active:scale-95" style={{ position: "relative", overflow: "hidden", flex: "none", width: 190, minHeight: 150, borderRadius: 22, padding: "13px 14px 13px", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 6, transition: "transform .3s cubic-bezier(.34,1.4,.64,1)", fontFamily: "'Nunito',sans-serif", ...kalmGlass(p.t[0], p.t[1], p.t[2], 0.38, 0.12) }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "55%", height: "100%", pointerEvents: "none", background: "linear-gradient(105deg,transparent 0%,rgba(255,255,255,.25) 50%,transparent 100%)", animation: "kalm-shine 6.5s ease-in-out infinite" }} />
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={kalmGloss(p.g[0], p.g[1], p.g[2])}><KalmIcon d={p.d} size={20} /></div>
                  <div style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(62,138,78,.14)", color: "#2E6A3E", fontSize: 10, fontWeight: 900, border: "1px solid rgba(62,138,78,.2)" }}>{p.min}</div>
                </div>
                <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 15, color: "#1B301F", lineHeight: 1.18, marginTop: "auto" }}>{p.title}</div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#5E7A5E", lineHeight: 1.35 }}>{p.sub}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 900, color: "#3E9A5E", marginTop: 2 }}>Começar <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="#3E9A5E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Soundscapes → AmbientSoundEngine real (premium → paywall) ── */}
        <div data-screen-label="Soundscapes">
          <div style={{ padding: "20px 20px 10px" }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "1.4px", color: "#3E7A4A", marginBottom: 3 }}>SONS DA CALMA</div>
            <h2 style={{ margin: 0, fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 19, color: "#1B301F" }}>Paisagens sonoras</h2>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#5E7A5E", marginTop: 2 }}>Toque para tocar e acalmar o ambiente.</div>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "2px 16px 16px", scrollbarWidth: "none" }}>
            {KALM_SOUNDSCAPES.map((s) => {
              const playing = soundOn === s.key;
              return (
                <button key={s.key} onClick={() => toggleSound(s)} className="active:scale-95" style={{ position: "relative", overflow: "hidden", flex: "none", width: 158, height: 122, borderRadius: 20, cursor: "pointer", border: "1px solid rgba(255,255,255,.5)", boxShadow: playing ? "0 12px 26px rgba(46,122,74,.4)" : "0 10px 22px rgba(50,90,50,.22)", background: `linear-gradient(158deg,${s.grad[0]},${s.grad[1]})`, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 12, transition: "transform .3s cubic-bezier(.34,1.4,.64,1), box-shadow .3s", fontFamily: "'Nunito',sans-serif" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.46))", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", top: 11, left: 11, width: 32, height: 32, borderRadius: 11, background: "rgba(255,255,255,.22)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <KalmIcon d={s.d} size={17} />
                  </div>
                  <div style={{ position: "absolute", top: 11, right: 11, width: 34, height: 34, borderRadius: 999, background: "rgba(255,255,255,.92)", boxShadow: "0 4px 12px rgba(0,0,0,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {playing ? (
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 14 }}>
                        <span style={{ width: 3, height: "100%", borderRadius: 2, background: "#2E7A4A", animation: "kalm-eq .8s ease-in-out infinite" }} />
                        <span style={{ width: 3, height: "100%", borderRadius: 2, background: "#2E7A4A", animation: "kalm-eq .8s ease-in-out .22s infinite" }} />
                        <span style={{ width: 3, height: "100%", borderRadius: 2, background: "#2E7A4A", animation: "kalm-eq .8s ease-in-out .44s infinite" }} />
                      </div>
                    ) : s.premium ? (
                      <Lock size={15} color="#2E7A4A" />
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="#2E7A4A"><path d="M8 5v14l11-7z" /></svg>
                    )}
                  </div>
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <div style={{ fontFamily: "'Lora',serif", fontWeight: 600, fontSize: 14.5, color: "#fff", lineHeight: 1.15 }}>{s.title}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,.82)", marginTop: 1 }}>{s.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Features profundas reais preservadas (player, journeys, growth) ── */}
        <KalmSections initialExperienceId={initialExperienceId} onConsumedInitial={onConsumedInitial} />
        <WellnessGrowth />

        <div style={{ padding: "2px 20px 16px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "#8AA085" }}>KALM by KIDZZ · Seu espaço de calma em família</div>
      </div>

      {/* Toast local (feedback humor/som) */}
      {toast && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: "calc(env(safe-area-inset-bottom, 0px) + 168px)", display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 50 }}>
          <div style={{ padding: "10px 18px", borderRadius: 999, background: "rgba(27,48,31,.93)", color: "#EEF4E9", fontFamily: "'Nunito',sans-serif", fontSize: 12.5, fontWeight: 800, backdropFilter: "blur(10px)", boxShadow: "0 10px 24px rgba(27,48,31,.4)", animation: "kalm-toastin .3s both" }}>{toast}</div>
        </div>
      )}
    </div>
  );
};



/* ────────────── BREATH / SOS (shared engine, distinct UI) ────────────── */
const BreathView = ({ onBack, sos = false }: { onBack: () => void; sos?: boolean }) => {
  const [active, setActive] = useState(true);
  const { phase, step } = useBreath(active);
  const { completeToday } = useWellnessStreak();
  const [cycles, setCycles] = useState(0);
  useEffect(() => { if (step === 2) setCycles((c) => { const n = c + 1; if (n === 3) completeToday(); return n; }); }, [step, completeToday]);


  return (
    <>
      <TopBar title={sos ? "SOS Emocional" : "Respiração 4·4·6"} onBack={onBack} />
      <div className="px-5 pt-4">
        <Eyebrow>{sos ? "Estamos com vocês" : "Inspire · segure · expire"}</Eyebrow>
        <h1 className="mt-1 text-[26px] font-semibold leading-tight" style={{ color: ink, letterSpacing: "-0.01em" }}>
          {sos ? "Vamos respirar juntos." : "Um ciclo de cada vez."}
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center px-6 pt-10 pb-6">
        <div className="relative w-[260px] h-[260px] flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle, ${serenity}66, transparent 70%)`, filter: "blur(20px)" }}
          />
          <motion.div
            animate={{ scale: phase.scale }}
            transition={{ duration: phase.ms / 1000, ease: [0.45, 0, 0.55, 1] }}
            className="relative w-40 h-40 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle at 30% 30%, #FFFFFF, ${serenity})`,
              boxShadow: `0 30px 60px -30px ${serenity}AA, 0 0 0 8px rgba(255,255,255,0.5)`,
            }}
          >
            <span className="text-[18px] font-semibold" style={{ color: ink }}>{phase.p}</span>
          </motion.div>
        </div>

        <div className="mt-8 flex items-center gap-2">
          {[0,1,2].map((i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? 28 : 10,
                background: i === step ? ink : `${ink}33`,
              }}
            />
          ))}
        </div>

        <button
          onClick={() => { haptic("light"); setActive((a) => !a); }}
          className="mt-8 px-6 h-12 rounded-full flex items-center gap-2 font-semibold text-[14px]"
          style={{ background: ink, color: "#fff" }}
        >
          {active ? <Pause size={16} /> : <Play size={16} />}
          {active ? "Pausar" : "Retomar"}
        </button>

        {sos && (
          <p className="mt-6 text-center text-[13px] max-w-[280px]" style={{ color: inkSoft }}>
            Coloque uma mão no peito. Respire com a criança. Está tudo bem agora.
          </p>
        )}
      </div>
    </>
  );
};

/* ────────────── SOUNDS — 8 atmosferas (4 grátis + 4 premium) ────────────── */
type Sound = { id: string; label: string; url: string; icon: string; premium?: boolean; tint: string };
const SOUND_LIST: Sound[] = [
  { id: "rain",   label: "Chuva suave",    url: "https://cdn.pixabay.com/audio/2022/03/10/audio_1648d7e3cd.mp3",   icon: "🌧",  tint: serenity },
  { id: "ocean",  label: "Oceano",         url: "https://cdn.pixabay.com/audio/2021/09/06/audio_e1b0956a16.mp3", icon: "🌊",  tint: serenity },
  { id: "forest", label: "Floresta",       url: "https://cdn.pixabay.com/audio/2022/03/10/audio_270f49c32b.mp3", icon: "🌿",  tint: sage },
  { id: "white",  label: "Brisa branca",   url: "https://cdn.pixabay.com/audio/2021/08/09/audio_dc39bfefcb.mp3", icon: "☁️",  tint: pearl },
  { id: "fire",   label: "Lareira",        url: "/audio/rain-soft.mp3",   icon: "🔥",  tint: clay,    premium: true },
  { id: "train",  label: "Trem distante",  url: "/audio/white-noise.mp3", icon: "🚂",  tint: clay,    premium: true },
  { id: "space",  label: "Espaço",         url: "/audio/ocean-waves.mp3", icon: "🌌",  tint: lilac,   premium: true },
  { id: "river",  label: "Rio",            url: "/audio/forest-calm.mp3", icon: "🛶",  tint: emerald, premium: true },
];

const SoundsView = ({ onBack }: { onBack: () => void }) => {
  const engineRef = useRef<AmbientSoundEngine | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    engineRef.current = new AmbientSoundEngine();
    return () => { engineRef.current?.stopAll?.(); };
  }, []);

  const toggle = (s: Sound) => {
    if (s.premium) {
      haptic("medium");
      window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context: "wellness_sound" } }));
      return;
    }
    haptic("light");
    const engine = engineRef.current as any;
    if (playing === s.id) {
      engine?.stop?.(s.id);
      setPlaying(null);
    } else {
      engine?.stopAll?.();
      engine?.start?.(s.id, s.url, 0.5);
      setPlaying(s.id);
    }
  };

  return (
    <>
      <TopBar title="Sons da natureza" onBack={onBack} />
      <div className="px-5 pt-4 pb-2">
        <Eyebrow>Som ambiente · 8 atmosferas</Eyebrow>
        <h1 className="mt-1 text-[26px] font-semibold" style={{ color: ink, letterSpacing: "-0.01em" }}>
          Escolha uma atmosfera.
        </h1>
      </div>
      <div className="px-5 pt-4 grid grid-cols-2 gap-3 pb-10">
        {SOUND_LIST.map((s) => {
          const isOn = playing === s.id;
          return (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.97 }}
              transition={tapSpring}
              onClick={() => toggle(s)}
              className="relative p-4 rounded-[26px] flex flex-col gap-3 text-left min-h-[134px] overflow-hidden"
              style={{
                background: isOn ? "#FFFFFF" : surface,
                border: `1px solid ${isOn ? `${emerald}66` : stroke}`,
                boxShadow: isOn ? `0 18px 40px -22px ${emerald}99` : "0 6px 18px -12px rgba(39,48,42,0.12)",
              }}
            >
              {/* tinted glow */}
              <div
                className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${s.tint}55, transparent 70%)`, filter: "blur(12px)" }}
              />
              <div className="relative flex items-start justify-between">
                <div className="text-2xl">{s.icon}</div>
                {s.premium && (
                  <div
                    className="flex items-center gap-1 px-2 h-6 rounded-full text-[10px] font-bold"
                    style={{ background: `${gold}22`, color: gold }}
                  >
                    <Lock size={10} /> Premium
                  </div>
                )}
              </div>
              <div className="relative">
                <div className="text-[15px] font-semibold" style={{ color: ink }}>{s.label}</div>
                <div className="mt-1 text-[12px]" style={{ color: inkSoft }}>
                  {s.premium ? "Desbloquear" : isOn ? "Tocando" : "Tocar"}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </>
  );
};

/* ────────────── SLEEP — área Dormir Melhor (premium feel) ────────────── */
const SLEEP_ITEMS = [
  { id: "story",   icon: "🌙", title: "Histórias calmas",     sub: "Narração suave para embalar" },
  { id: "rain",    icon: "🌧", title: "Sons noturnos",        sub: "Chuva, oceano, floresta" },
  { id: "deep",    icon: "🛏", title: "Relaxamento profundo", sub: "Body scan · 10 min", premium: true },
  { id: "slow",    icon: "☁️",  title: "Desacelerar",          sub: "Respiração 4·7·8", premium: true },
];

const SleepView = ({ onBack, go }: { onBack: () => void; go: (v: View) => void }) => {
  const engineRef = useRef<AmbientSoundEngine | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const [timer, setTimer] = useState<number | null>(null); // minutes selected
  const [remain, setRemain] = useState<number>(0); // seconds remaining
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    engineRef.current = new AmbientSoundEngine();
    return () => {
      engineRef.current?.stopAll?.();
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const stopEverything = () => {
    engineRef.current?.stopAll?.();
    setPlaying(null);
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    stopTimerRef.current = null;
    tickRef.current = null;
    setTimer(null);
    setRemain(0);
  };

  const playRain = () => {
    haptic("light");
    if (playing) { stopEverything(); return; }
    (engineRef.current as any)?.start?.("rain", "https://cdn.pixabay.com/audio/2022/03/10/audio_1648d7e3cd.mp3", 0.35);
    setPlaying("rain");
    if (timer) startTimer(timer);
  };

  const startTimer = (mins: number) => {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    setTimer(mins);
    setRemain(mins * 60);
    stopTimerRef.current = window.setTimeout(() => {
      engineRef.current?.stopAll?.();
      setPlaying(null);
      setTimer(null);
      setRemain(0);
    }, mins * 60 * 1000);
    tickRef.current = window.setInterval(() => setRemain((r) => Math.max(0, r - 1)), 1000);
  };

  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  return (
    <div
      className="min-h-[80vh]"
      style={{ background: `linear-gradient(180deg, #1a2342 0%, #2a2855 45%, #1f1c40 100%)` }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(14)].map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: 2 + (i % 3), height: 2 + (i % 3),
              top: `${(i * 41) % 90}%`, left: `${(i * 67) % 95}%`,
              opacity: 0.4 + (i % 3) * 0.2,
              boxShadow: "0 0 6px rgba(255,255,255,0.7)",
            }}
          />
        ))}
      </div>
      <div className="relative">
        <div className="px-4 pt-3 pb-2 flex items-center gap-3">
          <button
            onClick={() => { haptic("light"); stopEverything(); onBack(); }}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}
            aria-label="Voltar"
          >
            <ArrowLeft size={18} color="#fff" />
          </button>
          <div className="flex-1 text-center text-[15px] font-semibold text-white">Dormir melhor</div>
          <div className="w-11 h-11" />
        </div>

        <div className="px-5 pt-6 pb-4 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#C5C8E8" }}>
            Boa noite, família
          </div>
          <h1 className="mt-2 text-[28px] font-semibold leading-tight" style={{ color: "#F4F1FF", letterSpacing: "-0.01em" }}>
            Um sono que abraça.
          </h1>
          <p className="mt-2 text-[14px] max-w-[300px] mx-auto" style={{ color: "#B8BCD8" }}>
            Reduza o ritmo. Diminua a luz. Vamos desacelerar juntos.
          </p>
        </div>

        {/* Auto-pausa timer */}
        <div className="px-5 pt-2 pb-4">
          <div
            className="rounded-[22px] p-4"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Timer size={14} color="#C5C8E8" />
                <span className="text-[12px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#C5C8E8" }}>
                  Auto-pausa
                </span>
              </div>
              {timer && remain > 0 && (
                <span className="text-[12px] tabular-nums" style={{ color: "#F4F1FF" }}>{fmt(remain)}</span>
              )}
            </div>
            <div className="flex gap-2">
              {[10, 20, 30].map((m) => {
                const isOn = timer === m;
                return (
                  <button
                    key={m}
                    onClick={() => { haptic("light"); isOn ? stopEverything() : startTimer(m); }}
                    className="flex-1 h-10 rounded-xl text-[13px] font-semibold"
                    style={{
                      background: isOn ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${isOn ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)"}`,
                      color: "#F4F1FF",
                    }}
                  >
                    {m} min
                  </button>
                );
              })}
            </div>
            <button
              onClick={playRain}
              className="mt-3 w-full h-12 rounded-2xl text-[14px] font-semibold flex items-center justify-center gap-2"
              style={{
                background: playing ? "#fff" : "rgba(255,255,255,0.12)",
                color: playing ? "#1a2342" : "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
              {playing ? "Pausar chuva" : "Tocar chuva noturna"}
            </button>
          </div>
        </div>

        <div className="px-5 pb-12 space-y-3">
          {SLEEP_ITEMS.map((s) => (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.985 }}
              transition={tapSpring}
              onClick={() => {
                haptic("light");
                if (s.premium) {
                  window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context: "wellness_sleep" } }));
                  return;
                }
                if (s.id === "rain") go("sounds");
                else if (s.id === "story") go("meditation");
              }}
              className="w-full text-left p-4 rounded-[24px] flex items-center gap-4 relative"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-white">{s.title}</div>
                <div className="text-[12px]" style={{ color: "#B8BCD8" }}>{s.sub}</div>
              </div>
              {s.premium
                ? <Lock size={16} color="#C9A84C" />
                : <ChevronRight size={18} color="#B8BCD8" />}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};



/* ────────────── MEDITATION (real Web Speech narration) ────────────── */
const MED_TRACKS = [
  {
    id: "m1", title: "Pousar o dia", sub: "Para o fim da tarde", min: 5, icon: Sunrise,
    script: [
      "Respire fundo. Sinta o ar entrar pelas narinas.",
      "Solte o ar devagar pela boca. Mais uma vez.",
      "Perceba o peso do corpo. Os ombros relaxam.",
      "O dia já passou. Agora é só este momento.",
      "Inspire calma. Expire o cansaço do dia.",
      "Você está em paz. Aqui. Agora.",
    ],
  },
  {
    id: "m2", title: "Coração calmo", sub: "Compaixão familiar", min: 7, icon: Heart,
    script: [
      "Coloque uma mão no peito. Sinta o coração bater.",
      "Pense em alguém que você ama profundamente.",
      "Envie a essa pessoa um pensamento de carinho.",
      "Que ela esteja bem. Que ela esteja feliz.",
      "Agora, mande esse mesmo carinho para você.",
      "Você merece amor. Você merece paz.",
    ],
  },
  {
    id: "m3", title: "Antes de dormir", sub: "Soltar o corpo", min: 10, icon: MoonIcon,
    script: [
      "Deite-se confortavelmente. Feche os olhos.",
      "Solte os pés. Solte as pernas.",
      "Solte a barriga. Solte os ombros.",
      "Solte o rosto. Solte a testa.",
      "O corpo está pesado, calmo, em paz.",
      "Boa noite. Durma tranquilo.",
    ],
  },
];

const speakLine = (text: string, onEnd?: () => void) => {
  if (typeof window === "undefined" || !window.speechSynthesis) { onEnd?.(); return; }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-BR";
  u.rate = SOFT_RATE;
  u.pitch = SOFT_PITCH;
  u.volume = SOFT_VOLUME;
  // Voz feminina pt-BR padronizada (fonte única).
  const v = pickFemaleVoice(window.speechSynthesis.getVoices());
  if (v) u.voice = v;
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
};

const MeditationView = ({ onBack }: { onBack: () => void }) => {
  const [active, setActive] = useState<string | null>(null);
  const [lineIdx, setLineIdx] = useState(0);
  const [ambient, setAmbient] = useState(true);
  const timerRef = useRef<number | null>(null);
  const engineRef = useRef<AmbientSoundEngine | null>(null);
  const { completeToday } = useWellnessStreak();

  useEffect(() => { engineRef.current = new AmbientSoundEngine(); return () => engineRef.current?.stopAll?.(); }, []);

  const stopAll = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    engineRef.current?.stopAll?.();
    setActive(null);
    setLineIdx(0);
  }, []);

  useEffect(() => () => stopAll(), [stopAll]);

  const start = (id: string) => {
    stopAll();
    const track = MED_TRACKS.find((t) => t.id === id);
    if (!track) return;
    setActive(id);
    setLineIdx(0);
    if (ambient) {
      (engineRef.current as any)?.start?.("forest", "https://cdn.pixabay.com/audio/2022/03/10/audio_270f49c32b.mp3", 0.18);
    }
    let idx = 0;
    const speakNext = () => {
      if (idx >= track.script.length) {
        completeToday();
        engineRef.current?.stopAll?.();
        setActive(null);
        setLineIdx(0);
        return;
      }
      setLineIdx(idx);
      speakLine(track.script[idx], () => {
        idx += 1;
        timerRef.current = window.setTimeout(speakNext, 2200);
      });
    };
    speakNext();
  };


  const current = MED_TRACKS.find((t) => t.id === active);

  return (
    <>
      <TopBar title="Meditação guiada" onBack={() => { stopAll(); onBack(); }} />
      <div className="px-5 pt-4 flex items-start justify-between gap-3">
        <div>
          <Eyebrow>Sessões breves · narração real</Eyebrow>
          <h1 className="mt-1 text-[26px] font-semibold" style={{ color: ink, letterSpacing: "-0.01em" }}>
            Reserve um momento.
          </h1>
        </div>
        <button
          onClick={() => { haptic("light"); setAmbient(a => !a); if (!ambient && active) (engineRef.current as any)?.start?.("forest", "/audio/forest-calm.mp3", 0.18); if (ambient) engineRef.current?.stopAll?.(); }}
          className="shrink-0 mt-1 px-3 h-9 rounded-full text-[11px] font-semibold flex items-center gap-1.5"
          style={{
            background: ambient ? `${sage}33` : "transparent",
            border: `1px solid ${ambient ? `${sage}66` : stroke}`,
            color: ink,
          }}
          aria-label="Som ambiente"
        >
          <Waves size={12} /> {ambient ? "Floresta on" : "Floresta off"}
        </button>
      </div>

      <div className="px-5 pt-5 space-y-3 pb-10">
        {MED_TRACKS.map((t) => {
          const Icon = t.icon;
          const isOn = active === t.id;
          return (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.985 }}
              transition={tapSpring}
              onClick={() => { haptic("light"); isOn ? stopAll() : start(t.id); }}
              className="w-full text-left p-4 rounded-[24px] flex items-center gap-4"
              style={{
                background: isOn ? "#fff" : surface,
                border: `1px solid ${isOn ? `${emerald}66` : stroke}`,
                boxShadow: isOn ? `0 18px 40px -22px ${emerald}99` : undefined,
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: `${sage}22` }}
              >
                <Icon size={22} style={{ color: ink }} strokeWidth={1.7} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold" style={{ color: ink }}>{t.title}</div>
                <div className="text-[12px]" style={{ color: inkSoft }}>{t.sub} · {t.min} min</div>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: isOn ? ink : "transparent", border: `1px solid ${isOn ? ink : stroke}` }}
              >
                {isOn
                  ? <Pause size={16} color="#fff" />
                  : <Play size={16} style={{ color: ink }} />}
              </div>
            </motion.button>
          );
        })}
        {current && (
          <Surface className="p-5 text-center">
            <Eyebrow>Tocando · {lineIdx + 1}/{current.script.length}</Eyebrow>
            <AnimatePresence mode="wait">
              <motion.div
                key={lineIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4 }}
                className="mt-2 text-[16px] leading-snug"
                style={{ color: ink }}
              >
                {current.script[lineIdx]}
              </motion.div>
            </AnimatePresence>
          </Surface>
        )}
      </div>
    </>
  );
};

/* ────────────── FAMILY — respirar e agradecer juntos ────────────── */
const GRATITUDE_PROMPTS = [
  "O que fez você sorrir hoje?",
  "Quem foi gentil com você?",
  "Que cheiro do dia você gostou?",
  "Que som te deixou feliz hoje?",
  "Qual foi o melhor abraço de hoje?",
];

const FamilyView = ({ onBack }: { onBack: () => void }) => {
  const [mode, setMode] = useState<"intro" | "breath" | "gratitude">("intro");
  const [active, setActive] = useState(false);
  const { phase, step } = useBreath(mode === "breath" && active);
  const [pi, setPi] = useState(0);
  const { completeToday } = useWellnessStreak();
  useEffect(() => { if (mode !== "intro") completeToday(); }, [mode, completeToday]);

  return (
    <>
      <TopBar title="Wellness Família" onBack={onBack} />
      <div className="px-5 pt-4">
        <Eyebrow>Momento de conexão</Eyebrow>
        <h1 className="mt-1 text-[26px] font-semibold" style={{ color: ink, letterSpacing: "-0.01em" }}>
          {mode === "intro" && "Vamos fazer juntos."}
          {mode === "breath" && "Respirem no mesmo ritmo."}
          {mode === "gratitude" && "Uma rodada de gratidão."}
        </h1>
      </div>

      {mode === "intro" && (
        <div className="px-5 pt-6 space-y-3 pb-10">
          <motion.button
            whileTap={{ scale: 0.985 }} transition={tapSpring}
            onClick={() => { haptic("light"); setMode("breath"); setActive(true); }}
            className="w-full text-left p-5 rounded-[24px] flex items-center gap-4"
            style={{ background: surface, border: `1px solid ${stroke}` }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${sage}33` }}>
              <Wind size={22} style={{ color: ink }} strokeWidth={1.7} />
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold" style={{ color: ink }}>Respirar juntos</div>
              <div className="text-[12px]" style={{ color: inkSoft }}>3 ciclos guiados em família</div>
            </div>
            <ChevronRight size={18} style={{ color: inkSoft }} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.985 }} transition={tapSpring}
            onClick={() => { haptic("light"); setMode("gratitude"); setPi(0); }}
            className="w-full text-left p-5 rounded-[24px] flex items-center gap-4"
            style={{ background: surface, border: `1px solid ${stroke}` }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${clay}33` }}>
              <HandHeart size={22} style={{ color: ink }} strokeWidth={1.7} />
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold" style={{ color: ink }}>Rodada de gratidão</div>
              <div className="text-[12px]" style={{ color: inkSoft }}>5 perguntas para cada um responder</div>
            </div>
            <ChevronRight size={18} style={{ color: inkSoft }} />
          </motion.button>
        </div>
      )}

      {mode === "breath" && (
        <div className="flex flex-col items-center justify-center px-6 pt-8 pb-10">
          <div className="relative w-[240px] h-[240px] flex items-center justify-center">
            <div className="absolute inset-0 rounded-full"
              style={{ background: `radial-gradient(circle, ${sage}66, transparent 70%)`, filter: "blur(20px)" }} />
            <motion.div
              animate={{ scale: phase.scale }}
              transition={{ duration: phase.ms / 1000, ease: [0.45, 0, 0.55, 1] }}
              className="relative w-36 h-36 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 30% 30%, #FFFFFF, ${sage})`,
                boxShadow: `0 30px 60px -30px ${emerald}AA, 0 0 0 8px rgba(255,255,255,0.5)`,
              }}
            >
              <span className="text-[17px] font-semibold" style={{ color: ink }}>{phase.p}</span>
            </motion.div>
          </div>
          <p className="mt-6 text-center text-[14px] max-w-[280px]" style={{ color: inkSoft }}>
            Olhem-se nos olhos. Sigam o círculo. Inspirem juntos.
          </p>
          <button
            onClick={() => { haptic("light"); setActive((a) => !a); }}
            className="mt-6 px-6 h-12 rounded-full flex items-center gap-2 font-semibold text-[14px]"
            style={{ background: ink, color: "#fff" }}
          >
            {active ? <Pause size={16} /> : <Play size={16} />}
            {active ? "Pausar" : "Retomar"}
          </button>
          <button
            onClick={() => { haptic("light"); setMode("intro"); setActive(false); }}
            className="mt-3 text-[13px] underline" style={{ color: inkSoft }}
          >
            Voltar
          </button>
        </div>
      )}

      {mode === "gratitude" && (
        <div className="px-6 pt-10 flex flex-col items-center text-center pb-10">
          <Eyebrow>{pi + 1} de {GRATITUDE_PROMPTS.length}</Eyebrow>
          <AnimatePresence mode="wait">
            <motion.div
              key={pi}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="mt-4 text-[24px] font-semibold leading-snug max-w-[300px]"
              style={{ color: ink, letterSpacing: "-0.01em" }}
            >
              {GRATITUDE_PROMPTS[pi]}
            </motion.div>
          </AnimatePresence>
          <button
            onClick={() => {
              haptic("light");
              if (pi + 1 >= GRATITUDE_PROMPTS.length) setMode("intro");
              else setPi(pi + 1);
            }}
            className="mt-10 px-6 h-12 rounded-full font-semibold text-[14px]"
            style={{ background: ink, color: "#fff" }}
          >
            {pi + 1 >= GRATITUDE_PROMPTS.length ? "Concluir" : "Próxima"}
          </button>
        </div>
      )}
    </>
  );
};


/* ────────────── MINDFUL ────────────── */
const MINDFUL_PROMPTS = [
  "Note 3 sons ao redor.",
  "Sinta os pés no chão.",
  "Observe sua respiração por 5 ciclos.",
  "Sorria, sem motivo, por 10 segundos.",
  "Toque algo perto e descreva a textura.",
];

const MindfulView = ({ onBack }: { onBack: () => void }) => {
  const [i, setI] = useState(0);
  const { completeToday } = useWellnessStreak();
  useEffect(() => { completeToday(); }, [completeToday]);
  return (
    <>
      <TopBar title="Mini mindfulness" onBack={onBack} />
      <div className="px-6 pt-12 flex flex-col items-center text-center">
        <Eyebrow>Convite</Eyebrow>
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="mt-4 text-[28px] font-semibold leading-snug"
            style={{ color: ink, letterSpacing: "-0.01em" }}
          >
            {MINDFUL_PROMPTS[i]}
          </motion.div>
        </AnimatePresence>
        <button
          onClick={() => { haptic("light"); setI((i + 1) % MINDFUL_PROMPTS.length); }}
          className="mt-10 px-6 h-12 rounded-full font-semibold text-[14px]"
          style={{ background: ink, color: "#fff" }}
        >
          Próximo convite
        </button>
      </div>
    </>
  );
};

/* ────────────── PAUSE (1 min timer) ────────────── */
const PauseView = ({ onBack }: { onBack: () => void }) => {
  const [remain, setRemain] = useState(60);
  const [run, setRun] = useState(true);
  const { completeToday } = useWellnessStreak();
  useEffect(() => {
    if (!run) return;
    if (remain <= 0) { setRun(false); completeToday(); return; }
    const t = setTimeout(() => setRemain((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [run, remain, completeToday]);

  const pct = ((60 - remain) / 60) * 100;
  return (
    <>
      <TopBar title="Pausa do dia" onBack={onBack} />
      <div className="px-6 pt-10 flex flex-col items-center">
        <Eyebrow>60 segundos só seus</Eyebrow>
        <div className="mt-8 relative w-[220px] h-[220px]">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke={pearl} strokeWidth="4" />
            <circle
              cx="50" cy="50" r="46" fill="none"
              stroke={sage} strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${(pct * 289) / 100} 289`}
              style={{ transition: "stroke-dasharray 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[44px] font-semibold tabular-nums" style={{ color: ink }}>
              {remain}
            </span>
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => { haptic("light"); setRun((r) => !r); }}
            className="px-5 h-12 rounded-full font-semibold text-[14px]"
            style={{ background: ink, color: "#fff" }}
          >
            {run ? "Pausar" : "Continuar"}
          </button>
          <button
            onClick={() => { haptic("light"); setRemain(60); setRun(true); }}
            className="px-5 h-12 rounded-full font-semibold text-[14px]"
            style={{ background: "#fff", color: ink, border: `1px solid ${stroke}` }}
          >
            Reiniciar
          </button>
        </div>
      </div>
    </>
  );
};

/* ────────────── ROUTINE ────────────── */
const ROUTINE = [
  { time: "07:00", title: "Despertar suave", sub: "Luz natural + 3 respirações" },
  { time: "12:30", title: "Pausa do almoço", sub: "1 min sem telas" },
  { time: "16:00", title: "Mini mindfulness", sub: "Convite rápido" },
  { time: "19:30", title: "Desaceleração", sub: "Som ambiente + leitura" },
  { time: "21:00", title: "Ritual de dormir", sub: "Respiração 4·4·6" },
];

const RoutineView = ({ onBack }: { onBack: () => void }) => (
  <>
    <TopBar title="Rotina calma" onBack={onBack} />
    <div className="px-5 pt-4">
      <Eyebrow>Hoje</Eyebrow>
      <h1 className="mt-1 text-[26px] font-semibold" style={{ color: ink, letterSpacing: "-0.01em" }}>
        Um dia, cinco respiros.
      </h1>
    </div>
    <div className="px-5 pt-6 pb-10 space-y-3">
      {ROUTINE.map((r, i) => (
        <Surface key={i} className="p-4 flex items-center gap-4">
          <div className="w-14 text-[13px] font-semibold tabular-nums" style={{ color: inkSoft }}>
            {r.time}
          </div>
          <div className="w-px self-stretch" style={{ background: stroke }} />
          <div className="flex-1">
            <div className="text-[15px] font-semibold" style={{ color: ink }}>{r.title}</div>
            <div className="text-[12px]" style={{ color: inkSoft }}>{r.sub}</div>
          </div>
          <Trees size={18} style={{ color: sage }} />
        </Surface>
      ))}
    </div>
  </>
);

/* ────────────── REAL WORLD detail ────────────── */
const RealWorldView = ({ onBack }: { onBack: () => void }) => (
  <>
    <TopBar title="Mundo real" onBack={onBack} />
    <div className="px-5 pt-4">
      <Eyebrow>Experiências curadas</Eyebrow>
      <h1 className="mt-1 text-[26px] font-semibold" style={{ color: ink, letterSpacing: "-0.01em" }}>
        Lugares para viver com sua família.
      </h1>
    </div>
    <div className="px-5 pt-5 pb-10 space-y-4">
      {REAL_WORLD.map((p) => (
        <motion.div
          key={p.id}
          whileTap={{ scale: 0.99 }}
          transition={tapSpring}
          className="rounded-[26px] overflow-hidden"
          style={{ background: "#fff", border: `1px solid ${stroke}` }}
        >
          <div className="aspect-[16/10] w-full" style={{ background: pearl }}>
            <img src={p.img} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <Eyebrow>{p.tag}</Eyebrow>
            <div className="mt-1 text-[17px] font-semibold" style={{ color: ink }}>{p.title}</div>
            <div className="mt-1 flex items-center gap-1 text-[13px]" style={{ color: inkSoft }}>
              <MapPin size={12} /> {p.city}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1" style={{ color: clay }}>
                {[0,1,2,3,4].map((s) => <Star key={s} size={13} fill="currentColor" stroke="none" />)}
              </div>
              <button
                onClick={() => haptic("medium")}
                className="px-4 h-10 rounded-full text-[13px] font-semibold"
                style={{ background: ink, color: "#fff" }}
              >
                Saber mais
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </>
);

/* ────────────── JOURNEY ────────────── */
const JourneyView = ({ onBack }: { onBack: () => void }) => {
  const { week } = useMoodWeek();
  const { streak } = useWellnessStreak();
  const { profile } = useAuth();
  const isPremium = profile?.is_premium ?? false;
  const childName = profile?.child_name || "seu filho";
  const avg = week.filter(w => w.v > 0).reduce((s, w) => s + w.v, 0) / Math.max(week.filter(w => w.v > 0).length, 1);
  return (
  <>
    <TopBar title="Jornada" onBack={onBack} />
    <div className="px-5 pt-4">
      <Eyebrow>Última semana</Eyebrow>
      <h1 className="mt-1 text-[26px] font-semibold" style={{ color: ink, letterSpacing: "-0.01em" }}>
        Vocês estão indo bem.
      </h1>
      <p className="mt-1 text-[13px]" style={{ color: inkSoft }}>
        Humor médio {avg.toFixed(1)}/5 · {streak.count} {streak.count === 1 ? "dia" : "dias"} de calma seguidos
      </p>
    </div>
    <div className="px-5 pt-6 pb-10 space-y-3 relative">
      <Surface className="p-5">
        <div className="flex items-end justify-between gap-2 h-28">
          {week.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 4 }}
                animate={{ height: 12 + Math.max(m.v, 0.4) * 14 }}
                transition={{ duration: 0.6, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="w-full rounded-full"
                style={{
                  background: m.v > 0 ? `linear-gradient(180deg, ${sage}, ${serenity})` : `${ink}22`,
                  maxWidth: 22,
                }}
              />
              <span className="text-[11px]" style={{ color: inkSoft }}>{m.d}</span>
            </div>
          ))}
        </div>
      </Surface>

      <div className={isPremium ? "" : "relative"}>
        <div className={isPremium ? "space-y-3" : "space-y-3 pointer-events-none select-none"} style={isPremium ? undefined : { filter: "blur(6px)", opacity: 0.55 }}>
          {[
            { icon: HandHeart, t: "5 respirações guiadas", s: "Esta semana" },
            { icon: BookOpen,  t: "3 leituras antes de dormir", s: "Rotina noturna" },
            { icon: Music2,    t: "2 sessões de sons calmos", s: "Tarde" },
          ].map((a, i) => {
            const Icon = a.icon;
            return (
              <Surface key={i} className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${serenity}33` }}>
                  <Icon size={20} style={{ color: ink }} strokeWidth={1.7} />
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold" style={{ color: ink }}>{a.t}</div>
                  <div className="text-[12px]" style={{ color: inkSoft }}>{a.s}</div>
                </div>
                <Star size={16} style={{ color: clay }} fill="currentColor" stroke="none" />
              </Surface>
            );
          })}
        </div>

        {!isPremium && (
          <motion.button
            type="button"
            onClick={() => {
              haptic("medium");
              window.dispatchEvent(new CustomEvent("kidzz:open-paywall", { detail: { context: "wellness_journey" } }));
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.97 }}
            className="absolute inset-x-0 top-0 mx-auto rounded-3xl p-5 text-center"
            style={{
              background: `linear-gradient(135deg, ${emerald}1a, ${sage}26)`,
              border: `1px solid ${stroke}`,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: `0 10px 32px -14px ${emerald}66`,
              maxWidth: 360,
            }}
          >
            <p className="text-[15px] font-black leading-snug" style={{ color: ink }}>
              Transforme isso em ritual para {childName} ✨
            </p>
            <p className="text-[12px] font-medium mt-1.5" style={{ color: inkSoft }}>
              Jornada emocional completa, soundscapes e sleep ritual esperam vocês.
            </p>
            <span
              className="mt-3 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white font-extrabold text-[12px] shadow-lg"
              style={{ background: `linear-gradient(135deg, ${emerald}, ${sage})` }}
            >
              ✨ Ativar ritual completo
            </span>
          </motion.button>
        )}
      </div>
    </div>
  </>
  );
};




/* ────────────── ROOT ────────────── */
const WellnessHub = ({ onBack, initialExperienceId, onConsumedInitial }: Props) => {
  const [view, setView] = useState<View>("home");
  const [cinemaOpen, setCinemaOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const resetScroll = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  }, []);
  const go = useCallback((v: View) => { setView(v); resetScroll(); }, [resetScroll]);
  const back = useCallback(() => { setView("home"); resetScroll(); }, [resetScroll]);

  // Quando vier uma experiência inicial (do SOS), garante que estamos na home
  useEffect(() => { if (initialExperienceId) setView("home"); }, [initialExperienceId]);

  return (
    <div
      ref={scrollRef}
      className="h-full w-full overflow-y-auto overflow-x-hidden overscroll-contain relative"
      style={{
        background: "linear-gradient(180deg, hsl(38 55% 96% / 0.78) 0%, hsl(150 28% 90% / 0.72) 100%)",
        color: ink,
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",
        scrollPaddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
      } as React.CSSProperties}
    >
      <Atmosphere />
      <div
        className="relative"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 152px)" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === "home"       && <Home go={go} onBack={onBack} initialExperienceId={initialExperienceId} onConsumedInitial={onConsumedInitial} />}
            {view === "sos"        && <BreathView onBack={back} sos />}
            {view === "breath"     && <BreathView onBack={back} />}
            {view === "sounds"     && <SoundsView onBack={back} />}
            {view === "meditation" && <MeditationView onBack={back} />}
            {view === "mindful"    && <MindfulView onBack={back} />}
            {view === "pause"      && <PauseView onBack={back} />}
            {view === "routine"    && <RoutineView onBack={back} />}
            {view === "realworld"  && <RealWorldView onBack={back} />}
            {view === "journey"    && <JourneyView onBack={back} />}
            {view === "sleep"      && <SleepView onBack={back} go={go} />}
            {view === "family"     && <FamilyView onBack={back} />}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA flutuante — Modo cinemático */}
      {view === "home" && (
        <motion.button
          type="button"
          onClick={() => { haptic("medium"); setCinemaOpen(true); }}
          className="fixed left-1/2 -translate-x-1/2 z-[40] flex items-center gap-2 px-5 py-3 rounded-full active:scale-[0.97] transition-transform touch-manipulation"
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 100px)",
            background: "linear-gradient(135deg, hsl(150 30% 96%) 0%, hsl(140 35% 88%) 60%, hsl(150 35% 80%) 100%)",
            border: "1px solid hsl(0 0% 100% / 0.85)",
            boxShadow: "0 1px 0 hsl(0 0% 100% / 0.9) inset, 0 14px 32px -14px hsl(150 30% 25% / 0.4)",
            touchAction: "manipulation",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 220, damping: 22 }}
          aria-label="Abrir Modo cinemático"
        >
          <Clapperboard size={16} style={{ color: "hsl(150 35% 28%)" }} />
          <span className="text-[12px] font-black tracking-tight" style={{ color: "hsl(150 35% 22%)" }}>
            Modo cinemático
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "hsl(150 35% 28%)", color: "white" }}>
            90s
          </span>
        </motion.button>
      )}

      <WellnessCinema open={cinemaOpen} onClose={() => setCinemaOpen(false)} />
    </div>
  );
};

export default WellnessHub;

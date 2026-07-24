/**
 * KALM v2 — Home DIURNA da família (tema escuro florestal · premium).
 * Bem-estar da família acordada: emoção, gratidão, corpo, alimentação, conexão, autocuidado.
 * Nada de conteúdo noturno aqui (vive em Sonhos).
 */
import { useMemo, useState } from "react";
import {
  ArrowLeft, Heart, Leaf, Droplet, Users, Coffee, LifeBuoy,
  Share2, Sparkles, ChevronRight,
} from "lucide-react";
import kalmHeroFamily from "@/assets/kalm-hero-family.webp";
import { CAMALEAO, CAMALEAO_SCENE_MASK } from "@/lib/camaleaoOficial";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import { useAuth } from "@/contexts/AuthContext";
import KidzzLogo from "@/components/common/KidzzLogo";
import { findActivity, type Activity } from "./data";
import {
  useMood, useParentMood, useKalmStreak, useWeekStats, useDailySuggestion,
  type MoodValue,
} from "./state";

export type Pillar = "sentir" | "agradecer" | "mover" | "nutrir" | "conectar" | "cuidar";

/* ── Paleta escura florestal ─────────────────────────────────── */
const ink = "#F1EEE4";          // texto principal (creme claro)
const inkSoft = "rgba(241,238,228,0.68)"; // texto secundário
const inkMuted = "rgba(241,238,228,0.48)";
const gold = "#E8B93A";
const goldSoft = "#D4A017";
const green = "#7FB069";
const greenDeep = "#46703A";

/* Glass escuro opaco o bastante para não lavar sobre o hero claro */
const glassChrome: React.CSSProperties = {
  background: "linear-gradient(155deg, rgba(28,42,34,0.88), rgba(14,23,18,0.92))",
  border: "1px solid rgba(255,255,255,0.14)",
  backdropFilter: "blur(20px) saturate(140%)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.10)",
};

const glassCard: React.CSSProperties = {
  background: "linear-gradient(165deg, rgba(36,52,42,0.96), rgba(18,28,22,0.98))",
  border: "1px solid rgba(255,255,255,0.12)",
  backdropFilter: "blur(16px) saturate(130%)",
  WebkitBackdropFilter: "blur(16px) saturate(130%)",
  boxShadow:
    "0 12px 28px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.08)",
};

const greetByHour = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia, família!";
  if (h < 18) return "Boa tarde, família!";
  return "Boa noite, família!";
};

// Metáfora do tempo (5 estados). Mapeia para MoodValue existente.
const WEATHER: { v: MoodValue; emoji: string; label: string; color: string }[] = [
  { v: "muito_bem", emoji: "☀️", label: "Sol",         color: "#F4CB55" },
  { v: "bem",       emoji: "🌈", label: "Arco-íris",   color: "#9BD07A" },
  { v: "medio",     emoji: "⛅", label: "Nuvem",       color: "#BFD4E4" },
  { v: "mal",       emoji: "🌧️", label: "Chuva",       color: "#7FB2E0" },
  { v: "muito_mal", emoji: "⛈️", label: "Tempestade",  color: "#A69CE0" },
];

interface Props {
  onBack: () => void;
  onGoPillar: (p: Pillar) => void;
  onGoSos: () => void;
  onGoDreams: () => void;
  onOpenActivity: (a: Activity) => void;
}

const KalmHome = ({ onBack, onGoPillar, onGoSos, onGoDreams, onOpenActivity }: Props) => {
  const { profile: _profile } = useAuth();
  const { today: kidMood, set: setKidMood } = useMood();
  const { today: parentMood, set: setParentMood } = useParentMood();
  const { streak, markToday } = useKalmStreak();
  const weekStats = useWeekStats();
  const suggestion = useDailySuggestion();
  const [who, setWho] = useState<"kid" | "parent">("kid");

  const activeMood = who === "kid" ? kidMood : parentMood;
  const setMood = who === "kid" ? setKidMood : setParentMood;

  // Sugestão do tempo → pilar acolhedor
  const weatherPillar: Pillar | null = useMemo(() => {
    if (!activeMood) return null;
    if (activeMood === "muito_mal") return "sentir";
    if (activeMood === "mal") return "conectar";
    if (activeMood === "medio") return "mover";
    if (activeMood === "bem") return "agradecer";
    return "cuidar";
  }, [activeMood]);

  const handleMood = (v: MoodValue) => {
    haptic("light"); sfx("click");
    setMood(v); markToday();
  };

  const [shareMsg, setShareMsg] = useState<string>("");
  const handleShare = async () => {
    const txt = `Esta semana nossa família guardou ${weekStats.tarefas} vitórias e ${weekStats.momentos} momentos felizes 💚 — KALM by Kidzz`;
    const url = typeof window !== "undefined" ? window.location.origin : undefined;
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({ title: "KALM by Kidzz", text: txt, url });
        setShareMsg("Compartilhado ✨");
      } else if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url ? `${txt}\n${url}` : txt);
        setShareMsg("Texto copiado ✨");
      } else {
        setShareMsg("Compartilhamento indisponível");
      }
      haptic("light");
    } catch (e: any) {
      if (e?.name !== "AbortError") setShareMsg("Não foi possível compartilhar");
    }
    window.setTimeout(() => setShareMsg(""), 1800);
  };

  const suggestionActivity = suggestion.activityId ? findActivity(suggestion.activityId) : null;

  const pillars: { id: Pillar; icon: any; title: string; desc: string; tint: string }[] = [
    { id: "sentir",    icon: Heart,    title: "Sentir",    desc: "Emoção nomeada, emoção acalmada.",  tint: "#B49CE8" },
    { id: "agradecer", icon: Sparkles, title: "Agradecer", desc: "Jarro, vitórias e memórias felizes.", tint: "#F4CB55" },
    { id: "mover",     icon: Leaf,     title: "Mover",     desc: "Corpo leve, energia que regula.",    tint: "#9BD07A" },
    { id: "nutrir",    icon: Droplet,  title: "Nutrir",    desc: "Água, cor e refeição sem tela.",     tint: "#F0A45E" },
    { id: "conectar",  icon: Users,    title: "Conectar",  desc: "Abraços, olhos e risadas juntos.",   tint: "#7EC8A0" },
    { id: "cuidar",    icon: Coffee,   title: "Cuidar de você", desc: "Para você, mãe e pai.",         tint: "#EFA598" },
  ];

  return (
    <div
      className="min-h-full relative pb-32"
      style={{
        background:
          "radial-gradient(120% 60% at 50% 0%, rgba(232,185,58,0.10) 0%, transparent 55%)," +
          "radial-gradient(120% 80% at 80% 30%, rgba(127,176,105,0.08) 0%, transparent 60%)," +
          "linear-gradient(180deg, #0E1712 0%, #131F18 45%, #0B1310 100%)",
        fontFamily: "'Nunito', system-ui, sans-serif",
        color: ink,
      }}
    >
      {/* Vinheta florestal decorativa (não interativa) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 40% at 50% 0%, rgba(232,185,58,0.06), transparent 70%)," +
            "radial-gradient(60% 30% at 0% 20%, rgba(127,176,105,0.05), transparent 70%)," +
            "radial-gradient(60% 30% at 100% 60%, rgba(232,185,58,0.04), transparent 70%)",
        }}
      />

      {/* ═══ HERO cinematográfico — só arte (texto abaixo, sem cobrir personagens) ═══ */}
      <section className="relative" style={{ height: 300 }}>
        <div
          aria-hidden
          className="absolute inset-0 overflow-hidden"
          style={{
            height: 300,
            WebkitMaskImage:
              "linear-gradient(180deg, #000 62%, rgba(0,0,0,.5) 82%, transparent 100%)",
            maskImage:
              "linear-gradient(180deg, #000 62%, rgba(0,0,0,.5) 82%, transparent 100%)",
          }}
        >
          <img
            src={kalmHeroFamily}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "50% 22%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(8,14,10,.45) 0%, transparent 36%, rgba(14,23,18,.55) 100%)",
            }}
          />
        </div>

        {/* Gui original soft (direita) */}
        <img
          src={CAMALEAO.heartSoft}
          alt="Gui, o camaleão Kidzz"
          draggable={false}
          className="pointer-events-none absolute"
          style={{
            right: -8,
            bottom: 4,
            width: "48%",
            maxWidth: 210,
            height: "auto",
            objectFit: "contain",
            filter: "drop-shadow(0 14px 22px rgba(0,0,0,.45))",
            ...CAMALEAO_SCENE_MASK,
            zIndex: 2,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = CAMALEAO.heart;
          }}
        />

        {/* Top chrome — só logo / nav */}
        <div className="relative z-10 px-4 pt-[max(14px,env(safe-area-inset-top))] pb-2 flex items-center gap-2">
          <button
            onClick={() => { haptic("light"); onBack(); }}
            aria-label="Voltar"
            className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 flex-none"
            style={{ ...glassChrome, background: "rgba(255,255,255,0.12)" }}
          >
            <ArrowLeft size={18} style={{ color: ink }} />
          </button>
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 px-1">
            <KidzzLogo height={28} />
            <span
              className="text-[9px] font-bold tracking-[0.14em]"
              style={{ color: "rgba(241,238,228,0.78)" }}
            >
              Desligue a tela, ligue a infância.
            </span>
          </div>
          <div
            className="h-11 px-3 rounded-full flex items-center gap-1 text-[11.5px] font-bold flex-none"
            style={{ ...glassChrome, color: gold, background: "rgba(255,255,255,0.12)" }}
          >
            ⚡ {streak.count || 1}
          </div>
        </div>
      </section>

      {/* Corpo escuro — texto do hero + cards (texto na faixa do quadrado) */}
      <div
        className="relative z-[3]"
        style={{
          marginTop: -28,
          background:
            "linear-gradient(180deg, rgba(14,23,18,0.88) 0%, #0E1712 48px, #0B1310 100%)",
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 -12px 40px rgba(0,0,0,.35)",
        }}
      >
      {/* Copy do mockup — abaixo dos personagens, sem sobrepor */}
      <section className="relative px-5 pt-4 pb-1">
        <p
          className="text-[12px] font-extrabold"
          style={{ color: gold }}
        >
          {greetByHour()}
        </p>
        <h1
          className="mt-1.5 leading-[1.08]"
          style={{
            color: ink,
            fontFamily: "'Fraunces','Nunito',serif",
            fontSize: "clamp(24px, 7vw, 30px)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          Pequenos gestos,
          <br />
          grandes{" "}
          <span style={{ color: green, fontStyle: "italic" }}>conexões</span>.
        </h1>
        <p
          className="mt-2 text-[13px] leading-[1.4] font-semibold"
          style={{ color: inkSoft, maxWidth: 280 }}
        >
          Cada escolha de hoje transforma o amanhã.
        </p>
      </section>

      {/* Sugestão do dia (dinâmica) */}
      <section className="relative px-5 pt-4">
        <p className="text-[11px] font-bold tracking-[0.22em] uppercase" style={{ color: gold }}>
          ✨ Sugestão de hoje
        </p>
        <button
          onClick={() => {
            haptic("light");
            if (suggestionActivity) onOpenActivity(suggestionActivity);
            else onGoPillar(suggestion.pillar);
          }}
          className="mt-2 w-full text-left rounded-[22px] p-4 active:scale-[0.99]"
          style={{
            ...glassCard,
            background:
              "linear-gradient(145deg, rgba(232,185,58,0.24), rgba(22,34,26,0.98) 58%)",
            border: "1px solid rgba(232,185,58,0.34)",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-[24px] flex-shrink-0"
              style={{
                background: "rgba(232,185,58,0.18)",
                border: "1px solid rgba(232,185,58,0.30)",
              }}
            >
              {suggestion.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold leading-snug" style={{ color: ink }}>
                {suggestion.title}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: inkSoft }}>
                {suggestion.desc}
              </p>
              <span
                className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold"
                style={{ color: gold }}
              >
                Fazer agora <ChevronRight size={12} />
              </span>
            </div>
          </div>
        </button>
      </section>

      {/* Check-in emocional — Tempo de hoje */}
      <section className="relative px-5 pt-6">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase" style={{ color: green }}>
            🌦 Tempo de hoje
          </p>
          <div
            className="flex rounded-full p-0.5"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {(["kid", "parent"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setWho(k)}
                className="h-7 px-3 rounded-full text-[11px] font-bold active:scale-95"
                style={{
                  background: who === k ? "rgba(232,185,58,0.22)" : "transparent",
                  color: who === k ? gold : inkSoft,
                  boxShadow: who === k ? "inset 0 0 0 1px rgba(232,185,58,0.35)" : "none",
                }}
              >
                {k === "kid" ? "Criança" : "Pai/Mãe"}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1.5 text-[12.5px]" style={{ color: inkMuted }}>
          Como está o seu tempo agora? Sem julgamento, só um espelho gentil.
        </p>
        <div className="mt-3 rounded-[20px] p-3" style={glassCard}>
          <div className="flex items-stretch justify-between gap-1.5">
            {WEATHER.map((m) => {
              const on = activeMood === m.v;
              return (
                <button
                  key={m.v}
                  onClick={() => handleMood(m.v)}
                  className="flex-1 flex flex-col items-center justify-center py-2 rounded-2xl active:scale-95"
                  style={{
                    background: on ? `${m.color}22` : "transparent",
                    border: `1.5px solid ${on ? m.color : "transparent"}`,
                    boxShadow: on ? `0 0 24px ${m.color}30` : "none",
                  }}
                  aria-label={m.label}
                  aria-pressed={on}
                >
                  <span className="text-[26px] leading-none">{m.emoji}</span>
                  <span
                    className="mt-1 text-[10px] font-bold leading-tight text-center"
                    style={{ color: on ? m.color : inkMuted }}
                  >
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
          {weatherPillar && (
            <button
              onClick={() => { haptic("light"); onGoPillar(weatherPillar); }}
              className="mt-3 w-full h-11 rounded-full font-bold text-[13px] flex items-center justify-center gap-2 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${greenDeep}, ${green})`,
                color: "#0E1712",
                boxShadow: "0 8px 22px rgba(127,176,105,0.30)",
              }}
            >
              <Sparkles size={14} /> Que tal ir para: {pillars.find(p => p.id === weatherPillar)?.title}?
            </button>
          )}
        </div>
      </section>

      {/* 6 pilares */}
      <section className="relative px-5 pt-7">
        <p className="text-[11px] font-bold tracking-[0.22em] uppercase" style={{ color: green }}>
          Os 6 pilares diurnos
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => { haptic("light"); onGoPillar(p.id); }}
                className="text-left rounded-[20px] p-3.5 active:scale-[0.98]"
                style={{
                  ...glassCard,
                  background: `linear-gradient(160deg, ${p.tint}28, rgba(22,34,26,0.98) 62%)`,
                  border: `1px solid ${p.tint}45`,
                  minHeight: 118,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${p.tint}30`,
                    border: `1px solid ${p.tint}50`,
                    boxShadow: `0 0 20px ${p.tint}22`,
                  }}
                >
                  <Icon size={20} style={{ color: p.tint }} strokeWidth={2} />
                </div>
                <p className="mt-2.5 text-[14.5px] font-bold leading-tight" style={{ color: ink }}>
                  {p.title}
                </p>
                <p className="mt-0.5 text-[11.5px] leading-snug" style={{ color: inkSoft }}>
                  {p.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* SOS discreto */}
      <section className="relative px-5 pt-6">
        <button
          onClick={() => { haptic("medium"); onGoSos(); }}
          className="w-full rounded-[18px] p-3.5 flex items-center gap-3 active:scale-[0.98]"
          style={{
            background: "linear-gradient(140deg, rgba(214,63,92,0.32), rgba(28,18,22,0.98))",
            border: "1px solid rgba(240,100,120,0.45)",
            boxShadow: "0 10px 26px rgba(0,0,0,0.40)",
          }}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{
              background: "#D63F5C",
              color: "#fff",
              boxShadow: "0 6px 16px rgba(214,63,92,0.45)",
            }}
          >
            <LifeBuoy size={20} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[13.5px] font-bold" style={{ color: "#FFE8EC" }}>SOS emocional</p>
            <p className="text-[11.5px]" style={{ color: "rgba(255,230,235,0.78)" }}>
              Apoio imediato quando a emoção fica grande demais.
            </p>
          </div>
          <ChevronRight size={16} style={{ color: "#F08094" }} />
        </button>
      </section>

      {/* Resumo da semana */}
      <section className="relative px-5 pt-6">
        <div
          className="rounded-[22px] p-4"
          style={{
            ...glassCard,
            background:
              "linear-gradient(140deg, rgba(127,176,105,0.28), rgba(18,28,22,0.98) 65%)",
            border: "1px solid rgba(127,176,105,0.40)",
            boxShadow:
              "0 12px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <p className="text-[11px] font-bold tracking-[0.20em] uppercase" style={{ color: gold }}>
            ✦ Termômetro da semana
          </p>
          <p className="mt-1.5 text-[13.5px] leading-snug" style={{ color: ink }}>
            Esta semana sua família registrou{" "}
            <strong style={{ color: gold }}>{weekStats.tarefas}</strong> pequenas vitórias e{" "}
            <strong style={{ color: gold }}>{weekStats.momentos}</strong> momentos guardados no jarro.
          </p>
          <button
            onClick={handleShare}
            className="mt-3 h-10 px-4 rounded-full font-bold text-[12.5px] flex items-center gap-1.5 active:scale-95"
            style={{
              background: "rgba(255,255,255,0.10)",
              color: ink,
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Share2 size={13} /> {shareMsg || "Compartilhar"}
          </button>
        </div>
      </section>

      {/* Link discreto para Sonhos */}
      <section className="relative px-5 pt-6">
        <button
          onClick={() => { haptic("light"); onGoDreams(); }}
          className="w-full rounded-[16px] p-3.5 flex items-center gap-3 active:scale-[0.98]"
          style={{
            background: "linear-gradient(140deg, rgba(108,92,184,0.30), rgba(18,16,32,0.98))",
            border: "1px solid rgba(150,130,220,0.40)",
          }}
        >
          <span className="text-[22px]">🌙</span>
          <div className="flex-1 text-left">
            <p className="text-[13px] font-semibold" style={{ color: ink }}>Hora de dormir?</p>
            <p className="text-[11.5px]" style={{ color: inkSoft }}>
              Sons, histórias e ritual noturno vivem em Sonhos.
            </p>
          </div>
          <ChevronRight size={16} style={{ color: "#B4A6EE" }} />
        </button>
      </section>
      </div>
    </div>
  );
};

export default KalmHome;

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
import kalmHeroChameleon from "@/assets/kalm-hero-chameleon.jpg";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import { useAuth } from "@/contexts/AuthContext";
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

/* Glass frosted escuro com brilho dourado/verde muito suave */
const glassChrome: React.CSSProperties = {
  background: "linear-gradient(155deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
  border: "1px solid rgba(255,255,255,0.10)",
  backdropFilter: "blur(24px) saturate(140%)",
  WebkitBackdropFilter: "blur(24px) saturate(140%)",
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
};

const glassCard: React.CSSProperties = {
  background: "linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015))",
  border: "1px solid rgba(255,255,255,0.09)",
  backdropFilter: "blur(20px) saturate(140%)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  boxShadow:
    "0 10px 30px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.06)",
};

const greetByHour = () => {
  const h = new Date().getHours();
  if (h < 12) return "BOM DIA, FAMÍLIA";
  if (h < 18) return "BOA TARDE, FAMÍLIA";
  return "BOA NOITE, FAMÍLIA";
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
      className="min-h-full pb-32 relative overflow-hidden"
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

      {/* Header */}
      <div className="relative px-4 pt-[max(14px,env(safe-area-inset-top))] pb-3 flex items-center gap-2">
        <button
          onClick={() => { haptic("light"); onBack(); }}
          aria-label="Voltar"
          className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95"
          style={glassChrome}
        >
          <ArrowLeft size={18} style={{ color: ink }} />
        </button>
        <div
          className="flex-1 h-11 rounded-full flex items-center justify-center text-[13.5px] font-bold gap-1.5"
          style={{ ...glassChrome, color: ink }}
        >
          🌿 KALM · bem-estar da família
        </div>
        <div
          className="h-11 px-3 rounded-full flex items-center gap-1 text-[11.5px] font-bold"
          style={{ ...glassChrome, color: gold }}
        >
          ⚡ {streak.count || 1}
        </div>
      </div>

      {/* Herói */}
      <section className="relative px-5 pt-2">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0 pt-1">
            <p
              className="text-[11px] font-bold tracking-[0.20em] flex items-center gap-1"
              style={{ color: gold }}
            >
              {greetByHour()}
            </p>
            <h1
              className="mt-2 leading-[1.02]"
              style={{
                color: ink,
                fontFamily: "'Fraunces','Nunito',serif",
                fontSize: "clamp(26px, 7.8vw, 34px)",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              Cuidar das
              <br />emoções hoje,
              <br />
              <span
                style={{
                  fontStyle: "italic",
                  color: gold,
                  borderBottom: `2px solid ${greenDeep}`,
                  paddingBottom: 2,
                  textShadow: "0 0 24px rgba(232,185,58,0.25)",
                }}
              >
                transforma o amanhã.
              </span>
            </h1>
            <p className="mt-3 text-[13.5px] leading-snug" style={{ color: inkSoft }}>
              Pequenas escolhas hoje,<br />grandes conexões sempre.
            </p>
          </div>
          <img
            src={kalmHeroChameleon}
            alt="Camaleão meditando"
            width={1024}
            height={1024}
            className="w-[42%] max-w-[180px] h-auto object-contain flex-shrink-0 -mr-1 -mt-1"
            style={{
              filter:
                "drop-shadow(0 12px 28px rgba(232,185,58,0.28)) drop-shadow(0 4px 12px rgba(127,176,105,0.20))",
            }}
          />
        </div>
      </section>

      {/* Sugestão do dia (dinâmica) */}
      <section className="relative px-5 pt-6">
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
              "linear-gradient(140deg, rgba(232,185,58,0.18), rgba(232,185,58,0.04) 60%, rgba(255,255,255,0.02))",
            border: "1px solid rgba(232,185,58,0.28)",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.35), 0 0 40px rgba(232,185,58,0.10) inset, inset 0 1px 0 rgba(255,255,255,0.08)",
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
                  background: `linear-gradient(160deg, ${p.tint}22, rgba(255,255,255,0.02) 60%)`,
                  border: `1px solid ${p.tint}30`,
                  minHeight: 118,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${p.tint}22`,
                    border: `1px solid ${p.tint}35`,
                    boxShadow: `0 0 20px ${p.tint}18`,
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
            background: "linear-gradient(140deg, rgba(214,63,92,0.16), rgba(214,63,92,0.04))",
            border: "1px solid rgba(214,63,92,0.28)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            boxShadow: "0 10px 26px rgba(0,0,0,0.30)",
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
            <p className="text-[13.5px] font-bold" style={{ color: ink }}>SOS emocional</p>
            <p className="text-[11.5px]" style={{ color: inkSoft }}>
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
              "linear-gradient(140deg, rgba(127,176,105,0.22), rgba(70,112,58,0.10) 60%, rgba(255,255,255,0.02))",
            border: "1px solid rgba(127,176,105,0.30)",
            boxShadow:
              "0 12px 32px rgba(0,0,0,0.35), 0 0 40px rgba(127,176,105,0.10) inset, inset 0 1px 0 rgba(255,255,255,0.08)",
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
            background: "linear-gradient(140deg, rgba(108,92,184,0.18), rgba(108,92,184,0.04))",
            border: "1px solid rgba(108,92,184,0.28)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
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
  );
};

export default KalmHome;

/**
 * KALM v2 — Home DIURNA da família.
 * Bem-estar da família acordada: emoção, gratidão, corpo, alimentação, conexão, autocuidado.
 * Nada de conteúdo noturno aqui (vive em Sonhos).
 */
import { useEffect, useMemo, useState } from "react";
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

const ink = "#2A2520";
const inkSoft = "#5A6660";
const cream = "#FFFCF8";

const glassChrome: React.CSSProperties = {
  background: "rgba(255,252,248,0.55)",
  border: "1px solid rgba(255,255,255,0.6)",
  backdropFilter: "blur(24px) saturate(140%)",
  WebkitBackdropFilter: "blur(24px) saturate(140%)",
  boxShadow: "0 8px 32px rgba(42,37,32,0.10)",
};

const greetByHour = () => {
  const h = new Date().getHours();
  if (h < 12) return "BOM DIA, FAMÍLIA";
  if (h < 18) return "BOA TARDE, FAMÍLIA";
  return "BOA NOITE, FAMÍLIA";
};

// Metáfora do tempo (5 estados). Mapeia para MoodValue existente.
const WEATHER: { v: MoodValue; emoji: string; label: string; color: string }[] = [
  { v: "muito_bem", emoji: "☀️", label: "Sol",         color: "#E8B93A" },
  { v: "bem",       emoji: "🌈", label: "Arco-íris",   color: "#7FB069" },
  { v: "medio",     emoji: "⛅", label: "Nuvem",       color: "#9BB0C4" },
  { v: "mal",       emoji: "🌧️", label: "Chuva",       color: "#4F8FC9" },
  { v: "muito_mal", emoji: "⛈️", label: "Tempestade",  color: "#6C5CB8" },
];

interface Props {
  onBack: () => void;
  onGoPillar: (p: Pillar) => void;
  onGoSos: () => void;
  onGoDreams: () => void;
  onOpenActivity: (a: Activity) => void;
}

const KalmHome = ({ onBack, onGoPillar, onGoSos, onGoDreams, onOpenActivity }: Props) => {
  const { profile } = useAuth();
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
    if (activeMood === "muito_mal") return "sentir";     // Tempestade → respirar/regular
    if (activeMood === "mal") return "conectar";         // Chuva → aconchego
    if (activeMood === "medio") return "mover";          // Nuvem → energizar
    if (activeMood === "bem") return "agradecer";        // Arco-íris → gratidão
    return "cuidar";                                     // Sol → celebrar/pausa
  }, [activeMood]);

  const handleMood = (v: MoodValue) => {
    haptic("light"); sfx("click");
    setMood(v); markToday();
  };

  const handleShare = async () => {
    const txt = `Esta semana nossa família guardou ${weekStats.tarefas} vitórias e ${weekStats.momentos} momentos felizes 💚 — KALM by Kidzz`;
    try {
      if (navigator.share) await navigator.share({ title: "KALM by Kidzz", text: txt });
      else await navigator.clipboard.writeText(txt);
      haptic("light");
    } catch { /* noop */ }
  };

  const suggestionActivity = suggestion.activityId ? findActivity(suggestion.activityId) : null;

  const pillars: { id: Pillar; icon: any; title: string; desc: string; tint: string; bg: string }[] = [
    { id: "sentir",    icon: Heart,    title: "Sentir",    desc: "Emoção nomeada, emoção acalmada.", tint: "#6C5CB8", bg: "linear-gradient(135deg,#6C5CB820,#6C5CB808)" },
    { id: "agradecer", icon: Sparkles, title: "Agradecer", desc: "Jarro, vitórias e memórias felizes.", tint: "#C9A227", bg: "linear-gradient(135deg,#C9A22720,#C9A22708)" },
    { id: "mover",     icon: Leaf,     title: "Mover",     desc: "Corpo leve, energia que regula.",   tint: "#7FB069", bg: "linear-gradient(135deg,#7FB06920,#7FB06908)" },
    { id: "nutrir",    icon: Droplet,  title: "Nutrir",    desc: "Água, cor e refeição sem tela.",    tint: "#E8821A", bg: "linear-gradient(135deg,#E8821A20,#E8821A08)" },
    { id: "conectar",  icon: Users,    title: "Conectar",  desc: "Abraços, olhos e risadas juntos.",  tint: "#46703A", bg: "linear-gradient(135deg,#46703A20,#46703A08)" },
    { id: "cuidar",    icon: Coffee,   title: "Cuidar de você", desc: "Para você, mãe e pai.",         tint: "#D98C7A", bg: "linear-gradient(135deg,#D98C7A20,#D98C7A08)" },
  ];

  return (
    <div className="min-h-full pb-32 relative" style={{
      background: `linear-gradient(180deg, #FBF7EF 0%, #FFFCF8 60%)`,
      fontFamily: "'Nunito', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div className="px-4 pt-[max(14px,env(safe-area-inset-top))] pb-3 flex items-center gap-2">
        <button onClick={() => { haptic("light"); onBack(); }} aria-label="Voltar"
          className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95" style={glassChrome}>
          <ArrowLeft size={18} style={{ color: ink }} />
        </button>
        <div className="flex-1 h-11 rounded-full flex items-center justify-center text-[14px] font-bold gap-1.5"
          style={{ ...glassChrome, color: ink }}>
          🌿 KALM · bem-estar da família
        </div>
        <div className="h-11 px-3 rounded-full flex items-center gap-1 text-[11.5px] font-bold"
          style={{ ...glassChrome, color: "#46703A" }}>
          ⚡ {streak.count || 1}
        </div>
      </div>

      {/* Herói */}
      <section className="px-5 pt-2">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-[11px] font-bold tracking-[0.18em] flex items-center gap-1" style={{ color: "#46703A" }}>
              {greetByHour()}
            </p>
            <h1 className="mt-2 leading-[1.02]" style={{
              color: ink, fontFamily: "'Fraunces','Nunito',serif",
              fontSize: "clamp(26px, 7.8vw, 34px)", fontWeight: 600,
            }}>
              Cuidar das
              <br />emoções hoje,
              <br />
              <span style={{
                fontStyle: "italic", color: "#46703A",
                borderBottom: "2px solid #E8B93A", paddingBottom: 2,
              }}>
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
            style={{ filter: "drop-shadow(0 8px 20px rgba(70,112,58,0.18))" }}
          />
        </div>
      </section>


      {/* Sugestão do dia (dinâmica) */}
      <section className="px-5 pt-5">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#E8821A" }}>
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
            background: "linear-gradient(135deg,#FFE7B8,#FBD38D)",
            border: "1px solid rgba(232,130,26,0.25)",
          }}>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[24px] flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.65)" }}>
              {suggestion.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold leading-snug" style={{ color: "#4A2A00" }}>
                {suggestion.title}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: "#5A3A10" }}>
                {suggestion.desc}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold" style={{ color: "#8A4A00" }}>
                Fazer agora <ChevronRight size={12} />
              </span>
            </div>
          </div>
        </button>
      </section>

      {/* Check-in emocional — Tempo de hoje */}
      <section className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#46703A" }}>
            🌦 Tempo de hoje
          </p>
          <div className="flex rounded-full p-0.5" style={{ background: "rgba(42,37,32,0.06)" }}>
            {(["kid", "parent"] as const).map((k) => (
              <button key={k} onClick={() => setWho(k)}
                className="h-7 px-3 rounded-full text-[11px] font-bold active:scale-95"
                style={{
                  background: who === k ? "#fff" : "transparent",
                  color: who === k ? ink : inkSoft,
                  boxShadow: who === k ? "0 2px 6px rgba(42,37,32,0.10)" : "none",
                }}>
                {k === "kid" ? "Criança" : "Pai/Mãe"}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1 text-[12.5px]" style={{ color: inkSoft }}>
          Como está o seu tempo agora? Sem julgamento, só um espelho gentil.
        </p>
        <div className="mt-3 rounded-[20px] p-3"
          style={{ background: cream, border: "1px solid rgba(42,37,32,0.06)" }}>
          <div className="flex items-stretch justify-between gap-1.5">
            {WEATHER.map((m) => {
              const on = activeMood === m.v;
              return (
                <button key={m.v} onClick={() => handleMood(m.v)}
                  className="flex-1 flex flex-col items-center justify-center py-2 rounded-2xl active:scale-95"
                  style={{
                    background: on ? `${m.color}22` : "transparent",
                    border: `1.5px solid ${on ? m.color : "transparent"}`,
                  }} aria-label={m.label} aria-pressed={on}>
                  <span className="text-[26px] leading-none">{m.emoji}</span>
                  <span className="mt-1 text-[10px] font-bold leading-tight text-center"
                    style={{ color: on ? m.color : inkSoft }}>{m.label}</span>
                </button>
              );
            })}
          </div>
          {weatherPillar && (
            <button onClick={() => { haptic("light"); onGoPillar(weatherPillar); }}
              className="mt-3 w-full h-11 rounded-full font-bold text-[13px] flex items-center justify-center gap-2 text-white active:scale-95"
              style={{ background: "linear-gradient(135deg,#46703A,#7FB069)" }}>
              <Sparkles size={14} /> Que tal ir para: {pillars.find(p => p.id === weatherPillar)?.title}?
            </button>
          )}
        </div>
      </section>

      {/* 6 pilares */}
      <section className="px-5 pt-6">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#46703A" }}>
          Os 6 pilares diurnos
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <button key={p.id} onClick={() => { haptic("light"); onGoPillar(p.id); }}
                className="text-left rounded-[20px] p-3.5 active:scale-[0.98]"
                style={{ background: p.bg, border: `1px solid ${p.tint}25`, minHeight: 118 }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${p.tint}22` }}>
                  <Icon size={20} style={{ color: p.tint }} strokeWidth={2} />
                </div>
                <p className="mt-2.5 text-[14.5px] font-bold leading-tight" style={{ color: ink }}>{p.title}</p>
                <p className="mt-0.5 text-[11.5px] leading-snug" style={{ color: inkSoft }}>{p.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* SOS discreto */}
      <section className="px-5 pt-5">
        <button onClick={() => { haptic("medium"); onGoSos(); }}
          className="w-full rounded-[18px] p-3.5 flex items-center gap-3 active:scale-[0.98]"
          style={{ background: "rgba(214,63,92,0.08)", border: "1px solid rgba(214,63,92,0.22)" }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "#D63F5C", color: "#fff" }}>
            <LifeBuoy size={20} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[13.5px] font-bold" style={{ color: ink }}>SOS emocional</p>
            <p className="text-[11.5px]" style={{ color: inkSoft }}>Apoio imediato quando a emoção fica grande demais.</p>
          </div>
          <ChevronRight size={16} style={{ color: "#D63F5C" }} />
        </button>
      </section>

      {/* Resumo da semana */}
      <section className="px-5 pt-6">
        <div className="rounded-[22px] p-4"
          style={{ background: "linear-gradient(135deg,#7FB06933,#46703A22)", border: "1px solid rgba(70,112,58,0.20)" }}>
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "#46703A" }}>
            ✦ Termômetro da semana
          </p>
          <p className="mt-1 text-[13.5px] leading-snug" style={{ color: ink }}>
            Esta semana sua família registrou <strong>{weekStats.tarefas}</strong> pequenas vitórias
            e <strong>{weekStats.momentos}</strong> momentos guardados no jarro.
          </p>
          <button onClick={handleShare}
            className="mt-3 h-10 px-4 rounded-full font-bold text-[12.5px] flex items-center gap-1.5 active:scale-95"
            style={{ background: "#fff", color: ink, border: "1px solid rgba(42,37,32,0.10)" }}>
            <Share2 size={13} /> Compartilhar
          </button>
        </div>
      </section>

      {/* Link discreto para Sonhos */}
      <section className="px-5 pt-6">
        <button onClick={() => { haptic("light"); onGoDreams(); }}
          className="w-full rounded-[16px] p-3.5 flex items-center gap-3 active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg,#2a2a4a10,#6C5CB815)",
            border: "1px solid rgba(108,92,184,0.20)",
          }}>
          <span className="text-[22px]">🌙</span>
          <div className="flex-1 text-left">
            <p className="text-[13px] font-semibold" style={{ color: ink }}>Hora de dormir?</p>
            <p className="text-[11.5px]" style={{ color: inkSoft }}>Sons, histórias e ritual noturno vivem em Sonhos.</p>
          </div>
          <ChevronRight size={16} style={{ color: "#6C5CB8" }} />
        </button>
      </section>
    </div>
  );
};

export default KalmHome;

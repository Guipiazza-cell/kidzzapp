/**
 * KALM v2 — Home enxuta. Renderiza header, hero, 4+1 caminhos,
 * termômetro emocional, jarro, vitórias, sussurro e resumo.
 */
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Wind, Sparkles, LifeBuoy, Moon, Heart, Crown, Play, Share2, Plus } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import { useAuth } from "@/contexts/AuthContext";
import {
  WINS, BADGES, findActivity,
  type Activity,
} from "./data";
import {
  useMood, useJar, useWins, useBadges, useKalmStreak, useWeekStats,
  type MoodValue,
} from "./state";

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
  if (h < 12) return "BOM DIA, FAMÍLIA 💚";
  if (h < 18) return "BOA TARDE, FAMÍLIA 💚";
  return "BOA NOITE, FAMÍLIA 💚";
};

interface Props {
  onBack: () => void;
  onGoPath: (path: "relaxar" | "ritual" | "sos" | "dormir" | "vinculo") => void;
  onOpenActivity: (a: Activity) => void;
}

const KalmHome = ({ onBack, onGoPath, onOpenActivity }: Props) => {
  const { profile } = useAuth();
  const { today: moodToday, set: setMood } = useMood();
  const { items: jarItems, add: addJar } = useJar();
  const { today: winsToday, toggle: toggleWin, count: winsCount } = useWins();
  const { earned, grant } = useBadges();
  const { streak, markToday } = useKalmStreak();
  const weekStats = useWeekStats();
  const [jarText, setJarText] = useState("");

  // Concede selos passivos quando condições batem
  useEffect(() => {
    if (moodToday) grant("coracao-coragem");
    if (jarItems.length >= 5) grant("estrela-gratidao");
    if (winsCount >= 3) grant("arco-iris");
    if (streak.count >= 3) grant("borboleta");
  }, [moodToday, jarItems.length, winsCount, streak.count, grant]);

  const moodSuggestion = useMemo(() => {
    if (!moodToday) return null;
    if (moodToday === "muito_mal" || moodToday === "mal") return findActivity("bolhas-magicas");
    if (moodToday === "medio") return findActivity("zumbido-camaleao") || findActivity("frasco-calma");
    return findActivity("tres-boas") || findActivity("caca-beleza");
  }, [moodToday]);

  const handleMood = (v: MoodValue) => {
    haptic("light"); sfx("click");
    setMood(v); markToday();
  };

  const handleSaveJar = () => {
    if (!jarText.trim()) return;
    haptic("light"); addJar(jarText); setJarText("");
  };

  const handleShare = async () => {
    const txt = `Esta semana nossa família completou ${weekStats.tarefas} tarefas, registrou ${weekStats.momentos} momentos felizes 💚 — KALM by Kidzz`;
    try {
      if (navigator.share) await navigator.share({ title: "KALM by Kidzz", text: txt });
      else await navigator.clipboard.writeText(txt);
      haptic("light");
    } catch { /* noop */ }
  };

  const paths = [
    { id: "relaxar" as const, icon: Wind, title: "Relaxar agora", desc: "Exercícios para acalmar a mente.", tint: "#7FB069" },
    { id: "ritual"  as const, icon: Sparkles, title: "Ritual rápido", desc: "Atividades curtas para recarregar seu dia.", tint: "#E8821A" },
    { id: "sos"     as const, icon: LifeBuoy, title: "SOS emocional", desc: "Apoio imediato para momentos difíceis.", tint: "#46703A" },
    { id: "dormir"  as const, icon: Moon, title: "Dormir melhor", desc: "Histórias e sons para noites tranquilas.", tint: "#6C5CB8" },
  ];

  const moods: { v: MoodValue; emoji: string; label: string; color: string }[] = [
    { v: "muito_mal", emoji: "😣", label: "Muito mal", color: "#D63F5C" },
    { v: "mal",       emoji: "😟", label: "Mal", color: "#E8821A" },
    { v: "medio",     emoji: "😐", label: "Mais ou menos", color: "#C9A227" },
    { v: "bem",       emoji: "🙂", label: "Bem", color: "#7FB069" },
    { v: "muito_bem", emoji: "😊", label: "Muito bem", color: "#4F8FC9" },
  ];

  return (
    <div className="min-h-full pb-32 relative" style={{
      background: `linear-gradient(180deg, #FBF7EF 0%, #FFFCF8 60%)`,
      fontFamily: "'Nunito', system-ui, sans-serif",
    }}>
      {/* Header vidro */}
      <div className="px-4 pt-[max(14px,env(safe-area-inset-top))] pb-3 flex items-center gap-2">
        <button onClick={() => { haptic("light"); onBack(); }} aria-label="Voltar"
          className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95" style={glassChrome}>
          <ArrowLeft size={18} style={{ color: ink }} />
        </button>
        <div className="flex-1 h-11 rounded-full flex items-center justify-center text-[14px] font-bold gap-1.5"
          style={{ ...glassChrome, color: ink }}>
          🌿 Wellness
        </div>
        <div className="h-11 px-3 rounded-full flex items-center gap-1 text-[11.5px] font-bold"
          style={{ ...glassChrome, color: "#46703A" }}>
          ⚡ {streak.count || 1} {streak.count === 1 ? "dia" : "dias"} de calma
        </div>
      </div>

      {/* Herói */}
      <section className="px-5 pt-2">
        <p className="text-[11px] font-bold tracking-[0.18em]" style={{ color: "#46703A" }}>
          {greetByHour()}
        </p>
        <h1 className="mt-2 leading-[1.05]" style={{
          color: ink, fontFamily: "'Nunito', system-ui, sans-serif",
          fontSize: "clamp(28px, 8.6vw, 36px)",
        }}>
          Cuidar das emoções hoje,
          <span style={{ fontStyle: "italic", color: "#46703A" }}> transforma o amanhã.</span>
        </h1>
        <p className="mt-2 text-[14px]" style={{ color: inkSoft }}>
          Pequenas escolhas hoje, grandes conexões sempre.
        </p>
        {/* Slot do camaleão meditando (fallback gradiente) */}
        <div className="mt-4 h-[140px] rounded-[24px] flex items-center justify-center text-[60px]"
          style={{
            background: "linear-gradient(135deg,#7FB06933,#46703A22)",
            border: "1px solid rgba(70,112,58,0.10)",
          }} aria-label="Camaleão meditando">
          🦎
        </div>
      </section>

      {/* 4 caminhos + 1 extra */}
      <section className="px-5 pt-5 grid grid-cols-2 gap-2.5">
        {paths.map((p) => {
          const Icon = p.icon;
          return (
            <button key={p.id} onClick={() => { haptic("light"); onGoPath(p.id); }}
              className="text-left rounded-[20px] p-3.5 active:scale-[0.98]"
              style={{ background: cream, border: "1px solid rgba(42,37,32,0.06)", minHeight: 124 }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${p.tint}22` }}>
                <Icon size={20} style={{ color: p.tint }} strokeWidth={2} />
              </div>
              <p className="mt-2.5 text-[14px] font-bold leading-tight" style={{ color: ink, fontFamily: "'Nunito', system-ui, sans-serif" }}>
                {p.title}
              </p>
              <p className="mt-0.5 text-[11.5px] leading-snug" style={{ color: inkSoft }}>
                {p.desc}
              </p>
            </button>
          );
        })}
        {/* Card extra Vínculo */}
        <button onClick={() => { haptic("light"); onGoPath("vinculo"); }}
          className="col-span-2 text-left rounded-[20px] p-3.5 flex items-center gap-3 active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg,#C9A22720,#7FB06920)",
            border: "1px solid rgba(201,162,39,0.25)",
          }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#C9A227,#7FB069)" }}>
            <Heart size={20} color="#fff" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14.5px] font-bold leading-tight" style={{ color: ink, fontFamily: "'Nunito', system-ui, sans-serif" }}>
              Vínculo em família
            </p>
            <p className="text-[11.5px]" style={{ color: inkSoft }}>
              Experiências para fortalecer o que importa.
            </p>
          </div>
        </button>
      </section>

      {/* Jarro da gratidão */}
      <section className="px-5 pt-6">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "#C9A227" }}>
          🫙 Jarro da gratidão
        </p>
        <div className="mt-2 rounded-[22px] p-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#1F3A2B,#0E1F18)",
            color: "#FFFCF8",
          }}>
          <h3 className="text-[20px] font-semibold leading-tight" style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}>
            O que foi bom hoje?
          </h3>
          <p className="text-[12.5px] opacity-80 mt-1">
            Coloque uma estrelinha no jarro e veja a gratidão crescer em família.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              value={jarText} onChange={(e) => setJarText(e.target.value)}
              placeholder="Um abraço, uma risada, um obrigado..."
              className="flex-1 h-11 rounded-full px-4 text-[13px] outline-none"
              style={{ background: "rgba(255,255,255,0.12)", color: "#FFFCF8" }}
              aria-label="Momento de gratidão"
            />
            <button onClick={handleSaveJar} aria-label="Guardar momento"
              className="h-11 px-4 rounded-full font-bold text-[12.5px] flex items-center gap-1 active:scale-95"
              style={{ background: "#C9A227", color: "#1F1A12" }}>
              <Plus size={14} /> Guardar
            </button>
          </div>
          {/* Estrelinhas acumuladas */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Array.from({ length: Math.min(jarItems.length, 24) }).map((_, i) => (
              <span key={i} className="text-[16px]" aria-hidden>⭐</span>
            ))}
            {jarItems.length === 0 && (
              <span className="text-[11.5px] opacity-60">Seu jarro está vazio. Comece hoje.</span>
            )}
          </div>
          {jarItems.length > 0 && (
            <p className="mt-2 text-[11px] opacity-70">{jarItems.length} momento{jarItems.length === 1 ? "" : "s"} guardado{jarItems.length === 1 ? "" : "s"}</p>
          )}
        </div>
      </section>

      {/* Pequenas vitórias */}
      <section className="px-5 pt-6">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "#E8821A" }}>
            ✦ Pequenas vitórias
          </p>
          <span className="text-[11px] font-bold px-2 h-6 rounded-full flex items-center"
            style={{ background: "#E8821A22", color: "#E8821A" }}>
            {winsCount} conquistadas
          </span>
        </div>
        <p className="mt-1 text-[12.5px]" style={{ color: inkSoft }}>
          Marque o que aconteceu hoje. Cada toque é uma vitória.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {WINS.map((w) => {
            const on = !!winsToday[w.id];
            return (
              <button key={w.id} onClick={() => { haptic("light"); toggleWin(w.id); }}
                className="rounded-2xl p-2.5 flex items-center gap-2 text-left active:scale-95"
                style={{
                  background: on
                    ? "linear-gradient(135deg,#7FB069,#46703A)"
                    : cream,
                  border: `1px solid ${on ? "transparent" : "rgba(42,37,32,0.06)"}`,
                  color: on ? "#fff" : ink,
                }} aria-pressed={on}>
                <span className="text-[20px]" aria-hidden>{w.emoji}</span>
                <span className="flex-1 text-[12.5px] font-semibold leading-tight">{w.label}</span>
                {on && <span className="text-[14px]">✓</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Termômetro emocional */}
      <section className="px-5 pt-6">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "#46703A" }}>
          Como você está sentindo hoje?
        </p>
        <div className="mt-3 rounded-[20px] p-3"
          style={{ background: cream, border: "1px solid rgba(42,37,32,0.06)" }}>
          <div className="flex items-stretch justify-between gap-1.5">
            {moods.map((m) => {
              const on = moodToday === m.v;
              return (
                <button key={m.v} onClick={() => handleMood(m.v)}
                  className="flex-1 flex flex-col items-center justify-center py-2 rounded-2xl active:scale-95"
                  style={{
                    background: on ? `${m.color}22` : "transparent",
                    border: `1.5px solid ${on ? m.color : "transparent"}`,
                  }}
                  aria-label={m.label} aria-pressed={on}>
                  <span className="text-[26px] leading-none" aria-hidden>{m.emoji}</span>
                  <span className="mt-1 text-[10px] font-bold leading-tight text-center"
                    style={{ color: on ? m.color : inkSoft }}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
          {moodSuggestion && (
            <button onClick={() => { haptic("light"); onOpenActivity(moodSuggestion); }}
              className="mt-3 w-full h-11 rounded-full font-bold text-[13px] flex items-center justify-center gap-2 text-white active:scale-95"
              style={{ background: "linear-gradient(135deg,#46703A,#7FB069)" }}>
              <Sparkles size={14} /> Tente: {moodSuggestion.title}
            </button>
          )}
        </div>
      </section>

      {/* Sussurro do Kidzz */}
      <section className="px-5 pt-6">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "#7FB069" }}>
          Sussurro do Kidzz
        </p>
        <div className="mt-2 rounded-[20px] p-3.5 flex items-center gap-3"
          style={{ background: "rgba(127,176,105,0.12)", border: "1px solid rgba(127,176,105,0.25)" }}>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] leading-snug" style={{ color: ink }}>
              Hoje vocês parecem precisar desacelerar. Que tal um som da floresta?
            </p>
          </div>
          <button aria-label="Tocar som da floresta"
            className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95"
            style={{ background: "#7FB069", color: "#fff" }}
            onClick={() => { haptic("light"); /* SLOT_AUDIO: somFloresta */ }}>
            <Play size={16} fill="#fff" />
          </button>
        </div>
      </section>

      {/* Coleção de momentos (selos) */}
      <section className="px-5 pt-6">
        <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "#C9A227" }}>
          ✦ Coleção de momentos
        </p>
        <p className="mt-1 text-[12.5px]" style={{ color: inkSoft }}>
          Conquistas suaves, só por estar aqui.
        </p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {BADGES.map((b) => {
            const isOn = !!earned[b.id];
            return (
              <div key={b.id} className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[24px]"
                  style={{
                    background: isOn ? b.gradient : "rgba(232,130,26,0.10)",
                    opacity: isOn ? 1 : 0.55,
                    boxShadow: isOn ? "0 8px 18px -6px rgba(42,37,32,0.25)" : "none",
                    filter: isOn ? "none" : "grayscale(0.3)",
                  }} aria-label={`${b.label} ${isOn ? "conquistado" : "pendente"}`}>
                  <span aria-hidden>{b.emoji}</span>
                </div>
                <span className="text-[9.5px] text-center font-semibold leading-tight"
                  style={{ color: isOn ? ink : inkSoft }}>
                  {b.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Resumo da semana */}
      <section className="px-5 pt-6">
        <div className="rounded-[22px] p-4"
          style={{ background: "linear-gradient(135deg,#7FB06933,#46703A22)", border: "1px solid rgba(70,112,58,0.20)" }}>
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: "#46703A" }}>
            ✦ Resumo da semana
          </p>
          <p className="mt-1 text-[13.5px] leading-snug" style={{ color: ink }}>
            Esta semana sua família completou <strong>{weekStats.tarefas}</strong> tarefas,
            registrou <strong>{weekStats.momentos}</strong> momentos felizes e está construindo
            conexões que ficam para sempre.
          </p>
          <button onClick={handleShare}
            className="mt-3 h-10 px-4 rounded-full font-bold text-[12.5px] flex items-center gap-1.5 active:scale-95"
            style={{ background: "#fff", color: ink, border: "1px solid rgba(42,37,32,0.10)" }}>
            <Share2 size={13} /> Compartilhar
          </button>
        </div>
      </section>
    </div>
  );
};

export default KalmHome;

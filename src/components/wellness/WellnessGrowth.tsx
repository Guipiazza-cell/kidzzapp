import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Heart, Quote, Wind, Trophy, Share2, Plus, X, Check } from "lucide-react";
import { haptic } from "@/lib/haptics";
import kalmChameleon from "@/assets/kalm-chameleon.png.asset.json";

/* ───────── Design tokens (aligned with WellnessHub) ───────── */
const ink = "#27302A";
const inkSoft = "#5A6660";
const sage = "#9CB39A";
const emerald = "#5A8F77";
const clay = "#C9A48A";
const gold = "#C9A84C";
const lilac = "#CFC4E0";
const serenity = "#BCCCD8";
const surface = "rgba(255,255,255,0.68)";
const stroke = "rgba(39,48,42,0.08)";

const tap = { type: "spring" as const, stiffness: 380, damping: 28, mass: 0.6 };

const Surface = ({ children, className = "", style }: any) => (
  <div
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
  <div className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: inkSoft }}>
    {children}
  </div>
);

const SectionTitle = ({ kicker, title, sub }: any) => (
  <div className="px-5 pt-8 pb-3">
    {kicker && <Eyebrow>{kicker}</Eyebrow>}
    <h2
      className="mt-1 text-[22px] leading-tight font-semibold"
      style={{ color: ink, letterSpacing: "-0.01em" }}
    >
      {title}
    </h2>
    {sub && <p className="mt-1 text-[14px]" style={{ color: inkSoft }}>{sub}</p>}
  </div>
);

const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dayKey(d);
};

function useLS<T>(key: string, initial: T) {
  const [val, setVal] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setVal((prev) => {
        const next = typeof v === "function" ? (v as any)(prev) : v;
        try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
        return next;
      });
    },
    [key]
  );
  return [val, set] as const;
}

/* ═════════════════ BLOCO 1 — Como estamos hoje ═════════════════ */
type MoodVal = "happy" | "neutral" | "sad" | "angry" | "anxious" | "tired";
const MOODS: { v: MoodVal; emoji: string; label: string; score: number; color: string }[] = [
  { v: "happy",   emoji: "🙂", label: "Feliz",    score: 5, color: emerald },
  { v: "neutral", emoji: "😐", label: "Neutro",   score: 3, color: sage },
  { v: "sad",     emoji: "😔", label: "Triste",   score: 2, color: serenity },
  { v: "angry",   emoji: "😡", label: "Irritado", score: 1, color: clay },
  { v: "anxious", emoji: "😰", label: "Ansioso",  score: 2, color: lilac },
  { v: "tired",   emoji: "😴", label: "Cansado",  score: 2, color: serenity },
];

type Who = "child" | "parent";
type MoodEntry = { v: MoodVal; ts: number };
type MoodLog = Record<string, { child?: MoodEntry; parent?: MoodEntry }>;

const HowAreWe = () => {
  const [log, setLog] = useLS<MoodLog>("kidzz_wellness_mood_v2", {});
  const [who, setWho] = useState<Who>("child");
  const [range, setRange] = useState<7 | 30>(7);
  const today = dayKey();
  const todays = log[today]?.[who];

  const setMood = (v: MoodVal) => {
    haptic("light");
    setLog((prev) => ({
      ...prev,
      [today]: { ...(prev[today] ?? {}), [who]: { v, ts: Date.now() } },
    }));
  };

  const series = useMemo(() => {
    const arr: { date: string; childScore: number; parentScore: number; emoji?: string }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = daysAgo(i);
      const day = log[d];
      const cs = day?.child ? MOODS.find((m) => m.v === day.child!.v)?.score ?? 0 : 0;
      const ps = day?.parent ? MOODS.find((m) => m.v === day.parent!.v)?.score ?? 0 : 0;
      arr.push({ date: d, childScore: cs, parentScore: ps, emoji: day?.child ? MOODS.find((m) => m.v === day.child!.v)?.emoji : undefined });
    }
    return arr;
  }, [log, range]);

  const max = 5;

  return (
    <div className="px-5 pt-3">
      <Surface className="p-4">
        <div className="flex items-center justify-between">
          <Eyebrow>Como estamos hoje?</Eyebrow>
          <div className="flex items-center gap-1 p-0.5 rounded-full" style={{ background: `${ink}0d` }}>
            {(["child", "parent"] as Who[]).map((w) => (
              <button
                key={w}
                onClick={() => { haptic("light"); setWho(w); }}
                className="px-2.5 h-7 rounded-full text-[11px] font-semibold"
                style={{
                  background: who === w ? "#fff" : "transparent",
                  color: who === w ? ink : inkSoft,
                  boxShadow: who === w ? "0 2px 8px -4px rgba(0,0,0,0.2)" : "none",
                }}
              >
                {w === "child" ? "Criança" : "Pai/Mãe"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-6 gap-1.5">
          {MOODS.map((m) => {
            const on = todays?.v === m.v;
            return (
              <motion.button
                key={m.v}
                whileTap={{ scale: 0.9 }}
                transition={tap}
                onClick={() => setMood(m.v)}
                className="min-h-[58px] rounded-2xl flex flex-col items-center justify-center gap-0.5"
                style={{
                  background: on ? `${m.color}26` : "transparent",
                  border: `1px solid ${on ? `${m.color}66` : stroke}`,
                }}
                aria-label={m.label}
              >
                <span className="text-[22px] leading-none">{m.emoji}</span>
                <span className="text-[9px]" style={{ color: inkSoft }}>{m.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Trend */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold" style={{ color: ink }}>Tendência</span>
            <div className="flex items-center gap-1 p-0.5 rounded-full" style={{ background: `${ink}0d` }}>
              {[7, 30].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r as 7 | 30)}
                  className="px-2.5 h-6 rounded-full text-[10px] font-semibold"
                  style={{
                    background: range === r ? "#fff" : "transparent",
                    color: range === r ? ink : inkSoft,
                  }}
                >
                  {r} dias
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-end gap-[3px] h-20">
            {series.map((p, i) => (
              <div key={p.date} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                <motion.div
                  initial={{ height: 2 }}
                  animate={{ height: 4 + (p.childScore / max) * 56 }}
                  transition={{ duration: 0.5, delay: i * 0.01 }}
                  className="w-full rounded-t-md"
                  style={{
                    background: p.childScore > 0 ? `linear-gradient(180deg, ${sage}, ${emerald})` : `${ink}10`,
                    maxWidth: 12,
                  }}
                />
                {p.parentScore > 0 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 2 + (p.parentScore / max) * 16 }}
                    className="w-full rounded-b-md"
                    style={{ background: clay, maxWidth: 12 }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3 text-[10px]" style={{ color: inkSoft }}>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: emerald }} /> Criança
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: clay }} /> Pai/Mãe
            </span>
          </div>
        </div>
      </Surface>
    </div>
  );
};

/* ═════════════════ BLOCO 2 — Pequenas vitórias ═════════════════ */
const VICTORIES = [
  { id: "thanks", emoji: "🙏", label: "Hoje agradeci alguém" },
  { id: "water",  emoji: "💧", label: "Hoje bebi mais água" },
  { id: "help",   emoji: "🤝", label: "Hoje ajudei alguém" },
  { id: "brave",  emoji: "🦁", label: "Hoje fui corajoso" },
  { id: "task",   emoji: "✅", label: "Hoje terminei uma tarefa" },
  { id: "teeth",  emoji: "🦷", label: "Hoje escovei os dentes sem reclamar" },
];

const Confetti = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {[...Array(18)].map((_, i) => (
      <motion.span
        key={i}
        className="absolute rounded-full"
        style={{
          width: 6, height: 6,
          left: `${10 + (i * 5) % 80}%`,
          top: "40%",
          background: [emerald, gold, clay, lilac, sage][i % 5],
        }}
        initial={{ y: 0, opacity: 1, scale: 1 }}
        animate={{ y: -120 - (i % 5) * 20, x: (i % 2 ? 1 : -1) * (20 + i * 3), opacity: 0, rotate: 360 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    ))}
  </div>
);

const SmallWins = () => {
  const [done, setDone] = useLS<Record<string, string[]>>("kidzz_wins_v1", {});
  const [total, setTotal] = useLS<number>("kidzz_wins_total_v1", 0);
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const today = dayKey();
  const todays = done[today] ?? [];

  const toggle = (id: string) => {
    if (todays.includes(id)) return;
    haptic("medium");
    setDone((p) => ({ ...p, [today]: [...(p[today] ?? []), id] }));
    setTotal((t) => t + 1);
    setCelebrate(id);
    setTimeout(() => setCelebrate(null), 1300);
  };

  return (
    <div className="px-5">
      <Surface className="p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <Eyebrow>Pequenas vitórias</Eyebrow>
          <div
            className="flex items-center gap-1 px-2.5 h-6 rounded-full text-[11px] font-semibold"
            style={{ background: `${gold}22`, color: ink, border: `1px solid ${gold}44` }}
          >
            <Trophy size={11} style={{ color: gold }} /> {total} conquistadas
          </div>
        </div>
        <p className="mt-1 text-[14px]" style={{ color: ink }}>
          Marque o que aconteceu hoje. Cada toque é uma vitória.
        </p>

        <div className="mt-3 grid grid-cols-1 gap-2">
          {VICTORIES.map((v) => {
            const on = todays.includes(v.id);
            return (
              <motion.button
                key={v.id}
                whileTap={{ scale: 0.98 }}
                transition={tap}
                onClick={() => toggle(v.id)}
                className="flex items-center gap-3 px-3 h-12 rounded-2xl text-left relative"
                style={{
                  background: on ? `${emerald}1f` : "rgba(255,255,255,0.55)",
                  border: `1px solid ${on ? `${emerald}55` : stroke}`,
                }}
              >
                <span className="text-[20px]">{v.emoji}</span>
                <span className="flex-1 text-[13px] font-medium" style={{ color: ink }}>{v.label}</span>
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: on ? emerald : "transparent", border: `1.5px solid ${on ? emerald : `${ink}33`}` }}
                >
                  {on && <Check size={14} color="#fff" strokeWidth={3} />}
                </span>
                {celebrate === v.id && <Confetti />}
              </motion.button>
            );
          })}
        </div>
      </Surface>
    </div>
  );
};

/* ═════════════════ BLOCO 3 — Jarro da gratidão ═════════════════ */
type Grat = { id: string; text: string; ts: number };

const GratitudeJar = () => {
  const [items, setItems] = useLS<Grat[]>("kidzz_gratitude_v1", []);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const add = () => {
    const t = text.trim();
    if (!t) return;
    haptic("light");
    setItems((arr) => [{ id: crypto.randomUUID(), text: t, ts: Date.now() }, ...arr].slice(0, 200));
    setText("");
    setOpen(false);
  };

  const filled = items.length >= 30;

  return (
    <div className="px-5">
      <Surface className="p-4 relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Eyebrow>Jarro da gratidão</Eyebrow>
            <p className="mt-1 text-[14px]" style={{ color: ink }}>O que foi bom hoje?</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { haptic("light"); setOpen(true); }}
            className="px-3 h-9 rounded-full flex items-center gap-1.5 text-[12px] font-semibold"
            style={{ background: ink, color: "#fff" }}
          >
            <Plus size={14} /> Guardar
          </motion.button>
        </div>

        {/* Jar visual */}
        <div className="mt-3 mx-auto w-[180px] h-[200px] relative">
          <div
            className="absolute inset-x-3 top-3 bottom-0 rounded-b-[40px] rounded-t-[18px] overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.6), rgba(188,204,216,0.35))",
              border: `1.5px solid ${stroke}`,
              boxShadow: "inset 0 0 30px rgba(255,255,255,0.6)",
            }}
          >
            {items.slice(0, 60).map((_, i) => {
              const rand = (i * 9301 + 49297) % 233280 / 233280;
              const rand2 = (i * 7919 + 104729) % 233280 / 233280;
              return (
                <motion.span
                  key={i}
                  className="absolute"
                  style={{
                    left: `${10 + rand * 75}%`,
                    bottom: `${(i * 6) % 70}%`,
                    fontSize: 12 + (i % 3) * 2,
                    filter: `drop-shadow(0 0 4px ${gold}aa)`,
                  }}
                  animate={{ y: [0, -3, 0], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3 + rand2 * 2, repeat: Infinity, delay: i * 0.05 }}
                >
                  ⭐
                </motion.span>
              );
            })}
          </div>
          {/* Lid */}
          <div
            className="absolute left-1 right-1 top-0 h-5 rounded-full"
            style={{ background: `linear-gradient(180deg, ${clay}, ${clay}cc)`, border: `1px solid ${stroke}` }}
          />
        </div>

        <p className="mt-2 text-center text-[12px]" style={{ color: inkSoft }}>
          {items.length === 0
            ? "Coloque a primeira estrelinha."
            : `${items.length} ${items.length === 1 ? "momento guardado" : "momentos guardados"}`}
        </p>
        {filled && (
          <p className="mt-1 text-center text-[12px] font-semibold" style={{ color: emerald }}>
            ✨ Seu pote já está cheio de momentos especiais.
          </p>
        )}

        {items.length > 0 && (
          <div className="mt-3 max-h-[120px] overflow-y-auto space-y-1.5">
            {items.slice(0, 5).map((g) => (
              <div key={g.id} className="text-[12px] px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.55)", color: ink }}>
                <span style={{ color: gold }}>⭐</span> {g.text}
              </div>
            ))}
          </div>
        )}
      </Surface>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="fixed inset-x-4 bottom-6 z-[100] rounded-3xl p-5"
              style={{ background: "#fff", border: `1px solid ${stroke}` }}
            >
              <div className="flex items-center justify-between">
                <Eyebrow>O que foi bom hoje?</Eyebrow>
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${ink}10` }}>
                  <X size={14} color={ink} />
                </button>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Brinquei com meu irmão…"
                rows={3}
                className="mt-3 w-full rounded-2xl p-3 text-[14px] outline-none resize-none"
                style={{ background: `${ink}08`, color: ink, border: `1px solid ${stroke}` }}
                maxLength={140}
              />
              <button
                onClick={add}
                className="mt-3 w-full h-12 rounded-full text-[14px] font-semibold"
                style={{ background: emerald, color: "#fff" }}
              >
                Guardar no pote
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═════════════════ BLOCO 4 — Missão do dia ═════════════════ */
const MISSIONS = [
  { emoji: "❤️", text: "Dar um abraço demorado." },
  { emoji: "🌳", text: "Observar a natureza por 2 minutos." },
  { emoji: "😊", text: "Fazer alguém sorrir." },
  { emoji: "📚", text: "Aprender uma curiosidade nova." },
  { emoji: "🤝", text: "Ajudar alguém sem pedir nada em troca." },
  { emoji: "✏️", text: "Desenhar como você se sente hoje." },
  { emoji: "🌟", text: "Elogiar alguém da família." },
  { emoji: "🧸", text: "Brincar 10 minutos sem tela." },
  { emoji: "🎶", text: "Dançar uma música até o fim." },
  { emoji: "🌸", text: "Cheirar uma flor ou uma fruta." },
];

const DailyMission = () => {
  const [state, setState] = useLS<{ date: string; idx: number; done: boolean; lastIdx: number }>(
    "kidzz_mission_v1",
    { date: "", idx: 0, done: false, lastIdx: -1 }
  );
  const today = dayKey();

  useEffect(() => {
    if (state.date !== today) {
      let next = Math.floor(Math.random() * MISSIONS.length);
      if (next === state.lastIdx) next = (next + 1) % MISSIONS.length;
      setState({ date: today, idx: next, done: false, lastIdx: state.idx });
    }
  }, [today, state.date, state.idx, state.lastIdx, setState]);

  const m = MISSIONS[state.idx];

  return (
    <div className="px-5">
      <Surface
        className="p-4"
        style={{ background: `linear-gradient(135deg, ${emerald}14, ${sage}14)`, borderColor: `${emerald}30` }}
      >
        <Eyebrow>Missão do dia</Eyebrow>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-[34px]">{m.emoji}</span>
          <p className="flex-1 text-[15px] font-semibold leading-snug" style={{ color: ink }}>{m.text}</p>
        </div>
        <button
          onClick={() => { haptic("medium"); setState((s) => ({ ...s, done: !s.done })); }}
          className="mt-3 w-full h-11 rounded-full text-[13px] font-semibold flex items-center justify-center gap-2"
          style={{
            background: state.done ? emerald : "#fff",
            color: state.done ? "#fff" : ink,
            border: `1px solid ${state.done ? emerald : stroke}`,
          }}
        >
          {state.done ? <><Check size={14} /> Missão cumprida</> : "Marcar como feita"}
        </button>
      </Surface>
    </div>
  );
};

/* ═════════════════ BLOCO 5 — Memória feliz do passado ═════════════════ */
const HappyMemory = () => {
  const [items] = useLS<Grat[]>("kidzz_gratitude_v1", []);
  const [wins] = useLS<Record<string, string[]>>("kidzz_wins_v1", {});

  const memory = useMemo(() => {
    const old = items.filter((g) => Date.now() - g.ts > 2 * 24 * 60 * 60 * 1000);
    if (old.length > 0) {
      const pick = old[Math.floor(Math.random() * old.length)];
      const days = Math.floor((Date.now() - pick.ts) / (24 * 60 * 60 * 1000));
      return { text: pick.text, days };
    }
    const dates = Object.keys(wins).filter((d) => d !== dayKey());
    if (dates.length > 0) {
      const d = dates[Math.floor(Math.random() * dates.length)];
      const days = Math.floor((Date.now() - new Date(d).getTime()) / (24 * 60 * 60 * 1000));
      const ids = wins[d];
      const v = VICTORIES.find((x) => x.id === ids[0]);
      if (v) return { text: v.label.toLowerCase(), days };
    }
    return null;
  }, [items, wins]);

  if (!memory) return null;

  return (
    <div className="px-5">
      <Surface className="p-4" style={{ background: `linear-gradient(135deg, ${lilac}22, ${serenity}22)` }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${lilac}55` }}>
            <Heart size={18} style={{ color: ink }} />
          </div>
          <div className="flex-1">
            <Eyebrow>Memória feliz</Eyebrow>
            <p className="mt-1 text-[13px]" style={{ color: inkSoft }}>
              Há {memory.days} {memory.days === 1 ? "dia" : "dias"} você escreveu:
            </p>
            <p className="mt-1 text-[15px] font-medium leading-snug" style={{ color: ink }}>
              "{memory.text}"
            </p>
          </div>
        </div>
      </Surface>
    </div>
  );
};

/* ═════════════════ BLOCO 6 — Termômetro da família ═════════════════ */
const FamilyThermometer = () => {
  const [wins] = useLS<Record<string, string[]>>("kidzz_wins_v1", {});
  const [grats] = useLS<Grat[]>("kidzz_gratitude_v1", []);
  const [moods] = useLS<MoodLog>("kidzz_wellness_mood_v2", {});
  const [mission] = useLS<{ done: boolean } | null>("kidzz_mission_v1", null);

  // weekly aggregation
  const weekly = useMemo(() => {
    const last7 = Array.from({ length: 7 }, (_, i) => daysAgo(i));
    const winCount = last7.reduce((s, d) => s + (wins[d]?.length ?? 0), 0);
    const gratCount = grats.filter((g) => Date.now() - g.ts < 7 * 86400000).length;
    const moodCount = last7.reduce((s, d) => s + (moods[d]?.child ? 1 : 0), 0);
    const missionDone = mission?.done ? 1 : 0;
    return {
      conexao: Math.min(100, gratCount * 12 + winCount * 4),
      gratidao: Math.min(100, gratCount * 15),
      rotina: Math.min(100, moodCount * 14),
      bemestar: Math.min(100, winCount * 8 + moodCount * 5),
      momentos: Math.min(100, gratCount * 8 + missionDone * 15 + winCount * 4),
    };
  }, [wins, grats, moods, mission]);

  const bars = [
    { key: "conexao",  emoji: "💚", label: "Conexão",         val: weekly.conexao,  color: emerald },
    { key: "gratidao", emoji: "💙", label: "Gratidão",        val: weekly.gratidao, color: serenity },
    { key: "rotina",   emoji: "💛", label: "Rotina",          val: weekly.rotina,   color: gold },
    { key: "bemestar", emoji: "🧡", label: "Bem-estar",       val: weekly.bemestar, color: clay },
    { key: "momentos", emoji: "❤️", label: "Momentos juntos", val: weekly.momentos, color: "#D97A7A" },
  ];

  return (
    <div className="px-5">
      <Surface className="p-4">
        <Eyebrow>Termômetro da família</Eyebrow>
        <p className="mt-1 text-[13px]" style={{ color: inkSoft }}>Sua evolução desta semana.</p>
        <div className="mt-3 space-y-2.5">
          {bars.map((b) => (
            <div key={b.key}>
              <div className="flex items-center justify-between text-[12px]" style={{ color: ink }}>
                <span className="flex items-center gap-1.5">
                  <span>{b.emoji}</span>
                  <span className="font-medium">{b.label}</span>
                </span>
                <span style={{ color: inkSoft }}>{b.val}%</span>
              </div>
              <div className="mt-1 h-2 rounded-full overflow-hidden" style={{ background: `${ink}10` }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${b.val}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${b.color}aa, ${b.color})` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
};

/* ═════════════════ BLOCO 7 — Frase do dia ═════════════════ */
const PHRASES = [
  "Você não precisa ser perfeito para crescer.",
  "Todo abraço conta.",
  "Pequenas atitudes criam grandes memórias.",
  "Hoje também é uma oportunidade.",
  "Estar presente já é fazer muito.",
  "A calma se constrói um respiro de cada vez.",
  "Crescer junto é o maior projeto da família.",
  "Você é exatamente o que sua família precisa hoje.",
  "Memórias se constroem nos detalhes simples.",
  "Devagar também é um caminho.",
];

const DailyPhrase = () => {
  const idx = useMemo(() => {
    const d = new Date();
    const seed = d.getFullYear() * 1000 + d.getMonth() * 40 + d.getDate();
    return seed % PHRASES.length;
  }, []);

  return (
    <div className="px-5">
      <div
        className="rounded-[26px] p-5 text-center"
        style={{
          background: `linear-gradient(135deg, ${ink} 0%, #3B4842 100%)`,
          color: "#fff",
        }}
      >
        <Quote size={18} style={{ color: gold, margin: "0 auto" }} />
        <p
          className="mt-2 text-[17px] leading-snug font-medium"
          style={{ letterSpacing: "-0.01em", fontFamily: "Georgia, serif" }}
        >
          "{PHRASES[idx]}"
        </p>
      </div>
    </div>
  );
};

/* ═════════════════ BLOCO 8 — Respirar com o Camaleão ═════════════════ */
const BreatheChameleon = () => {
  const [duration, setDuration] = useState<30 | 60 | 90 | null>(null);
  const [remain, setRemain] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    if (!duration) return;
    setRemain(duration);
    const tick = setInterval(() => setRemain((r) => Math.max(0, r - 1)), 1000);
    const p = setInterval(() => setPhase((x) => (x === "in" ? "out" : "in")), 4000);
    const end = setTimeout(() => { setDuration(null); haptic("medium"); }, duration * 1000);
    return () => { clearInterval(tick); clearInterval(p); clearTimeout(end); };
  }, [duration]);

  return (
    <div className="px-5">
      <Surface className="p-4">
        <Eyebrow>Respirar com o camaleão</Eyebrow>
        <p className="mt-1 text-[13px]" style={{ color: inkSoft }}>Um respiro pequeno, do tamanho da sua vontade.</p>

        {!duration ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[30, 60, 90].map((d) => (
              <motion.button
                key={d}
                whileTap={{ scale: 0.96 }}
                onClick={() => { haptic("light"); setDuration(d as any); }}
                className="h-14 rounded-2xl text-[13px] font-semibold flex flex-col items-center justify-center"
                style={{ background: `${sage}22`, border: `1px solid ${sage}44`, color: ink }}
              >
                <span className="text-[16px]">{d}s</span>
                <span className="text-[10px] font-normal" style={{ color: inkSoft }}>
                  {d === 30 ? "rapidinho" : d === 60 ? "um minuto" : "mais profundo"}
                </span>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center">
            <div className="relative w-[180px] h-[180px] flex items-center justify-center">
              <motion.div
                animate={{ scale: phase === "in" ? 1.4 : 1, opacity: phase === "in" ? 1 : 0.7 }}
                transition={{ duration: 4, ease: [0.45, 0, 0.55, 1] }}
                className="absolute inset-0 rounded-full"
                style={{ background: `radial-gradient(circle, ${sage}55, transparent 70%)`, filter: "blur(10px)" }}
              />
              <motion.div
                animate={{ scale: phase === "in" ? 1.2 : 0.9 }}
                transition={{ duration: 4, ease: [0.45, 0, 0.55, 1] }}
                className="text-[78px] relative"
              >
                🦎
              </motion.div>
            </div>
            <div className="mt-1 text-[15px] font-semibold" style={{ color: ink }}>
              {phase === "in" ? "Inspire…" : "Expire…"}
            </div>
            <div className="mt-1 text-[12px]" style={{ color: inkSoft }}>{remain}s</div>
            <button
              onClick={() => setDuration(null)}
              className="mt-3 text-[12px] underline-offset-4 hover:underline"
              style={{ color: inkSoft }}
            >
              parar
            </button>
          </div>
        )}
      </Surface>
    </div>
  );
};

/* ═════════════════ BLOCO 9 — Coleção de momentos ═════════════════ */
const COLLECTIBLES = [
  { id: "leaf",      emoji: "🍀", label: "Folha da Calma",      need: 1,  trigger: "breath" },
  { id: "star",      emoji: "⭐", label: "Estrela da Gratidão", need: 3,  trigger: "gratitude" },
  { id: "heart",     emoji: "❤️", label: "Coração da Coragem",  need: 5,  trigger: "wins" },
  { id: "rainbow",   emoji: "🌈", label: "Arco-íris da Gentileza", need: 7, trigger: "wins" },
  { id: "butterfly", emoji: "🦋", label: "Borboleta da Alegria", need: 10, trigger: "any" },
];

const Collection = () => {
  const [wins] = useLS<Record<string, string[]>>("kidzz_wins_v1", {});
  const [grats] = useLS<Grat[]>("kidzz_gratitude_v1", []);
  const totalWins = Object.values(wins).reduce((s, a) => s + a.length, 0);
  const totalGrats = grats.length;

  const unlocked = (c: typeof COLLECTIBLES[number]) => {
    if (c.trigger === "gratitude") return totalGrats >= c.need;
    if (c.trigger === "wins") return totalWins >= c.need;
    if (c.trigger === "breath") return true; // unlocked on first visit
    return totalWins + totalGrats >= c.need;
  };

  return (
    <div className="px-5">
      <Surface className="p-4">
        <Eyebrow>Coleção de momentos</Eyebrow>
        <p className="mt-1 text-[13px]" style={{ color: inkSoft }}>Conquistas suaves, só por estar aqui.</p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {COLLECTIBLES.map((c) => {
            const on = unlocked(c);
            return (
              <div key={c.id} className="flex flex-col items-center text-center">
                <motion.div
                  animate={on ? { y: [0, -3, 0] } : {}}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-[24px]"
                  style={{
                    background: on ? `${gold}22` : `${ink}0a`,
                    border: `1px solid ${on ? `${gold}55` : stroke}`,
                    filter: on ? "none" : "grayscale(1) opacity(0.5)",
                  }}
                >
                  {c.emoji}
                </motion.div>
                <div className="mt-1 text-[9px] leading-tight" style={{ color: on ? ink : inkSoft }}>{c.label}</div>
              </div>
            );
          })}
        </div>
      </Surface>
    </div>
  );
};

/* ═════════════════ BLOCO 10 — Resumo da semana ═════════════════ */
const WeeklySummary = () => {
  const [wins] = useLS<Record<string, string[]>>("kidzz_wins_v1", {});
  const [grats] = useLS<Grat[]>("kidzz_gratitude_v1", []);

  const stats = useMemo(() => {
    const last7 = Array.from({ length: 7 }, (_, i) => daysAgo(i));
    const winCount = last7.reduce((s, d) => s + (wins[d]?.length ?? 0), 0);
    const gratCount = grats.filter((g) => Date.now() - g.ts < 7 * 86400000).length;
    return { winCount, gratCount };
  }, [wins, grats]);

  const share = async () => {
    haptic("light");
    const text = `Esta semana minha família completou ${stats.winCount} tarefas e registrou ${stats.gratCount} momentos felizes no KIDZZ ✨`;
    try {
      if (navigator.share) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <div className="px-5 pb-6">
      <Surface
        className="p-5"
        style={{
          background: `linear-gradient(135deg, ${emerald} 0%, ${sage} 100%)`,
          borderColor: "transparent",
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={16} color="#fff" />
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/80">Resumo da semana</span>
        </div>
        <p className="mt-2 text-[16px] leading-snug font-medium text-white">
          Esta semana sua família completou <strong>{stats.winCount} tarefas</strong>, registrou <strong>{stats.gratCount} momentos felizes</strong> e está construindo memórias incríveis.
        </p>
        <button
          onClick={share}
          className="mt-3 w-full h-11 rounded-full text-[13px] font-semibold flex items-center justify-center gap-2"
          style={{ background: "#fff", color: emerald }}
        >
          <Share2 size={14} /> Compartilhar
        </button>
      </Surface>
    </div>
  );
};

/* ═════════════════ ROOT ═════════════════ */
const WellnessGrowth = () => (
  <div className="space-y-3">
    <SectionTitle kicker="Família" title="Como estamos hoje" sub="Um espelho gentil, sem julgamento." />
    <HowAreWe />
    <DailyPhrase />
    <DailyMission />
    <SmallWins />
    <GratitudeJar />
    <HappyMemory />
    <BreatheChameleon />
    <FamilyThermometer />
    <Collection />
    <WeeklySummary />
  </div>
);

export default WellnessGrowth;

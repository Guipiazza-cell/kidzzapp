/**
 * KALM v2 — estado persistido por perfil de criança.
 * Tudo em localStorage, escopado por activeChildId quando existir.
 */
import { useCallback, useEffect, useState } from "react";
import { useCriancas } from "@/hooks/useCriancas";

const todayKey = () => new Date().toISOString().slice(0, 10);

const useActiveChildId = (): string => {
  const { criancas } = useCriancas();
  // primeiro filho ativo; multi-perfil = chave separada
  return criancas[0]?.id ?? "default";
};

const k = (child: string, bucket: string) => `kidzz_kalm_v2_${child}_${bucket}`;

// ── Mood (histórico por dia) ─────────────────
export type MoodValue = "muito_mal" | "mal" | "medio" | "bem" | "muito_bem";

export const useMood = () => {
  const child = useActiveChildId();
  const [today, setToday] = useState<MoodValue | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(k(child, "mood"));
      const map = raw ? JSON.parse(raw) : {};
      setToday(map[todayKey()] ?? null);
    } catch { /* noop */ }
  }, [child]);
  const set = useCallback((v: MoodValue) => {
    try {
      const raw = localStorage.getItem(k(child, "mood"));
      const map = raw ? JSON.parse(raw) : {};
      map[todayKey()] = v;
      localStorage.setItem(k(child, "mood"), JSON.stringify(map));
    } catch { /* noop */ }
    setToday(v);
  }, [child]);
  return { today, set };
};

// ── Parent Mood (pai/mãe também registra) ────
export const useParentMood = () => {
  const child = useActiveChildId();
  const bucket = `parent_${child}`;
  const [today, setToday] = useState<MoodValue | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(k(bucket, "mood"));
      const map = raw ? JSON.parse(raw) : {};
      setToday(map[todayKey()] ?? null);
    } catch { /* noop */ }
  }, [bucket]);
  const set = useCallback((v: MoodValue) => {
    try {
      const raw = localStorage.getItem(k(bucket, "mood"));
      const map = raw ? JSON.parse(raw) : {};
      map[todayKey()] = v;
      localStorage.setItem(k(bucket, "mood"), JSON.stringify(map));
    } catch { /* noop */ }
    setToday(v);
  }, [bucket]);
  return { today, set };
};

// ── Sugestão do dia (dinâmica, sem repetir 2 dias seguidos) ────
type DailySuggestion = {
  emoji: string;
  title: string;
  desc: string;
  pillar: "sentir" | "agradecer" | "mover" | "nutrir" | "conectar" | "cuidar";
  activityId?: string;
};

const SUGGESTION_POOL: DailySuggestion[] = [
  { emoji: "💧", title: "Copo d'água da família", desc: "Bebam um copo d'água juntos, agora, como um brinde.", pillar: "nutrir", activityId: "agua-familia" },
  { emoji: "🫂", title: "Abraço de 20 segundos", desc: "Um abraço apertado com seu filho. Conte até 20.", pillar: "conectar", activityId: "abraco-20s" },
  { emoji: "🌈", title: "3 coisas boas de hoje", desc: "Cada um da família diz uma coisa boa que aconteceu.", pillar: "agradecer", activityId: "tres-boas" },
  { emoji: "🐻", title: "Alongamento do urso", desc: "Estiquem o corpo juntos por 1 minuto. Acorda a calma.", pillar: "mover", activityId: "alongamento-urso" },
  { emoji: "🎈", title: "Solte o balão", desc: "Coloque o que incomodou hoje num balão e deixe ir.", pillar: "sentir", activityId: "soltar-balao" },
  { emoji: "☕", title: "5 minutos só seus", desc: "Sem culpa. Cuidar de si é cuidar da família.", pillar: "cuidar", activityId: "cafe-sem-culpa" },
  { emoji: "🌈", title: "Prato colorido", desc: "Contem quantas cores diferentes tem no prato hoje.", pillar: "nutrir", activityId: "prato-colorido" },
  { emoji: "👀", title: "Olhos nos olhos", desc: "Cinco minutos de atenção total, sem tela, sem pressa.", pillar: "conectar", activityId: "olhos-nos-olhos" },
  { emoji: "🎉", title: "Festival da risada", desc: "Um minuto de riso em família. Cócegas valem.", pillar: "mover", activityId: "festival-risada" },
  { emoji: "🌟", title: "Elogio específico", desc: "Diga uma coisa específica que admirou no seu filho hoje.", pillar: "conectar", activityId: "elogio-especifico" },
  { emoji: "🍋", title: "Aperta e solta o limão", desc: "Aperte forte, depois solte. Alívio na hora.", pillar: "sentir", activityId: "aperta-limao" },
  { emoji: "🙏", title: "Diário de uma linha", desc: "Escreva UMA frase boa sobre o dia.", pillar: "agradecer", activityId: "diario-uma-linha" },
];

export const useDailySuggestion = (): DailySuggestion => {
  const child = useActiveChildId();
  const [pick, setPick] = useState<DailySuggestion>(SUGGESTION_POOL[0]);
  useEffect(() => {
    try {
      const key = k(child, "suggestion");
      const raw = localStorage.getItem(key);
      const state = raw ? JSON.parse(raw) : { last: null, lastIdx: -1 };
      const today = todayKey();
      if (state.today === today && typeof state.idx === "number") {
        setPick(SUGGESTION_POOL[state.idx]);
        return;
      }
      // day-of-year → semente estável, mas evita o índice de ontem
      const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      let idx = doy % SUGGESTION_POOL.length;
      if (state.lastIdx === idx) idx = (idx + 1) % SUGGESTION_POOL.length;
      localStorage.setItem(key, JSON.stringify({ today, idx, lastIdx: idx }));
      setPick(SUGGESTION_POOL[idx]);
    } catch { /* noop */ }
  }, [child]);
  return pick;
};

// ── Jarro da gratidão ────────────────────────
export type JarItem = { id: string; text: string; ts: number };

export const useJar = () => {
  const child = useActiveChildId();
  const [items, setItems] = useState<JarItem[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(k(child, "jar"));
      setItems(raw ? JSON.parse(raw) : []);
    } catch { /* noop */ }
  }, [child]);
  const add = useCallback((text: string) => {
    if (!text.trim()) return;
    const next: JarItem = { id: crypto.randomUUID(), text: text.trim(), ts: Date.now() };
    setItems((prev) => {
      const arr = [next, ...prev].slice(0, 200);
      try { localStorage.setItem(k(child, "jar"), JSON.stringify(arr)); } catch { /* noop */ }
      return arr;
    });
  }, [child]);
  return { items, add };
};

// ── Pequenas vitórias (toggle por dia) ───────
export const useWins = () => {
  const child = useActiveChildId();
  const [today, setToday] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(k(child, "wins"));
      const map = raw ? JSON.parse(raw) : {};
      setToday(map[todayKey()] ?? {});
    } catch { /* noop */ }
  }, [child]);
  const toggle = useCallback((id: string) => {
    setToday((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        const raw = localStorage.getItem(k(child, "wins"));
        const map = raw ? JSON.parse(raw) : {};
        map[todayKey()] = next;
        localStorage.setItem(k(child, "wins"), JSON.stringify(map));
      } catch { /* noop */ }
      return next;
    });
  }, [child]);
  const count = Object.values(today).filter(Boolean).length;
  return { today, toggle, count };
};

// ── Selos / streak ───────────────────────────
export const useBadges = () => {
  const child = useActiveChildId();
  const [earned, setEarned] = useState<Record<string, number>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(k(child, "badges"));
      setEarned(raw ? JSON.parse(raw) : {});
    } catch { /* noop */ }
  }, [child]);
  const grant = useCallback((id: string) => {
    setEarned((prev) => {
      if (prev[id]) return prev;
      const next = { ...prev, [id]: Date.now() };
      try { localStorage.setItem(k(child, "badges"), JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, [child]);
  return { earned, grant };
};

// ── Streak de dias com atividade KALM ────────
export const useKalmStreak = () => {
  const child = useActiveChildId();
  const [streak, setStreak] = useState<{ count: number; last: string | null }>({ count: 0, last: null });
  useEffect(() => {
    try {
      const raw = localStorage.getItem(k(child, "streak"));
      setStreak(raw ? JSON.parse(raw) : { count: 0, last: null });
    } catch { /* noop */ }
  }, [child]);
  const markToday = useCallback(() => {
    const today = todayKey();
    setStreak((prev) => {
      if (prev.last === today) return prev;
      const y = new Date(); y.setDate(y.getDate() - 1);
      const yKey = y.toISOString().slice(0, 10);
      const next = { count: prev.last === yKey ? prev.count + 1 : 1, last: today };
      try { localStorage.setItem(k(child, "streak"), JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, [child]);
  return { streak, markToday };
};

// ── Resumo da semana (sem inventar números) ──
export const useWeekStats = () => {
  const child = useActiveChildId();
  const [stats, setStats] = useState({ tarefas: 0, momentos: 0 });
  useEffect(() => {
    try {
      const winsRaw = localStorage.getItem(k(child, "wins"));
      const jarRaw = localStorage.getItem(k(child, "jar"));
      const winsMap = winsRaw ? JSON.parse(winsRaw) : {};
      const jar: JarItem[] = jarRaw ? JSON.parse(jarRaw) : [];
      const since = Date.now() - 7 * 86400e3;
      let tarefas = 0;
      Object.entries(winsMap).forEach(([day, vals]: any) => {
        const t = new Date(day + "T00:00:00").getTime();
        if (t >= since) tarefas += Object.values(vals).filter(Boolean).length;
      });
      const momentos = jar.filter((j) => j.ts >= since).length;
      setStats({ tarefas, momentos });
    } catch { /* noop */ }
  }, [child]);
  return stats;
};

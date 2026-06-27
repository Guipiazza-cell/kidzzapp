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

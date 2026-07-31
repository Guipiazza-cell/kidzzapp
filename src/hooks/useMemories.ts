import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/hooks/useEntitlement";

/** Tipos de memória / histórico de uso no app */
export type MemoryType =
  | "question"
  | "story"
  | "mission"
  | "achievement"
  | "music"
  | "cinema"
  | "routine"
  | "play"
  | "discover"
  | "bora"
  | "diary"
  | "activity";

export interface Memory {
  id: string;
  user_id: string;
  type: MemoryType | string;
  title: string;
  content: string | null;
  is_special: boolean;
  image_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type MemoryInput = {
  type: MemoryType | string;
  title: string;
  content?: string | null;
  is_special?: boolean;
  image_url?: string | null;
  metadata?: Record<string, unknown>;
};

export type MemoryFilter = "all" | MemoryType | string;

const LOCAL_KEY = "kidzz_local_memories_v1";
const MAX_LOCAL = 200;

function readLocal(): Memory[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Memory[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(list: Memory[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, MAX_LOCAL)));
  } catch {
    /* quota */
  }
}

function makeLocalMemory(
  input: MemoryInput,
  userId: string,
): Memory {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    user_id: userId,
    type: input.type || "activity",
    title: input.title,
    content: input.content ?? null,
    is_special: Boolean(input.is_special),
    image_url: input.image_url ?? null,
    metadata: { ...(input.metadata || {}), source: "local" },
    created_at: new Date().toISOString(),
  };
}

export function useMemories() {
  const { user } = useAuth();
  const { canUse } = useEntitlement();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MemoryFilter>("all");
  const isPremium = canUse("memorias");

  const ownerId = user?.id ?? "guest-local";

  const fetchMemories = useCallback(async () => {
    setLoading(true);

    // Sempre carrega local (guest e backup)
    const local = readLocal().filter((m) => m.user_id === ownerId || m.user_id === "guest-local");

    if (!user) {
      let list = local;
      if (filter !== "all") list = list.filter((m) => m.type === filter);
      list = [...list].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setMemories(list);
      setLoading(false);
      return;
    }

    let query = supabase
      .from("memories" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("type", filter);
    }

    const { data, error } = await query;
    const remote = !error && data ? (data as unknown as Memory[]) : [];

    // Mescla local (deste user/guest) + remoto, sem duplicar por id
    const byId = new Map<string, Memory>();
    for (const m of [...remote, ...local]) byId.set(m.id, m);
    let merged = Array.from(byId.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    if (filter !== "all") merged = merged.filter((m) => m.type === filter);

    setMemories(merged);
    setLoading(false);
  }, [user, filter, ownerId]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const addMemory = useCallback(
    async (memory: MemoryInput | Omit<Memory, "id" | "user_id" | "created_at">) => {
      const input: MemoryInput = {
        type: (memory as MemoryInput).type || "activity",
        title: memory.title,
        content: memory.content ?? null,
        is_special: Boolean(memory.is_special),
        image_url: memory.image_url ?? null,
        metadata: (memory.metadata as Record<string, unknown>) || {},
      };

      // Guest (ou sem rede): grava local e já reflete na UI
      if (!user) {
        const entry = makeLocalMemory(input, "guest-local");
        const next = [entry, ...readLocal()].slice(0, MAX_LOCAL);
        writeLocal(next);
        setMemories((prev) => [entry, ...prev]);
        return entry;
      }

      const { data, error } = await supabase
        .from("memories" as any)
        .insert({
          type: input.type,
          title: input.title,
          content: input.content,
          is_special: input.is_special,
          image_url: input.image_url,
          metadata: input.metadata,
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (!error && data) {
        const entry = data as unknown as Memory;
        setMemories((prev) => [entry, ...prev]);
        return entry;
      }

      // Fallback local se o insert falhar (offline / RLS)
      const entry = makeLocalMemory(input, user.id);
      const next = [entry, ...readLocal()].slice(0, MAX_LOCAL);
      writeLocal(next);
      setMemories((prev) => [entry, ...prev]);
      return entry;
    },
    [user],
  );

  const toggleSpecial = useCallback(
    async (id: string, isSpecial: boolean) => {
      if (id.startsWith("local-")) {
        const next = readLocal().map((m) =>
          m.id === id ? { ...m, is_special: !isSpecial } : m,
        );
        writeLocal(next);
        setMemories((prev) =>
          prev.map((m) => (m.id === id ? { ...m, is_special: !isSpecial } : m)),
        );
        return;
      }
      if (!user) return;
      await supabase
        .from("memories" as any)
        .update({ is_special: !isSpecial } as any)
        .eq("id", id);
      setMemories((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_special: !isSpecial } : m)),
      );
    },
    [user],
  );

  const totalCount = memories.length;
  const visibleMemories = isPremium ? memories : memories.slice(0, 7);
  const lockedCount = isPremium ? 0 : Math.max(0, totalCount - 7);

  return {
    memories: visibleMemories,
    allMemories: memories,
    loading,
    filter,
    setFilter,
    addMemory,
    toggleSpecial,
    totalCount,
    lockedCount,
    isPremium,
    refetch: fetchMemories,
  };
}

/**
 * Helper para registrar uso em qualquer tela.
 * Usa o mesmo storage de memórias (guest local + Supabase se logado).
 */
export async function logActivity(
  addMemory: (m: MemoryInput) => Promise<Memory | null>,
  opts: {
    area: string;
    title: string;
    content?: string;
    type?: MemoryType | string;
    special?: boolean;
    metadata?: Record<string, unknown>;
  },
) {
  return addMemory({
    type: opts.type || opts.area || "activity",
    title: opts.title,
    content: opts.content ?? null,
    is_special: Boolean(opts.special),
    image_url: null,
    metadata: { area: opts.area, ...(opts.metadata || {}) },
  });
}

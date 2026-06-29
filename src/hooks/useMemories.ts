import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEntitlement } from "@/hooks/useEntitlement";
import { useActiveChildId } from "@/contexts/ActiveChildContext";

export interface Memory {
  id: string;
  user_id: string;
  crianca_id: string;
  type: "question" | "story" | "mission" | "achievement" | "sos";
  title: string;
  content: string | null;
  is_special: boolean;
  image_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

type MemoryFilter = "all" | "question" | "story" | "mission" | "achievement" | "sos";

export function useMemories() {
  const { user } = useAuth();
  const activeChildId = useActiveChildId();
  const { canUse } = useEntitlement();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MemoryFilter>("all");
  // Memórias completas liberadas no Kidzz e no Premium.
  const isPremium = canUse("memorias");

  const fetchMemories = useCallback(async () => {
    if (!user || !activeChildId) { setMemories([]); setLoading(false); return; }
    setLoading(true);
    let query = supabase
      .from("memories" as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("crianca_id", activeChildId)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("type", filter);
    }

    const { data, error } = await query;
    if (!error && data) {
      setMemories(data as unknown as Memory[]);
    }
    setLoading(false);
  }, [user, activeChildId, filter]);

  useEffect(() => { fetchMemories(); }, [fetchMemories]);

  const addMemory = useCallback(async (memory: Omit<Memory, "id" | "user_id" | "crianca_id" | "created_at">) => {
    if (!user || !activeChildId) return null;
    const { data, error } = await supabase
      .from("memories" as any)
      .insert({ ...memory, user_id: user.id, crianca_id: activeChildId } as any)
      .select()
      .single();
    if (!error && data) {
      setMemories(prev => [data as unknown as Memory, ...prev]);
      return data as unknown as Memory;
    }
    return null;
  }, [user, activeChildId]);

  const toggleSpecial = useCallback(async (id: string, isSpecial: boolean) => {
    if (!user || !activeChildId) return;
    await supabase
      .from("memories" as any)
      .update({ is_special: !isSpecial } as any)
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("crianca_id", activeChildId);
    setMemories(prev => prev.map(m => m.id === id ? { ...m, is_special: !isSpecial } : m));
  }, [user, activeChildId]);

  const totalCount = memories.length;

  // Free users: only last 7 memories visible
  const visibleMemories = isPremium
    ? memories
    : memories.slice(0, 7);

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

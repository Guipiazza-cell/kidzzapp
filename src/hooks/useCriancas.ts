import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Crianca = {
  id: string;
  user_id: string;
  nome: string;
  idade: number | null;
  interesses: string[] | null;
  materiais_em_casa: string[] | null;
  created_at: string;
};

const ACTIVE_KEY = "kidzz_crianca_ativa";

export function useCriancas() {
  const { user } = useAuth();
  const [criancas, setCriancas] = useState<Crianca[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setCriancas([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("criancas")
      .select("*")
      .eq("user_id", user.id) // defense-in-depth (RLS já restringe por user_id)
      .order("created_at", { ascending: true });
    if (!error && data) setCriancas(data as Crianca[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCrianca = useCallback(
    async (payload: {
      nome: string;
      idade?: number | null;
      interesses?: string[];
      materiais_em_casa?: string[];
    }) => {
      if (!user) throw new Error("not authenticated");
      const { data, error } = await supabase
        .from("criancas")
        .insert({
          user_id: user.id,
          nome: payload.nome,
          idade: payload.idade ?? null,
          interesses: payload.interesses ?? [],
          materiais_em_casa: payload.materiais_em_casa ?? [],
        })
        .select()
        .single();
      if (error) throw error;
      await refresh();
      return data as Crianca;
    },
    [user, refresh],
  );

  const updateCrianca = useCallback(
    async (
      id: string,
      patch: Partial<Pick<Crianca, "nome" | "idade" | "interesses" | "materiais_em_casa">>,
    ) => {
      const { error } = await supabase.from("criancas").update(patch).eq("id", id);
      if (error) throw error;
      await refresh();
    },
    [refresh],
  );

  const removeCrianca = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("criancas").delete().eq("id", id);
      if (error) throw error;
      if (typeof window !== "undefined" && window.localStorage.getItem(ACTIVE_KEY) === id) {
        window.localStorage.removeItem(ACTIVE_KEY);
      }
      await refresh();
    },
    [refresh],
  );

  return { criancas, loading, refresh, addCrianca, updateCrianca, removeCrianca };
}

/** Criança ativa (usada por todas as telas que geram conteúdo). */
export function getCriancaAtivaId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_KEY);
}

export function setCriancaAtivaId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(ACTIVE_KEY, id);
  else window.localStorage.removeItem(ACTIVE_KEY);
}

/** Resolve o crianca_id a usar: ativa salva, senão a primeira do responsável. */
export async function resolveCriancaId(userId: string): Promise<string | null> {
  const saved = getCriancaAtivaId();
  if (saved) {
    const { data } = await supabase
      .from("criancas")
      .select("id")
      .eq("id", saved)
      .eq("user_id", userId)
      .maybeSingle();
    if (data?.id) return data.id as string;
    setCriancaAtivaId(null);
  }
  const { data: first } = await supabase
    .from("criancas")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (first?.id as string) ?? null;
}

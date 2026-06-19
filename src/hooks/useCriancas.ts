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
      .order("created_at", { ascending: true });
    if (!error && data) setCriancas(data as Crianca[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCrianca = useCallback(
    async (payload: { nome: string; idade?: number | null; interesses?: string[] }) => {
      if (!user) throw new Error("not authenticated");
      const { data, error } = await supabase
        .from("criancas")
        .insert({
          user_id: user.id,
          nome: payload.nome,
          idade: payload.idade ?? null,
          interesses: payload.interesses ?? [],
        })
        .select()
        .single();
      if (error) throw error;
      await refresh();
      return data as Crianca;
    },
    [user, refresh],
  );

  return { criancas, loading, refresh, addCrianca };
}

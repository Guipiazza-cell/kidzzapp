import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Desafio = {
  id: string;
  semana_iso: string;
  titulo: string;
  descricao: string;
  emoji: string;
  hashtag: string;
};

export function useDesafioSemana() {
  const [desafio, setDesafio] = useState<Desafio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("desafios_semanais")
        .select("id,semana_iso,titulo,descricao,emoji,hashtag")
        .eq("ativo", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (alive) {
        setDesafio((data as Desafio) || null);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { desafio, loading };
}

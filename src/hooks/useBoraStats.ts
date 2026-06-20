import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BoraStats = {
  total_minutos: number;
  total_conclusoes: number;
  streak: number;
  categorias_exploradas: number;
};

const EMPTY: BoraStats = { total_minutos: 0, total_conclusoes: 0, streak: 0, categorias_exploradas: 0 };

export function useBoraStats() {
  const [stats, setStats] = useState<BoraStats>(EMPTY);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_bora_stats");
      if (!error && Array.isArray(data) && data.length) {
        const r = data[0] as BoraStats;
        setStats({
          total_minutos: Number(r.total_minutos || 0),
          total_conclusoes: Number(r.total_conclusoes || 0),
          streak: Number(r.streak || 0),
          categorias_exploradas: Number(r.categorias_exploradas || 0),
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { stats, loading, refresh };
}

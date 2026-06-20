import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type IaActivity = {
  id?: string;
  emoji: string;
  titulo: string;
  gancho: string;
  categoria: string;
  energia: string;
  tempo: string;
  duracao_min: number;
  contexto: string;
  tela_min: number;
  materiais: string[];
  passos: string[];
  curiosidade: string;
};

export function useSurpresaIA() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activity, setActivity] = useState<IaActivity | null>(null);

  const surprise = useCallback(async (opts?: { categoria?: string; energia?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.functions.invoke("surpresa-ia", {
        body: { mode: "single", ...(opts || {}) },
      });
      if (data?.error) throw new Error(String(data.error));
      if (err) {
        // Extrai o body real do FunctionsHttpError em vez do genérico "non-2xx"
        const ctx = (err as any)?.context;
        let msg = "";
        try {
          if (ctx && typeof ctx.json === "function") {
            const j = await ctx.json();
            if (j?.error) msg = String(j.error);
          }
        } catch (_) {}
        throw new Error(msg || err.message || "Não rolou agora.");
      }
      if (!data?.activity) throw new Error("Sem atividade. Tenta de novo.");
      setActivity(data.activity as IaActivity);
      return data.activity as IaActivity;
    } catch (e: any) {
      const msg = e?.message || "Não rolou agora, tenta de novo.";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { surprise, loading, error, activity, reset: () => setActivity(null) };
}

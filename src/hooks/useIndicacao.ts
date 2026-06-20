import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const APP_URL = "https://kidzz.app";

export function useIndicacao() {
  const [codigo, setCodigo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ensure = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.rpc("ensure_indicacao_codigo");
      if (err) throw err;
      const c = (data as unknown as string) || null;
      setCodigo(c);
      return c;
    } catch (e: any) {
      setError(e?.message || "Não rolou gerar o link.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { ensure(); }, [ensure]);

  const link = codigo ? `${APP_URL}/?ref=${codigo}` : "";
  return { codigo, link, loading, error, refresh: ensure };
}

export async function aplicarIndicacao(codigo: string) {
  const { data, error } = await supabase.rpc("aplicar_indicacao", { _codigo: codigo });
  if (error) throw error;
  return data as { ok: boolean; reason?: string };
}

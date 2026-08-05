import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PlanName = "free" | "kidzz" | "premium";

export interface PlanState {
  plan: PlanName;
  status: string;
  inGrace: boolean;
  currentPeriodEnd: Date | null;
  isPaid: boolean;
  loading: boolean;
}

const EMPTY: PlanState = {
  plan: "free",
  status: "inactive",
  inGrace: false,
  currentPeriodEnd: null,
  isPaid: false,
  loading: true,
};

/**
 * ÚNICA fonte de verdade de acesso pago no frontend.
 * Lê `get_effective_plan` via RPC. Nunca ler `profiles.is_premium`/`tier`.
 */
export function usePlan() {
  const { user } = useAuth();
  const [state, setState] = useState<PlanState>(EMPTY);

  const refresh = useCallback(async () => {
    if (!user) {
      setState({ ...EMPTY, loading: false });
      return;
    }
    try {
      const { data, error } = await (supabase as any).rpc("get_effective_plan", { _user_id: user.id });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      const plan = (row?.plan ?? "free") as PlanName;
      setState({
        plan,
        status: row?.status ?? "inactive",
        inGrace: !!row?.in_grace,
        currentPeriodEnd: row?.current_period_end ? new Date(row.current_period_end) : null,
        isPaid: plan !== "free",
        loading: false,
      });
    } catch (err) {
      console.warn("[usePlan] get_effective_plan falhou", err);
      setState({ ...EMPTY, loading: false });
    }

  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  return { ...state, refresh };
}

/** Abre o Portal do Cliente do Stripe (trocar cartão, cancelar). */
export async function openBillingPortal(): Promise<string | null> {
  const { data, error } = await supabase.functions.invoke("customer-portal");
  if (error || !data?.url) return null;
  return data.url as string;
}

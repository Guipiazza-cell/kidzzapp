import { useCallback, useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import {
  PLAN_ACCESS,
  DAILY_LIMITS,
  minPlanFor,
  type Plan,
  type Area,
  type AccessLevel,
  type QuotaTipo,
} from "@/lib/plans";

interface EntitlementState {
  plan: Plan;
  status: string;
  inGracePeriod: boolean;
  periodEnd: Date | null;
  usage: { perguntas: number; historias: number };
  loading: boolean;
}

const DEFAULT_STATE: EntitlementState = {
  plan: "free",
  status: "inactive",
  inGracePeriod: false,
  periodEnd: null,
  usage: { perguntas: 0, historias: 0 },
  loading: true,
};

/** Hoje em fuso de Brasília (YYYY-MM-DD). */
const todayBR = () => {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
  });
  return fmt.format(new Date()); // YYYY-MM-DD
};

/**
 * ÚNICA fonte de verdade sobre acesso e quotas no Kidzz.
 * Nenhuma outra tela deve decidir bloqueio por conta própria.
 */
export function useEntitlement() {
  const { user, session } = useAuth();
  const effectivePlan = usePlan();
  const [state, setState] = useState<EntitlementState>(DEFAULT_STATE);
  const inFlight = useRef(false);

  const fetchAll = useCallback(async () => {
    if (!user || !session) {
      setState({ ...DEFAULT_STATE, loading: false });
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const [{ data: usageData }] = await Promise.all([
        (supabase as any)
          .from("usage")
          .select("perguntas_count, historias_count")
          .eq("user_id", user.id)
          .eq("date", todayBR())
          .maybeSingle(),
      ]);

      const plan: Plan = effectivePlan.plan;

      setState({
        plan,
        status: effectivePlan.status,
        inGracePeriod: effectivePlan.inGrace,
        periodEnd: effectivePlan.currentPeriodEnd,
        usage: {
          perguntas: usageData?.perguntas_count ?? 0,
          historias: usageData?.historias_count ?? 0,
        },
        loading: false,
      });
    } catch (err) {
      console.warn("[useEntitlement] error, falling back to free", err);
      setState({ ...DEFAULT_STATE, loading: false });
    } finally {
      inFlight.current = false;
    }
  }, [user, session, effectivePlan.plan, effectivePlan.status, effectivePlan.inGrace, effectivePlan.currentPeriodEnd]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const onFocus = () => fetchAll();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchAll]);

  const { plan } = state;

  const accessLevel = useCallback(
    (area: Area): AccessLevel => PLAN_ACCESS[plan][area],
    [plan]
  );

  const canUse = useCallback(
    (area: Area): boolean => PLAN_ACCESS[plan][area] === "full",
    [plan]
  );

  const limiteAtingido = useCallback(
    (tipo: QuotaTipo): boolean => {
      const cap = DAILY_LIMITS[plan][tipo];
      return state.usage[tipo] >= cap;
    },
    [plan, state.usage]
  );

  const gateInfo = useCallback((area: Area) => {
    const min = minPlanFor(area);
    return { minPlan: min };
  }, []);

  /**
   * Consome uma quota no servidor (perguntas/historias) ANTES de gerar.
   * Retorna { allowed }. Defesa em profundidade: edge function também valida.
   */
  const consumeQuota = useCallback(
    async (tipo: QuotaTipo, criancaId?: string | null): Promise<{ allowed: boolean }> => {
      if (!user) return { allowed: false };
      try {
        // Resolve criança se não veio (schema com usage.crianca_id)
        let childId = criancaId ?? null;
        if (!childId) {
          const { data: child } = await supabase
            .from("criancas")
            .select("id")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();
          childId = (child as any)?.id ?? null;
        }

        const attempts: Record<string, unknown>[] = [];
        if (childId) attempts.push({ _tipo: tipo, _crianca_id: childId });
        attempts.push({ _tipo: tipo, _crianca_id: null });
        attempts.push({ _tipo: tipo });

        let data: any = null;
        let error: any = null;
        for (const args of attempts) {
          const r = await (supabase as any).rpc("increment_usage", args);
          if (!r.error) {
            data = r.data;
            error = null;
            break;
          }
          error = r.error;
        }

        if (error) {
          console.warn("[useEntitlement] increment_usage error", error);
          return { allowed: false };
        }
        const row = Array.isArray(data) ? data[0] : data;
        await fetchAll();
        return { allowed: !!row?.allowed };
      } catch (err) {
        console.error("[useEntitlement] consumeQuota error", err);
        return { allowed: false };
      }
    },
    [user, fetchAll]
  );

  return {
    plan,
    status: state.status,
    isFree: plan === "free",
    isKidzz: plan === "kidzz",
    isPremium: plan === "premium",
    inGracePeriod: state.inGracePeriod,
    periodEnd: state.periodEnd,
    usage: state.usage,
    loading: state.loading,
    canUse,
    accessLevel,
    limiteAtingido,
    gateInfo,
    consumeQuota,
    refresh: fetchAll,
  };
}

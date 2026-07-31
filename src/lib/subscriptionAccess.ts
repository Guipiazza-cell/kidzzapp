/**
 * Regras puras de acesso por assinatura (anti-fraude / anti-stale).
 * Usadas pelo Auth client e espelhadas nas edge functions.
 *
 * Princípio: Stripe com consulta OK é autoridade. DB só cobre manual e
 * degradação (API Stripe indisponível). Nunca manter pago se Stripe
 * confirmou que não há sub active/trialing.
 */

export type SubscriptionTier = "free" | "kidzz" | "premium";
export type PremiumSource = "stripe" | "manual" | string | null | undefined;

export type StripeSubStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused"
  | string;

/** Statuses que mantêm o plano (com ou sem graça no RPC). */
export const PAID_KEEP_STATUSES = new Set(["active", "trialing", "past_due"]);

/** Statuses que sempre rebaixam para free. */
export const REVOKE_STATUSES = new Set([
  "canceled",
  "unpaid",
  "incomplete",
  "incomplete_expired",
  "paused",
]);

export function resolvePlanFromProduct(
  productId: string | null | undefined,
  productMap: Record<string, "kidzz" | "premium">
): "kidzz" | "premium" | null {
  if (!productId) return null;
  return productMap[productId] ?? null;
}

/**
 * Plano efetivo a gravar a partir do status Stripe + produto.
 * - active/trialing → plano do produto (null se produto desconhecido = não concede)
 * - past_due → mantém plano (grace no get_effective_plan)
 * - demais → free
 */
export function planForStripeSubscription(
  status: StripeSubStatus,
  productId: string | null | undefined,
  productMap: Record<string, "kidzz" | "premium">
): SubscriptionTier {
  if (REVOKE_STATUSES.has(status) || !PAID_KEEP_STATUSES.has(status)) {
    return "free";
  }
  const mapped = resolvePlanFromProduct(productId, productMap);
  // Produto desconhecido: não concede acesso pago (anti-fraude de price órfão)
  if (!mapped) return "free";
  return mapped;
}

export type CheckSubDecision =
  | {
      action: "manual_active";
      subscribed: true;
      tier: "premium";
      source: "manual";
    }
  | {
      action: "manual_expired";
      subscribed: false;
      tier: "free";
      source: "expired";
    }
  | {
      action: "stripe_active";
      subscribed: true;
      tier: "kidzz" | "premium";
      source: "stripe";
    }
  | {
      action: "revoke_stale";
      subscribed: false;
      tier: "free";
      source: "none";
      /** true se o DB ainda dizia premium e precisa ser limpo */
      shouldClearDb: boolean;
    }
  | {
      action: "stripe_error_keep_db";
      subscribed: boolean;
      tier: SubscriptionTier;
      source: "degraded";
    }
  | {
      action: "free";
      subscribed: false;
      tier: "free";
      source: "none";
    };

/**
 * Decisão autoritativa após consultar DB + Stripe.
 * stripeLookupOk=false significa falha de API (não "sem customer").
 */
export function decideCheckSubscription(input: {
  dbIsPremium: boolean;
  premiumSource: PremiumSource;
  planEndDate: string | null | undefined;
  now?: Date;
  /** Stripe consultado com sucesso */
  stripeLookupOk: boolean;
  /** Melhor tier entre subs active/trialing (nunca past_due aqui) */
  stripeActiveTier: ("kidzz" | "premium") | null;
}): CheckSubDecision {
  const now = input.now ?? new Date();

  // Manual: confia no DB + validade de data
  if (input.dbIsPremium && input.premiumSource === "manual") {
    if (input.planEndDate) {
      const end = new Date(input.planEndDate);
      if (!Number.isNaN(end.getTime()) && end < now) {
        return {
          action: "manual_expired",
          subscribed: false,
          tier: "free",
          source: "expired",
        };
      }
    }
    return {
      action: "manual_active",
      subscribed: true,
      tier: "premium",
      source: "manual",
    };
  }

  // Stripe com sub ativa/trialing
  if (input.stripeLookupOk && input.stripeActiveTier) {
    return {
      action: "stripe_active",
      subscribed: true,
      tier: input.stripeActiveTier,
      source: "stripe",
    };
  }

  // Stripe OK e sem sub ativa → free (e limpa stale no DB)
  if (input.stripeLookupOk) {
    return {
      action: "revoke_stale",
      subscribed: false,
      tier: "free",
      source: "none",
      shouldClearDb: input.dbIsPremium && input.premiumSource !== "manual",
    };
  }

  // Stripe falhou: degradação — só mantém se DB diz premium (não inventa)
  if (input.dbIsPremium) {
    const tier: SubscriptionTier =
      input.premiumSource === "manual" ? "premium" : "premium";
    return {
      action: "stripe_error_keep_db",
      subscribed: true,
      tier,
      source: "degraded",
    };
  }

  return { action: "free", subscribed: false, tier: "free", source: "none" };
}

/**
 * O que o cliente Auth deve fazer com a resposta do backend.
 * Nunca "confiar no DB" se o backend respondeu free com sucesso.
 */
export function applyCheckSubscriptionClient(input: {
  httpOk: boolean;
  backend?: { subscribed?: boolean; tier?: string; source?: string };
  dbIsPremium: boolean;
  premiumSource: PremiumSource;
}): { tier: SubscriptionTier; isPremium: boolean } {
  if (!input.httpOk || !input.backend) {
    // Rede/erro: só mantém se manual; stripe stale não se auto-sustenta no client
    if (input.dbIsPremium && input.premiumSource === "manual") {
      return { tier: "premium", isPremium: true };
    }
    // Fail-open conservador só no cache de rede se DB diz premium (UX offline).
    // Anti-fraude real está no server; aqui evitamos flash free em blip de rede.
    if (input.dbIsPremium) {
      return { tier: "premium", isPremium: true };
    }
    return { tier: "free", isPremium: false };
  }

  if (input.backend.subscribed) {
    const tier: SubscriptionTier =
      input.backend.tier === "premium" ? "premium" : "kidzz";
    return { tier, isPremium: true };
  }

  // Backend disse free com HTTP 200 → free. Nunca reabrir pelo DB.
  return { tier: "free", isPremium: false };
}

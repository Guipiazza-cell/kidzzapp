import { describe, expect, it } from "vitest";
import {
  applyCheckSubscriptionClient,
  decideCheckSubscription,
  planForStripeSubscription,
  resolvePlanFromProduct,
} from "@/lib/subscriptionAccess";

const MAP = {
  prod_kidzz: "kidzz" as const,
  prod_premium: "premium" as const,
};

describe("resolvePlanFromProduct", () => {
  it("mapeia produtos conhecidos", () => {
    expect(resolvePlanFromProduct("prod_kidzz", MAP)).toBe("kidzz");
    expect(resolvePlanFromProduct("prod_premium", MAP)).toBe("premium");
  });

  it("recusa produto desconhecido (anti-fraude)", () => {
    expect(resolvePlanFromProduct("prod_hacker", MAP)).toBeNull();
    expect(resolvePlanFromProduct(null, MAP)).toBeNull();
  });
});

describe("planForStripeSubscription", () => {
  it("active/trialing com produto mapeado libera o plano", () => {
    expect(planForStripeSubscription("active", "prod_kidzz", MAP)).toBe("kidzz");
    expect(planForStripeSubscription("trialing", "prod_premium", MAP)).toBe("premium");
  });

  it("past_due mantém plano para grace", () => {
    expect(planForStripeSubscription("past_due", "prod_premium", MAP)).toBe("premium");
  });

  it("canceled/unpaid/incomplete revoga", () => {
    for (const s of ["canceled", "unpaid", "incomplete", "incomplete_expired", "paused"]) {
      expect(planForStripeSubscription(s, "prod_premium", MAP)).toBe("free");
    }
  });

  it("produto desconhecido nunca concede pago", () => {
    expect(planForStripeSubscription("active", "prod_unknown", MAP)).toBe("free");
  });
});

describe("decideCheckSubscription", () => {
  const base = {
    dbIsPremium: false,
    premiumSource: null as string | null,
    planEndDate: null as string | null,
    now: new Date("2026-07-31T12:00:00Z"),
    stripeLookupOk: true,
    stripeActiveTier: null as ("kidzz" | "premium") | null,
  };

  it("manual ativo mantém premium", () => {
    const d = decideCheckSubscription({
      ...base,
      dbIsPremium: true,
      premiumSource: "manual",
      planEndDate: "2026-12-01T00:00:00Z",
    });
    expect(d).toMatchObject({ action: "manual_active", subscribed: true, tier: "premium" });
  });

  it("manual expirado revoga", () => {
    const d = decideCheckSubscription({
      ...base,
      dbIsPremium: true,
      premiumSource: "manual",
      planEndDate: "2026-01-01T00:00:00Z",
    });
    expect(d).toMatchObject({ action: "manual_expired", subscribed: false, tier: "free" });
  });

  it("stripe ativo kidzz libera kidzz", () => {
    const d = decideCheckSubscription({
      ...base,
      stripeActiveTier: "kidzz",
    });
    expect(d).toMatchObject({
      action: "stripe_active",
      subscribed: true,
      tier: "kidzz",
      source: "stripe",
    });
  });

  it("stripe OK sem sub + DB stale → revoga (anti-fraude)", () => {
    const d = decideCheckSubscription({
      ...base,
      dbIsPremium: true,
      premiumSource: "stripe",
      stripeActiveTier: null,
    });
    expect(d).toEqual({
      action: "revoke_stale",
      subscribed: false,
      tier: "free",
      source: "none",
      shouldClearDb: true,
    });
  });

  it("stripe OK sem sub + DB free → free limpo", () => {
    const d = decideCheckSubscription({ ...base });
    expect(d).toEqual({
      action: "revoke_stale",
      subscribed: false,
      tier: "free",
      source: "none",
      shouldClearDb: false,
    });
  });

  it("NÃO mantém premium só porque o DB diz (STEP3 antigo)", () => {
    const d = decideCheckSubscription({
      ...base,
      dbIsPremium: true,
      premiumSource: "stripe",
      stripeLookupOk: true,
      stripeActiveTier: null,
    });
    expect(d.subscribed).toBe(false);
    expect(d.tier).toBe("free");
  });

  it("falha Stripe + DB premium → degraded keep (UX offline)", () => {
    const d = decideCheckSubscription({
      ...base,
      dbIsPremium: true,
      premiumSource: "stripe",
      stripeLookupOk: false,
    });
    expect(d).toMatchObject({
      action: "stripe_error_keep_db",
      subscribed: true,
      source: "degraded",
    });
  });
});

describe("applyCheckSubscriptionClient", () => {
  it("backend free com HTTP 200 → free mesmo se DB premium", () => {
    const r = applyCheckSubscriptionClient({
      httpOk: true,
      backend: { subscribed: false, tier: "free", source: "none" },
      dbIsPremium: true,
      premiumSource: "stripe",
    });
    expect(r).toEqual({ tier: "free", isPremium: false });
  });

  it("backend subscribed premium → premium", () => {
    const r = applyCheckSubscriptionClient({
      httpOk: true,
      backend: { subscribed: true, tier: "premium", source: "stripe" },
      dbIsPremium: false,
      premiumSource: null,
    });
    expect(r).toEqual({ tier: "premium", isPremium: true });
  });

  it("backend subscribed kidzz → kidzz (não promove a premium)", () => {
    const r = applyCheckSubscriptionClient({
      httpOk: true,
      backend: { subscribed: true, tier: "kidzz", source: "stripe" },
      dbIsPremium: false,
      premiumSource: null,
    });
    expect(r).toEqual({ tier: "kidzz", isPremium: true });
  });

  it("HTTP erro + DB premium → mantém (blip de rede)", () => {
    const r = applyCheckSubscriptionClient({
      httpOk: false,
      dbIsPremium: true,
      premiumSource: "stripe",
    });
    expect(r.isPremium).toBe(true);
  });
});

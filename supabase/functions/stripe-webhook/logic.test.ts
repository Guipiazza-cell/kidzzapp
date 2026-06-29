import {
  isDuplicateProcessedEventError,
  isHandledStripeEvent,
  subscriptionStatusForEvent,
} from "./logic.ts";

Deno.test("detecta evento duplicado pelo erro de primary key", () => {
  if (!isDuplicateProcessedEventError({ code: "23505" })) {
    throw new Error("23505 deveria ser tratado como duplicado");
  }
  if (isDuplicateProcessedEventError({ code: "42P01" })) {
    throw new Error("erro não-duplicado não pode ser ignorado");
  }
});

Deno.test("cobre eventos Stripe relevantes", () => {
  const expected = [
    "checkout.session.completed",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_failed",
    "invoice.payment_succeeded",
  ];

  for (const type of expected) {
    if (!isHandledStripeEvent(type)) throw new Error(`evento faltando: ${type}`);
  }
});

Deno.test("normaliza transições críticas de assinatura", () => {
  if (subscriptionStatusForEvent("customer.subscription.deleted") !== "canceled") {
    throw new Error("subscription.deleted deve cancelar");
  }
  if (subscriptionStatusForEvent("invoice.payment_failed") !== "past_due") {
    throw new Error("payment_failed deve marcar past_due");
  }
  if (subscriptionStatusForEvent("invoice.payment_succeeded") !== "active") {
    throw new Error("payment_succeeded deve ativar");
  }
  if (subscriptionStatusForEvent("customer.subscription.updated", "trialing") !== "trialing") {
    throw new Error("subscription.updated deve preservar status Stripe");
  }
});

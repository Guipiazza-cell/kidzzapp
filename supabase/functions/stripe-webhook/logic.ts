export const HANDLED_STRIPE_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "invoice.payment_succeeded",
] as const;

export type HandledStripeEvent = (typeof HANDLED_STRIPE_EVENTS)[number];

export function isHandledStripeEvent(type: string): type is HandledStripeEvent {
  return (HANDLED_STRIPE_EVENTS as readonly string[]).includes(type);
}

export function isDuplicateProcessedEventError(error: unknown): boolean {
  return !!error && typeof error === "object" && (error as { code?: string }).code === "23505";
}

export function subscriptionStatusForEvent(type: HandledStripeEvent, stripeStatus?: string | null): string | null {
  switch (type) {
    case "customer.subscription.deleted":
      return "canceled";
    case "invoice.payment_failed":
      return "past_due";
    case "invoice.payment_succeeded":
      return "active";
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
      return stripeStatus ?? null;
  }
}

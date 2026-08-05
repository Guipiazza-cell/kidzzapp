CREATE OR REPLACE FUNCTION public.guard_paid_subscription_period()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT NEW.is_lifetime
     AND NEW.plan IN ('kidzz', 'premium')
     AND NEW.status IN ('active', 'trialing', 'past_due')
     AND NEW.current_period_end IS NULL THEN
    RAISE EXCEPTION 'paid subscription requires current_period_end';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_paid_subscription_period ON public.subscriptions;
CREATE TRIGGER trg_guard_paid_subscription_period
BEFORE INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.guard_paid_subscription_period();
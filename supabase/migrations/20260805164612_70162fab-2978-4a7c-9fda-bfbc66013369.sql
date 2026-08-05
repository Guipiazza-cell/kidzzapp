CREATE OR REPLACE FUNCTION public.guard_profile_entitlement_writes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (NEW.is_premium, NEW.tier, NEW.premium_source, NEW.plan_end_date)
     IS DISTINCT FROM
     (OLD.is_premium, OLD.tier, OLD.premium_source, OLD.plan_end_date)
     AND pg_trigger_depth() < 2 THEN
    RAISE EXCEPTION 'profile entitlement fields are read-only; write subscriptions instead';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_entitlements ON public.profiles;
CREATE TRIGGER trg_guard_profile_entitlements
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.guard_profile_entitlement_writes();
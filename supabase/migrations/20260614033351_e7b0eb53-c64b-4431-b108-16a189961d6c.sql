
-- =========================
-- SUBSCRIPTIONS
-- =========================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','kidzz','premium')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active','trialing','past_due','canceled','incomplete','inactive')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON public.subscriptions(stripe_customer_id);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subs_select_own" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- (no insert/update/delete policies — only service_role writes via webhook)

-- =========================
-- USAGE (daily counters)
-- =========================
CREATE TABLE IF NOT EXISTS public.usage (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  perguntas_count INTEGER NOT NULL DEFAULT 0,
  historias_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, date)
);

GRANT SELECT ON public.usage TO authenticated;
GRANT ALL ON public.usage TO service_role;

ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_select_own" ON public.usage
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- =========================
-- get_effective_plan
-- =========================
CREATE OR REPLACE FUNCTION public.get_effective_plan(_user_id UUID)
RETURNS TABLE(plan TEXT, status TEXT, in_grace BOOLEAN, current_period_end TIMESTAMPTZ)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  s public.subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO s FROM public.subscriptions WHERE user_id = _user_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'free'::TEXT, 'inactive'::TEXT, FALSE, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  -- active / trialing within period
  IF s.status IN ('active','trialing') AND (s.current_period_end IS NULL OR s.current_period_end > now()) THEN
    RETURN QUERY SELECT s.plan, s.status, FALSE, s.current_period_end;
    RETURN;
  END IF;

  -- past_due grace: 3 days after period end
  IF s.status = 'past_due' AND s.current_period_end IS NOT NULL AND s.current_period_end + interval '3 days' > now() THEN
    RETURN QUERY SELECT s.plan, s.status, TRUE, s.current_period_end;
    RETURN;
  END IF;

  -- expired/canceled/incomplete -> free
  RETURN QUERY SELECT 'free'::TEXT, s.status, FALSE, s.current_period_end;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_effective_plan(UUID) TO authenticated, anon, service_role;

-- =========================
-- increment_usage
-- =========================
CREATE OR REPLACE FUNCTION public.increment_usage(_tipo TEXT)
RETURNS TABLE(allowed BOOLEAN, perguntas_count INTEGER, historias_count INTEGER, plan TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _today DATE := (now() AT TIME ZONE 'America/Sao_Paulo')::DATE;
  _plan TEXT;
  _limit_p INTEGER;
  _limit_h INTEGER;
  _row public.usage%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF _tipo NOT IN ('perguntas','historias') THEN
    RAISE EXCEPTION 'invalid tipo';
  END IF;

  SELECT ep.plan INTO _plan FROM public.get_effective_plan(_uid) ep;

  IF _plan = 'free' THEN
    _limit_p := 2; _limit_h := 1;
  ELSE
    -- kidzz and premium share the invisible cap
    _limit_p := 10; _limit_h := 5;
  END IF;

  INSERT INTO public.usage (user_id, date) VALUES (_uid, _today)
    ON CONFLICT (user_id, date) DO NOTHING;
  SELECT * INTO _row FROM public.usage WHERE user_id = _uid AND date = _today;

  IF _tipo = 'perguntas' THEN
    IF _row.perguntas_count >= _limit_p THEN
      RETURN QUERY SELECT FALSE, _row.perguntas_count, _row.historias_count, _plan;
      RETURN;
    END IF;
    UPDATE public.usage SET perguntas_count = perguntas_count + 1, updated_at = now()
      WHERE user_id = _uid AND date = _today
      RETURNING * INTO _row;
  ELSE
    IF _row.historias_count >= _limit_h THEN
      RETURN QUERY SELECT FALSE, _row.perguntas_count, _row.historias_count, _plan;
      RETURN;
    END IF;
    UPDATE public.usage SET historias_count = historias_count + 1, updated_at = now()
      WHERE user_id = _uid AND date = _today
      RETURNING * INTO _row;
  END IF;

  RETURN QUERY SELECT TRUE, _row.perguntas_count, _row.historias_count, _plan;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_usage(TEXT) TO authenticated, service_role;

-- =========================
-- updated_at trigger for subscriptions
-- =========================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_subscriptions_updated ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- Auto-create subscription row on new profile
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.subscriptions (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- backfill subscriptions row for existing profiles
INSERT INTO public.subscriptions (user_id)
SELECT id FROM public.profiles
ON CONFLICT DO NOTHING;

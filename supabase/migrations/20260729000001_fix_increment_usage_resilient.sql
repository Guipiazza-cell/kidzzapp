-- Fix quota: increment_usage resiliente com ou sem crianca_id.
-- Resolve automaticamente a 1ª criança se _crianca_id não for passado.
-- Limites alinhados ao produto (America/Sao_Paulo):
--   free: 3 perguntas / 1 história
--   kidzz: 30 / 3
--   premium: 60 / 5
--
-- Aplicar no SQL Editor do Supabase (Lovable) se a CLI não tiver acesso.

DROP FUNCTION IF EXISTS public.increment_usage(text);
DROP FUNCTION IF EXISTS public.increment_usage(text, uuid);

CREATE OR REPLACE FUNCTION public.increment_usage(
  _tipo text,
  _crianca_id uuid DEFAULT NULL
)
RETURNS TABLE(
  allowed boolean,
  perguntas_count integer,
  historias_count integer,
  plan text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _today date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
  _plan text;
  _limit_p integer;
  _limit_h integer;
  _perguntas integer := 0;
  _historias integer := 0;
  _has_crianca_col boolean;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF _tipo NOT IN ('perguntas', 'historias') THEN
    RAISE EXCEPTION 'invalid tipo';
  END IF;

  SELECT ep.plan INTO _plan FROM public.get_effective_plan(_uid) ep;
  IF _plan IS NULL THEN
    _plan := 'free';
  END IF;

  IF _plan = 'free' THEN
    _limit_p := 3; _limit_h := 1;
  ELSIF _plan = 'premium' THEN
    _limit_p := 60; _limit_h := 5;
  ELSE
    _limit_p := 30; _limit_h := 3;
  END IF;

  -- Detecta se usage tem coluna crianca_id (schema novo)
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'usage' AND column_name = 'crianca_id'
  ) INTO _has_crianca_col;

  IF _has_crianca_col THEN
    -- Resolve criança: parâmetro → primeira criança do user → cria placeholder se não houver
    IF _crianca_id IS NULL THEN
      SELECT c.id INTO _crianca_id
      FROM public.criancas c
      WHERE c.user_id = _uid
      ORDER BY c.created_at ASC NULLS LAST
      LIMIT 1;
    END IF;

    IF _crianca_id IS NULL THEN
      INSERT INTO public.criancas (user_id, nome)
      VALUES (_uid, 'Criança')
      RETURNING id INTO _crianca_id;
    END IF;

    INSERT INTO public.usage (user_id, crianca_id, date)
    VALUES (_uid, _crianca_id, _today)
    ON CONFLICT (user_id, crianca_id, date) DO NOTHING;

    SELECT u.perguntas_count, u.historias_count
      INTO _perguntas, _historias
    FROM public.usage u
    WHERE u.user_id = _uid AND u.crianca_id = _crianca_id AND u.date = _today;

    IF _tipo = 'perguntas' THEN
      IF _perguntas >= _limit_p THEN
        RETURN QUERY SELECT FALSE, _perguntas, _historias, _plan;
        RETURN;
      END IF;
      UPDATE public.usage
        SET perguntas_count = perguntas_count + 1, updated_at = now()
      WHERE user_id = _uid AND crianca_id = _crianca_id AND date = _today
      RETURNING usage.perguntas_count, usage.historias_count
        INTO _perguntas, _historias;
    ELSE
      IF _historias >= _limit_h THEN
        RETURN QUERY SELECT FALSE, _perguntas, _historias, _plan;
        RETURN;
      END IF;
      UPDATE public.usage
        SET historias_count = historias_count + 1, updated_at = now()
      WHERE user_id = _uid AND crianca_id = _crianca_id AND date = _today
      RETURNING usage.perguntas_count, usage.historias_count
        INTO _perguntas, _historias;
    END IF;
  ELSE
    -- Schema antigo: PK (user_id, date)
    INSERT INTO public.usage (user_id, date)
    VALUES (_uid, _today)
    ON CONFLICT (user_id, date) DO NOTHING;

    SELECT u.perguntas_count, u.historias_count
      INTO _perguntas, _historias
    FROM public.usage u
    WHERE u.user_id = _uid AND u.date = _today;

    IF _tipo = 'perguntas' THEN
      IF _perguntas >= _limit_p THEN
        RETURN QUERY SELECT FALSE, _perguntas, _historias, _plan;
        RETURN;
      END IF;
      UPDATE public.usage
        SET perguntas_count = perguntas_count + 1, updated_at = now()
      WHERE user_id = _uid AND date = _today
      RETURNING usage.perguntas_count, usage.historias_count
        INTO _perguntas, _historias;
    ELSE
      IF _historias >= _limit_h THEN
        RETURN QUERY SELECT FALSE, _perguntas, _historias, _plan;
        RETURN;
      END IF;
      UPDATE public.usage
        SET historias_count = historias_count + 1, updated_at = now()
      WHERE user_id = _uid AND date = _today
      RETURNING usage.perguntas_count, usage.historias_count
        INTO _perguntas, _historias;
    END IF;
  END IF;

  RETURN QUERY SELECT TRUE, COALESCE(_perguntas, 0), COALESCE(_historias, 0), _plan;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_usage(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_usage(text, uuid) TO authenticated, service_role;

-- Compat: overload de 1 argumento chama a de 2 com NULL
CREATE OR REPLACE FUNCTION public.increment_usage(_tipo text)
RETURNS TABLE(
  allowed boolean,
  perguntas_count integer,
  historias_count integer,
  plan text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.increment_usage(_tipo, NULL::uuid);
$$;

REVOKE ALL ON FUNCTION public.increment_usage(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_usage(text) TO authenticated, service_role;

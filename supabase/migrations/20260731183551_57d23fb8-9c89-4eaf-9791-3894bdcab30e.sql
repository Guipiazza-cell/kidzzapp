CREATE OR REPLACE FUNCTION public.increment_usage(_tipo text, _crianca_id uuid)
 RETURNS TABLE(allowed boolean, perguntas_count integer, historias_count integer, plan text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
 SET "TimeZone" TO 'America/Sao_Paulo'
AS $function$
  DECLARE
    _uid uuid := auth.uid();
    _today date := current_date;
    _plan text;
    _limit_p integer;
    _limit_h integer;
    _child uuid;
    _row public.usage%ROWTYPE;
  BEGIN
    IF _uid IS NULL THEN
      RAISE EXCEPTION 'not authenticated';
    END IF;

    IF _tipo NOT IN ('perguntas', 'historias') THEN
      RAISE EXCEPTION 'invalid tipo';
    END IF;

    SELECT c.id INTO _child
    FROM public.criancas c
    WHERE c.user_id = _uid AND _crianca_id IS NOT NULL AND c.id = _crianca_id;

    IF _child IS NULL THEN
      SELECT c.id INTO _child
      FROM public.criancas c
      WHERE c.user_id = _uid
      ORDER BY c.created_at ASC
      LIMIT 1;
    END IF;

    IF _child IS NULL THEN
      INSERT INTO public.criancas (user_id, nome)
      VALUES (_uid, COALESCE(NULLIF((SELECT p.child_name FROM public.profiles p WHERE p.id = _uid), ''), 'Meu filho'))
      RETURNING id INTO _child;
    END IF;

    SELECT ep.plan INTO _plan FROM public.get_effective_plan(_uid) ep;

    IF _plan = 'free' THEN
      _limit_p := 3;  _limit_h := 1;
    ELSIF _plan = 'premium' THEN
      _limit_p := 60; _limit_h := 5;
    ELSE
      _limit_p := 30; _limit_h := 3;
    END IF;

    INSERT INTO public.usage AS u (user_id, crianca_id, date)
    VALUES (_uid, _child, _today)
    ON CONFLICT (user_id, crianca_id, date) DO NOTHING;

    SELECT u.* INTO _row
    FROM public.usage u
    WHERE u.user_id = _uid AND u.crianca_id = _child AND u.date = _today
    FOR UPDATE;

    IF _tipo = 'perguntas' THEN
      IF _row.perguntas_count >= _limit_p THEN
        RETURN QUERY SELECT false, _row.perguntas_count, _row.historias_count, _plan;
        RETURN;
      END IF;

      UPDATE public.usage u
      SET perguntas_count = u.perguntas_count + 1, updated_at = now()
      WHERE u.user_id = _uid AND u.crianca_id = _child AND u.date = _today
      RETURNING u.* INTO _row;
    ELSE
      IF _row.historias_count >= _limit_h THEN
        RETURN QUERY SELECT false, _row.perguntas_count, _row.historias_count, _plan;
        RETURN;
      END IF;

      UPDATE public.usage u
      SET historias_count = u.historias_count + 1, updated_at = now()
      WHERE u.user_id = _uid AND u.crianca_id = _child AND u.date = _today
      RETURNING u.* INTO _row;
    END IF;

    RETURN QUERY SELECT true, _row.perguntas_count, _row.historias_count, _plan;
  END;
  $function$;
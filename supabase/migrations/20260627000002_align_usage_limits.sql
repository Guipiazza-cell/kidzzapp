-- Alinha os limites do servidor (increment_usage) aos limites anunciados no
-- cliente. Antes o servidor capava kidzz E premium em 10 perguntas/dia, abaixo
-- do que o app promete (30/60) — usuário pagante era bloqueado antes do limite
-- prometido. Agora cada plano tem o seu cap, e o servidor segue sendo a fonte
-- de verdade (não dá para burlar pelo cliente).
--
--   free:    3 perguntas / 1 história  (igual ao trial do cliente)
--   kidzz:   30 perguntas / 3 histórias
--   premium: 60 perguntas / 5 histórias
--
-- Timezone do reset continua America/Sao_Paulo (meia-noite de Brasília).

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
    _limit_p := 3;  _limit_h := 1;
  ELSIF _plan = 'premium' THEN
    _limit_p := 60; _limit_h := 5;
  ELSE
    -- kidzz
    _limit_p := 30; _limit_h := 3;
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

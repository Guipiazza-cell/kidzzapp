
-- =========== Desafios da Semana ===========
CREATE TABLE IF NOT EXISTS public.desafios_semanais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  semana_iso text NOT NULL UNIQUE,
  titulo text NOT NULL,
  descricao text NOT NULL,
  emoji text NOT NULL DEFAULT '🌿',
  hashtag text NOT NULL DEFAULT '#MovimentoMenosTela',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.desafios_semanais TO authenticated, anon;
GRANT ALL ON public.desafios_semanais TO service_role;
ALTER TABLE public.desafios_semanais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "desafios leitura publica" ON public.desafios_semanais FOR SELECT USING (true);

-- =========== Preferências de notificação ===========
CREATE TABLE IF NOT EXISTS public.notificacao_prefs (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hora int NOT NULL DEFAULT 18 CHECK (hora >= 0 AND hora <= 23),
  ativo boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notificacao_prefs TO authenticated;
GRANT ALL ON public.notificacao_prefs TO service_role;
ALTER TABLE public.notificacao_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif prefs dono select" ON public.notificacao_prefs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif prefs dono upsert" ON public.notificacao_prefs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif prefs dono update" ON public.notificacao_prefs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif prefs dono delete" ON public.notificacao_prefs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========== get_bora_stats ===========
CREATE OR REPLACE FUNCTION public.get_bora_stats()
RETURNS TABLE(
  total_minutos int,
  total_conclusoes int,
  streak int,
  categorias_exploradas int
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _streak int := 0;
  _today date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
  _check date;
  _has boolean;
BEGIN
  IF _uid IS NULL THEN
    RETURN QUERY SELECT 0, 0, 0, 0;
    RETURN;
  END IF;

  -- streak honesto: dias consecutivos a partir de hoje (ou ontem se hoje vazio)
  _check := _today;
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM public.conclusoes
      WHERE user_id = _uid
        AND (feito_em AT TIME ZONE 'America/Sao_Paulo')::date = _check
    ) INTO _has;
    IF _has THEN
      _streak := _streak + 1;
      _check := _check - 1;
    ELSE
      IF _check = _today THEN
        -- talvez ainda não fez hoje, tenta a partir de ontem
        _check := _check - 1;
        SELECT EXISTS (
          SELECT 1 FROM public.conclusoes
          WHERE user_id = _uid
            AND (feito_em AT TIME ZONE 'America/Sao_Paulo')::date = _check
        ) INTO _has;
        IF _has THEN
          _streak := _streak + 1;
          _check := _check - 1;
          CONTINUE;
        END IF;
      END IF;
      EXIT;
    END IF;
    IF _streak > 365 THEN EXIT; END IF;
  END LOOP;

  RETURN QUERY
  SELECT
    COALESCE(SUM(c.tela_min), 0)::int AS total_minutos,
    COUNT(*)::int AS total_conclusoes,
    _streak AS streak,
    (SELECT COUNT(DISTINCT a.categoria)::int
       FROM public.conclusoes c2
       LEFT JOIN public.activities a ON a.id = c2.activity_id
       WHERE c2.user_id = _uid AND a.categoria IS NOT NULL) AS categorias_exploradas
  FROM public.conclusoes c
  WHERE c.user_id = _uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_bora_stats() TO authenticated;

-- =========== ensure_indicacao_codigo ===========
CREATE OR REPLACE FUNCTION public.ensure_indicacao_codigo()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _codigo text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  SELECT codigo INTO _codigo FROM public.indicacoes
    WHERE indicador_id = _uid AND convidado_id IS NULL
    ORDER BY created_at ASC LIMIT 1;
  IF _codigo IS NOT NULL THEN RETURN _codigo; END IF;

  LOOP
    _codigo := upper(substring(replace(gen_random_uuid()::text, '-', '') FROM 1 FOR 7));
    BEGIN
      INSERT INTO public.indicacoes (indicador_id, codigo) VALUES (_uid, _codigo);
      RETURN _codigo;
    EXCEPTION WHEN unique_violation THEN
      CONTINUE;
    END;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_indicacao_codigo() TO authenticated;

-- =========== aplicar_indicacao ===========
CREATE OR REPLACE FUNCTION public.aplicar_indicacao(_codigo text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _row public.indicacoes%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _codigo IS NULL OR length(trim(_codigo)) < 4 THEN RAISE EXCEPTION 'invalid code'; END IF;

  SELECT * INTO _row FROM public.indicacoes WHERE codigo = upper(trim(_codigo));
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_found'); END IF;
  IF _row.indicador_id = _uid THEN RETURN jsonb_build_object('ok', false, 'reason', 'self'); END IF;
  IF _row.convidado_id IS NOT NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'already_used'); END IF;

  UPDATE public.indicacoes
    SET convidado_id = _uid, recompensado = true
    WHERE id = _row.id;

  -- 1 mês de premium pra cada um (estende subscription)
  UPDATE public.subscriptions
    SET plan = 'premium',
        status = 'active',
        current_period_end = GREATEST(COALESCE(current_period_end, now()), now()) + interval '30 days',
        updated_at = now()
    WHERE user_id IN (_uid, _row.indicador_id);

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.aplicar_indicacao(text) TO authenticated;

-- =========== Storage policies pro bucket momentos ===========
DROP POLICY IF EXISTS "momentos dono select" ON storage.objects;
DROP POLICY IF EXISTS "momentos dono insert" ON storage.objects;
DROP POLICY IF EXISTS "momentos dono update" ON storage.objects;
DROP POLICY IF EXISTS "momentos dono delete" ON storage.objects;

CREATE POLICY "momentos dono select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'momentos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "momentos dono insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'momentos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "momentos dono update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'momentos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "momentos dono delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'momentos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =========== Seed desafio da semana ===========
INSERT INTO public.desafios_semanais (semana_iso, titulo, descricao, emoji, hashtag, ativo)
VALUES (
  to_char(now(), 'IYYY-"W"IW'),
  'Cabaninha de lençol',
  'Essa semana a missão é montar uma cabana no meio da sala com o que tiver: lençol, cadeira, almofada. Entrem juntos, leiam uma história lá dentro e marquem o momento.',
  '🏕️',
  '#MovimentoMenosTela',
  true
)
ON CONFLICT (semana_iso) DO NOTHING;

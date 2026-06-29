-- Escopa memórias e uso diário por criança ativa, mantendo RLS por user_id.
-- Aplicar manualmente no SQL Editor.

BEGIN;

-- Garante uma criança de backfill para usuários legados que já têm conteúdo/uso,
-- mas ainda não possuem linha em public.criancas.
WITH content_users AS (
  SELECT user_id FROM public.memories
  UNION
  SELECT user_id FROM public.usage
)
INSERT INTO public.criancas (user_id, nome, idade, interesses)
SELECT cu.user_id,
       COALESCE(NULLIF(p.child_name, ''), 'Criança'),
       NULL,
       COALESCE(p.child_interests, '{}'::text[])
FROM content_users cu
LEFT JOIN public.profiles p ON p.id = cu.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.criancas c WHERE c.user_id = cu.user_id
);

ALTER TABLE public.memories
  ADD COLUMN IF NOT EXISTS crianca_id uuid REFERENCES public.criancas(id) ON DELETE CASCADE;

UPDATE public.memories m
SET crianca_id = (
  SELECT id
  FROM public.criancas
  WHERE user_id = m.user_id
  ORDER BY created_at ASC, id ASC
  LIMIT 1
)
WHERE m.crianca_id IS NULL;

ALTER TABLE public.usage
  ADD COLUMN IF NOT EXISTS crianca_id uuid REFERENCES public.criancas(id) ON DELETE CASCADE;

UPDATE public.usage u
SET crianca_id = (
  SELECT id
  FROM public.criancas
  WHERE user_id = u.user_id
  ORDER BY created_at ASC, id ASC
  LIMIT 1
)
WHERE u.crianca_id IS NULL;

-- Depois do backfill, novas linhas precisam sempre escolher a criança ativa.
ALTER TABLE public.memories
  ALTER COLUMN crianca_id SET NOT NULL;

ALTER TABLE public.usage
  ALTER COLUMN crianca_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memories_user_child
  ON public.memories (user_id, crianca_id);

CREATE INDEX IF NOT EXISTS idx_memories_user_child_created
  ON public.memories (user_id, crianca_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_usage_user_child
  ON public.usage (user_id, crianca_id);

DO $$
DECLARE
  pk_name text;
  pk_cols text[];
BEGIN
  SELECT con.conname,
         array_agg(att.attname ORDER BY ord.ordinality)
    INTO pk_name, pk_cols
  FROM pg_constraint con
  JOIN unnest(con.conkey) WITH ORDINALITY AS ord(attnum, ordinality) ON true
  JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ord.attnum
  WHERE con.conrelid = 'public.usage'::regclass
    AND con.contype = 'p'
  GROUP BY con.conname;

  IF pk_name IS NULL THEN
    ALTER TABLE public.usage
      ADD CONSTRAINT usage_pkey PRIMARY KEY (user_id, crianca_id, date);
  ELSIF pk_cols IS DISTINCT FROM ARRAY['user_id', 'crianca_id', 'date'] THEN
    EXECUTE format('ALTER TABLE public.usage DROP CONSTRAINT %I', pk_name);
    ALTER TABLE public.usage
      ADD CONSTRAINT usage_pkey PRIMARY KEY (user_id, crianca_id, date);
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.increment_usage(text);

CREATE OR REPLACE FUNCTION public.increment_usage(_tipo text, _crianca_id uuid)
RETURNS TABLE(allowed boolean, perguntas_count integer, historias_count integer, plan text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET timezone = 'America/Sao_Paulo'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _today date := current_date;
  _plan text;
  _limit_p integer;
  _limit_h integer;
  _row public.usage%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF _tipo NOT IN ('perguntas', 'historias') THEN
    RAISE EXCEPTION 'invalid tipo';
  END IF;

  IF _crianca_id IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.criancas c
    WHERE c.id = _crianca_id
      AND c.user_id = _uid
  ) THEN
    RAISE EXCEPTION 'invalid child';
  END IF;

  SELECT ep.plan INTO _plan FROM public.get_effective_plan(_uid) ep;

  IF _plan = 'free' THEN
    _limit_p := 3;  _limit_h := 1;
  ELSIF _plan = 'premium' THEN
    _limit_p := 60; _limit_h := 5;
  ELSE
    _limit_p := 30; _limit_h := 3;
  END IF;

  INSERT INTO public.usage (user_id, crianca_id, date)
  VALUES (_uid, _crianca_id, _today)
  ON CONFLICT (user_id, crianca_id, date) DO NOTHING;

  SELECT *
    INTO _row
  FROM public.usage
  WHERE user_id = _uid
    AND crianca_id = _crianca_id
    AND date = _today
  FOR UPDATE;

  IF _tipo = 'perguntas' THEN
    IF _row.perguntas_count >= _limit_p THEN
      RETURN QUERY SELECT false, _row.perguntas_count, _row.historias_count, _plan;
      RETURN;
    END IF;

    UPDATE public.usage
    SET perguntas_count = perguntas_count + 1,
        updated_at = now()
    WHERE user_id = _uid
      AND crianca_id = _crianca_id
      AND date = _today
    RETURNING * INTO _row;
  ELSE
    IF _row.historias_count >= _limit_h THEN
      RETURN QUERY SELECT false, _row.perguntas_count, _row.historias_count, _plan;
      RETURN;
    END IF;

    UPDATE public.usage
    SET historias_count = historias_count + 1,
        updated_at = now()
    WHERE user_id = _uid
      AND crianca_id = _crianca_id
      AND date = _today
    RETURNING * INTO _row;
  END IF;

  RETURN QUERY SELECT true, _row.perguntas_count, _row.historias_count, _plan;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_usage(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_usage(text, uuid) TO authenticated, service_role;

COMMIT;

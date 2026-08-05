CREATE TABLE IF NOT EXISTS public.stripe_orphan_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  type text,
  stripe_customer_id text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.stripe_orphan_events TO service_role;

ALTER TABLE public.stripe_orphan_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read orphan events"
  ON public.stripe_orphan_events FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.complete_onboarding_v2(
  p_child_name text,
  p_idade integer DEFAULT NULL,
  p_interests text[] DEFAULT '{}',
  p_materiais text[] DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_name text := NULLIF(trim(coalesce(p_child_name, '')), '');
  v_child uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.profiles (id, child_name, child_interests)
    VALUES (v_user, coalesce(v_name, ''), coalesce(p_interests, '{}'))
    ON CONFLICT (id) DO NOTHING;

  UPDATE public.profiles
     SET child_name = coalesce(v_name, child_name),
         age_range = CASE WHEN p_idade IS NULL THEN age_range ELSE p_idade::text END,
         child_interests = CASE
                             WHEN coalesce(array_length(p_interests, 1), 0) > 0 THEN p_interests
                             ELSE child_interests
                           END,
         onboarding_done = true,
         updated_at = now()
   WHERE id = v_user;

  SELECT c.id INTO v_child
    FROM public.criancas c
   WHERE c.user_id = v_user
   ORDER BY c.created_at ASC
   LIMIT 1;

  IF v_child IS NULL THEN
    INSERT INTO public.criancas (user_id, nome, idade, interesses, materiais_em_casa)
      VALUES (v_user, coalesce(v_name, 'Meu filho'), p_idade,
              coalesce(p_interests, '{}'), coalesce(p_materiais, '{}'))
      RETURNING id INTO v_child;
  ELSE
    UPDATE public.criancas
       SET nome = coalesce(v_name, nome),
           idade = coalesce(p_idade, idade),
           interesses = CASE WHEN coalesce(array_length(p_interests, 1), 0) > 0 THEN p_interests ELSE interesses END,
           materiais_em_casa = CASE WHEN coalesce(array_length(p_materiais, 1), 0) > 0 THEN p_materiais ELSE materiais_em_casa END,
           updated_at = now()
     WHERE id = v_child;
  END IF;

  RETURN v_child;
END;
$$;
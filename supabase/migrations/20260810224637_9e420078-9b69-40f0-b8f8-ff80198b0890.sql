-- 1) helper: a criança pertence ao usuário?
CREATE OR REPLACE FUNCTION public.owns_crianca(_crianca_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _crianca_id IS NULL OR EXISTS (
    SELECT 1 FROM public.criancas c
    WHERE c.id = _crianca_id AND c.user_id = auth.uid()
  );
$$;

-- 2) kidzz_questions_log ganha crianca_id (nullable: legado não atribuível)
ALTER TABLE public.kidzz_questions_log
  ADD COLUMN IF NOT EXISTS crianca_id uuid REFERENCES public.criancas(id) ON DELETE CASCADE;

UPDATE public.kidzz_questions_log l
   SET crianca_id = c.id
  FROM public.criancas c
 WHERE l.crianca_id IS NULL
   AND c.user_id = l.user_id
   AND (SELECT count(*) FROM public.criancas c2 WHERE c2.user_id = l.user_id) = 1;

CREATE INDEX IF NOT EXISTS idx_qlog_user_crianca
  ON public.kidzz_questions_log (user_id, crianca_id, created_at DESC);

-- 3) políticas por criança
DROP POLICY IF EXISTS "Users can view their own question logs" ON public.kidzz_questions_log;
DROP POLICY IF EXISTS "Users can insert their own question logs" ON public.kidzz_questions_log;
DROP POLICY IF EXISTS "Users can update their own question logs" ON public.kidzz_questions_log;
DROP POLICY IF EXISTS "Users can delete their own question logs" ON public.kidzz_questions_log;

CREATE POLICY "qlog select own" ON public.kidzz_questions_log
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND public.owns_crianca(crianca_id));
CREATE POLICY "qlog insert own" ON public.kidzz_questions_log
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.owns_crianca(crianca_id));
CREATE POLICY "qlog update own" ON public.kidzz_questions_log
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND public.owns_crianca(crianca_id))
  WITH CHECK (auth.uid() = user_id AND public.owns_crianca(crianca_id));
CREATE POLICY "qlog delete own" ON public.kidzz_questions_log
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND public.owns_crianca(crianca_id));

DROP POLICY IF EXISTS "Users can view own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can create own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can update own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON public.memories;

CREATE POLICY "memories select own" ON public.memories
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND public.owns_crianca(crianca_id));
CREATE POLICY "memories insert own" ON public.memories
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.owns_crianca(crianca_id));
CREATE POLICY "memories update own" ON public.memories
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND public.owns_crianca(crianca_id))
  WITH CHECK (auth.uid() = user_id AND public.owns_crianca(crianca_id));
CREATE POLICY "memories delete own" ON public.memories
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND public.owns_crianca(crianca_id));

DROP POLICY IF EXISTS "conclusoes dono select" ON public.conclusoes;
DROP POLICY IF EXISTS "conclusoes dono insert" ON public.conclusoes;
DROP POLICY IF EXISTS "conclusoes dono update" ON public.conclusoes;
DROP POLICY IF EXISTS "conclusoes dono delete" ON public.conclusoes;

CREATE POLICY "conclusoes dono select" ON public.conclusoes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND public.owns_crianca(crianca_id));
CREATE POLICY "conclusoes dono insert" ON public.conclusoes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.owns_crianca(crianca_id));
CREATE POLICY "conclusoes dono update" ON public.conclusoes
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND public.owns_crianca(crianca_id))
  WITH CHECK (auth.uid() = user_id AND public.owns_crianca(crianca_id));
CREATE POLICY "conclusoes dono delete" ON public.conclusoes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND public.owns_crianca(crianca_id));

DROP POLICY IF EXISTS "usage_select_own" ON public.usage;
CREATE POLICY "usage_select_own" ON public.usage
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND public.owns_crianca(crianca_id));
CREATE TABLE public.kidzz_questions_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  age_range TEXT,
  was_narrated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kidzz_questions_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own question logs"
ON public.kidzz_questions_log
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own question logs"
ON public.kidzz_questions_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own question logs"
ON public.kidzz_questions_log
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own question logs"
ON public.kidzz_questions_log
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_kidzz_questions_log_user_created
  ON public.kidzz_questions_log (user_id, created_at DESC);

CREATE INDEX idx_kidzz_questions_log_narrated
  ON public.kidzz_questions_log (user_id, was_narrated, created_at DESC);
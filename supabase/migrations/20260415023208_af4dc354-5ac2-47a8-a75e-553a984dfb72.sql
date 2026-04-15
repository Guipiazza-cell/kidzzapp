-- Create memories table for the family album
CREATE TABLE public.memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'question',
  title TEXT NOT NULL,
  content TEXT,
  is_special BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Users can only access their own memories
CREATE POLICY "Users can view own memories"
  ON public.memories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own memories"
  ON public.memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories"
  ON public.memories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
  ON public.memories FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast user queries
CREATE INDEX idx_memories_user_id ON public.memories (user_id);
CREATE INDEX idx_memories_user_type ON public.memories (user_id, type);
CREATE INDEX idx_memories_user_created ON public.memories (user_id, created_at DESC);
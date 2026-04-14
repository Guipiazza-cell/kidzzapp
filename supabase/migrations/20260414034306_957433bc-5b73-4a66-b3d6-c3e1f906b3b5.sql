
CREATE TABLE public.character_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  evolution_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  dominant_trait TEXT NOT NULL DEFAULT 'calm',
  emotional_state TEXT NOT NULL DEFAULT 'calm',
  color_from TEXT NOT NULL DEFAULT '#A855F7',
  color_to TEXT NOT NULL DEFAULT '#7C3AED',
  expression TEXT NOT NULL DEFAULT 'calm',
  outfit TEXT NOT NULL DEFAULT 'none',
  energy_mode TEXT NOT NULL DEFAULT 'medium',
  stories_count INTEGER NOT NULL DEFAULT 0,
  questions_count INTEGER NOT NULL DEFAULT 0,
  games_count INTEGER NOT NULL DEFAULT 0,
  moments_count INTEGER NOT NULL DEFAULT 0,
  unlocked_outfits TEXT[] NOT NULL DEFAULT ARRAY['none','labcoat']::TEXT[],
  unlocked_colors TEXT[] NOT NULL DEFAULT ARRAY['purple']::TEXT[],
  last_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.character_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own character"
ON public.character_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own character"
ON public.character_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own character"
ON public.character_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

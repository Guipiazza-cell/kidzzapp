-- Challenges table for 7-Day Connection Challenge
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID NOT NULL,
  challenged_id UUID,
  challenge_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  start_date DATE,
  challenger_progress BOOLEAN[] NOT NULL DEFAULT ARRAY[false,false,false,false,false,false,false],
  challenged_progress BOOLEAN[] NOT NULL DEFAULT ARRAY[false,false,false,false,false,false,false],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges"
  ON public.challenges FOR SELECT TO authenticated
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Users can create challenges"
  ON public.challenges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Participants can update challenges"
  ON public.challenges FOR UPDATE TO authenticated
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- Referral rewards tracking
CREATE TABLE public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  months_earned INTEGER NOT NULL DEFAULT 0,
  months_used INTEGER NOT NULL DEFAULT 0,
  referred_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards"
  ON public.referral_rewards FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own rewards"
  ON public.referral_rewards FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rewards"
  ON public.referral_rewards FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
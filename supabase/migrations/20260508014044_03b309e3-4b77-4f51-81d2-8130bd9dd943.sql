ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'free';

-- Backfill: legacy is_premium=true → 'kidzz' (renomeação: antigo premium agora é o plano base pago)
UPDATE public.profiles SET tier = 'kidzz' WHERE is_premium = true AND tier = 'free';
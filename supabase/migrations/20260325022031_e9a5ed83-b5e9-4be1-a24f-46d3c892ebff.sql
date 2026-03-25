
-- Affiliates table: stores affiliate codes linked to users
CREATE TABLE public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  affiliate_code text NOT NULL UNIQUE,
  commission_rate numeric(5,2) NOT NULL DEFAULT 10.00,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Referrals table: tracks each conversion
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE CASCADE NOT NULL,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  plan text NOT NULL,
  amount_paid numeric(10,2) NOT NULL,
  commission_amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can read their own affiliate record
CREATE POLICY "Users can read own affiliate" ON public.affiliates
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can insert their own affiliate record
CREATE POLICY "Users can create own affiliate" ON public.affiliates
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can read their own referrals (via affiliate)
CREATE POLICY "Users can read own referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid()));

-- Service role can insert referrals (from edge function)
CREATE POLICY "Service can insert referrals" ON public.referrals
  FOR INSERT TO service_role WITH CHECK (true);

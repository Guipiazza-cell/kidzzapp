
-- Add premium_source and plan_end_date to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS premium_source text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS plan_end_date timestamp with time zone DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Allow admins to read all profiles (for admin panel)
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  );

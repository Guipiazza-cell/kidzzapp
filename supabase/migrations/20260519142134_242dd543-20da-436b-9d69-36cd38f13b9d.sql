
-- 1. Profiles: user self-update with locked-down sensitive columns
CREATE POLICY "Users can update own profile (non-privileged fields)"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND is_admin = (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  AND is_premium = (SELECT is_premium FROM public.profiles WHERE id = auth.uid())
  AND tier = (SELECT tier FROM public.profiles WHERE id = auth.uid())
  AND points = (SELECT points FROM public.profiles WHERE id = auth.uid())
  AND COALESCE(premium_source, '') = COALESCE((SELECT premium_source FROM public.profiles WHERE id = auth.uid()), '')
  AND plan_end_date IS NOT DISTINCT FROM (SELECT plan_end_date FROM public.profiles WHERE id = auth.uid())
  AND questions_used = (SELECT questions_used FROM public.profiles WHERE id = auth.uid())
  AND stories_used = (SELECT stories_used FROM public.profiles WHERE id = auth.uid())
);

-- 2. Profiles: ensure admins cannot escalate is_admin via this policy
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (
  public.is_admin(auth.uid())
  -- prevent flipping is_admin via RLS-permitted updates; admin flag must be
  -- changed only via service_role/server-side process
  AND is_admin = (SELECT is_admin FROM public.profiles p WHERE p.id = profiles.id)
);

-- 3. Referral rewards: remove user-side mutations. Only service_role.
DROP POLICY IF EXISTS "Users can create own rewards" ON public.referral_rewards;
DROP POLICY IF EXISTS "Users can update own rewards" ON public.referral_rewards;

CREATE POLICY "Service can insert rewards"
ON public.referral_rewards
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service can update rewards"
ON public.referral_rewards
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Lock down is_admin from anon callers (still needed for authenticated RLS)
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

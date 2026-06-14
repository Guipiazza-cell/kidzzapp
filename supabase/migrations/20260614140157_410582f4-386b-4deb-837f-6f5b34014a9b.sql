-- 1) Challenges: restrict UPDATE so each participant can only modify their own progress.
DROP POLICY IF EXISTS "Participants can update challenges" ON public.challenges;

CREATE POLICY "Challenger can update own progress"
ON public.challenges
FOR UPDATE
TO authenticated
USING (auth.uid() = challenger_id)
WITH CHECK (
  auth.uid() = challenger_id
  AND challenger_id = (SELECT c.challenger_id FROM public.challenges c WHERE c.id = challenges.id)
  AND challenged_id IS NOT DISTINCT FROM (SELECT c.challenged_id FROM public.challenges c WHERE c.id = challenges.id)
  AND status = (SELECT c.status FROM public.challenges c WHERE c.id = challenges.id)
  AND start_date IS NOT DISTINCT FROM (SELECT c.start_date FROM public.challenges c WHERE c.id = challenges.id)
  AND challenge_code = (SELECT c.challenge_code FROM public.challenges c WHERE c.id = challenges.id)
  AND challenged_progress = (SELECT c.challenged_progress FROM public.challenges c WHERE c.id = challenges.id)
);

CREATE POLICY "Challenged can update own progress"
ON public.challenges
FOR UPDATE
TO authenticated
USING (auth.uid() = challenged_id)
WITH CHECK (
  auth.uid() = challenged_id
  AND challenger_id = (SELECT c.challenger_id FROM public.challenges c WHERE c.id = challenges.id)
  AND challenged_id IS NOT DISTINCT FROM (SELECT c.challenged_id FROM public.challenges c WHERE c.id = challenges.id)
  AND status = (SELECT c.status FROM public.challenges c WHERE c.id = challenges.id)
  AND start_date IS NOT DISTINCT FROM (SELECT c.start_date FROM public.challenges c WHERE c.id = challenges.id)
  AND challenge_code = (SELECT c.challenge_code FROM public.challenges c WHERE c.id = challenges.id)
  AND challenger_progress = (SELECT c.challenger_progress FROM public.challenges c WHERE c.id = challenges.id)
);

-- 2) Profiles: lock streak / last_streak_date / last_usage_date in WITH CHECK as well.
DROP POLICY IF EXISTS "Users can update own profile (non-privileged fields)" ON public.profiles;

CREATE POLICY "Users can update own profile (non-privileged fields)"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND is_admin = (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid())
  AND is_premium = (SELECT p.is_premium FROM public.profiles p WHERE p.id = auth.uid())
  AND tier = (SELECT p.tier FROM public.profiles p WHERE p.id = auth.uid())
  AND points = (SELECT p.points FROM public.profiles p WHERE p.id = auth.uid())
  AND COALESCE(premium_source, '') = COALESCE((SELECT p.premium_source FROM public.profiles p WHERE p.id = auth.uid()), '')
  AND plan_end_date IS NOT DISTINCT FROM (SELECT p.plan_end_date FROM public.profiles p WHERE p.id = auth.uid())
  AND questions_used = (SELECT p.questions_used FROM public.profiles p WHERE p.id = auth.uid())
  AND stories_used = (SELECT p.stories_used FROM public.profiles p WHERE p.id = auth.uid())
  AND streak_days = (SELECT p.streak_days FROM public.profiles p WHERE p.id = auth.uid())
  AND last_streak_date IS NOT DISTINCT FROM (SELECT p.last_streak_date FROM public.profiles p WHERE p.id = auth.uid())
  AND last_usage_date = (SELECT p.last_usage_date FROM public.profiles p WHERE p.id = auth.uid())
);

-- 3) Revoke EXECUTE from anon on SECURITY DEFINER functions; grant only what's needed.
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_effective_plan(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_effective_plan(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.increment_usage(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_usage(text) TO authenticated, service_role;

-- handle_new_user and touch_updated_at are internal trigger-only functions.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touch_updated_at() TO service_role;
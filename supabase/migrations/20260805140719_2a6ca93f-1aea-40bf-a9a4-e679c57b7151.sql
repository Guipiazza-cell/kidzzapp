UPDATE public.subscriptions SET plan='premium', status='active', current_period_end='2099-12-31T00:00:00Z', updated_at=now() WHERE user_id='804f8fce-0c0d-491f-930f-b9da9d7fec45';
INSERT INTO public.subscriptions (user_id, plan, status, current_period_end)
SELECT '804f8fce-0c0d-491f-930f-b9da9d7fec45','premium','active','2099-12-31T00:00:00Z'
WHERE NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id='804f8fce-0c0d-491f-930f-b9da9d7fec45');
UPDATE public.profiles SET is_premium=true, tier='premium', premium_source='vitalicio', plan_end_date='2099-12-31T00:00:00Z', updated_at=now() WHERE id='804f8fce-0c0d-491f-930f-b9da9d7fec45';
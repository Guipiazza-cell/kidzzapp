
-- 1) Add onboarding_done column to profiles (conservative)
alter table public.profiles
  add column if not exists onboarding_done boolean not null default false;

-- 2) Backfill: anyone who already has child_name + age_range + interests is considered done
update public.profiles
   set onboarding_done = true
 where onboarding_done = false
   and child_name is not null
   and child_name <> ''
   and age_range is not null
   and coalesce(array_length(child_interests, 1), 0) > 0;

-- 3) Idempotent onboarding RPC: row lock prevents duplicate writes from double-tap
create or replace function public.complete_onboarding(
  p_child_name text,
  p_age_range text,
  p_child_interests text[]
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_done boolean;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  -- Lock the profile row (creates it first if missing). PK = auth.users.id, so
  -- the upsert is unique per user — no duplicate profiles possible.
  insert into public.profiles (id, child_name, age_range, child_interests)
    values (v_user, coalesce(p_child_name, ''), p_age_range, coalesce(p_child_interests, '{}'))
    on conflict (id) do nothing;

  select onboarding_done into v_done
    from public.profiles
    where id = v_user
    for update;

  if v_done is true then
    return; -- idempotent: no-op
  end if;

  update public.profiles
     set child_name = case
                        when coalesce(p_child_name, '') <> '' then p_child_name
                        else child_name
                      end,
         age_range = coalesce(p_age_range, age_range),
         child_interests = case
                             when coalesce(array_length(p_child_interests, 1), 0) > 0
                               then p_child_interests
                             else child_interests
                           end,
         onboarding_done = true,
         updated_at = now()
   where id = v_user;
end;
$$;

grant execute on function public.complete_onboarding(text, text, text[]) to authenticated;

/** Guest profile seed — entra no app sem auth de produção. */

export type GuestSeedOptions = {
  childName?: string;
  ageRange?: string;
  interests?: string[];
  isPremium?: boolean;
  questionsUsed?: number;
  activeTab?: string;
};

export function buildGuestProfile(opts: GuestSeedOptions = {}) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    child_name: opts.childName ?? "Luna",
    age_range: opts.ageRange ?? "3-7",
    child_interests: opts.interests ?? ["Natureza", "Animais", "Espaço"],
    questions_used: opts.questionsUsed ?? 0,
    stories_used: 0,
    last_usage_date: today,
    is_premium: opts.isPremium ?? false,
    voice_enabled: false,
    premium_source: opts.isPremium ? "e2e" : null,
    plan_end_date: null,
    is_admin: false,
    points: 120,
    streak_days: 3,
    last_streak_date: today,
    level: "iniciante",
    onboarding_done: true,
  };
}

/** localStorage keys that skip splash / intros / account gate */
export function buildGuestLocalStorage(opts: GuestSeedOptions = {}) {
  const profile = JSON.stringify(buildGuestProfile(opts));
  return {
    kidzz_guest_profile: profile,
    kidzz_guest_profile_backup: profile,
    kidzz_guest_profile_v2: profile,
    kidzz_account_step_done: "1",
    kidzz_splash_shown: "1",
    kidzz_intro_settled_v2: "1",
    kidzz_onboarding_welcomed: "1",
    kidzz_states_intro_seen: "1",
    kidzz_emotional_intro_v1: "1",
    kidzz_last_age_range: opts.ageRange ?? "3-7",
    ...(opts.activeTab ? { kidzz_active_tab: opts.activeTab } : {}),
  } as Record<string, string>;
}

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type SubscriptionTier = "free" | "kidzz" | "premium";

// Aliases legados — UI/back-compat. "super_premium" velho → novo "premium".
export type LegacyTier = "free" | "premium" | "super_premium";
export type CheckoutPlan = "kidzz" | "kidzz_annual" | "premium" | "premium_annual";

interface Profile {
  child_name: string;
  age_range: string | null;
  child_interests: string[];
  questions_used: number;
  stories_used: number;
  last_usage_date: string;
  is_premium: boolean;
  voice_enabled: boolean;
  premium_source: string | null;
  plan_end_date: string | null;
  is_admin: boolean;
  points: number;
  streak_days: number;
  last_streak_date: string | null;
  level: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  tier: SubscriptionTier;
  loading: boolean;
  isReady: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  incrementQuestions: () => Promise<void>;
  incrementStories: () => Promise<void>;
  canAskQuestion: () => boolean;
  canGenerateStory: () => boolean;
  questionsRemaining: () => number;
  storiesRemaining: () => number;
  refreshSubscription: () => Promise<void>;
  handleCheckout: (plan: "premium" | "premium_annual" | "super_premium" | "super_premium_annual") => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const CHECK_SUB_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subscription`;
const CHECKOUT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`;
const PORTAL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-portal`;
const GUEST_PROFILE_STORAGE_KEY = "kidzz_guest_profile";
const SUB_CACHE_KEY = "kidzz_sub_cache";
const SUB_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const todayStr = () => new Date().toISOString().slice(0, 10);

const createDefaultProfile = (): Profile => ({
  child_name: "",
  age_range: null,
  child_interests: [],
  questions_used: 0,
  stories_used: 0,
  last_usage_date: todayStr(),
  is_premium: false,
  voice_enabled: false,
  premium_source: null,
  plan_end_date: null,
  is_admin: false,
  points: 0,
  streak_days: 0,
  last_streak_date: null,
  level: "iniciante",
});

const normalizeProfile = (value?: Partial<Profile> | null): Profile => ({
  child_name: value?.child_name ?? "",
  age_range: value?.age_range ?? null,
  child_interests: (value as any)?.child_interests ?? [],
  questions_used: value?.questions_used ?? 0,
  stories_used: value?.stories_used ?? 0,
  last_usage_date: value?.last_usage_date ?? todayStr(),
  is_premium: value?.is_premium ?? false,
  voice_enabled: value?.voice_enabled ?? false,
  premium_source: value?.premium_source ?? null,
  plan_end_date: value?.plan_end_date ?? null,
  is_admin: value?.is_admin ?? false,
  points: value?.points ?? 0,
  streak_days: value?.streak_days ?? 0,
  last_streak_date: value?.last_streak_date ?? null,
  level: value?.level ?? "iniciante",
});

const getGuestProfile = (): Profile => {
  if (typeof window === "undefined") return createDefaultProfile();
  try {
    const stored = window.localStorage.getItem(GUEST_PROFILE_STORAGE_KEY);
    return stored ? normalizeProfile(JSON.parse(stored)) : createDefaultProfile();
  } catch {
    return createDefaultProfile();
  }
};

const saveGuestProfile = (profile: Profile) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

const clearGuestProfile = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_PROFILE_STORAGE_KEY);
};

// --- Subscription cache helpers ---
interface SubCache {
  tier: SubscriptionTier;
  isPremium: boolean;
  ts: number;
}

const getSubCache = (): SubCache | null => {
  try {
    const raw = localStorage.getItem(SUB_CACHE_KEY);
    if (!raw) return null;
    const cached: SubCache = JSON.parse(raw);
    if (Date.now() - cached.ts > SUB_CACHE_TTL) {
      localStorage.removeItem(SUB_CACHE_KEY);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
};

const setSubCache = (tier: SubscriptionTier, isPremium: boolean) => {
  localStorage.setItem(SUB_CACHE_KEY, JSON.stringify({ tier, isPremium, ts: Date.now() }));
};

const clearSubCache = () => localStorage.removeItem(SUB_CACHE_KEY);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const initDone = useRef(false);
  const subCheckInFlight = useRef(false);

  const resetDailyIfNeeded = useCallback((p: Profile): Profile => {
    if (!p.is_premium) return p;
    const today = todayStr();
    if (p.last_usage_date !== today) {
      return { ...p, questions_used: 0, stories_used: 0, last_usage_date: today };
    }
    return p;
  }, []);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile> => {
    const { data } = await supabase
      .from("profiles")
      .select("child_name, age_range, child_interests, questions_used, stories_used, last_usage_date, is_premium, voice_enabled, premium_source, plan_end_date, is_admin, points, streak_days, last_streak_date, level")
      .eq("id", userId)
      .single();

    if (data) {
      const prof = resetDailyIfNeeded(data as unknown as Profile);
      if (prof !== data) {
        supabase.from("profiles").update({
          questions_used: prof.questions_used,
          stories_used: prof.stories_used,
          last_usage_date: prof.last_usage_date,
        }).eq("id", userId).then(() => {});
      }
      return prof;
    }
    return getGuestProfile();
  }, [resetDailyIfNeeded]);

  const checkSubscription = useCallback(async (
    accessToken: string,
    currentProfile: Profile,
    forceRefresh = false
  ): Promise<{ tier: SubscriptionTier; isPremium: boolean }> => {
    // Manual users: trust DB, skip Stripe entirely
    if (currentProfile.premium_source === "manual" && currentProfile.is_premium) {
      const result = { tier: "premium" as SubscriptionTier, isPremium: true };
      setSubCache(result.tier, result.isPremium);
      return result;
    }

    // Check cache (unless forced)
    if (!forceRefresh) {
      const cached = getSubCache();
      if (cached) return { tier: cached.tier, isPremium: cached.isPremium };
    }

    if (subCheckInFlight.current) {
      return { tier: currentProfile.is_premium ? "premium" : "free", isPremium: currentProfile.is_premium };
    }
    subCheckInFlight.current = true;

    try {
      const resp = await fetch(CHECK_SUB_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!resp.ok) {
        console.warn("[Auth] check-subscription HTTP error, trusting DB", resp.status);
        const fallback = { tier: currentProfile.is_premium ? "premium" as SubscriptionTier : "free" as SubscriptionTier, isPremium: currentProfile.is_premium };
        setSubCache(fallback.tier, fallback.isPremium);
        return fallback;
      }

      const data = await resp.json();

      if (data.subscribed) {
        const newTier: SubscriptionTier = data.tier === "premium" ? "premium" : "kidzz";
        const result = { tier: newTier, isPremium: true };
        setSubCache(result.tier, result.isPremium);
        return result;
      }

      // Backend says free but DB says premium — trust DB
      if (currentProfile.is_premium && !data.subscribed) {
        console.warn("[Auth] Backend says free but DB profile is premium — trusting DB");
        const result = { tier: "premium" as SubscriptionTier, isPremium: true };
        setSubCache(result.tier, result.isPremium);
        return result;
      }

      const result = { tier: "free" as SubscriptionTier, isPremium: false };
      setSubCache(result.tier, result.isPremium);
      return result;
    } catch (err) {
      console.error("[Auth] checkSubscription error, trusting DB:", err);
      const fallback = { tier: currentProfile.is_premium ? "premium" as SubscriptionTier : "free" as SubscriptionTier, isPremium: currentProfile.is_premium };
      setSubCache(fallback.tier, fallback.isPremium);
      return fallback;
    } finally {
      subCheckInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          const prof = await fetchProfile(currentSession.user.id);
          if (!mounted) return;
          setProfile(prof);

          // On init, use cache if available, otherwise check
          const subResult = await checkSubscription(currentSession.access_token, prof);
          if (!mounted) return;
          setTier(subResult.tier);
          if (subResult.isPremium !== prof.is_premium) {
            setProfile(prev => prev ? { ...prev, is_premium: subResult.isPremium } : prev);
          }
        } else {
          setSession(null);
          setUser(null);
          setProfile(getGuestProfile());
          setTier("free");
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setSession(null);
        setUser(null);
        setProfile(getGuestProfile());
        setTier("free");
      } finally {
        if (mounted) {
          setLoading(false);
          setIsReady(true);
          initDone.current = true;
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted || !initDone.current) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        // On login, force refresh subscription
        clearSubCache();
        fetchProfile(nextSession.user.id).then(prof => {
          if (!mounted) return;
          setProfile(prof);
          checkSubscription(nextSession.access_token, prof, true).then(subResult => {
            if (!mounted) return;
            setTier(subResult.tier);
            if (subResult.isPremium !== prof.is_premium) {
              setProfile(prev => prev ? { ...prev, is_premium: subResult.isPremium } : prev);
            }
          });
        });
      } else {
        clearSubCache();
        setProfile(getGuestProfile());
        setTier("free");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, checkSubscription]);

  const refreshSubscription = useCallback(async () => {
    if (!session?.access_token || !profile) return;
    clearSubCache();
    const subResult = await checkSubscription(session.access_token, profile, true);
    setTier(subResult.tier);
    if (subResult.isPremium !== profile.is_premium) {
      setProfile(prev => prev ? { ...prev, is_premium: subResult.isPremium } : prev);
    }
  }, [session, profile, checkSubscription]);

  // No periodic refresh — only on login and manual refresh (cost optimization)

  const handleCheckout = useCallback(async (plan: "premium" | "premium_annual" | "super_premium" | "super_premium_annual") => {
    if (!session?.access_token) {
      const { toast } = await import("sonner");
      toast.error("Crie uma conta para assinar! Acesse o controle parental para fazer login.");
      return;
    }
    try {
      const ref = sessionStorage.getItem("kidzz_ref") || undefined;
      const resp = await fetch(CHECKOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan, ref }),
      });
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        const { toast } = await import("sonner");
        toast.error(data.error || "Erro ao criar checkout. Tente novamente.");
      }
    } catch {
      const { toast } = await import("sonner");
      toast.error("Erro ao iniciar pagamento. Verifique sua conexão.");
    }
  }, [session]);

  const openCustomerPortal = useCallback(async () => {
    if (!session?.access_token) {
      const { toast } = await import("sonner");
      toast.error("Faça login para gerenciar sua assinatura");
      return;
    }
    try {
      const resp = await fetch(PORTAL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await resp.json();
      if (data.url) window.location.href = data.url;
      else {
        const { toast } = await import("sonner");
        toast.error(data.error || "Erro ao abrir portal");
      }
    } catch {
      const { toast } = await import("sonner");
      toast.error("Erro ao abrir gerenciamento de assinatura");
    }
  }, [session]);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) console.error("Signup error:", error.message);
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) console.error("Login error:", error.message);
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    clearGuestProfile();
    clearSubCache();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("SignOut error:", error.message);
    } catch (e) {
      console.error("SignOut exception:", e);
    }
    setUser(null);
    setSession(null);
    setProfile(createDefaultProfile());
    setTier("free");
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (user) {
      try {
        const { error } = await supabase.from("profiles").update(updates as any).eq("id", user.id);
        if (error) {
          const { error: upsertErr } = await supabase.from("profiles").upsert({ id: user.id, ...updates } as any);
          if (upsertErr) console.error("updateProfile upsert error:", upsertErr.message);
        }
      } catch (e) {
        console.error("updateProfile exception:", e);
      }
      setProfile(prev => {
        const base = prev ?? createDefaultProfile();
        return { ...base, ...updates };
      });
      return;
    }
    setProfile(prev => {
      const next = normalizeProfile({ ...(prev ?? getGuestProfile()), ...updates });
      saveGuestProfile(next);
      return next;
    });
  };

  // Free trial vitalício (não reseta): 3 perguntas + 1 história de demonstração
  const MAX_FREE_QUESTIONS = 3;
  const MAX_FREE_STORIES = 1;
  // Limites diários para assinantes
  const DAILY_QUESTION_LIMIT = 10;
  const DAILY_STORY_LIMIT = 3;
  const SUPER_DAILY_STORY_LIMIT = 10;

  const canAskQuestion = useCallback(() => {
    if (!profile) return false;
    const p = resetDailyIfNeeded(profile);
    if (p.is_premium) return p.questions_used < DAILY_QUESTION_LIMIT;
    return p.questions_used < MAX_FREE_QUESTIONS;
  }, [profile, resetDailyIfNeeded]);

  const canGenerateStory = useCallback(() => {
    if (!profile) return false;
    const p = resetDailyIfNeeded(profile);
    // Super premium: limite diário maior
    if (tier === "super_premium") return p.stories_used < SUPER_DAILY_STORY_LIMIT;
    // Premium: limite diário padrão
    if (p.is_premium) return p.stories_used < DAILY_STORY_LIMIT;
    // Free: 1 história de demonstração vitalícia
    return p.stories_used < MAX_FREE_STORIES;
  }, [profile, tier, resetDailyIfNeeded]);

  const questionsRemaining = useCallback(() => {
    if (!profile) return 0;
    const p = resetDailyIfNeeded(profile);
    if (p.is_premium) return Math.max(0, DAILY_QUESTION_LIMIT - p.questions_used);
    return Math.max(0, MAX_FREE_QUESTIONS - p.questions_used);
  }, [profile, resetDailyIfNeeded]);

  const storiesRemaining = useCallback(() => {
    if (!profile) return 0;
    const p = resetDailyIfNeeded(profile);
    if (tier === "super_premium") return Math.max(0, SUPER_DAILY_STORY_LIMIT - p.stories_used);
    if (p.is_premium) return Math.max(0, DAILY_STORY_LIMIT - p.stories_used);
    return Math.max(0, MAX_FREE_STORIES - p.stories_used);
  }, [profile, tier, resetDailyIfNeeded]);

  const computeLevel = (pts: number): string => {
    if (pts >= 100) return "pensador";
    if (pts >= 50) return "explorador";
    if (pts >= 15) return "curioso";
    return "iniciante";
  };

  const updateStreak = (p: Profile): { streak_days: number; last_streak_date: string } => {
    const today = todayStr();
    if (p.last_streak_date === today) return { streak_days: p.streak_days, last_streak_date: today };
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    
    if (p.last_streak_date === yesterdayStr) {
      return { streak_days: p.streak_days + 1, last_streak_date: today };
    }
    return { streak_days: 1, last_streak_date: today };
  };

  const incrementQuestions = async () => {
    if (!profile) return;
    const p = resetDailyIfNeeded(profile);
    const newCount = p.questions_used + 1;
    const today = todayStr();
    const newPoints = p.points + 1;
    const newLevel = computeLevel(newPoints);
    const streakUpdate = updateStreak(p);
    
    const updates = {
      questions_used: newCount,
      last_usage_date: today,
      points: newPoints,
      level: newLevel,
      ...streakUpdate,
    };
    
    if (user) {
      setProfile(prev => (prev ? { ...prev, ...updates } : prev));
      supabase.from("profiles").update(updates).eq("id", user.id).then(() => {});
      return;
    }
    const next = normalizeProfile({ ...p, ...updates });
    saveGuestProfile(next);
    setProfile(next);
  };

  const incrementStories = async () => {
    if (!profile) return;
    const p = resetDailyIfNeeded(profile);
    const newCount = p.stories_used + 1;
    const today = todayStr();
    if (user) {
      await supabase.from("profiles").update({ stories_used: newCount, last_usage_date: today }).eq("id", user.id);
      setProfile(prev => (prev ? { ...prev, stories_used: newCount, last_usage_date: today } : prev));
      return;
    }
    const next = normalizeProfile({ ...p, stories_used: newCount, last_usage_date: today });
    saveGuestProfile(next);
    setProfile(next);
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, tier, loading, isReady,
      signUp, signIn, signOut, resetPassword,
      updateProfile, incrementQuestions, incrementStories,
      canAskQuestion, canGenerateStory, questionsRemaining, storiesRemaining,
      refreshSubscription, handleCheckout, openCustomerPortal,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

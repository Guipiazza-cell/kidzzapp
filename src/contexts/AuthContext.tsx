import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type SubscriptionTier = "free" | "premium" | "super_premium";

interface Profile {
  child_name: string;
  age_range: string | null;
  questions_used: number;
  stories_used: number;
  last_usage_date: string;
  is_premium: boolean;
  voice_enabled: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  tier: SubscriptionTier;
  loading: boolean;
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
  handleCheckout: (plan: "premium" | "super_premium") => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const CHECK_SUB_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subscription`;
const CHECKOUT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`;
const PORTAL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-portal`;
const GUEST_PROFILE_STORAGE_KEY = "kidzz_guest_profile";

const todayStr = () => new Date().toISOString().slice(0, 10);

const createDefaultProfile = (): Profile => ({
  child_name: "",
  age_range: null,
  questions_used: 0,
  stories_used: 0,
  last_usage_date: todayStr(),
  is_premium: false,
  voice_enabled: false,
});

const normalizeProfile = (value?: Partial<Profile> | null): Profile => ({
  child_name: value?.child_name ?? "",
  age_range: value?.age_range ?? null,
  questions_used: value?.questions_used ?? 0,
  stories_used: value?.stories_used ?? 0,
  last_usage_date: value?.last_usage_date ?? todayStr(),
  is_premium: value?.is_premium ?? false,
  voice_enabled: value?.voice_enabled ?? false,
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

  const resetDailyIfNeeded = useCallback((p: Profile): Profile => {
    const today = todayStr();
    if (p.last_usage_date !== today) {
      return { ...p, questions_used: 0, stories_used: 0, last_usage_date: today };
    }
    return p;
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("child_name, age_range, questions_used, stories_used, last_usage_date, is_premium, voice_enabled")
      .eq("id", userId)
      .single();

    if (data) {
      const prof = resetDailyIfNeeded(data as Profile);
      // If daily reset happened, persist it
      if (prof !== data) {
        await supabase.from("profiles").update({ 
          questions_used: prof.questions_used, 
          stories_used: prof.stories_used, 
          last_usage_date: prof.last_usage_date 
        }).eq("id", userId);
      }
      setProfile(prof);
      return;
    }
    setProfile(getGuestProfile());
  }, [resetDailyIfNeeded]);

  const refreshSubscription = useCallback(async () => {
    if (!session?.access_token || !user) return;

    try {
      const resp = await fetch(CHECK_SUB_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await resp.json();
      if (data.subscribed) {
        const newTier: SubscriptionTier = data.tier === "super_premium" ? "super_premium" : "premium";
        setTier(newTier);
        // Re-fetch profile to get updated is_premium and reset questions_used
        setProfile(prev => (prev ? { ...prev, is_premium: true, questions_used: 0 } : prev));
      } else {
        // Respect manual premium grants from profile
        if (profile?.is_premium) {
          setTier("super_premium");
        } else {
          setTier("free");
        }
      }
    } catch {
      // silent fail
    }
  }, [session, profile?.is_premium, user]);

  const handleCheckout = useCallback(async (plan: "premium" | "super_premium") => {
    if (!session?.access_token) {
      // Guest - need to create account first
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
      if (data.url) window.open(data.url, "_blank");
      else {
        const { toast } = await import("sonner");
        toast.error("Erro ao criar checkout");
      }
    } catch {
      const { toast } = await import("sonner");
      toast.error("Erro ao iniciar pagamento");
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
      if (data.url) window.open(data.url, "_blank");
      else {
        const { toast } = await import("sonner");
        toast.error(data.error || "Erro ao abrir portal");
      }
    } catch {
      const { toast } = await import("sonner");
      toast.error("Erro ao abrir gerenciamento de assinatura");
    }
  }, [session]);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        await fetchProfile(nextSession.user.id);
      } else {
        setProfile(getGuestProfile());
        setTier("free");
      }

      setLoading(false);
    });

    // Then check for existing session with a race against timeout
    const sessionPromise = supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      } else {
        setProfile(getGuestProfile());
      }

      setLoading(false);
    });

    // Safety: if getSession hangs (stale token refresh), force loading=false after 1.5s
    const safetyTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 1500);

    sessionPromise.finally(() => clearTimeout(safetyTimer));

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  useEffect(() => {
    if (!session) return;
    refreshSubscription();
    const interval = setInterval(refreshSubscription, 60000);
    return () => clearInterval(interval);
  }, [session, refreshSubscription]);

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
    console.log("SignOut: starting...");
    clearGuestProfile();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("SignOut error:", error.message);
      else console.log("SignOut: success");
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
      await supabase.from("profiles").update(updates).eq("id", user.id);
      setProfile(prev => (prev ? { ...prev, ...updates } : prev));
      return;
    }
    setProfile(prev => {
      const next = normalizeProfile({ ...(prev ?? getGuestProfile()), ...updates });
      saveGuestProfile(next);
      return next;
    });
  };

  // Limits: Free=3 total once, KIDZZ=10/day, Premium=10/day
  const MAX_FREE_QUESTIONS = 3;
  const DAILY_QUESTION_LIMIT = 10;
  const DAILY_STORY_LIMIT = 3;

  const canAskQuestion = useCallback(() => {
    if (!profile) return false;
    const p = resetDailyIfNeeded(profile);
    if (!p.is_premium) return p.questions_used < MAX_FREE_QUESTIONS;
    return p.questions_used < DAILY_QUESTION_LIMIT;
  }, [profile, resetDailyIfNeeded]);

  const canGenerateStory = useCallback(() => {
    if (!profile) return false;
    if (tier !== "super_premium") return false;
    const p = resetDailyIfNeeded(profile);
    return p.stories_used < DAILY_STORY_LIMIT;
  }, [profile, tier, resetDailyIfNeeded]);

  const questionsRemaining = useCallback(() => {
    if (!profile) return 0;
    const p = resetDailyIfNeeded(profile);
    if (!p.is_premium) return Math.max(0, MAX_FREE_QUESTIONS - p.questions_used);
    return Math.max(0, DAILY_QUESTION_LIMIT - p.questions_used);
  }, [profile, resetDailyIfNeeded]);

  const storiesRemaining = useCallback(() => {
    if (!profile) return 0;
    const p = resetDailyIfNeeded(profile);
    return Math.max(0, DAILY_STORY_LIMIT - p.stories_used);
  }, [profile, resetDailyIfNeeded]);

  const incrementQuestions = async () => {
    if (!profile) return;
    const p = resetDailyIfNeeded(profile);
    const newCount = p.questions_used + 1;
    const today = todayStr();
    if (user) {
      await supabase.from("profiles").update({ questions_used: newCount, last_usage_date: today }).eq("id", user.id);
      setProfile(prev => (prev ? { ...prev, questions_used: newCount, last_usage_date: today } : prev));
      return;
    }
    const next = normalizeProfile({ ...p, questions_used: newCount, last_usage_date: today });
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
      user, session, profile, tier, loading,
      signUp, signIn, signOut, resetPassword,
      updateProfile, incrementQuestions, refreshSubscription, handleCheckout, openCustomerPortal,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

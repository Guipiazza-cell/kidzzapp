import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type SubscriptionTier = "free" | "premium" | "super_premium";

interface Profile {
  child_name: string;
  age_range: string | null;
  questions_used: number;
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
  refreshSubscription: () => Promise<void>;
  handleCheckout: (plan: "premium" | "super_premium") => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const CHECK_SUB_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subscription`;
const CHECKOUT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`;
const PORTAL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-portal`;
const GUEST_PROFILE_STORAGE_KEY = "kidzz_guest_profile";

const createDefaultProfile = (): Profile => ({
  child_name: "",
  age_range: null,
  questions_used: 0,
  is_premium: false,
  voice_enabled: false,
});

const normalizeProfile = (value?: Partial<Profile> | null): Profile => ({
  child_name: value?.child_name ?? "",
  age_range: value?.age_range ?? null,
  questions_used: value?.questions_used ?? 0,
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

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("child_name, age_range, questions_used, is_premium, voice_enabled")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data as Profile);
      return;
    }
    setProfile(getGuestProfile());
  }, []);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
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

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      } else {
        setProfile(getGuestProfile());
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
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

  const incrementQuestions = async () => {
    if (!profile) return;
    const newCount = profile.questions_used + 1;
    if (user) {
      await supabase.from("profiles").update({ questions_used: newCount }).eq("id", user.id);
      setProfile(prev => (prev ? { ...prev, questions_used: newCount } : prev));
      return;
    }
    const next = normalizeProfile({ ...profile, questions_used: newCount });
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

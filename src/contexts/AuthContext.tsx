import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

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
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  incrementQuestions: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const CHECK_SUB_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subscription`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("child_name, age_range, questions_used, is_premium, voice_enabled")
      .eq("id", userId)
      .single();
    if (data) setProfile(data as Profile);
  }, []);

  const refreshSubscription = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const resp = await fetch(CHECK_SUB_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await resp.json();
      if (data.subscribed && !profile?.is_premium) {
        await supabase.from("profiles").update({ is_premium: true }).eq("id", user!.id);
        setProfile(prev => prev ? { ...prev, is_premium: true } : prev);
      }
    } catch {
      // silent fail
    }
  }, [session, profile?.is_premium, user]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Check subscription periodically
  useEffect(() => {
    if (!session) return;
    refreshSubscription();
    const interval = setInterval(refreshSubscription, 60000);
    return () => clearInterval(interval);
  }, [session, refreshSubscription]);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    await supabase.from("profiles").update(updates).eq("id", user.id);
    setProfile(prev => prev ? { ...prev, ...updates } : prev);
  };

  const incrementQuestions = async () => {
    if (!user || !profile) return;
    const newCount = profile.questions_used + 1;
    await supabase.from("profiles").update({ questions_used: newCount }).eq("id", user.id);
    setProfile(prev => prev ? { ...prev, questions_used: newCount } : prev);
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading,
      signUp, signIn, signOut, resetPassword,
      updateProfile, incrementQuestions, refreshSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

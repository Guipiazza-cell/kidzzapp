import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { applyCheckSubscriptionClient } from "@/lib/subscriptionAccess";

export type SubscriptionTier = "free" | "kidzz" | "premium";

// Aliases legados - UI/back-compat. "super_premium" velho → novo "premium".
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
  onboarding_done: boolean;
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
  refreshProfile: () => Promise<void>;
  incrementQuestions: () => Promise<void>;
  incrementStories: () => Promise<void>;
  canAskQuestion: () => boolean;
  canGenerateStory: () => boolean;
  questionsRemaining: () => number;
  storiesRemaining: () => number;
  refreshSubscription: () => Promise<void>;
  handleCheckout: (plan: CheckoutPlan | "super_premium" | "super_premium_annual") => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const CHECK_SUB_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-subscription`;
import { analytics } from "@/lib/analytics";

const CHECKOUT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`;
const PORTAL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-portal`;
const GUEST_PROFILE_STORAGE_KEY = "kidzz_guest_profile";
const PROFILE_DRAFT_STORAGE_KEY = "kidzz_profile_draft";
const SUB_CACHE_KEY = "kidzz_sub_cache";
const PENDING_PLAN_STORAGE_KEY = "kidzz_pending_plan";
const SUB_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const PROFILE_DRAFT_TTL = 7 * 24 * 60 * 60 * 1000;

const normalizeCheckoutPlan = (plan: CheckoutPlan | "super_premium" | "super_premium_annual"): CheckoutPlan => {
  if (plan === "super_premium") return "premium";
  if (plan === "super_premium_annual") return "premium_annual";
  return plan;
};

const PENDING_PLAN_TTL = 30 * 60 * 1000; // 30 min: evita plano fantasma de sessões antigas

const savePendingCheckoutPlan = (plan: CheckoutPlan | "super_premium" | "super_premium_annual") => {
  if (typeof window === "undefined") return;
  const normalized = normalizeCheckoutPlan(plan);
  const payload = JSON.stringify({ plan: normalized, ts: Date.now() });
  try { window.sessionStorage.setItem(PENDING_PLAN_STORAGE_KEY, payload); } catch {
    // Storage can be unavailable in private browsing.
  }
  try { window.localStorage.setItem(PENDING_PLAN_STORAGE_KEY, payload); } catch {
    // Storage can be unavailable in private browsing.
  }
};

const readPendingCheckoutPlan = (): CheckoutPlan | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.sessionStorage.getItem(PENDING_PLAN_STORAGE_KEY)
      || window.localStorage.getItem(PENDING_PLAN_STORAGE_KEY);
    if (!stored) return null;
    let raw = stored;
    if (stored.startsWith("{")) {
      const parsed = JSON.parse(stored) as { plan?: string; ts?: number };
      if (!parsed.plan) return null;
      if (typeof parsed.ts === "number" && Date.now() - parsed.ts > PENDING_PLAN_TTL) return null;
      raw = parsed.plan;
    }
    return normalizeCheckoutPlan(raw as CheckoutPlan | "super_premium" | "super_premium_annual");
  } catch {
    return null;
  }
};


const clearPendingCheckoutPlan = () => {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.removeItem(PENDING_PLAN_STORAGE_KEY); } catch {
    // Storage can be unavailable in private browsing.
  }
  try { window.localStorage.removeItem(PENDING_PLAN_STORAGE_KEY); } catch {
    // Storage can be unavailable in private browsing.
  }
};

const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** Abre o Stripe Checkout: fetch JSON (melhor erro) + fallback form POST. */
const openStripeCheckout = async (plan: CheckoutPlan, accessToken: string, ref?: string) => {
  const returnOrigin = window.location.origin;
  const body: Record<string, string> = {
    plan,
    return_origin: returnOrigin,
  };
  if (ref) body.ref = ref;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
    if (ANON_KEY) headers.apikey = ANON_KEY;

    const resp = await fetch(CHECKOUT_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({} as { url?: string; error?: string }));
    if (resp.ok && data.url) {
      console.log("[Checkout] Redirecting to Stripe", { plan });
      try {
        window.dispatchEvent(new CustomEvent("kidzz:close-plans"));
      } catch {
        /* noop */
      }
      window.location.assign(data.url);
      return;
    }

    const msg = data.error || `Erro no checkout (${resp.status})`;
    console.error("[Checkout] Edge function error", msg, data);
    throw new Error(msg);
  } catch (err) {
    // Fallback: form POST (navegação top-level, útil se fetch/CORS falhar)
    console.warn("[Checkout] Fetch failed, trying form redirect", err);
    const form = document.createElement("form");
    form.method = "POST";
    form.action = CHECKOUT_URL;
    form.target = "_top";
    form.style.display = "none";

    const fields: Record<string, string> = {
      checkout_transport: "form_redirect",
      access_token: accessToken,
      plan,
      return_origin: returnOrigin,
    };
    if (ref) fields.ref = ref;

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    window.setTimeout(() => form.remove(), 5000);
  }
};

// Data no fuso de Brasília - o servidor reseta o uso em America/Sao_Paulo
// (meia-noite de Brasília). Antes o cliente usava UTC, desalinhando o "dia"
// do cliente vs servidor (reset em horário errado / contagem divergente).
const todayStr = () => {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

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
  onboarding_done: false,
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
  onboarding_done: value?.onboarding_done ?? false,
});

const getGuestProfile = (): Profile => {
  if (typeof window === "undefined") return createDefaultProfile();

  try {
    const keys = [
      GUEST_PROFILE_STORAGE_KEY,
      "kidzz_guest_profile_backup",
      "kidzz_guest_profile_v2",
    ];

    for (const key of keys) {
      const stored = window.localStorage.getItem(key) 
        || window.sessionStorage.getItem(key);

      if (stored) {
        const parsed = normalizeProfile(JSON.parse(stored));

        if (parsed.child_name) {
          saveGuestProfile(parsed);
          return parsed;
        }
      }
    }

    return createDefaultProfile();
  } catch {
    return createDefaultProfile();
  }
};

const saveGuestProfile = (profile: Profile) => {
  if (typeof window === "undefined") return;

  const data = JSON.stringify(profile);

  window.localStorage.setItem(GUEST_PROFILE_STORAGE_KEY, data);
  window.localStorage.setItem("kidzz_guest_profile_backup", data);
  window.localStorage.setItem("kidzz_guest_profile_v2", data);

  try { window.sessionStorage.setItem(GUEST_PROFILE_STORAGE_KEY, data); } catch {
    // Storage can be unavailable in private browsing.
  }
};

const clearGuestProfile = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_PROFILE_STORAGE_KEY);
};

const getProfileDraft = (userId: string | null = null): Partial<Profile> | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Profile> & { ts?: number; user_id?: string | null };
    if (!parsed.ts || Date.now() - parsed.ts > PROFILE_DRAFT_TTL || (parsed.user_id ?? null) !== userId) {
      window.localStorage.removeItem(PROFILE_DRAFT_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const saveProfileDraft = (updates: Partial<Profile>, userId: string | null = null) => {
  if (typeof window === "undefined") return;
  try {
    const previous = getProfileDraft(userId) ?? {};
    window.localStorage.setItem(PROFILE_DRAFT_STORAGE_KEY, JSON.stringify({ ...previous, ...updates, user_id: userId, ts: Date.now() }));
  } catch {
    // local fallback is best-effort only
  }
};

const mergeProfileDraft = (profile: Profile, userId: string | null = null): Profile => {
  const draft = getProfileDraft(userId);
  if (!draft) return profile;
  return normalizeProfile({
    ...profile,
    child_name: profile.child_name || draft.child_name || "",
    age_range: profile.age_range || draft.age_range || null,
    child_interests: profile.child_interests?.length ? profile.child_interests : (draft.child_interests ?? []),
  });
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
  const navigate = useNavigate();
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
      .select("child_name, age_range, child_interests, questions_used, stories_used, last_usage_date, is_premium, voice_enabled, premium_source, plan_end_date, is_admin, points, streak_days, last_streak_date, level, onboarding_done")
      .eq("id", userId)
      .single();

    const guest = getGuestProfile();

    if (data) {
      const prof = resetDailyIfNeeded(data as unknown as Profile);
      if (prof !== data) {
        supabase.from("profiles").update({
          questions_used: prof.questions_used,
          stories_used: prof.stories_used,
          last_usage_date: prof.last_usage_date,
        }).eq("id", userId).then(() => {});
      }
      // Preserve guest profile fields when cloud profile is still missing them
      const merged: Profile = {
        ...prof,
        child_name: prof.child_name || guest.child_name || "",
        age_range: prof.age_range || guest.age_range || null,
        child_interests: prof.child_interests?.length
          ? prof.child_interests
          : (guest.child_interests ?? []),
      };
      return mergeProfileDraft(merged, userId);
    }
    return mergeProfileDraft(guest, userId);
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

      // Rede/5xx: mantém DB só como fallback de UX (blip). Anti-fraude real é no server.
      if (!resp.ok) {
        console.warn("[Auth] check-subscription HTTP error, temporary DB fallback", resp.status);
        const fallback = applyCheckSubscriptionClient({
          httpOk: false,
          dbIsPremium: currentProfile.is_premium,
          premiumSource: currentProfile.premium_source,
        });
        setSubCache(fallback.tier, fallback.isPremium);
        return fallback;
      }

      const data = await resp.json();

      // Autoridade: HTTP 200 do backend. Nunca reabrir premium se veio free (anti-stale).
      const result = applyCheckSubscriptionClient({
        httpOk: true,
        backend: data,
        dbIsPremium: currentProfile.is_premium,
        premiumSource: currentProfile.premium_source,
      });
      setSubCache(result.tier, result.isPremium);
      return result;
    } catch (err) {
      console.error("[Auth] checkSubscription error, temporary DB fallback:", err);
      const fallback = applyCheckSubscriptionClient({
        httpOk: false,
        dbIsPremium: currentProfile.is_premium,
        premiumSource: currentProfile.premium_source,
      });
      setSubCache(fallback.tier, fallback.isPremium);
      return fallback;
    } finally {
      subCheckInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Se getSession/fetchProfile pendurar (rede/SW/token corrompido), a UI
    // ficava eternamente em loading com a splash "KIDZZAPP" / tela em branco.
    const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
      new Promise<T>((resolve, reject) => {
        const t = window.setTimeout(() => reject(new Error(`[Auth] ${label} timeout after ${ms}ms`)), ms);
        promise.then(
          (v) => { window.clearTimeout(t); resolve(v); },
          (e) => { window.clearTimeout(t); reject(e); },
        );
      });

    const releaseUi = (seedProfile?: Profile | null) => {
      if (!mounted || initDone.current) return;
      if (seedProfile) setProfile((prev) => prev ?? seedProfile);
      else setProfile((prev) => prev ?? getGuestProfile());
      setLoading(false);
      setIsReady(true);
      initDone.current = true;
    };

    const initializeAuth = async () => {
      // Fail-open duro: nunca trava a splash/Index por mais de 3.5s.
      const failOpenTimer = window.setTimeout(() => {
        console.warn("[Auth] init fail-open - liberando UI");
        releaseUi(getGuestProfile());
      }, 3500);

      try {
        const { data: { session: currentSession } } = await withTimeout(
          supabase.auth.getSession(),
          3000,
          "getSession",
        );
        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          // Libera a UI já com seed guest/draft - não espera o fetch do profile.
          const seed = getGuestProfile();
          setProfile(seed);
          setTier(seed.is_premium ? "premium" : "free");
          releaseUi(seed);

          try {
            const prof = await withTimeout(
              fetchProfile(currentSession.user.id),
              3000,
              "fetchProfile",
            );
            if (!mounted) return;
            setProfile(prof);
            setTier(prof.is_premium ? "premium" : "free");
            checkSubscription(currentSession.access_token, prof, true)
              .then((subResult) => {
                if (!mounted) return;
                setTier(subResult.tier);
                if (subResult.isPremium !== prof.is_premium) {
                  setProfile((prev) => (prev ? { ...prev, is_premium: subResult.isPremium } : prev));
                }
              })
              .catch((err) => console.warn("[Auth] init subscription check failed", err));
          } catch (profileErr) {
            console.warn("[Auth] profile fetch failed/timed out - keeping seed", profileErr);
          }
        } else {
          setSession(null);
          setUser(null);
          setProfile(getGuestProfile());
          setTier("free");
          releaseUi(getGuestProfile());
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setSession(null);
        setUser(null);
        setProfile(getGuestProfile());
        setTier("free");
        releaseUi(getGuestProfile());
      } finally {
        window.clearTimeout(failOpenTimer);
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

      if (_event === "SIGNED_IN" && nextSession?.user) {
        analytics.identify(nextSession.user.id, { email: nextSession.user.email });
      } else if (_event === "SIGNED_OUT") {
        analytics.reset();
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        // IMPORTANT: do NOT flip loading=true here. Index gates the UI on
        // `loading` and the Stripe check-subscription call can be slow or
        // hang inside the preview iframe, leaving the user stuck on a blank
        // screen right after signup. Keep loading=false; render falls back
        // to NameOnboarding until the cloud profile resolves.
        clearSubCache();
        // Seed profile immediately from guest cache so onboarding gates
        // (child_name / age_range / interests) can paint without waiting.
        setProfile(prev => prev ?? getGuestProfile());
        fetchProfile(nextSession.user.id).then(prof => {
          if (!mounted) return;
          setProfile(prof);
          checkSubscription(nextSession.access_token, prof, true).then(subResult => {
            if (!mounted) return;
            setTier(subResult.tier);
            if (subResult.isPremium !== prof.is_premium) {
              setProfile(curr => curr ? { ...curr, is_premium: subResult.isPremium } : curr);
            }
          }).catch(err => {
            console.warn("[Auth] post-login subscription check failed", err);
          });
        }).catch(err => {
          console.warn("[Auth] post-login profile fetch failed", err);
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

  // No periodic refresh - only on login and manual refresh (cost optimization)

  const handleCheckout = useCallback(async (plan: CheckoutPlan | "super_premium" | "super_premium_annual") => {
    const checkoutPlan = normalizeCheckoutPlan(plan);

    if (!session?.access_token) {
      // Não logado: guarda o plano e manda pro /auth. Depois do login, retomamos o checkout.
      savePendingCheckoutPlan(checkoutPlan);
      const { toast } = await import("sonner");
      toast("Crie sua conta pra continuar", {
        description: "Em 1 minuto você volta direto pro pagamento.",
      });
      // Fecha overlays (paywall) antes de ir pro auth
      try {
        window.dispatchEvent(new CustomEvent("kidzz:close-plans"));
      } catch {
        /* noop */
      }
      navigate("/auth?checkout=1", { replace: false });
      return;
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      const { toast } = await import("sonner");
      toast.error("Você está offline", {
        description: "Conecte-se à internet e tente novamente.",
      });
      return;
    }
    const ref =
      (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("kidzz_ref") : null) ||
      undefined;

    // Escolha explícita do usuário manda: descarta qualquer plano pendente antigo
    clearPendingCheckoutPlan();

    try {
      console.log("[Checkout] plan selecionado", { plan: checkoutPlan });
      analytics.checkoutStarted({ plan: checkoutPlan });
      await openStripeCheckout(checkoutPlan, session.access_token, ref);
    } catch (err) {
      const { toast } = await import("sonner");
      console.error("[Checkout] Failed to open Stripe", err);
      const msg = err instanceof Error ? err.message : "Erro ao iniciar pagamento";
      toast.error("Erro ao iniciar pagamento", {
        description:
          msg.includes("STRIPE") || msg.includes("not set")
            ? "Stripe não configurado neste ambiente. Confira as secrets da function create-checkout."
            : "Tente novamente em instantes. Nada foi cobrado.",
      });
      throw err;
    }
  }, [navigate, session]);

  // Retoma o checkout automaticamente após o login (se havia plano pendente)
  const resumedCheckoutRef = useRef(false);
  useEffect(() => {
    if (!session?.access_token) return;
    if (resumedCheckoutRef.current) return;
    const pending = readPendingCheckoutPlan();
    if (!pending) return;
    resumedCheckoutRef.current = true;
    // Consome imediatamente pra nunca reabrir um plano antigo depois
    clearPendingCheckoutPlan();
    navigate("/auth?checkout=1", { replace: true });
    // pequena espera pra garantir que profile/sub estejam prontos
    const t = setTimeout(() => {
      handleCheckout(pending);
    }, 400);
    return () => clearTimeout(t);
  }, [session, handleCheckout, navigate]);


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
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });

    if (error) {
      const m = error.message.toLowerCase();
      const code = (error as any).code?.toLowerCase?.() || "";
      // Conta já existe → tenta logar direto (fluxo rápido)
      if (m.includes("already registered") || m.includes("already exists") || code === "user_already_exists") {
        const { error: siErr } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (!siErr) return { error: null };
        return { error: "Este email já tem conta, mas a senha não confere. Tente entrar ou recuperar a senha." };
      }
      // Senha vazada (HIBP) ou senha fraca
      if (code === "weak_password" || m.includes("pwned") || m.includes("compromised") || m.includes("weak password") || m.includes("has been found")) {
        return { error: "Essa senha foi encontrada em vazamentos públicos e não é segura. Crie uma senha mais forte (use letras, números e símbolos)." };
      }
      if (m.includes("password should be at least") || m.includes("password is too short")) {
        return { error: "A senha precisa ter pelo menos 6 caracteres." };
      }
      if (m.includes("invalid email") || code === "validation_failed") {
        return { error: "Email inválido. Verifique e tente novamente." };
      }
      if (m.includes("rate limit") || code === "over_email_send_rate_limit") {
        return { error: "Muitas tentativas. Aguarde alguns segundos e tente novamente." };
      }
      console.error("Signup error:", error.message, code);
      return { error: error.message };
    }

    // Auto-confirm ativo deveria retornar sessão; se não veio, força login
    if (!data.session) {
      const { error: siErr } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (siErr) console.warn("Post-signup signIn fallback:", siErr.message);
    }
    analytics.signupCompleted({ method: "email" });
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) {
      console.error("Login error:", error.message);
      const m = error.message.toLowerCase();
      if (m.includes("invalid login credentials")) {
        return { error: "Email ou senha incorretos. Confira e tente novamente." };
      }
      return { error: error.message };
    }
    return { error: null };
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
    saveProfileDraft(updates, user?.id ?? null);
    if (user) {
      setProfile(prev => normalizeProfile({ ...(prev ?? profile ?? createDefaultProfile()), ...updates }));
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("updateProfile timeout")), 2800)
      );
      try {
        await Promise.race([
          (async () => {
            const { data, error } = await supabase
              .from("profiles")
              .update(updates as any)
              .eq("id", user.id)
              .select("id")
              .maybeSingle();
            if (error || !data) {
              const { error: upsertErr } = await supabase.from("profiles").upsert({ id: user.id, ...updates } as any, { onConflict: "id" });
              if (upsertErr) console.error("updateProfile upsert error:", upsertErr.message);
            }
          })(),
          timeout,
        ]);
      } catch (e) {
        console.warn("updateProfile fallback local:", e);
      }
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
  // Limites diários por tier (alinhado ao backend)
  const KIDZZ_DAILY_QUESTIONS = 30;
  const PREMIUM_DAILY_QUESTIONS = 60;
  const KIDZZ_DAILY_STORIES = 3;
  const PREMIUM_DAILY_STORIES = 5;

  const dailyQLimit = tier === "premium" ? PREMIUM_DAILY_QUESTIONS : KIDZZ_DAILY_QUESTIONS;
  const dailySLimit = tier === "premium" ? PREMIUM_DAILY_STORIES : KIDZZ_DAILY_STORIES;

  const canAskQuestion = useCallback(() => {
    if (!profile) return false;
    const p = resetDailyIfNeeded(profile);
    if (p.is_premium) return p.questions_used < dailyQLimit;
    return p.questions_used < MAX_FREE_QUESTIONS;
  }, [profile, resetDailyIfNeeded, dailyQLimit]);

  const canGenerateStory = useCallback(() => {
    if (!profile) return false;
    const p = resetDailyIfNeeded(profile);
    if (p.is_premium) return p.stories_used < dailySLimit;
    return p.stories_used < MAX_FREE_STORIES;
  }, [profile, resetDailyIfNeeded, dailySLimit]);

  const questionsRemaining = useCallback(() => {
    if (!profile) return 0;
    const p = resetDailyIfNeeded(profile);
    if (p.is_premium) return Math.max(0, dailyQLimit - p.questions_used);
    return Math.max(0, MAX_FREE_QUESTIONS - p.questions_used);
  }, [profile, resetDailyIfNeeded, dailyQLimit]);

  const storiesRemaining = useCallback(() => {
    if (!profile) return 0;
    const p = resetDailyIfNeeded(profile);
    if (p.is_premium) return Math.max(0, dailySLimit - p.stories_used);
    return Math.max(0, MAX_FREE_STORIES - p.stories_used);
  }, [profile, resetDailyIfNeeded, dailySLimit]);

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

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const prof = await fetchProfile(user.id);
    setProfile(prof);
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider value={{
      user, session, profile, tier, loading, isReady,
      signUp, signIn, signOut, resetPassword,
      updateProfile, refreshProfile, incrementQuestions, incrementStories,
      canAskQuestion, canGenerateStory, questionsRemaining, storiesRemaining,
      refreshSubscription, handleCheckout, openCustomerPortal,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

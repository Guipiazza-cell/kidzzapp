import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import PinSetupForm from "@/components/parental/PinSetupForm";
import { hasCustomPin } from "@/lib/parentalPin";
import { analytics, consumeOnboardingSeconds } from "@/lib/analytics";

interface AccountSetupProps {
  childName: string;
  onDone: () => void;
}

const GUEST_KEYS = [
  "kidzz_guest_profile",
  "kidzz_guest_profile_backup",
  "kidzz_guest_profile_v2",
];

const readGuestProfile = (): Record<string, any> | null => {
  if (typeof window === "undefined") return null;
  for (const k of GUEST_KEYS) {
    try {
      const raw =
        window.localStorage.getItem(k) || window.sessionStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch {}
  }
  return null;
};

const translateAuthError = (msg: string): string => {
  const m = (msg || "").toLowerCase();
  if (m.includes("invalid login")) return "Email ou senha incorretos.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "Esse email já tem conta - toque em Entrar.";
  if (m.includes("password")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("email")) return "Confira o email digitado.";
  if (m.includes("rate")) return "Muitas tentativas. Espere um instante e tente de novo.";
  if (m.includes("network") || m.includes("fetch"))
    return "Sem conexão com a nuvem. Tente novamente.";
  return "Algo não deu certo. Tente novamente em instantes.";
};

/** Converte "3-7" / "5" / "7-10" numa idade inteira utilizável. */
export const parseIdade = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value !== "string") return null;
  const nums = value.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length === 0) return null;
  if (nums.length === 1) return nums[0];
  return Math.round((nums[0] + nums[1]) / 2);
};

const syncGuestProfile = async (userId: string) => {
  const guest = readGuestProfile();
  if (!guest) return;
  const nome = guest.child_name ?? "";
  const idade = parseIdade(guest.idade ?? guest.age_range ?? null);
  const interesses: string[] = guest.child_interests ?? [];
  const materiais: string[] = guest.materiais_em_casa ?? [];
  try {
    const { error } = await (supabase as any).rpc("complete_onboarding_v2", {
      p_child_name: nome,
      p_idade: idade,
      p_interests: interesses,
      p_materiais: materiais,
    });
    if (error) {
      console.warn("[AccountSetup] complete_onboarding_v2 failed", error);
      await (supabase as any).rpc("complete_onboarding", {
        p_child_name: nome,
        p_age_range: guest.age_range ?? null,
        p_child_interests: interesses,
      });
      const { data: existing } = await supabase
        .from("criancas")
        .select("id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
      if (!existing) {
        await supabase.from("criancas").insert({
          user_id: userId,
          nome: nome || "Meu filho",
          idade,
          interesses,
          materiais_em_casa: materiais,
        });
      }
    }
  } catch (err) {
    console.warn("[AccountSetup] guest sync failed", err);
  }
};

type Mode = "signup" | "signin";

const AccountSetup = ({ childName, onDone }: AccountSetupProps) => {
  const { refreshProfile } = useAuth();
  const [mode, setMode] = useState<Mode>("signup");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cloudBlocked, setCloudBlocked] = useState(false);
  const [pinStep, setPinStep] = useState(false);
  const submittingRef = useRef(false);
  const oauthHandledRef = useRef(false);



  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await supabase.auth.getSession();
      } catch {
        if (!cancelled) setCloudBlocked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const finishSuccess = useCallback(
    async (userId?: string) => {
      if (userId) {
        await syncGuestProfile(userId);
        let childCount = 1;
        try {
          const { count } = await supabase
            .from("criancas")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId);
          if (typeof count === "number" && count > 0) childCount = count;
        } catch {
          /* mantém 1 */
        }
        analytics.onboardingDone({
          child_count: childCount,
          seconds_to_complete: consumeOnboardingSeconds(),
        });
      }
      try { await refreshProfile(); } catch {}
      setSuccess(true);
      if (!hasCustomPin()) {
        setTimeout(() => setPinStep(true), 450);
        return;
      }
      setTimeout(() => onDone(), 450);
    },
    [onDone, refreshProfile]
  );

  // Retorno do OAuth (Apple): a pessoa volta autenticada -> roda o MESMO
  // finishSuccess (sync do perfil convidado + PIN + onDone).
  useEffect(() => {
    let active = true;
    const run = async (userId?: string) => {
      if (!userId || oauthHandledRef.current) return;
      oauthHandledRef.current = true;
      setAppleLoading(false);
      await finishSuccess(userId);
    };
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        if (data.session?.user) await run(data.session.user.id);
      } catch {}
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "SIGNED_IN" && session?.user) void run(session.user.id);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [finishSuccess]);

  const handleAppleSignIn = useCallback(async () => {
    if (appleLoading || loading) return;
    setError(null);
    setAppleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: `${window.location.origin}/`,
      });
      if (result.error) {
        setError("Não foi possível entrar com a Apple agora. Tente pelo e-mail.");
        setAppleLoading(false);
        return;
      }
      if (result.redirected) return; // navegador vai redirecionar
      // Sessão já definida: o listener acima chama finishSuccess.
    } catch {
      setError("Não foi possível entrar com a Apple agora. Tente pelo e-mail.");
      setAppleLoading(false);
    }
  }, [appleLoading, loading]);



  const handleEmailSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    const cleanEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Confira o email digitado.");
      submittingRef.current = false;
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      submittingRef.current = false;
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (err) {
          const m = (err.message || "").toLowerCase();
          if (m.includes("already") || m.includes("registered") || m.includes("exists")) {
            const { data: signInData, error: signInErr } =
              await supabase.auth.signInWithPassword({ email: cleanEmail, password });
            if (signInErr) {
              setError(translateAuthError(signInErr.message));
              return;
            }
            await finishSuccess(signInData.user?.id);
            return;
          }
          setError(translateAuthError(err.message));
          return;
        }
        if (!data.session) {
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          await finishSuccess(signInData.user?.id ?? data.user?.id);
        } else {
          await finishSuccess(data.user?.id);
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (err) {
          setError(translateAuthError(err.message));
          return;
        }
        await finishSuccess(data.user?.id);
      }
    } catch (err: any) {
      setError(translateAuthError(err?.message || ""));
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  }, [email, password, mode, finishSuccess]);

  const primaryDisabled = loading || cloudBlocked;

  const inputStyle = useMemo(
    () => ({
      height: 56,
      borderRadius: 18,
      border: "1px solid #D8E5D8",
      padding: "0 18px",
      fontSize: 16,
      width: "100%",
      background: "#FFFFFF",
      color: "#2E4438",
      outline: "none",
    }),
    []
  );

  if (pinStep) {
    return (
      <div className="flex flex-col min-h-full px-6 pt-10 pb-10 items-center justify-center">
        <div className="w-full max-w-sm">
          <h2 className="font-black text-foreground text-center" style={{ fontSize: 22 }}>
            Crie o PIN dos pais
          </h2>
          <p className="text-center text-muted-foreground mt-2 mb-5" style={{ fontSize: 14 }}>
            4 dígitos para proteger a Área dos Pais. Só o adulto precisa saber.
          </p>
          <PinSetupForm saveLabel="Salvar e entrar" onSaved={onDone} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center px-5 relative overflow-y-auto overflow-x-hidden overscroll-contain"
      style={{
        background: "linear-gradient(180deg, #FFF9F0 0%, #E8F2E8 100%)",
        paddingTop: "max(env(safe-area-inset-top, 24px), 32px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {cloudBlocked && (
        <div
          className="w-full max-w-md mb-3 text-center text-sm font-semibold rounded-2xl px-4 py-3"
          style={{ background: "#FDECE2", color: "#C0673E" }}
        >
          Conexão com a nuvem indisponível - verifique sua internet e tente novamente.
        </div>
      )}

      <div style={{ height: 24 }} />

      <h1
        className="text-center font-black mt-4 leading-tight"
        style={{ color: "#2E4438", fontSize: 28, maxWidth: 360 }}
      >
        Guarde as memórias do {childName || "seu pequeno"}&nbsp;
      </h1>
      <p
        className="text-center mt-3 font-semibold"
        style={{ color: "#5A7A66", fontSize: 16, maxWidth: 340, lineHeight: 1.4 }}
      >
        Crie sua conta gratuita em segundos e acesse de qualquer aparelho.
      </p>

      <div
        className="w-full max-w-md mt-6 p-5"
        style={{
          background: "#FFFFFF",
          borderRadius: 28,
          boxShadow: "0 10px 30px rgba(46,68,56,0.08)",
        }}
      >
        <button
          onClick={handleAppleSignIn}
          disabled={appleLoading || loading || cloudBlocked}
          className="w-full font-black active:scale-95 transition-transform flex items-center justify-center gap-2"
          style={{
            height: 56,
            borderRadius: 20,
            background: "#000000",
            color: "#FFFFFF",
            fontSize: 16,
            opacity: appleLoading || loading || cloudBlocked ? 0.6 : 1,
          }}
        >
          {appleLoading ? (
            <>
              <span
                className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"
                aria-hidden
              />
              Conectando…
            </>
          ) : (
            <>
              <svg
                aria-hidden
                width="20"
                height="20"
                viewBox="0 0 814 1000"
                fill="currentColor"
                style={{ flexShrink: 0 }}
              >
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-104.3 40.8-165.9 40.8s-105.6-57.6-152.2-127C57.2 858.8 0 715.8 0 577.8c0-218.4 141.5-333.9 280.6-333.9 74.2 0 135.8 48.6 182.6 48.6 44.3 0 114.1-51.6 208.4-51.6 33.8 0 154.4 3.1 231.6 117.4-6.1 3.8-116.5 68.9-116.5 199.6zM553.1 21.2c38.3-46 64.1-109.8 64.1-173.5 0-8.8-.6-17.7-1.9-25.6-61.3 2.4-133.8 40.9-177.5 92.1-35.4 40.9-66.7 105-58.4 171.3 65.1 5.1 131.7-33.8 173.7-64.3z" />
              </svg>
              Continuar com Apple
            </>
          )}
        </button>

        <div className="flex items-center gap-3 my-4">
          <span style={{ flex: 1, height: 1, background: "#E4EDE4" }} />
          <span className="font-bold" style={{ color: "#9BB0A0", fontSize: 13 }}>
            ou com e-mail
          </span>
          <span style={{ flex: 1, height: 1, background: "#E4EDE4" }} />
        </div>

        <div className="flex flex-col gap-3">

          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(127,176,105,0.35)")
            }
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          />
          <input
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder="Senha (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(127,176,105,0.35)")
            }
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold mt-3 text-center"
            style={{ color: "#C0673E" }}
          >
            {error}
          </motion.p>
        )}

        <button
          onClick={handleEmailSubmit}
          disabled={primaryDisabled}
          className="w-full mt-4 font-black text-white active:scale-95 transition-transform"
          style={{
            height: 56,
            borderRadius: 20,
            background: "linear-gradient(135deg, #7FB069, #5A8F4E)",
            boxShadow: "0 10px 24px rgba(90,143,78,0.30)",
            fontSize: 16,
            opacity: primaryDisabled ? 0.6 : 1,
          }}
        >
          {success ? (
            <span>✓ Pronto!</span>
          ) : loading ? (
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"
                aria-hidden
              />
              Um instante…
            </span>
          ) : mode === "signup" ? (
            "Criar conta gratuita"
          ) : (
            "Entrar"
          )}
        </button>

        <button
          onClick={() => {
            setMode((m) => (m === "signup" ? "signin" : "signup"));
            setError(null);
          }}
          className="w-full mt-3 text-sm font-bold"
          style={{ color: "#5A8F4E" }}
        >
          {mode === "signup"
            ? "Já tenho conta - Entrar"
            : "Criar conta nova"}
        </button>
      </div>

      <p
        className="mt-auto pt-6 text-center font-semibold"
        style={{ color: "#9BB0A0", fontSize: 13, maxWidth: 320 }}
      >
        A conta é necessária para salvar as memórias e recuperar o PIN dos pais por e-mail.
      </p>
    </div>
  );
};

export default AccountSetup;

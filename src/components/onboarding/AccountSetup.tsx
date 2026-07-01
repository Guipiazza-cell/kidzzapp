import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";


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
    return "Esse email já tem conta — toque em Entrar.";
  if (m.includes("password")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("email")) return "Confira o email digitado.";
  if (m.includes("rate")) return "Muitas tentativas. Espere um instante e tente de novo.";
  if (m.includes("network") || m.includes("fetch"))
    return "Sem conexão com a nuvem. Tente novamente.";
  return "Algo não deu certo. Tente novamente em instantes.";
};

const formatBrPhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  const ddd = digits.slice(0, 2);
  const first = digits.slice(2, 7);
  const second = digits.slice(7, 11);
  let out = "";
  if (digits.length === 0) return "";
  out = `+55 (${ddd}`;
  if (digits.length >= 2) out += ")";
  if (first) out += ` ${first}`;
  if (second) out += `-${second}`;
  return out;
};

const toE164 = (raw: string): string => {
  const digits = raw.replace(/\D/g, "");
  return `+55${digits.startsWith("55") ? digits.slice(2) : digits}`;
};

const syncGuestProfile = async (userId: string) => {
  const guest = readGuestProfile();
  if (!guest) return;
  try {
    // Single source of truth: idempotent RPC. Locks profile row, sets
    // onboarding_done=true atomically. Safe under double-tap / re-entry.
    const { error } = await supabase.rpc("complete_onboarding", {
      p_child_name: guest.child_name ?? "",
      p_age_range: guest.age_range ?? null,
      p_child_interests: guest.child_interests ?? [],
    });
    if (error) {
      console.warn("[AccountSetup] complete_onboarding failed", error);
      // Fallback: legacy upsert keeps the user moving even if RPC fails.
      await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            child_name: guest.child_name ?? "",
            age_range: guest.age_range ?? null,
            child_interests: guest.child_interests ?? [],
            onboarding_done: true,
          } as any,
          { onConflict: "id" }
        );
    }
  } catch (err) {
    console.warn("[AccountSetup] guest sync failed", err);
  }
};

type Tab = "email" | "phone";
type Mode = "signup" | "signin";

const AccountSetup = ({ childName, onDone }: AccountSetupProps) => {
  const { refreshProfile } = useAuth();
  const [tab, setTab] = useState<Tab>("email");
  const [mode, setMode] = useState<Mode>("signup");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cloudBlocked, setCloudBlocked] = useState(false);
  const submittingRef = useRef(false);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

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
      if (userId) await syncGuestProfile(userId);
      // Refetch profile so Index sees onboarding_done=true and drops into the app.
      try { await refreshProfile(); } catch {}
      setSuccess(true);
      setTimeout(() => onDone(), 450);
    },
    [onDone, refreshProfile]
  );

  const handleEmailSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    const cleanEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Confira o email digitado.");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
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
          // If the email already exists, try sign-in transparently
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
        // Ensure we have a session (if email confirmation is on, signUp returns no session)
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

  const handlePhoneSend = useCallback(async () => {
    setError(null);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Digite um número válido com DDD.");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        phone: toE164(phone),
      });
      if (err) {
        const m = err.message.toLowerCase();
        if (m.includes("provider") || m.includes("not enabled") || m.includes("phone")) {
          setError("Login por telefone chega em breve! Use email por enquanto 💛");
          setTimeout(() => {
            setTab("email");
            setError(null);
          }, 1800);
          return;
        }
        setError(translateAuthError(err.message));
        return;
      }
      setOtpSent(true);
    } catch (err: any) {
      setError(translateAuthError(err?.message || ""));
    } finally {
      setLoading(false);
    }
  }, [phone]);

  const handleOtpVerify = useCallback(async () => {
    setError(null);
    const token = otp.join("");
    if (token.length !== 6) {
      setError("Digite os 6 dígitos do código.");
      return;
    }
    setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.verifyOtp({
        phone: toE164(phone),
        token,
        type: "sms",
      });
      if (err) {
        setError(translateAuthError(err.message));
        return;
      }
      await finishSuccess(data.user?.id);
    } catch (err: any) {
      setError(translateAuthError(err?.message || ""));
    } finally {
      setLoading(false);
    }
  }, [otp, phone, finishSuccess]);

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

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
          Conexão com a nuvem indisponível — você pode continuar sem conta.
        </div>
      )}

      <div style={{ height: 24 }} />

      <h1
        className="text-center font-black mt-4 leading-tight"
        style={{ color: "#2E4438", fontSize: 28, maxWidth: 360 }}
      >
        Guarde as memórias do {childName || "seu pequeno"} ✨
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
        {/* Tabs */}
        <div
          className="flex p-1 rounded-2xl mb-4"
          style={{ background: "#F0F5EF" }}
          role="tablist"
        >
          {([
            { id: "email", label: "📧 Email" },
            { id: "phone", label: "📱 Telefone" },
          ] as const).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setTab(t.id);
                  setError(null);
                  setOtpSent(false);
                }}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: active ? "#FFFFFF" : "transparent",
                  color: active ? "#2E4438" : "#7A9282",
                  boxShadow: active ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {tab === "email" ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
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
            </motion.div>
          ) : (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              {!otpSent ? (
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+55 (11) 9XXXX-XXXX"
                  value={phone}
                  onChange={(e) => setPhone(formatBrPhone(e.target.value))}
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(127,176,105,0.35)")
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              ) : (
                <>
                  <p
                    className="text-center text-sm font-semibold"
                    style={{ color: "#5A7A66" }}
                  >
                    Digite o código que enviamos para {phone}
                  </p>
                  <div className="flex justify-between gap-2">
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        value={d}
                        inputMode="numeric"
                        maxLength={1}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !otp[i] && i > 0) {
                            otpRefs.current[i - 1]?.focus();
                          }
                        }}
                        style={{
                          width: "100%",
                          minWidth: 0,
                          maxWidth: 44,
                          flex: 1,
                          height: 56,
                          textAlign: "center",
                          fontSize: 22,
                          fontWeight: 800,
                          border: "1px solid #D8E5D8",
                          borderRadius: 14,
                          color: "#2E4438",
                          background: "#FFFFFF",
                          outline: "none",
                        }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setOtp(["", "", "", "", "", ""]);
                      setError(null);
                    }}
                    className="text-sm font-semibold underline"
                    style={{ color: "#7A9282" }}
                  >
                    Trocar número
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
          onClick={() => {
            if (tab === "email") return handleEmailSubmit();
            if (!otpSent) return handlePhoneSend();
            return handleOtpVerify();
          }}
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
          ) : tab === "email" ? (
            mode === "signup" ? "Criar conta gratuita" : "Entrar"
          ) : !otpSent ? (
            "Enviar código SMS"
          ) : (
            "Verificar código"
          )}
        </button>

        {tab === "email" && (
          <button
            onClick={() => {
              setMode((m) => (m === "signup" ? "signin" : "signup"));
              setError(null);
            }}
            className="w-full mt-3 text-sm font-bold"
            style={{ color: "#5A8F4E" }}
          >
            {mode === "signup"
              ? "Já tenho conta — Entrar"
              : "Criar conta nova"}
          </button>
        )}
      </div>

      <button
        onClick={onDone}
        className="mt-auto pt-6 font-semibold"
        style={{ color: "#9BB0A0", fontSize: 13 }}
      >
        Agora não — continuar sem conta
      </button>
    </div>
  );
};

export default AccountSetup;

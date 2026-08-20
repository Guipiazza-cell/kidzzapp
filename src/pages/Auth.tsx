import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Mode = "login" | "signup" | "forgot";

// Brand palette (matches PaywallScreen)
const AMBER = "#E8821A";
const AMBER_DEEP = "#C96B0E";
const CREAM = "#FFFCF8";
const INK = "#2A2A2A";
const INK_SOFT = "#5B5B5B";

const Auth = () => {
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isCheckoutFlow = new URLSearchParams(location.search).get("checkout") === "1";
  const nextParam = new URLSearchParams(location.search).get("next");
  const safeNext = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;
  const postLogin = () => navigate(safeNext ?? "/", { replace: true });
  const [mode, setMode] = useState<Mode>(() => (isCheckoutFlow ? "signup" : "login"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !isCheckoutFlow) postLogin();
  }, [user, isCheckoutFlow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) toast.error(error);
        else toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
        setLoading(false);
        return;
      }

      if (!password.trim() || password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        setLoading(false);
        return;
      }

      if (mode === "signup") {
        const { error } = await signUp(email, password);
        if (error) {
          console.error("Signup error:", error);
          toast.error(error);
        } else {
          toast.success("Conta criada! Entrando... 🎉");
          if (!isCheckoutFlow) postLogin();
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          console.error("Login error:", error);
          toast.error(error);
        } else {
          if (!isCheckoutFlow) postLogin();
        }
      }
    } catch {
      toast.error("Algo deu errado, tente novamente");
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === "login" ? "Bem-vindo de volta!" : mode === "signup" ? "Crie sua conta ✨" : "Recuperar senha 🔑";
  const subtitle =
    mode === "login"
      ? "Entre para continuar a aventura"
      : mode === "signup"
      ? "Os pais criam a conta, as crianças se divertem!"
      : "Enviaremos um link para redefinir sua senha";
  const cta =
    loading ? "Carregando..." : mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar link";

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center px-6"
      style={{
        background: `linear-gradient(180deg, ${CREAM} 0%, #FBF6EE 100%)`,
        color: INK,
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 48px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)",
      }}
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        <motion.h1
          className="text-3xl font-extrabold text-center tracking-tight"
          style={{ color: INK, fontWeight: 800 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {title}
        </motion.h1>

        <motion.p
          className="text-center text-[15px] mt-2"
          style={{ color: INK_SOFT }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {subtitle}
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          className="w-full mt-8 space-y-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#A38B6B" }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email dos pais"
              autoComplete="email"
              className="w-full py-4 pl-11 pr-4 rounded-2xl bg-white text-[15px] placeholder:text-[#A89C8A] focus:outline-none transition-all"
              style={{
                color: INK,
                border: "1px solid #EADFCC",
                boxShadow: "0 1px 2px rgba(40,30,15,0.04)",
              }}
              required
            />
          </div>

          {mode !== "forgot" && (
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#A38B6B" }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha (mínimo 6 caracteres)"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="w-full py-4 pl-11 pr-12 rounded-2xl bg-white text-[15px] placeholder:text-[#A89C8A] focus:outline-none transition-all"
                style={{
                  color: INK,
                  border: "1px solid #EADFCC",
                  boxShadow: "0 1px 2px rgba(40,30,15,0.04)",
                }}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: "#A38B6B" }}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-2xl font-extrabold text-white text-[17px] disabled:opacity-60 transition-all mt-2"
            style={{
              background: `linear-gradient(180deg, ${AMBER} 0%, ${AMBER_DEEP} 100%)`,
              boxShadow: "0 8px 20px -8px rgba(232,130,26,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
              letterSpacing: 0.2,
            }}
          >
            {cta}
          </motion.button>

          {mode === "login" && (
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="w-full text-center text-[13px] pt-1 hover:underline"
              style={{ color: INK_SOFT }}
            >
              Esqueceu a senha?
            </button>
          )}
        </motion.form>

        {mode !== "forgot" && (
          <motion.div
            className="w-full mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1" style={{ background: "#EADFCC" }} />
              <span className="text-[12px]" style={{ color: "#8A8170" }}>ou continue com</span>
              <div className="h-px flex-1" style={{ background: "#EADFCC" }} />
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                disabled={oauthLoading !== null}
                className="w-full py-4 rounded-2xl bg-white font-bold text-[15px] flex items-center justify-center gap-3 disabled:opacity-60"
                style={{ color: INK, border: "1px solid #EADFCC", boxShadow: "0 1px 2px rgba(40,30,15,0.04)" }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.4-4.7 7l7.6 5.9c4.4-4.1 6.8-10.1 6.8-17.4z"/>
                  <path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.8-6.1z"/>
                  <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.2-8.3 2.2-6.4 0-11.7-3.7-13.6-9l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/>
                </svg>
                {oauthLoading === "google" ? "Abrindo Google..." : "Entrar com Google"}
              </button>

              <button
                type="button"
                onClick={() => handleOAuth("apple")}
                disabled={oauthLoading !== null}
                className="w-full py-4 rounded-2xl font-bold text-[15px] text-white flex items-center justify-center gap-3 disabled:opacity-60"
                style={{ background: "#111111", boxShadow: "0 6px 16px -8px rgba(0,0,0,0.5)" }}
              >
                <svg width="17" height="19" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                </svg>
                {oauthLoading === "apple" ? "Abrindo Apple..." : "Entrar com Apple"}
              </button>
            </div>
          </motion.div>
        )}


        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {mode === "forgot" ? (
            <button
              onClick={() => setMode("login")}
              className="flex items-center gap-2 text-[14px] mx-auto hover:underline"
              style={{ color: INK_SOFT }}
            >
              <ArrowLeft size={16} />
              Voltar ao login
            </button>
          ) : (
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-[14px]"
              style={{ color: INK_SOFT }}
            >
              {mode === "login" ? (
                <>
                  Não tem conta?{" "}
                  <span className="font-bold" style={{ color: AMBER_DEEP }}>
                    Criar conta
                  </span>
                </>
              ) : (
                <>
                  Já tem conta?{" "}
                  <span className="font-bold" style={{ color: AMBER_DEEP }}>
                    Entrar
                  </span>
                </>
              )}
            </button>
          )}
        </motion.div>

        <motion.p
          className="text-[12px] mt-8 text-center"
          style={{ color: "#8A8170" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          🔒 Seus dados estão seguros e protegidos
        </motion.p>
      </div>
    </div>
  );
};

export default Auth;

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
  const [mode, setMode] = useState<Mode>(() => (isCheckoutFlow ? "signup" : "login"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !isCheckoutFlow) navigate("/", { replace: true });
  }, [user, isCheckoutFlow, navigate]);

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

      if (!password.trim() || password.length < 8) {
        toast.error("A senha deve ter pelo menos 8 caracteres");
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
          if (!isCheckoutFlow) navigate("/", { replace: true });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          console.error("Login error:", error);
          toast.error(error);
        } else {
          if (!isCheckoutFlow) navigate("/", { replace: true });
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
                placeholder="Senha (mínimo 8 caracteres)"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="w-full py-4 pl-11 pr-12 rounded-2xl bg-white text-[15px] placeholder:text-[#A89C8A] focus:outline-none transition-all"
                style={{
                  color: INK,
                  border: "1px solid #EADFCC",
                  boxShadow: "0 1px 2px rgba(40,30,15,0.04)",
                }}
                required
                minLength={8}
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

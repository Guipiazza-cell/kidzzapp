import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ChameleonMascot from "@/components/ChameleonMascot";
import jungleBg from "@/assets/jungle-bg.jpg";
import { toast } from "sonner";

type Mode = "login" | "signup" | "forgot";

const Auth = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
        if (error) toast.error(error);
        else toast.success("Conta criada com sucesso! 🎉");
      } else {
        const { error } = await signIn(email, password);
        if (error) toast.error("Email ou senha incorretos");
      }
    } catch {
      toast.error("Algo deu errado, tente novamente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${jungleBg})` }} />
      <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />

      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed rounded-full bg-kid-yellow/50"
          style={{ width: 4, height: 4, left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{ y: [0, -20, 10, 0], opacity: [0.2, 0.8, 0.3, 0.2] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <ChameleonMascot size="lg" />
        </motion.div>

        <motion.h1
          className="text-3xl font-extrabold text-white text-center mt-3 drop-shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {mode === "login" ? "Bem-vindo de volta! 🦎" : mode === "signup" ? "Crie sua conta! 🌟" : "Recuperar senha 🔑"}
        </motion.h1>

        <motion.p
          className="text-white/70 text-center text-sm mt-1 max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {mode === "login"
            ? "Entre para continuar a aventura"
            : mode === "signup"
            ? "Os pais criam a conta, as crianças se divertem!"
            : "Enviaremos um link para redefinir sua senha"}
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-sm mt-6 space-y-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email dos pais"
              className="w-full py-4 pl-11 pr-5 rounded-2xl bg-white/15 backdrop-blur-xl border-2 border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-kid-orange focus:ring-2 focus:ring-kid-orange/30 transition-all"
              required
            />
          </div>

          {mode !== "forgot" && (
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Senha (mínimo 6 caracteres)"
                className="w-full py-4 pl-11 pr-12 rounded-2xl bg-white/15 backdrop-blur-xl border-2 border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-kid-orange focus:ring-2 focus:ring-kid-orange/30 transition-all"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-yellow text-white font-extrabold text-lg shadow-2xl disabled:opacity-50 transition-all active:scale-95"
            whileTap={{ scale: 0.97 }}
          >
            {loading
              ? "Carregando..."
              : mode === "login"
              ? "Entrar 🚀"
              : mode === "signup"
              ? "Criar conta 🎉"
              : "Enviar link 📧"}
          </motion.button>

          {mode === "login" && (
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="w-full text-white/60 text-xs text-center hover:text-white/90 transition-colors"
            >
              Esqueceu a senha?
            </button>
          )}
        </motion.form>

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {mode === "forgot" ? (
            <button
              onClick={() => setMode("login")}
              className="flex items-center gap-2 text-white/70 text-sm hover:text-white transition-colors mx-auto"
            >
              <ArrowLeft size={16} />
              Voltar ao login
            </button>
          ) : (
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-white/70 text-sm hover:text-white transition-colors"
            >
              {mode === "login" ? (
                <>Não tem conta? <span className="font-bold text-kid-yellow">Criar conta</span></>
              ) : (
                <>Já tem conta? <span className="font-bold text-kid-yellow">Entrar</span></>
              )}
            </button>
          )}
        </motion.div>

        <motion.p
          className="text-white/30 text-xs mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          🔒 Seus dados estão seguros e protegidos
        </motion.p>
      </div>
    </div>
  );
};

export default Auth;

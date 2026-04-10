import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import MagicalBackground from "@/components/MagicalBackground";
import { toast } from "sonner";
import pixelImg from "@/assets/pixel-chameleon.png";
import aneImg from "@/assets/ane-chameleon.png";

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
        if (error) {
          console.error("Signup error:", error);
          toast.error(error);
        } else {
          toast.success("Conta criada! Entrando... 🎉");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          console.error("Login error:", error);
          toast.error(error);
        }
      }
    } catch {
      toast.error("Algo deu errado, tente novamente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)]">
      <MagicalBackground />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        {/* Characters */}
        <div className="flex items-end justify-center gap-4 mb-2">
          <motion.img
            src={aneImg}
            alt="Ane"
            className="w-16 h-16 object-contain drop-shadow-xl"
            initial={{ opacity: 0, x: -40, rotate: -15 }}
            animate={{ opacity: 1, x: 0, rotate: [0, -3, 3, 0] }}
            transition={{ type: "spring", stiffness: 180, damping: 14 }}
          />
          <motion.img
            src={pixelImg}
            alt="Pixel"
            className="w-16 h-16 object-contain drop-shadow-xl"
            initial={{ opacity: 0, x: 40, rotate: 15 }}
            animate={{ opacity: 1, x: 0, rotate: [0, 3, -3, 0] }}
            transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.1 }}
          />
        </div>

        <motion.h1
          className="text-3xl font-extrabold text-gray-800 text-center mt-3 drop-shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {mode === "login" ? "Bem-vindo de volta! 🦎" : mode === "signup" ? "Crie sua conta! 🌟" : "Recuperar senha 🔑"}
        </motion.h1>

        <motion.p
          className="text-gray-500 text-center text-sm mt-1 max-w-xs"
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
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email dos pais"
              className="w-full py-4 pl-11 pr-5 rounded-2xl glass-card text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-kid-orange/40 transition-all"
              required
            />
          </div>

          {mode !== "forgot" && (
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Senha (mínimo 6 caracteres)"
                className="w-full py-4 pl-11 pr-12 rounded-2xl glass-card text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-kid-orange/40 transition-all"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-pink text-white font-extrabold text-lg shadow-2xl disabled:opacity-50 transition-all active:scale-95"
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
              className="w-full text-gray-400 text-xs text-center hover:text-gray-600 transition-colors"
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
              className="flex items-center gap-2 text-gray-500 text-sm hover:text-gray-700 transition-colors mx-auto"
            >
              <ArrowLeft size={16} />
              Voltar ao login
            </button>
          ) : (
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              {mode === "login" ? (
                <>Não tem conta? <span className="font-bold text-kid-orange">Criar conta</span></>
              ) : (
                <>Já tem conta? <span className="font-bold text-kid-orange">Entrar</span></>
              )}
            </button>
          )}
        </motion.div>

        <motion.p
          className="text-gray-400 text-xs mt-4 text-center"
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

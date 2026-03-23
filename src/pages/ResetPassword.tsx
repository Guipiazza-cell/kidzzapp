import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ChameleonMascot from "@/components/ChameleonMascot";
import jungleBg from "@/assets/jungle-bg.jpg";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Senha atualizada com sucesso!");
      navigate("/");
    }
    setLoading(false);
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Link inválido ou expirado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${jungleBg})` }} />
      <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <ChameleonMascot size="lg" />
        <h1 className="text-2xl font-extrabold text-white text-center mt-4">Nova senha 🔐</h1>

        <form onSubmit={handleSubmit} className="w-full max-w-sm mt-6 space-y-3">
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nova senha (mínimo 6 caracteres)"
              className="w-full py-4 pl-11 pr-5 rounded-2xl bg-white/15 backdrop-blur-xl border-2 border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-kid-orange focus:ring-2 focus:ring-kid-orange/30 transition-all"
              required
              minLength={6}
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-yellow text-white font-extrabold text-lg shadow-2xl disabled:opacity-50 active:scale-95"
            whileTap={{ scale: 0.97 }}
          >
            {loading ? "Salvando..." : "Salvar nova senha ✅"}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

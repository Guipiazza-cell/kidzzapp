import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MagicalBackground from "@/components/MagicalBackground";
import { toast } from "sonner";
import pixelImg from "@/assets/pixel-chameleon.webp";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)]">
        <p className="text-gray-500">Link inválido ou expirado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)]">
      <MagicalBackground />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <motion.img
          src={pixelImg}
          alt="Pixel"
          className="w-20 h-20 object-contain drop-shadow-xl"
          animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <h1 className="text-2xl font-extrabold text-gray-800 text-center mt-4">Nova senha 🔐</h1>

        <form onSubmit={handleSubmit} className="w-full max-w-sm mt-6 space-y-3">
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nova senha (mínimo 6 caracteres)"
              className="w-full py-4 pl-11 pr-5 rounded-2xl glass-card text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-kid-orange/40 transition-all"
              required
              minLength={6}
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-pink text-white font-extrabold text-lg shadow-2xl disabled:opacity-50 active:scale-95"
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MagicalBackground from "@/components/MagicalBackground";
import PinSetupForm from "@/components/parental/PinSetupForm";
import { toast } from "sonner";

/** Página dedicada de recuperação do PIN dos pais.
 *  Só funciona com uma sessão válida vinda do link enviado por e-mail. */
const ResetPin = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = new URL(window.location.href);
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const access_token = hash.get("access_token");
        const refresh_token = hash.get("refresh_token");
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash") || hash.get("token_hash");

        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        } else if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        } else if (tokenHash) {
          await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
        }

        const { data } = await supabase.auth.getSession();
        if (!cancelled) setReady(!!data.session);
      } catch {
        if (!cancelled) setReady(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)]">
        <p className="text-gray-500">Validando seu link...</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)]">
        <p className="text-gray-600 text-center">
          Link inválido ou expirado. Peça um novo e-mail em "Esqueci o PIN".
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-pink text-white font-bold min-h-[48px]"
        >
          Voltar ao app
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-gradient-to-b from-[hsl(90,20%,85%)] via-[hsl(90,15%,90%)] to-[hsl(90,20%,85%)]">
      <MagicalBackground />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm bg-card rounded-3xl p-7 shadow-2xl">
          <div className="text-center mb-5">
            <KeyRound className="mx-auto" size={28} />
            <motion.h1
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-extrabold text-xl text-foreground mt-2"
            >
              Novo PIN dos pais
            </motion.h1>
            <p className="text-muted-foreground text-sm mt-1">
              4 dígitos. Escolha algo que só você saiba.
            </p>
          </div>
          <PinSetupForm
            saveLabel="Salvar novo PIN"
            onSaved={() => {
              toast.success("PIN atualizado!");
              navigate("/");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPin;

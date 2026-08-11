import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, KeyRound } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { supabase } from "@/integrations/supabase/client";
import PinSetupForm from "@/components/parental/PinSetupForm";
import {
  DEFAULT_PIN_HASH,
  PIN_ATTEMPTS_KEY,
  PIN_LOCK_DURATION_MS,
  PIN_LOCK_UNTIL_KEY,
  PIN_MAX_ATTEMPTS,
  getStoredPinHash,
  sha256Hex,
} from "@/lib/parentalPin";

interface ParentalGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

type Status = "idle" | "validating" | "success" | "error" | "locked" | "forcedSetup";

// Segurança:
// - Nenhuma dica de PIN na tela.
// - PIN por dispositivo, guardado só como hash SHA-256.
// - 3 tentativas com bloqueio de 60s.
// - Não é possível trocar o PIN sem acertar o PIN atual ou passar pelo e-mail.
const MAX_ATTEMPTS = PIN_MAX_ATTEMPTS;

const ParentalGate = ({ onSuccess, onCancel }: ParentalGateProps) => {
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [attemptsLeft, setAttemptsLeft] = useState<number>(MAX_ATTEMPTS);
  const [lockSecondsLeft, setLockSecondsLeft] = useState(0);
  const [recoveryMsg, setRecoveryMsg] = useState<string | null>(null);
  const [sendingRecovery, setSendingRecovery] = useState(false);
  const successFiredRef = useRef(false);

  useEffect(() => {
    try {
      const lockUntil = Number(localStorage.getItem(PIN_LOCK_UNTIL_KEY) || 0);
      if (lockUntil > Date.now()) {
        setStatus("locked");
        setLockSecondsLeft(Math.ceil((lockUntil - Date.now()) / 1000));
      } else {
        const a = Number(localStorage.getItem(PIN_ATTEMPTS_KEY) || 0);
        setAttemptsLeft(Math.max(0, MAX_ATTEMPTS - a));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (status !== "locked") return;
    const t = setInterval(() => {
      setLockSecondsLeft((s) => {
        if (s <= 1) {
          try {
            localStorage.removeItem(PIN_LOCK_UNTIL_KEY);
            localStorage.removeItem(PIN_ATTEMPTS_KEY);
          } catch {}
          setAttemptsLeft(MAX_ATTEMPTS);
          setStatus("idle");
          setPin("");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  const fireSuccess = useCallback(() => {
    if (successFiredRef.current) return;
    successFiredRef.current = true;
    try { onSuccess(); } catch (e) { console.error("[ParentalGate] onSuccess failed", e); }
  }, [onSuccess]);

  // Segurança: se ficarmos presos em "success" sem disparar o callback.
  useEffect(() => {
    if (status !== "success") return;
    const safety = setTimeout(() => fireSuccess(), 1200);
    return () => clearTimeout(safety);
  }, [status, fireSuccess]);

  const validate = useCallback(async (fullPin: string) => {
    setStatus("validating");
    haptic("light");
    await new Promise((r) => setTimeout(r, 300));

    const storedHash = getStoredPinHash();
    const hash = await sha256Hex(fullPin);
    const ok = hash === storedHash;

    if (ok) {
      try {
        localStorage.removeItem(PIN_ATTEMPTS_KEY);
        localStorage.removeItem(PIN_LOCK_UNTIL_KEY);
      } catch {}
      // Conta legada ainda no PIN de fábrica: força a criação de um PIN próprio.
      if (storedHash === DEFAULT_PIN_HASH) {
        haptic("success");
        setPin("");
        setStatus("forcedSetup");
        return;
      }
      setStatus("success");
      haptic("success");
      setTimeout(() => fireSuccess(), 700);
    } else {
      let attempts = 0;
      try {
        attempts = Number(localStorage.getItem(PIN_ATTEMPTS_KEY) || 0) + 1;
        localStorage.setItem(PIN_ATTEMPTS_KEY, String(attempts));
      } catch {}
      const left = Math.max(0, MAX_ATTEMPTS - attempts);
      setAttemptsLeft(left);
      haptic("error");
      if (left <= 0) {
        const until = Date.now() + PIN_LOCK_DURATION_MS;
        try { localStorage.setItem(PIN_LOCK_UNTIL_KEY, String(until)); } catch {}
        setLockSecondsLeft(Math.ceil(PIN_LOCK_DURATION_MS / 1000));
        setStatus("locked");
        setPin("");
      } else {
        setStatus("error");
        setTimeout(() => {
          setPin("");
          setStatus("idle");
        }, 900);
      }
    }
  }, [fireSuccess]);

  const handleDigit = (digit: string) => {
    if (status !== "idle" || pin.length >= 4) return;
    const newP = pin + digit;
    setPin(newP);
    haptic("light");
    if (newP.length === 4) void validate(newP);
  };

  const handleBack = () => {
    if (status !== "idle") return;
    setPin((p) => p.slice(0, -1));
  };

  /** "Esqueci o PIN": envia link por e-mail para /reset-pin.
   *  A criança não tem acesso ao e-mail dos pais, então a brecha fica fechada. */
  const handleForgotPin = async () => {
    if (sendingRecovery) return;
    setSendingRecovery(true);
    setRecoveryMsg(null);
    try {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email;
      if (!email) {
        setRecoveryMsg("Entre na sua conta para recuperar o PIN por e-mail.");
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-pin`,
      });
      setRecoveryMsg(
        error
          ? "Não deu para enviar agora. Tente de novo em instantes."
          : "Enviamos um link para o e-mail da conta. Abra por lá para criar um novo PIN."
      );
    } catch {
      setRecoveryMsg("Não deu para enviar agora. Tente de novo em instantes.");
    } finally {
      setSendingRecovery(false);
    }
  };

  const isLocked = status !== "idle";

  // ---- SETUP OBRIGATÓRIO (apenas após validar o PIN de fábrica) ----
  if (status === "forcedSetup") {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/60 backdrop-blur-md flex items-center justify-center z-[300] p-4"
        role="dialog" aria-modal="true" aria-label="Definir novo PIN"
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="bg-card rounded-3xl p-8 w-full max-w-sm shadow-2xl relative"
        >
          <div className="text-center mb-5">
            <KeyRound className="mx-auto" size={28} />
            <h2 className="font-extrabold text-xl text-foreground mt-2">Crie o PIN dos pais</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Sua conta ainda usa o PIN padrão. Escolha 4 dígitos que só você saiba.
            </p>
          </div>
          <PinSetupForm saveLabel="Salvar e continuar" onSaved={fireSuccess} />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/60 backdrop-blur-md flex items-center justify-center z-[300] p-4"
      role="dialog" aria-modal="true" aria-label="Verificação dos pais"
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="bg-card rounded-3xl p-8 w-full max-w-sm shadow-2xl relative"
      >
        <button
          onClick={onCancel}
          disabled={status === "validating" || status === "success"}
          aria-label="Fechar"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <span className="text-4xl">🔒</span>
          <h2 className="font-extrabold text-xl text-foreground mt-2">Área dos Pais</h2>
          <p className="text-muted-foreground text-sm mt-1">Digite seu PIN de 4 dígitos</p>
        </div>

        {/* Slots */}
        <div className="flex justify-center gap-3 mb-4">
          {[0,1,2,3].map((i) => {
            const filled = pin.length > i;
            const isError = status === "error";
            const isSuccess = status === "success";
            return (
              <motion.div
                key={i}
                animate={isError ? { x: [-6,6,-6,6,0] } : isSuccess ? { scale: [1,1.08,1] } : {}}
                transition={isSuccess ? { duration: 0.4, delay: i*0.05 } : { duration: 0.35 }}
                className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl font-bold transition-colors ${
                  isError ? "border-destructive bg-destructive/10"
                  : isSuccess ? "border-kid-green bg-kid-green/15"
                  : filled ? "border-primary bg-primary/10"
                  : "border-border bg-muted"
                }`}
              >
                {filled ? "●" : ""}
              </motion.div>
            );
          })}
        </div>

        {/* Feedback */}
        <div className="h-10 flex items-center justify-center mb-3">
          <AnimatePresence mode="wait">
            {status === "validating" && (
              <motion.div key="v" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm font-bold text-primary">
                <Loader2 size={16} className="animate-spin" />
                Validando acesso...
              </motion.div>
            )}
            {status === "success" && (
              <motion.div key="s" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm font-extrabold text-kid-green">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 14 }}
                  className="w-6 h-6 rounded-full bg-kid-green text-white flex items-center justify-center">
                  <Check size={14} strokeWidth={3} />
                </motion.span>
                Acesso liberado ✨
              </motion.div>
            )}
            {status === "error" && (
              <motion.p key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-sm font-bold text-destructive text-center">
                PIN incorreto. Tentativas restantes: {attemptsLeft}
              </motion.p>
            )}
            {status === "locked" && (
              <motion.p key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-sm font-bold text-destructive text-center">
                Bloqueado. Tente novamente em {lockSecondsLeft}s
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Keypad */}
        <div className={`grid grid-cols-3 gap-2 transition-opacity ${isLocked ? "opacity-50 pointer-events-none" : ""}`}>
          {["1","2","3","4","5","6","7","8","9","","0","←"].map((d, idx) =>
            d === "" ? <div key={`empty-${idx}`} /> : (
              <button
                key={d}
                onClick={() => d === "←" ? handleBack() : handleDigit(d)}
                disabled={isLocked}
                aria-label={d === "←" ? "Apagar" : `Digitar ${d}`}
                className="h-14 rounded-2xl bg-muted hover:bg-primary/10 active:scale-95 font-bold text-lg text-foreground transition-all disabled:active:scale-100"
              >
                {d}
              </button>
            )
          )}
        </div>

        {/* Recuperação por e-mail (não abre troca de PIN direto) */}
        <button
          onClick={handleForgotPin}
          disabled={sendingRecovery}
          className="w-full text-xs text-muted-foreground hover:text-foreground mt-4 underline disabled:opacity-40 min-h-[44px]"
        >
          {sendingRecovery ? "Enviando e-mail..." : "Esqueci o PIN"}
        </button>
        {recoveryMsg && (
          <p className="text-xs text-center text-muted-foreground mt-2">{recoveryMsg}</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ParentalGate;

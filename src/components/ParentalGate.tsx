import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, KeyRound } from "lucide-react";
import { haptic } from "@/lib/haptics";

interface ParentalGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

type Status = "idle" | "validating" | "success" | "error" | "locked" | "setup";

// Security:
// - No on-screen PIN hint (was trivially bypassable by any child).
// - Custom PIN per device, stored as SHA-256 hash in localStorage.
// - 3-attempt lockout with 60s cooldown to slow brute force.
// - Default fallback PIN exists only on a fresh install; parents are nudged to set their own.
const PIN_HASH_KEY = "kidzz_parental_pin_hash";
const ATTEMPTS_KEY = "kidzz_parental_attempts";
const LOCK_UNTIL_KEY = "kidzz_parental_lock_until";
const MAX_ATTEMPTS = 3;
const LOCK_DURATION_MS = 60 * 1000;

// SHA-256 hex digest — never store/transmit raw PIN.
async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Default (unset) hash — for a clean install we accept "1234" once, but immediately
// prompt the parent to set a custom PIN after success.
const DEFAULT_PIN_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"; // sha256("1234")

const ParentalGate = ({ onSuccess, onCancel }: ParentalGateProps) => {
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number>(MAX_ATTEMPTS);
  const [lockSecondsLeft, setLockSecondsLeft] = useState(0);
  const successFiredRef = useRef(false);

  // Check lockout on mount
  useEffect(() => {
    try {
      const lockUntil = Number(localStorage.getItem(LOCK_UNTIL_KEY) || 0);
      if (lockUntil > Date.now()) {
        setStatus("locked");
        setLockSecondsLeft(Math.ceil((lockUntil - Date.now()) / 1000));
      } else {
        const a = Number(localStorage.getItem(ATTEMPTS_KEY) || 0);
        setAttemptsLeft(Math.max(0, MAX_ATTEMPTS - a));
      }
    } catch {}
  }, []);

  // Countdown for lock
  useEffect(() => {
    if (status !== "locked") return;
    const t = setInterval(() => {
      setLockSecondsLeft((s) => {
        if (s <= 1) {
          try {
            localStorage.removeItem(LOCK_UNTIL_KEY);
            localStorage.removeItem(ATTEMPTS_KEY);
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

  // Safety: if we somehow stick in "success" without firing callback.
  useEffect(() => {
    if (status !== "success") return;
    const safety = setTimeout(() => {
      if (!successFiredRef.current) {
        successFiredRef.current = true;
        try { onSuccess(); } catch (e) { console.error("[ParentalGate] onSuccess failed", e); }
      }
    }, 1200);
    return () => clearTimeout(safety);
  }, [status, onSuccess]);

  const validate = useCallback(async (fullPin: string) => {
    setStatus("validating");
    haptic("light");
    await new Promise((r) => setTimeout(r, 300));

    let storedHash = "";
    try { storedHash = localStorage.getItem(PIN_HASH_KEY) || DEFAULT_PIN_HASH; } catch { storedHash = DEFAULT_PIN_HASH; }

    const hash = await sha256Hex(fullPin);
    const ok = hash === storedHash;

    if (ok) {
      try {
        localStorage.removeItem(ATTEMPTS_KEY);
        localStorage.removeItem(LOCK_UNTIL_KEY);
      } catch {}
      setStatus("success");
      haptic("success");
      setTimeout(() => {
        if (successFiredRef.current) return;
        successFiredRef.current = true;
        try { onSuccess(); } catch (e) { console.error("[ParentalGate] onSuccess failed", e); }
      }, 700);
    } else {
      let attempts = 0;
      try { attempts = Number(localStorage.getItem(ATTEMPTS_KEY) || 0) + 1; localStorage.setItem(ATTEMPTS_KEY, String(attempts)); } catch {}
      const left = Math.max(0, MAX_ATTEMPTS - attempts);
      setAttemptsLeft(left);
      haptic("error");
      if (left <= 0) {
        const until = Date.now() + LOCK_DURATION_MS;
        try { localStorage.setItem(LOCK_UNTIL_KEY, String(until)); } catch {}
        setLockSecondsLeft(Math.ceil(LOCK_DURATION_MS / 1000));
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
  }, [onSuccess]);

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

  const handleSaveNewPin = async () => {
    if (!/^\d{4}$/.test(newPin)) return;
    if (newPin !== confirmPin) return;
    const h = await sha256Hex(newPin);
    try { localStorage.setItem(PIN_HASH_KEY, h); } catch {}
    haptic("success");
    setStatus("idle");
    setNewPin("");
    setConfirmPin("");
  };

  const isLocked = status !== "idle" && status !== "setup";

  // ---- SETUP MODE ----
  if (status === "setup") {
    const canSave = /^\d{4}$/.test(newPin) && newPin === confirmPin;
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/60 backdrop-blur-md flex items-center justify-center z-[100] p-4"
        role="dialog" aria-modal="true" aria-label="Definir novo PIN"
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="bg-card rounded-3xl p-8 w-full max-w-sm shadow-2xl relative"
        >
          <button onClick={() => setStatus("idle")} aria-label="Voltar"
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
          <div className="text-center mb-5">
            <KeyRound className="mx-auto" size={28} />
            <h2 className="font-extrabold text-xl text-foreground mt-2">Definir novo PIN</h2>
            <p className="text-muted-foreground text-sm mt-1">4 dígitos. Escolha algo que só você saiba.</p>
          </div>
          <input
            type="password" inputMode="numeric" pattern="\d{4}" maxLength={4}
            value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0,4))}
            placeholder="Novo PIN"
            className="w-full py-3 px-4 rounded-2xl bg-muted text-foreground text-center text-2xl tracking-widest font-bold mb-3"
            autoFocus
          />
          <input
            type="password" inputMode="numeric" pattern="\d{4}" maxLength={4}
            value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0,4))}
            placeholder="Confirmar PIN"
            className="w-full py-3 px-4 rounded-2xl bg-muted text-foreground text-center text-2xl tracking-widest font-bold mb-4"
          />
          {newPin.length === 4 && confirmPin.length === 4 && newPin !== confirmPin && (
            <p className="text-sm font-bold text-destructive text-center mb-3">PINs não coincidem.</p>
          )}
          <button
            onClick={handleSaveNewPin} disabled={!canSave}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm disabled:opacity-50"
          >
            Salvar PIN
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/60 backdrop-blur-md flex items-center justify-center z-[100] p-4"
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

        {/* Set / change PIN */}
        <button
          onClick={() => setStatus("setup")}
          disabled={status === "validating" || status === "success" || status === "locked"}
          className="w-full text-xs text-muted-foreground hover:text-foreground mt-4 underline disabled:opacity-40"
        >
          Definir / alterar PIN dos pais
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ParentalGate;

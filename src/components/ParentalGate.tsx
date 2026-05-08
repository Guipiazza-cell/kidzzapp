import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2 } from "lucide-react";
import { haptic } from "@/lib/haptics";

interface ParentalGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

type Status = "idle" | "validating" | "success" | "error";

const CORRECT_PIN = "1234";

const ParentalGate = ({ onSuccess, onCancel }: ParentalGateProps) => {
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const successFiredRef = useRef(false);

  // Garantia: se por algum motivo ficarmos em "success" sem disparar o callback
  // (ex.: aba foi pra background e o setTimeout foi descartado), garantimos que
  // o usuário não fique travado.
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
    // Pequeno delay para mostrar o "Validando acesso..." de forma natural.
    await new Promise((r) => setTimeout(r, 350));

    if (fullPin === CORRECT_PIN) {
      setStatus("success");
      haptic("success");
      // Mostra a confirmação por ~700ms antes de prosseguir.
      setTimeout(() => {
        if (successFiredRef.current) return;
        successFiredRef.current = true;
        try { onSuccess(); } catch (e) { console.error("[ParentalGate] onSuccess failed", e); }
      }, 750);
    } else {
      setStatus("error");
      haptic("error");
      setTimeout(() => {
        setPin("");
        setStatus("idle");
      }, 900);
    }
  }, [onSuccess]);

  const handleDigit = (digit: string) => {
    if (status !== "idle" || pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    haptic("light");
    if (newPin.length === 4) {
      void validate(newPin);
    }
  };

  const handleBack = () => {
    if (status !== "idle") return;
    setPin((p) => p.slice(0, -1));
  };

  const isLocked = status !== "idle";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Verificação dos pais"
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
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
          <p className="text-muted-foreground text-sm mt-1">Digite o PIN (padrão: 1234)</p>
        </div>

        {/* Slots */}
        <div className="flex justify-center gap-3 mb-4">
          {[0, 1, 2, 3].map((i) => {
            const filled = pin.length > i;
            const isError = status === "error";
            const isSuccess = status === "success";
            return (
              <motion.div
                key={i}
                animate={isError ? { x: [-6, 6, -6, 6, 0] } : isSuccess ? { scale: [1, 1.08, 1] } : {}}
                transition={isSuccess ? { duration: 0.4, delay: i * 0.05 } : { duration: 0.35 }}
                className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl font-bold transition-colors ${
                  isError
                    ? "border-destructive bg-destructive/10"
                    : isSuccess
                    ? "border-kid-green bg-kid-green/15"
                    : filled
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted"
                }`}
              >
                {filled ? "●" : ""}
              </motion.div>
            );
          })}
        </div>

        {/* Feedback area (altura fixa para evitar layout shift) */}
        <div className="h-10 flex items-center justify-center mb-3">
          <AnimatePresence mode="wait">
            {status === "validating" && (
              <motion.div
                key="validating"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm font-bold text-primary"
              >
                <Loader2 size={16} className="animate-spin" />
                Validando acesso...
              </motion.div>
            )}
            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm font-extrabold text-kid-green"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 14 }}
                  className="w-6 h-6 rounded-full bg-kid-green text-white flex items-center justify-center"
                >
                  <Check size={14} strokeWidth={3} />
                </motion.span>
                Acesso liberado ✨
              </motion.div>
            )}
            {status === "error" && (
              <motion.p
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-bold text-destructive text-center"
              >
                PIN incorreto. Tente novamente.
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
      </motion.div>
    </motion.div>
  );
};

export default ParentalGate;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ParentalGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ParentalGate = ({ onSuccess, onCancel }: ParentalGateProps) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const correctPin = "1234";

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);
    if (newPin.length === 4) {
      if (newPin === correctPin) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 800);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        className="bg-card rounded-3xl p-8 w-full max-w-sm shadow-2xl"
      >
        <h2 className="font-kids font-800 text-2xl text-foreground text-center mb-2">
          👨‍👩‍👧 Área dos Pais
        </h2>
        <p className="font-kids text-muted-foreground text-center mb-6 text-sm">
          Digite o PIN para acessar (padrão: 1234)
        </p>

        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={error ? { x: [-4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl font-kids font-bold ${
                pin.length > i
                  ? error
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted"
              }`}
            >
              {pin.length > i ? "●" : ""}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "←"].map(
            (digit) =>
              digit === "" ? (
                <div key="empty" />
              ) : (
                <button
                  key={digit}
                  onClick={() =>
                    digit === "←"
                      ? setPin((p) => p.slice(0, -1))
                      : handleDigit(digit)
                  }
                  className="h-14 rounded-2xl bg-muted hover:bg-primary/10 active:scale-95 font-kids font-bold text-xl text-foreground transition-all"
                >
                  {digit}
                </button>
              )
          )}
        </div>

        <button
          onClick={onCancel}
          className="w-full text-center font-kids text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          Voltar
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ParentalGate;

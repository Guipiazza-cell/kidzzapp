import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

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
        setTimeout(() => { setPin(""); setError(false); }, 800);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        className="bg-card rounded-3xl p-8 w-full max-w-sm shadow-2xl relative"
      >
        <button onClick={onCancel} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <span className="text-4xl">🔒</span>
          <h2 className="font-extrabold text-xl text-foreground mt-2">Área dos Pais</h2>
          <p className="text-muted-foreground text-sm mt-1">Digite o PIN (padrão: 1234)</p>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
              className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl font-bold transition-colors ${
                pin.length > i
                  ? error ? "border-destructive bg-destructive/10" : "border-primary bg-primary/10"
                  : "border-border bg-muted"
              }`}
            >
              {pin.length > i ? "●" : ""}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {["1","2","3","4","5","6","7","8","9","","0","←"].map((d) =>
            d === "" ? <div key="empty" /> : (
              <button
                key={d}
                onClick={() => d === "←" ? setPin(p => p.slice(0,-1)) : handleDigit(d)}
                className="h-14 rounded-2xl bg-muted hover:bg-primary/10 active:scale-95 font-bold text-lg text-foreground transition-all"
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

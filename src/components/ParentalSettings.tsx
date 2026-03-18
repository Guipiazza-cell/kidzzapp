import { useState } from "react";
import { motion } from "framer-motion";

interface ParentalSettingsProps {
  onClose: () => void;
}

const ParentalSettings = ({ onClose }: ParentalSettingsProps) => {
  const [ageRange, setAgeRange] = useState("6-8");
  const [dailyLimit, setDailyLimit] = useState(10);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-card rounded-3xl p-8 w-full max-w-md shadow-2xl"
      >
        <h2 className="font-kids font-800 text-2xl text-foreground text-center mb-6">
          ⚙️ Controle Parental
        </h2>

        <div className="space-y-6">
          <div>
            <label className="font-kids font-bold text-foreground text-sm block mb-2">
              Faixa etária da criança
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["3-5", "6-8", "9-12"].map((range) => (
                <button
                  key={range}
                  onClick={() => setAgeRange(range)}
                  className={`py-3 rounded-2xl font-kids font-bold text-sm transition-all ${
                    ageRange === range
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-primary/10"
                  }`}
                >
                  {range} anos
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-kids font-bold text-foreground text-sm block mb-2">
              Limite diário de perguntas: {dailyLimit}
            </label>
            <input
              type="range"
              min={5}
              max={30}
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between font-kids text-xs text-muted-foreground">
              <span>5</span>
              <span>30</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-2xl p-4">
            <p className="font-kids text-sm text-foreground font-bold mb-1">🔒 Plano Gratuito</p>
            <p className="font-kids text-xs text-muted-foreground">
              5 perguntas por dia. Atualize para o plano Premium para perguntas ilimitadas!
            </p>
            <button className="mt-3 w-full py-3 rounded-2xl bg-kid-orange text-primary-foreground font-kids font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-95">
              ⭐ Seja Premium
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-2xl bg-muted text-foreground font-kids font-bold hover:bg-muted/80 transition-all"
        >
          Fechar
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ParentalSettings;

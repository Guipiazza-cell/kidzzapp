import { useState } from "react";
import { motion } from "framer-motion";
import { X, Clock, History, Volume2, VolumeX, Star } from "lucide-react";

interface ParentalSettingsProps {
  onClose: () => void;
}

const ParentalSettings = ({ onClose }: ParentalSettingsProps) => {
  const [ageRange, setAgeRange] = useState("6-8");
  const [dailyLimit, setDailyLimit] = useState(10);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<"settings" | "history">("settings");

  const mockHistory = [
    { q: "Por que o céu é azul?", time: "Hoje, 14:30" },
    { q: "Quantas patas tem uma aranha?", time: "Hoje, 13:15" },
    { q: "Como os peixes respiram?", time: "Ontem, 16:00" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        className="bg-card rounded-3xl p-6 w-full max-w-md shadow-2xl relative max-h-[85vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>

        <h2 className="font-extrabold text-xl text-foreground text-center mb-1">⚙️ Controle Parental</h2>
        <p className="text-muted-foreground text-xs text-center mb-5">Gerencie a experiência da criança</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { id: "settings" as const, label: "Configurações", icon: Clock },
            { id: "history" as const, label: "Histórico", icon: History },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                activeTab === id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {activeTab === "settings" ? (
          <div className="space-y-5">
            {/* Age Range */}
            <div>
              <label className="font-bold text-foreground text-sm block mb-2">🎂 Faixa etária</label>
              <div className="grid grid-cols-3 gap-2">
                {["4-5", "6-8", "9-10"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setAgeRange(range)}
                    className={`py-3 rounded-2xl font-bold text-sm transition-all ${
                      ageRange === range
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-primary/10"
                    }`}
                  >
                    {range} anos
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Limit */}
            <div>
              <label className="font-bold text-foreground text-sm block mb-2">
                ⏱️ Limite diário: <span className="text-primary">{dailyLimit} perguntas</span>
              </label>
              <input
                type="range"
                min={3}
                max={30}
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3</span><span>30</span>
              </div>
            </div>

            {/* Voice Toggle */}
            <div className="flex items-center justify-between bg-muted/50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                {voiceEnabled ? <Volume2 size={20} className="text-primary" /> : <VolumeX size={20} className="text-muted-foreground" />}
                <div>
                  <p className="font-bold text-sm text-foreground">Respostas por voz</p>
                  <p className="text-xs text-muted-foreground">Ouvir as respostas do Kidzz</p>
                </div>
              </div>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`w-12 h-7 rounded-full transition-colors ${voiceEnabled ? "bg-primary" : "bg-border"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-card shadow-sm transition-transform ${voiceEnabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Premium CTA */}
            <div className="kid-gradient-premium rounded-2xl p-4 text-center">
              <Star className="mx-auto mb-1 text-kid-yellow" size={24} />
              <p className="font-extrabold text-primary-foreground text-sm">Kidzz Premium</p>
              <p className="text-primary-foreground/80 text-xs mt-1">
                Perguntas ilimitadas + voz + mais personagens!
              </p>
              <button className="mt-3 bg-card text-foreground font-bold py-2.5 px-6 rounded-full text-sm shadow-lg hover:shadow-xl transition-all active:scale-95">
                ⭐ Conhecer planos
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {mockHistory.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Nenhuma pergunta ainda</p>
            ) : (
              mockHistory.map((item, i) => (
                <div key={i} className="bg-muted/50 rounded-2xl p-3">
                  <p className="font-bold text-sm text-foreground">{item.q}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ParentalSettings;

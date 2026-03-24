import { motion } from "framer-motion";
import { X, ShieldCheck, History, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ParentalSettingsProps {
  onClose: () => void;
}

const AGE_RANGES = [
  { range: "0-3", label: "0 a 3 anos", emoji: "👶", description: "Sons, cores e palavras curtas." },
  { range: "3-7", label: "3 a 7 anos", emoji: "🧒", description: "Historinhas e exemplos do dia a dia." },
  { range: "7-10", label: "7 a 10 anos", emoji: "🧑‍🎓", description: "Curiosidades e desafios científicos." },
];

const ParentalSettings = ({ onClose }: ParentalSettingsProps) => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const currentAge = profile?.age_range || "3-7";
  const isPremium = profile?.is_premium ?? false;

  const handleAgeChange = async (range: string) => {
    await updateProfile({ age_range: range });
  };

  const handleReset = async () => {
    await signOut();
    onClose();
  };

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
        className="bg-card rounded-3xl p-5 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>

        <h2 className="font-extrabold text-xl text-foreground text-center mb-1">⚙️ Controle Parental</h2>
        <p className="text-muted-foreground text-xs text-center mb-4">Gerencie a experiência</p>

        <div className="space-y-4">
          <div className={`rounded-2xl p-4 text-center ${isPremium ? "kid-gradient-premium text-white" : "bg-muted"}`}>
            <p className="font-extrabold text-lg">{isPremium ? "⭐ Premium Ativo" : "Plano Gratuito"}</p>
            <p className="text-sm opacity-80">
              {isPremium
                ? "Perguntas ilimitadas • Voz ativa • Todos os personagens"
                : `${Math.max(0, 3 - (profile?.questions_used ?? 0))} de 3 perguntas restantes`}
            </p>
          </div>

          <div>
            <label className="font-bold text-foreground text-sm block mb-2">
              <ShieldCheck size={14} className="inline mr-1" />
              Faixa etária
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AGE_RANGES.map(({ range, emoji, label }) => (
                <button
                  key={range}
                  onClick={() => handleAgeChange(range)}
                  className={`py-3 rounded-2xl font-bold text-xs transition-all ${
                    currentAge === range
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-primary/10"
                  }`}
                >
                  <span className="text-lg block">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-kid-green/10 border border-kid-green/30 rounded-2xl p-3">
            <p className="font-extrabold text-sm text-foreground">🔒 Segurança de conteúdo</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Todas as respostas são filtradas automaticamente. Conteúdos impróprios são bloqueados.
            </p>
          </div>

          <div className="bg-muted/50 rounded-2xl p-3">
            <p className="font-bold text-sm text-foreground">👧 Nome da criança</p>
            <p className="text-sm text-muted-foreground">{profile?.child_name || "Não definido"}</p>
          </div>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-destructive/10 text-destructive font-bold text-sm hover:bg-destructive/20 transition-all"
          >
            <LogOut size={16} />
            {user ? "Sair da conta" : "Reiniciar modo teste"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ParentalSettings;

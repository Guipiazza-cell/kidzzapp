import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Lock, Crown } from "lucide-react";

interface StoryFormProps {
  childName: string;
  onGenerate: (age: number, interests: string) => void;
  isLoading: boolean;
  storiesRemaining?: number;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

const INTEREST_OPTIONS = [
  { id: "aventura", label: "Aventura", emoji: "🏔️" },
  { id: "natureza", label: "Natureza", emoji: "🌿" },
  { id: "espaco", label: "Espaço", emoji: "🚀" },
  { id: "animais", label: "Animais", emoji: "🐾" },
  { id: "magia", label: "Magia", emoji: "✨" },
  { id: "amizade", label: "Amizade", emoji: "🤝" },
  { id: "ciencia", label: "Ciência", emoji: "🔬" },
  { id: "oceano", label: "Oceano", emoji: "🌊" },
];

const StoryForm = ({ childName, onGenerate, isLoading, storiesRemaining = 0, isPremium = false, onUpgrade }: StoryFormProps) => {
  const [age, setAge] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (age && selectedInterests.length > 0) {
      const interestLabels = selectedInterests
        .map((id) => INTEREST_OPTIONS.find((o) => o.id === id)?.label)
        .filter(Boolean)
        .join(", ");
      onGenerate(parseInt(age), interestLabels);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="text-center">
        <h2 className="text-xl font-extrabold text-white drop-shadow-lg">
          Conte-nos sobre {childName}! 📖
        </h2>
        <p className="text-white/60 text-xs mt-1">
          Vamos criar uma história mágica personalizada
        </p>
      </div>

      <div className="bg-black/30 backdrop-blur-md rounded-3xl p-4 border border-white/10 space-y-4">
        <div>
          <p className="text-sm font-extrabold text-white mb-2">Idade 🎂</p>
          <input
            type="number"
            min="1"
            max="12"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Ex: 5"
            className="w-full py-3 px-4 rounded-2xl bg-white/10 border border-white/20 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-kid-orange"
          />
        </div>

        <div>
          <p className="text-sm font-extrabold text-white mb-2">
            O que {childName} adora? 🌟
          </p>
          <div className="grid grid-cols-2 gap-2">
            {INTEREST_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleInterest(opt.id)}
                className={`p-3 rounded-2xl text-left transition-all flex items-center gap-2 ${
                  selectedInterests.includes(opt.id)
                    ? "bg-kid-orange/20 border-2 border-kid-orange"
                    : "bg-white/5 border-2 border-transparent hover:border-white/20"
                }`}
              >
                <span className="text-lg">{opt.emoji}</span>
                <span className="text-xs font-bold text-white">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aviso de quota / bloqueio */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl px-4 py-3 flex items-center gap-3 border-2 ${
            storiesRemaining > 0
              ? "bg-amber-50/90 border-amber-300"
              : "bg-rose-50/95 border-rose-300"
          }`}
        >
          {storiesRemaining > 0 ? (
            <>
              <Sparkles size={18} className="text-amber-600 flex-shrink-0" />
              <p className="text-[13px] font-extrabold text-amber-800 leading-tight">
                Você tem <span className="text-amber-900">1 história grátis</span> para experimentar! ✨
              </p>
            </>
          ) : (
            <>
              <Lock size={18} className="text-rose-600 flex-shrink-0" />
              <p className="text-[13px] font-extrabold text-rose-800 leading-tight">
                Sua história grátis já foi criada. Assine para criar histórias ilimitadas!
              </p>
            </>
          )}
        </motion.div>
      )}

      {/* Botão principal: Gerar OU Assinar (quando bloqueado) */}
      {!isPremium && storiesRemaining <= 0 ? (
        <motion.button
          onClick={onUpgrade}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-kid-purple via-pink-500 to-kid-pink text-white font-extrabold text-base shadow-2xl flex items-center justify-center gap-2 active:scale-95 relative overflow-hidden"
          whileTap={{ scale: 0.97 }}
        >
          <Crown size={22} />
          Assinar agora · Histórias ilimitadas
        </motion.button>
      ) : (
        <motion.button
          onClick={handleSubmit}
          disabled={!age || selectedInterests.length === 0 || isLoading}
          className="w-full py-5 rounded-2xl kid-gradient-premium text-white font-extrabold text-base shadow-2xl flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95"
          whileTap={{ scale: 0.97 }}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Criando história mágica...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Gerar História Personalizada 🚀
            </>
          )}
        </motion.button>
      )}

      {/* Link sutil para assinar mesmo com história disponível */}
      {!isPremium && storiesRemaining > 0 && onUpgrade && (
        <button
          onClick={onUpgrade}
          className="w-full text-center text-[11px] font-bold text-kid-purple underline-offset-2 hover:underline"
        >
          💛 Quero histórias ilimitadas — ver planos
        </button>
      )}
    </motion.div>
  );
};

export default StoryForm;

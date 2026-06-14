import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ShieldCheck, X } from "lucide-react";
import ChameleonMascot from "@/components/ChameleonMascot";
import { useAuth, type CheckoutPlan } from "@/contexts/AuthContext";

interface PaywallScreenProps {
  childName?: string;
  onClose?: () => void;
}

type Cycle = "monthly" | "annual";

const FEATURES: Array<{ row: string; free: string; kidzz: string; premium: string }> = [
  { row: "Para quê",          free: "Experimentar",     kidzz: "Aprender todo dia",  premium: "Desenvolver e conectar" },
  { row: "Perguntas",         free: "Algumas",          kidzz: "À vontade",          premium: "À vontade" },
  { row: "Histórias com voz", free: "1 por dia",        kidzz: "À vontade",          premium: "À vontade" },
  { row: "Floresta Musical",  free: "🔒",               kidzz: "✅",                  premium: "✅" },
  { row: "Jogos Kidzz Play",  free: "🔒",               kidzz: "✅",                  premium: "✅" },
  { row: "Memórias",          free: "🔒",               kidzz: "✅",                  premium: "✅" },
  { row: "Ritual de Sono 🌙", free: "🔒",               kidzz: "🔒",                  premium: "✅" },
  { row: "Rotina e Momentos", free: "🔒",               kidzz: "🔒",                  premium: "✅" },
  { row: "KALM completo",     free: "Amostra",          kidzz: "🔒",                  premium: "✅" },
  { row: "SOS Emocional 🆘",  free: "🔒",               kidzz: "🔒",                  premium: "✅" },
  { row: "Cinema",            free: "Amostra",          kidzz: "🔒",                  premium: "✅" },
];

const PaywallScreen = ({ childName, onClose }: PaywallScreenProps) => {
  const { handleCheckout, user } = useAuth();
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [selected, setSelected] = useState<"kidzz" | "premium">("premium");
  const [loading, setLoading] = useState(false);

  const planKey: CheckoutPlan =
    selected === "kidzz"
      ? cycle === "annual" ? "kidzz_annual" : "kidzz"
      : cycle === "annual" ? "premium_annual" : "premium";

  const priceLabel = (plan: "kidzz" | "premium") => {
    if (plan === "kidzz") return cycle === "annual" ? "R$ 199,90/ano" : "R$ 19,90/mês";
    return cycle === "annual" ? "R$ 249,90/ano" : "R$ 24,90/mês";
  };

  const onSubscribe = async () => {
    setLoading(true);
    try {
      await handleCheckout(planKey);
    } finally {
      setLoading(false);
    }
  };

  const nome = childName?.trim() || "seu filho";

  return (
    <div
      className="min-h-screen w-full overflow-y-auto overscroll-contain"
      style={{
        WebkitOverflowScrolling: "touch",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)",
      }}
    >
      <div className="max-w-md mx-auto px-5 space-y-5">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-11 h-11 rounded-full glass-card flex items-center justify-center"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
            aria-label="Fechar"
          >
            <X size={20} className="text-gray-700" />
          </button>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-6 space-y-3"
        >
          <ChameleonMascot size="md" className="mx-auto" mood="happy" />
          <h1 className="text-2xl font-black text-gray-800 leading-tight px-2">
            Escolha como o Kidzz vai cuidar do {nome}
          </h1>
          <p className="text-sm text-gray-700">
            Comece grátis. Cancele quando quiser. Sem letras miúdas.
          </p>
        </motion.div>

        {/* Cycle toggle */}
        <div className="glass-card rounded-2xl p-1 flex">
          {(["monthly", "annual"] as Cycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`flex-1 min-h-[44px] rounded-xl text-sm font-bold transition-all ${
                cycle === c ? "bg-white text-gray-900 shadow" : "text-gray-700"
              }`}
            >
              {c === "monthly" ? "Mensal" : "Anual"}
              {c === "annual" && (
                <span className="ml-1 text-[10px] text-kid-green font-black">
                  2 meses grátis
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        <div className="space-y-3">
          {/* Kidzz */}
          <motion.button
            onClick={() => setSelected("kidzz")}
            className={`w-full text-left rounded-2xl p-5 glass-card transition-all ${
              selected === "kidzz" ? "ring-2 ring-kid-purple/70" : ""
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Aprender todo dia</p>
                <p className="text-lg font-black text-gray-800">Kidzz</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === "kidzz" ? "bg-kid-purple border-kid-purple" : "border-gray-300"
              }`}>
                {selected === "kidzz" && <Check size={12} className="text-white" />}
              </div>
            </div>
            <p className="text-xl font-black text-gray-900 mt-1">{priceLabel("kidzz")}</p>
            <p className="text-xs text-gray-700 mt-2">
              Perguntas e histórias à vontade · Música · Brincar · Memórias
            </p>
          </motion.button>

          {/* Premium */}
          <motion.button
            onClick={() => setSelected("premium")}
            className={`w-full text-left rounded-2xl p-5 glass-card transition-all relative ${
              selected === "premium" ? "ring-2 ring-kid-yellow/70" : ""
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <span className="absolute -top-2 right-4 text-[10px] font-black bg-kid-orange text-white px-2 py-1 rounded-full">
              RECOMENDADO
            </span>
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Desenvolver e conectar</p>
                <p className="text-lg font-black text-gray-800">Premium</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === "premium" ? "bg-kid-yellow border-kid-yellow" : "border-gray-300"
              }`}>
                {selected === "premium" && <Check size={12} className="text-gray-900" />}
              </div>
            </div>
            <p className="text-xl font-black text-gray-900 mt-1">{priceLabel("premium")}</p>
            <p className="text-xs text-gray-700 mt-2">
              Tudo do Kidzz + Sono, Rotina, Momentos, KALM completo, SOS e Cinema
            </p>
          </motion.button>
        </div>

        {/* CTA */}
        <motion.button
          onClick={onSubscribe}
          disabled={loading}
          className="w-full min-h-[56px] rounded-2xl kid-gradient-premium text-white font-extrabold text-base shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
          whileTap={{ scale: 0.97 }}
        >
          <Sparkles size={18} />
          {loading ? "Abrindo..." : user ? "Assinar agora" : "Criar conta e assinar"}
        </motion.button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-gray-600">
          <ShieldCheck size={14} className="text-gray-600" />
          <span>Pagamento seguro via Stripe · Cancele quando quiser</span>
        </div>
        <p className="text-[11px] text-gray-600 text-center -mt-2">
          Você não será cobrado hoje sem confirmar.
        </p>

        {/* Comparativo */}
        <div className="glass-card rounded-2xl p-4 mt-2">
          <p className="text-xs font-bold text-gray-700 mb-3 text-center">
            O que muda em cada plano
          </p>
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-1 text-[10px] font-black text-gray-700">
              <div></div>
              <div className="text-center">Grátis</div>
              <div className="text-center">Kidzz</div>
              <div className="text-center">Premium</div>
            </div>
            {FEATURES.map((f) => (
              <div key={f.row} className="grid grid-cols-4 gap-1 text-[11px] py-1.5 border-t border-gray-300/30">
                <div className="font-bold text-gray-800">{f.row}</div>
                <div className="text-center text-gray-700">{f.free}</div>
                <div className="text-center text-gray-700">{f.kidzz}</div>
                <div className="text-center text-gray-700">{f.premium}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallScreen;

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Lock, X, Leaf, Flame, Users } from "lucide-react";
import { useAuth, type CheckoutPlan } from "@/contexts/AuthContext";

export type PaywallContextKind = "default" | "premium_locked" | "surprise_limit" | "streak_milestone" | "after_completion";

interface PaywallScreenProps {
  childName?: string;
  onClose?: () => void;
  context?: PaywallContextKind;
}

type Cycle = "monthly" | "annual";

// Brand palette (visual only — no logic changes)
const AMBER = "#E8821A";
const AMBER_DEEP = "#C96B0E";
const SAGE = "#7FB069";
const GOLD = "#E2B64C";
const CREAM = "#FFFCF8";
const INK = "#2A2A2A";
const INK_SOFT = "#5B5B5B";

const FEATURES: Array<{ row: string; free: string; kidzz: string; premium: string }> = [
  { row: "Para quê",          free: "Experimentar",     kidzz: "O dia a dia da curiosidade",  premium: "A experiência completa" },
  { row: "Perguntas",         free: "Algumas",          kidzz: "À vontade",                   premium: "À vontade" },
  { row: "Histórias com voz", free: "1 por dia",        kidzz: "À vontade",                   premium: "À vontade" },
  { row: "Floresta Musical",  free: "🔒",               kidzz: "✅",                          premium: "✅" },
  { row: "Jogos Kidzz Play",  free: "🔒",               kidzz: "✅",                          premium: "✅" },
  { row: "Memórias",          free: "🔒",               kidzz: "✅",                          premium: "✅" },
  { row: "Ritual de Sono 🌙", free: "🔒",               kidzz: "🔒",                          premium: "✅" },
  { row: "Rotina e Momentos", free: "🔒",               kidzz: "🔒",                          premium: "✅" },
  { row: "KALM completo",     free: "Amostra",          kidzz: "🔒",                          premium: "✅" },
  { row: "SOS Emocional 🆘",  free: "🔒",               kidzz: "🔒",                          premium: "✅" },
  { row: "Cinema",            free: "Amostra",          kidzz: "🔒",                          premium: "✅" },
];

const PaywallScreen = ({ childName, onClose, context = "default" }: PaywallScreenProps) => {
  const { handleCheckout, user } = useAuth();
  const [cycle, setCycle] = useState<Cycle>("annual");
  const [selected, setSelected] = useState<"kidzz" | "premium">("premium");
  const [loading, setLoading] = useState(false);

  const planKey: CheckoutPlan =
    selected === "kidzz"
      ? cycle === "annual" ? "kidzz_annual" : "kidzz"
      : cycle === "annual" ? "premium_annual" : "premium";

  const priceParts = (plan: "kidzz" | "premium") => {
    if (plan === "kidzz") {
      return cycle === "annual"
        ? { big: "R$ 199,90", small: "/ano", hint: "≈ R$ 16,66/mês" }
        : { big: "R$ 19,90", small: "/mês", hint: "" };
    }
    return cycle === "annual"
      ? { big: "R$ 249,90", small: "/ano", hint: "≈ R$ 20,82/mês" }
      : { big: "R$ 24,90", small: "/mês", hint: "" };
  };

  const onSubscribe = async () => {
    setLoading(true);
    try {
      if (!user) onClose?.();
      await handleCheckout(planKey);
    } finally {
      setLoading(false);
    }
  };

  const nome = childName?.trim() || "seu filho";

  // Diário Sem Tela — emotional anchor for the headline (read-only).
  const diary = useMemo(() => {
    if (typeof window === "undefined") return { minutes: 0, streak: 0, completions: 0 };
    try {
      const raw = window.localStorage.getItem("bora_diary_v1");
      if (raw) {
        const d = JSON.parse(raw);
        return { minutes: d.minutes || 0, streak: d.streak || 0, completions: d.completions || 0 };
      }
    } catch {}
    return { minutes: 0, streak: 0, completions: 0 };
  }, []);

  const ctx = useMemo(() => {
    const hasMinutes = diary.minutes > 0;
    switch (context) {
      case "premium_locked":
        return {
          tag: "Conteúdo Premium",
          headline: `Essa coleção é feita pro ${nome.split(" ")[0]} brilhar`,
          sub: hasMinutes
            ? `Vocês já criaram ${diary.minutes} min sem tela com o Kidzz 🌿. Com o Premium, é ilimitado.`
            : `Atividades feitas só pra ele, ilimitadas no Premium.`,
        };
      case "surprise_limit":
        return {
          tag: "Mais uma surpresa?",
          headline: `A surpresa grátis do dia já saiu. Quer outra agora?`,
          sub: `No Premium o ${nome.split(" ")[0]} recebe surpresas ilimitadas — feitas só pra ele.`,
        };
      case "streak_milestone":
        return {
          tag: `🌿 ${diary.streak} dias sem tela!`,
          headline: `Vocês tão construindo um hábito raro`,
          sub: `Continue o ritmo com o Premium: atividades ilimitadas e Diário completo pra não perder nenhum dia.`,
        };
      case "after_completion":
        return {
          tag: "Curtiu a brincadeira? 🌿",
          headline: `Sentiu o valor. Agora destrava o Kidzz inteiro.`,
          sub: hasMinutes
            ? `${diary.minutes} min sem tela criados com a gente. No Premium, é só o começo.`
            : `Atividades ilimitadas, personalizadas pro ${nome.split(" ")[0]}.`,
        };
      default:
        return {
          tag: "",
          headline: `Escolha como o Kidzz vai cuidar do ${nome}`,
          sub: hasMinutes
            ? `Vocês já criaram ${diary.minutes} min sem tela com o Kidzz 🌿. Com o Premium, é ilimitado — e o ${nome.split(" ")[0]} ganha atividades feitas só pra ele.`
            : `Comece grátis. Cancele quando quiser. Sem letras miúdas.`,
        };
    }
  }, [context, diary, nome]);


  return (
    <div
      className="min-h-screen w-full overflow-y-auto overflow-x-hidden overscroll-contain"
      style={{
        WebkitOverflowScrolling: "touch",
        background: `linear-gradient(180deg, ${CREAM} 0%, #FBF6EE 100%)`,
        color: INK,
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 220px)",
      }}
    >
      <div className="max-w-md mx-auto px-5">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 w-11 h-11 rounded-full flex items-center justify-center bg-white/80 backdrop-blur shadow-sm border border-black/5"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
            aria-label="Fechar"
          >
            <X size={20} style={{ color: INK }} />
          </button>
        )}

        {/* Header — contextual + emotional */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-8 pb-2"
        >
          {ctx.tag && (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-[0.12em] uppercase px-3 py-1.5 rounded-full mb-4"
              style={{
                background: `linear-gradient(135deg, ${SAGE}1A 0%, ${AMBER}1A 100%)`,
                color: AMBER_DEEP,
                border: `1px solid ${AMBER}33`,
              }}
            >
              {ctx.tag}
            </span>
          )}
          <h1
            className="text-[26px] leading-[1.15] font-extrabold px-1"
            style={{ color: INK, letterSpacing: "-0.01em" }}
          >
            {ctx.headline}
          </h1>
          <p className="text-[14px] mt-3 px-2" style={{ color: INK_SOFT, lineHeight: 1.5 }}>
            {ctx.sub}
          </p>

          {/* Mini stats strip — only if there's something to celebrate */}
          {(diary.minutes > 0 || diary.streak > 0) && (
            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
              {diary.minutes > 0 && (
                <span
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${SAGE}1A`, color: "#3F6B30" }}
                >
                  <Leaf size={12} strokeWidth={2.6} /> {diary.minutes} min sem tela
                </span>
              )}
              {diary.streak > 0 && (
                <span
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${AMBER}1A`, color: AMBER_DEEP }}
                >
                  <Flame size={12} strokeWidth={2.6} /> {diary.streak} {diary.streak === 1 ? "dia" : "dias"} seguidos
                </span>
              )}
            </div>
          )}

          {/* Prova social — Movimento Menos Tela */}
          <div
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold"
            style={{ color: INK_SOFT }}
          >
            <Users size={13} />
            <span>+12.430 famílias no movimento Menos Tela</span>
          </div>
        </motion.div>


        {/* Cycle toggle */}
        <div
          className="mt-7 p-1 rounded-full flex relative"
          style={{
            background: "#F1EADC",
            border: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          {(["monthly", "annual"] as Cycle[]).map((c) => {
            const active = cycle === c;
            return (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className="flex-1 min-h-[44px] rounded-full text-[14px] font-bold transition-all flex items-center justify-center gap-2"
                style={{
                  background: active ? "#FFFFFF" : "transparent",
                  color: active ? INK : INK_SOFT,
                  boxShadow: active ? "0 2px 10px rgba(42,42,42,0.08)" : "none",
                }}
              >
                {c === "monthly" ? "Mensal" : "Anual"}
                {c === "annual" && (
                  <span
                    className="text-[10px] font-black px-2 py-[2px] rounded-full"
                    style={{
                      background: active ? `${SAGE}22` : `${SAGE}33`,
                      color: "#4A7A38",
                    }}
                  >
                    2 meses grátis
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Plan cards */}
        <div className="mt-7 space-y-4">
          {/* Kidzz */}
          <PlanCard
            label="O DIA A DIA DA CURIOSIDADE"
            name="Kidzz"
            price={priceParts("kidzz")}
            description="Perguntas à vontade · Histórias à vontade com voz · Floresta Musical · Todos os jogos Kidzz Play · Memórias"
            selected={selected === "kidzz"}
            onClick={() => setSelected("kidzz")}
            accent={SAGE}
          />

          {/* Premium — hero */}
          <PlanCard
            label="A EXPERIÊNCIA COMPLETA"
            name="Premium"
            price={priceParts("premium")}
            description="Tudo do Kidzz + Mundo dos Sonhos · Rotina e Momentos · KALM completo · SOS Emocional · Cinema · Relatório para os pais"
            selected={selected === "premium"}
            onClick={() => setSelected("premium")}
            accent={AMBER}
            recommended
          />
        </div>

        {/* CTA */}
        <motion.button
          onClick={onSubscribe}
          disabled={loading}
          className="mt-7 w-full min-h-[58px] rounded-2xl font-extrabold text-[17px] flex items-center justify-center gap-2 disabled:opacity-60 transition-transform"
          whileTap={{ scale: 0.98 }}
          style={{
            background: `linear-gradient(180deg, ${AMBER} 0%, ${AMBER_DEEP} 100%)`,
            color: "#FFFFFF",
            boxShadow: `0 12px 28px -10px ${AMBER}99, inset 0 1px 0 rgba(255,255,255,0.25)`,
            letterSpacing: "-0.01em",
          }}
        >
          <Sparkles size={18} />
          {loading
            ? "Abrindo checkout..."
            : user
              ? "Começar 7 dias grátis"
              : "Criar conta e começar grátis"}
          <span aria-hidden>✨</span>
        </motion.button>

        <div
          className="mt-4 flex items-center justify-center gap-2 text-[12px]"
          style={{ color: INK_SOFT }}
        >
          <Lock size={13} />
          <span>7 dias grátis · Cancele a qualquer momento</span>
        </div>
        <p
          className="text-[12px] text-center mt-1"
          style={{ color: INK_SOFT }}
        >
          Sem cobrança nos primeiros 7 dias. Você decide se continua.
        </p>


        {/* Comparativo */}
        <div
          className="mt-8 rounded-3xl p-5"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 8px 24px -16px rgba(42,42,42,0.18)",
          }}
        >
          <p
            className="text-[13px] font-extrabold text-center mb-4"
            style={{ color: INK, letterSpacing: "0.02em" }}
          >
            O QUE MUDA EM CADA PLANO
          </p>

          <div
            className="grid gap-2 pb-3 mb-1 text-[11px] font-black uppercase tracking-wider"
            style={{ gridTemplateColumns: "1.3fr 1fr 1fr 1fr", color: INK_SOFT }}
          >
            <div></div>
            <div className="text-center">Grátis</div>
            <div className="text-center" style={{ color: "#4A7A38" }}>Kidzz</div>
            <div className="text-center" style={{ color: AMBER_DEEP }}>Premium</div>
          </div>

          {FEATURES.map((f, i) => (
            <div
              key={f.row}
              className="grid gap-2 py-3 text-[13px] items-center"
              style={{
                gridTemplateColumns: "1.3fr 1fr 1fr 1fr",
                borderTop: i === 0 ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(0,0,0,0.04)",
              }}
            >
              <div className="font-semibold" style={{ color: INK }}>{f.row}</div>
              <div className="text-center" style={{ color: INK_SOFT }}>{f.free}</div>
              <div className="text-center font-medium" style={{ color: INK }}>{f.kidzz}</div>
              <div
                className="text-center font-bold"
                style={{ color: INK, background: `${AMBER}0D`, borderRadius: 8, padding: "4px 2px" }}
              >
                {f.premium}
              </div>
            </div>
          ))}
        </div>

        <p
          className="text-center text-[11px] mt-6"
          style={{ color: INK_SOFT }}
        >
          Renovação automática · Cancele a qualquer momento nas configurações.
        </p>
      </div>
    </div>
  );
};

// --- Plan card ---
interface PlanCardProps {
  label: string;
  name: string;
  price: { big: string; small: string; hint?: string };
  description: string;
  selected: boolean;
  onClick: () => void;
  accent: string;
  recommended?: boolean;
}

const PlanCard = ({
  label, name, price, description, selected, onClick, accent, recommended,
}: PlanCardProps) => {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className="w-full text-left rounded-3xl relative transition-all"
      style={{
        padding: recommended ? "22px 20px 20px" : "20px",
        background: "#FFFFFF",
        border: selected
          ? `2px solid ${accent}`
          : "1.5px solid rgba(0,0,0,0.07)",
        boxShadow: recommended
          ? `0 18px 40px -22px ${accent}88, 0 2px 0 rgba(255,255,255,0.6) inset`
          : selected
          ? `0 10px 26px -18px ${accent}66`
          : "0 4px 14px -10px rgba(42,42,42,0.15)",
      }}
    >
      {recommended && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-[6px] rounded-full whitespace-nowrap"
          style={{
            background: `linear-gradient(180deg, ${GOLD} 0%, ${accent} 100%)`,
            color: "#FFFFFF",
            letterSpacing: "0.08em",
            boxShadow: `0 8px 18px -8px ${accent}AA`,
          }}
        >
          ⭐ RECOMENDADO
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] font-black tracking-[0.1em]"
            style={{ color: accent }}
          >
            {label}
          </p>
          <p
            className="text-[22px] font-extrabold mt-1"
            style={{ color: INK, letterSpacing: "-0.01em" }}
          >
            {name}
          </p>
        </div>

        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1"
          style={{
            background: selected ? accent : "#FFFFFF",
            border: selected ? `2px solid ${accent}` : "1.5px solid rgba(0,0,0,0.18)",
          }}
        >
          {selected && <Check size={14} strokeWidth={3} color="#FFFFFF" />}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
        <span
          className="text-[28px] font-black leading-none"
          style={{ color: INK, letterSpacing: "-0.02em" }}
        >
          {price.big}
        </span>
        <span className="text-[14px] font-bold" style={{ color: INK_SOFT }}>
          {price.small}
        </span>
        {price.hint && (
          <span
            className="text-[11px] font-bold ml-1 px-2 py-[2px] rounded-full"
            style={{ background: `${SAGE}22`, color: "#4A7A38" }}
          >
            {price.hint}
          </span>
        )}
      </div>

      <p
        className="text-[13px] mt-3 leading-relaxed"
        style={{ color: INK_SOFT }}
      >
        {description}
      </p>
    </motion.button>
  );
};

export default PaywallScreen;

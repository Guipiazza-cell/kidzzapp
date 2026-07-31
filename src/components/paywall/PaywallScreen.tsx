import { useMemo, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Lock, X, Leaf, Flame } from "lucide-react";
import { useAuth, type CheckoutPlan } from "@/contexts/AuthContext";
import ParentalGate from "@/components/ParentalGate";
import { FONT, SERIF, R } from "@/lib/premiumUi";

export type PaywallContextKind =
  | "default"
  | "premium_locked"
  | "surprise_limit"
  | "streak_milestone"
  | "after_completion";

interface PaywallScreenProps {
  childName?: string;
  onClose?: () => void;
  context?: PaywallContextKind;
}

type Cycle = "monthly" | "annual";

const AMBER = "#E8821A";
const AMBER_DEEP = "#C96B0E";
const SAGE = "#5CB57A";
const INK = "#1A2818";
const INK_SOFT = "rgba(40,55,35,.58)";
const BG = "/exemplos/assets/perguntas-v2/bg-floresta.png";

const dockGlass: CSSProperties = {
  background:
    "linear-gradient(165deg, rgba(255,255,255,.52) 0%, rgba(255,255,255,.28) 48%, rgba(255,255,255,.2) 100%)",
  border: "0.5px solid rgba(255,255,255,.65)",
  boxShadow:
    "0 14px 40px rgba(20,16,30,.14), 0 2px 8px rgba(20,16,30,.05), inset 0 1px 0 rgba(255,255,255,.8), inset 0 -1px 0 rgba(255,255,255,.1)",
  backdropFilter: "blur(36px) saturate(200%)",
  WebkitBackdropFilter: "blur(36px) saturate(200%)",
};

const dockCard: CSSProperties = {
  ...dockGlass,
  borderRadius: 26,
};

const FEATURES: Array<{ row: string; free: string; kidzz: string; premium: string }> = [
  { row: "Perguntas", free: "Algumas", kidzz: "À vontade", premium: "À vontade" },
  { row: "Histórias com voz", free: "1/dia", kidzz: "À vontade", premium: "À vontade" },
  { row: "Música e jogos", free: "Não", kidzz: "Sim", premium: "Sim" },
  { row: "Memórias", free: "Não", kidzz: "Sim", premium: "Sim" },
  { row: "Sonhos e rotina", free: "Não", kidzz: "Não", premium: "Sim" },
  { row: "KALM + SOS", free: "Amostra", kidzz: "Não", premium: "Sim" },
  { row: "Cinema", free: "Amostra", kidzz: "—", premium: "Sim" },
];

const PaywallScreen = ({ childName, onClose, context = "default" }: PaywallScreenProps) => {
  const { handleCheckout, user } = useAuth();
  const [cycle, setCycle] = useState<Cycle>("annual");
  const [selected, setSelected] = useState<"kidzz" | "premium">("premium");
  const [loading, setLoading] = useState(false);
  const [showParentalGate, setShowParentalGate] = useState(false);

  const planKey: CheckoutPlan =
    selected === "kidzz"
      ? cycle === "annual"
        ? "kidzz_annual"
        : "kidzz"
      : cycle === "annual"
        ? "premium_annual"
        : "premium";

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

  const onSubscribe = () => {
    if (loading) return;
    // Compra de adulto: gate parental antes do Stripe
    setShowParentalGate(true);
  };

  const runCheckout = async () => {
    setShowParentalGate(false);
    setLoading(true);
    try {
      // handleCheckout abre o Stripe (logado) ou manda pro /auth
      await handleCheckout(planKey);
      // Se for pro auth, fecha o paywall pra não cobrir a tela
      if (!user) onClose?.();
    } catch (e) {
      console.error("[Paywall] checkout failed", e);
      // toast já vem do handleCheckout
    } finally {
      setLoading(false);
    }
  };

  const nome = childName?.trim() || "seu filho";
  const first = nome.split(" ")[0] || nome;

  const diary = useMemo(() => {
    if (typeof window === "undefined") return { minutes: 0, streak: 0, completions: 0 };
    try {
      const raw = window.localStorage.getItem("bora_diary_v1");
      if (raw) {
        const d = JSON.parse(raw);
        return { minutes: d.minutes || 0, streak: d.streak || 0, completions: d.completions || 0 };
      }
    } catch {
      /* noop */
    }
    return { minutes: 0, streak: 0, completions: 0 };
  }, []);

  const ctx = useMemo(() => {
    const hasMinutes = diary.minutes > 0;
    switch (context) {
      case "premium_locked":
        return {
          tag: "Conteúdo Premium",
          headline: `Essa coleção é feita pro ${first} brilhar`,
          sub: hasMinutes
            ? `Vocês já criaram ${diary.minutes} min sem tela. Com o Premium, é ilimitado.`
            : `Atividades feitas só pra ele, ilimitadas no Premium.`,
        };
      case "surprise_limit":
        return {
          tag: "Mais uma surpresa?",
          headline: `A surpresa grátis do dia já saiu`,
          sub: `No Premium o ${first} recebe surpresas ilimitadas, feitas só pra ele.`,
        };
      case "streak_milestone":
        return {
          tag: `${diary.streak} dias sem tela`,
          headline: `Vocês estão construindo um hábito raro`,
          sub: `Continue o ritmo com o Premium: atividades ilimitadas e diário completo.`,
        };
      case "after_completion":
        return {
          tag: "Curtiu a brincadeira?",
          headline: `Sentiu o valor. Agora destrava o Kidzz inteiro.`,
          sub: hasMinutes
            ? `${diary.minutes} min sem tela com a gente. No Premium, é só o começo.`
            : `Atividades ilimitadas, personalizadas pro ${first}.`,
        };
      default:
        return {
          tag: "",
          headline: `Escolha como o Kidzz vai cuidar do ${first}`,
          sub: hasMinutes
            ? `Vocês já criaram ${diary.minutes} min sem tela. Com o Premium, é ilimitado.`
            : `Comece grátis. Cancele quando quiser. Sem letras miúdas.`,
        };
    }
  }, [context, diary, first]);

  const selectedPrice = priceParts(selected);

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden relative"
      style={{
        fontFamily: FONT,
        color: INK,
      }}
    >
      {/* Fundo floresta */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <img
          src={BG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 30%", filter: "saturate(1.05) brightness(1.04)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(255,236,180,.42) 0%, transparent 55%)," +
              "linear-gradient(180deg, rgba(255,252,248,.5) 0%, rgba(250,246,236,.72) 40%, rgba(245,242,230,.92) 100%)",
          }}
        />
      </div>

      {/* Header */}
      <div
        className="relative z-20 flex items-center gap-2 px-4"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 8px), 12px)",
          paddingBottom: 8,
        }}
      >
        <div className="flex-1" />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="active:scale-95 flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              color: INK,
              ...dockGlass,
            }}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Conteúdo scrollável */}
      <div
        className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingBottom: 8,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-1 pb-1 max-w-md mx-auto"
        >
          {ctx.tag ? (
            <span
              className="inline-flex items-center gap-1.5 text-[10.5px] font-black tracking-[0.12em] uppercase px-3 py-1.5 rounded-full mb-3"
              style={{
                ...dockGlass,
                borderRadius: 999,
                color: AMBER_DEEP,
              }}
            >
              {ctx.tag}
            </span>
          ) : null}
          <h1
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 24,
              lineHeight: 1.18,
              letterSpacing: "-0.3px",
              color: INK,
              textShadow: "0 1px 12px rgba(255,255,255,.5)",
            }}
          >
            {ctx.headline}
          </h1>
          <p
            style={{
              margin: "10px auto 0",
              maxWidth: 320,
              fontSize: 13.5,
              fontWeight: 700,
              lineHeight: 1.45,
              color: INK_SOFT,
            }}
          >
            {ctx.sub}
          </p>

          {(diary.minutes > 0 || diary.streak > 0) && (
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              {diary.minutes > 0 && (
                <span
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1 rounded-full"
                  style={{ ...dockGlass, borderRadius: 999, color: "#3F6B30" }}
                >
                  <Leaf size={12} strokeWidth={2.6} /> {diary.minutes} min sem tela
                </span>
              )}
              {diary.streak > 0 && (
                <span
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1 rounded-full"
                  style={{ ...dockGlass, borderRadius: 999, color: AMBER_DEEP }}
                >
                  <Flame size={12} strokeWidth={2.6} /> {diary.streak}{" "}
                  {diary.streak === 1 ? "dia" : "dias"}
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Toggle ciclo */}
        <div
          className="mt-5 p-1 flex relative max-w-md mx-auto"
          style={{ ...dockCard, borderRadius: 999, padding: 4 }}
        >
          {(["monthly", "annual"] as Cycle[]).map((c) => {
            const active = cycle === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                className="flex-1 min-h-[44px] rounded-full text-[14px] font-bold transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: active
                    ? "linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.8))"
                    : "transparent",
                  color: active ? INK : INK_SOFT,
                  boxShadow: active ? "0 4px 14px rgba(40,30,20,.1)" : "none",
                  border: active ? "0.5px solid rgba(255,255,255,.9)" : "0.5px solid transparent",
                }}
              >
                {c === "monthly" ? "Mensal" : "Anual"}
                {c === "annual" && (
                  <span
                    className="text-[10px] font-black px-2 py-[2px] rounded-full"
                    style={{
                      background: active ? "rgba(92,181,122,.2)" : "rgba(92,181,122,.15)",
                      color: "#3F7A38",
                    }}
                  >
                    2 meses grátis
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Planos */}
        <div className="mt-5 space-y-3 max-w-md mx-auto">
          <PlanCard
            label="O DIA A DIA DA CURIOSIDADE"
            name="Kidzz"
            price={priceParts("kidzz")}
            bullets={["Perguntas à vontade", "Histórias com voz", "Música e jogos", "Memórias"]}
            selected={selected === "kidzz"}
            onClick={() => setSelected("kidzz")}
            accent={SAGE}
          />
          <PlanCard
            label="A EXPERIÊNCIA COMPLETA"
            name="Premium"
            price={priceParts("premium")}
            bullets={[
              "Tudo do Kidzz",
              "Sonhos e rotina",
              "KALM + SOS",
              "Cinema e relatório dos pais",
            ]}
            selected={selected === "premium"}
            onClick={() => setSelected("premium")}
            accent={AMBER}
            recommended
          />
        </div>

        {/* Comparativo compacto */}
        <div
          className="mt-6 max-w-md mx-auto"
          style={{ ...dockCard, padding: "16px 14px 12px" }}
        >
          <p
            style={{
              margin: "0 0 12px",
              textAlign: "center",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.06em",
              color: INK,
            }}
          >
            O QUE MUDA EM CADA PLANO
          </p>
          <div
            className="grid gap-1 pb-2 text-[10px] font-black uppercase tracking-wider"
            style={{ gridTemplateColumns: "1.4fr 0.9fr 0.9fr 1fr", color: INK_SOFT }}
          >
            <div />
            <div className="text-center">Grátis</div>
            <div className="text-center" style={{ color: "#3F7A38" }}>
              Kidzz
            </div>
            <div className="text-center" style={{ color: AMBER_DEEP }}>
              Premium
            </div>
          </div>
          {FEATURES.map((f, i) => (
            <div
              key={f.row}
              className="grid gap-1 py-2.5 text-[12.5px] items-center"
              style={{
                gridTemplateColumns: "1.4fr 0.9fr 0.9fr 1fr",
                borderTop: "0.5px solid rgba(40,40,30,.08)",
              }}
            >
              <div className="font-bold" style={{ color: INK }}>
                {f.row}
              </div>
              <div className="text-center font-semibold" style={{ color: INK_SOFT }}>
                {f.free}
              </div>
              <div className="text-center font-bold" style={{ color: INK }}>
                {f.kidzz}
              </div>
              <div
                className="text-center font-extrabold rounded-lg py-0.5"
                style={{ color: INK, background: "rgba(232,130,26,.1)" }}
              >
                {f.premium}
              </div>
            </div>
          ))}
        </div>

        <p
          className="text-center text-[11px] mt-5 mb-2 max-w-md mx-auto"
          style={{ color: INK_SOFT, fontWeight: 700 }}
        >
          Renovação automática. Cancele a qualquer momento nas configurações.
        </p>

        {/* Espaço pro CTA fixo */}
        <div style={{ height: 120 }} />
      </div>

      {/* CTA FIXO - sempre visível e clicável */}
      <div
        className="relative z-30"
        style={{
          flexShrink: 0,
          padding: "10px 16px calc(env(safe-area-inset-bottom, 0px) + 14px)",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(248,244,230,.85) 22%, rgba(248,244,230,.97) 100%)",
        }}
      >
        <div className="max-w-md mx-auto">
          <div
            className="mb-2 flex items-center justify-between px-1"
            style={{ fontSize: 12, fontWeight: 800, color: INK_SOFT }}
          >
            <span>
              Plano {selected === "premium" ? "Premium" : "Kidzz"} ·{" "}
              {cycle === "annual" ? "Anual" : "Mensal"}
            </span>
            <span style={{ color: INK, fontWeight: 900 }}>
              {selectedPrice.big}
              {selectedPrice.small}
            </span>
          </div>
          <motion.button
            type="button"
            onClick={onSubscribe}
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
            style={{
              minHeight: 54,
              borderRadius: R.btn,
              fontWeight: 900,
              fontSize: 16,
              color: "#2A1608",
              border: "0.5px solid rgba(255,235,190,.75)",
              background: "linear-gradient(180deg, #FBE09A 0%, #E8A838 48%, #C87818 100%)",
              boxShadow:
                "0 12px 28px rgba(180,100,20,.38), 0 1px 0 rgba(255,250,230,.9) inset, 0 -3px 8px rgba(100,50,0,.16) inset",
              cursor: loading ? "wait" : "pointer",
              fontFamily: FONT,
            }}
          >
            <Sparkles size={18} />
            {loading
              ? "Abrindo pagamento..."
              : user
                ? "Começar 7 dias grátis"
                : "Criar conta e começar grátis"}
          </motion.button>
          <div
            className="mt-2 flex items-center justify-center gap-1.5 text-[11.5px] font-bold"
            style={{ color: INK_SOFT }}
          >
            <Lock size={12} />
            7 dias grátis · Cancele quando quiser
          </div>
        </div>
      </div>

      {showParentalGate && (
        <ParentalGate onSuccess={runCheckout} onCancel={() => setShowParentalGate(false)} />
      )}
    </div>
  );
};

interface PlanCardProps {
  label: string;
  name: string;
  price: { big: string; small: string; hint?: string };
  bullets: string[];
  selected: boolean;
  onClick: () => void;
  accent: string;
  recommended?: boolean;
}

const PlanCard = ({
  label,
  name,
  price,
  bullets,
  selected,
  onClick,
  accent,
  recommended,
}: PlanCardProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className="w-full text-left relative transition-all"
      style={{
        ...dockCard,
        padding: recommended ? "18px 16px 16px" : "16px",
        border: selected ? `1.5px solid ${accent}` : dockGlass.border,
        boxShadow: selected
          ? `0 14px 36px rgba(20,16,30,.16), 0 0 0 1px ${accent}55, inset 0 1px 0 rgba(255,255,255,.8)`
          : dockGlass.boxShadow,
      }}
    >
      {recommended && (
        <span
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap"
          style={{
            background: `linear-gradient(180deg, #F0C24E 0%, ${accent} 100%)`,
            color: "#fff",
            letterSpacing: "0.06em",
            boxShadow: `0 6px 14px ${accent}66`,
          }}
        >
          RECOMENDADO
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black tracking-[0.1em]" style={{ color: accent }}>
            {label}
          </p>
          <p
            className="text-[22px] font-extrabold mt-0.5"
            style={{ color: INK, letterSpacing: "-0.02em", fontFamily: SERIF, fontWeight: 600 }}
          >
            {name}
          </p>
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1"
          style={{
            background: selected ? accent : "rgba(255,255,255,.5)",
            border: selected ? `2px solid ${accent}` : "1.5px solid rgba(40,40,30,.18)",
            boxShadow: selected ? `0 4px 10px ${accent}55` : "none",
          }}
        >
          {selected && <Check size={15} strokeWidth={3} color="#fff" />}
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5 flex-wrap">
        <span
          className="text-[26px] font-black leading-none"
          style={{ color: INK, letterSpacing: "-0.02em" }}
        >
          {price.big}
        </span>
        <span className="text-[13px] font-bold" style={{ color: INK_SOFT }}>
          {price.small}
        </span>
        {price.hint ? (
          <span
            className="text-[11px] font-bold ml-0.5 px-2 py-[2px] rounded-full"
            style={{ background: "rgba(92,181,122,.18)", color: "#3F7A38" }}
          >
            {price.hint}
          </span>
        ) : null}
      </div>

      <ul className="mt-3 space-y-1.5" style={{ margin: "12px 0 0", padding: 0, listStyle: "none" }}>
        {bullets.map((b) => (
          <li
            key={b}
            className="flex items-center gap-2 text-[12.5px] font-bold"
            style={{ color: "rgba(26,40,24,.72)" }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${accent}22`,
                flexShrink: 0,
              }}
            >
              <Check size={11} strokeWidth={3} color={accent} />
            </span>
            {b}
          </li>
        ))}
      </ul>
    </motion.button>
  );
};

export default PaywallScreen;

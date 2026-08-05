import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlan, openBillingPortal } from "@/hooks/usePlan";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";

const PLAN_LABEL: Record<string, string> = {
  free: "Gratuito",
  kidzz: "Kidzz",
  premium: "Kidzz Premium",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Ativa",
  trialing: "Em período de teste",
  past_due: "Pagamento em atraso",
  canceled: "Cancelada",
  unpaid: "Não paga",
  incomplete: "Pendente",
  inactive: "Sem assinatura",
};

const fmt = (d: Date | null) =>
  d ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const MinhaAssinatura = () => {
  const navigate = useNavigate();
  const { plan, status, inGrace, currentPeriodEnd, isPaid, loading } = usePlan();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const daysLeft =
    status === "trialing" && currentPeriodEnd
      ? Math.max(0, Math.ceil((currentPeriodEnd.getTime() - Date.now()) / 86400000))
      : null;

  const openPortal = async () => {
    setBusy(true);
    setErr(null);
    const url = await openBillingPortal();
    setBusy(false);
    if (url) window.location.href = url;
    else setErr("Não foi possível abrir o portal agora. Tente novamente em instantes.");
  };

  return (
    <main className="min-h-screen px-4 pb-16" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}>
      <button
        onClick={() => navigate(-1)}
        className="min-h-[44px] min-w-[44px] flex items-center gap-2 text-[16px] font-semibold text-gray-800"
      >
        <ArrowLeft className="w-5 h-5" aria-hidden /> Voltar
      </button>

      <h1 className="mt-3 text-[24px] font-extrabold text-gray-900">Minha assinatura</h1>

      <section className="mt-5 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-5">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-700 text-[16px]">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> Carregando…
          </div>
        ) : (
          <dl className="space-y-4 text-[16px]">
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">Plano atual</dt>
              <dd className="font-bold text-gray-900">{PLAN_LABEL[plan] ?? plan}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">Situação</dt>
              <dd className="font-bold text-gray-900">{STATUS_LABEL[status] ?? status}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600">
                {status === "canceled" ? "Acesso até" : "Próxima cobrança"}
              </dt>
              <dd className="font-bold text-gray-900">{fmt(currentPeriodEnd)}</dd>
            </div>
            {daysLeft !== null && (
              <div className="flex justify-between gap-3">
                <dt className="text-gray-600">Dias restantes do teste</dt>
                <dd className="font-bold text-gray-900">{daysLeft}</dd>
              </div>
            )}
          </dl>
        )}

        {inGrace && (
          <p className="mt-4 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 p-3 text-[15px] leading-snug">
            A última cobrança falhou. Atualize seu cartão no portal para manter o acesso.
          </p>
        )}

        {!loading && !isPaid && (
          <p className="mt-4 text-[15px] text-gray-700 leading-snug">
            Você está no plano gratuito. Assine para liberar todas as abas do Kidzz.
          </p>
        )}

        <button
          onClick={openPortal}
          disabled={busy}
          className="mt-5 w-full min-h-[48px] rounded-2xl bg-gray-900 text-white font-bold text-[16px] flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> : <CreditCard className="w-5 h-5" aria-hidden />}
          Gerenciar pagamento e cancelar
        </button>
        {err && <p className="mt-3 text-[15px] text-red-700">{err}</p>}

        <p className="mt-4 text-[14px] text-gray-600 leading-snug">
          Precisa de reembolso? Escreva para{" "}
          <a className="underline font-semibold" href="mailto:kidzz.ia@icloud.com">
            kidzz.ia@icloud.com
          </a>{" "}
          e devolvemos o valor. O acesso cai assim que o estorno é feito.
        </p>
      </section>
    </main>
  );
};

export default MinhaAssinatura;

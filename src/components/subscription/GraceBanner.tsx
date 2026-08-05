import { useState } from "react";
import { usePlan, openBillingPortal } from "@/hooks/usePlan";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * Aviso NÃO-bloqueante de cobrança em atraso (período de carência).
 * Só aparece quando get_effective_plan devolve in_grace = true.
 */
const GraceBanner = () => {
  const { inGrace } = usePlan();
  const [busy, setBusy] = useState(false);

  if (!inGrace) return null;

  const open = async () => {
    setBusy(true);
    const url = await openBillingPortal();
    setBusy(false);
    if (url) window.location.href = url;
  };

  return (
    <div
      role="status"
      className="fixed top-0 inset-x-0 z-[70] px-3 pt-[env(safe-area-inset-top)]"
    >
      <div className="mx-auto max-w-md mt-2 rounded-2xl bg-amber-100/95 border border-amber-300 shadow-lg px-4 py-3 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" aria-hidden />
        <p className="text-[15px] leading-snug text-amber-900 flex-1">
          Não conseguimos cobrar seu cartão. Atualize os dados para não perder o acesso.
        </p>
        <button
          onClick={open}
          disabled={busy}
          className="min-h-[44px] px-3 rounded-xl bg-amber-700 text-amber-50 text-[15px] font-semibold"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Atualizar"}
        </button>
      </div>
    </div>
  );
};

export default GraceBanner;

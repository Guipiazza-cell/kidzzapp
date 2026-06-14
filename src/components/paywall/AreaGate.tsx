import type { ReactNode } from "react";
import { useEntitlement } from "@/hooks/useEntitlement";
import { usePaywall } from "./PaywallProvider";
import LockedCard from "./LockedCard";
import type { Area } from "@/lib/plans";

interface AreaGateProps {
  area: Area;
  children: ReactNode;
  /** Conteúdo de amostra mostrado para usuários free quando accessLevel = 'sample'. */
  sample?: ReactNode;
  /** Quando true, ignora 'sample' e usa o conteúdo completo mesmo no nível 'sample' (ex.: telas que já têm amostra inline). */
  fullOnSample?: boolean;
  className?: string;
}

/**
 * Envelope de acesso que cada aba paga deve usar.
 * - full   → renderiza children.
 * - sample → renderiza `sample` se fornecido, senão children (free vê amostra).
 * - locked → renderiza LockedCard centralizado em tela cheia.
 */
const AreaGate = ({ area, children, sample, fullOnSample, className = "" }: AreaGateProps) => {
  const { accessLevel, loading } = useEntitlement();
  const { open } = usePaywall();

  if (loading) return null;
  const level = accessLevel(area);

  if (level === "full") return <>{children}</>;

  if (level === "sample") {
    if (fullOnSample) return <>{children}</>;
    return <>{sample ?? children}</>;
  }

  return (
    <div
      className={`min-h-[60vh] flex items-center justify-center px-5 ${className}`}
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 24px)" }}
    >
      <LockedCard area={area} onUpgrade={open} />
    </div>
  );
};

export default AreaGate;

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { haptic } from "@/lib/haptics";

/**
 * KidzzHeader — header padrão do app (modelo da tela Descobrir).
 * Barra glass sticky com botão voltar à esquerda, marca "KIDZZ" centralizada
 * e, à direita, um slot opcional (ações funcionais como Pais/galeria) ou spacer.
 * Usado em todas as telas, exceto Perguntas (home).
 */
const INK = "#2A2520";
const SAGE_DEEP = "#46703A";

interface Props {
  onBack?: () => void;
  /** Ações à direita (ex: Pais, galeria). Se ausente, mantém spacer p/ centralizar a marca. */
  right?: ReactNode;
}

const KidzzHeader = ({ onBack, right }: Props) => {
  return (
    <div
      className="sticky top-0 z-30"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)",
        paddingLeft: 14,
        paddingRight: 14,
        paddingBottom: 10,
        background: "rgba(255,252,248,0.55)",
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        borderBottom: "1px solid rgba(42,37,32,0.06)",
        boxShadow: "0 8px 32px rgba(42,37,32,0.06)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => { haptic("light"); onBack?.(); }}
          aria-label="Voltar"
          className="active:scale-95"
          style={{
            width: 44, height: 44, borderRadius: 999,
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(42,37,32,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(42,37,32,0.08)",
          }}
        >
          <ArrowLeft size={20} color={INK} strokeWidth={2.2} />
        </button>
        <div className="flex flex-col items-center leading-tight">
          <span
            style={{
              fontFamily: "'Nunito', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: "0.04em",
              color: SAGE_DEEP,
            }}
          >
            KIDZZ
          </span>
          <span
            style={{
              fontFamily: "'Nunito', system-ui, sans-serif",
              fontSize: 9.5,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#7d6e5b",
              marginTop: -2,
            }}
          >
            Menos tela. Mais memórias.
          </span>
        </div>
        {/* Ações à direita ou spacer p/ manter a marca centralizada */}
        {right ? (
          <div className="flex items-center justify-end gap-2" style={{ minWidth: 44, minHeight: 44 }}>
            {right}
          </div>
        ) : (
          <div aria-hidden style={{ width: 44, height: 44 }} />
        )}
      </div>
    </div>
  );
};

export default KidzzHeader;

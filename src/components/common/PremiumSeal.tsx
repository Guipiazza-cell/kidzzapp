/**
 * Selo PREMIUM único do app (padrão relatório design).
 * Dourado com cadeado — o único sinal de conteúdo pago.
 */
import type { CSSProperties } from "react";

type Props = {
  size?: "sm" | "md";
  className?: string;
  style?: CSSProperties;
  /** Só o cadeado dourado, sem texto (espaços apertados) */
  iconOnly?: boolean;
};

const base: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  borderRadius: 999,
  background: "radial-gradient(130% 130% at 30% 22%, #FFF3C4 0%, #F2C55C 45%, #C98F1E 100%)",
  color: "#4A3300",
  fontWeight: 900,
  letterSpacing: ".45px",
  boxShadow: "0 3px 8px rgba(150,95,10,.4), inset 0 1px 0 rgba(255,255,255,.7)",
  border: "0.5px solid rgba(255,255,255,.55)",
  fontFamily: "'Nunito', system-ui, sans-serif",
  flex: "none",
};

const Lock = ({ s = 10 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"
      stroke="#4A3300"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PremiumSeal = ({ size = "sm", className, style, iconOnly }: Props) => {
  const pad = size === "md" ? "5px 11px" : "3px 9px";
  const fs = size === "md" ? 10 : 9;
  const lock = size === "md" ? 11 : 9;
  if (iconOnly) {
    return (
      <span
        className={className}
        aria-label="Premium"
        style={{
          ...base,
          width: size === "md" ? 28 : 24,
          height: size === "md" ? 28 : 24,
          padding: 0,
          justifyContent: "center",
          ...style,
        }}
      >
        <Lock s={lock} />
      </span>
    );
  }
  return (
    <span className={className} style={{ ...base, padding: pad, fontSize: fs, ...style }}>
      <Lock s={lock} />
      PREMIUM
    </span>
  );
};

export default PremiumSeal;

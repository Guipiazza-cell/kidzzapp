import { Component, type CSSProperties, type ReactNode } from "react";
import { CAMALEAO } from "@/lib/camaleaoOficial";
import { FONT, SERIF, R, goldBtn, glassLight, pillGlassLight } from "@/lib/premiumUi";

interface Props {
  children: ReactNode;
  /** Tab id - when it changes, boundary auto-resets (so switching away + back recovers). */
  resetKey?: string;
  /** Called when user taps "voltar". Should send them to the safe Home tab. */
  onBack?: () => void;
  label?: string;
}

interface State {
  hasError: boolean;
  error?: string;
}

const PAGE: CSSProperties = {
  minHeight: "60vh",
  height: "100%",
  width: "100%",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "28px 20px 40px",
  boxSizing: "border-box",
  overflow: "hidden",
  fontFamily: FONT,
  background:
    "radial-gradient(120% 80% at 50% 0%, #FFF6E0 0%, #F3E4C4 42%, #E8F0E4 100%)",
};

const CARD: CSSProperties = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  maxWidth: 340,
  borderRadius: 28,
  padding: "28px 22px 22px",
  textAlign: "center",
  ...glassLight,
  boxShadow:
    "0 22px 48px rgba(90,70,30,.16), 0 1px 0 rgba(255,255,255,.85) inset, 0 -8px 20px rgba(120,90,40,.06) inset",
  border: "1px solid rgba(255,255,255,.72)",
};

const SECONDARY_BTN: CSSProperties = {
  ...pillGlassLight,
  minHeight: 48,
  padding: "0 18px",
  borderRadius: R.btn,
  fontFamily: FONT,
  fontWeight: 800,
  fontSize: 13.5,
  color: "#3A2E14",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
};

/**
 * Lightweight per-tab error boundary. A crash in one tab shows a friendly
 * premium fallback INSIDE the tab — the rest of the app stays alive.
 */
class TabErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error?.message || "Erro desconhecido" };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("KIDZZ_TAB_ERROR:", error?.message, error?.stack, errorInfo);
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  private retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const label = this.props.label ? ` (${this.props.label})` : "";

    return (
      <div style={PAGE} role="alert" aria-live="assertive">
        {/* fundo decorativo suave */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(50% 40% at 80% 12%, rgba(255,200,100,.35), transparent 70%)," +
              "radial-gradient(45% 35% at 12% 78%, rgba(140,200,120,.22), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -30,
            left: "50%",
            transform: "translateX(-50%)",
            width: 280,
            height: 180,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,230,160,.55), transparent 68%)",
            filter: "blur(8px)",
          }}
        />

        <div style={CARD}>
          <div
            style={{
              width: 112,
              height: 112,
              margin: "0 auto 14px",
              borderRadius: 32,
              overflow: "hidden",
              background:
                "radial-gradient(130% 130% at 30% 20%, #FFF9E8 0%, #F5E2B0 55%, #E8C878 100%)",
              boxShadow:
                "0 14px 28px rgba(140,100,30,.22), 0 1px 0 rgba(255,255,255,.8) inset",
              border: "1.5px solid rgba(255,255,255,.75)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <img
              src={CAMALEAO.armsSoft}
              alt=""
              width={96}
              height={96}
              draggable={false}
              style={{
                width: 96,
                height: 96,
                objectFit: "contain",
                objectPosition: "center",
                display: "block",
                filter: "drop-shadow(0 6px 12px rgba(80,60,20,.18))",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = CAMALEAO.arms;
              }}
            />
          </div>

          <p
            style={{
              margin: "0 0 6px",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "1.1px",
              textTransform: "uppercase",
              color: "#C98F1E",
            }}
          >
            Ops{label}
          </p>
          <h2
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 22,
              lineHeight: 1.2,
              color: "#2A2008",
              letterSpacing: "-0.3px",
            }}
          >
            Essa seção tropeçou
          </h2>
          <p
            style={{
              margin: "10px auto 0",
              maxWidth: 260,
              fontSize: 13.5,
              fontWeight: 700,
              lineHeight: 1.45,
              color: "rgba(58,46,20,.72)",
            }}
          >
            Sem stress — o resto do app continua funcionando. Vamos tentar de novo?
          </p>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
              width: "100%",
            }}
          >
            <button
              type="button"
              onClick={this.retry}
              className="active:scale-[0.97]"
              style={{
                ...goldBtn,
                flex: 1.15,
                minHeight: 48,
                border: "none",
                fontSize: 14,
              }}
            >
              Tentar de novo
            </button>
            {this.props.onBack && (
              <button
                type="button"
                onClick={this.props.onBack}
                className="active:scale-[0.97]"
                style={SECONDARY_BTN}
              >
                Início
              </button>
            )}
          </div>

          {this.state.error && (
            <p
              style={{
                margin: "14px 0 0",
                fontSize: 10,
                fontWeight: 600,
                lineHeight: 1.35,
                color: "rgba(90,80,60,.45)",
                wordBreak: "break-word",
              }}
              title={this.state.error}
            >
              {this.state.error.slice(0, 160)}
            </p>
          )}
        </div>
      </div>
    );
  }
}

export default TabErrorBoundary;

import { Component, type CSSProperties, type ReactNode } from "react";
import { CAMALEAO } from "@/lib/camaleaoOficial";
import { FONT, SERIF, goldBtn, glassLight, R } from "@/lib/premiumUi";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: string;
}

const PAGE: CSSProperties = {
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 20px",
  boxSizing: "border-box",
  fontFamily: FONT,
  background:
    "radial-gradient(120% 80% at 50% 0%, #FFF6E0 0%, #F3E4C4 42%, #E8F0E4 100%)",
  position: "relative",
  overflow: "hidden",
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error?.message || "" };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: "" });
  };

  handleReload = () => {
    try {
      window.location.reload();
    } catch {
      this.handleRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={PAGE} role="alert">
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(50% 40% at 80% 10%, rgba(255,200,100,.35), transparent 70%)",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              maxWidth: 360,
              borderRadius: 28,
              padding: "30px 24px 24px",
              textAlign: "center",
              ...glassLight,
              border: "1px solid rgba(255,255,255,.72)",
              boxShadow: "0 22px 48px rgba(90,70,30,.16)",
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                margin: "0 auto 16px",
                borderRadius: 36,
                overflow: "hidden",
                background:
                  "radial-gradient(130% 130% at 30% 20%, #FFF9E8 0%, #F5E2B0 55%, #E8C878 100%)",
                boxShadow: "0 14px 28px rgba(140,100,30,.22)",
                border: "1.5px solid rgba(255,255,255,.75)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <img
                src={CAMALEAO.armsSoft}
                alt=""
                width={100}
                height={100}
                draggable={false}
                style={{ width: 100, height: 100, objectFit: "contain" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = CAMALEAO.arms;
                }}
              />
            </div>
            <h1
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: 26,
                color: "#2A2008",
                letterSpacing: "-0.3px",
              }}
            >
              Ops! Algo deu errado
            </h1>
            <p
              style={{
                margin: "10px auto 0",
                maxWidth: 280,
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1.45,
                color: "rgba(58,46,20,.72)",
              }}
            >
              Não se preocupe — vamos tentar de novo com carinho.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="active:scale-[0.97]"
              style={{
                ...goldBtn,
                width: "100%",
                marginTop: 22,
                minHeight: 50,
                border: "none",
                fontSize: 15,
              }}
            >
              Tentar novamente
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                marginTop: 12,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 13,
                color: "rgba(58,46,20,.55)",
                minHeight: 44,
                borderRadius: R.btn,
              }}
            >
              Recarregar a página
            </button>
            {this.state.error && (
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "rgba(90,80,60,.4)",
                  wordBreak: "break-word",
                }}
              >
                {this.state.error.slice(0, 160)}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

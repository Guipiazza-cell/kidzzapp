import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Tab id — when it changes, boundary auto-resets (so switching away + back recovers). */
  resetKey?: string;
  /** Called when user taps "voltar". Should send them to the safe Home tab. */
  onBack?: () => void;
  label?: string;
}

interface State {
  hasError: boolean;
  error?: string;
}

/**
 * Lightweight per-tab error boundary. A crash in one tab (e.g. lazy chunk fails,
 * WellnessHub throws) shows a friendly inline fallback INSIDE the tab area —
 * the rest of the app (BottomNav, other tabs, auth) stays alive.
 */
class TabErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("KIDZZ_TAB_ERROR:", error?.message, error?.stack, errorInfo);
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center gap-4">
        <div className="text-5xl" aria-hidden>🦎</div>
        <div>
          <h2 className="text-lg font-extrabold text-foreground">Essa seção tropeçou</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Sem stress — o resto do app continua funcionando.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-yellow text-white font-extrabold text-sm shadow-lg active:scale-95"
          >
            Tentar de novo
          </button>
          {this.props.onBack && (
            <button
              onClick={this.props.onBack}
              className="px-5 py-3 rounded-2xl bg-white/70 backdrop-blur-md text-foreground font-bold text-sm border border-border active:scale-95"
            >
              Voltar ao início
            </button>
          )}
        </div>
        {this.state.error && (
          <p
            className="text-[10px] text-[#B0A89A] px-6 break-words text-center"
            style={{ maxWidth: "100%" }}
          >
            {this.state.error.slice(0, 220)}
          </p>
        )}
      </div>
    );
  }
}

export default TabErrorBoundary;

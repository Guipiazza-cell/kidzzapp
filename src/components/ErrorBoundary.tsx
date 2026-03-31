import { Component, type ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl mb-4"
          >
            🦎
          </motion.div>
          <h1 className="text-2xl font-extrabold text-foreground mb-2">
            Ops! Algo deu errado 😅
          </h1>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            Não se preocupe, vamos tentar de novo!
          </p>
          <motion.button
            onClick={this.handleRetry}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-kid-orange to-kid-yellow text-white font-extrabold text-lg shadow-xl active:scale-95 transition-all"
            whileTap={{ scale: 0.97 }}
          >
            Tentar novamente 🔄
          </motion.button>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Recarregar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

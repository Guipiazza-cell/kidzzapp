import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import SplashScreen from "@/components/SplashScreen";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Success from "./pages/Success";
import Privacy from "./pages/Privacy";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Admin from "./pages/Admin";
import InstallBanner from "./components/InstallBanner";
import OfflineIndicator from "./components/OfflineIndicator";
import KidzzShareTrigger from "./components/viral/KidzzShareTrigger";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isReady } = useAuth();

  // The global SplashScreen handles the initial loading visual.
  // While auth is hydrating we render nothing (splash overlays everything).
  if (!isReady) return null;

  return <>{children}</>;
};

// Module-level flag: ensures splash only shows on the very first app render
// of a session — never on internal navigations, route changes, or re-mounts.
let SPLASH_SHOWN = false;
try {
  if (typeof window !== "undefined" && sessionStorage.getItem("kidzz_splash_shown") === "1") {
    SPLASH_SHOWN = true;
  }
} catch {
  /* sessionStorage may be unavailable (private mode) — fall back to module flag */
}

const AppShell = () => {
  const [splashDone, setSplashDone] = useState(SPLASH_SHOWN);

  const handleSplashFinish = () => {
    SPLASH_SHOWN = true;
    try { sessionStorage.setItem("kidzz_splash_shown", "1"); } catch { /* noop */ }
    setSplashDone(true);
  };

  // Safety net: ensure we never block UI longer than splash duration + fade + buffer.
  useEffect(() => {
    if (splashDone) return;
    const t = setTimeout(handleSplashFinish, 2000);
    return () => clearTimeout(t);
  }, [splashDone]);

  return (
    <>
      {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/index" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/lp" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <InstallBanner />
          <OfflineIndicator />
          <KidzzShareTrigger />
        </AuthProvider>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppShell />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

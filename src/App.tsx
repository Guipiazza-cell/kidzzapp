import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import SplashScreen from "@/components/SplashScreen";
import { lazy, Suspense, useEffect, useState } from "react";
import Index from "./pages/Index";
import MagicalBackground from "@/components/MagicalBackground";
// Rotas secundárias carregam sob demanda — reduz o bundle inicial.
const Auth = lazy(() => import("./pages/Auth"));
const Success = lazy(() => import("./pages/Success"));
const Privacy = lazy(() => import("./pages/Privacy"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Landing = lazy(() => import("./pages/Landing"));
const LandingQuiz = lazy(() => import("./pages/LandingQuiz"));
const Admin = lazy(() => import("./pages/Admin"));
import AppUpdateBanner from "./components/AppUpdateBanner";
import InstallBanner from "./components/InstallBanner";
import OfflineIndicator from "./components/OfflineIndicator";
import KidzzShareTrigger from "./components/viral/KidzzShareTrigger";
import LevelUpOverlay from "./components/flow/LevelUpOverlay";
import { markSeen, markLevelUp } from "@/lib/emotionalState";

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

  // Motor emocional + Page Visibility flag (pausa animações CSS quando aba sai).
  useEffect(() => {
    markSeen();
    const handler = () => markLevelUp();
    window.addEventListener("kidzz:level-up", handler);

    const syncVis = () => {
      document.documentElement.dataset.appHidden = document.hidden ? "true" : "false";
    };
    syncVis();
    document.addEventListener("visibilitychange", syncVis);

    return () => {
      window.removeEventListener("kidzz:level-up", handler);
      document.removeEventListener("visibilitychange", syncVis);
    };
  }, []);

  return (
    <>
      {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
      {/* Background global persistente — nunca remontado entre rotas/abas */}
      <MagicalBackground />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/index" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/lp" element={<LandingQuiz />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <AppUpdateBanner />
          <InstallBanner />
          <OfflineIndicator />
          <KidzzShareTrigger />
          <LevelUpOverlay />
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

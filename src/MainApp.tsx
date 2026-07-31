import { Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { lazy, Suspense, useEffect } from "react";
import CinemaBackground from "@/components/CinemaBackground";
import MagicalBackground from "@/components/MagicalBackground";
import AppUpdateBanner from "./components/AppUpdateBanner";
import InstallBanner from "./components/InstallBanner";
import OfflineIndicator from "./components/OfflineIndicator";
import KidzzShareTrigger from "./components/viral/KidzzShareTrigger";
import LevelUpOverlay from "./components/flow/LevelUpOverlay";
import { PaywallProvider } from "@/components/paywall/PaywallProvider";
import { markSeen, markLevelUp } from "@/lib/emotionalState";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Success = lazy(() => import("./pages/Success"));
const Privacy = lazy(() => import("./pages/Privacy"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Landing = lazy(() => import("./pages/Landing"));
const Admin = lazy(() => import("./pages/Admin"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isReady } = useAuth();
  // Não prender em tela preta se o auth demorar: após o fail-open do Auth
  // isReady vira true. Enquanto isso, null é ok por no máx ~3s.
  if (!isReady) return null;
  return <>{children}</>;
};

const MainApp = () => {
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
      <CinemaBackground />
      <MagicalBackground />
      <AuthProvider>
        <PaywallProvider>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/index" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <AppUpdateBanner />
          <InstallBanner />
          <OfflineIndicator />
          <KidzzShareTrigger />
          <LevelUpOverlay />
        </PaywallProvider>
      </AuthProvider>
    </>
  );
};

export default MainApp;

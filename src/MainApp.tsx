import { Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import SplashScreen from "@/components/SplashScreen";
import { lazy, Suspense, useEffect, useState } from "react";
import CinemaBackground from "@/components/CinemaBackground";
import MagicalBackground from "@/components/MagicalBackground";
import AppUpdateBanner from "./components/AppUpdateBanner";
import InstallBanner from "./components/InstallBanner";
import OfflineIndicator from "./components/OfflineIndicator";
import KidzzShareTrigger from "./components/viral/KidzzShareTrigger";
import LevelUpOverlay from "./components/flow/LevelUpOverlay";
import { markSeen, markLevelUp } from "@/lib/emotionalState";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Success = lazy(() => import("./pages/Success"));
const Privacy = lazy(() => import("./pages/Privacy"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Landing = lazy(() => import("./pages/Landing"));
const Admin = lazy(() => import("./pages/Admin"));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isReady } = useAuth();
  if (!isReady) return null;
  return <>{children}</>;
};

let SPLASH_SHOWN = false;
try {
  if (typeof window !== "undefined" && sessionStorage.getItem("kidzz_splash_shown") === "1") {
    SPLASH_SHOWN = true;
  }
} catch {
}

const MainApp = () => {
  const [splashDone, setSplashDone] = useState(SPLASH_SHOWN);

  const handleSplashFinish = () => {
    SPLASH_SHOWN = true;
    try { sessionStorage.setItem("kidzz_splash_shown", "1"); } catch { }
    setSplashDone(true);
  };

  useEffect(() => {
    if (splashDone) return;
    const t = setTimeout(handleSplashFinish, 2000);
    return () => clearTimeout(t);
  }, [splashDone]);

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
      <CinemaBackground />
      <MagicalBackground />
      <AuthProvider>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <AppUpdateBanner />
        <InstallBanner />
        <OfflineIndicator />
        <KidzzShareTrigger />
        <LevelUpOverlay />
      </AuthProvider>
    </>
  );
};

export default MainApp;

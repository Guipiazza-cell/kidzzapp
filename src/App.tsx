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
import InstallPrompt from "./components/InstallPrompt";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-5xl animate-bounce">🦎</div>
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
            <InstallPrompt />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

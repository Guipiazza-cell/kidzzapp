import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";
import { haptic } from "@/lib/haptics";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const SESSIONS_KEY = "kidzz_pwa_sessions";
const DISMISS_UNTIL_KEY = "kidzz_pwa_install_dismissed_until";
const SESSION_FLAG = "kidzz_pwa_session_counted";
const SESSIONS_TO_SHOW = 3;
const DISMISS_DAYS = 7;

const InstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosMode, setIosMode] = useState(false);

  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true);

  // Count sessions (once per tab session)
  useEffect(() => {
    if (isStandalone) return;
    try {
      if (!sessionStorage.getItem(SESSION_FLAG)) {
        const current = Number(localStorage.getItem(SESSIONS_KEY) || "0") + 1;
        localStorage.setItem(SESSIONS_KEY, String(current));
        sessionStorage.setItem(SESSION_FLAG, "1");
      }
    } catch { /* noop */ }
  }, [isStandalone]);

  useEffect(() => {
    if (isStandalone) return;

    const dismissUntil = Number(localStorage.getItem(DISMISS_UNTIL_KEY) || "0");
    if (dismissUntil && Date.now() < dismissUntil) return;

    const sessions = Number(localStorage.getItem(SESSIONS_KEY) || "0");
    if (sessions < SESSIONS_TO_SHOW) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS doesn't fire beforeinstallprompt — show iOS instructions directly
    if (isIOS) {
      const t = setTimeout(() => {
        setIosMode(true);
        setShow(true);
      }, 1500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isStandalone, isIOS]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    haptic("medium");
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      haptic("success");
    }
    setDeferredPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    haptic("light");
    setShow(false);
    try {
      localStorage.setItem(
        DISMISS_UNTIL_KEY,
        String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000)
      );
    } catch { /* noop */ }
  };

  if (!show || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="relative bg-card border border-border rounded-2xl p-4 shadow-2xl max-w-md mx-auto">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-3 pr-6">
          <img src="/icon-192.png" alt="Kidzz" className="w-12 h-12 rounded-xl shadow-md" />
          <div>
            <p className="font-bold text-foreground text-sm">
              Adicione o Kidzz à tela inicial 📱
            </p>
            <p className="text-xs text-muted-foreground">
              Para uma experiência ainda melhor!
            </p>
          </div>
        </div>

        {deferredPrompt && !iosMode ? (
          <button
            onClick={handleInstall}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform"
          >
            <Download size={16} /> Adicionar
          </button>
        ) : (
          <div className="text-xs text-muted-foreground space-y-2">
            <p className="flex items-center gap-1.5">
              1. Toque em <Share size={14} className="text-primary" /> <strong>Compartilhar</strong>
            </p>
            <p>2. Role e toque em <strong>"Adicionar à Tela de Início"</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallBanner;

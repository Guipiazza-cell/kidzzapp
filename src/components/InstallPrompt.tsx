import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches
    || (navigator as any).standalone === true;

  useEffect(() => {
    if (isInStandaloneMode) return;

    const wasDismissed = sessionStorage.getItem("pwa-install-dismissed");
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    if (isIOS) {
      const timer = setTimeout(() => setShowIOSPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isInStandaloneMode, isIOS]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
    handleDismiss();
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowIOSPrompt(false);
    setDeferredPrompt(null);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  if (dismissed || isInStandaloneMode) return null;
  if (!deferredPrompt && !showIOSPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl max-w-md mx-auto">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <img src="/icon-192.png" alt="Kidzz" className="w-12 h-12 rounded-xl" />
          <div>
            <p className="font-bold text-foreground text-sm">Instale o Kidzz</p>
            <p className="text-xs text-muted-foreground">Acesse rápido pela tela inicial</p>
          </div>
        </div>

        {deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform"
          >
            <Download size={16} /> Instalar agora
          </button>
        ) : showIOSPrompt ? (
          <div className="text-xs text-muted-foreground space-y-2">
            <p className="flex items-center gap-1.5">
              1. Toque em <Share size={14} className="text-primary" /> <strong>Compartilhar</strong>
            </p>
            <p>2. Role e toque em <strong>"Adicionar à Tela de Início"</strong></p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default InstallPrompt;

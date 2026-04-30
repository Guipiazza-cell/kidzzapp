/**
 * Service Worker registration with strict guards + aggressive auto-update.
 *
 * - Registra SW apenas em produção, fora de iframe e fora de hosts de preview.
 * - Em preview/iframe, desregistra qualquer SW antigo (evita versões presas).
 * - Em produção: checa updates a cada 60s, no foco da aba e ao voltar online.
 *   Quando uma nova versão é encontrada, ativa imediatamente (skipWaiting)
 *   e faz reload da página para garantir que o usuário sempre veja a build mais recente.
 */

const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const host = typeof window !== "undefined" ? window.location.hostname : "";
const isPreviewHost =
  host.includes("id-preview--") ||
  host.includes("lovableproject.com") ||
  host === "localhost" ||
  host === "127.0.0.1";

const isProdBuild = import.meta.env.PROD;

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  // Cleanup agressivo em preview/iframe/dev
  if (isPreviewHost || isInIframe || !isProdBuild) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
      // Limpa caches do workbox que possam ter sobrado
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      /* noop */
    }
    return;
  }

  try {
    const { registerSW } = await import("virtual:pwa-register");

    let reloading = false;
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        // Nova versão disponível: aplica e recarrega imediatamente.
        // (Como usamos registerType: "autoUpdate" no vite.config, o SW
        // já chama skipWaiting; aqui garantimos o reload.)
        if (reloading) return;
        reloading = true;
        // Pequeno delay para o SW assumir o controle antes do reload
        setTimeout(() => window.location.reload(), 50);
      },
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return;

        // Checagem periódica (a cada 60s) por novas versões
        const checkForUpdate = () => {
          registration.update().catch(() => {});
        };
        setInterval(checkForUpdate, 60 * 1000);

        // Checa também quando a aba volta a ficar visível ou online
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") checkForUpdate();
        });
        window.addEventListener("online", checkForUpdate);
        window.addEventListener("focus", checkForUpdate);
      },
      onOfflineReady() {
        // App pronto para uso offline
      },
    });

    // Quando o SW assume o controle (após skipWaiting), recarrega para
    // garantir que o cliente esteja rodando a nova versão.
    let refreshed = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshed) return;
      refreshed = true;
      window.location.reload();
    });

    // Mantém referência (evita tree-shake) e expõe para debug eventual
    (window as any).__updateSW = updateSW;
  } catch (e) {
    console.warn("[pwa] register failed", e);
  }
}

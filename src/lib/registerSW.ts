/**
 * Service Worker registration — auto-update agressivo.
 *
 * Garantias:
 * - Em preview/iframe/dev: nunca registra; desregistra qualquer SW antigo + limpa caches.
 * - Em produção:
 *   • Checa updates a cada 20s, ao focar a aba, ao voltar online e a cada navegação SPA.
 *   • Quando uma nova versão é detectada, aplica `skipWaiting` + reload imediato.
 *   • Usuário NUNCA precisa "limpar cookies/cache" — a atualização é automática.
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

  // Cleanup agressivo em preview/iframe/dev — nunca deixar SW preso aqui.
  if (isPreviewHost || isInIframe || !isProdBuild) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
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
    const forceReload = () => {
      if (reloading) return;
      reloading = true;
      // Pequeno delay para garantir que o novo SW assumiu o controle.
      setTimeout(() => window.location.reload(), 30);
    };

    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        // Nova versão pronta — aplicar imediatamente.
        forceReload();
      },
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return;

        const checkForUpdate = () => {
          registration.update().catch(() => {});
        };

        // Checagem periódica curta (20s) — pega novas versões rapidamente.
        setInterval(checkForUpdate, 20 * 1000);

        // Triggers extras de update.
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") checkForUpdate();
        });
        window.addEventListener("online", checkForUpdate);
        window.addEventListener("focus", checkForUpdate);
        window.addEventListener("pageshow", checkForUpdate);

        // Detecta navegação SPA (pushState/replaceState/popstate) e checa update.
        const wrap = (key: "pushState" | "replaceState") => {
          const orig = history[key];
          history[key] = function (...args: any[]) {
            const r = orig.apply(this, args as any);
            checkForUpdate();
            return r;
          } as any;
        };
        wrap("pushState");
        wrap("replaceState");
        window.addEventListener("popstate", checkForUpdate);

        // Primeira checagem rápida (3s após registro) para pegar deploys recém-publicados.
        setTimeout(checkForUpdate, 3000);
      },
      onOfflineReady() { /* noop */ },
    });

    // Quando o controller muda (novo SW assumiu) — reload garantido.
    let refreshed = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshed) return;
      refreshed = true;
      window.location.reload();
    });

    (window as any).__updateSW = updateSW;
  } catch (e) {
    console.warn("[pwa] register failed", e);
  }
}

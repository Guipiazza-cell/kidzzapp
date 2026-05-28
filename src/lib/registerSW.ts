import { checkForNewAppVersion, clearAppCaches } from "@/lib/appUpdate";

/** Service Worker registration — atualização automática com limpeza de cache. */

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
    await clearAppCaches({ unregisterServiceWorkers: true });
    return;
  }

  try {
    const { registerSW } = await import("virtual:pwa-register");

    let reloading = false;
    const forceReload = async () => {
      if (reloading) return;
      reloading = true;
      await clearAppCaches({ unregisterServiceWorkers: true });
      const url = new URL(window.location.href);
      url.searchParams.set("kidzz_reload", Date.now().toString());
      window.location.replace(url.toString());
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
          void checkForNewAppVersion();
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

        // Primeiras checagens rápidas para pegar deploys recém-publicados no mobile/PWA aberto.
        setTimeout(checkForUpdate, 600);
        setTimeout(checkForUpdate, 3000);
      },
      onOfflineReady() { /* noop */ },
    });

    // Quando o controller muda (novo SW assumiu) — reload garantido.
    let refreshed = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshed) return;
      refreshed = true;
      void clearAppCaches().finally(() => {
        const url = new URL(window.location.href);
        url.searchParams.set("kidzz_reload", Date.now().toString());
        window.location.replace(url.toString());
      });
    });

    (window as any).__updateSW = updateSW;
  } catch (e) {
    console.warn("[pwa] register failed", e);
  }
}

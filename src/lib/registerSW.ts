/**
 * Service Worker registration with strict guards.
 *
 * The Lovable editor renders the app inside an iframe on a *.lovableproject.com
 * or id-preview--*.lovable.app host. A Service Worker registered there will
 * cache stale builds and break HMR. So we register ONLY in:
 *   - production builds
 *   - top-level windows (not iframes)
 *   - non-preview hosts
 *
 * On preview hosts we proactively unregister any stale SW that might exist
 * from a previous session.
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

  // Always cleanup stale SWs in preview/iframe contexts
  if (isPreviewHost || isInIframe || !isProdBuild) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    } catch {
      /* noop */
    }
    return;
  }

  // Production-only registration via vite-plugin-pwa virtual module.
  try {
    const { registerSW } = await import("virtual:pwa-register");
    registerSW({
      immediate: true,
      onRegisteredSW(_swUrl, _registration) {
        // SW active
      },
      onOfflineReady() {
        // App ready to work offline
      },
    });
  } catch (e) {
    // Module not available (e.g. plugin not built yet) — fail silently
    console.warn("[pwa] register failed", e);
  }
}

declare const __APP_VERSION__: string;

export const APP_VERSION =
  typeof __APP_VERSION__ === "string" && __APP_VERSION__.length > 0
    ? __APP_VERSION__
    : "dev";

const VERSION_URL = "/version.json";
const CURRENT_VERSION_KEY = "kidzz_current_app_version";
const UPDATE_ATTEMPT_PREFIX = "kidzz_update_attempt_";
const CHECK_INTERVAL_MS = 15_000;
const CHECK_THROTTLE_MS = 4_000;
export const APP_UPDATE_AVAILABLE_EVENT = "kidzz:update-available";

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

let installed = false;
let inFlight = false;
let lastCheck = 0;
let reloading = false;

const canCheckUpdates = () =>
  typeof window !== "undefined" && import.meta.env.PROD && !isPreviewHost && !isInIframe;

export async function clearAppCaches(options: { unregisterServiceWorkers?: boolean } = {}) {
  const tasks: Promise<unknown>[] = [];

  if ("caches" in window) {
    tasks.push(
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
    );
  }

  if (options.unregisterServiceWorkers && "serviceWorker" in navigator) {
    tasks.push(
      navigator.serviceWorker.getRegistrations().then((registrations) =>
        Promise.all(
          registrations.map(async (registration) => {
            registration.waiting?.postMessage({ type: "SKIP_WAITING" });
            registration.installing?.postMessage({ type: "SKIP_WAITING" });
            await registration.update().catch(() => undefined);
            await registration.unregister().catch(() => false);
          })
        )
      )
    );
  }

  await Promise.all(tasks).catch(() => undefined);
}

async function fetchLatestVersion() {
  const response = await fetch(`${VERSION_URL}?t=${Date.now()}`, {
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
  });

  if (!response.ok) return null;
  const payload = (await response.json()) as { version?: unknown };
  return typeof payload.version === "string" && payload.version.trim().length > 0
    ? payload.version.trim()
    : null;
}

function removeUpdateQueryParams() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("kidzz_build") && !url.searchParams.has("kidzz_reload")) return;

  url.searchParams.delete("kidzz_build");
  url.searchParams.delete("kidzz_reload");
  window.history.replaceState(window.history.state, document.title, `${url.pathname}${url.search}${url.hash}`);
}

function hardReloadToVersion(version: string) {
  if (reloading) return;
  reloading = true;

  const url = new URL(window.location.href);
  url.searchParams.set("kidzz_build", version);
  url.searchParams.set("kidzz_reload", Date.now().toString());
  window.location.replace(url.toString());
}

function notifyUpdateAvailable(version: string) {
  window.dispatchEvent(new CustomEvent(APP_UPDATE_AVAILABLE_EVENT, { detail: { version } }));
}

function getUpdateAttempts(key: string) {
  try {
    return Number(sessionStorage.getItem(key) || "0");
  } catch {
    return 0;
  }
}

function setUpdateAttempts(key: string, value: number) {
  try {
    sessionStorage.setItem(key, String(value));
  } catch {
    /* storage may be unavailable on iOS private mode */
  }
}

export async function forceAppUpdateReload(version = `manual-${Date.now()}`) {
  await clearAppCaches({ unregisterServiceWorkers: true });
  hardReloadToVersion(version);
}

export async function checkForNewAppVersion(force = false) {
  if (!canCheckUpdates() || reloading) return;

  const now = Date.now();
  if (!force && now - lastCheck < CHECK_THROTTLE_MS) return;
  if (inFlight) return;

  lastCheck = now;
  inFlight = true;

  try {
    const latestVersion = await fetchLatestVersion();
    if (!latestVersion) return;

    try {
      const storedVersion = localStorage.getItem(CURRENT_VERSION_KEY);
      if (storedVersion !== APP_VERSION) {
        localStorage.setItem(CURRENT_VERSION_KEY, APP_VERSION);
        void clearAppCaches();
      }
    } catch {
      /* storage may be unavailable */
    }

    if (latestVersion === APP_VERSION) {
      removeUpdateQueryParams();
      return;
    }

    notifyUpdateAvailable(latestVersion);
    const attemptKey = `${UPDATE_ATTEMPT_PREFIX}${latestVersion}`;
    const attempts = getUpdateAttempts(attemptKey);
    if (attempts >= 2) return;

    setUpdateAttempts(attemptKey, attempts + 1);
    await clearAppCaches({ unregisterServiceWorkers: true });
    hardReloadToVersion(latestVersion);
  } catch {
    /* Offline or transient network error: try again on the next trigger. */
  } finally {
    inFlight = false;
  }
}

export function installAppUpdateGuard() {
  if (installed || !canCheckUpdates()) return;
  installed = true;

  const triggerCheck = () => void checkForNewAppVersion();
  void checkForNewAppVersion(true);

  window.setInterval(triggerCheck, CHECK_INTERVAL_MS);
  window.addEventListener("focus", triggerCheck);
  window.addEventListener("online", triggerCheck);
  window.addEventListener("pageshow", triggerCheck);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") triggerCheck();
  });

  const wrapHistory = (key: "pushState" | "replaceState") => {
    const original = history[key];
    history[key] = function (...args: any[]) {
      const result = original.apply(this, args as any);
      triggerCheck();
      return result;
    } as any;
  };

  wrapHistory("pushState");
  wrapHistory("replaceState");
  window.addEventListener("popstate", triggerCheck);
}
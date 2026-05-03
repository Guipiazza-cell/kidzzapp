/**
 * Real-world update tests simulating iOS Safari (PWA + tab) behavior.
 *
 * Validates that when a new build is published, an open Kidzz app on iOS
 * never stays stuck on an old version — it must:
 *   1. Detect the new /version.json
 *   2. Dispatch the in-app update event (banner fallback)
 *   3. Clear CacheStorage and unregister Service Workers
 *   4. Hard-reload to the new version with cache-busting params
 *
 * Each test isolates module state with vi.resetModules() and stubs the
 * iOS-specific globals (location, caches, serviceWorker, fetch).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type ReloadCall = string;

interface IOSEnv {
  reloadCalls: ReloadCall[];
  cacheKeys: string[];
  cacheDeletes: string[];
  swUnregisters: number;
  swPostMessages: string[];
  fetchMock: ReturnType<typeof vi.fn>;
  dispatched: CustomEvent[];
}

const setupIOSEnv = (overrides?: { version?: string; appVersion?: string }): IOSEnv => {
  const env: IOSEnv = {
    reloadCalls: [],
    cacheKeys: ["kidzz-html-old", "kidzz-assets-old"],
    cacheDeletes: [],
    swUnregisters: 0,
    swPostMessages: [],
    fetchMock: vi.fn(),
    dispatched: [],
  };

  // iOS Safari user-agent + production-like host so canCheckUpdates() is true.
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 " +
      "(KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  });

  // Replace location with a stub that records replace() calls.
  delete (window as any).location;
  (window as any).location = {
    href: "https://kidzz.app/",
    hostname: "kidzz.app",
    pathname: "/",
    search: "",
    hash: "",
    replace: (url: string) => {
      env.reloadCalls.push(url);
      (window as any).location.href = url;
    },
    reload: () => env.reloadCalls.push("reload()"),
  };

  // Make sure the module sees a "production" build.
  vi.stubGlobal("__APP_VERSION__", overrides?.appVersion ?? "v-current");
  vi.stubEnv("PROD", true as any);
  vi.stubEnv("MODE", "production");

  // CacheStorage stub.
  (window as any).caches = {
    keys: vi.fn(async () => env.cacheKeys.slice()),
    delete: vi.fn(async (key: string) => {
      env.cacheDeletes.push(key);
      env.cacheKeys = env.cacheKeys.filter((k) => k !== key);
      return true;
    }),
  };

  // Service Worker stub with one fake registration.
  const fakeRegistration = {
    waiting: {
      postMessage: (msg: any) => env.swPostMessages.push(`waiting:${msg?.type}`),
    },
    installing: null,
    update: vi.fn(async () => undefined),
    unregister: vi.fn(async () => {
      env.swUnregisters += 1;
      return true;
    }),
  };
  (window.navigator as any).serviceWorker = {
    getRegistrations: vi.fn(async () => [fakeRegistration]),
    addEventListener: vi.fn(),
  };

  // Fetch /version.json
  env.fetchMock.mockImplementation(async (input: RequestInfo) => {
    const url = typeof input === "string" ? input : (input as Request).url;
    if (url.includes("/version.json")) {
      return new Response(
        JSON.stringify({ version: overrides?.version ?? "v-next" }),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    }
    return new Response("", { status: 404 });
  });
  vi.stubGlobal("fetch", env.fetchMock);

  // Capture dispatched update events.
  const origDispatch = window.dispatchEvent.bind(window);
  vi.spyOn(window, "dispatchEvent").mockImplementation((e: Event) => {
    if (e.type === "kidzz:update-available") env.dispatched.push(e as CustomEvent);
    return origDispatch(e);
  });

  return env;
};

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  try {
    sessionStorage.clear();
    localStorage.clear();
  } catch {
    /* noop */
  }
});

describe("iOS Safari — auto-update guarantees", () => {
  it("detects a new published build and hard-reloads with cache-busting", async () => {
    const env = setupIOSEnv({ version: "v-next-123", appVersion: "v-current" });
    const mod = await import("@/lib/appUpdate");

    await mod.checkForNewAppVersion(true);

    // The app told the UI a new version is available.
    expect(env.dispatched.length).toBeGreaterThanOrEqual(1);
    expect((env.dispatched[0].detail as any).version).toBe("v-next-123");

    // Cache + Service Worker were wiped before reload (no stale shell on iOS).
    expect(env.cacheDeletes).toEqual(expect.arrayContaining(["kidzz-html-old", "kidzz-assets-old"]));
    expect(env.swUnregisters).toBeGreaterThanOrEqual(1);

    // Hard reload happened with the new version pinned in the URL — iOS Safari
    // will refuse to serve a cached HTML shell for a different query string.
    expect(env.reloadCalls.length).toBe(1);
    const target = new URL(env.reloadCalls[0]);
    expect(target.searchParams.get("kidzz_build")).toBe("v-next-123");
    expect(target.searchParams.get("kidzz_reload")).toBeTruthy();
  });

  it("does not reload when the running build matches the latest version", async () => {
    const env = setupIOSEnv({ version: "v-current", appVersion: "v-current" });
    const mod = await import("@/lib/appUpdate");

    await mod.checkForNewAppVersion(true);

    expect(env.dispatched.length).toBe(0);
    expect(env.reloadCalls.length).toBe(0);
    expect(env.swUnregisters).toBe(0);
  });

  it("always emits the update event before reloading so the banner is the safety net", async () => {
    const env = setupIOSEnv({ version: "v-next", appVersion: "v-current" });
    const mod = await import("@/lib/appUpdate");

    await mod.checkForNewAppVersion(true);

    // Banner event fires BEFORE the hard-reload — if iOS Safari swallows the
    // reload (e.g. PWA in background), the banner stays visible as a fallback.
    expect(env.dispatched.length).toBeGreaterThanOrEqual(1);
    expect(env.reloadCalls.length).toBe(1);
  });

  it("forceAppUpdateReload clears caches, unregisters SW, and hard-reloads (banner CTA path)", async () => {
    const env = setupIOSEnv();
    const mod = await import("@/lib/appUpdate");

    await mod.forceAppUpdateReload("manual-test");

    expect(env.cacheDeletes.length).toBeGreaterThanOrEqual(1);
    expect(env.swUnregisters).toBeGreaterThanOrEqual(1);
    expect(env.reloadCalls.length).toBe(1);
    const target = new URL(env.reloadCalls[0]);
    expect(target.searchParams.get("kidzz_build")).toBe("manual-test");
  });

  it("survives a failing /version.json fetch without throwing or reloading", async () => {
    const env = setupIOSEnv();
    env.fetchMock.mockImplementationOnce(async () => {
      throw new TypeError("Network request failed"); // typical iOS Safari offline error
    });
    const mod = await import("@/lib/appUpdate");

    await expect(mod.checkForNewAppVersion(true)).resolves.toBeUndefined();
    expect(env.reloadCalls.length).toBe(0);
  });

  it("requests /version.json with no-store so iOS Safari never serves a cached payload", async () => {
    const env = setupIOSEnv({ version: "v-current", appVersion: "v-current" });
    const mod = await import("@/lib/appUpdate");

    await mod.checkForNewAppVersion(true);

    expect(env.fetchMock).toHaveBeenCalled();
    const [url, init] = env.fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/version\.json\?t=\d+/);
    expect(init?.cache).toBe("no-store");
    expect(init?.headers?.["Cache-Control"]).toMatch(/no-store/);
  });
});

// Landing Page analytics — paid traffic funnel
// Captures UTM/click IDs once per session and forwards events to any
// installed pixels (GTM dataLayer, GA4 gtag, Meta fbq, TikTok ttq).
// Also logs to console in production for observability and dispatches a
// CustomEvent("kidzz:lp-track") so other listeners can hook in.

type Params = Record<string, unknown>;

const STORAGE_KEY = "kidzz_lp_attribution";
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
  "ttclid",
  "msclkid",
  "ref",
] as const;

type Attribution = Partial<Record<(typeof UTM_KEYS)[number], string>> & {
  landing_page?: string;
  referrer?: string;
  first_seen_at?: string;
};

function safeStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const store = safeStorage();
  const existingRaw = store?.getItem(STORAGE_KEY);
  const existing: Attribution = existingRaw ? safeParse(existingRaw) : {};

  const url = new URL(window.location.href);
  const fresh: Attribution = { ...existing };
  let updated = !existingRaw;

  for (const key of UTM_KEYS) {
    const v = url.searchParams.get(key);
    if (v && fresh[key] !== v) {
      fresh[key] = v;
      updated = true;
    }
  }

  if (!fresh.landing_page) {
    fresh.landing_page = url.pathname + url.search;
    updated = true;
  }
  if (!fresh.referrer && document.referrer) {
    fresh.referrer = document.referrer;
    updated = true;
  }
  if (!fresh.first_seen_at) {
    fresh.first_seen_at = new Date().toISOString();
    updated = true;
  }

  if (updated && store) {
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // ignore
    }
  }
  return fresh;
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  const store = safeStorage();
  const raw = store?.getItem(STORAGE_KEY);
  return raw ? safeParse(raw) : {};
}

function safeParse(raw: string): Attribution {
  try {
    return JSON.parse(raw) as Attribution;
  } catch {
    return {};
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, params?: Params) => void };
  }
}

export function track(event: string, params: Params = {}): void {
  if (typeof window === "undefined") return;
  const attribution = getAttribution();
  const payload = {
    event,
    ...attribution,
    ...params,
    ts: Date.now(),
    path: window.location.pathname,
  };

  // GTM dataLayer
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  } catch {
    // ignore
  }

  // GA4 gtag
  try {
    window.gtag?.("event", event, payload);
  } catch {
    // ignore
  }

  // Meta Pixel — map known funnel steps to standard events
  try {
    const fbMap: Record<string, string> = {
      lp_view: "ViewContent",
      lp_cta_click: "InitiateCheckout",
      lp_quiz_start: "Lead",
      lp_quiz_complete: "CompleteRegistration",
      lp_app_redirect: "Subscribe",
    };
    const fbEvent = fbMap[event];
    if (fbEvent) window.fbq?.("track", fbEvent, payload);
    else window.fbq?.("trackCustom", event, payload);
  } catch {
    // ignore
  }

  // TikTok
  try {
    window.ttq?.track(event, payload);
  } catch {
    // ignore
  }

  // Production observability — keep visible so it shows up in any log relay
  if (import.meta.env.PROD) {
    // eslint-disable-next-line no-console
    console.info("[lp-analytics]", event, payload);
  }

  try {
    window.dispatchEvent(new CustomEvent("kidzz:lp-track", { detail: payload }));
  } catch {
    // ignore
  }
}

// Append captured UTMs to an outbound URL so attribution survives the hop
// into the main app.
export function withAttribution(url: string): string {
  try {
    const u = new URL(url, window.location.origin);
    const attr = getAttribution();
    for (const key of UTM_KEYS) {
      const v = attr[key];
      if (v && !u.searchParams.has(key)) u.searchParams.set(key, v);
    }
    return u.toString();
  } catch {
    return url;
  }
}

import { createRoot } from "react-dom/client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import App from "./App.tsx";
import "./index.css";
import { preloadAssets } from "./lib/preloadAssets";
import { registerServiceWorker } from "./lib/registerSW";
import { installAppUpdateGuard } from "./lib/appUpdate";

// Check for a freshly published build before the UI does any expensive work.
installAppUpdateGuard();

// Analytics (PostHog). Nunca quebra o app: sem chave, roda sem analytics.
const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
if (posthogKey) {
  try {
    posthog.init(posthogKey, {
      api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: true,
      autocapture: false,
      disable_session_recording: true,
      mask_all_element_attributes: true,
    });
  } catch (err) {
    console.warn("[analytics] PostHog init failed", err);
  }
}

createRoot(document.getElementById("root")!).render(
  <PostHogProvider client={posthog}>
    <App />
  </PostHogProvider>
);

// Warm-up do app principal; a landing /lp fica sem esse preload para abrir e rolar mais rápido.
if (window.location.pathname !== "/lp") preloadAssets();

// Register Service Worker (production + non-iframe only).
registerServiceWorker();

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { preloadAssets } from "./lib/preloadAssets";
import { registerServiceWorker } from "./lib/registerSW";
import { installAppUpdateGuard } from "./lib/appUpdate";

// Check for a freshly published build before the UI does any expensive work.
installAppUpdateGuard();

createRoot(document.getElementById("root")!).render(<App />);

// Warm-up do app principal; a landing /lp fica sem esse preload para abrir e rolar mais rápido.
if (window.location.pathname !== "/lp") preloadAssets();

// Register Service Worker (production + non-iframe only).
registerServiceWorker();


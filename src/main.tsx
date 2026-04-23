import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { preloadAssets } from "./lib/preloadAssets";

createRoot(document.getElementById("root")!).render(<App />);

// Warm-up the asset cache so mascots and the forest bg appear instantly
// when the user navigates between tabs (no flicker / no empty frame).
preloadAssets();

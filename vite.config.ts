import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      // CRITICAL: never run SW in dev (breaks Lovable preview/HMR)
      devOptions: { enabled: false },
      includeAssets: [
        "favicon.png",
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png",
        "robots.txt",
      ],
      manifest: false, // we ship our own /manifest.json
      workbox: {
        // Ativa nova versão imediatamente, sem esperar fechar todas as abas
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Never cache OAuth callbacks or supabase functions
        navigateFallbackDenylist: [
          /^\/~oauth/,
          /^\/api/,
          /supabase\.co\/(functions|auth|rest)/,
        ],
        globPatterns: ["**/*.{js,css,html,png,jpg,jpeg,svg,webp,woff2,ttf}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          // HTML navigations — sempre rede primeiro, evita shell preso
          {
            urlPattern: ({ request }: any) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "kidzz-html-v1",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          // Static assets — cache first
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif|woff2|ttf)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "kidzz-assets-v1",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          // Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-v1",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          // Supabase API — network first (fresh content)
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "kidzz-api-v1",
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

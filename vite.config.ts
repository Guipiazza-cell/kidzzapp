import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

const buildVersion =
  process.env.VITE_APP_VERSION ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.CF_PAGES_COMMIT_SHA ||
  `${Date.now()}`;

const appVersionPlugin = (): Plugin => ({
  name: "kidzz-app-version",
  config(config) {
    config.build = {
      ...(config.build ?? {}),
      rollupOptions: {
        ...(config.build?.rollupOptions ?? {}),
        output: {
          ...(typeof config.build?.rollupOptions?.output === "object" && !Array.isArray(config.build.rollupOptions.output)
            ? config.build.rollupOptions.output
            : {}),
          entryFileNames: `assets/[name]-${buildVersion}-[hash].js`,
          chunkFileNames: `assets/[name]-${buildVersion}-[hash].js`,
          assetFileNames: `assets/[name]-${buildVersion}-[hash][extname]`,
        },
      },
    };
  },
  transformIndexHtml: {
    order: "post",
    handler(html: string) {
      if (process.env.NODE_ENV !== "production") return html;
      return html.replace(
        /((?:src|href)="\/assets\/[^\"]+\.(?:js|css|png|jpg|jpeg|svg|webp|gif|woff2|ttf))(\")/g,
        `$1?v=${buildVersion}$2`
      );
    },
  },
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "version.json",
      source: JSON.stringify({ version: buildVersion, builtAt: new Date().toISOString() }),
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    appVersionPlugin(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      // CRITICAL: never run SW in dev (breaks Lovable preview/HMR)
      devOptions: { enabled: false },
      manifest: false, // we ship our own /manifest.json
      workbox: {
        // Ativa nova versão imediatamente, sem esperar fechar todas as abas
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: null,
        // Never cache OAuth callbacks or supabase functions
        navigateFallbackDenylist: [
          /^\/~oauth/,
          /^\/api/,
          /supabase\.co\/(functions|auth|rest)/,
        ],
        globPatterns: ["version.json"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          // Version endpoint — sempre rede, nunca cache.
          {
            urlPattern: ({ url }: any) => url.pathname === "/version.json",
            handler: "NetworkOnly",
          },
          // HTML navigations — rede primeiro e cache curtíssimo para evitar shell preso.
          {
            urlPattern: ({ request }: any) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: `kidzz-html-${buildVersion}`,
              networkTimeoutSeconds: 0.8,
              expiration: { maxEntries: 3, maxAgeSeconds: 60 },
            },
          },
          // Static assets — network-first para não manter imagens/JS/CSS antigos.
          {
            urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|webp|gif|woff2|ttf)$/,
            handler: "NetworkFirst",
            options: {
              cacheName: `kidzz-assets-${buildVersion}`,
              networkTimeoutSeconds: 2,
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 6 },
            },
          },
          // Google Fonts — rede primeiro para evitar fonte/cache preso em versões antigas.
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: `google-fonts-${buildVersion}`,
              networkTimeoutSeconds: 2,
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

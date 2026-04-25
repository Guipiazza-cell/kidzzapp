import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor configuration for KIDZZAPP.
 *
 * This file is consumed when you wrap the web build into a native iOS/Android
 * app. It is NOT used by the web/PWA build inside Lovable. To produce a real
 * native app, follow DEPLOY.md.
 */
const config: CapacitorConfig = {
  appId: "com.kidzzapp.app",
  appName: "KIDZZAPP",
  webDir: "dist",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
    // Hot-reload from the Lovable sandbox while developing on a physical
    // device. Comment out the `url` line below for a true offline build
    // bundled inside the .ipa / .apk.
    url: "https://19b9dd0d-e5a7-41d9-b197-d4ca9f5cdb0c.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: "#FFF9F0",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#FF8C00",
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true,
    },
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#FFF9F0",
  },
  android: {
    backgroundColor: "#FFF9F0",
    allowMixedContent: false,
  },
};

export default config;

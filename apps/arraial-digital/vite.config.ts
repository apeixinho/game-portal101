import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: {
        name: "Arraial Digital",
        short_name: "Arraial D.",
        description:
          "Arraial Digital — um arraial açoriano cheio de desafios de literacia digital e segurança informática.",
        lang: "pt-PT",
        theme_color: "#2a1248",
        background_color: "#160826",
        display: "standalone",
        start_url: "/",
        icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
      },
      workbox: {
        // Precache the SPA shell *and* the self-contained vanilla game HTML files
        // in public/, so each game is fully playable offline.
        globPatterns: ["**/*.{js,css,html,svg,ico,png,woff2}"],
        navigateFallbackDenylist: [/\.html$/],
        maximumFileSizeToCacheInBytes: 3_000_000,
      },
    }),
  ],
  build: {
    target: "es2022",
  },
});

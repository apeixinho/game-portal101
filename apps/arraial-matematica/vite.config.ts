import juno from "@junobuild/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    juno(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: {
        name: "Arraial da Matemática",
        short_name: "Arraial M.",
        description: "Arraial da Matemática — matemática em jogos festivos ao estilo popular açoriano.",
        lang: "pt-PT",
        theme_color: "#3e1e7a",
        background_color: "#1a0b3a",
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

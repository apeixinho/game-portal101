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
        name: "Portal do Prof. Ricardo",
        short_name: "Portal",
        description:
          "Portal de jogos educativos do Prof. Ricardo — uma galáxia interativa para explorar matemática, ciência, história e IA.",
        lang: "pt-PT",
        theme_color: "#05060d",
        background_color: "#05060d",
        display: "standalone",
        start_url: "/",
        icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,ico,png,woff2}"],
        navigateFallbackDenylist: [/\.html$/],
        maximumFileSizeToCacheInBytes: 3_000_000,
      },
    }),
  ],
  build: {
    // Target evergreen browsers — required by R3F and matches the original
    // Hub's deployment surface (ES2022 features land in all modern browsers).
    target: "es2022",
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Split Three.js + R3F into their own chunks so the initial paint
        // (intro overlay + HUD chrome) doesn't wait on the 3D engine.
        manualChunks: (id) => {
          if (id.includes("node_modules/three")) return "three";
          if (id.includes("node_modules/@react-three")) return "r3f";
          if (id.includes("node_modules/framer-motion")) return "motion";
        },
      },
    },
  },
});

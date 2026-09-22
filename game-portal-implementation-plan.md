# Implementation Plan — Educational Games Portal

> **Project:** Production-quality near-clones of *Portal do Prof. Ricardo* and its constellation of educational games, redeployed on [Juno](https://juno.build) (Internet Computer).
> **Author target:** Experienced software engineer / ICT professor working in **Cursor + Claude**.
> **Status:** Living document — Iteration 1. Expect refinement after Phase 0 spike.

---

## 1. Executive Summary

### Goals

1. Reproduce the visual identity, pedagogical intent, and gameplay of the original portal and its child games at production quality.
2. Migrate hosting from Vercel / Render to **Juno Satellites** on the Internet Computer, gaining ownership, decentralisation, and a unified data/storage/auth layer.
3. Establish a sustainable monorepo + CI/CD setup that the developer can extend for future games (Rota, AI Bot Academy, etc.).
4. Use **Cursor + Claude** as the primary authoring environment, leveraging Juno's `llms.txt` and MCP server for high-fidelity AI assistance.

### In-scope apps

| # | App | Original tech | Complexity |
|---|-----|---------------|------------|
| 1 | **Portal Hub** (portaldoprofricardo.vercel.app) | React 18 + Vite + R3F + drei | Medium (3D shell) |
| 2 | **Arraial Digital** (TIC) | Vanilla HTML/CSS/JS | Low |
| 3 | **Arraial da Matemática** | Vanilla HTML/CSS/JS | Low |
| 4 | **Caracóis da Matemática** | Three.js + Canvas hybrid | Medium |

### Out-of-scope (deferred)

* **Expedição Ciência** — realtime multiplayer 3D (Three.js + Socket.IO + Node). The Socket.IO model conflicts with Juno's event-driven Functions (see §7); deferred until a realtime backend is justified.
* **Arraial da Matemática 3D** — realtime multiplayer 3D (Three.js + Socket.IO + Node). Same realtime constraint as Expedição Ciência; deferred.
* **Rota dos Descobrimentos** — heavy 3D ocean/map rendering. Re-evaluate after Phase 4.
* **AI Bot Academy** — Monaco editor + custom block programming. Distinct architecture; defer.

### Constraints

* Single developer, part-time cadence (assume 4–8 productive hours per workday).
* Portuguese (pt-PT) UI copy and game terminology must be preserved verbatim.
* No paid third-party realtime services (Pusher, Ably, Liveblocks). Multiplayer must run on Juno or a self-hosted fallback.
* Free tier preferred while learning; willingness to pay ICP cycles for production traffic.

### Why Juno

* **Single deployable unit** (a *Satellite*) bundles hosting + datastore + storage + serverless functions. No separate Vercel/Render/Firebase wiring.
* **Static asset hosting** is a first-class case — perfect for the vanilla HTML/CSS/JS games and for built React/Vite SPA bundles.
* **Datastore + Storage** replace ad-hoc backends for quiz content, leaderboards, and user-generated content (profile pictures, saved scores as JSON).
* **GitHub Actions** integration via the official `juno-action` for CI/CD.
* **AI-friendly:** [`llms.txt`](https://juno.build/llms.txt) + [`llms-full.txt`](https://juno.build/llms-full.txt) plus the [`junobuild-mcp-server`](https://www.jsdelivr.com/package/npm/junobuild-mcp-server) make Cursor genuinely productive against Juno-specific APIs.

### Headline risk (read first)

**Juno Functions are event-triggered hooks (on document/asset writes), not long-lived WebSocket servers.** The TS/Rust runtime [does not provide full Node.js support](https://juno.build/docs/reference/functions/typescript/node.md) and execution is asynchronous and transient. This is why any realtime/multiplayer feature **cannot** be a literal Socket.IO port to Juno Functions. Phase 3 treats this as a first-class design problem and ships a **reusable realtime foundation** (a small `ws` relay + transport SDK) decoupled from any specific game, so a multiplayer experience can be added later without re-litigating the architecture. The two original realtime 3D games (*Expedição Ciência*, *Arraial da Matemática 3D*) are out of scope for this plan.

---

## 2. Architecture Overview

### 2.1 Monorepo layout

A pnpm workspaces monorepo. Each game is an independently deployable Satellite, plus the Hub Satellite acts as the entry portal that links out to them.

```
educational-games/
├── apps/
│   ├── portal-hub/                # React 18 + Vite + R3F (3D solar system)
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   └── routes/
│   │   └── vite.config.ts
│   ├── arraial-digital/           # Vite + React shell; vanilla games in public/
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   └── routes/
│   │   ├── public/
│   │   │   ├── escudo-digital.html
│   │   │   └── azulejo-binario.html
│   │   └── vite.config.ts
│   ├── arraial-matematica/        # Vite + React shell; vanilla games in public/
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   └── routes/
│   │   ├── public/
│   │   │   ├── puxa-a-corda.html
│   │   │   └── corrida-caracois.html
│   │   └── vite.config.ts
│   └── caracois-matematica/       # Vite + React + Three.js
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   └── routes/
│       └── vite.config.ts
├── packages/
│   ├── ui/                        # Shared Tailwind v4 theme tokens, base components (Button, Card, ScoreDisplay, TimerBar)
│   ├── audio-engine/              # Procedural Web Audio synthesis (shared)
│   ├── three-utils/               # Camera rigs, loaders, post-processing
│   ├── juno-client/               # Thin wrapper over @junobuild/core
│   └── game-sdk/                  # Realtime transport SDK (ws + polling fallback) + score/event helpers
├── services/
│   └── realtime-relay/            # Reusable Node + ws realtime foundation (Phase 3)
├── .github/workflows/             # juno-action deploy pipelines per app
├── juno.config.mjs                # Per-app config, or one root + per-app overrides
├── pnpm-workspace.yaml
├── CLAUDE.md                      # Repo-wide AI rules
└── .cursorrules                   # Cursor-specific rules
```

**Why one Satellite per app:** isolates costs, lets each game be deployed independently, and avoids one heavy bundle. The Hub Satellite hosts only the shell + the planet selector; each planet's "enter" link points to the child Satellite's custom subdomain (e.g. `arraial-digital.profricardo.app`).

### 2.2 Vite + React as the shell

Vite + React is used as the frontend framework for all apps in this monorepo. Each app is a standard React SPA with `src/main.tsx` as the entry point, `src/App.tsx` as the root component, and React Router v6 for client-side routing via `src/routes/`.

Key points:
* **React SPA per app** — each app ships a fully client-rendered React bundle, which maps cleanly to Juno hosting (`source: "dist"` in `juno.config.mjs`).
* **Portal Hub stays React 18 + Vite + R3F + drei** — the 3D solar system is implemented as standard React components; no special hydration directives needed.
* **Vanilla HTML/CSS/JS games** (Arraial Digital, Arraial da Matemática) are plain `.html` files placed in the `public/` directory of their respective Vite apps. Vite serves them as static files unchanged — no React wrapper is needed.
* **Tailwind CSS v4** provides the styling layer for all React components across every app (see §3 and Phase 0 setup).

### 2.3 Juno's role per phase

| Capability | Phase introduced | Used by |
|---|---|---|
| Hosting (static assets) | Phase 0/1 | All apps — React/Vite SPA bundles |
| Storage (user-generated content) | Phase 2+ | Profile pictures, saved scores as JSON |
| Datastore (JSON docs) | Phase 4 | Quiz content, leaderboards (room state only if an online mode is added) |
| Functions (TS hooks) | Phase 4 | Score validation (room lifecycle only if an online mode is added) |
| Authentication (anonymous + IC identity) | Phase 4 | Optional teacher accounts |
| Orbiter (analytics) | Phase 4 | Page views, custom events, web vitals |

---

## 3. Technology Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend shell | **Vite + React 18** | React SPA per app. React Router v6 for routing within each app. |
| UI framework | **React 18** | Match original Hub. Reuse R3F components verbatim where possible. |
| 3D | **Three.js r158+** via **@react-three/fiber** + **@react-three/drei** | r128 in originals → upgrade to current stable; pin per-app. |
| Loaders | `GLTFLoader`, `FBXLoader` from `three/examples/jsm` | Same as originals. |
| Animation | **framer-motion** (UI), **gsap** if needed for 3D timelines | |
| Audio | **Web Audio API** with shared `packages/audio-engine` | No audio files; procedural synthesis only, matching originals. **howler.js** retained only if the original Hub uses it for music beds. |
| Event bus | **mitt** | Same as original Hub. |
| Utilities | **uuid**, **clsx**, **zod** (for Datastore schema validation) | |
| Styling | **Tailwind CSS v4** + design tokens in `packages/ui` | Zero-config v4 integration via `@tailwindcss/vite` plugin. Faithful reproduction of *Lilita One + Nunito* palette and feel. Custom tokens in `@theme { }` block in CSS. Vanilla HTML games keep their existing inline `<style>` blocks — no Tailwind needed there. |
| Fonts | Google Fonts (self-hosted via [`@fontsource`](https://fontsource.org/) for offline / PWA) | |
| Realtime client | **`@portal/game-sdk`** transport (ws primary, Datastore/HTTP polling fallback) | Transport-agnostic; no Socket.IO. See §7. |
| Realtime server | Small **Node `ws` relay** (`services/realtime-relay`) for fan-out + **Juno Datastore** for authoritative persistence | Reusable foundation, not tied to a specific game — see §7.4. |
| Deploy target | **Juno Satellite** per app | `juno deploy` via CLI; `junobuild/juno-action` in CI. |
| Local dev | **Juno Emulator** (`juno emulator start`, image `junobuild/skylab`) | All-in-one local Console + Satellite. |
| CI/CD | **GitHub Actions** | Per-app workflow; matrix build for affected apps via Turborepo or Nx. |
| Package manager | **pnpm** workspaces | |
| Linting | **ESLint** + **Prettier** | |
| Tests | **Vitest** for unit, **Playwright** for game smoke tests | E2E only on Phase 4. |
| Static 3D assets (GLB/GLTF, textures) | **Cloudflare R2** (free tier: 10 GB/month free egress) or **GitHub raw CDN** (`raw.githubusercontent.com` for assets in a public repo) | Juno Storage is **not** used for static 3D assets — see note below. |

> **CDN vs Juno Storage for 3D assets:** Juno's ICP-cycle pricing model makes it disproportionately expensive for high-frequency static asset reads at scale. Conventional CDN (Cloudflare R2 free tier or GitHub raw) is the right choice for static 3D assets. Assets are committed to `apps/<app>/public/models/` (served by Vite during dev, bundled into `dist/` at build time) or uploaded to Cloudflare R2 and loaded by Three.js `GLTFLoader` via a standard HTTPS URL. **Juno Storage is better suited for user-owned data** (profile pictures, saved scores as JSON) where its permission model adds genuine value.

---

## 4. Phase 0: Environment Setup (~3–5 days)

### Objective
Stand up the monorepo, the Juno emulator, the Cursor + MCP toolchain, and a "hello world" Satellite deploy, so all subsequent phases can move fast.

### Deliverables
* Working monorepo with one placeholder React + Vite app deployable to a Juno Satellite.
* Cursor configured with Juno `@Docs` and the MCP server.
* GitHub Actions pipeline that deploys on push to `main`.
* `CLAUDE.md` and `.cursorrules` checked in.

### Tasks

1. **Install global tooling**
   ```bash
   # Node 20+ assumed
   npm i -g pnpm @junobuild/cli
   pnpm dlx create-turbo@latest educational-games
   ```
2. **Initialise a React starter** for the Hub:
   ```bash
   npm create juno@latest -- --template react-starter apps/portal-hub
   cd apps/portal-hub && pnpm i
   ```
3. **Run the local emulator** (Docker required):
   ```bash
   juno emulator start
   # opens http://localhost:5866 (Console UI)
   ```
   In the local Console: sign in (dev identity), launch a *Satellite*, copy its dev ID.
4. **Configure `juno.config.mjs`** at the app root:
   ```js
   import { defineConfig } from "@junobuild/config";

   export default defineConfig({
     satellite: {
       ids: {
         development: "<DEV_SATELLITE_ID>",
         production:  "<PROD_SATELLITE_ID>" // filled in step 8
       },
       source: "dist",
       predeploy: ["pnpm --filter portal-hub build"]
     }
   });
   ```
5. **Install Tailwind CSS v4 and the Juno Vite plugin:**
   ```bash
   pnpm add tailwindcss @tailwindcss/vite
   pnpm add -D @junobuild/vite-plugin
   pnpm add @junobuild/core
   ```
   **`vite.config.ts`** (used by every React app in the monorepo):
   ```ts
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import tailwindcss from '@tailwindcss/vite'
   import juno from '@junobuild/vite-plugin'

   export default defineConfig({
     plugins: [react(), tailwindcss(), juno()]
   })
   ```
   **`src/index.css`** (import at the top of `src/main.tsx`):
   ```css
   @import "tailwindcss";

   @theme {
     --font-display: 'Lilita One', cursive;
     --font-body: 'Nunito', sans-serif;
     --color-festa-yellow: #f5d442;
     --color-festa-orange: #ff7a2b;
     --color-festa-purple: #a56bff;
     --color-space-dark: #05060d;
   }
   ```
   No `tailwind.config.js` is needed — Tailwind v4 is zero-config by default. No PostCSS config is needed either; the `@tailwindcss/vite` plugin handles everything.
6. **Cursor configuration**
   * **Add Juno docs as `@Docs`:** Cursor → Settings → Indexing → `+ Add doc` → paste `https://juno.build/llms-full.txt`. Add `https://juno.build/llms.txt` as a second entry for index/sitemap-style queries.
   * **Install the MCP server** ([`junobuild-mcp-server`](https://www.jsdelivr.com/package/npm/junobuild-mcp-server)):
     ```bash
     # In Cursor → Settings → MCP → Add new server
     # name: junobuild
     # command: npx
     # args: ["-y", "junobuild-mcp-server"]
     ```
   * **Install Juno Agent Skills** (if/when published in the user's workspace):
     ```bash
     npx skills add junobuild/skills
     ```
7. **`CLAUDE.md`** at repo root — see template in §10.
8. **Production Satellite**: in the live Juno Console (juno.build), launch a Satellite, paste its ID into `juno.config.mjs` under `production`.
9. **GitHub Actions deploy workflow** at `.github/workflows/deploy-portal-hub.yml`:
   ```yaml
   name: Deploy portal-hub
   on:
     push:
       branches: [main]
       paths: ["apps/portal-hub/**", "packages/**"]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v4
           with: { version: 9 }
         - uses: actions/setup-node@v4
           with: { node-version: 20, cache: pnpm }
         - run: pnpm install --frozen-lockfile
         - run: pnpm --filter portal-hub build
         - uses: junobuild/juno-action@main
           with:
             args: deploy --config-path apps/portal-hub/juno.config.mjs
           env:
             JUNO_TOKEN: ${{ secrets.JUNO_TOKEN }}
   ```
   Generate the `JUNO_TOKEN` from the Satellite's *Setup → Add an access key* tab; store as a GitHub repo secret.
10. **Smoke deploy** an empty React page with the Lilita One + Nunito fonts loaded and Tailwind v4 utility classes applied.

### Acceptance criteria
* `juno emulator start` runs and the Console UI is reachable locally.
* `pnpm --filter portal-hub build && juno deploy` (locally) and a `git push` (CI) both publish the placeholder page.
* In Cursor, a prompt like *"How do I list documents in a Datastore collection?"* returns code that uses `@junobuild/core` correctly (validates `@Docs` indexing).
* MCP server tools (e.g. `list_satellites`) are callable from Cursor's agent panel.

---

## 5. Phase 1: Static Games — No Backend (~3 weeks)

### Objective
Ship five recognisably-complete experiences with no server dependency: the Hub plus two games each from the two Arraials and the solo mode of Caracóis.

### Deliverables
* Portal Hub with 3D solar system and working planet links.
* Arraial Digital with **Escudo Digital** + **Azulejo Binário**.
* Arraial da Matemática with **Puxa a Corda** + **Corrida de Caracóis**.
* Caracóis da Matemática with solo mode + difficulty selector + numpad.
* Each app deployed to its own Satellite, behind a `*.profricardo.dev` (or similar) custom domain or default Satellite URL.

### 5.1 Portal Hub

**Approach:** keep the original React + R3F implementation as a standard Vite + React SPA. The 3D solar system is the root React component rendered by `src/App.tsx`.

**Tasks**
1. Port the original Hub's `App.jsx`, planet meshes, and orbits into `apps/portal-hub/src/components/SolarSystem.tsx`.
2. Replace original asset loading with Vite-friendly imports; 3D model files (GLB) are placed in `apps/portal-hub/public/models/` and loaded at runtime by `GLTFLoader` via their public URL.
3. Wire planet `onClick` handlers to push to child app URLs (env-driven; see §5.6).
4. Music/SFX via shared `packages/audio-engine` (procedural).
5. Loading screen + accessibility: keyboard-navigable planet picker fallback for users who can't or won't use the 3D scene.
6. HUD chrome (loading bar, planet labels) uses Tailwind v4 utility classes.

**Files**
* `apps/portal-hub/src/main.tsx` (React SPA entry point)
* `apps/portal-hub/src/App.tsx` (root component, mounts the R3F canvas)
* `apps/portal-hub/src/components/SolarSystem.tsx`
* `apps/portal-hub/src/components/Planet.tsx`
* `apps/portal-hub/src/data/planets.ts` (id, label, description, target URL, color, textures)
* `apps/portal-hub/src/index.css` (Tailwind v4 import + `@theme` tokens for Lilita One + Nunito)

**Acceptance**
* 60 fps on a 2020-era laptop GPU (target).
* Bundle ≤ 600 KB gzipped excluding GLTFs.
* Lighthouse a11y ≥ 90 with the keyboard fallback.

### 5.2 Arraial Digital — Escudo Digital + Azulejo Binário

Both are quiz-style; Azulejo is a binary-conversion practice mini-game.

**Approach:** the vanilla game HTML files live as plain `.html` files in `apps/arraial-digital/public/`. Vite serves them unchanged. The React app at `src/App.tsx` provides the lobby/navigation shell (game selector, back-to-arraial nav, festive backdrop) using Tailwind v4 utility classes. Clicking a game navigates the browser to the static HTML file (e.g. `/escudo-digital.html`).

**Tasks**
1. Author the React layout component `src/components/GameLayout.tsx` (Lilita+Nunito header, back-to-arraial nav, festive backdrop) with Tailwind utility classes.
2. **Escudo Digital:** port the cybersecurity quiz JSON into the vanilla HTML file; game logic stays as inline `<script>` with its original inline `<style>` block — no Tailwind applied inside the `.html` file.
3. **Azulejo Binário:** port the tile/binary visual, decimal↔binary conversion challenges into its vanilla HTML file. Reuse the original SVG assets.
4. Persist best scores to `localStorage` (keyed `arraial-digital:<gameId>:best`) — *no Datastore yet*.
5. Confetti / "Parabéns!" end screen using framer-motion (in the React shell if shown after redirect, or inline in the HTML file if self-contained).

**Acceptance**
* Two games playable from start to finish on mobile + desktop.
* All Portuguese copy preserved verbatim from the original.
* Audio works in Safari (requires a user-gesture-triggered `AudioContext` resume — flag this).

### 5.3 Arraial da Matemática — Puxa a Corda + Corrida de Caracóis

**Approach:** mirror §5.2. Same layout primitives, different game logic. Vanilla game HTML files in `apps/arraial-matematica/public/`; React shell at `src/App.tsx` with Tailwind utilities.

**Tasks**
1. **Puxa a Corda:** two-team rope visual; players answer arithmetic to pull the rope. Single-player vs CPU only in Phase 1.
2. **Corrida de Caracóis:** lane-based race; each correct answer advances your snail. Single-player vs CPU only in Phase 1.
3. Difficulty selector (Fácil / Médio / Difícil) — three operand ranges (implemented in the React shell nav).
4. Round timer + visible streak counter.

**Acceptance**
* Each game produces deterministic question sets when seeded (eases QA).
* No frame drops during the rope/snail animations on mid-range mobile.

### 5.4 Caracóis da Matemática — Solo mode

**Approach:** Three.js + Canvas hybrid kept verbatim, packaged as a React component rendered from `src/App.tsx`. The Three.js canvas and the HUD overlay are both React components.

**Tasks**
1. Port the snail race renderer (Three.js) and the HUD (HTML overlay using Tailwind utility classes for layout and typography).
2. Numpad component with large touch targets (≥ 44 px); styled with Tailwind utilities.
3. Timer bar synced to round duration (use the shared `packages/ui` `TimerBar` component).
4. End-of-race results screen with replay.

**Acceptance**
* Solo mode plays through 5 rounds without leak (memory stable in Chrome DevTools).

### 5.5 Per-app Juno deploy steps (template)

For each of the four child apps, repeat:
1. Create a Satellite in Juno Console → name `caracois-matematica` (etc.).
2. Add `juno.config.mjs` with prod ID.
3. Add a GitHub Actions workflow file (copy of §4 step 9, adjusted paths).
4. First deploy via local CLI to validate: `pnpm --filter caracois-matematica build && juno deploy --config-path apps/caracois-matematica/juno.config.mjs`.
5. (Optional) configure custom domain in *Hosting → Custom Domain*.

### 5.6 Cross-app linking

Single source of truth at `packages/ui/src/links.ts`:
```ts
export const APPS = {
  hub:           import.meta.env.PUBLIC_URL_HUB,
  arraialDigital:    import.meta.env.PUBLIC_URL_ARRAIAL_DIGITAL,
  arraialMatematica: import.meta.env.PUBLIC_URL_ARRAIAL_MATEMATICA,
  caracois:      import.meta.env.PUBLIC_URL_CARACOIS
} as const;
```
Set `PUBLIC_URL_*` in each app's GitHub Actions environment.

### Phase 1 acceptance criteria

* Five Satellites publicly reachable.
* Hub navigates correctly to each child app.
* Lighthouse Performance ≥ 90 on at least the two Arraials.
* All Portuguese copy preserved; no English leakage in user-facing strings.

---

## 6. Phase 2: Full Static Game Sets (~2 weeks)

### Objective
Complete the remaining static games and introduce CDN hosting for large binary 3D assets.

### Deliverables
* Arraial Digital: + **Caça ao Tesouro Digital**, **Pombo Correio Digital**, **Robô dos Açores**, **Feira de Ficheiros**.
* Arraial da Matemática: + **Sardinhas na Grelha**, **Olaria Mágica**, **Concertina Matemática**, **Malha Numérica**.
* Caracóis da Matemática: 2–4 player local (same-device) turn-based mode.
* Any GLTF assets > 200 KB hosted on Cloudflare R2 or committed to the repo and served via GitHub raw CDN; loaded by Three.js `GLTFLoader` at runtime via standard HTTPS URL.

### Tasks

1. Implement the remaining 8 mini-games following the Phase 1 patterns. Vanilla HTML games continue to live in `public/` as plain `.html` files with their original inline `<style>` blocks. **Suggested order** (low-to-high effort):
   1. Pombo Correio Digital (text quiz)
   2. Feira de Ficheiros (file-type quiz)
   3. Caça ao Tesouro Digital (puzzle map)
   4. Robô dos Açores (SVG/logic — most fiddly)
   5. Sardinhas na Grelha (timed grid)
   6. Concertina Matemática (sequences)
   7. Malha Numérica (estimation/bocce — physics)
   8. Olaria Mágica (fractions/multiplication visualisation)
2. Caracóis local multiplayer:
   * Player setup screen (2–4 players, each picks a snail colour).
   * Turn marker + per-player score (React components with Tailwind utilities).
   * Pass-and-play UX with a clear "Próximo: Jogador 2" hand-off card.
3. **3D asset loading via CDN** — assets are committed to `apps/<app>/public/models/` (Vite copies them to `dist/models/` at build time, served by the Satellite) or uploaded to Cloudflare R2:
   ```ts
   import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

   const loader = new GLTFLoader();
   // Path relative to the app's public root (served by Juno hosting)
   // or an absolute Cloudflare R2 / GitHub raw URL for larger assets:
   loader.load('/models/caracol-shell.glb', (gltf) => {
     scene.add(gltf.scene);
   });
   ```
   For assets hosted on Cloudflare R2, the URL is an `https://` URL to the R2 public bucket. No Juno Storage API calls are needed for static 3D models.

   > **Why not Juno Storage for 3D models?** Juno's ICP-cycle pricing model makes it disproportionately expensive for high-frequency static asset reads at scale. Conventional CDN (Cloudflare R2 free tier or GitHub raw CDN) is the right choice for static 3D assets. Juno Storage is better suited for user-owned data (profile pictures, saved scores as JSON) where its permission model adds genuine value.

### Acceptance criteria
* All 12 Arraial mini-games and Caracóis local multiplayer playable end-to-end.
* No app's initial JS bundle exceeds 1.5 MB gzipped.
* CDN-backed 3D assets load behind a visible loading indicator and are cached by service worker (Phase 4) once available.

---

## 7. Phase 3: Realtime Foundation (optional, ~1 week)

### Objective
Establish a **reusable realtime foundation** — a transport-agnostic client SDK plus a small `ws` relay — that any future online/multiplayer mode can build on, on Juno-native infrastructure where possible, with an honest fallback when not. This phase deliberately ships **no game**: the two original realtime 3D games (*Expedição Ciência*, *Arraial da Matemática 3D*) are out of scope (§1). The point is to solve the Juno realtime constraint *once*, verifiably, so adding online play later is a small, well-understood increment rather than an open research problem.

> **Status:** the foundation in §7.3 is already built and verified locally (`packages/game-sdk` + `services/realtime-relay`). Juno-side persistence is stubbed pending the emulator-wiring step.

### 7.1 The constraint: Juno Functions ≠ Socket.IO

Per Juno's docs, [Functions are event-driven hooks](https://juno.build/docs/build/functions) that fire asynchronously on document/asset operations inside the Satellite. The TypeScript runtime is **not full Node.js** — [polyfills are added iteratively](https://juno.build/docs/reference/functions/typescript/node.md). There is **no API for opening a long-lived WebSocket connection from a Function to a browser client**. There is also no API-Gateway-style WebSocket primitive.

> **Implication:** A literal Socket.IO port to Juno Functions is *not possible today*. We must change the realtime model.

### 7.2 Three options — recommendation: **Option B** (Hybrid)

| Option | How it works | Latency | Juno-native? | Cost | Complexity |
|---|---|---|---|---|---|
| **A. Datastore polling** | Clients write moves as docs to `rooms/<code>/events`. Other clients poll `listDocs` every 200–500 ms. | 200–800 ms perceived | ✅ Fully | Cycles per write/read; predictable | Low |
| **B. Hybrid (recommended)** | A small Node + `ws` relay (`services/realtime-relay`, hosted on Fly.io or Render free tier) handles ephemeral realtime fan-out. Authoritative state and persistence still live in Juno Datastore via Functions. | 30–80 ms | ⚠️ Partial — relay is off-Juno | Free tier on Fly/Render; Juno cycles for persisted writes | Medium |
| **C. SSE from Datastore** | A Function emits an asset (e.g. `/rooms/<code>/stream.json`) on every write; clients use `EventSource` against a custom endpoint. | 300–600 ms | ✅ Fully | Cycles per write | Medium-high; SSE on IC is non-trivial today |

**Why B:** any realtime 3D experience would depend on sub-100ms feedback (player movements). Polling at 500 ms visibly degrades that feel. A small stateless relay (~150 LOC) gives the realtime experience while letting Juno own truth and persistence. The SDK implements **both** transports and fails over from ws to polling automatically, so the foundation is usable even in a fully-on-Juno deployment with no relay.

> **Be honest:** if the developer wants a *fully on-Juno* setup, Option A (polling only) is the only correct answer today. The SDK supports this out of the box (omit `relayUrl`); the relay is a latency optimisation, not a hard dependency.

### 7.3 Deliverables

* **`services/realtime-relay`** ✅ — Node 20 + `ws` relay (`/rooms/:code/ws` fan-out, `GET/POST /rooms/:code/events` polling, `/healthz`) with a Dockerfile for Fly.io/Render. Gameplay-agnostic: forwards opaque JSON envelopes.
* **`packages/game-sdk`** ✅ — transport-agnostic SDK: `RealtimeTransport` interface, `WsTransport` (reconnect + backoff + outbox), `PollingTransport` (cursor-based), and `createTransport({ relayUrl, pollBaseUrl })` with automatic ws→polling failover.
* Juno Datastore collections (deferred to Juno wiring): `rooms`, `rooms_events`, `rooms_state`.
* Juno Function (TypeScript hook) on `rooms_events` write that mutates `rooms_state` (authoritative) — stubbed (`TODO(juno-uncertain)`) in `services/realtime-relay/src/persist.ts`.

### 7.4 Tasks

1. **Realtime relay** (`services/realtime-relay`) ✅ — done:
   * `ws` server with rooms keyed by `code`; broadcasts to peers (no self-echo).
   * REST polling endpoints (`GET/POST /rooms/:code/events`) sharing the same in-memory event log so the polling fallback is exercisable without Juno.
   * Stateless beyond in-memory peer lists; safe to redeploy/restart. `/healthz` for Fly/Render + a Docker `HEALTHCHECK`.
2. **Client SDK** (`packages/game-sdk`) ✅ — done:
   ```ts
   export interface RealtimeTransport {
     join(code: string, identity: PlayerIdentity): Promise<void>;
     send(event: GameEvent): void;
     onEvent(cb: (e: GameEvent) => void): Unsub;
     status(): TransportStatus;
     leave(): void;
   }
   ```
   `WsTransport` + `PollingTransport`; `createTransport()` auto-falls-back to polling when the relay is unreachable.
3. **Datastore schema** (deferred to the Juno-wiring step):
   * `rooms`: `{ code, hostId, mode, players[], createdAt, status }`
   * `rooms_events`: append-only event log per room (move, answer, score).
   * `rooms_state`: current authoritative game state (computed by the Function from events).
4. **Function (TypeScript)** — hook on `setDoc` for `rooms_events` (deferred; stubbed in `persist.ts`):
   ```ts
   import { defineHook, type OnSetDocContext } from "@junobuild/functions";

   export const onSetDoc = defineHook<OnSetDocContext>({
     collections: ["rooms_events"],
     run: async (context) => {
       // Validate event, recompute state, write to rooms_state
     }
   });
   ```
   Reference: [TypeScript Functions SDK](https://juno.build/docs/reference/functions/typescript/sdk.md).
5. **Relay persistence** — in the relay, on each event *also* call the Satellite via `@junobuild/core` (server-side identity) to persist to `rooms_events`. Stubbed (`TODO(juno-uncertain)`) until the server-auth flow is verified against the Juno docs.
6. **Light validation hooks** — Function-side assertions reject malformed events (out-of-bounds positions, score deltas > N) so the relay stays a dumb pipe.

> **Building an online mode later:** a future online game would add a Vite + React app that imports `@portal/game-sdk`, renders a room-code lobby, and drives its scene from `RealtimeTransport` events. No relay/SDK changes required — that is the whole point of doing this phase as a foundation.

### Acceptance criteria
* ✅ Relay `/healthz` responds; `ws` peers receive each other's events (verified) with no self-echo.
* ✅ Polling path returns the correct event slice for a given cursor (verified), so a client survives a relay outage by failing over to polling.
* (Deferred to Juno wiring) Realtime traffic is also persisted to the Satellite (verifiable in the Console's Datastore browser).
* (Deferred) Cycles spend during a 30-minute test session is documented (informs §10 risks).

---

## 8. Phase 4: Polish & Production (~2 weeks)

### Objective
Make the suite teacher-deployable and student-ready: analytics, custom domain, PWA, accessibility, i18n discipline, and quiz content management.

### Deliverables
* Juno Orbiter wired into every app.
* Custom domain on at least the Hub.
* PWA manifest + offline support for the static Arraial games.
* Lighthouse scores ≥ 90 across Performance, Accessibility, Best Practices on all apps.
* Quiz content authored in Juno Datastore, edited from the Console.

### Tasks

1. **Analytics — Juno Orbiter**
   * Create the Orbiter in the Console (cost: a one-time cycles fee; see [Pricing](https://juno.build/docs/pricing.md)).
   * Add to each app:
     ```ts
     import { initOrbiter } from "@junobuild/analytics";
     initOrbiter({ options: { performance: true, userAgentParser: true } });
     ```
   * Custom events: `game_start`, `game_end`, `question_answered`, `room_created`.
2. **Custom domain**
   * Console → Hosting → Custom Domain → add `profricardo.app` (or chosen domain).
   * Update DNS as instructed (CNAME / TXT).
   * Auto-SSL provisions via the platform.
3. **PWA**
   * Add `vite-plugin-pwa` to each React + Vite app.
   * Manifest with the Festa-themed icons.
   * Service worker caches GLTFs and audio buffers (`precacheAndRoute`); network-first for HTML.
   * "Add to Home Screen" tested on iOS and Android.
4. **Performance audit**
   * Vite bundle size budget enforcement via `rollup-plugin-visualizer`.
   * Lazy-load 3D components using React's `lazy()` + `Suspense` where the 3D area is below the fold.
   * Audit Three.js scenes for redundant draw calls (`renderer.info.render.calls`).
5. **Accessibility**
   * Keyboard nav for every game (number keys for numpad, arrows for moves).
   * WCAG AA contrast across the festive palette — likely needs a dark text override on yellow tiles. Use Tailwind's built-in contrast utilities.
   * `prefers-reduced-motion` short-circuits the heavier animations (Tailwind's `motion-reduce:` variant).
   * Screen-reader announcements for question/answer feedback (`aria-live="polite"`).
6. **i18n (pt-PT only, but disciplined)**
   * All copy in `apps/<app>/src/locales/pt-PT.json`.
   * `t()` helper, even though we ship one locale — leaves the door open for pt-BR / English without rewrites.
7. **Content management via Datastore**
   * Datastore collection `quiz_questions`, schema:
     ```ts
     interface QuizQuestion {
       gameId: "escudo-digital" | "pombo-correio" | "feira-ficheiros" | "...";
       prompt: string;
       options: string[];
       correctIndex: number;
       explanation?: string;
       difficulty: 1 | 2 | 3;
     }
     ```
   * Build-time fetch in a Vite plugin or a pre-build script: call `listDocs({collection: "quiz_questions"})`, write the result to a JSON file, and import it in the React app. Editors update from the Console; a daily GitHub Actions job rebuilds and redeploys.
   * (Alternative for live content: client-side `listDocs` on game start with a 24h-cached `localStorage` fallback.)

### Acceptance criteria
* Visiting `https://profricardo.app/` lands on the Hub via custom domain with auto-SSL.
* All apps installable as PWAs and playable offline (read-only games — multiplayer obviously requires network).
* The Console shows analytics: page views, custom events, web vitals.
* A teacher can edit a quiz question in the Console and see it live within one rebuild cycle (≤ 10 min).

---

## 9. Cursor + Claude Workflow

### 9.1 Why this matters
Juno is unfamiliar territory for most LLMs trained pre-2024. Without grounding, Claude will confidently emit code mixing Firebase SDK names, ICP-CDK names, and made-up `@junobuild/*` APIs. Two pieces of grounding — Juno's `llms.txt` corpus and the MCP server — eliminate ~90% of that.

### 9.2 Required configuration

* **`@Docs` in Cursor**: `https://juno.build/llms-full.txt` and `https://juno.build/llms.txt`. Reference them by pinning `@Juno docs` in the chat.
* **MCP server**: `junobuild-mcp-server` ([npm](https://www.jsdelivr.com/package/npm/junobuild-mcp-server)). Exposes tools like `list_satellites`, `deploy_satellite`, `tail_logs`, `take_snapshot`. Use natural-language commands in Cursor's agent panel: *"Deploy portal-hub to the production satellite."*
* **Agent skills**: `npx skills add junobuild/skills` — installs prompt templates Claude can pull from when reasoning about Juno operations.

### 9.3 `.cursorrules` template (paste into repo root)

```text
You are working in a pnpm monorepo of Vite + React + Three.js educational games
deployed to the Internet Computer via Juno (juno.build).

Hard rules:
- Never invent Juno APIs. If unsure, cite a method that exists in @junobuild/core,
  @junobuild/analytics, or @junobuild/functions, otherwise ask.
- Persistent WebSockets do NOT exist inside Juno Functions. Realtime fan-out
  uses services/realtime-relay (ws). Persistence uses Datastore via Function hooks.
- All user-facing copy is pt-PT. Game names stay verbatim Portuguese
  (e.g. "Arraial Digital", "Caracóis da Matemática"). Headings/comments in code
  may be English.
- Each app is a Vite + React SPA (src/main.tsx entry, src/App.tsx root, React Router v6
  in src/routes/). There are no .astro files in this project.
- Vanilla HTML games (Arraial Digital, Arraial da Matemática) are plain .html files
  in each app's public/ directory. Do not wrap them in React components.
- Use Tailwind v4 utility classes for all React component styling. Custom tokens live
  in packages/ui/src/styles/theme.css under @theme { }. No tailwind.config.js exists.
  Do not use arbitrary values unless no token fits.
- For audio, use packages/audio-engine. Do not add audio files.
- Three.js GLTF assets are served from Cloudflare R2 or apps/<app>/public/models/.
  Do not use Juno Storage uploadFile/getAsset for static 3D models.

Style:
- TypeScript strict. No `any` unless justified with a comment.
- Prefer function components and hooks. No class components.
- Three.js code lives in dedicated /three directories per app.

When generating Juno-touching code, always:
1. Check the @Docs entry first (https://juno.build/llms-full.txt).
2. If touching deploy/ops, suggest the equivalent MCP tool call.
3. Surface costs (cycles/storage) as inline comments when relevant.
```

### 9.4 `CLAUDE.md` (repo-wide brief Claude reads on every session)

```markdown
# Project: Educational Games Portal

## Mission
Reproduce a Portuguese educational games portal at production quality on Juno.

## Architecture
- Monorepo (pnpm + Turborepo): apps/* + packages/* + services/realtime-relay
- Vite + React SPA per app (src/main.tsx, src/App.tsx, React Router v6 in src/routes/)
- Portal Hub: React 18 + Vite + R3F + drei for the 3D solar system
- Vanilla HTML games live in apps/<app>/public/ as plain .html files
- Tailwind CSS v4 for all React component styling; tokens in packages/ui/src/styles/theme.css
- One Juno Satellite per app
- 3D assets (GLB/GLTF) served from Cloudflare R2 or apps/<app>/public/models/ — not Juno Storage
- Realtime: hybrid Datastore + Node ws relay (see plan §7)

## Don't
- Don't suggest Vercel, Firebase, or Supabase as alternatives.
- Don't propose persistent-WebSocket Juno Functions — they don't exist.
- Don't translate Portuguese game names.
- Don't add .astro files — this project uses Vite + React everywhere.
- Don't use Juno Storage uploadFile/getAsset for static 3D models — use CDN URLs.

## Do
- Read the implementation plan at `game-portal-implementation-plan.md` (repo root) before architectural changes.
- When stuck on Juno specifics, propose using the junobuild MCP server tool.
- Keep diffs small; one game = one PR.
```

### 9.5 Prompting patterns that work

* **Anchor to the plan:** *"Following Phase 2 §6 of @game-portal-implementation-plan.md, scaffold the Pombo Correio Digital game…"*
* **Cite the doc:** *"Per @Juno docs (Datastore → Development), list documents from the 'quiz_questions' collection and render them in the React component."*
* **Use MCP for ops, not just answers:** *"List my satellites and tell me which one is closest to its memory limit."*
* **Always ask Claude to label uncertainty** in any Juno-Functions code: *"Mark with a `// TODO(juno-uncertain)` comment any API you're not 100% sure exists."*

---

## 10. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|------------|--------|------------|
| R1 | **Juno Functions cannot host persistent WebSockets** | Certain | Low (no multiplayer game in scope) | Solved generically by the Phase 3 realtime foundation (ws relay + polling fallback), available if an online mode is ever added. Documented and accepted. |
| R2 | **ICP cycles cost is unpredictable for game traffic** | Medium | Medium | Instrument Datastore writes; revisit pricing at end of each phase. Use [Pricing](https://juno.build/docs/pricing.md) as baseline. |
| R3 | **Three.js GLTF assets load performance** | Low | Low | Three.js GLTF assets are served from Cloudflare R2 / GitHub CDN — this risk is mitigated by not using Juno Storage for static 3D assets. Cache via service worker (Phase 4). Cloudflare's global edge network provides low-latency delivery. |
| R4 | **WebGL on older school iPads / Chromebooks** | High | Medium | Provide an HTML/SVG fallback for the Hub planet picker; keep Arraial games WebGL-free. |
| R5 | **Web Audio API auto-play restrictions** (Safari, iOS) | High | Low–Medium | First user gesture initialises and resumes the `AudioContext`. Visible "Tocar som" prompt if needed. |
| R6 | **Juno Functions TS runtime polyfill gaps** | Medium | Medium | Keep Function logic minimal (validation + writes). Heavy compute lives client-side or in the relay. |
| R7 | **Realtime relay single point of failure** (Phase 3 foundation, if ever used) | Low | Low | Polling transport auto-fallback in client SDK; the relay is an optional latency optimisation, not a hard dependency. |
| R8 | **MCP server / `llms.txt` drift from latest Juno SDK** | Medium | Low | Pin `@junobuild/*` versions; re-index `llms-full.txt` in Cursor monthly. |
| R9 | **Custom domain DNS / SSL provisioning issues** | Low | Low | Test on a throwaway subdomain first; document the Juno Console steps in `docs/ops/custom-domain.md`. |
| R10 | **Vendor lock-in to ICP / Juno** | Low (acceptable) | Low | Static bundles are portable; Datastore data is exportable as JSON via `juno.config.mjs` collection dumps. Realtime relay is plain Node. |
| R11 | **Single developer bandwidth slipping the schedule** | High | Medium | Phase boundaries are independently shippable; cut scope at any phase boundary without breaking earlier work. |
| R12 | **Original IP / copy attribution** | Low | High if missed | Confirm with Prof. Ricardo that near-clones are sanctioned; include attribution in About page. |

---

## 11. Open Questions / Future Phases

### Open questions

1. **Single-Satellite vs multi-Satellite production.** This plan assumes one Satellite per app for cost isolation. After Phase 1 we should re-test merging into one Satellite to see if memory and cycles stay healthy — would simplify ops.
2. **Authentication.** Do we want teacher accounts (IC identity / Internet Identity) for class leaderboards? Probably yes, but defer to Phase 4+.
3. **Leaderboards privacy.** If we persist scores with Juno Datastore using Internet Identity, is GDPR/COPPA acceptable for Portuguese basic-school audiences? Legal check before any PII is stored.
4. **Cycles top-up automation.** Use [Juno Monitoring](https://juno.build/docs/management/monitoring) with auto-refill; budget needs sign-off.

### Deferred / future phases

* **Online multiplayer 3D — Expedição Ciência & Arraial da Matemática 3D.** Out of scope for this plan. If revived, each becomes a Vite + React + R3F app that imports `@portal/game-sdk` and drives its scene from `RealtimeTransport` events, deployed alongside the existing `services/realtime-relay`. The Phase 3 foundation means no backend re-design is needed — only the game client + a room-code lobby. Probable 3–4 weeks each.
* **Phase 5 — Rota dos Descobrimentos.** Heavy 3D ocean + map. Plan: GLTF assets on Cloudflare R2, R3F + drei `<Ocean>` shader; consider `three-stdlib` `Water` over a heightmap. Probable 4–6 weeks.
* **Phase 6 — AI Bot Academy.** Monaco editor + Blockly-style block programming. Distinct architecture (likely a Vite + React app with a Web Worker sandbox for code execution). May benefit from Juno Functions to grade challenges server-side. Probable 6–8 weeks.
* **Phase 7 — Teacher dashboard.** Class management, assignment of game sessions, aggregated analytics. Authentication + Datastore collections `classes`, `assignments`, `attempts`. Probable 3–4 weeks.

---

## Appendix A — Reference snippets

### A.1 `juno.config.mjs` per-app skeleton

```js
import { defineConfig } from "@junobuild/config";

export default defineConfig({
  satellite: {
    ids: {
      development: process.env.JUNO_SATELLITE_DEV ?? "",
      production:  process.env.JUNO_SATELLITE_PROD ?? ""
    },
    source: "dist",
    predeploy: ["pnpm --filter <app-name> build"]
  },
  orbiter: {
    ids: { production: process.env.JUNO_ORBITER_PROD ?? "" }
  }
});
```

Note: GLTF/GLB cache-control headers belong on the CDN (Cloudflare R2 bucket settings or GitHub raw serving headers), not in `juno.config.mjs`. Juno hosting headers are appropriate for the HTML/JS/CSS app shell only.

### A.2 `vite.config.ts` shared template

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import juno from '@junobuild/vite-plugin'

export default defineConfig({
  plugins: [react(), tailwindcss(), juno()]
})
```

And the corresponding `src/index.css` (imported in `src/main.tsx`):

```css
@import "tailwindcss";

@theme {
  --font-display: 'Lilita One', cursive;
  --font-body: 'Nunito', sans-serif;
  --color-festa-yellow: #f5d442;
  --color-festa-orange: #ff7a2b;
  --color-festa-purple: #a56bff;
  --color-space-dark: #05060d;
}
```

For apps that import shared components from `packages/ui`, add a `@source` directive so Tailwind v4 scans the shared package:

```css
@import "tailwindcss";
@source "../../../packages/ui/src/**/*.{ts,tsx}";

@theme {
  --font-display: 'Lilita One', cursive;
  --font-body: 'Nunito', sans-serif;
  --color-festa-yellow: #f5d442;
  --color-festa-orange: #ff7a2b;
  --color-festa-purple: #a56bff;
  --color-space-dark: #05060d;
}
```

No `tailwind.config.js` and no PostCSS config are required. The `@tailwindcss/vite` plugin handles all Tailwind processing inside Vite's pipeline.

### A.3 Realtime SDK signature (`packages/game-sdk`) — as built

```ts
export type GameEvent =
  | { type: "join"; player: PlayerIdentity; t: number }
  | { type: "leave"; playerId: string; t: number }
  | { type: "move"; playerId: string; x: number; y: number; z: number; t: number }
  | { type: "answer"; playerId: string; questionId: string; choice: number; t: number }
  | { type: "score"; playerId: string; delta: number; total: number; t: number }
  | { type: "state"; state: unknown; t: number };

export type TransportStatus = "idle" | "connecting" | "open" | "polling" | "closed";

export interface RealtimeTransport {
  join(code: string, identity: PlayerIdentity): Promise<void>;
  send(event: GameEvent): void;
  onEvent(cb: (e: GameEvent) => void): () => void;
  status(): TransportStatus;
  leave(): void;
}

export function createTransport(opts: {
  relayUrl?: string;     // ws relay (Option B); omit for polling-only (Option A)
  pollBaseUrl?: string;  // relay REST root (or a Datastore-backed PollingBackend)
  pollIntervalMs?: number;
}): RealtimeTransport;
```

### A.4 GitHub Actions matrix for affected apps

```yaml
name: CI
on: [push, pull_request]
jobs:
  affected:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run build --filter=...[origin/main]
      - run: pnpm turbo run test --filter=...[origin/main]
```

---

## Appendix B — Estimated effort (single developer, part-time)

| Phase | Estimate | Cumulative |
|---|---|---|
| Phase 0 | 3–5 days | 1 week |
| Phase 1 | 3 weeks | ~4 weeks |
| Phase 2 | 2 weeks | ~6 weeks |
| Phase 3 (realtime foundation, optional) | ~1 week | ~7 weeks |
| Phase 4 | 2 weeks | ~9 weeks |

Total: **~2 months** to production-quality v1 of all four in-scope apps. Deferred work (Expedição Ciência, Arraial da Matemática 3D, Rota, AI Bot Academy, Teacher dashboard) is additive.

---

*End of document. This plan is intentionally living — revisit after the Phase 0 spike and at every phase boundary.*

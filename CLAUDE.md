# Project: Educational Games Portal

Brief for AI assistants (Cursor and others). Pair with `.cursorrules` and `@game-portal-implementation-plan.md`.

## Mission

Reproduce a Portuguese educational games portal at production quality, hosted on **Vercel** (frontends) with optional **Render** for a future realtime relay.

## Architecture

- Monorepo (pnpm workspaces): `apps/*`, `packages/*`, `services/realtime-relay`
- Vite + React SPA per app (`src/main.tsx`, `src/App.tsx`, React Router v6 in `src/routes/`)
- Portal Hub: React 18 + Vite + R3F + drei for the 3D solar system
- Vanilla HTML games live in `apps/<app>/public/` as plain `.html` files
- Tailwind CSS v4 for React styling; shared tokens later in `packages/ui`
- **One Vercel project per app** (Root Directory `apps/<name>`)
- 3D assets (GLB/GLTF) from Cloudflare R2 or `apps/<app>/public/models/`
- Realtime (later): `packages/game-sdk` + Node `ws` relay on Render

## Don't

- Don't reintroduce Juno Satellites / emulator as the default path on `main` (that track is `juno-build`).
- Don't propose persistent-WebSocket serverless Functions for multiplayer — use the relay on Render when needed.
- Don't translate Portuguese game names.
- Don't add `.astro` files — this project uses Vite + React everywhere.

## Do

- Read `game-portal-implementation-plan.md` before architectural changes.
- Keep diffs small; one game = one PR when possible.
- Document new deploy env vars in `.env.example` and `docs/deploy-vercel.md`.

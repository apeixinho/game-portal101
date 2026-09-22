# game-portal101

Educational games portal — pnpm monorepo of Vite + React apps, hosted on **Vercel**.
Roadmap: [`game-portal-implementation-plan.md`](./game-portal-implementation-plan.md).
Deploy guide: [`docs/deploy-vercel.md`](./docs/deploy-vercel.md).

The incomplete **Juno** Satellite approach is parked on branch `juno-build`
(see [`docs/archive-juno/`](./docs/archive-juno/README.md)).

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) 9 (`corepack prepare pnpm@9.15.4 --activate`)

## Quick start

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

Other apps:

```bash
pnpm --filter arraial-digital dev
pnpm --filter arraial-matematica dev
pnpm --filter caracois-matematica dev
```

Agent caveats: [AGENTS.md](AGENTS.md).

## Build

```bash
pnpm --filter portal-hub build
# or all apps:
pnpm build:all
```

Output: `apps/<app>/dist/`.

## Deploy (Vercel Hobby)

Create **one Vercel project per app** from this repo (`main`), with Root Directory
`apps/<app>`. Full table and env vars: [`docs/deploy-vercel.md`](./docs/deploy-vercel.md).

Cross-app links use `VITE_PUBLIC_URL_*` (see `.env.example`).

## Realtime (later — Render)

`services/realtime-relay` + `packages/game-sdk` are ready for a future online mode.
Deploy the relay on Render when needed; not required for the four static SPAs.

## Project rules

[`.cursorrules`](./.cursorrules), [`CLAUDE.md`](./CLAUDE.md).

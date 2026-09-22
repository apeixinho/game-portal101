# Deploy on Vercel (Hobby)

Four Vite SPAs, **one Vercel project per app**, same GitHub repo (`main`).
Deploys via Vercel’s Git integration (no Juno Actions).

The incomplete Juno approach lives on branch [`juno-build`](../docs/archive-juno/README.md).

## Projects

| Vercel project | Root Directory | Install | Build | Output |
|----------------|----------------|---------|-------|--------|
| `portal-hub` | `apps/portal-hub` | `cd ../.. && pnpm install` | `cd ../.. && pnpm --filter portal-hub build` | `dist` |
| `arraial-digital` | `apps/arraial-digital` | `cd ../.. && pnpm install` | `cd ../.. && pnpm --filter arraial-digital build` | `dist` |
| `arraial-matematica` | `apps/arraial-matematica` | `cd ../.. && pnpm install` | `cd ../.. && pnpm --filter arraial-matematica build` | `dist` |
| `caracois-matematica` | `apps/caracois-matematica` | `cd ../.. && pnpm install` | `cd ../.. && pnpm --filter caracois-matematica build` | `dist` |

- Framework preset: **Vite**
- Node 20+
- pnpm is detected from root `packageManager` / `pnpm-lock.yaml`

Each app ships [`vercel.json`](../apps/portal-hub/vercel.json) with SPA rewrites that only catch extension-less paths, so `public/*.html` games stay real static files.

## Cross-app URLs

After the first deploy of each project, set these env vars (Production + Preview) and redeploy once:

**portal-hub**

| Variable | Value |
|----------|--------|
| `VITE_PUBLIC_URL_ARRAIAL_DIGITAL` | `https://<arraial-digital>.vercel.app` |
| `VITE_PUBLIC_URL_ARRAIAL_MATEMATICA` | `https://<arraial-matematica>.vercel.app` |
| `VITE_PUBLIC_URL_CARACOIS` | `https://<caracois-matematica>.vercel.app` |

**Child apps** (`arraial-digital`, `arraial-matematica`, `caracois-matematica`)

| Variable | Value |
|----------|--------|
| `VITE_PUBLIC_URL_HUB` | `https://<portal-hub>.vercel.app` |

Local overrides: copy [`.env.example`](../.env.example) values into each app’s `.env` (or export in the shell).

## Dashboard steps (once)

1. [vercel.com](https://vercel.com) → **Import Project** → `apeixinho/game-portal101`.
2. Create four projects with the Root Directory / build commands above (same repo, branch `main`).
3. Deploy, copy the four `*.vercel.app` URLs, set env vars, redeploy.

## Render (later)

`services/realtime-relay` is a long-lived Node `ws` service. Deploy it on **Render** as a Web Service (Dockerfile included) only when an online mode needs it. Free Web Services sleep after idle — expect cold starts. Wire `VITE_REALTIME_URL` (or similar) on the Vercel apps that use `@portal/game-sdk`.

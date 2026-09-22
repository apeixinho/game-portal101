# game-portal101

Educational games portal — **Phase 0** complete: pnpm monorepo, `portal-hub` (Vite + React 18 + Tailwind v4 + Juno Vite plugin), CI deploy skeleton.

Full roadmap: [`game-portal-implementation-plan.md`](./game-portal-implementation-plan.md).

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) 9 (`corepack prepare pnpm@9.15.4 --activate`)
- Docker (for local Juno emulator)

## Quick start

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

Agent caveats: [AGENTS.md](AGENTS.md).

## Build

```bash
pnpm --filter portal-hub build
```

Output: `apps/portal-hub/dist/`.

## Juno Satellite IDs

1. **Production:** [Juno Console](https://juno.build) → create/open a Satellite → copy its ID.
2. **Local emulator:** `pnpm --filter portal-hub exec juno emulator start` → Console at `http://localhost:5866` → create a dev Satellite → copy ID.

Set IDs via environment (never commit secrets):

```bash
# PowerShell example
$env:JUNO_SATELLITE_DEV="<paste-dev-id>"
$env:JUNO_SATELLITE_PROD="<paste-prod-id>"
```

See `.env.example`. Optionally create `apps/portal-hub/.env` if your Juno CLI loads it from the app directory.

## Deploy (manual)

From repo root, after a successful build:

```bash
pnpm --filter portal-hub exec juno deploy --config-path apps/portal-hub/juno.config.mjs
```

Requires a Satellite **access key** available to the CLI (see Juno docs). CI uses the `JUNO_TOKEN` repository secret with [`junobuild/juno-action`](https://github.com/junobuild/juno-action).

## CI

Push to `main` triggers `.github/workflows/deploy-portal-hub.yml` when `apps/portal-hub/**` or lockfiles change.

Configure in GitHub → **Settings → Secrets and variables → Actions**:

| Name | Type | Purpose |
|------|------|---------|
| `JUNO_TOKEN` | Secret | Satellite access key (Console → Setup → access key) |
| `JUNO_SATELLITE_PROD` | Variable | Production Satellite ID (passed into `juno.config.mjs` as `process.env.JUNO_SATELLITE_PROD`) |

## Cursor + Juno

See [`docs/cursor-setup.md`](./docs/cursor-setup.md) for indexing `llms.txt` / `llms-full.txt` and the **junobuild** MCP server.

Project rules: `.cursorrules`, `CLAUDE.md`.

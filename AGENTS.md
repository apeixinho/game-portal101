# AGENTS.md

Agent notes for the educational games portal (pnpm monorepo + Juno). Human Quick start: [README.md](README.md). Roadmap: [game-portal-implementation-plan.md](game-portal-implementation-plan.md).

## Toolchain

- **Node.js 20+**
- **pnpm 9** (`corepack prepare pnpm@9.15.4 --activate`)
- Docker only if using the local Juno emulator

## Run / test / build

```bash
pnpm install
pnpm dev
pnpm --filter portal-hub build
```

App package: `apps/portal-hub`. Typical Vite URL: http://localhost:5173

## Caveats

- Satellite IDs and deploy tokens are env/secrets (`JUNO_SATELLITE_DEV`, `JUNO_SATELLITE_PROD`, `JUNO_TOKEN`). Never commit them; use `.env.example` as the contract.
- Prefer **pnpm** workspace filters (`--filter portal-hub`); do not invent a root npm script that bypasses the workspace.
- CI deploy workflow expects GitHub secret `JUNO_TOKEN`.

## Do not

- Commit `.env` files with real Satellite IDs or access keys.
- Deploy to production Satellite from a scratch/dev config without confirming IDs.

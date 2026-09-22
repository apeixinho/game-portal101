# AGENTS.md

Agent notes for the educational games portal (pnpm monorepo + Vercel). Human Quick start: [README.md](README.md). Roadmap: [game-portal-implementation-plan.md](game-portal-implementation-plan.md). Deploy: [docs/deploy-vercel.md](docs/deploy-vercel.md).

## Toolchain

- **Node.js 20+**
- **pnpm 9** (`corepack prepare pnpm@9.15.4 --activate`)

## Run / test / build

```bash
pnpm install
pnpm dev
pnpm --filter portal-hub build
pnpm build:all
```

App packages live under `apps/`. Typical Vite URL: http://localhost:5173

## Caveats

- Cross-app URLs use `VITE_PUBLIC_URL_*` (see `.env.example`). Never commit real `.env` files with secrets.
- Prefer **pnpm** workspace filters (`--filter portal-hub`); do not invent a root npm script that bypasses the workspace.
- Production deploys use **Vercel Git integration** (one project per app). The Juno CI workflows were removed from `main`.
- Incomplete Juno work is on branch **`juno-build`** only.

## Do not

- Commit `.env` files with credentials or private tokens.
- Reintroduce `@junobuild/*` on `main` without an explicit decision to revive that track.

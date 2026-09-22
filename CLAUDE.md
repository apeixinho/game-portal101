# Project: Educational Games Portal

Brief for AI assistants (Cursor and others). Pair with `.cursorrules` and `@game-portal-implementation-plan.md`.

## Mission

Reproduce a Portuguese educational games portal at production quality on Juno.

## Architecture

- Monorepo (pnpm workspaces): `apps/*` (later `packages/*`, `services/realtime-relay`)
- Vite + React SPA per app (`src/main.tsx`, `src/App.tsx`, React Router v6 in `src/routes/`)
- Portal Hub: React 18 + Vite + R3F + drei for the 3D solar system (Phase 1+)
- Vanilla HTML games live in `apps/<app>/public/` as plain `.html` files
- Tailwind CSS v4 for React styling; shared tokens later in `packages/ui/src/styles/theme.css`
- One Juno Satellite per app
- 3D assets (GLB/GLTF) served from Cloudflare R2 or `apps/<app>/public/models/` — not Juno Storage
- Realtime: hybrid Datastore + Node ws relay (see plan §7)

## Don't

- Don't suggest Vercel, Firebase, or Supabase as alternatives.
- Don't propose persistent-WebSocket Juno Functions — they don't exist.
- Don't translate Portuguese game names.
- Don't add `.astro` files — this project uses Vite + React everywhere.
- Don't use Juno Storage `uploadFile`/`getAsset` for static 3D models — use CDN URLs.

## Do

- Read `game-portal-implementation-plan.md` (repo root) before architectural changes.
- Index Juno docs in Cursor: `https://juno.build/llms-full.txt` and `https://juno.build/llms.txt` (see `docs/cursor-setup.md`).
- When stuck on Juno specifics, use the **junobuild** MCP server (`junobuild-mcp-server`).
- Keep diffs small; one game = one PR.

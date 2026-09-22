# Juno emulator (local dev)

The [Juno emulator](https://juno.build/docs/guides/local-development) (`junobuild/skylab`)
runs an all-in-one local **Console + Satellite** so the apps can be built,
deployed, and exercised against Juno features without touching mainnet.

Emulator config lives in each app's `juno.config.mjs` under the `emulator` key
(`runner: podman`, `skylab: {}`). One emulator instance serves every app.

## Prerequisites

- **Podman** (or Docker) with a running machine.
  - Windows/macOS: `podman machine init` once, then `podman machine start`.
  - Verify: `podman machine list` shows a machine **Currently running**.
- The Juno CLI ships as a dev dependency — no global install needed.

## Start / stop

From the repo root:

```bash
pnpm emulator         # start (Console UI → http://localhost:5866)
pnpm emulator:wait    # block until the local network is ready (handy in scripts)
pnpm emulator:stop    # stop the local network
pnpm emulator:clear   # reset emulator state (volume + container)
```

`pnpm emulator` streams logs and keeps running in the foreground — leave it open
in its own terminal. The first run pulls the `junobuild/skylab` image
(`pnpm --filter portal-hub exec juno emulator pull` to refresh it).

Ports exposed by skylab:

| Port | Service |
|------|---------|
| 5866 | Console UI |
| 5987 | Satellite / local replica endpoint |
| 5999 | Internet Identity (local) |

## Create a Satellite and wire the IDs

1. Open the Console at <http://localhost:5866> and sign in with the local dev identity.
2. Launch one **Satellite per app** (e.g. `portal-hub`, `arraial-digital`,
   `arraial-matematica`, `caracois-matematica`). While testing a single app you
   can reuse one Satellite.
3. Copy each Satellite's **dev ID** into the matching `*_DEV` variable in `.env`
   (see `.env.example` for the full list). The `@junobuild/vite-plugin` and
   `juno.config.mjs` pick these up automatically.

## Deploy an app to the local Satellite

`juno deploy` needs the CLI to be authenticated first (otherwise it prints
*"Looks like your CLI is not configured. Try to run: juno login"*). This is a
one-time interactive step:

```bash
pnpm --filter portal-hub exec juno login   # opens the Console to authorise the CLI
```

Then build + deploy a single app against the emulator:

```bash
pnpm --filter portal-hub build
pnpm --filter portal-hub exec juno deploy
```

Repeat with `arraial-digital`, `arraial-matematica`, or `caracois-matematica`.
`juno deploy` reads the app's `juno.config.mjs` (`source: "dist"`,
`predeploy` runs the build) and the dev Satellite ID from the environment.

## Acceptance check (plan §4)

- `pnpm emulator` runs and the Console UI is reachable at `localhost:5866`.
- A local build + `juno deploy` publishes the app to the dev Satellite, viewable
  from the Console's Hosting tab.

## Production

Launch each Satellite in the live Console (<https://juno.build>), set the
`*_PROD` IDs, and deploy via CI (`junobuild/juno-action`, `JUNO_TOKEN` secret) —
see `.github/workflows/` and plan §4 step 9.

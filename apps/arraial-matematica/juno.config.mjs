import { defineConfig } from "@junobuild/config";

export default defineConfig({
  satellite: {
    ids: {
      // App-scoped IDs so each Satellite in the monorepo stays distinct.
      // Set as repo Variables (prod) / local .env (dev) per app.
      development: process.env.JUNO_ARRAIAL_MATEMATICA_SATELLITE_DEV ?? "",
      production: process.env.JUNO_ARRAIAL_MATEMATICA_SATELLITE_PROD ?? "",
    },
    source: "dist",
    // Run from this app dir (`juno deploy`) or from the repo root with
    // `--config-path apps/arraial-matematica/juno.config.mjs`. The `--filter`
    // keeps the build correct regardless of cwd within the pnpm workspace.
    predeploy: ["pnpm --filter arraial-matematica build"],
  },
  emulator: {
    runner: {
      type: "podman",
    },
    skylab: {},
  },
});

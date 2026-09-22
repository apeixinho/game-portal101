import { defineConfig } from "@junobuild/config";

export default defineConfig({
  satellite: {
    ids: {
      development: process.env.JUNO_SATELLITE_DEV ?? "",
      production: process.env.JUNO_SATELLITE_PROD ?? "",
    },
    source: "dist",
    // Run from this app dir (`juno deploy`) or from the repo root with
    // `--config-path apps/portal-hub/juno.config.mjs`. The `--filter` keeps the
    // build correct regardless of cwd within the pnpm workspace.
    predeploy: ["pnpm --filter portal-hub build"],
  },
  emulator: {
    runner: {
      type: "podman",
    },
    skylab: {},
  },
});

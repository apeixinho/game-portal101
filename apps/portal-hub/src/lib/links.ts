/**
 * Cross-app URL resolution.
 *
 * Implementation plan §5.6 calls for a shared `packages/ui/src/links.ts` with
 * `PUBLIC_URL_*` env vars per child Satellite. While the `packages/` workspace
 * doesn't yet exist, we keep the lookup here and consult `import.meta.env`
 * first, then fall back to the original Vercel/Render URLs baked into the
 * planet catalogue. When the Juno child Satellites come online (Phase 2+),
 * set the matching env var in each app's GH Actions workflow and the Hub will
 * point at the new home automatically.
 *
 * TODO(phase-2): extract to `packages/ui/src/links.ts` so other apps share it.
 */

import type { Planet } from "../data/planets";

const ENV_VAR_BY_ID: Readonly<Record<string, string>> = {
  descobrimentos: "VITE_PUBLIC_URL_DESCOBRIMENTOS",
  "arraial-digital": "VITE_PUBLIC_URL_ARRAIAL_DIGITAL",
  "arraial-matematica": "VITE_PUBLIC_URL_ARRAIAL_MATEMATICA",
  "arraial-3d": "VITE_PUBLIC_URL_ARRAIAL_3D",
  caracois: "VITE_PUBLIC_URL_CARACOIS",
  expedicao: "VITE_PUBLIC_URL_EXPEDICAO",
  "estudio-hardware": "VITE_PUBLIC_URL_ESTUDIO_HARDWARE",
  aibot: "VITE_PUBLIC_URL_AIBOT",
};

export function resolvePlanetUrl(planet: Planet): string {
  const key = ENV_VAR_BY_ID[planet.id];
  if (!key) return planet.url;
  const env = import.meta.env as Record<string, string | undefined>;
  const override = env[key];
  return override && override.length > 0 ? override : planet.url;
}

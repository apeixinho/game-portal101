/**
 * Cross-app URL resolution.
 *
 * Consults `import.meta.env` first (`VITE_PUBLIC_URL_*`), then falls back to the
 * planet catalogue URLs. Set the matching vars in each Vercel project (or local
 * `.env`) so the Hub points at this monorepo's deployments. See docs/deploy-vercel.md.
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

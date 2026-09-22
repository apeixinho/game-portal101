/**
 * Cross-app URL resolution shared by every child app.
 *
 * Consults `import.meta.env` first, then falls back to the live Hub URL so the
 * "voltar ao portal" link works before the Hub's Juno Satellite is wired up.
 * Set `VITE_PUBLIC_URL_HUB` per app (GH Actions env / local .env) to point at
 * the Juno-hosted Hub once it is live.
 */

const HUB_FALLBACK = "https://portaldoprofricardo.vercel.app";

export function resolveHubUrl(): string {
  const env = import.meta.env as Record<string, string | undefined>;
  const override = env.VITE_PUBLIC_URL_HUB;
  return override && override.length > 0 ? override : HUB_FALLBACK;
}

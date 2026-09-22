# realtime-relay

Stateless realtime fan-out — a **reusable foundation** for any future online /
multiplayer mode. Small Node + `ws` relay for low-latency peer fan-out, with an
HTTP polling fallback.

The relay is **gameplay-agnostic** — it forwards opaque JSON event envelopes and
never needs to understand any game. Optional persistence is stubbed in
`persist.ts` (no-op until an online mode needs durable room history).

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET`  | `/healthz` | Liveness probe (Docker `HEALTHCHECK` / Render). |
| `WS`   | `/rooms/:code/ws?id=<playerId>` | Low-latency duplex channel; broadcasts to peers in the room. |
| `POST` | `/rooms/:code/events` | Polling fallback: append an event. |
| `GET`  | `/rooms/:code/events?since=<cursor>` | Polling fallback: fetch events after a cursor. |

The `@portal/game-sdk` `createTransport({ relayUrl, pollBaseUrl })` speaks both
the ws and REST sides automatically, failing over to polling if the relay drops.

## Develop

```bash
pnpm --filter @portal/realtime-relay dev    # tsx watch, :8787
pnpm --filter @portal/realtime-relay build  # tsc -> dist/
pnpm --filter @portal/realtime-relay start  # node dist/index.js
```

Configure the port with `PORT` (default `8787`; Render sets `PORT` automatically).

## Deploy (later — Render)

Not required for the four Vercel SPAs. When an online mode lands:

1. Create a Render **Web Service** from `services/realtime-relay` (Dockerfile).
2. Expect free-tier **spin-down** after idle (cold starts).
3. Set `VITE_REALTIME_URL` on the Vercel apps that use `@portal/game-sdk`.

See [docs/deploy-vercel.md](../../docs/deploy-vercel.md).
